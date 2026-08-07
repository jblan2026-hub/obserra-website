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
 * The route fails closed unless one signed-in Clerk user matches the singular
 * OBSERRA_OWNER_EMAIL value. OBSERRA_OWNER_USER_ID can additionally bind the
 * route to one immutable Clerk user identifier.
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
  const emailAddresses = user.emailAddresses.map((item) => normalized(item.emailAddress));
  const emailAuthorized = emailAddresses.includes(configuredOwnerEmail);
  const userIdAuthorized = !configuredOwnerUserId || configuredOwnerUserId === userId;

  if (!emailAuthorized || !userIdAuthorized) {
    notFound();
  }

  const primaryEmail = user.primaryEmailAddressId
    ? user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress ?? configuredOwnerEmail
    : configuredOwnerEmail;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || primaryEmail;

  return {
    userId,
    displayName,
    primaryEmail,
    mode: "authenticated-owner",
  };
}
