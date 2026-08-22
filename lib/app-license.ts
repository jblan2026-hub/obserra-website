import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppEntitlement } from "./app-entitlements";

type ApplicationLicenseClaims = {
  v: 1;
  app: string;
  sub: string;
  subscription: string;
  plan: string;
  revision: number;
  iat: number;
  exp: number;
};

function signingSecret() {
  const secret = process.env.APP_LICENSE_SIGNING_SECRET?.trim() ?? "";
  return secret.length >= 32 ? secret : null;
}

function signature(secret: string, payload: string) {
  return createHmac("sha256", secret).update(`OBS1.${payload}`).digest("base64url");
}

export function issueApplicationKey(appSlug: string, userId: string, entitlement: AppEntitlement) {
  const secret = signingSecret();
  if (!secret || !entitlement.allowed || !entitlement.subscriptionId || !entitlement.revision) return undefined;
  const issuedAt = Math.floor(Date.now() / 1000);
  const subscriptionEnd = entitlement.currentPeriodEnd ? Math.floor(Date.parse(entitlement.currentPeriodEnd) / 1000) : Number.NaN;
  const expiresAt = Math.min(issuedAt + 24 * 60 * 60, Number.isSafeInteger(subscriptionEnd) ? subscriptionEnd : issuedAt + 15 * 60);
  if (expiresAt <= issuedAt) return undefined;
  const claims: ApplicationLicenseClaims = {
    v: 1,
    app: appSlug,
    sub: userId,
    subscription: entitlement.subscriptionId,
    plan: entitlement.plan || "professional",
    revision: entitlement.revision,
    iat: issuedAt,
    exp: expiresAt,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `OBS1.${payload}.${signature(secret, payload)}`;
}

export function verifyApplicationKey(token: string, expectedApp?: string): ApplicationLicenseClaims | null {
  const secret = signingSecret();
  const [prefix, payload, suppliedSignature, ...remainder] = token.split(".");
  if (!secret || prefix !== "OBS1" || !payload || !suppliedSignature || remainder.length) return null;
  const expectedSignature = signature(secret, payload);
  const actualBytes = Buffer.from(suppliedSignature);
  const expectedBytes = Buffer.from(expectedSignature);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ApplicationLicenseClaims;
    const now = Math.floor(Date.now() / 1000);
    if (
      claims.v !== 1 ||
      !/^obserra-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(claims.app) ||
      !/^user_[A-Za-z0-9_-]{8,}$/.test(claims.sub) ||
      !claims.subscription.startsWith("sub_") ||
      !Number.isSafeInteger(claims.revision) ||
      claims.revision < 1 ||
      !Number.isSafeInteger(claims.iat) ||
      !Number.isSafeInteger(claims.exp) ||
      claims.iat > now + 60 ||
      claims.exp <= now ||
      claims.exp - claims.iat > 24 * 60 * 60 ||
      (expectedApp && claims.app !== expectedApp)
    ) return null;
    return claims;
  } catch {
    return null;
  }
}
