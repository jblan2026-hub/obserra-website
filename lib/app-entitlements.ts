import { currentUser } from "@clerk/nextjs/server";
import { getStripe } from "./stripe";

const ACCESSIBLE_SUBSCRIPTION_STATES = new Set(["active", "trialing"]);

export type AppEntitlement = {
  allowed: boolean;
  status: string;
  subscriptionId?: string;
  customerId?: string;
  deploymentModel?: string;
  plan?: string;
};

export async function resolveAppEntitlement(clerkUserId: string, appSlug: string): Promise<AppEntitlement> {
  if (!process.env.STRIPE_SECRET_KEY) return { allowed: false, status: "billing-not-configured" };

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.search({
    query: `metadata['clerkUserId']:'${clerkUserId}' AND metadata['obserraApp']:'${appSlug}'`,
    limit: 20,
    expand: ["data.customer"],
  });

  const eligible = subscriptions.data
    .filter((subscription) => ACCESSIBLE_SUBSCRIPTION_STATES.has(subscription.status))
    .sort((a, b) => b.created - a.created)[0];

  if (!eligible) {
    const latest = subscriptions.data.sort((a, b) => b.created - a.created)[0];
    return { allowed: false, status: latest?.status ?? "not-subscribed", subscriptionId: latest?.id };
  }

  return {
    allowed: true,
    status: eligible.status,
    subscriptionId: eligible.id,
    customerId: typeof eligible.customer === "string" ? eligible.customer : eligible.customer.id,
    deploymentModel: eligible.metadata.deploymentModel,
    plan: eligible.metadata.plan,
  };
}

export async function primaryAccountEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress;
}
