import { currentUser } from "@clerk/nextjs/server";
import { applicationsTenantId, durableApplicationEntitlement } from "./applications-commerce";

export type AppEntitlement = {
  allowed: boolean;
  status: string;
  subscriptionId?: string;
  customerId?: string;
  deploymentModel?: string;
  plan?: string;
  billingInterval?: string;
  seatsPurchased?: number;
  currentPeriodEnd?: string | null;
  revision?: number;
  authoritative: boolean;
  source: "applications-commerce-ledger" | "unavailable";
};

export async function resolveAppEntitlement(clerkUserId: string, appSlug: string, organizationId?: string | null): Promise<AppEntitlement> {
  try {
    const entitlement = await durableApplicationEntitlement(
      clerkUserId,
      applicationsTenantId(clerkUserId, organizationId),
      appSlug,
    );
    return { ...entitlement, authoritative: true, source: "applications-commerce-ledger" };
  } catch (error) {
    console.error("Applications durable entitlement unavailable", {
      appSlug,
      error: error instanceof Error ? error.name : "unknown",
    });
    return { allowed: false, status: "licensing-unavailable", authoritative: false, source: "unavailable" };
  }
}

export async function primaryAccountEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress;
}
