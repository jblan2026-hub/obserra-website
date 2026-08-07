import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ACADEMY_OWNER_CONTROL_URL } from "./academy-control-contracts";

const MAX_TOKEN_CHARS = 16_000;

export type OwnerAccessContext = {
  userId: string;
  displayName: "Company Owner";
  mode: "authenticated-owner-id";
  token: string;
};

export type AcademyOwnerVerification =
  | {
      state: "authorized";
      ownerUserId: string;
      claimedAt: string;
      requestId: string | null;
    }
  | { state: "bootstrap-required"; requestId: string | null }
  | { state: "denied"; requestId: string | null }
  | { state: "unavailable"; requestId: string | null };

function safeReturnTo(value: string) {
  if (!value.startsWith("/command-center") || value.startsWith("//")) {
    return "/command-center";
  }
  return value.slice(0, 2_000);
}

function identityGateway(returnTo: string, status?: string) {
  const query = new URLSearchParams({ redirect_url: safeReturnTo(returnTo) });
  if (status) query.set("status", status);
  return `/owner-access?${query.toString()}`;
}

function validToken(token: string | null): token is string {
  return Boolean(token && token.length <= MAX_TOKEN_CHARS && !/\s/.test(token));
}

export async function verifyAcademyOwner(token: string): Promise<AcademyOwnerVerification> {
  if (!validToken(token)) {
    return { state: "denied", requestId: null };
  }

  try {
    const response = await fetch(`${ACADEMY_OWNER_CONTROL_URL}/me`, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "x-obserra-request-id": crypto.randomUUID(),
      },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    const requestId = typeof payload?.requestId === "string" ? payload.requestId : null;

    if (response.ok && payload?.authorized === true && typeof payload.ownerUserId === "string") {
      return {
        state: "authorized",
        ownerUserId: payload.ownerUserId,
        claimedAt: typeof payload.claimedAt === "string" ? payload.claimedAt : "",
        requestId,
      };
    }
    if (response.status === 409 && payload?.code === "OWNER_BOOTSTRAP_REQUIRED") {
      return { state: "bootstrap-required", requestId };
    }
    if (response.status === 401 || response.status === 403) {
      return { state: "denied", requestId };
    }
    return { state: "unavailable", requestId };
  } catch (error) {
    console.error("Owner identity verification unavailable", error);
    return { state: "unavailable", requestId: null };
  }
}

export async function requireOwnerAccess(returnTo = "/command-center"): Promise<OwnerAccessContext> {
  const target = safeReturnTo(returnTo);
  const session = await auth();
  if (!session.userId) {
    redirect(identityGateway(target));
  }

  const token = await session.getToken();
  if (!validToken(token)) {
    redirect(identityGateway(target, "session-unavailable"));
  }

  const verification = await verifyAcademyOwner(token);
  if (verification.state === "bootstrap-required") {
    redirect(identityGateway(target, "bootstrap-required"));
  }
  if (verification.state === "unavailable") {
    redirect(identityGateway(target, "verification-unavailable"));
  }
  if (verification.state !== "authorized" || verification.ownerUserId !== session.userId) {
    notFound();
  }

  return {
    userId: session.userId,
    displayName: "Company Owner",
    mode: "authenticated-owner-id",
    token,
  };
}
