import "server-only";

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
