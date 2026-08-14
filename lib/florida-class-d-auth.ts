import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ownerEmailAllowed } from "./academy";
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

export class FloridaClassDAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "FloridaClassDAuthorizationError";
  }
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

export async function requireFloridaClassDSignedInUser() {
  const { userId, sessionId } = await auth();
  if (!userId) {
    throw new FloridaClassDAuthorizationError("Sign in is required.", 401);
  }
  return { userId, sessionId: sessionId ?? null };
}

export async function requireFloridaClassDStaff(
  allowedRoles: readonly FloridaClassDStaffRole[],
) {
  const { userId, sessionId } = await requireFloridaClassDSignedInUser();
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
