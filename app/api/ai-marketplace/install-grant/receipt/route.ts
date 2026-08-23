import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { recordMarketplaceV12InstallReceipt } from "../../../../../lib/ai-marketplace-commerce";
import { marketplaceV12InstallBridgeConfigured, verifyMarketplaceV12BridgeRequest } from "../../../../../lib/marketplace-v12-install-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: 400 | 401 | 403 | 409 | 503) {
  return NextResponse.json({ error: "Installation receipt unavailable" }, { status, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" } });
}

export async function POST(request: Request) {
  if (!marketplaceV12InstallBridgeConfigured()) return failure(503);
  const raw = await request.text();
  if (!raw || raw.length > 4096) return failure(400);
  let body: { grantId?: unknown; receiptCorrelationId?: unknown; outcome?: unknown; installedVersion?: unknown; diagnosticCode?: unknown };
  try { body = JSON.parse(raw) as typeof body; } catch { return failure(400); }
  if (typeof body.grantId !== "string" || typeof body.receiptCorrelationId !== "string" || (body.outcome !== "installed" && body.outcome !== "failed" && body.outcome !== "rolled_back") || (body.installedVersion !== undefined && typeof body.installedVersion !== "string") || (body.diagnosticCode !== undefined && typeof body.diagnosticCode !== "string")) return failure(400);
  try {
    const digest = createHash("sha256").update(raw).digest("hex");
    const bridge = await verifyMarketplaceV12BridgeRequest(request.headers, body.grantId, "receipt", digest);
    if (!bridge) return failure(401);
    await recordMarketplaceV12InstallReceipt({ grantId: body.grantId, bridgeId: bridge.bridgeId, receiptCorrelationId: body.receiptCorrelationId, outcome: body.outcome, installedVersion: body.installedVersion ?? null, diagnosticCode: body.diagnosticCode ?? null });
    return NextResponse.json({ recorded: true }, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  } catch {
    return failure(503);
  }
}
