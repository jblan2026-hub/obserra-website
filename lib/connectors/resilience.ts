import "server-only";

import { ConnectorRuntimeError } from "./contracts";

export type DurableCircuitState = {
  failureCount: number;
  openUntil: string | null;
};

export type ConnectorRetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  requestTimeoutMs: number;
  failureThreshold: number;
  circuitOpenMs: number;
};

export const DEFAULT_CONNECTOR_RETRY_POLICY: ConnectorRetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 4_000,
  requestTimeoutMs: 10_000,
  failureThreshold: 5,
  circuitOpenMs: 30_000,
};

export function exponentialBackoff(
  attempt: number,
  policy: ConnectorRetryPolicy = DEFAULT_CONNECTOR_RETRY_POLICY,
  jitter = Math.random,
) {
  const boundedAttempt = Math.max(1, Math.floor(attempt));
  const ceiling = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * (2 ** (boundedAttempt - 1)),
  );
  return Math.max(0, Math.floor(ceiling * (0.5 + (jitter() * 0.5))));
}

export function retryAfter(value: string | null, nowMs = Date.now()) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1_000);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, timestamp - nowMs);
}

export function circuitIsOpen(state: DurableCircuitState, nowMs = Date.now()) {
  if (!state.openUntil) return false;
  const openUntil = Date.parse(state.openUntil);
  return Number.isFinite(openUntil) && openUntil > nowMs;
}

export function nextCircuitStateAfterFailure(
  state: DurableCircuitState,
  policy: ConnectorRetryPolicy = DEFAULT_CONNECTOR_RETRY_POLICY,
  nowMs = Date.now(),
): DurableCircuitState {
  const failureCount = Math.max(0, state.failureCount) + 1;
  const openUntil = failureCount >= policy.failureThreshold
    ? new Date(nowMs + policy.circuitOpenMs).toISOString()
    : null;
  return { failureCount, openUntil };
}

export function closedCircuitState(): DurableCircuitState {
  return { failureCount: 0, openUntil: null };
}

export function retryableProviderStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function classifyProviderFailure(status: number) {
  if (status === 401) return "authentication" as const;
  if (status === 403) return "authorization" as const;
  if (status === 429) return "rate_limit" as const;
  if (status >= 500) return "transient" as const;
  return "provider_rejected" as const;
}

export async function sleepWithAbort(milliseconds: number, signal?: AbortSignal) {
  if (milliseconds <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    if (!signal) return;
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason instanceof Error ? signal.reason : new Error("aborted"));
    };
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  });
}

export type ResilientConnectorRequestInput = {
  circuit: DurableCircuitState;
  request: (signal: AbortSignal, attempt: number) => Promise<Response>;
  policy?: ConnectorRetryPolicy;
  signal?: AbortSignal;
  now?: () => number;
  jitter?: () => number;
};

export type ResilientConnectorRequestResult = {
  response: Response;
  attempts: number;
  circuit: DurableCircuitState;
};

export async function executeWithConnectorResilience(
  input: ResilientConnectorRequestInput,
): Promise<ResilientConnectorRequestResult> {
  const policy = input.policy ?? DEFAULT_CONNECTOR_RETRY_POLICY;
  const now = input.now ?? Date.now;
  if (circuitIsOpen(input.circuit, now())) {
    throw new ConnectorRuntimeError(
      "Connector circuit is open.",
      "OBSERRA_CONNECTOR_CIRCUIT_OPEN",
      "circuit_open",
      503,
      true,
    );
  }

  let durableCircuit = input.circuit;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (input.signal?.aborted) throw input.signal.reason;
    const timeoutSignal = AbortSignal.timeout(policy.requestTimeoutMs);
    const signal = input.signal
      ? AbortSignal.any([input.signal, timeoutSignal])
      : timeoutSignal;

    try {
      const response = await input.request(signal, attempt);
      if (response.ok) {
        return { response, attempts: attempt, circuit: closedCircuitState() };
      }

      if (!retryableProviderStatus(response.status)) {
        throw new ConnectorRuntimeError(
          "Connector provider rejected the request.",
          "OBSERRA_CONNECTOR_PROVIDER_REJECTED",
          classifyProviderFailure(response.status),
          response.status,
          false,
        );
      }

      durableCircuit = nextCircuitStateAfterFailure(durableCircuit, policy, now());
      if (attempt >= policy.maxAttempts || circuitIsOpen(durableCircuit, now())) {
        throw new ConnectorRuntimeError(
          "Connector provider is temporarily unavailable.",
          "OBSERRA_CONNECTOR_PROVIDER_UNAVAILABLE",
          classifyProviderFailure(response.status),
          503,
          true,
        );
      }

      const providerDelay = retryAfter(response.headers.get("retry-after"), now());
      const backoffDelay = exponentialBackoff(attempt, policy, input.jitter ?? Math.random);
      await sleepWithAbort(Math.min(policy.maxDelayMs, providerDelay ?? backoffDelay), input.signal);
    } catch (error) {
      if (error instanceof ConnectorRuntimeError) throw error;
      lastError = error;
      durableCircuit = nextCircuitStateAfterFailure(durableCircuit, policy, now());
      if (attempt >= policy.maxAttempts || circuitIsOpen(durableCircuit, now())) break;
      await sleepWithAbort(
        exponentialBackoff(attempt, policy, input.jitter ?? Math.random),
        input.signal,
      );
    }
  }

  throw new ConnectorRuntimeError(
    lastError instanceof Error ? "Connector request timed out or failed in transport." : "Connector request failed.",
    "OBSERRA_CONNECTOR_TRANSPORT_FAILURE",
    "timeout",
    503,
    true,
  );
}
