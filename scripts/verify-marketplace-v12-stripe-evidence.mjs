import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import Stripe from "stripe";

const REVIEW_MODE = "review";
const SOURCE = "obserra-ai-marketplace-v12";
const PRICE = /^price_[A-Za-z0-9]+$/;
const SHA = /^[a-f0-9]{64}$/;

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

if (process.argv.length !== 2) fail("This review-only command does not accept write or activation arguments.");
if (process.env.VERCEL_ENV === "production" || process.env.WEBSITE_HOSTNAME) fail("Stripe evidence review is prohibited in a production runtime.");
if (process.env.OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN !== REVIEW_MODE) fail("Set OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN=review to run an evidence review.");
if (process.env.OBSERRA_ALLOW_LIVE_STRIPE_OUTSIDE_PRODUCTION !== "true") fail("Explicit non-production live Stripe approval is required.");
const key = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
if (!/^sk_live_[A-Za-z0-9_]+$/.test(key)) fail("A live Stripe secret key is required; value suppressed.");
const rawManifest = process.env.OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON?.trim() ?? "";
if (!rawManifest) fail("The v1.2 binding manifest is unavailable.");
let manifest;
try { manifest = JSON.parse(rawManifest); } catch { fail("The v1.2 binding manifest is invalid."); }
const catalog = JSON.parse(gunzipSync(readFileSync("data/marketplace/obserra-marketplace-card-catalog.json.gz")).toString("utf8"));
const subjects = catalog.cards.filter((card) => card.product_type !== "collection" && card.product_type !== "bundle");
if (subjects.length !== 11390 || manifest?.revision !== catalog.catalog_revision || !manifest.products || Array.isArray(manifest.products)) fail("Catalog revision or subject set is invalid.");
const bindings = [];
for (const card of subjects) {
  const binding = manifest.products[card.product_id];
  const expected = card.pricing.offers.filter((offer) => optionFor(offer) && offer.currency === "USD" && Number.isSafeInteger(offer.amount_minor) && offer.amount_minor > 0);
  if (!binding || binding.artifactSha256 !== card.artifact?.sha256 || !SHA.test(binding.artifactSha256 ?? "") || !binding.prices || Array.isArray(binding.prices) || Object.keys(binding.prices).length !== expected.length) fail("Binding manifest is incomplete or artifact-mismatched.");
  for (const offer of expected) {
    const bindingKey = offerKey(offer), priceId = binding.prices[bindingKey];
    if (!PRICE.test(priceId ?? "")) fail("Binding manifest contains an invalid Price reference.");
    bindings.push({ productId: card.product_id, artifactSha256: card.artifact.sha256, offer, option: optionFor(offer), bindingKey, priceId });
  }
}
if (Object.keys(manifest.products).length !== subjects.length) fail("Binding manifest contains unexpected product entries.");
const stripe = new Stripe(key, { apiVersion: "2026-07-29.dahlia", typescript: true });
const account = await stripe.accounts.retrieve();
const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < bindings.length) {
    const binding = bindings[cursor++];
    try {
      const price = await stripe.prices.retrieve(binding.priceId, { expand: ["product"] });
      const product = typeof price.product === "string" ? null : price.product;
      const expectedRecurring = binding.option === "recurring:month" ? "month" : binding.option === "recurring:year" ? "year" : null;
      const valid = price.active && price.livemode && price.currency === "usd" && price.unit_amount === binding.offer.amount_minor
        && (expectedRecurring ? price.type === "recurring" && price.recurring?.interval === expectedRecurring && price.recurring.interval_count === 1 : price.type === "one_time")
        && product && !product.deleted && product.active && product.metadata.obserraMarketplaceProduct === binding.productId && product.metadata.artifactSha256 === binding.artifactSha256 && product.metadata.catalogRevision === catalog.catalog_revision && product.metadata.commerceSource === SOURCE && product.metadata.bindingKey === binding.bindingKey;
      if (!valid) failures.push(digest(`${binding.productId}:${binding.bindingKey}:metadata`));
    } catch { failures.push(digest(`${binding.productId}:${binding.bindingKey}:retrieve`)); }
  }
}));
const result = { contract: "obserra-marketplace-v12-stripe-evidence-review-v1", reviewOnly: true, activationChanged: false, catalogRevision: catalog.catalog_revision, requiredProductCards: subjects.length, requiredOfferBindings: bindings.length, manifestSha256: digest(rawManifest), stripeAccountChargesEnabled: account.charges_enabled === true, verifiedOfferBindings: bindings.length - failures.length, failureCount: failures.length, failureReferencesSha256: failures.sort(), verified: failures.length === 0 && account.charges_enabled === true };
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.verified ? 0 : 2;
