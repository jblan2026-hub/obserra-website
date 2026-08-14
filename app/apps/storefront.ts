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

const legacySlugAliases: Readonly<Record<string, string>> = Object.freeze({
  "obserra-incident-command": "obserra-cyber-crisis-commander",
  "obserra-incident-command-console": "obserra-cyber-crisis-commander",
});

export function canonicalStorefrontSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return legacySlugAliases[normalized] ?? normalized;
}

const storeCatalog = rawStoreCatalog as { applications: GeneratedStoreRecord[] };
const generatedApps: MarketplaceApp[] = storeCatalog.applications.map((entry) => {
  const status = entry.status === "Pilot" || entry.status === "Coming Soon" ? entry.status : "Available";
  const releaseFeature = status === "Coming Soon"
    ? "Governed pre-release enrollment"
    : `Published release ${entry.version}`;

  return {
    slug: canonicalStorefrontSlug(entry.slug),
    name: entry.name,
    status,
    category: entry.category as MarketplaceApp["category"],
    value: entry.description,
    features: ["Subscription-controlled access", "Secure customer delivery", releaseFeature],
    integrations: [],
    deployment: entry.deployment as MarketplaceApp["deployment"],
    pricing: entry.pricing,
    documentation: status === "Coming Soon"
      ? ["Product preview", "Deployment architecture", "Customer support"]
      : ["Release notes", "Deployment guide", "Customer support"],
    faq: [{
      q: "How is access provided?",
      a: status === "Coming Soon"
        ? "This application is in governed pre-release status. Purchase activation will be exposed through the Obserra store only after commercial release approval and pricing configuration."
        : "Purchase through the Obserra store. Active subscriptions receive portal access, a subscription-bound application key, and authorized downloads where applicable.",
    }],
  };
});

const bySlug = new Map<string, MarketplaceApp>();
for (const entry of marketplaceApps) {
  const slug = canonicalStorefrontSlug(entry.slug);
  bySlug.set(slug, { ...entry, slug });
}
for (const entry of generatedApps) {
  const slug = canonicalStorefrontSlug(entry.slug);
  bySlug.set(slug, { ...bySlug.get(slug), ...entry, slug });
}

export const storefrontApps = [...bySlug.values()];
export function findStorefrontAppBySlug(slug: string) {
  return bySlug.get(canonicalStorefrontSlug(slug));
}
