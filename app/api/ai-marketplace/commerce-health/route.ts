import { NextResponse } from "next/server";
import { applicationsCommerceConfigured, getApplicationsStripe } from "@/lib/applications-stripe";
import { ensureApplicationsRuntimeSecrets } from "@/lib/production-runtime-secrets";
import { aiMarketplaceLedgerHealth } from "@/lib/ai-marketplace-commerce";
import { marketplaceV12ProtectedDeliveryConfigured } from "@/lib/ai-marketplace-delivery";
import { marketplaceV12Summary } from "@/lib/marketplace-v12-catalog";
import { marketplaceV12BindingCoverage } from "@/lib/marketplace-v12-bindings";
import { marketplaceV12ActivationGate } from "@/lib/marketplace-v12-activation";
import { marketplaceV12ReleaseEvidence } from "@/lib/marketplace-v12-release-evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const coverage = marketplaceV12BindingCoverage();
  const catalog = marketplaceV12Summary();
  try {
    await ensureApplicationsRuntimeSecrets();
    const configured = applicationsCommerceConfigured();
    const stripe = configured ? getApplicationsStripe() : null;
    const account = stripe ? await stripe.accounts.retrieve(null) : null;
    const ledger = await aiMarketplaceLedgerHealth();
    const deliveryConfigured = marketplaceV12ProtectedDeliveryConfigured();
    const approvedRevision = process.env.OBSERRA_AI_MARKETPLACE_V12_ACTIVATION_APPROVED_REVISION?.trim() || null;
    // Runtime recomputes exact binding/delivery digests and verifies the
    // controlled verifier signature before accepting its Stripe snapshot.
    const releaseEvidence = marketplaceV12ReleaseEvidence({ revision: coverage.revision, requiredSubjects: coverage.requiredProductCards, stripeAccountId: account?.id });
    const pricesVerified = coverage.stripeVerified
      && releaseEvidence.verified
      && approvedRevision === coverage.revision
      && account?.charges_enabled === true
      && stripe !== null;
    const activation = marketplaceV12ActivationGate({
      coverage,
      approvedRevision,
      liveStripe: configured,
      chargesEnabled: account?.charges_enabled === true,
      pricesVerified,
      durableLedger: ledger.entitlementAuthority,
      protectedDeliveryConfigured: deliveryConfigured,
    });
    return NextResponse.json({
      contract: "ai-marketplace-commerce-health-v1",
      operational: activation.operational,
      productBindings: coverage,
      catalog: { revision: catalog.revision, totalCards: catalog.total_cards, productCards: coverage.requiredProductCards, publicationState: catalog.publication_state, priceBindingsVerified: pricesVerified },
      durableLedger: ledger.entitlementAuthority,
      protectedDeliveryConfigured: deliveryConfigured,
      paymentProvider: configured ? "stripe" : "unavailable",
      chargesEnabled: account?.charges_enabled === true,
      activationBlocked: activation.activationBlocked,
    }, { status: activation.operational ? 200 : 503, headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({
      contract: "ai-marketplace-commerce-health-v1",
      operational: false,
      productBindings: coverage,
      catalog: { revision: catalog.revision, totalCards: catalog.total_cards, productCards: coverage.requiredProductCards, publicationState: catalog.publication_state, priceBindingsVerified: false },
      durableLedger: "unavailable",
      protectedDeliveryConfigured: false,
      paymentProvider: "unavailable",
      chargesEnabled: false,
      activationBlocked: true,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
