import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export type OwnerAuthorization = {
  authenticated: boolean;
  authorized: boolean;
  userId: string | null;
  sessionId: string | null;
  configurationReady: boolean;
};

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

function secureEqual(actual: string, expected: string) {
  return timingSafeEqual(digest(actual), digest(expected));
}

function configuredOwnerUserId() {
  const value = process.env.OBSERRA_OWNER_USER_ID?.trim();
  if (!value || value.length > 256 || /\s/.test(value)) return null;
  return value;
}

export function ownerUserIdAllowed(userId: string | null | undefined) {
  const expected = configuredOwnerUserId();
  return Boolean(userId && expected && secureEqual(userId, expected));
}

export async function getOwnerAuthorization(): Promise<OwnerAuthorization> {
  const expected = configuredOwnerUserId();
  const session = await auth();
  return {
    authenticated: Boolean(session.userId),
    authorized: Boolean(session.userId && expected && secureEqual(session.userId, expected)),
    userId: session.userId,
    sessionId: session.sessionId,
    configurationReady: Boolean(expected),
  };
}

export async function requireOwnerPage(returnTo = "/command-center") {
  const authorization = await getOwnerAuthorization();
  if (!authorization.authenticated) {
    redirect(`/owner-access?redirect_url=${encodeURIComponent(returnTo)}`);
  }
  if (!authorization.configurationReady || !authorization.authorized) {
    notFound();
  }
  return authorization;
}

export async function requireOwnerApi() {
  const authorization = await getOwnerAuthorization();
  return authorization.authorized ? authorization : null;
}
