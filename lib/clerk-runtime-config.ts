export type ClerkEnvironment = "test" | "live";

export type ClerkRuntimeReason =
  | "publishable_key_missing"
  | "publishable_key_invalid"
  | "secret_key_missing"
  | "secret_key_invalid"
  | "environment_mismatch"
  | "production_requires_live_keys";

export type ClerkRuntimeStatus = {
  ready: boolean;
  environment: ClerkEnvironment | null;
  publishableKey: string | null;
  reasonCodes: ClerkRuntimeReason[];
  normalizationApplied: boolean;
  publishableSource: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | "CLERK_PUBLISHABLE_KEY" | null;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function publishableEnvironment(value: string | undefined): ClerkEnvironment | null {
  if (!value) return null;
  const match = /^pk_(test|live)_([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return null;

  try {
    const decoded = decodeBase64Url(match[2]);
    if (!decoded.endsWith("$")) return null;
    const frontendApi = decoded.slice(0, -1);
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(frontendApi)) return null;
    return match[1] as ClerkEnvironment;
  } catch {
    return null;
  }
}

function secretEnvironment(value: string | undefined): ClerkEnvironment | null {
  if (!value) return null;
  const match = /^sk_(test|live)_([A-Za-z0-9_-]{20,})$/.exec(value);
  return match ? (match[1] as ClerkEnvironment) : null;
}

function sourcePublishableKey() {
  const nextPublic = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (nextPublic?.trim()) {
    return {
      source: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" as const,
      raw: nextPublic,
      normalized: nextPublic.trim(),
    };
  }

  const clerkPublic = process.env.CLERK_PUBLISHABLE_KEY;
  if (clerkPublic?.trim()) {
    return {
      source: "CLERK_PUBLISHABLE_KEY" as const,
      raw: clerkPublic,
      normalized: clerkPublic.trim(),
    };
  }

  return { source: null, raw: undefined, normalized: undefined };
}

export function prepareClerkRuntime(): ClerkRuntimeStatus {
  const publishable = sourcePublishableKey();
  const rawSecret = process.env.CLERK_SECRET_KEY;
  const normalizedSecret = rawSecret?.trim() || undefined;
  const publishableKey = publishable.normalized;

  const publishableEnv = publishableEnvironment(publishableKey);
  const secretEnv = secretEnvironment(normalizedSecret);
  const reasonCodes: ClerkRuntimeReason[] = [];

  if (!publishableKey) reasonCodes.push("publishable_key_missing");
  else if (!publishableEnv) reasonCodes.push("publishable_key_invalid");

  if (!normalizedSecret) reasonCodes.push("secret_key_missing");
  else if (!secretEnv) reasonCodes.push("secret_key_invalid");

  if (publishableEnv && secretEnv && publishableEnv !== secretEnv) {
    reasonCodes.push("environment_mismatch");
  }

  if (
    process.env.VERCEL_ENV === "production" &&
    ((publishableEnv && publishableEnv !== "live") || (secretEnv && secretEnv !== "live"))
  ) {
    reasonCodes.push("production_requires_live_keys");
  }

  const normalizationApplied = Boolean(
    (publishable.raw && publishable.raw !== publishableKey) ||
      (rawSecret && rawSecret !== normalizedSecret),
  );

  const ready = reasonCodes.length === 0 && Boolean(publishableEnv && secretEnv);

  return {
    ready,
    environment: ready ? publishableEnv : publishableEnv ?? secretEnv,
    publishableKey: ready ? publishableKey ?? null : null,
    reasonCodes,
    normalizationApplied,
    publishableSource: publishable.source,
  };
}
