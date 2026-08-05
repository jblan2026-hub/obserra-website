import rawStoreCatalog from "../app/apps/store-catalog.json";
import rawMarketingCatalog from "../app/apps/marketing-catalog.json";

export type ProductMarketing = {
  campaignName?: string;
  status?: string;
  headline?: string;
  shortDescription?: string;
  longDescription?: string;
  primaryCta?: string;
  secondaryCta?: string;
  audiences?: string[];
  keywords?: string[];
  channels?: string[];
  creativeAssets?: string[];
  landingPageUrl?: string;
  trackedUrls?: Record<string, string>;
  copy?: Record<string, string>;
  approval?: {
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: string;
    claimsReviewed?: boolean;
  };
};

export type ProductIntelligence = {
  slug: string;
  name: string;
  status: string;
  category: string;
  version: string;
  artifactFile?: string;
  objectKey?: string;
  deployment: string[];
  pricing: string;
  description: string;
  features: string[];
  integrations: string[];
  documentation: string[];
  subscriptionRequired: boolean;
  publishedAt?: string;
  supportedIndustries?: string[];
  supportedFrameworks?: string[];
  relatedProducts?: string[];
  marketing?: ProductMarketing;
};

type StoreCatalog = { applications: ProductIntelligence[] };
type MarketingCatalog = { campaigns: Array<ProductMarketing & { slug: string }> };

const storeCatalog = rawStoreCatalog as StoreCatalog;
const marketingCatalog = rawMarketingCatalog as MarketingCatalog;
const campaignsBySlug = new Map(marketingCatalog.campaigns.map((campaign) => [campaign.slug, campaign]));

export const productIntelligence: ProductIntelligence[] = storeCatalog.applications.map((product) => ({
  ...product,
  features: product.features ?? [],
  integrations: product.integrations ?? [],
  documentation: product.documentation ?? [],
  deployment: product.deployment ?? ["SaaS"],
  subscriptionRequired: product.subscriptionRequired !== false,
  marketing: campaignsBySlug.get(product.slug),
}));

export function findProductIntelligence(slug: string) {
  return productIntelligence.find((product) => product.slug === slug);
}

export function relatedProductIntelligence(product: ProductIntelligence, limit = 3) {
  const explicit = new Set(product.relatedProducts ?? []);
  return productIntelligence
    .filter((candidate) => candidate.slug !== product.slug)
    .sort((left, right) => {
      const leftScore = (explicit.has(left.slug) ? 4 : 0) + (left.category === product.category ? 2 : 0);
      const rightScore = (explicit.has(right.slug) ? 4 : 0) + (right.category === product.category ? 2 : 0);
      return rightScore - leftScore || left.name.localeCompare(right.name);
    })
    .slice(0, limit);
}
