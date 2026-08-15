import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
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

export class FloridaClassDAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 | 503,
  ) {
    super(message);
    this.name = "FloridaClassDAuthorizationError";
  }
}

function requireCurrentFloridaClassDIdentityAuthority() {
  const supabaseRuntime = prepareSupabaseAuthRuntime();
  if (supabaseRuntime.runtimeEnabled) {
    throw new FloridaClassDAuthorizationError(
      "Florida Class D identity governance is not ready for Supabase Auth activation.",
      503,
    );
  }
}

async function requireFloridaClassDAuthenticatedSession() {
  requireCurrentFloridaClassDIdentityAuthority();
  const { userId, sessionId } = await auth();
  if (!userId) {
    throw new FloridaClassDAuthorizationError("Sign in is required.", 401);
  }
  return { userId, sessionId: sessionId ?? null };
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
  requireCurrentFloridaClassDIdentityAuthority();
  const normalizedTarget = targetUserId.trim();
  if (!CLERK_USER_ID_PATTERN.test(normalizedTarget) || normalizedTarget === ownerLearnerUserId) {
    throw new FloridaClassDAuthorizationError(
      "A distinct Clerk user for the licensed Class DI instructor is required.",
      403,
    );
  }
  const client = await clerkClient();
  const target = await client.users.getUser(normalizedTarget);
  const emails = target.emailAddresses.map((item) => item.emailAddress);
  if (ownerEmailAllowed(emails)) {
    throw new FloridaClassDAuthorizationError(
      "The owner learner and assigned Class DI instructor must be distinct identities.",
      403,
    );
  }
  const roles = staffRolesFromPrivateMetadata(target.privateMetadata as Record<string, unknown>);
  return { userId: normalizedTarget, alreadyInstructor: roles.includes("instructor") };
}

export async function ensureFloridaClassDInstructorRole(targetUserId: string) {
  requireCurrentFloridaClassDIdentityAuthority();
  const normalizedTarget = targetUserId.trim();
  if (!CLERK_USER_ID_PATTERN.test(normalizedTarget)) {
    throw new FloridaClassDAuthorizationError("A valid Clerk instructor identity is required.", 403);
  }
  const client = await clerkClient();
  const target = await client.users.getUser(normalizedTarget);
  const privateMetadata = target.privateMetadata as Record<string, unknown>;
  const fdacsMetadata = isRecord(privateMetadata.fdacsClassD)
    ? privateMetadata.fdacsClassD
    : {};
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
  const { userId, sessionId } = await requireFloridaClassDAuthenticatedSession();

  if (floridaClassDOwnerUatProfileRequested()) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const emails = user.emailAddresses.map((item) => item.emailAddress);
    if (!ownerEmailAllowed(emails)) {
      throw new FloridaClassDAuthorizationError(
        "This controlled non-credit UAT is restricted to the configured owner identity.",
        403,
      );
    }
  }
  return { userId, sessionId: sessionId ?? null };
}

export async function requireFloridaClassDStaff(
  allowedRoles: readonly FloridaClassDStaffRole[],
) {
  // The owner-only learner boundary must not exclude the separately assigned
  // Class DI instructor required to verify identity and attendance.
  const { userId, sessionId } = await requireFloridaClassDAuthenticatedSession();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((item) => item.emailAddress);
  const configuredRoles = staffRolesFromPrivateMetadata(user.privateMetadata as Record<string, unknown>);
  const roles = new Set<FloridaClassDStaffRole>(configuredRoles);

  // The existing protected owner allowlist remains the bootstrap authority for
  // school/compliance administration until dedicated staff provisioning is enabled.
  if (ownerEmailAllowed(emails)) {
    roles.add("school_admin");
    roles.add("compliance_admin");
  }

  const authorizedRole = allowedRoles.find((role) => roles.has(role));
  if (!authorizedRole) {
    throw new FloridaClassDAuthorizationError("Florida Class D staff authorization is required.", 403);
  }

  return {
    userId,
    sessionId,
    role: authorizedRole,
    roles: [...roles],
    primaryEmail: emails[0] ?? null,
  };
}
