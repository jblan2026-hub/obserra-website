import "server-only";

import {
  marketplaceV12BindingAuthorityReceipt,
  marketplaceV12BindingEvidenceKeyMatches,
  marketplaceV12ProductBindingAuthority,
  type MarketplaceV12BindingAuthorityReceipt,
} from "./marketplace-v12-binding-import";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary, type MarketplaceV12Card } from "./marketplace-v12-catalog";
import { marketplaceV12ReleaseEvidence } from "./marketplace-v12-release-evidence";

const RECEIPT_CONTRACT = "obserra-marketplace-v12-runtime-binding-receipt-v1";
const SHA256 = /^[a-f0-9]{64}$/;
const RECEIPT_FIELDS = ["bindingSetSha256", "contract", "liveReviewedOfferBindings", "requiredOfferBindings", "requiredProducts", "reviewedProductCards", "revision", "verifiedAt"];

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

let expectedOfferBindings: number | null = null;
function requiredOfferBindingCount() {
  if (expectedOfferBindings !== null) return expectedOfferBindings;
  expectedOfferBindings = marketplaceV12CommerceSubjects().reduce((total, subject) => {
    const product = marketplaceV12Product(subject.productId);
    return total + (product ? marketplaceV12PurchaseOptions(product).length : 0);
  }, 0);
  return expectedOfferBindings;
}

function runtimeBindingReceipt(): MarketplaceV12BindingAuthorityReceipt | null {
  try {
    const value = JSON.parse(process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON ?? "") as Record<string, unknown>;
    const subjects = marketplaceV12CommerceSubjects();
    const offers = requiredOfferBindingCount();
    if (Object.keys(value).sort().join("\n") !== RECEIPT_FIELDS.join("\n")
      || value.contract !== RECEIPT_CONTRACT
      || value.revision !== marketplaceV12Summary().revision
      || value.requiredProducts !== subjects.length
      || value.reviewedProductCards !== subjects.length
      || value.requiredOfferBindings !== offers
      || value.liveReviewedOfferBindings !== offers
      || typeof value.bindingSetSha256 !== "string" || !SHA256.test(value.bindingSetSha256)
      || typeof value.verifiedAt !== "string" || !Number.isFinite(Date.parse(value.verifiedAt))
      || Date.parse(value.verifiedAt) > Date.now() + 5 * 60 * 1000) return null;
    return value as MarketplaceV12BindingAuthorityReceipt;
  } catch {
    return null;
  }
}

function sameReceipt(left: MarketplaceV12BindingAuthorityReceipt, right: MarketplaceV12BindingAuthorityReceipt) {
  return left.contract === right.contract
    && left.revision === right.revision
    && left.requiredProducts === right.requiredProducts
    && left.requiredOfferBindings === right.requiredOfferBindings
    && left.reviewedProductCards === right.reviewedProductCards
    && left.liveReviewedOfferBindings === right.liveReviewedOfferBindings
    && left.bindingSetSha256 === right.bindingSetSha256
    && Date.parse(left.verifiedAt) === Date.parse(right.verifiedAt);
}

export async function boundMarketplaceV12Price(product: MarketplaceV12Card, option: MarketplaceV12PurchaseOption) {
  const subject = marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const expectedOptions = marketplaceV12PurchaseOptions(product);
  const receipt = runtimeBindingReceipt();
  if (!subject || !receipt || expectedOptions.length !== product.pricing.offers.length || !expectedOptions.some((entry) => entry.option === option)) return null;
  try {
    const authority = await marketplaceV12ProductBindingAuthority(receipt.revision, product.product_id);
    if (authority.bindingSetSha256 !== receipt.bindingSetSha256 || Date.parse(authority.verifiedAt) !== Date.parse(receipt.verifiedAt)
      || authority.bindings.length !== expectedOptions.length) return null;
    const options = new Set<MarketplaceV12PurchaseOption>();
    for (const binding of authority.bindings) {
      if (!expectedOptions.some((entry) => entry.option === binding.purchaseOption) || options.has(binding.purchaseOption as MarketplaceV12PurchaseOption)
        || binding.artifactSha256 !== subject.artifactSha256 || binding.stripeLivemode !== true
        || Date.parse(binding.reviewedAt) > Date.parse(receipt.verifiedAt)
        || !marketplaceV12BindingEvidenceKeyMatches({
          catalogRevision: receipt.revision,
          productId: product.product_id,
          purchaseOption: binding.purchaseOption,
          artifactSha256: binding.artifactSha256,
          stripeProductId: binding.stripeProductId,
          stripePriceId: binding.stripePriceId,
          stripeLivemode: binding.stripeLivemode,
          evidenceKey: binding.evidenceKey,
        })) return null;
      options.add(binding.purchaseOption as MarketplaceV12PurchaseOption);
    }
    return authority.bindings.find((binding) => binding.purchaseOption === option)?.stripePriceId ?? null;
  } catch {
    return null;
  }
}

export async function marketplaceV12BindingCoverage() {
  const subjects = marketplaceV12CommerceSubjects();
  const receipt = runtimeBindingReceipt();
  let authority: MarketplaceV12BindingAuthorityReceipt | null = null;
  if (receipt) {
    try { authority = await marketplaceV12BindingAuthorityReceipt(receipt.revision); } catch { authority = null; }
  }
  const structurallyComplete = Boolean(receipt && authority && sameReceipt(receipt, authority));
  const releaseEvidence = marketplaceV12ReleaseEvidence({ revision: marketplaceV12Summary().revision, requiredSubjects: subjects.length });
  const declaredBoundCards = receipt?.reviewedProductCards ?? 0;
  const missingProductCards = Math.max(0, subjects.length - declaredBoundCards);

  return {
    revision: marketplaceV12Summary().revision,
    requiredProductCards: subjects.length,
    requiredOfferBindings: requiredOfferBindingCount(),
    declaredBoundCards,
    reviewedOfferBindings: receipt?.liveReviewedOfferBindings ?? 0,
    bindingSetSha256: receipt?.bindingSetSha256 ?? null,
    manifestEntries: declaredBoundCards,
    missingProductCards,
    unexpectedProductCards: declaredBoundCards > subjects.length ? declaredBoundCards - subjects.length : 0,
    invalidBindings: structurallyComplete ? 0 : 1,
    structurallyComplete,
    stripeVerified: structurallyComplete && releaseEvidence.verified,
    complete: structurallyComplete && releaseEvidence.verified,
  };
}
