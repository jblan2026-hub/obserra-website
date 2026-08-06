import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../lib/require-step-up";
import { normalizeFinding, recommendForFinding, vulnerabilityIntelligenceHealth, type VerifiedFinding } from "../../../../../lib/vulnerability-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function authorize() {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return { response: stepUp.response } as const;
  const owner = await authorizeOwner();
  if (!owner.allowed || !owner.userId || owner.userId !== stepUp.userId) {
    return { response: response({ error: owner.reason }, owner.reason === "owner-policy-unconfigured" ? 503 : 403) } as const;
  }
  return { owner, stepUp } as const;
}

async function fetchVerifiedFindings() {
  const baseUrl = process.env.OBSERRA_SECURITY_SCANNER_URL?.trim().replace(/\/$/, "");
  const token = process.env.OBSERRA_SECURITY_SCANNER_TOKEN?.trim();
  if (!baseUrl || !token) throw new Error("scanner-unconfigured");

  const scannerResponse = await fetch(`${baseUrl}/v1/findings?status=open,accepted,mitigated`, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!scannerResponse.ok) throw new Error(`scanner-${scannerResponse.status}`);
  const payload = (await scannerResponse.json()) as { findings?: Array<Partial<VerifiedFinding>> };
  const findings = Array.isArray(payload.findings) ? payload.findings.slice(0, 500).map(normalizeFinding).filter((item): item is VerifiedFinding => Boolean(item)) : [];
  return findings;
}

export async function GET() {
  const authorization = await authorize();
  if ("response" in authorization) return authorization.response;
  const health = vulnerabilityIntelligenceHealth();
  if (!health.scannerConfigured) return response({ health, findings: [], recommendations: [], state: "scanner-unconfigured" }, 200);

  try {
    const findings = await fetchVerifiedFindings();
    const recommendations = await Promise.all(findings.slice(0, 100).map(recommendForFinding));
    recommendations.sort((left, right) => right.riskScore - left.riskScore);
    return response({
      health,
      generatedAt: new Date().toISOString(),
      findings,
      recommendations,
      summary: {
        total: findings.length,
        critical: findings.filter((finding) => finding.severity === "critical" && finding.status === "open").length,
        high: findings.filter((finding) => finding.severity === "high" && finding.status === "open").length,
        releaseBlocking: recommendations.filter((item) => item.releaseBlocking).length,
        mappedControls: new Set(recommendations.flatMap((item) => item.mappedControls.map((control) => `${control.framework}:${control.controlId}`))).size,
      },
    });
  } catch {
    return response({ health, error: "vulnerability-intelligence-unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  const authorization = await authorize();
  if ("response" in authorization) return authorization.response;

  let body: { action?: unknown; reason?: unknown; idempotencyKey?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return response({ error: "invalid-json" }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const idempotencyKey = typeof body.idempotencyKey === "string" && body.idempotencyKey.trim() ? body.idempotencyKey.trim() : randomUUID();
  if (action !== "scan" || reason.length < 5 || reason.length > 500 || idempotencyKey.length > 200) {
    return response({ error: "invalid-scan-request" }, 400);
  }

  const baseUrl = process.env.OBSERRA_SECURITY_SCANNER_URL?.trim().replace(/\/$/, "");
  const token = process.env.OBSERRA_SECURITY_SCANNER_TOKEN?.trim();
  if (!baseUrl || !token) return response({ error: "scanner-unconfigured" }, 503);

  try {
    const scanResponse = await fetch(`${baseUrl}/v1/scans`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({
        requestedBy: authorization.owner.userId,
        organizationId: authorization.stepUp.organizationId,
        reason,
        scope: ["source", "dependencies", "secrets", "web", "infrastructure", "containers", "cloud", "runtime"],
        productionMutationAllowed: false,
      }),
    });
    if (!scanResponse.ok) throw new Error(`scanner-${scanResponse.status}`);
    const payload = (await scanResponse.json()) as { scanId?: string; accepted?: boolean };
    return response({ accepted: Boolean(payload.accepted ?? true), scanId: payload.scanId ?? null, operationId: idempotencyKey }, 202);
  } catch {
    return response({ error: "scanner-request-unavailable" }, 503);
  }
}
