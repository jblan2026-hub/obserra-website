import "server-only";

import { getStripe } from "./stripe";
import { requireFloridaClassDProductionOwnerValidationPrincipal } from "./florida-class-d-production-owner-validation";

const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com";
const VERIFICATION_SESSION_PATTERN = /^vs_[A-Za-z0-9_]{8,255}$/;
const SURFACE = "fdacs_production_owner_validation";

function metadataFor(principal: Awaited<ReturnType<typeof requireFloridaClassDProductionOwnerValidationPrincipal>>) {
  return {
    obserra_surface: SURFACE,
    obserra_principal_id: principal.principalId,
    obserra_auth_session_id: principal.sessionId,
    obserra_release_sha: principal.releaseCommitSha,
  };
}

function sessionMatchesPrincipal(
  session: { livemode?: boolean; metadata?: Record<string, string> | null },
  principal: Awaited<ReturnType<typeof requireFloridaClassDProductionOwnerValidationPrincipal>>,
) {
  const metadata = session.metadata ?? {};
  return session.livemode === true
    && metadata.obserra_surface === SURFACE
    && metadata.obserra_principal_id === principal.principalId
    && metadata.obserra_auth_session_id === principal.sessionId
    && metadata.obserra_release_sha === principal.releaseCommitSha;
}

export async function createFloridaClassDProductionOwnerIdentityVerification() {
  const principal = await requireFloridaClassDProductionOwnerValidationPrincipal();
  const stripe = getStripe();
  const metadata = metadataFor(principal);
  const verification = await stripe.identity.verificationSessions.create(
    {
      type: "document",
      options: {
        document: {
          allowed_types: ["driving_license", "id_card", "passport"],
          require_matching_selfie: true,
        },
      },
      metadata,
      return_url: `${CANONICAL_PUBLIC_ORIGIN}/florida-security-training/owner-validation/identity?provider_return=1`,
    },
    {
      idempotencyKey: `fdacs-owner-idv-v1-${principal.principalId}-${principal.sessionId}-${principal.releaseCommitSha}`,
    },
  );

  if (
    !VERIFICATION_SESSION_PATTERN.test(verification.id)
    || verification.livemode !== true
    || typeof verification.url !== "string"
    || !verification.url.startsWith("https://")
    || !sessionMatchesPrincipal(verification, principal)
  ) {
    throw new Error("Stripe Identity returned an invalid production owner validation session.");
  }

  return {
    verificationSessionId: verification.id,
    verificationUrl: verification.url,
    status: verification.status,
    providerLivemode: true,
    trainingCreditEligible: false,
    enrollmentCreated: false,
    fdacsApprovalClaimed: false,
  } as const;
}

export async function getFloridaClassDProductionOwnerIdentityVerificationStatus(verificationSessionId: string) {
  const normalized = verificationSessionId.trim();
  if (!VERIFICATION_SESSION_PATTERN.test(normalized)) {
    throw new Error("A valid Stripe Identity verification session is required.");
  }

  const principal = await requireFloridaClassDProductionOwnerValidationPrincipal();
  const stripe = getStripe();
  const verification = await stripe.identity.verificationSessions.retrieve(normalized);
  if (!sessionMatchesPrincipal(verification, principal)) {
    throw new Error("Stripe Identity session is not bound to this owner validation session.");
  }

  const providerErrorCode = typeof verification.last_error?.code === "string"
    ? verification.last_error.code.slice(0, 120)
    : null;

  return {
    status: verification.status,
    verified: verification.status === "verified",
    providerLivemode: true,
    providerErrorCode,
    trainingCreditEligible: false,
    enrollmentCreated: false,
    fdacsApprovalClaimed: false,
  } as const;
}
