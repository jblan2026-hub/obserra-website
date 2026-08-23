import "server-only";

import { applicationsCommerceConfigured, applicationsCommerceLivemode, getApplicationsStripe } from "./applications-stripe";
import { aiMarketplaceLedgerHealth } from "./ai-marketplace-commerce";
import { marketplaceV12ProtectedDeliveryConfigured, marketplaceV12Release } from "./ai-marketplace-delivery";
import { marketplaceV12ActivationGate } from "./marketplace-v12-activation";
import { marketplaceV12BindingCoverage } from "./marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Summary, type MarketplaceV12Card } from "./marketplace-v12-catalog";
import { marketplaceV12ReleaseEvidence } from "./marketplace-v12-release-evidence";
import { ensureApplicationsRuntimeSecrets } from "./production-runtime-secrets";

export type MarketplaceV12RuntimeCommerce = Readonly<{
  operational: boolean;
  reason: "catalog_unpublished" | "configuration_unavailable" | "release_unavailable" | "commerce_unavailable" | "ready";
  checkoutEnabled: boolean;
  installEnabled: false;
}>;

/**
 * This is the sole runtime activation conjunction shared by page rendering,
 * checkout, and health reporting. It does not make a provider mutation.
 */
export async function marketplaceV12RuntimeCommerce(): Promise<MarketplaceV12RuntimeCommerce> {
  const coverage = marketplaceV12BindingCoverage();
  try {
    await ensureApplicationsRuntimeSecrets();
    const configured = applicationsCommerceConfigured();
    const live = applicationsCommerceLivemode();
    if (!configured || live !== true) return { operational: false, reason: "configuration_unavailable", checkoutEnabled: false, installEnabled: false };
    const stripe = getApplicationsStripe();
    const account = await stripe.accounts.retrieve(null);
    const ledger = await aiMarketplaceLedgerHealth();
    const evidence = marketplaceV12ReleaseEvidence({ revision: coverage.revision, requiredSubjects: coverage.requiredProductCards, stripeAccountId: account.id });
    const pricesVerified = coverage.stripeVerified && evidence.verified && account.charges_enabled === true;
    const activation = marketplaceV12ActivationGate({
      coverage,
      approvedRevision: process.env.OBSERRA_AI_MARKETPLACE_V12_ACTIVATION_APPROVED_REVISION?.trim() || null,
      liveStripe: configured,
      chargesEnabled: account.charges_enabled === true,
      pricesVerified,
      durableLedger: ledger.entitlementAuthority,
      protectedDeliveryConfigured: marketplaceV12ProtectedDeliveryConfigured(),
    });
    return activation.operational
      ? { operational: true, reason: "ready", checkoutEnabled: true, installEnabled: false }
      : { operational: false, reason: "commerce_unavailable", checkoutEnabled: false, installEnabled: false };
  } catch {
    return { operational: false, reason: "configuration_unavailable", checkoutEnabled: false, installEnabled: false };
  }
}

export async function marketplaceV12ProductCommerce(product: MarketplaceV12Card): Promise<MarketplaceV12RuntimeCommerce> {
  const subject = marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  if (!subject || product.publication_state !== "available") return { operational: false, reason: "catalog_unpublished", checkoutEnabled: false, installEnabled: false };
  const release = marketplaceV12Release(product.product_id, marketplaceV12Summary().revision, subject.artifactSha256);
  if (!release) return { operational: false, reason: "release_unavailable", checkoutEnabled: false, installEnabled: false };
  return marketplaceV12RuntimeCommerce();
}
