import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getInternalOwnerAuthority } from "./auth/authority-repository";
import { requireSupabaseIdentity } from "./auth/identity";
import { prepareSupabaseAuthRuntime } from "./auth/runtime-config";
import { ownerEmailAllowed } from "./academy";
import { floridaClassDOwnerUatProfileRequested } from "./florida-class-d-owner-uat";
import type { FloridaClassDRecordRole } from "./florida-class-d-records";

export type FloridaClassDStaffRole = Extract<
  FloridaClassDRecordRole,
  "instructor" | "school_admin" | "compliance_admin"
>;

const STAFF_ROLES = new Set<FloridaClassDStaffRole>([
  "instructor",
  "school_admin",
  "compliance_admin",
]);
const CLERK_USER_ID_PATTERN = /^user_[A-Za-z0-9]{3,250}$/;
const PRINCIPAL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,254}$/;

export class FloridaClassDAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 | 503,
    readonly code = "FDACS_AUTHORIZATION_FAILED",
  ) {
    super(message);
    this.name = "FloridaClassDAuthorizationError";
  }
}

function supabaseIdentityEnabled() {
  return prepareSupabaseAuthRuntime().runtimeEnabled;
}

async function requireFloridaClassDAuthenticatedSession() {
  if (supabaseIdentityEnabled()) {
    try {
      const identity = await requireSupabaseIdentity();
      return {
        userId: identity.principalId,
        sessionId: identity.sessionId,
        primaryEmail: identity.email,
        provider: "supabase" as const,
      };
    } catch (error) {
      const status = typeof error === "object" && error && "status" in error && error.status === 401 ? 401 : 503;
      throw new FloridaClassDAuthorizationError(
        status === 401 ? "Sign in is required." : "Supabase identity service is unavailable.",
        status,
        status === 401 ? "FDACS_SIGN_IN_REQUIRED" : "FDACS_IDENTITY_UNAVAILABLE",
      );
    }
  }

  const { userId, sessionId } = await auth();
  if (!userId) {
    throw new FloridaClassDAuthorizationError("Sign in is required.", 401, "FDACS_SIGN_IN_REQUIRED");
  }
  return { userId, sessionId: sessionId ?? null, primaryEmail: null, provider: "clerk" as const };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function staffRolesFromPrivateMetadata(privateMetadata: Record<string, unknown>) {
  const fdacs = privateMetadata.fdacsClassD;
  if (!isRecord(fdacs) || !Array.isArray(fdacs.roles)) return [] as FloridaClassDStaffRole[];

  return [...new Set(
    fdacs.roles.filter(
      (role): role is FloridaClassDStaffRole =>
        typeof role === "string" && STAFF_ROLES.has(role as FloridaClassDStaffRole),
    ),
  )];
}

export async function validateFloridaClassDInstructorPrincipal(
  targetUserId: string,
  ownerLearnerUserId: string,
) {
  const normalizedTarget = targetUserId.trim();
  if (supabaseIdentityEnabled()) {
    if (!PRINCIPAL_ID_PATTERN.test(normalizedTarget) || normalizedTarget === ownerLearnerUserId) {
      throw new FloridaClassDAuthorizationError(
        "A distinct Supabase-backed instructor principal is required.",
        403,
        "FDACS_INSTRUCTOR_PRINCIPAL_INVALID",
      );
    }
    throw new FloridaClassDAuthorizationError(
      "Supabase instructor-directory verification is not yet activated. Instructor provisioning remains fail-closed.",
      503,
      "FDACS_INSTRUCTOR_DIRECTORY_NOT_READY",
    );
  }

  if (!CLERK_USER_ID_PATTERN.test(normalizedTarget) || normalizedTarget === ownerLearnerUserId) {
    throw new FloridaClassDAuthorizationError(
      "A distinct Clerk user for the licensed Class DI instructor is required.",
      403,
      "FDACS_INSTRUCTOR_PRINCIPAL_INVALID",
    );
  }
  const client = await clerkClient();
  const target = await client.users.getUser(normalizedTarget);
  const emails = target.emailAddresses.map((item) => item.emailAddress);
  if (ownerEmailAllowed(emails)) {
    throw new FloridaClassDAuthorizationError(
      "The owner learner and assigned Class DI instructor must be distinct identities.",
      403,
      "FDACS_INSTRUCTOR_MUST_BE_DISTINCT",
    );
  }
  const roles = staffRolesFromPrivateMetadata(target.privateMetadata as Record<string, unknown>);
  return { userId: normalizedTarget, alreadyInstructor: roles.includes("instructor") };
}

export async function ensureFloridaClassDInstructorRole(targetUserId: string) {
  const normalizedTarget = targetUserId.trim();
  if (supabaseIdentityEnabled()) {
    if (!PRINCIPAL_ID_PATTERN.test(normalizedTarget)) {
      throw new FloridaClassDAuthorizationError(
        "A valid Supabase instructor principal is required.",
        403,
        "FDACS_INSTRUCTOR_PRINCIPAL_INVALID",
      );
    }
    throw new FloridaClassDAuthorizationError(
      "Supabase instructor-role provisioning is not yet activated. Instructor provisioning remains fail-closed.",
      503,
      "FDACS_INSTRUCTOR_ROLE_PROVISIONING_NOT_READY",
    );
  }

  if (!CLERK_USER_ID_PATTERN.test(normalizedTarget)) {
    throw new FloridaClassDAuthorizationError(
      "A valid Clerk instructor identity is required.",
      403,
      "FDACS_INSTRUCTOR_PRINCIPAL_INVALID",
    );
  }
  const client = await clerkClient();
  const target = await client.users.getUser(normalizedTarget);
  const privateMetadata = target.privateMetadata as Record<string, unknown>;
  const fdacsMetadata = isRecord(privateMetadata.fdacsClassD) ? privateMetadata.fdacsClassD : {};
  const roles = staffRolesFromPrivateMetadata(privateMetadata);
  if (roles.includes("instructor")) return { userId: normalizedTarget, roleAssigned: false };
  await client.users.updateUserMetadata(normalizedTarget, {
    privateMetadata: {
      ...privateMetadata,
      fdacsClassD: {
        ...fdacsMetadata,
        roles: [...roles, "instructor"],
      },
    },
  });
  return { userId: normalizedTarget, roleAssigned: true };
}

export async function requireFloridaClassDSignedInUser() {
  const session = await requireFloridaClassDAuthenticatedSession();

  if (session.provider === "clerk" && floridaClassDOwnerUatProfileRequested()) {
    const client = await clerkClient();
    const user = await client.users.getUser(session.userId);
    const emails = user.emailAddresses.map((item) => item.emailAddress);
    if (!ownerEmailAllowed(emails)) {
      throw new FloridaClassDAuthorizationError(
        "This controlled non-credit UAT is restricted to the configured owner identity.",
        403,
        "FDACS_OWNER_UAT_IDENTITY_REQUIRED",
      );
    }
  }

  return { userId: session.userId, sessionId: session.sessionId };
}

export async function requireFloridaClassDStaff(
  allowedRoles: readonly FloridaClassDStaffRole[],
) {
  if (supabaseIdentityEnabled()) {
    const authority = await getInternalOwnerAuthority();
    if (authority.status === "signed_out") {
      throw new FloridaClassDAuthorizationError("Sign in is required.", 401, "FDACS_SIGN_IN_REQUIRED");
    }
    if (authority.status === "unavailable" || !authority.identity) {
      throw new FloridaClassDAuthorizationError(
        "Protected Supabase owner authority is unavailable.",
        503,
        "FDACS_OWNER_AUTHORITY_UNAVAILABLE",
      );
    }
    if (
      authority.status !== "ready"
      || !authority.internalIdentityAuthorized
      || !authority.emailVerified
      || !authority.protectedReadiness.ready
      || authority.identity.assuranceLevel !== "aal2"
      || !authority.identity.roles.includes("owner")
    ) {
      throw new FloridaClassDAuthorizationError(
        "Verified owner authority with AAL2 is required for Florida Class D administration.",
        403,
        "FDACS_OWNER_ADMIN_AUTHORITY_REQUIRED",
      );
    }

    const roles = new Set<FloridaClassDStaffRole>();
    for (const role of authority.identity.roles) {
      if (STAFF_ROLES.has(role as FloridaClassDStaffRole)) roles.add(role as FloridaClassDStaffRole);
    }
    roles.add("school_admin");
    roles.add("compliance_admin");

    const authorizedRole = allowedRoles.find((role) => roles.has(role));
    if (!authorizedRole) {
      throw new FloridaClassDAuthorizationError(
        "Florida Class D staff authorization is required.",
        403,
        "FDACS_STAFF_AUTHORIZATION_REQUIRED",
      );
    }

    return {
      userId: authority.identity.principalId,
      sessionId: authority.identity.sessionId,
      role: authorizedRole,
      roles: [...roles],
      primaryEmail: authority.identity.email,
      provider: "supabase" as const,
    };
  }

  const session = await requireFloridaClassDAuthenticatedSession();
  const client = await clerkClient();
  const user = await client.users.getUser(session.userId);
  const emails = user.emailAddresses.map((item) => item.emailAddress);
  const configuredRoles = staffRolesFromPrivateMetadata(user.privateMetadata as Record<string, unknown>);
  const roles = new Set<FloridaClassDStaffRole>(configuredRoles);

  if (ownerEmailAllowed(emails)) {
    roles.add("school_admin");
    roles.add("compliance_admin");
  }

  const authorizedRole = allowedRoles.find((role) => roles.has(role));
  if (!authorizedRole) {
    throw new FloridaClassDAuthorizationError(
      "Florida Class D staff authorization is required.",
      403,
      "FDACS_STAFF_AUTHORIZATION_REQUIRED",
    );
  }

  return {
    userId: session.userId,
    sessionId: session.sessionId,
    role: authorizedRole,
    roles: [...roles],
    primaryEmail: emails[0] ?? null,
    provider: "clerk" as const,
  };
}
