export type ProtectedAuthReadinessEvidence = {
  runtimeReady: boolean;
  claimsVerified: boolean;
  jwksVerified: boolean;
  subjectFresh: boolean;
  identityLinkActive: boolean;
  sessionActive: boolean;
  roleFresh: boolean;
  assuranceLevel: "aal1" | "aal2" | null;
  requiredAssuranceLevel: "aal1" | "aal2";
};

export type ProtectedAuthReadiness = {
  ready: boolean;
  reason:
    | "protected_auth_ready"
    | "configuration_unavailable"
    | "claims_unverified"
    | "jwks_unavailable"
    | "subject_stale"
    | "identity_link_inactive"
    | "session_revoked"
    | "role_stale"
    | "assurance_insufficient";
};

const UNAVAILABLE_EVIDENCE: ProtectedAuthReadinessEvidence = {
  runtimeReady: false,
  claimsVerified: false,
  jwksVerified: false,
  subjectFresh: false,
  identityLinkActive: false,
  sessionActive: false,
  roleFresh: false,
  assuranceLevel: null,
  requiredAssuranceLevel: "aal2",
};

export function evaluateProtectedAuthReadiness(
  evidence: ProtectedAuthReadinessEvidence,
): ProtectedAuthReadiness {
  if (!evidence.runtimeReady) return { ready: false, reason: "configuration_unavailable" };
  if (!evidence.claimsVerified) return { ready: false, reason: "claims_unverified" };
  if (!evidence.jwksVerified) return { ready: false, reason: "jwks_unavailable" };
  if (!evidence.subjectFresh) return { ready: false, reason: "subject_stale" };
  if (!evidence.identityLinkActive) return { ready: false, reason: "identity_link_inactive" };
  if (!evidence.sessionActive) return { ready: false, reason: "session_revoked" };
  if (!evidence.roleFresh) return { ready: false, reason: "role_stale" };

  const assuranceReady = evidence.requiredAssuranceLevel === "aal1"
    ? evidence.assuranceLevel === "aal1" || evidence.assuranceLevel === "aal2"
    : evidence.assuranceLevel === "aal2";
  if (!assuranceReady) return { ready: false, reason: "assurance_insufficient" };
  return { ready: true, reason: "protected_auth_ready" };
}

export async function getProtectedSupabaseAuthReadiness(
  collectEvidence?: () => Promise<ProtectedAuthReadinessEvidence>,
) {
  if (!collectEvidence) return evaluateProtectedAuthReadiness(UNAVAILABLE_EVIDENCE);
  try {
    return evaluateProtectedAuthReadiness(await collectEvidence());
  } catch {
    return evaluateProtectedAuthReadiness(UNAVAILABLE_EVIDENCE);
  }
}
