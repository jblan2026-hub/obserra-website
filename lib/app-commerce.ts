import appCommerceCatalog from "../app/apps/commerce-catalog.json";

export type AppLicensePlan = {
  id: string;
  name: string;
  licenseType: string;
  seatModel: string;
  minimumSeats: number;
  maximumSeats: number | null;
  trialDays: number;
  billingIntervals: string[];
  entitlementCodes: string[];
  stripePriceIds: Record<string, string>;
  paymentLinks: Record<string, string>;
};

export type AppCommerceRecord = {
  slug: string;
  name: string;
  version: string;
  status: string;
  paymentLink: string | null;
  stripePriceId: string | null;
  launchUrl: string | null;
  purchaseMode: "payment-link" | "stripe-checkout" | "contact-sales";
  subscriptionRequired: boolean;
  licensing: {
    provider: string;
    assignmentMode: string;
    renewalMode: string;
    gracePeriodDays: number;
    revokeOnCancellation: boolean;
    plans: AppLicensePlan[];
  };
  missions: string[];
  featured: boolean;
  collectionIds: string[];
  updatedAt: string;
};

type AppCommerceCatalog = {
  schemaVersion: string;
  generatedAt: string | null;
  products: AppCommerceRecord[];
};

const catalog = appCommerceCatalog as AppCommerceCatalog;

export function appCommerceForSlug(slug: string) {
  return catalog.products.find((product) => product.slug === slug);
}

export function allAppCommerceRecords() {
  return catalog.products;
}
