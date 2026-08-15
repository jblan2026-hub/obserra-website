import "server-only";

const DAILY_API_BASE = "https://api.daily.co/v1";

export class FloridaClassDDailyProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDDailyProviderError";
  }
}
function dailyApiKey() {
  const apiKey = process.env.OBSERRA_FDACS_DAILY_API_KEY?.trim() || "";
  if (!apiKey) {
    throw new FloridaClassDDailyProviderError(
      "Class D live media provider is not configured.",
      503,
      "FDACS_MEDIA_NOT_CONFIGURED",
    );
  }
  return apiKey;
}

export async function floridaClassDServerDailyRequest<T>(
  path: string,
  init: RequestInit = {},
  allowNotFound = false,
): Promise<T | null> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new FloridaClassDDailyProviderError(
      "Invalid live media provider path.",
      500,
      "FDACS_MEDIA_PROVIDER_PATH_INVALID",
    );
  }
  const apiKey = dailyApiKey();
  const response = await fetch(`${DAILY_API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  if (allowNotFound && response.status === 404) return null;
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDDailyProviderError(
        "Live media provider returned an invalid response.",
        502,
        "FDACS_MEDIA_INVALID_PROVIDER_RESPONSE",
      );
    }
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : null;
    const providerMessage = typeof error?.info === "string"
      ? error.info
      : typeof error?.error === "string"
      ? error.error
      : "Live media provider request failed.";
    throw new FloridaClassDDailyProviderError(
      providerMessage,
      response.status >= 500 ? 502 : response.status,
      "FDACS_MEDIA_PROVIDER_FAILED",
    );
  }
  return payload as T;
}
