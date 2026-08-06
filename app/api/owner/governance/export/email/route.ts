import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../../lib/require-step-up";
import { generateGovernanceExcel } from "../../../../../../lib/governance-excel";
import { generateGovernancePdf } from "../../../../../../lib/governance-pdf";
import { recordGovernanceExport } from "../../../../../../lib/governance-export-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function POST(request: Request) {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return stepUp.response;
  const owner = await authorizeOwner();
  if (!owner.allowed || !owner.userId || owner.userId !== stepUp.userId) return response({ error: owner.reason }, owner.reason === "owner-policy-unconfigured" ? 503 : 403);

  let body: { recipient?: unknown; reason?: unknown; idempotencyKey?: unknown; subject?: unknown; format?: unknown };
  try { body = (await request.json()) as typeof body; } catch { return response({ error: "invalid-json" }, 400); }

  const recipient = typeof body.recipient === "string" ? body.recipient.trim().toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject.trim().slice(0, 160) : "Obserra Governance Evidence Package";
  const format = body.format === "pdf" ? "pdf" : "excel";
  const operationId = typeof body.idempotencyKey === "string" && body.idempotencyKey.trim() ? body.idempotencyKey.trim() : randomUUID();
  if (!validEmail(recipient) || reason.length < 5 || reason.length > 500 || operationId.length > 200) return response({ error: "invalid-export-request" }, 400);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.OBSERRA_GOVERNANCE_FROM_EMAIL?.trim();
  if (!apiKey || !from || !validEmail(from)) return response({ error: "governance-email-unconfigured" }, 503);

  try {
    const attachment = format === "pdf"
      ? { filename: `obserra-governance-evidence-${new Date().toISOString().slice(0, 10)}.pdf`, content: generateGovernancePdf().toString("base64") }
      : { filename: `obserra-governance-crosswalk-${new Date().toISOString().slice(0, 10)}.xls`, content: generateGovernanceExcel().toString("base64") };
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(8_000),
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": operationId },
      body: JSON.stringify({ from, to: [recipient], subject, text: "Attached is the governed Obserra framework crosswalk and audit evidence package.", attachments: [attachment] }),
    });
    if (!send.ok) throw new Error(`Email provider returned ${send.status}`);
    await recordGovernanceExport({ operationId, actorId: owner.userId, organizationId: stepUp.organizationId, exportType: format === "pdf" ? "email-pdf" : "email-excel", frameworkScope: ["NIST", "ISO 27001", "SOC 2", "Privacy"], recipientDomain: recipient.split("@")[1] ?? null, requestedAt: new Date().toISOString(), outcome: "completed", reason });
    return response({ accepted: true, operationId, format, recipientDomain: recipient.split("@")[1] ?? null }, 202);
  } catch { return response({ error: "governance-email-unavailable" }, 503); }
}
