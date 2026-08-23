import { NextResponse } from "next/server";
import { applicationsCommerceConfigured, getApplicationsStripe } from "@/lib/applications-stripe";
import {
  ensureMarketplaceV12RuntimeSecrets,
  productionRuntimeSecretsEvidence,
  type ProductionRuntimeSecretsEvidence,
} from "@/lib/production-runtime-secrets";
import { aiMarketplaceLedgerHealth } from "@/lib/ai-marketplace-commerce";
import { marketplaceV12ProtectedDeliveryConfigured } from "@/lib/ai-marketplace-delivery";
import { marketplaceV12Summary } from "@/lib/marketplace-v12-catalog";
import { marketplaceV12BindingCoverage } from "@/lib/marketplace-v12-bindings";
import { marketplaceV12ActivationGate } from "@/lib/marketplace-v12-activation";
import { marketplaceV12ReleaseEvidence } from "@/lib/marketplace-v12-release-evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CommerceHealthStage = "runtime-secrets" | "catalog-bindings" | "payment-provider" | "commerce-authority" | "activation";

const FAILURE_CODE: Record<Exclude<CommerceHealthStage, "runtime-secrets">, string> = {
  "catalog-bindings": "CATALOG_BINDINGS_UNAVAILABLE",
  "payment-provider": "PAYMENT_PROVIDER_UNAVAILABLE",
  "commerce-authority": "COMMERCE_AUTHORITY_UNAVAILABLE",
  activation: "ACTIVATION_EVALUATION_FAILED",
};

export async function GET() {
  const catalog = marketplaceV12Summary();
  let stage: CommerceHealthStage = "runtime-secrets";
  let runtimeSecrets: ProductionRuntimeSecretsEvidence | null = null;
  let coverage: Awaited<ReturnType<typeof marketplaceV12BindingCoverage>> | null = null;
  let catalogBindingsReady = false;
  let paymentProviderConfigured: boolean | null = null;
  let paymentProviderReady = false;
  let commerceAuthorityReady = false;
  try {
    runtimeSecrets = await ensureMarketplaceV12RuntimeSecrets();

    // Binding coverage depends on values hydrated above. Computing it before
    // production hydration turns a healthy Key Vault path into a stale failure.
    stage = "catalog-bindings";
    coverage = await marketplaceV12BindingCoverage();
    catalogBindingsReady = true;

    stage = "payment-provider";
    const configured = applicationsCommerceConfigured();
    paymentProviderConfigured = configured;
    const stripe = configured ? getApplicationsStripe() : null;
    const account = stripe ? await stripe.accounts.retrieve(null) : null;
    paymentProviderReady = configured && account !== null;

    stage = "commerce-authority";
    const ledger = await aiMarketplaceLedgerHealth("marketplace-v12");
    commerceAuthorityReady = true;

    stage = "activation";
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
      dependencies: {
        runtimeSecrets,
        catalogBindings: { state: "ready" },
        paymentProvider: { state: configured ? "ready" : "not-configured" },
        commerceAuthority: { state: "ready" },
        protectedDelivery: { state: deliveryConfigured ? "ready" : "not-configured" },
        activation: { state: activation.operational ? "ready" : "blocked" },
      },
      failure: activation.operational ? null : { stage: "activation", code: "ACTIVATION_REQUIREMENTS_UNMET", retryable: false },
    }, { status: activation.operational ? 200 : 503, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const runtimeEvidence = runtimeSecrets ?? productionRuntimeSecretsEvidence(error);
    const failure = stage === "runtime-secrets"
      ? {
        stage: runtimeEvidence.stage,
        code: runtimeEvidence.state === "failed" ? runtimeEvidence.code : "UNEXPECTED_RUNTIME_FAILURE",
        retryable: runtimeEvidence.state === "failed" ? runtimeEvidence.retryable : true,
      }
      : { stage, code: FAILURE_CODE[stage], retryable: stage !== "catalog-bindings" };
    return NextResponse.json({
      contract: "ai-marketplace-commerce-health-v1",
      operational: false,
      productBindings: coverage,
      catalog: { revision: catalog.revision, totalCards: catalog.total_cards, productCards: coverage?.requiredProductCards ?? 0, publicationState: catalog.publication_state, priceBindingsVerified: false },
      durableLedger: "unavailable",
      protectedDeliveryConfigured: false,
      paymentProvider: "unavailable",
      chargesEnabled: false,
      activationBlocked: true,
      dependencies: {
        runtimeSecrets: runtimeEvidence,
        catalogBindings: { state: catalogBindingsReady ? "ready" : stage === "catalog-bindings" ? "failed" : "blocked" },
        paymentProvider: {
          state: stage === "payment-provider"
            ? "failed"
            : paymentProviderConfigured === null
              ? "blocked"
              : paymentProviderReady
                ? "ready"
                : "not-configured",
        },
        commerceAuthority: { state: stage === "commerce-authority" ? "failed" : commerceAuthorityReady ? "ready" : "blocked" },
        protectedDelivery: { state: "blocked" },
        activation: { state: stage === "activation" ? "failed" : "blocked" },
      },
      failure,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
