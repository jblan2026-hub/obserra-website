import "server-only";

export type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  operation: string;
};

export type ResilienceResult<T> = {
  value: T;
  attempts: number;
  recovered: boolean;
  durationMs: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(level: "info" | "warn" | "error", payload: Record<string, unknown>) {
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  writer(JSON.stringify({ level, service: "obserra-resilience", timestamp: new Date().toISOString(), ...payload }));
}

export async function withResilience<T>(work: (signal: AbortSignal, attempt: number) => Promise<T>, options: RetryOptions): Promise<ResilienceResult<T>> {
  const attempts = Math.max(1, Math.min(options.attempts ?? 3, 5));
  const baseDelayMs = Math.max(25, options.baseDelayMs ?? 150);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 1200);
  const timeoutMs = Math.max(250, options.timeoutMs ?? 12_000);
  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const value = await work(controller.signal, attempt);
      clearTimeout(timer);
      const result = { value, attempts: attempt, recovered: attempt > 1, durationMs: Date.now() - startedAt };
      log(attempt > 1 ? "warn" : "info", { event: "operation_succeeded", operation: options.operation, ...result });
      return result;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      log(attempt === attempts ? "error" : "warn", {
        event: attempt === attempts ? "operation_failed" : "operation_retry",
        operation: options.operation,
        attempt,
        attempts,
        error: error instanceof Error ? error.message : String(error),
      });
      if (attempt < attempts) {
        const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 75);
        await sleep(delay);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${options.operation} failed`);
}

export async function safeFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T> | T, operation: string): Promise<{ value: T; degraded: boolean }> {
  try {
    return { value: await primary(), degraded: false };
  } catch (error) {
    log("error", { event: "fallback_activated", operation, error: error instanceof Error ? error.message : String(error) });
    return { value: await fallback(), degraded: true };
  }
}
