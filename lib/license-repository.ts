import type Stripe from "stripe";
import { getStripe } from "./stripe";
import type { LicenseRecord, LicenseType } from "./licensing";

export type LicenseQuery = {
  tenantId?: string;
  subjectId: string;
  email?: string;
  productSlug?: string;
};

export type LicenseRepositoryResult = {
  records: LicenseRecord[];
  source: "stripe" | "contract" | "manual" | "unavailable";
  authoritative: boolean;
  message?: string;
};

export interface LicenseRepository {
  listForSubject(query: LicenseQuery): Promise<LicenseRepositoryResult>;
}

const ACTIVE_STATES = new Set(["active", "trialing"]);

function normalizeLicenseType(value?: string): LicenseType {
  switch (value) {
    case "individual":
    case "professional":
    case "team":
    case "enterprise":
    case "government":
    case "education":
    case "trial":
    case "evaluation":
    case "internal":
      return value;
    default:
      return "professional";
  }
}

export function subscriptionRenewalAt(subscription: Stripe.Subscription): string | undefined {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (!periodEnds.length) return undefined;
  return new Date(Math.max(...periodEnds) * 1000).toISOString();
}

export class StripeLicenseRepository implements LicenseRepository {
  async listForSubject(query: LicenseQuery): Promise<LicenseRepositoryResult> {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        records: [],
        source: "unavailable",
        authoritative: false,
        message: "Stripe licensing reconciliation is not configured.",
      };
    }

    const stripe = getStripe();
    const clauses = [`metadata['clerkUserId']:'${query.subjectId}'`];
    if (query.productSlug) clauses.push(`metadata['obserraApp']:'${query.productSlug}'`);

    const subscriptions = await stripe.subscriptions.search({
      query: clauses.join(" AND "),
      limit: 100,
    });

    const records = subscriptions.data.map<LicenseRecord>((subscription) => {
      const primaryItem = subscription.items.data[0];
      const seatsPurchased = Math.max(1, Number(subscription.metadata.seatsPurchased || primaryItem?.quantity || 1));
      const seatsAssigned = Math.max(0, Number(subscription.metadata.seatsAssigned || 1));
      const productSlug = subscription.metadata.obserraApp || "unmapped-product";
      const tenantId = subscription.metadata.tenantId || subscription.metadata.organizationId || query.tenantId || `subject:${query.subjectId}`;
      const expiresAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : undefined;
      const renewalAt = subscriptionRenewalAt(subscription);

      return {
        id: subscription.id,
        tenantId,
        productSlug,
        licenseType: normalizeLicenseType(subscription.metadata.plan),
        status: ACTIVE_STATES.has(subscription.status)
          ? "active"
          : subscription.status === "canceled"
            ? "revoked"
            : subscription.status === "past_due" || subscription.status === "unpaid"
              ? "suspended"
              : "pending",
        seatsPurchased,
        seatsAssigned: Math.min(seatsAssigned, seatsPurchased),
        startsAt: new Date(subscription.start_date * 1000).toISOString(),
        expiresAt,
        renewalAt,
        supportLevel: subscription.metadata.supportLevel,
        deploymentModel: subscription.metadata.deploymentModel || "SaaS",
        maintenanceActive: ACTIVE_STATES.has(subscription.status),
        source: "stripe",
        externalReference: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      };
    });

    return {
      records,
      source: "stripe",
      authoritative: true,
      message: records.length ? undefined : "No verified licenses were found for this account.",
    };
  }
}

export const licenseRepository: LicenseRepository = new StripeLicenseRepository();
