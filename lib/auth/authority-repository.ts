import "server-only";

import crypto from "node:crypto";
import { safeSupabaseIdentity, type SafeSupabaseIdentity } from "./identity";
import { verifySupabaseJwksKey } from "./jwks-readiness";
import {
  getProtectedSupabaseAuthReadiness,
  type ProtectedAuthReadiness,
  type ProtectedAuthReadinessEvidence,
} from "./protected-readiness";
import { createSupabaseServerClient } from "../supabase/server";
import { evaluateInternalOwnerMfaEnrollment } from "./identity-governance";

type AuthorityRow = {
  provider_subject: string;
  principal_id: string;
  session_id: string;
  roles: string[];
  role_version: number;
  subject_active: boolean;
  link_active: boolean;
  session_active: boolean;
  internal_identity: boolean;
  role_fresh: boolean;
  email_verified: boolean;
  aal2: boolean;
  authorized: boolean;
  reason: string;
};

export type InternalOwnerAuthority = {
  status: "ready" | "denied" | "signed_out" | "unavailable";
  reason: string;
  identity: SafeSupabaseIdentity["identity"];
  internalIdentityAuthorized: boolean;
  mfaEnrollmentReady: boolean;
  emailVerified: boolean;
  protectedReadiness: ProtectedAuthReadiness;
  correlationId: string;
};

export type OwnerActivationAuditResult = {
  accepted: boolean;
  reason: string;
  correlationId: string;
};

type AuthorityQuery = (
  correlationId: string,
) => Promise<{ data: unknown; error: unknown }>;

export type VerifiedProxyAuthorityContext = {
  identity: NonNullable<SafeSupabaseIdentity["identity"]>;
  jwtKeyId: string | null;
  jwtAlgorithm: "ES256" | "RS256" | null;
  queryCurrentAuthority: AuthorityQuery;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRINCIPAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,254}$/;
const ROLE_SET = new Set(["owner", "academy_admin", "instructor", "school_admin", "compliance_admin"]);

function record(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function authorityRow(value: unknown): AuthorityRow | null {
  const row = record(value);
  if (!row) return null;
  const roles = Array.isArray(row.roles)
    ? [...new Set(row.roles.filter((role): role is string => typeof role === "string" && ROLE_SET.has(role)))]
    : [];
  const subjectActive = row.subject_active;
  const linkActive = row.link_active;
  const sessionActive = row.session_active;
  const internalIdentity = row.internal_identity;
  const roleFresh = row.role_fresh;
  const emailVerified = row.email_verified;
  const aal2 = row.aal2;
  const authorized = row.authorized;
  if (
    typeof row.provider_subject !== "string" || !UUID_PATTERN.test(row.provider_subject)
    || typeof row.principal_id !== "string" || !PRINCIPAL_PATTERN.test(row.principal_id)
    || typeof row.session_id !== "string" || !UUID_PATTERN.test(row.session_id)
    || typeof row.role_version !== "number" || !Number.isSafeInteger(row.role_version)
    || typeof row.reason !== "string" || row.reason.length > 120
    || roles.length === 0
    || typeof subjectActive !== "boolean"
    || typeof linkActive !== "boolean"
    || typeof sessionActive !== "boolean"
    || typeof internalIdentity !== "boolean"
    || typeof roleFresh !== "boolean"
    || typeof emailVerified !== "boolean"
    || typeof aal2 !== "boolean"
    || typeof authorized !== "boolean"
  ) return null;
  return {
    provider_subject: row.provider_subject,
    principal_id: row.principal_id,
    session_id: row.session_id,
    roles,
    role_version: row.role_version,
    subject_active: subjectActive,
    link_active: linkActive,
    session_active: sessionActive,
    internal_identity: internalIdentity,
    role_fresh: roleFresh,
    email_verified: emailVerified,
    aal2,
    authorized,
    reason: row.reason,
  };
}

const unavailableEvidence: ProtectedAuthReadinessEvidence = {
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

async function resolveInternalOwnerAuthority(
  claims: SafeSupabaseIdentity,
  queryCurrentAuthority: AuthorityQuery | null,
): Promise<InternalOwnerAuthority> {
  const correlationId = crypto.randomUUID();
  const identity = claims.identity;
  if (!identity) {
    return {
      status: claims.status === "signed_out" ? "signed_out" : "unavailable",
      reason: claims.status,
      identity: null,
      internalIdentityAuthorized: false,
      mfaEnrollmentReady: false,
      emailVerified: false,
      protectedReadiness: await getProtectedSupabaseAuthReadiness(async () => unavailableEvidence),
      correlationId,
    };
  }

  try {
    if (!queryCurrentAuthority) throw new Error("Identity authority query is unavailable.");
    const [jwksVerified, authorityResult] = await Promise.all([
      verifySupabaseJwksKey(claims.jwtKeyId, claims.jwtAlgorithm),
      queryCurrentAuthority(correlationId),
    ]);
    if (authorityResult.error) throw authorityResult.error;
    const raw = Array.isArray(authorityResult.data) ? authorityResult.data[0] : authorityResult.data;
    const authority = authorityRow(raw);
    if (!authority) throw new Error("Identity authority returned an invalid response.");

    const providerSubject = authority.provider_subject;
    const sessionId = authority.session_id;
    const roleVersion = authority.role_version;
    const authorityMatches = providerSubject === identity.authUserId
      && sessionId === identity.sessionId
      && authority.principal_id === identity.principalId
      && roleVersion === identity.roleVersion;
    const evidence: ProtectedAuthReadinessEvidence = {
      runtimeReady: claims.configured,
      claimsVerified: claims.status === "ready",
      jwksVerified,
      subjectFresh: authority.subject_active && authorityMatches,
      identityLinkActive: authority.link_active && authorityMatches,
      sessionActive: authority.session_active && authorityMatches,
      roleFresh: authority.role_fresh && authorityMatches,
      assuranceLevel: identity.assuranceLevel,
      requiredAssuranceLevel: "aal2",
    };
    const protectedReadiness = await getProtectedSupabaseAuthReadiness(async () => evidence);
    const mfaProtectedReadiness = await getProtectedSupabaseAuthReadiness(async () => ({
      ...evidence,
      requiredAssuranceLevel: "aal1",
    }));
    const internalIdentityAuthorized = authority.internal_identity
      && authority.authorized
      && protectedReadiness.ready;
    const mfaEnrollmentDecision = evaluateInternalOwnerMfaEnrollment({
      principalId: identity.principalId,
      roles: authority.roles,
      emailVerified: authority.email_verified,
      internalIdentity: authority.internal_identity && authorityMatches,
      assuranceLevel: identity.assuranceLevel,
      protectedAuthorityReady: mfaProtectedReadiness.ready,
      authorityReason: authorityMatches ? authority.reason : "authority_mismatch",
    });
    return {
      status: internalIdentityAuthorized ? "ready" : "denied",
      reason: authorityMatches ? authority.reason : "authority_mismatch",
      identity,
      internalIdentityAuthorized,
      mfaEnrollmentReady: mfaEnrollmentDecision.authorized,
      emailVerified: authority.email_verified,
      protectedReadiness,
      correlationId,
    };
  } catch {
    return {
      status: "unavailable",
      reason: "authority_unavailable",
      identity,
      internalIdentityAuthorized: false,
      mfaEnrollmentReady: false,
      emailVerified: false,
      protectedReadiness: await getProtectedSupabaseAuthReadiness(async () => ({
        ...unavailableEvidence,
        runtimeReady: claims.configured,
        claimsVerified: claims.status === "ready",
      })),
      correlationId,
    };
  }
}

export async function getInternalOwnerAuthority(): Promise<InternalOwnerAuthority> {
  const claims = await safeSupabaseIdentity();
  if (!claims.identity) return resolveInternalOwnerAuthority(claims, null);
  try {
    const supabase = await createSupabaseServerClient();
    return resolveInternalOwnerAuthority(claims, async (correlationId) => {
      const result = await supabase.rpc("obserra_current_identity_authority", {
        p_correlation_id: correlationId,
      });
      return { data: result.data, error: result.error };
    });
  } catch {
    return resolveInternalOwnerAuthority(claims, null);
  }
}

export async function getInternalOwnerAuthorityFromProxyContext(
  context: VerifiedProxyAuthorityContext,
): Promise<InternalOwnerAuthority> {
  return resolveInternalOwnerAuthority({
    configured: true,
    authenticated: true,
    identity: context.identity,
    jwksVerified: false,
    jwtKeyId: context.jwtKeyId,
    jwtAlgorithm: context.jwtAlgorithm,
    reasonCodes: [],
    status: "ready",
  }, context.queryCurrentAuthority);
}

export async function requestOwnerActivationAudit(): Promise<OwnerActivationAuditResult> {
  const authority = await getInternalOwnerAuthority();
  if (authority.status !== "ready" || !authority.identity) {
    return {
      accepted: false,
      reason: authority.reason,
      correlationId: authority.correlationId,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.rpc("obserra_request_owner_activation", {
      p_correlation_id: authority.correlationId,
    });
    if (result.error) throw result.error;
    const raw = record(Array.isArray(result.data) ? result.data[0] : result.data);
    const accepted = raw?.accepted === true;
    const providerSubject = raw?.provider_subject;
    const principalId = raw?.principal_id;
    const sessionId = raw?.session_id;
    const correlationId = raw?.correlation_id;
    const reason = raw?.reason;
    const responseMatches = providerSubject === authority.identity.authUserId
      && principalId === authority.identity.principalId
      && sessionId === authority.identity.sessionId
      && correlationId === authority.correlationId
      && typeof reason === "string"
      && reason.length <= 120;
    if (!accepted || !responseMatches) {
      return {
        accepted: false,
        reason: responseMatches && typeof reason === "string" ? reason : "activation_audit_mismatch",
        correlationId: authority.correlationId,
      };
    }
    return { accepted: true, reason, correlationId: authority.correlationId };
  } catch {
    return {
      accepted: false,
      reason: "activation_audit_unavailable",
      correlationId: authority.correlationId,
    };
  }
}
