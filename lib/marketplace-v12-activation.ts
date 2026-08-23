import "server-only";

import type Stripe from "stripe";
import { marketplaceV12Bindings, marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "./marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "./marketplace-v12-catalog";

const SOURCE = "obserra-ai-marketplace-v12";

type Coverage = Readonly<{ revision: string; structurallyComplete: boolean }>;

export type MarketplaceV12ActivationFacts = Readonly<{
  coverage: Coverage;
  approvedRevision: string | null;
  liveStripe: boolean;
  chargesEnabled: boolean;
  pricesVerified: boolean;
  durableLedger: string | null;
  protectedDeliveryConfigured: boolean;
}>;

/**
 * This is deliberately a conjunction of independently observed facts.  In
 * particular, a declared binding count or a syntactically valid environment
 * manifest is never sufficient to enable commerce.
 */
export function marketplaceV12ActivationGate(facts: MarketplaceV12ActivationFacts) {
  const revisionApproved = facts.approvedRevision === facts.coverage.revision;
  const operational = facts.coverage.structurallyComplete
    && revisionApproved
    && facts.liveStripe
    && facts.chargesEnabled
    && facts.pricesVerified
    && facts.durableLedger === "ai-marketplace-commerce-ledger-v1"
    && facts.protectedDeliveryConfigured;
  return {
    operational,
    revisionApproved,
    activationBlocked: !operational,
  };
}

function purchaseOption(key: string): MarketplaceV12PurchaseOption | null {
  return key.startsWith("recurring:month:") ? "recurring:month"
    : key.startsWith("recurring:year:") ? "recurring:year"
      : key.startsWith("one_time:once:") ? "one_time:once"
        : key.startsWith("team_license:once:") ? "team_license:once"
          : key.startsWith("activation:once:") ? "activation:once" : null;
}

function exactBindingKey(product: NonNullable<ReturnType<typeof marketplaceV12Product>>, option: MarketplaceV12PurchaseOption) {
  const offer = marketplaceV12Offer(product, option);
  return offer ? `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}` : null;
}

function validPrice(price: Stripe.Price, productId: string, artifactSha256: string, revision: string, key: string, live: boolean) {
  const option = purchaseOption(key);
  const product = typeof price.product === "string" ? null : price.product;
  return Boolean(option && price.active && price.livemode === live && price.currency === "usd"
    && (option === "recurring:month" ? price.type === "recurring" && price.recurring?.interval === "month" && price.recurring.interval_count === 1 : option === "recurring:year" ? price.type === "recurring" && price.recurring?.interval === "year" && price.recurring.interval_count === 1 : price.type === "one_time")
    && product && !product.deleted && product.active
    && price.metadata.obserraMarketplaceProduct === productId
    && price.metadata.artifactSha256 === artifactSha256
    && price.metadata.catalogRevision === revision
    && price.metadata.commerceSource === SOURCE
    && price.metadata.bindingKey === key);
}

/**
 * Resolves every declared price from Stripe and validates immutable product,
 * artifact, catalog-revision and offer metadata.  It is intentionally bounded
 * and fail-closed; callers must treat any error or incomplete run as false.
 */
export async function verifyMarketplaceV12StripeBindings(stripe: Pick<Stripe, "prices">, live: boolean) {
  if (!live) return false;
  const bindings = marketplaceV12Bindings();
  if (!bindings) return false;
  const revision = marketplaceV12Summary().revision;
  const seenPriceIds = new Set<string>();
  const checks: Array<() => Promise<boolean>> = [];
  for (const subject of marketplaceV12CommerceSubjects()) {
    const product = marketplaceV12Product(subject.productId);
    const binding = bindings[subject.productId];
    if (!product || !binding || binding.artifactSha256 !== subject.artifactSha256 || !binding.prices || Array.isArray(binding.prices)) return false;
    for (const [key, priceId] of Object.entries(binding.prices)) {
      const option = purchaseOption(key);
      if (!option || exactBindingKey(product, option) !== key || !/^price_[A-Za-z0-9]+$/.test(priceId) || seenPriceIds.has(priceId)) return false;
      seenPriceIds.add(priceId);
      checks.push(async () => validPrice(await stripe.prices.retrieve(priceId, { expand: ["product"] }), subject.productId, subject.artifactSha256, revision, key, live));
    }
  }
  const workers = Array.from({ length: Math.min(8, checks.length) }, async () => {
    while (checks.length) {
      const check = checks.pop();
      if (!check || !(await check())) throw new Error("Marketplace Stripe binding evidence failed");
    }
  });
  try { await Promise.all(workers); return true; } catch { return false; }
}
