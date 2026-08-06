import { auth } from "@clerk/nextjs/server";

const PUBLISHABLE_KEY_PATTERN = /^pk_(test|live)_[A-Za-z0-9_-]+$/;
const SECRET_KEY_PATTERN = /^sk_(test|live)_[A-Za-z0-9_-]+$/;

type IdentityEnvironment = "test" | "live";

export type SafeIdentity = {
  configured: boolean;
  userId: string | null;
  environment: IdentityEnvironment | null;
};

function environmentFromKey(key: string | undefined, prefix: "pk" | "sk"): IdentityEnvironment | null {
  if (!key) return null;
  if (key.startsWith(`${prefix}_test_`)) return "test";
  if (key.startsWith(`${prefix}_live_`)) return "live";
  return null;
}

export function isClerkIdentityConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableEnvironment = environmentFromKey(publishableKey, "pk");
  const secretEnvironment = environmentFromKey(secretKey, "sk");

  return Boolean(
    publishableKey &&
      secretKey &&
      PUBLISHABLE_KEY_PATTERN.test(publishableKey) &&
      SECRET_KEY_PATTERN.test(secretKey) &&
      publishableEnvironment &&
      publishableEnvironment === secretEnvironment,
  );
}

export async function safeIdentity(): Promise<SafeIdentity> {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const environment = environmentFromKey(publishableKey, "pk");

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
