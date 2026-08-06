import { auth } from "@clerk/nextjs/server";

type IdentityEnvironment = "test" | "live";

export type SafeIdentity = {
  configured: boolean;
  userId: string | null;
  environment: IdentityEnvironment | null;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function getPublishableEnvironment(value: string | undefined): IdentityEnvironment | null {
  if (!value || value !== value.trim()) return null;
  const match = /^pk_(test|live)_([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return null;

  try {
    const decoded = decodeBase64Url(match[2]);
    if (!decoded.endsWith("$")) return null;
    const frontendApi = decoded.slice(0, -1);
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(frontendApi)) return null;
    return match[1] as IdentityEnvironment;
  } catch {
    return null;
  }
}

function getSecretEnvironment(value: string | undefined): IdentityEnvironment | null {
  if (!value || value !== value.trim()) return null;
  const match = /^sk_(test|live)_([A-Za-z0-9_-]{20,})$/.exec(value);
  return match ? (match[1] as IdentityEnvironment) : null;
}

export function isClerkIdentityConfigured() {
  const configuredPublishableEnvironment = getPublishableEnvironment(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  const configuredSecretEnvironment = getSecretEnvironment(process.env.CLERK_SECRET_KEY);

  return Boolean(
    configuredPublishableEnvironment &&
      configuredSecretEnvironment &&
      configuredPublishableEnvironment === configuredSecretEnvironment,
  );
}

export async function safeIdentity(): Promise<SafeIdentity> {
  const environment = getPublishableEnvironment(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkIdentityConfigured()) {
    return { configured: false, userId: null, environment };
  }

  try {
    const session = await auth();
    return { configured: true, userId: session.userId, environment };
  } catch (error) {
    console.error("Clerk identity runtime unavailable", error);
    return { configured: false, userId: null, environment };
  }
}
