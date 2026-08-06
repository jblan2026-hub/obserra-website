import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { issueSaasAccessToken } from "../../../../lib/saas-access-token";
import { evaluateProductEntitlement } from "../../../../lib/saas-control-plane";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const session = await auth();
  if (!session.userId || !session.sessionId) return noStore({ error: "authentication-required" }, 401);
  if (!session.orgId) return noStore({ error: "organization-required" }, 403);

  let body: { productSlug?: unknown; ttlSeconds?: unknown };
  try {
    body = (await request.json()) as { productSlug?: unknown; ttlSeconds?: unknown };
  } catch {
    return noStore({ error: "invalid-json" }, 400);
  }

  const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
  if (!productSlug || productSlug.length > 120) return noStore({ error: "invalid-product" }, 400);
  const ttlSeconds = body.ttlSeconds === undefined ? undefined : Number(body.ttlSeconds);
  if (ttlSeconds !== undefined && (!Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 300)) {
    return noStore({ error: "invalid-ttl" }, 400);
  }

  const entitlement = await evaluateProductEntitlement({ organizationId: session.orgId, productSlug });
  if (!entitlement.allowed || !entitlement.tenantId || !entitlement.planId) {
    return noStore({ error: entitlement.reason }, 403);
  }

  try {
    const issued = issueSaasAccessToken({
      subject: session.userId,
      sessionId: session.sessionId,
      organizationId: session.orgId,
      tenantId: entitlement.tenantId,
      productSlug,
      planId: entitlement.planId,
      features: entitlement.features,
      nonce: randomUUID(),
      ttlSeconds,
    });
    return noStore({
      token: issued.token,
      tokenType: "Obserra-SaaS-Entitlement",
      expiresAt: issued.expiresAt,
      ttlSeconds: issued.ttlSeconds,
      productSlug,
      sessionBound: true,
    });
  } catch {
    return noStore({ error: "access-token-service-unavailable" }, 503);
  }
}
