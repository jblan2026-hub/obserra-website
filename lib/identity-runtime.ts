import { auth } from "@clerk/nextjs/server";
import { prepareClerkRuntime, type ClerkEnvironment } from "./clerk-runtime-config";

export type SafeIdentity = {
  configured: boolean;
  userId: string | null;
  environment: ClerkEnvironment | null;
};

export function isClerkIdentityConfigured() {
  return prepareClerkRuntime().ready;
}

export async function safeIdentity(): Promise<SafeIdentity> {
  const runtime = prepareClerkRuntime();

  if (!runtime.ready) {
    console.error("Clerk identity configuration unavailable", {
      reasonCodes: runtime.reasonCodes,
      publishableSource: runtime.publishableSource,
      normalizationApplied: runtime.normalizationApplied,
      environment: runtime.environment,
    });
    return { configured: false, userId: null, environment: runtime.environment };
  }

  try {
    const session = await auth();
    return { configured: true, userId: session.userId, environment: runtime.environment };
  } catch (error) {
    console.error("Clerk identity runtime unavailable", error);
    return { configured: false, userId: null, environment: runtime.environment };
  }
}
