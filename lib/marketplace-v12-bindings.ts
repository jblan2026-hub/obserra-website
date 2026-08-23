import "server-only";

import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary, type MarketplaceV12Card } from "./marketplace-v12-catalog";
import { marketplaceV12ReleaseEvidence } from "./marketplace-v12-release-evidence";

type Binding = Readonly<{ prices: Record<string, string>; artifactSha256: string }>;
type BindingManifest = Readonly<{ revision?: string; products?: Record<string, Binding> }>;

const PRICE_ID = /^price_[A-Za-z0-9]+$/;
const SHA256 = /^[a-f0-9]{64}$/;

export type MarketplaceV12PurchaseOption = "recurring:month" | "recurring:year" | "one_time:once" | "team_license:once" | "activation:once";

function offerKey(offer: MarketplaceV12Card["pricing"]["offers"][number]) {
  return `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`;
}

function purchaseOption(offer: MarketplaceV12Card["pricing"]["offers"][number]): MarketplaceV12PurchaseOption | null {
  if (offer.kind === "recurring" && offer.cadence === "month") return "recurring:month";
  if (offer.kind === "recurring" && offer.cadence === "year") return "recurring:year";
  if (offer.kind === "one_time") return "one_time:once";
  if (offer.kind === "team_license") return "team_license:once";
  if (offer.kind === "activation") return "activation:once";
  return null;
}

export function marketplaceV12PurchaseOptions(product: MarketplaceV12Card) {
  const options = product.pricing.offers.map((offer) => ({ offer, option: purchaseOption(offer) })).filter((entry): entry is { offer: MarketplaceV12Card["pricing"]["offers"][number]; option: MarketplaceV12PurchaseOption } => Boolean(entry.option) && entry.offer.currency === "USD" && Number.isSafeInteger(entry.offer.amount_minor) && entry.offer.amount_minor > 0);
  if (options.length !== product.pricing.offers.length || new Set(options.map((entry) => entry.option)).size !== options.length) return [];
  return options.map(({ offer, option }) => ({ option, amountMinor: offer.amount_minor, kind: offer.kind, cadence: offer.cadence ?? null, bindingKey: offerKey(offer) }));
}

export function marketplaceV12Offer(product: MarketplaceV12Card, option: MarketplaceV12PurchaseOption) {
  const matches = marketplaceV12PurchaseOptions(product).filter((entry) => entry.option === option).map((entry) => product.pricing.offers.find((offer) => offerKey(offer) === entry.bindingKey)!);
  return matches.length === 1 ? matches[0] : null;
}

function requiredOfferKeys(product: MarketplaceV12Card) {
  return product.pricing.offers.filter((offer) => offer.currency === "USD" && Number.isSafeInteger(offer.amount_minor) && offer.amount_minor > 0).map(offerKey);
}

/**
 * This is an evidence manifest, not a checkout configuration. A syntactically
 * complete manifest still requires an out-of-band Stripe verification run
 * before the catalog may be published or checkout enabled.
 */
export function marketplaceV12Bindings() {
  try {
    const value = JSON.parse(process.env.OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON ?? "") as BindingManifest;
    if (value.revision !== marketplaceV12Summary().revision || !value.products || Array.isArray(value.products)) return null;
    return value.products;
  } catch {
    return null;
  }
}

export function boundMarketplaceV12Price(product: MarketplaceV12Card, option: MarketplaceV12PurchaseOption) {
  const subject = marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const offer = marketplaceV12Offer(product, option);
  const binding = marketplaceV12Bindings()?.[product.product_id];
  const priceId = offer && binding?.prices?.[offerKey(offer)];
  return subject && binding?.artifactSha256 === subject.artifactSha256 && typeof priceId === "string" && PRICE_ID.test(priceId) ? priceId : null;
}

export function marketplaceV12BindingCoverage() {
  const subjects = marketplaceV12CommerceSubjects();
  const bindings = marketplaceV12Bindings();
  const declared = Number(process.env.OBSERRA_AI_MARKETPLACE_V12_VERIFIED_BINDING_COUNT ?? 0);
  const declaredBoundCards = Number.isSafeInteger(declared) && declared >= 0 ? declared : 0;
  const boundIds = bindings ? Object.keys(bindings) : [];
  const subjectById = new Map(subjects.map((subject) => [subject.productId, subject]));
  const unexpectedProductIds = boundIds.filter((productId) => !subjectById.has(productId));
  const invalidProductIds = boundIds.filter((productId) => {
    const binding = bindings?.[productId];
    const subject = subjectById.get(productId);
    const product = marketplaceV12Product(productId);
    const expectedOfferKeys = product ? requiredOfferKeys(product) : [];
    const boundOfferKeys = binding?.prices && !Array.isArray(binding.prices) ? Object.keys(binding.prices) : [];
    return !binding || !subject || !product || !SHA256.test(binding.artifactSha256) || binding.artifactSha256 !== subject.artifactSha256
      || expectedOfferKeys.length !== boundOfferKeys.length
      || expectedOfferKeys.some((key) => !PRICE_ID.test(binding.prices?.[key] ?? ""))
      || boundOfferKeys.some((key) => !expectedOfferKeys.includes(key));
  });
  const missingProductIds = subjects.filter((subject) => !bindings?.[subject.productId]).map((subject) => subject.productId);
  const structurallyComplete = Boolean(bindings)
    && declaredBoundCards === subjects.length
    && boundIds.length === subjects.length
    && missingProductIds.length === 0
    && unexpectedProductIds.length === 0
    && invalidProductIds.length === 0;
  const releaseEvidence = marketplaceV12ReleaseEvidence({ revision: marketplaceV12Summary().revision, requiredSubjects: subjects.length });

  return {
    revision: marketplaceV12Summary().revision,
    requiredProductCards: subjects.length,
    declaredBoundCards,
    manifestEntries: boundIds.length,
    missingProductCards: missingProductIds.length,
    unexpectedProductCards: unexpectedProductIds.length,
    invalidBindings: invalidProductIds.length,
    structurallyComplete,
    // This requires a separately HMAC-signed full verification snapshot whose
    // canonical digests are recomputed above; a claimed count cannot satisfy it.
    stripeVerified: structurallyComplete && releaseEvidence.verified,
    complete: structurallyComplete && releaseEvidence.verified,
  };
}
