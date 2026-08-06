import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { verifySaasAccessToken } from "../../../../../lib/saas-access-token";
import { revokeToken } from "../../../../../lib/saas-token-revocation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RevocationRequest = { token?: unknown; reason?: unknown };

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
  const actorUserId = owner.userId;
  if (!actorUserId) {
    return noStore({ error: "owner-principal-unavailable" }, 403);
  }

  let body: RevocationRequest;
  try {
    body = (await request.json()) as RevocationRequest;
  } catch {
    return noStore({ error: "invalid-json" }, 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || "";
  if (!token || token.length > 8_192 || reason.length < 8 || reason.length > 500) {
    return noStore({ error: "invalid-request" }, 400);
  }
  if (idempotencyKey.length < 12 || idempotencyKey.length > 200) {
    return noStore({ error: "idempotency-key-required" }, 400);
  }

  let verified;
  try {
    verified = verifySaasAccessToken(token);
  } catch {
    return noStore({ error: "token-service-unavailable" }, 503);
  }
  if (!verified.valid) return noStore({ error: verified.reason }, 400);

  await revokeToken(
    {
      nonce: verified.claims.nonce,
      organizationId: verified.claims.organizationId,
      productSlug: verified.claims.productSlug,
      expiresAt: verified.claims.expiresAt,
      revokedAt: new Date().toISOString(),
      revokedBy: actorUserId,
      reason,
    },
    idempotencyKey,
  );

  console.info("SaaS access token revoked", {
    operationId: idempotencyKey,
    actorUserId,
    organizationId: verified.claims.organizationId,
    tenantId: verified.claims.tenantId,
    productSlug: verified.claims.productSlug,
    expiresAt: verified.claims.expiresAt,
    reasonLength: reason.length,
  });

  return noStore({
    revoked: true,
    operationId: idempotencyKey,
    organizationId: verified.claims.organizationId,
    productSlug: verified.claims.productSlug,
    expiresAt: verified.claims.expiresAt,
  });
}
