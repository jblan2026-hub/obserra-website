import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { AcademyControlError, verifyAcademyOwner } from "./academy-control";

export type OwnerAccessContext = {
  userId: string;
  displayName: "Obserra Company Owner";
  mode: "authenticated-owner-id";
  token: string;
  claimedAt: string;
};

/**
 * Establishes the private Command Center boundary without using an email
 * address as an authorization input. Clerk authenticates the session, while
 * the Academy owner-control service binds authorization to one immutable Clerk
 * user ID and its verified issuer. The one-time bootstrap proof is invalidated
 * as soon as that identity is claimed.
 */
export async function requireOwnerAccess(returnTo: string): Promise<OwnerAccessContext> {
  const session = await auth();
  if (!session.userId) {
    redirect(`/owner-access?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  const token = await session.getToken();
  if (!token) {
    redirect(`/owner-access?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  try {
    const owner = await verifyAcademyOwner(token);
    if (owner.ownerUserId !== session.userId) notFound();
    return {
      userId: session.userId,
      displayName: "Obserra Company Owner",
      mode: "authenticated-owner-id",
      token,
      claimedAt: owner.claimedAt,
    };
  } catch (error) {
    if (error instanceof AcademyControlError) {
      if (error.code === "OWNER_BOOTSTRAP_REQUIRED") {
        redirect(`/owner-access?bootstrap=required&redirect_url=${encodeURIComponent(returnTo)}`);
      }
      if (error.status === 401 || error.status === 403) notFound();
    }
    throw error;
  }
}
