import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { setOrganizationTokenCutoff } from "../../../../../lib/saas-organization-token-cutoff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CutoffRequest = {
  organizationId?: unknown;
  invalidateBefore?: unknown;
  reason?: unknown;
};

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function POST(request: Request) {
  const owner = await authorizeOwner();
  if (!owner.allowed) {
    return noStore({ error: owner.reason }, owner.reason === "authentication-required" ? 401 : 403);
  }
  const ownerUserId = owner.userId;
  if (!ownerUserId) return noStore({ error: "owner-principal-unavailable" }, 403);

  let body: CutoffRequest;
  try {
    body = (await request.json()) as CutoffRequest;
  } catch {
    return noStore({ error: "invalid-json" }, 400);
  }

  const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const invalidateBefore = Number.isSafeInteger(body.invalidateBefore)
    ? Number(body.invalidateBefore)
    : Math.floor(Date.now() / 1000);
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || "";

  if (!organizationId || organizationId.length > 200 || reason.length < 8 || reason.length > 500) {
    return noStore({ error: "invalid-request" }, 400);
  }
  if (idempotencyKey.length < 12 || idempotencyKey.length > 200) {
    return noStore({ error: "idempotency-key-required" }, 400);
  }

  try {
    await setOrganizationTokenCutoff(
      {
        organizationId,
        invalidateBefore,
        changedAt: new Date().toISOString(),
        changedBy: ownerUserId,
        reason,
      },
      idempotencyKey,
    );
  } catch {
    return noStore({ error: "token-cutoff-service-unavailable" }, 503);
  }

  console.info("Organization SaaS token cutoff updated", {
    operationId: idempotencyKey,
    actorUserId: ownerUserId,
    organizationId,
    invalidateBefore,
    reasonLength: reason.length,
  });

  return noStore({
    updated: true,
    operationId: idempotencyKey,
    organizationId,
    invalidateBefore,
  });
}
