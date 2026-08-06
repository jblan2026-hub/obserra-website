import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../../lib/require-step-up";
import { generateGovernanceExcel } from "../../../../../../lib/governance-excel";
import { recordGovernanceExport } from "../../../../../../lib/governance-export-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function POST(request: Request) {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return stepUp.response;

  const owner = await authorizeOwner();
  if (!owner.allowed || !owner.userId || owner.userId !== stepUp.userId) {
    return json({ error: owner.reason }, owner.reason === "owner-policy-unconfigured" ? 503 : 403);
  }

  let body: { reason?: unknown; idempotencyKey?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid-json" }, 400);
  }

  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const suppliedKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
  const operationId = suppliedKey || randomUUID();
  if (reason.length < 5 || reason.length > 500 || operationId.length > 200) {
    return json({ error: "invalid-export-request" }, 400);
  }

  try {
    const workbook = generateGovernanceExcel();
    await recordGovernanceExport({
      operationId,
      actorId: owner.userId,
      organizationId: stepUp.organizationId,
      exportType: "excel-download",
      frameworkScope: ["NIST", "ISO 27001", "SOC 2", "Privacy"],
      recipientDomain: null,
      requestedAt: new Date().toISOString(),
      outcome: "completed",
      reason,
    });

    return new NextResponse(new Uint8Array(workbook), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="obserra-governance-crosswalk-${new Date().toISOString().slice(0, 10)}.xls"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Obserra-Export-Id": operationId,
      },
    });
  } catch {
    return json({ error: "governance-excel-export-unavailable" }, 503);
  }
}
