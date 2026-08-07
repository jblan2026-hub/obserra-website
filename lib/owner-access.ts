import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export type OwnerAccessContext = {
  userId: string;
  displayName: string;
  primaryEmail: string;
  mode: "authenticated-owner";
};

function normalized(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

/**
 * Establishes the server-side owner boundary for the private Command Center.
 * The route fails closed unless one signed-in Clerk user has the singular
 * OBSERRA_OWNER_EMAIL as its verified primary address. OBSERRA_OWNER_USER_ID
 * can additionally bind the route to one immutable Clerk user identifier.
 */
export async function requireOwnerAccess(returnTo: string): Promise<OwnerAccessContext> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  const configuredOwnerEmail = normalized(process.env.OBSERRA_OWNER_EMAIL);
  const configuredOwnerUserId = process.env.OBSERRA_OWNER_USER_ID?.trim() ?? "";
  if (!configuredOwnerEmail) {
    console.error("Owner Command Center is unavailable because OBSERRA_OWNER_EMAIL is not configured.");
    notFound();
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const matchingEmail = user.emailAddresses.find(
    (item) => normalized(item.emailAddress) === configuredOwnerEmail,
  );
  const emailAuthorized = Boolean(
    matchingEmail
      && matchingEmail.id === user.primaryEmailAddressId
      && matchingEmail.verification?.status === "verified",
  );
  const userIdAuthorized = !configuredOwnerUserId || configuredOwnerUserId === userId;

  if (!emailAuthorized || !userIdAuthorized) {
    notFound();
  }

  const primaryEmail = matchingEmail?.emailAddress ?? configuredOwnerEmail;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || primaryEmail;

  return {
    userId,
    displayName,
    primaryEmail,
    mode: "authenticated-owner",
  };
}
