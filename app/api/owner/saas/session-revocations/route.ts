import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../lib/require-step-up";
import { revokeSession } from "../../../../../lib/saas-session-revocation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionRevocationRequest = {
  sessionId?: unknown;
  userId?: unknown;
  organizationId?: unknown;
  expiresAt?: unknown;
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

function boundedString(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximumLength ? normalized : "";
}

export async function POST(request: Request) {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return stepUp.response;

  const owner = await authorizeOwner();
  if (!owner.allowed) {
    return noStore({ error: owner.reason }, owner.reason === "authentication-required" ? 401 : 403);
  }
  if (!owner.userId || owner.userId !== stepUp.userId) {
    return noStore({ error: "owner-principal-mismatch" }, 403);
  }

  let body: SessionRevocationRequest;
  try {
    body = (await request.json()) as SessionRevocationRequest;
  } catch {
    return noStore({ error: "invalid-json" }, 400);
  }

  const sessionId = boundedString(body.sessionId, 200);
  const userId = boundedString(body.userId, 200);
  const organizationId = boundedString(body.organizationId, 200);
  const reason = boundedString(body.reason, 500);
  const expiresAt = Number(body.expiresAt);
  const now = Math.floor(Date.now() / 1000);
  const maximum = now + 30 * 24 * 60 * 60;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || "";

  if (!sessionId || !userId || !organizationId || reason.length < 8) {
    return noStore({ error: "invalid-request" }, 400);
  }
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > maximum) {
    return noStore({ error: "invalid-expiration" }, 400);
  }
  if (idempotencyKey.length < 12 || idempotencyKey.length > 200) {
    return noStore({ error: "idempotency-key-required" }, 400);
  }

  try {
    await revokeSession(
      {
        sessionId,
        userId,
        organizationId,
        expiresAt,
        revokedAt: new Date().toISOString(),
        revokedBy: stepUp.userId,
        reason,
      },
      idempotencyKey,
    );
  } catch {
    return noStore({ error: "session-revocation-service-unavailable" }, 503);
  }

  console.info("SaaS session revoked", {
    operationId: idempotencyKey,
    actorUserId: stepUp.userId,
    affectedUserId: userId,
    organizationId,
    expiresAt,
    reasonLength: reason.length,
  });

  return noStore({
    revoked: true,
    operationId: idempotencyKey,
    affectedUserId: userId,
    organizationId,
    expiresAt,
  });
}
