import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createPatchProposal, type PatchMode, type PatchTarget } from "../../../../../lib/ai-patch-governance";
import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../lib/require-step-up";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const targets = new Set<PatchTarget>([
  "website-live",
  "website-secondary",
  "integrated-services",
  "academy",
  "eios",
  "saas-application",
]);
const modes = new Set<PatchMode>(["observe", "recommend", "approval_required", "autonomous_low_risk"]);

function response(body: unknown, status = 200) {
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
    return response({ error: owner.reason }, owner.reason === "owner-policy-unconfigured" ? 503 : 403);
  }

  let body: { target?: unknown; requestedChange?: unknown; mode?: unknown; idempotencyKey?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return response({ error: "invalid-json" }, 400);
  }

  const target = typeof body.target === "string" ? body.target : "";
  const mode = typeof body.mode === "string" ? body.mode : "";
  const requestedChange = typeof body.requestedChange === "string" ? body.requestedChange.trim() : "";
  const proposalId = typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()
    ? body.idempotencyKey.trim()
    : randomUUID();

  if (!targets.has(target as PatchTarget) || !modes.has(mode as PatchMode)) {
    return response({ error: "invalid-patch-policy" }, 400);
  }

  try {
    const proposal = createPatchProposal({
      proposalId,
      target: target as PatchTarget,
      requestedChange,
      mode: mode as PatchMode,
    });

    console.info("AI patch proposal created", {
      proposalId: proposal.proposalId,
      actorId: owner.userId,
      organizationId: stepUp.organizationId,
      target: proposal.target,
      risk: proposal.risk,
      mode: proposal.mode,
      requiresApproval: proposal.requiresApproval,
    });

    return response({ accepted: true, proposal }, 202);
  } catch {
    return response({ error: "invalid-patch-request" }, 400);
  }
}
