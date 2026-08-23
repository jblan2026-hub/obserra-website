import "server-only";

import { createHmac } from "node:crypto";
import { ensureApplicationsRuntimeSecrets } from "./production-runtime-secrets";

type BindingReview = {
  principalId: string;
  correlationId: string;
  productId: string;
  purchaseOption: string;
  catalogRevision: string;
  artifactSha256: string;
  stripeProductId: string;
  stripePriceId: string;
  stripeLivemode: boolean;
};

export type MarketplaceV12BindingReviewEvidence = Readonly<{
  purchaseOption: string;
  artifactSha256: string;
  stripeProductId: string;
  stripePriceId: string;
  stripeLivemode: boolean;
  evidenceKey: string;
  reviewedAt: string;
}>;

export type MarketplaceV12BindingReviewProgress = Readonly<{
  catalogRevision: string;
  productId: string;
  reviewedOfferBindings: number;
  liveReviewedOfferBindings: number;
  reviewedProductCards: number;
  productReviewedOfferBindings: number;
  productEvidence: readonly MarketplaceV12BindingReviewEvidence[];
}>;

export type MarketplaceV12BindingAuthorityReceipt = Readonly<{
  contract: "obserra-marketplace-v12-runtime-binding-receipt-v1";
  revision: string;
  requiredProducts: number;
  requiredOfferBindings: number;
  reviewedProductCards: number;
  liveReviewedOfferBindings: number;
  bindingSetSha256: string;
  verifiedAt: string;
}>;

export type MarketplaceV12ProductBindingAuthority = Readonly<{
  revision: string;
  bindingSetSha256: string;
  verifiedAt: string;
  productId: string;
  bindings: readonly MarketplaceV12BindingReviewEvidence[];
}>;

const SHA256 = /^[a-f0-9]{64}$/;
const PRODUCT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;
const PRICE = /^price_[A-Za-z0-9]+$/;
const STRIPE_PRODUCT = /^prod_[A-Za-z0-9]+$/;

function config() {
  const url = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
  const key = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "ykmrlcfitsubqajgfnye.supabase.co" || !key) throw new Error("Marketplace binding evidence store is unavailable.");
  return { url: parsed.origin, key, jwt: key.split(".").length === 3 };
}

function evidenceKey(review: BindingReview) {
  const key = process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim() ?? "";
  if (key.length < 32) throw new Error("Marketplace binding review integrity key is unavailable.");
  return createHmac("sha256", key).update(JSON.stringify([review.catalogRevision, review.productId, review.purchaseOption, review.artifactSha256, review.stripeProductId, review.stripePriceId, review.stripeLivemode])).digest("hex");
}

function bindingEvidence(value: unknown): MarketplaceV12BindingReviewEvidence {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Marketplace binding authority evidence is invalid.");
  const row = value as Record<string, unknown>;
  if (typeof row.purchaseOption !== "string" || typeof row.artifactSha256 !== "string" || !SHA256.test(row.artifactSha256)
    || typeof row.stripeProductId !== "string" || !STRIPE_PRODUCT.test(row.stripeProductId)
    || typeof row.stripePriceId !== "string" || !PRICE.test(row.stripePriceId)
    || typeof row.stripeLivemode !== "boolean" || typeof row.evidenceKey !== "string" || !SHA256.test(row.evidenceKey)
    || typeof row.reviewedAt !== "string" || !Number.isFinite(Date.parse(row.reviewedAt))) throw new Error("Marketplace binding authority evidence is invalid.");
  return { purchaseOption: row.purchaseOption, artifactSha256: row.artifactSha256, stripeProductId: row.stripeProductId, stripePriceId: row.stripePriceId, stripeLivemode: row.stripeLivemode, evidenceKey: row.evidenceKey, reviewedAt: row.reviewedAt };
}

function bindingReceipt(value: unknown): MarketplaceV12BindingAuthorityReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Marketplace binding authority receipt is invalid.");
  const receipt = value as Record<string, unknown>;
  const counts = [receipt.requiredProducts, receipt.requiredOfferBindings, receipt.reviewedProductCards, receipt.liveReviewedOfferBindings];
  if (receipt.contract !== "obserra-marketplace-v12-runtime-binding-receipt-v1"
    || typeof receipt.revision !== "string" || !SHA256.test(receipt.revision)
    || typeof receipt.bindingSetSha256 !== "string" || !SHA256.test(receipt.bindingSetSha256)
    || !counts.every((count) => Number.isSafeInteger(count) && (count as number) > 0)
    || typeof receipt.verifiedAt !== "string" || !Number.isFinite(Date.parse(receipt.verifiedAt))) throw new Error("Marketplace binding authority receipt is invalid.");
  return receipt as MarketplaceV12BindingAuthorityReceipt;
}

async function bindingRpc<T>(name: string, body: Record<string, unknown>) {
  await ensureApplicationsRuntimeSecrets();
  const runtime = config();
  const response = await fetch(`${runtime.url}/rest/v1/rpc/${name}`, {
    method: "POST", cache: "no-store", redirect: "error",
    headers: { apikey: runtime.key, ...(runtime.jwt ? { authorization: `Bearer ${runtime.key}` } : {}), "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Marketplace binding evidence store is unavailable.");
  try { return await response.json() as T; } catch { throw new Error("Marketplace binding evidence store returned invalid data."); }
}

/**
 * This stores a review record only. It deliberately does not write the runtime
 * binding manifest or release evidence; those require the catalog-wide signed
 * verification workflow before checkout can become available.
 */
export async function recordMarketplaceV12BindingImportReview(review: BindingReview) {
  await bindingRpc("obserra_ai_marketplace_record_v12_binding_review", {
    p_principal_id: review.principalId,
    p_correlation_id: review.correlationId,
    p_product_id: review.productId,
    p_purchase_option: review.purchaseOption,
    p_catalog_revision: review.catalogRevision,
    p_artifact_sha256: review.artifactSha256,
    p_stripe_product_id: review.stripeProductId,
    p_stripe_price_id: review.stripePriceId,
    p_stripe_livemode: review.stripeLivemode,
    p_evidence_key: evidenceKey(review),
  });
}

/** Returns owner-only review evidence. Reviewed bindings never activate checkout. */
export async function marketplaceV12BindingReviewProgress(catalogRevision: string, productId: string) {
  if (!SHA256.test(catalogRevision) || !PRODUCT.test(productId)) throw new Error("Marketplace binding progress identity is invalid.");
  const value = await bindingRpc<unknown>("obserra_ai_marketplace_v12_binding_review_progress", { p_catalog_revision: catalogRevision, p_product_id: productId });
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Marketplace binding progress is invalid.");
  const progress = value as Record<string, unknown>;
  const evidence = progress.productEvidence;
  const counts = [progress.reviewedOfferBindings, progress.liveReviewedOfferBindings, progress.reviewedProductCards, progress.productReviewedOfferBindings];
  if (progress.catalogRevision !== catalogRevision || progress.productId !== productId || !counts.every((count) => Number.isSafeInteger(count) && (count as number) >= 0) || !Array.isArray(evidence) || evidence.length > 10) throw new Error("Marketplace binding progress is invalid.");
  const productEvidence = evidence.map(bindingEvidence);
  return {
    catalogRevision, productId,
    reviewedOfferBindings: progress.reviewedOfferBindings as number,
    liveReviewedOfferBindings: progress.liveReviewedOfferBindings as number,
    reviewedProductCards: progress.reviewedProductCards as number,
    productReviewedOfferBindings: progress.productReviewedOfferBindings as number,
    productEvidence,
  } satisfies MarketplaceV12BindingReviewProgress;
}

export async function marketplaceV12BindingAuthorityReceipt(catalogRevision: string) {
  if (!SHA256.test(catalogRevision)) throw new Error("Marketplace binding authority identity is invalid.");
  const value = await bindingRpc<unknown>("obserra_ai_marketplace_v12_binding_authority_receipt", { p_catalog_revision: catalogRevision });
  return bindingReceipt(value);
}

export async function marketplaceV12ProductBindingAuthority(catalogRevision: string, productId: string) {
  if (!SHA256.test(catalogRevision) || !PRODUCT.test(productId)) throw new Error("Marketplace product binding authority identity is invalid.");
  const value = await bindingRpc<unknown>("obserra_ai_marketplace_v12_product_binding_authority", { p_catalog_revision: catalogRevision, p_product_id: productId });
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Marketplace product binding authority is invalid.");
  const authority = value as Record<string, unknown>;
  if (authority.revision !== catalogRevision || authority.productId !== productId
    || typeof authority.bindingSetSha256 !== "string" || !SHA256.test(authority.bindingSetSha256)
    || typeof authority.verifiedAt !== "string" || !Number.isFinite(Date.parse(authority.verifiedAt))
    || !Array.isArray(authority.bindings) || authority.bindings.length > 10) throw new Error("Marketplace product binding authority is invalid.");
  return {
    revision: catalogRevision,
    productId,
    bindingSetSha256: authority.bindingSetSha256,
    verifiedAt: authority.verifiedAt,
    bindings: authority.bindings.map(bindingEvidence),
  } satisfies MarketplaceV12ProductBindingAuthority;
}

export function marketplaceV12BindingEvidenceKeyMatches(review: Omit<BindingReview, "principalId" | "correlationId"> & { evidenceKey: string }) {
  return SHA256.test(review.evidenceKey) && evidenceKey({ ...review, principalId: "runtime", correlationId: "runtime" }) === review.evidenceKey;
}
