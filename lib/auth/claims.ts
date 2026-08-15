export const OBSERRA_AUTHORIZATION_ROLES = [
  "owner",
  "academy_admin",
  "instructor",
  "school_admin",
  "compliance_admin",
] as const;

export type ObserraAuthorizationRole = typeof OBSERRA_AUTHORIZATION_ROLES[number];

export type VerifiedSupabaseIdentity = {
  authUserId: string;
  principalId: string;
  sessionId: string | null;
  email: string | null;
  emailVerified: boolean;
  assuranceLevel: "aal1" | "aal2" | null;
  roles: ObserraAuthorizationRole[];
  roleVersion: number | null;
};

const AUTH_USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRINCIPAL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,254}$/;
const ROLE_SET = new Set<string>(OBSERRA_AUTHORIZATION_ROLES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isMissingSupabaseAuthSession(error: unknown) {
  return isRecord(error) && error.name === "AuthSessionMissingError";
}

function authorizationRoles(values: unknown) {
  if (!Array.isArray(values)) return [] as ObserraAuthorizationRole[];
  return values.filter(
    (value): value is ObserraAuthorizationRole => typeof value === "string" && ROLE_SET.has(value),
  );
}

function rolesFromAppMetadata(appMetadata: Record<string, unknown>) {
  const roles = new Set<ObserraAuthorizationRole>(authorizationRoles(appMetadata.roles));
  const fdacsClassD = appMetadata.fdacsClassD;
  if (isRecord(fdacsClassD)) {
    for (const role of authorizationRoles(fdacsClassD.roles)) roles.add(role);
  }
  return [...roles];
}

function subjectIdFromAppMetadata(appMetadata: Record<string, unknown>) {
  const subjectId = appMetadata.obserra_subject_id;
  return typeof subjectId === "string" && PRINCIPAL_ID_PATTERN.test(subjectId)
    ? subjectId
    : null;
}

function roleVersionFromAppMetadata(appMetadata: Record<string, unknown>) {
  const roleVersion = appMetadata.role_version;
  return typeof roleVersion === "number" && Number.isSafeInteger(roleVersion) && roleVersion >= 0
    ? roleVersion
    : null;
}

export function identityFromVerifiedClaims(claims: unknown): VerifiedSupabaseIdentity | null {
  if (!isRecord(claims)) return null;
  const authUserId = claims.sub;
  if (typeof authUserId !== "string" || !AUTH_USER_ID_PATTERN.test(authUserId)) return null;

  const appMetadata = isRecord(claims.app_metadata) ? claims.app_metadata : {};
  const principalId = subjectIdFromAppMetadata(appMetadata) ?? authUserId;
  const sessionId = typeof claims.session_id === "string" && AUTH_USER_ID_PATTERN.test(claims.session_id)
    ? claims.session_id
    : null;
  const email = typeof claims.email === "string" && claims.email.length <= 320
    ? claims.email.trim().toLowerCase() || null
    : null;
  const assuranceLevel = claims.aal === "aal1" || claims.aal === "aal2" ? claims.aal : null;

  return {
    authUserId,
    principalId,
    sessionId,
    email,
    emailVerified: claims.email_verified === true,
    assuranceLevel,
    roles: rolesFromAppMetadata(appMetadata),
    roleVersion: roleVersionFromAppMetadata(appMetadata),
  };
}

export function identityHasRole(
  identity: VerifiedSupabaseIdentity,
  allowedRoles: readonly ObserraAuthorizationRole[],
) {
  const roles = new Set(identity.roles);
  return allowedRoles.some((role) => roles.has(role));
}
