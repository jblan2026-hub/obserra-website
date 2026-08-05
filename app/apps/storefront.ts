import { marketplaceApps, type MarketplaceApp } from "./appsData";
import rawStoreCatalog from "./store-catalog.json";

type GeneratedStoreRecord = {
  slug: string;
  name: string;
  status: string;
  category: string;
  version: string;
  deployment: string[];
  pricing: string;
  description: string;
};

const storeCatalog = rawStoreCatalog as { applications: GeneratedStoreRecord[] };
const generatedApps: MarketplaceApp[] = storeCatalog.applications.map((entry) => ({
  slug: entry.slug,
  name: entry.name,
  status: entry.status === "Pilot" || entry.status === "Coming Soon" ? entry.status : "Available",
  category: entry.category as MarketplaceApp["category"],
  value: entry.description,
  features: ["Subscription-controlled access", "Secure customer delivery", `Published release ${entry.version}`],
  integrations: [],
  deployment: entry.deployment as MarketplaceApp["deployment"],
  pricing: entry.pricing,
  documentation: ["Release notes", "Deployment guide", "Customer support"],
  faq: [{ q: "How is access provided?", a: "Purchase through the Obserra store. Active subscriptions receive portal access, a subscription-bound application key, and authorized downloads where applicable." }],
}));

const bySlug = new Map<string, MarketplaceApp>();
for (const entry of marketplaceApps) bySlug.set(entry.slug, entry);
for (const entry of generatedApps) bySlug.set(entry.slug, { ...bySlug.get(entry.slug), ...entry });

export const storefrontApps = [...bySlug.values()];
export function findStorefrontAppBySlug(slug: string) {
  return storefrontApps.find((entry) => entry.slug === slug);
}
