import "server-only";

import { auth } from "@clerk/nextjs/server";

export type OwnerAuthorization = {
  allowed: boolean;
  configured: boolean;
  userId: string | null;
  organizationId: string | null;
  reason: "authorized" | "authentication-required" | "owner-policy-unconfigured" | "owner-access-denied";
};

function configuredOwnerIds() {
  return new Set(
    (process.env.OBSERRA_OWNER_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function authorizeOwner(): Promise<OwnerAuthorization> {
  const identity = await auth();
  if (!identity.userId) {
    return {
      allowed: false,
      configured: configuredOwnerIds().size > 0,
      userId: null,
      organizationId: identity.orgId ?? null,
      reason: "authentication-required",
    };
  }

  const owners = configuredOwnerIds();
  if (owners.size === 0) {
    return {
      allowed: false,
      configured: false,
      userId: identity.userId,
      organizationId: identity.orgId ?? null,
      reason: "owner-policy-unconfigured",
    };
  }

  const allowed = owners.has(identity.userId);
  return {
    allowed,
    configured: true,
    userId: identity.userId,
    organizationId: identity.orgId ?? null,
    reason: allowed ? "authorized" : "owner-access-denied",
  };
}
