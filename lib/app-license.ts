import { createHmac } from "node:crypto";
import type { AppEntitlement } from "./app-entitlements";

export function issueApplicationKey(appSlug: string, userId: string, entitlement: AppEntitlement) {
  const secret = process.env.APP_LICENSE_SIGNING_SECRET;
  if (!secret || !entitlement.allowed || !entitlement.subscriptionId) return undefined;
  const payload = ["OBS", appSlug, userId, entitlement.subscriptionId, entitlement.plan || "standard"].join(":");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url").slice(0, 32).toUpperCase();
  return `OBS-${appSlug.replace(/^obserra-/, "").replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}-${signature.match(/.{1,8}/g)?.join("-")}`;
}
