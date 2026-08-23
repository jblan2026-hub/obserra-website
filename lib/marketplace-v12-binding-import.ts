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
  return createHmac("sha256", key).update(JSON.stringify([review.catalogRevision, review.productId, review.purchaseOption, review.stripeProductId, review.stripePriceId])).digest("hex");
}

/**
 * This stores a review record only. It deliberately does not write the runtime
 * binding manifest or release evidence; those require the catalog-wide signed
 * verification workflow before checkout can become available.
 */
export async function recordMarketplaceV12BindingImportReview(review: BindingReview) {
  await ensureApplicationsRuntimeSecrets();
  const runtime = config();
  const response = await fetch(`${runtime.url}/rest/v1/rpc/obserra_ai_marketplace_record_v12_binding_review`, {
    method: "POST", cache: "no-store", redirect: "error",
    headers: { apikey: runtime.key, ...(runtime.jwt ? { authorization: `Bearer ${runtime.key}` } : {}), "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
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
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Marketplace binding review could not be recorded.");
}
