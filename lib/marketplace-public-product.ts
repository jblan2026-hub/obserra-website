import type { MarketplacePedestalDetail } from "./marketplace-v12-product-pedestal";

type PublicOffer = Readonly<{ kind: string; amount_minor: number; currency: string; cadence?: string | null }>;

export type MarketplacePublicProductDetail = Readonly<{
  productId: string;
  slug: string;
  name: string;
  description: string;
  mission: string | null;
  publisher: string;
  family: string;
  productType: string;
  category: string | null;
  domain: string | null;
  capability: string | null;
  proficiency: string | null;
  tags: readonly string[];
  deliverable: string | null;
  positionSeed: number;
  objectArchetype: string | null;
  pricing: Readonly<{ offers: readonly PublicOffer[] }>;
  collection: Readonly<{ slug: string; name: string }> | null;
  relationships: readonly Readonly<{ productId: string; slug: string; name: string; family: string; productType: string }>[];
}>;

export function marketplacePublicProductDetail(detail: MarketplacePedestalDetail): MarketplacePublicProductDetail {
  return {
    productId: detail.productId,
    slug: detail.slug,
    name: detail.name,
    description: detail.description,
    mission: detail.mission,
    publisher: detail.publisher,
    family: detail.family,
    productType: detail.productType,
    category: detail.category,
    domain: detail.domain,
    capability: detail.capability,
    proficiency: detail.proficiency,
    tags: detail.tags,
    deliverable: detail.deliverable,
    positionSeed: detail.positionSeed,
    objectArchetype: detail.objectArchetype,
    pricing: {
      offers: detail.pricing.offers.map((offer) => ({
        kind: offer.kind,
        amount_minor: offer.amount_minor,
        currency: offer.currency,
        cadence: offer.cadence,
      })),
    },
    collection: detail.collection ? { slug: detail.collection.slug, name: detail.collection.name } : null,
    relationships: detail.relationships.map((entry) => ({
      productId: entry.productId,
      slug: entry.slug,
      name: entry.name,
      family: entry.family,
      productType: entry.productType,
    })),
  };
}
