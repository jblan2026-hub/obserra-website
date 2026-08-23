import "server-only";

import { marketplaceV12Product, type MarketplaceV12Card } from "./marketplace-v12-catalog";

type Artifact = { sha256?: unknown; filename?: unknown; verification?: unknown; source_archive?: unknown; bytes?: unknown };
type Release = { role?: unknown; version?: unknown; artifact_sha256?: unknown; source_archive?: unknown };
type Install = { profile?: unknown; enablement_gate?: unknown; fallback_label?: unknown; one_click_enabled?: unknown };
type Stripe = { price_binding_state?: unknown; price_lookup_keys?: unknown; webhook_required_for_entitlement?: unknown };

export type MarketplacePedestalDetail = Readonly<{
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
  capabilityId: string | null;
  proficiency: string | null;
  tags: string[];
  version: string;
  publicationState: string;
  pricing: MarketplaceV12Card["pricing"];
  pricingBasis: string | null;
  credentialMode: string | null;
  deliverable: string | null;
  objectArchetype: string | null;
  positionSeed: number;
  sceneCluster: string;
  action: { action: string; enabled: boolean; label: string; reasonCode: string | null };
  artifact: { sha256: string | null; filename: string | null; bytes: number | null; verification: string | null; sourceArchive: string | null };
  releases: { version: string; role: string | null; artifactSha256: string | null; sourceArchive: string | null }[];
  install: { profile: string | null; enablementGate: string | null; fallbackLabel: string | null; oneClickEnabled: boolean };
  stripe: { priceBindingState: string | null; priceLookupKeyCount: number; webhookRequiredForEntitlement: boolean };
  collection: { productId: string; slug: string; name: string; includedProductCount: number | null } | null;
  includedProductCount: number | null;
  relationships: { productId: string; slug: string; name: string; family: string; productType: string }[];
  unresolvedRelationshipCount: number;
  additionalRelationshipCount: number;
}>;

function text(value: unknown, max = 1_000) { return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null; }
function safeCount(value: unknown) { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null; }

/** A product-detail projection, generated from the immutable catalog record. */
export function marketplaceV12PedestalDetail(product: MarketplaceV12Card): MarketplacePedestalDetail {
  const artifact = (product.artifact && typeof product.artifact === "object" ? product.artifact : {}) as Artifact;
  const install = (product.install && typeof product.install === "object" ? product.install : {}) as Install;
  const stripe = (product.stripe && typeof product.stripe === "object" ? product.stripe : {}) as Stripe;
  const releases = (Array.isArray(product.release_history) ? product.release_history : [])
    .filter((entry): entry is Release => Boolean(entry) && typeof entry === "object")
    .map((entry) => ({ version: text(entry.version, 120) ?? "Unspecified", role: text(entry.role, 80), artifactSha256: text(entry.artifact_sha256, 64), sourceArchive: text(entry.source_archive, 500) }));
  const declaredIds = [...new Set(product.visualization.relationship_product_ids.filter((id) => typeof id === "string" && id.length > 0))];
  const detailRelationshipIds = declaredIds.slice(0, 24);
  const relationships = detailRelationshipIds.flatMap((productId) => {
    const related = marketplaceV12Product(productId);
    return related ? [{ productId: related.product_id, slug: related.slug, name: related.name, family: related.family, productType: related.product_type }] : [];
  });
  const generated = product.action_policy?.generated_state;
  const collectionProductId = text(product.collection_product_id, 160);
  const collectionProduct = collectionProductId ? marketplaceV12Product(collectionProductId) : null;
  return {
    productId: product.product_id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    mission: text(product.mission),
    publisher: text(product.publisher) ?? "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    family: product.family,
    productType: product.product_type,
    category: text(product.category),
    domain: text(product.domain),
    capability: text(product.capability),
    capabilityId: text(product.capability_id, 160),
    proficiency: text(product.proficiency),
    tags: Array.isArray(product.tags) ? [...new Set(product.tags.flatMap((entry) => text(entry, 160) ?? []))].slice(0, 20) : [],
    version: product.version,
    publicationState: product.publication_state,
    pricing: product.pricing,
    pricingBasis: text(product.pricing.pricing_basis),
    credentialMode: text(product.credential_mode),
    deliverable: text(product.deliverable),
    objectArchetype: text(product.visualization.object_archetype),
    positionSeed: product.visualization.position_seed,
    sceneCluster: product.visualization.scene_cluster,
    action: { action: generated?.action ?? "unavailable", enabled: generated?.enabled === true, label: generated?.label ?? "Unavailable", reasonCode: text(generated?.reason_code) },
    artifact: { sha256: text(artifact.sha256, 64), filename: text(artifact.filename, 500), bytes: safeCount(artifact.bytes), verification: text(artifact.verification, 500), sourceArchive: text(artifact.source_archive, 500) },
    releases,
    install: { profile: text(install.profile), enablementGate: text(install.enablement_gate), fallbackLabel: text(install.fallback_label), oneClickEnabled: install.one_click_enabled === true },
    stripe: { priceBindingState: text(stripe.price_binding_state), priceLookupKeyCount: Array.isArray(stripe.price_lookup_keys) ? stripe.price_lookup_keys.length : 0, webhookRequiredForEntitlement: stripe.webhook_required_for_entitlement === true },
    collection: collectionProduct ? { productId: collectionProduct.product_id, slug: collectionProduct.slug, name: collectionProduct.name, includedProductCount: safeCount(collectionProduct.included_product_count) } : null,
    includedProductCount: safeCount(product.included_product_count),
    relationships,
    unresolvedRelationshipCount: Math.max(0, detailRelationshipIds.length - relationships.length),
    additionalRelationshipCount: Math.max(0, declaredIds.length - detailRelationshipIds.length),
  };
}
