#!/usr/bin/env node
import { createHmac } from "node:crypto";
import Stripe from "stripe";

import {
  EXPECTED_CATALOG_REVISION,
  EXPECTED_PRODUCT_COUNT,
  readCatalog,
  sha256,
} from "./marketplace-v12-artifact-lib.mjs";

const SOURCE = "obserra-ai-marketplace-v12";
const SUPABASE_ORIGIN = "https://ykmrlcfitsubqajgfnye.supabase.co";
const PRODUCT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const OPTIONS = new Set(["recurring:month", "recurring:year", "one_time:once", "team_license:once", "activation:once"]);

function fail(message) { throw new Error(`Marketplace v1.2 bulk Stripe binding reconciliation: ${message}`); }
function integer(value, label, minimum, maximum) {
  if (!/^\d+$/.test(value ?? "")) fail(`${label} is invalid`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) fail(`${label} is invalid`);
  return parsed;
}
function args(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index], value = argv[index + 1];
    if (!["--shard-index", "--shard-count", "--concurrency"].includes(key) || value === undefined) fail("arguments are invalid");
    if (values.has(key)) fail("arguments are duplicated");
    values.set(key, value);
  }
  if (values.size !== 3) fail("all shard arguments are required");
  const shardCount = integer(values.get("--shard-count"), "shard count", 1, 32);
  const shardIndex = integer(values.get("--shard-index"), "shard index", 0, shardCount - 1);
  const concurrency = integer(values.get("--concurrency"), "concurrency", 1, 8);
  return { shardIndex, shardCount, concurrency };
}
function optionFor(offer) {
  if (offer.kind === "recurring" && offer.cadence === "month") return "recurring:month";
  if (offer.kind === "recurring" && offer.cadence === "year") return "recurring:year";
  if (offer.kind === "one_time") return "one_time:once";
  if (offer.kind === "team_license") return "team_license:once";
  if (offer.kind === "activation") return "activation:once";
  return null;
}
function offerKey(offer) { return `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`; }
function offers(card) {
  if (!Array.isArray(card.pricing?.offers) || card.pricing.offers.length < 1 || card.pricing.offers.length > 5) fail("catalog offers are invalid");
  const entries = card.pricing.offers.map((offer) => ({ offer, option: optionFor(offer), key: offerKey(offer) }));
  if (entries.some(({ offer, option }) => !option || !OPTIONS.has(option) || offer.currency !== "USD" || !Number.isSafeInteger(offer.amount_minor) || offer.amount_minor <= 0)) fail("catalog offer is unsupported");
  if (new Set(entries.map(({ option }) => option)).size !== entries.length) fail("catalog purchase options are duplicated");
  return entries;
}
function boundedIdempotencyKey(value) { return value.length <= 255 ? value : `obserra-v12-${sha256(value)}`; }
function productMatches(product, card, revision, artifactSha256) {
  return product?.active === true && product.deleted !== true
    && product.metadata?.obserraMarketplaceProduct === card.product_id
    && product.metadata?.catalogRevision === revision
    && product.metadata?.artifactSha256 === artifactSha256
    && product.metadata?.commerceSource === SOURCE;
}
function priceMatches(price, stripeProductId, entry, live, card, revision, artifactSha256) {
  const productReference = typeof price.product === "string" ? price.product : price.product?.id;
  const recurring = entry.offer.kind === "recurring";
  return price?.active === true && price.livemode === live && productReference === stripeProductId
    && price.currency === "usd" && price.unit_amount === entry.offer.amount_minor
    && (recurring
      ? price.type === "recurring" && price.recurring?.interval === entry.offer.cadence && price.recurring?.interval_count === 1
      : price.type === "one_time")
    && price.metadata?.obserraMarketplaceProduct === card.product_id
    && price.metadata?.catalogRevision === revision
    && price.metadata?.artifactSha256 === artifactSha256
    && price.metadata?.bindingKey === entry.key
    && price.metadata?.purchaseOption === entry.option
    && price.metadata?.commerceSource === SOURCE;
}
function runtime() {
  const stripeKey = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
  const serviceRoleKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const hashSecret = process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim() ?? "";
  const url = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim().replace(/\/$/, "") ?? "";
  if (process.env.OBSERRA_MARKETPLACE_V12_RECONCILIATION_RUN !== "review") fail("explicit review-only approval is required");
  if (!/^(?:sk|rk)_live_[A-Za-z0-9_]+$/.test(stripeKey)) fail("live Stripe authority is unavailable; value suppressed");
  if (url !== SUPABASE_ORIGIN || serviceRoleKey.length < 32) fail("durable review authority is unavailable; value suppressed");
  if (hashSecret.length < 32) fail("review integrity authority is unavailable; value suppressed");
  return { stripeKey, serviceRoleKey, hashSecret, url };
}
function evidenceKey(input, hashSecret) {
  return createHmac("sha256", hashSecret).update(JSON.stringify([
    input.catalogRevision,
    input.productId,
    input.purchaseOption,
    input.artifactSha256,
    input.stripeProductId,
    input.stripePriceId,
    input.stripeLivemode,
  ])).digest("hex");
}
async function retry(operation, attempts = 4) {
  let last;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await operation(); }
    catch (error) {
      last = error;
      if (attempt + 1 >= attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * (2 ** attempt) + Math.floor(Math.random() * 200)));
    }
  }
  throw last;
}
async function recordReview(input, authority) {
  const response = await retry(() => fetch(`${authority.url}/rest/v1/rpc/obserra_ai_marketplace_record_v12_binding_review`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      apikey: authority.serviceRoleKey,
      ...(authority.serviceRoleKey.split(".").length === 3 ? { authorization: `Bearer ${authority.serviceRoleKey}` } : {}),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      p_principal_id: "github-marketplace-v12-binding-reconciler",
      p_correlation_id: process.env.GITHUB_RUN_ID ? `github-run-${process.env.GITHUB_RUN_ID}-shard-${input.shardIndex}` : `local-shard-${input.shardIndex}`,
      p_product_id: input.productId,
      p_purchase_option: input.purchaseOption,
      p_catalog_revision: input.catalogRevision,
      p_artifact_sha256: input.artifactSha256,
      p_stripe_product_id: input.stripeProductId,
      p_stripe_price_id: input.stripePriceId,
      p_stripe_livemode: input.stripeLivemode,
      p_evidence_key: evidenceKey(input, authority.hashSecret),
    }),
    signal: AbortSignal.timeout(20_000),
  }).then((result) => {
    if (!result.ok) throw new Error("durable review rejected");
    return result;
  }));
  await response.json().catch(() => null);
}

const configuration = args(process.argv.slice(2));
const authority = runtime();
const { catalog } = readCatalog({
  catalogPath: "data/marketplace/obserra-marketplace-card-catalog.json.gz",
  summaryPath: "data/marketplace/obserra-marketplace-card-catalog.summary.json",
});
if (catalog.catalog_revision !== EXPECTED_CATALOG_REVISION) fail("catalog revision is not approved");
const subjects = catalog.cards.filter((card) => card.product_type !== "collection" && card.product_type !== "bundle");
if (subjects.length !== 11_390 || subjects.length !== EXPECTED_PRODUCT_COUNT) fail("catalog subject count is invalid");
for (const card of subjects) {
  if (!PRODUCT_ID.test(card.product_id ?? "") || !SHA256.test(card.artifact?.sha256 ?? "")) fail("catalog product identity is invalid");
  offers(card);
}
const assigned = subjects.filter((_, index) => index % configuration.shardCount === configuration.shardIndex);
const stripe = new Stripe(authority.stripeKey, { apiVersion: "2026-07-29.dahlia", typescript: true, maxNetworkRetries: 4, timeout: 30_000 });
const account = await stripe.accounts.retrieve();
if (!/^acct_[A-Za-z0-9]+$/.test(account.id ?? "") || account.charges_enabled !== true) fail("Stripe account is not charge-capable; identity suppressed");

let cursor = 0;
let processedProducts = 0;
let requiredOfferBindings = 0;
let reviewedOfferBindings = 0;
let createdProducts = 0;
let reusedProducts = 0;
let createdPrices = 0;
let reusedPrices = 0;
const failureReferences = [];
const failureStages = new Map();
function failure(card, stage) {
  failureReferences.push(sha256(`${catalog.catalog_revision}:${card.product_id}:${stage}`));
  failureStages.set(stage, (failureStages.get(stage) ?? 0) + 1);
}

await Promise.all(Array.from({ length: configuration.concurrency }, async () => {
  for (;;) {
    const index = cursor++;
    if (index >= assigned.length) return;
    const card = assigned[index];
    const artifactSha256 = card.artifact.sha256;
    const expectedOffers = offers(card);
    requiredOfferBindings += expectedOffers.length;
    try {
      const matches = await retry(() => stripe.products.search({ query: `metadata['obserraMarketplaceProduct']:'${card.product_id}'`, limit: 10 }));
      const existing = matches.data.filter((candidate) => productMatches(candidate, card, catalog.catalog_revision, artifactSha256));
      if (matches.has_more || existing.length > 1) throw new Error("ambiguous product");
      const productKey = boundedIdempotencyKey(`obserra-v12-product-${catalog.catalog_revision.slice(0, 16)}-${card.product_id}`);
      const stripeProduct = existing[0] ?? await retry(() => stripe.products.create({
        name: String(card.name ?? card.product_id).slice(0, 250),
        description: String(card.description ?? "").slice(0, 500),
        metadata: {
          obserraMarketplaceProduct: card.product_id,
          catalogRevision: catalog.catalog_revision,
          artifactSha256,
          commerceSource: SOURCE,
        },
      }, { idempotencyKey: productKey }));
      if (!productMatches(stripeProduct, card, catalog.catalog_revision, artifactSha256)) throw new Error("product governance mismatch");
      if (existing[0]) reusedProducts += 1; else createdProducts += 1;

      const listedPrices = await retry(() => stripe.prices.list({ product: stripeProduct.id, active: true, limit: 100 }));
      if (listedPrices.has_more) throw new Error("ambiguous price set");
      for (const entry of expectedOffers) {
        const resolved = listedPrices.data.filter((candidate) => priceMatches(candidate, stripeProduct.id, entry, true, card, catalog.catalog_revision, artifactSha256));
        if (resolved.length > 1) throw new Error("ambiguous exact price");
        const priceMetadata = {
          obserraMarketplaceProduct: card.product_id,
          catalogRevision: catalog.catalog_revision,
          artifactSha256,
          bindingKey: entry.key,
          purchaseOption: entry.option,
          commerceSource: SOURCE,
        };
        const priceKey = boundedIdempotencyKey(`obserra-v12-price-${catalog.catalog_revision.slice(0, 16)}-${card.product_id}-${entry.key}`);
        const stripePrice = resolved[0] ?? await retry(() => stripe.prices.create({
          product: stripeProduct.id,
          currency: "usd",
          unit_amount: entry.offer.amount_minor,
          ...(entry.offer.kind === "recurring" ? { recurring: { interval: entry.offer.cadence, interval_count: 1 } } : {}),
          metadata: priceMetadata,
        }, { idempotencyKey: priceKey }));
        if (!priceMatches(stripePrice, stripeProduct.id, entry, true, card, catalog.catalog_revision, artifactSha256)) throw new Error("price governance mismatch");
        if (resolved[0]) reusedPrices += 1; else createdPrices += 1;
        await recordReview({
          shardIndex: configuration.shardIndex,
          productId: card.product_id,
          purchaseOption: entry.option,
          catalogRevision: catalog.catalog_revision,
          artifactSha256,
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          stripeLivemode: stripePrice.livemode,
        }, authority);
        reviewedOfferBindings += 1;
      }
      processedProducts += 1;
    } catch {
      failure(card, "reconcile");
    }
  }
}));

const result = {
  contract: "obserra-marketplace-v12-bulk-binding-reconcile-v1",
  catalogRevision: catalog.catalog_revision,
  shardIndex: configuration.shardIndex,
  shardCount: configuration.shardCount,
  concurrency: configuration.concurrency,
  assignedProducts: assigned.length,
  processedProducts,
  requiredOfferBindings,
  reviewedOfferBindings,
  createdProducts,
  reusedProducts,
  createdPrices,
  reusedPrices,
  failureCount: failureReferences.length,
  failureReferencesSha256: failureReferences.sort(),
  failureStageCounts: Object.fromEntries([...failureStages].sort(([left], [right]) => left.localeCompare(right))),
  activationChanged: false,
  checkoutActivated: false,
};
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.failureCount === 0 && result.processedProducts === result.assignedProducts && result.reviewedOfferBindings === result.requiredOfferBindings ? 0 : 2;
