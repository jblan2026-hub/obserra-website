import "server-only";

import { marketplaceV12Product, marketplaceV12Search, type MarketplaceV12Card } from "./marketplace-v12-catalog";

export const MARKETPLACE_COMPARE_LIMIT = 4;
export const MARKETPLACE_COMPOSER_LIMIT = 8;

type MarketplaceInstall = { profile?: unknown; one_click_enabled?: unknown; fallback_label?: unknown };
type MarketplaceRelease = { role?: unknown; version?: unknown; artifact_sha256?: unknown };

export type MarketplaceWorkspaceRecord = Readonly<{
  productId: string;
  slug: string;
  name: string;
  description: string;
  mission: string | null;
  family: string;
  productType: string;
  publisher: string;
  version: string;
  publicationState: string;
  credentialMode: string | null;
  deliverable: string | null;
  category: string | null;
  pricing: MarketplaceV12Card["pricing"];
  artifactSha256: string | null;
  releaseVersion: string | null;
  installProfile: string | null;
  installBridgeEnabled: boolean;
  installFallbackLabel: string | null;
  relationshipProductIds: string[];
  sceneCluster: string;
  positionSeed: number;
  objectArchetype: string | null;
  action: { action: string; enabled: boolean; label: string; reasonCode: string | null };
}>;

export type MarketplaceSelection = Readonly<{
  records: MarketplaceWorkspaceRecord[];
  canonicalItems: string;
  invalid: boolean;
  reason: string | null;
}>;

function stringValue(value: unknown, maximum = 1_000) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maximum) : null;
}

function record(card: MarketplaceV12Card): MarketplaceWorkspaceRecord {
  const install = (card.install && typeof card.install === "object" ? card.install : {}) as MarketplaceInstall;
  const releases = Array.isArray(card.release_history) ? card.release_history as MarketplaceRelease[] : [];
  const currentRelease = releases.find((entry) => entry && entry.role === "current") ?? releases[0];
  const generated = card.action_policy?.generated_state;
  return {
    productId: card.product_id,
    slug: card.slug,
    name: card.name,
    description: card.description,
    mission: stringValue(card.mission),
    family: card.family,
    productType: card.product_type,
    publisher: stringValue(card.publisher) ?? "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    version: card.version,
    publicationState: card.publication_state,
    credentialMode: stringValue(card.credential_mode),
    deliverable: stringValue(card.deliverable),
    category: stringValue(card.category),
    pricing: card.pricing,
    artifactSha256: stringValue(card.artifact?.sha256, 64),
    releaseVersion: stringValue(currentRelease?.version),
    installProfile: stringValue(install.profile),
    installBridgeEnabled: install.one_click_enabled === true,
    installFallbackLabel: stringValue(install.fallback_label),
    relationshipProductIds: [...new Set(card.visualization.relationship_product_ids.filter((id) => typeof id === "string" && id.length > 0))].sort(),
    sceneCluster: card.visualization.scene_cluster,
    positionSeed: card.visualization.position_seed,
    objectArchetype: stringValue(card.visualization.object_archetype),
    action: {
      action: generated?.action ?? "unavailable",
      enabled: generated?.enabled === true,
      label: generated?.label ?? "Unavailable",
      reasonCode: stringValue(generated?.reason_code),
    },
  };
}

/**
 * Resolves only catalog identities and produces one canonical URL sequence.
 * Browser state may suggest IDs, but never determines selection membership.
 */
export function marketplaceV12Selection(value: string | undefined, limit: number): MarketplaceSelection {
  if (!value) return { records: [], canonicalItems: "", invalid: false, reason: null };
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("Invalid marketplace selection limit");
  const raw = value.split(",").map((entry) => entry.trim()).filter(Boolean);
  if (raw.length === 0) return { records: [], canonicalItems: "", invalid: false, reason: null };
  if (raw.length > limit) return { records: [], canonicalItems: "", invalid: true, reason: `Select no more than ${limit} catalog records.` };
  if (raw.some((entry) => !/^[a-z0-9][a-z0-9-]{0,159}$/i.test(entry))) return { records: [], canonicalItems: "", invalid: true, reason: "The selected catalog record identifier is invalid." };
  const seen = new Set<string>();
  const cards: MarketplaceV12Card[] = [];
  for (const identifier of raw) {
    const card = marketplaceV12Product(identifier);
    if (!card) return { records: [], canonicalItems: "", invalid: true, reason: "A selected catalog record no longer exists in the current revision." };
    if (!seen.has(card.product_id)) {
      seen.add(card.product_id);
      cards.push(card);
    }
  }
  const records = cards.map(record).sort((a, b) => a.productId.localeCompare(b.productId));
  return { records, canonicalItems: records.map((entry) => entry.slug).join(","), invalid: false, reason: null };
}

export function marketplaceV12WorkspaceRecord(identifier: string | undefined) {
  if (!identifier || !/^[a-z0-9][a-z0-9-]{0,159}$/i.test(identifier)) return null;
  const card = marketplaceV12Product(identifier);
  return card ? record(card) : null;
}

/** A bounded, server-derived discovery projection for composer/compare entry. */
export function marketplaceV12WorkspaceCandidates(query?: string) {
  const result = marketplaceV12Search({ q: query, limit: 24 });
  return result.results.map((entry) => marketplaceV12WorkspaceRecord(entry.product_id)).filter((entry): entry is MarketplaceWorkspaceRecord => Boolean(entry));
}

export function marketplaceV12SelectionRelationships(records: MarketplaceWorkspaceRecord[]) {
  const selected = new Set(records.map((entry) => entry.productId));
  const edges = records.flatMap((source) => source.relationshipProductIds
    .filter((target) => selected.has(target) && source.productId < target)
    .map((target) => ({ sourceProductId: source.productId, targetProductId: target })));
  const connected = new Set(edges.flatMap((edge) => [edge.sourceProductId, edge.targetProductId]));
  return { edges, isolatedProductIds: records.filter((entry) => !connected.has(entry.productId)).map((entry) => entry.productId) };
}

/**
 * Composer facts deliberately avoid an inferred bundle price, compatibility,
 * prerequisites, or savings. The supplied catalog has no governed record for
 * any of those combined-selection policies.
 */
export function marketplaceV12ComposerFacts(anchor: MarketplaceWorkspaceRecord | null, selection: MarketplaceWorkspaceRecord[]) {
  const records = anchor && !selection.some((entry) => entry.productId === anchor.productId) ? [anchor, ...selection] : selection;
  return {
    records,
    relationships: marketplaceV12SelectionRelationships(records),
    combinedPrice: null,
    combinedCadence: null,
    combinedSavings: null,
    compatibility: "No server-governed combined compatibility rule is present for this selection.",
    prerequisites: "No server-governed combined prerequisite rule is present for this selection.",
    licenseScope: "No server-governed combined license scope is present for this selection.",
    activation: "No server-governed combined activation rule is present for this selection.",
  } as const;
}
