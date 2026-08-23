import { createHash } from "node:crypto";
import Stripe from "stripe";

import { readCatalog } from "./marketplace-v12-artifact-lib.mjs";

const REVIEW_MODE = "review";
const SOURCE = "obserra-ai-marketplace-v12";
const PRICE = /^price_[A-Za-z0-9]+$/;
const PRODUCT = /^prod_[A-Za-z0-9]+$/;
const SHA = /^[a-f0-9]{64}$/;
const PRODUCT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;
const PURCHASE_OPTIONS = new Set(["recurring:month", "recurring:year", "one_time:once", "team_license:once", "activation:once"]);
const SUPABASE_ORIGIN = "https://ykmrlcfitsubqajgfnye.supabase.co";

function fail(message) { throw new Error(message); }
function digest(value) { return createHash("sha256").update(value).digest("hex"); }
function offerKey(offer) { return `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`; }
function optionFor(offer) {
  if (offer.kind === "recurring" && offer.cadence === "month") return "recurring:month";
  if (offer.kind === "recurring" && offer.cadence === "year") return "recurring:year";
  if (offer.kind === "one_time") return "one_time:once";
  if (offer.kind === "team_license") return "team_license:once";
  if (offer.kind === "activation") return "activation:once";
  return null;
}

function bindingKey(productId, purchaseOption) { return `${productId}\0${purchaseOption}`; }

async function bindingRpc(name, body) {
  const url = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim().replace(/\/$/, "") ?? "";
  const serviceRoleKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (url !== SUPABASE_ORIGIN || !serviceRoleKey) fail("The durable binding authority is unavailable; values suppressed.");
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: { apikey: serviceRoleKey, ...(serviceRoleKey.split(".").length === 3 ? { authorization: `Bearer ${serviceRoleKey}` } : {}), "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  }).catch(() => fail("The durable binding authority transport failed; provider output suppressed."));
  if (!response.ok) fail("The durable binding authority rejected the request; provider output suppressed.");
  try { return await response.json(); } catch { fail("The durable binding authority returned invalid data."); }
}

async function durableReviews(revision) {
  const reviews = [];
  const seen = new Set();
  let afterProductId = "", afterPurchaseOption = "", previousCursor = "";
  for (;;) {
    const page = await bindingRpc("obserra_ai_marketplace_v12_binding_review_page", {
      p_catalog_revision: revision,
      p_after_product_id: afterProductId,
      p_after_purchase_option: afterPurchaseOption,
      p_limit: 500,
    });
    if (!page || typeof page !== "object" || Array.isArray(page) || page.revision !== revision || !Array.isArray(page.reviews) || page.reviews.length > 500) fail("The durable binding authority page is invalid.");
    if (page.reviews.length === 0) {
      if (page.nextProductId !== null || page.nextPurchaseOption !== null) fail("The durable binding authority cursor is invalid.");
      return reviews;
    }
    for (const review of page.reviews) {
      if (!review || typeof review !== "object" || Array.isArray(review)
        || !PRODUCT_ID.test(review.productId ?? "") || !PURCHASE_OPTIONS.has(review.purchaseOption)
        || !SHA.test(review.artifactSha256 ?? "") || !PRODUCT.test(review.stripeProductId ?? "")
        || !PRICE.test(review.stripePriceId ?? "") || typeof review.stripeLivemode !== "boolean"
        || typeof review.reviewedAt !== "string" || !Number.isFinite(Date.parse(review.reviewedAt))) fail("The durable binding authority contains an invalid review.");
      const key = bindingKey(review.productId, review.purchaseOption);
      if (seen.has(key)) fail("The durable binding authority contains duplicate reviews.");
      seen.add(key);
      reviews.push(review);
    }
    const last = page.reviews.at(-1);
    if (page.nextProductId !== last.productId || page.nextPurchaseOption !== last.purchaseOption) fail("The durable binding authority cursor is invalid.");
    const nextCursor = bindingKey(page.nextProductId, page.nextPurchaseOption);
    if (nextCursor === previousCursor) fail("The durable binding authority cursor did not advance.");
    previousCursor = nextCursor;
    afterProductId = page.nextProductId;
    afterPurchaseOption = page.nextPurchaseOption;
    if (reviews.length > 100_000) fail("The durable binding authority exceeds the bounded catalog.");
  }
}

if (process.argv.length !== 2) fail("This review-only command does not accept write or activation arguments.");
if (process.env.VERCEL_ENV === "production" || process.env.WEBSITE_HOSTNAME) fail("Stripe evidence review is prohibited in a production runtime.");
if (process.env.OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN !== REVIEW_MODE) fail("Set OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN=review to run an evidence review.");
if (process.env.OBSERRA_ALLOW_LIVE_STRIPE_OUTSIDE_PRODUCTION !== "true") fail("Explicit non-production live Stripe approval is required.");
const key = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
if (!/^sk_live_[A-Za-z0-9_]+$/.test(key)) fail("A live Stripe secret key is required; value suppressed.");
const { catalog } = readCatalog({
  catalogPath: "data/marketplace/obserra-marketplace-card-catalog.json.gz",
  summaryPath: "data/marketplace/obserra-marketplace-card-catalog.summary.json",
});
const subjects = catalog.cards.filter((card) => card.product_type !== "collection" && card.product_type !== "bundle");
if (subjects.length !== 11390) fail("Catalog revision or subject set is invalid.");
const reviews = await durableReviews(catalog.catalog_revision);
const reviewByKey = new Map(reviews.map((review) => [bindingKey(review.productId, review.purchaseOption), review]));
if (reviewByKey.size !== reviews.length) fail("The durable binding authority contains duplicate reviews.");
const bindings = [];
const requiredOffersByProduct = new Map();
for (const card of subjects) {
  const expected = card.pricing.offers.filter((offer) => optionFor(offer) && offer.currency === "USD" && Number.isSafeInteger(offer.amount_minor) && offer.amount_minor > 0);
  if (expected.length !== card.pricing.offers.length || !SHA.test(card.artifact?.sha256 ?? "")) fail("Catalog pricing or artifact evidence is invalid.");
  requiredOffersByProduct.set(card.product_id, expected.length);
  for (const offer of expected) {
    const option = optionFor(offer);
    const review = reviewByKey.get(bindingKey(card.product_id, option));
    if (!review || review.artifactSha256 !== card.artifact.sha256 || review.stripeLivemode !== true) fail("Durable binding reviews are incomplete or artifact-mismatched.");
    bindings.push({ ...review, offer, bindingKey: offerKey(offer), priceId: review.stripePriceId });
  }
}
if (bindings.length !== reviews.length) fail("Durable binding reviews contain unexpected product entries.");
const stripe = new Stripe(key, { apiVersion: "2026-07-29.dahlia", typescript: true });
const account = await stripe.accounts.retrieve();
if (!/^acct_[A-Za-z0-9]+$/.test(account.id ?? "")) fail("Stripe account identity is invalid.");
const failures = [];
const verifiedRows = [];
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < bindings.length) {
    const binding = bindings[cursor++];
    try {
      const price = await stripe.prices.retrieve(binding.priceId, { expand: ["product"] });
      const product = typeof price.product === "string" ? null : price.product;
      const expectedRecurring = binding.purchaseOption === "recurring:month" ? "month" : binding.purchaseOption === "recurring:year" ? "year" : null;
      const valid = price.id === binding.stripePriceId && price.active && price.livemode === binding.stripeLivemode && price.currency === "usd" && price.unit_amount === binding.offer.amount_minor
        && (expectedRecurring ? price.type === "recurring" && price.recurring?.interval === expectedRecurring && price.recurring.interval_count === 1 : price.type === "one_time")
        && product && !product.deleted && product.id === binding.stripeProductId && PRODUCT.test(product.id) && product.active && product.metadata.obserraMarketplaceProduct === binding.productId && product.metadata.artifactSha256 === binding.artifactSha256 && product.metadata.catalogRevision === catalog.catalog_revision && product.metadata.commerceSource === SOURCE && product.metadata.bindingKey === binding.bindingKey;
      if (!valid) failures.push(digest(`${binding.productId}:${binding.bindingKey}:metadata`));
      else verifiedRows.push({ productId: binding.productId, purchaseOption: binding.purchaseOption, artifactSha256: binding.artifactSha256, stripeProductId: product.id, stripePriceId: price.id, stripeLivemode: true });
    } catch { failures.push(digest(`${binding.productId}:${binding.bindingKey}:retrieve`)); }
  }
}));
const verifiedByKey = new Map(verifiedRows.map((row) => [bindingKey(row.productId, row.purchaseOption), row]));
if (verifiedByKey.size !== verifiedRows.length) fail("Live Stripe verification returned duplicate rows.");
const orderedVerifiedRows = reviews.map((review) => verifiedByKey.get(bindingKey(review.productId, review.purchaseOption))).filter(Boolean);
const verifiedOffersByProduct = new Map();
for (const row of orderedVerifiedRows) verifiedOffersByProduct.set(row.productId, (verifiedOffersByProduct.get(row.productId) ?? 0) + 1);
const reviewedProductCards = subjects.filter((card) => verifiedOffersByProduct.get(card.product_id) === requiredOffersByProduct.get(card.product_id)).length;
const bindingSet = orderedVerifiedRows.map((row) => `${row.productId}\t${row.purchaseOption}\t${row.artifactSha256}\t${row.stripeProductId}\t${row.stripePriceId}\t${row.stripeLivemode}\n`).join("");
const verifiedAt = new Date().toISOString();
const bindingSetSha256 = digest(bindingSet);
const complete = failures.length === 0 && account.charges_enabled === true && reviewedProductCards === subjects.length && orderedVerifiedRows.length === bindings.length;
const bindingReceipt = complete ? await bindingRpc("obserra_ai_marketplace_finalize_v12_binding_authority", {
  p_catalog_revision: catalog.catalog_revision,
  p_required_product_cards: subjects.length,
  p_required_offer_bindings: bindings.length,
  p_binding_set_sha256: bindingSetSha256,
  p_verified_at: verifiedAt,
}) : null;
if (bindingReceipt && (bindingReceipt.contract !== "obserra-marketplace-v12-runtime-binding-receipt-v1" || bindingReceipt.revision !== catalog.catalog_revision || bindingReceipt.requiredProducts !== subjects.length || bindingReceipt.requiredOfferBindings !== bindings.length || bindingReceipt.reviewedProductCards !== reviewedProductCards || bindingReceipt.liveReviewedOfferBindings !== orderedVerifiedRows.length || bindingReceipt.bindingSetSha256 !== bindingSetSha256 || bindingReceipt.verifiedAt !== verifiedAt)) fail("The finalized durable binding receipt is invalid.");
const result = { contract: "obserra-marketplace-v12-stripe-evidence-review-v1", reviewOnly: true, activationChanged: false, bindingAuthority: "durable-supabase-review-v1", catalogRevision: catalog.catalog_revision, requiredProductCards: subjects.length, requiredOfferBindings: bindings.length, reviewedProductCards, stripeAccountId: account.id, stripeAccountChargesEnabled: account.charges_enabled === true, verifiedOfferBindings: orderedVerifiedRows.length, failureCount: failures.length, failureReferencesSha256: failures.sort(), verifiedAt, bindingReceipt, verified: complete && Boolean(bindingReceipt) };
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.verified ? 0 : 2;
