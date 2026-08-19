import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  ConnectorRuntimeError,
  type ConnectorFailureClass,
  type ConnectorOperationContext,
  type ConnectorRiskTier,
} from "./contracts";
import {
  appendConnectorHealthEvent,
  enqueueConnectorFailure,
  getConnectorConfiguration,
  loadConnectorSecretEnvelope,
  persistConnectorHealth,
} from "./repository";
import { decryptConnectorSecret } from "./secret-envelope";
import {
  DEFAULT_CONNECTOR_RETRY_POLICY,
  circuitIsOpen,
  executeWithConnectorResilience,
  exponentialBackoff,
  nextCircuitStateAfterFailure,
  type ConnectorRetryPolicy,
} from "./resilience";
import { buildConnectorUrl, validateConnectorBaseUrl } from "./url-policy";

const SAFE_HEADER_NAME = /^[A-Za-z0-9-]{1,64}$/;
const ALLOWED_AUTH_HEADERS = new Set(["authorization", "x-api-key", "api-key"]);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const IDEMPOTENCY_REQUIRED_TIERS = new Set<ConnectorRiskTier>([
  "consequential",
  "privileged",
  "regulated",
]);

export type ConnectorHttpAuth =
  | {
      type: "bearer";
      secretName: string;
    }
  | {
      type: "header";
      secretName: string;
      headerName: "x-api-key" | "api-key";
      prefix?: string;
    };

export type ConnectorHttpRequest = {
  ownerUserId: string;
  tenantKey: string;
  connectorKey: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  riskTier?: ConnectorRiskTier;
  auth: ConnectorHttpAuth;
  headers?: Readonly<Record<string, string>>;
  body?: string;
  idempotencyKey?: string;
  correlationId?: string;
  policy?: ConnectorRetryPolicy;
  signal?: AbortSignal;
};

export type ConnectorHttpResult = {
  response: Response;
  context: ConnectorOperationContext;
  attempts: number;
};

function policyError(message: string, code: string, status = 400): never {
  throw new ConnectorRuntimeError(message, code, "policy_denied", status, false);
}

function secretDigest(value: string | undefined) {
  if (!value) return null;
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizedHeaderName(value: string) {
  const name = value.trim().toLowerCase();
  if (!SAFE_HEADER_NAME.test(name)) policyError("Connector header name is invalid.", "OBSERRA_CONNECTOR_HEADER_REJECTED");
  return name;
}

function validateCallerHeaders(headers: Readonly<Record<string, string>> | undefined) {
  const safe = new Headers();
  for (const [rawName, rawValue] of Object.entries(headers ?? {})) {
    const name = normalizedHeaderName(rawName);
    if (
      name === "authorization"
      || name === "cookie"
      || name === "host"
      || name === "connection"
      || name === "content-length"
      || name === "transfer-encoding"
      || name === "x-forwarded-for"
      || name === "x-forwarded-host"
      || name === "x-forwarded-proto"
    ) {
      policyError("Connector request attempted to override a protected header.", "OBSERRA_CONNECTOR_HEADER_REJECTED");
    }
    if (rawValue.length > 8_192 || /[\r\n]/.test(rawValue)) {
      policyError("Connector header value is invalid.", "OBSERRA_CONNECTOR_HEADER_REJECTED");
    }
    safe.set(name, rawValue);
  }
  return safe;
}

function applyAuthentication(headers: Headers, auth: ConnectorHttpAuth, secret: string) {
  if (auth.type === "bearer") {
    headers.set("authorization", `Bearer ${secret}`);
    return;
  }
  const headerName = normalizedHeaderName(auth.headerName);
  if (!ALLOWED_AUTH_HEADERS.has(headerName)) {
    policyError("Connector authentication header is not approved.", "OBSERRA_CONNECTOR_AUTH_HEADER_REJECTED");
  }
  const prefix = auth.prefix?.trim() ?? "";
  if (prefix.length > 64 || /[\r\n]/.test(prefix)) {
    policyError("Connector authentication prefix is invalid.", "OBSERRA_CONNECTOR_AUTH_HEADER_REJECTED");
  }
  headers.set(headerName, prefix ? `${prefix} ${secret}` : secret);
}

function requireSafeBody(body: string | undefined) {
  if (body === undefined) return;
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    policyError("Connector request body is too large.", "OBSERRA_CONNECTOR_BODY_TOO_LARGE", 413);
  }
}

function requireIdempotency(method: string, riskTier: ConnectorRiskTier, idempotencyKey?: string) {
  if (!MUTATING_METHODS.has(method) || !IDEMPOTENCY_REQUIRED_TIERS.has(riskTier)) return;
  if (!idempotencyKey || idempotencyKey.length < 12 || idempotencyKey.length > 255 || /[\r\n]/.test(idempotencyKey)) {
    policyError(
      "Consequential connector mutations require a bounded idempotency key.",
      "OBSERRA_CONNECTOR_IDEMPOTENCY_REQUIRED",
    );
  }
}

function failureState(error: ConnectorRuntimeError) {
  if (error.failureClass === "configuration") return "misconfigured" as const;
  if (error.failureClass === "circuit_open") return "open_circuit" as const;
  if (error.failureClass === "authentication" || error.failureClass === "authorization") return "unavailable" as const;
  return error.retryable ? "degraded" as const : "unavailable" as const;
}

function normalizeFailure(error: unknown) {
  if (error instanceof ConnectorRuntimeError) return error;
  return new ConnectorRuntimeError(
    "Connector request failed.",
    "OBSERRA_CONNECTOR_REQUEST_FAILED",
    "transient",
    503,
    true,
  );
}

export async function executeConnectorHttp(input: ConnectorHttpRequest): Promise<ConnectorHttpResult> {
  const correlationId = input.correlationId ?? randomUUID();
  const riskTier = input.riskTier ?? "read";
  const method = input.method ?? "GET";
  const policy = input.policy ?? DEFAULT_CONNECTOR_RETRY_POLICY;
  const connector = await getConnectorConfiguration({
    ownerUserId: input.ownerUserId,
    tenantKey: input.tenantKey,
    connectorKey: input.connectorKey,
  });

  if (!connector?.activated) {
    throw new ConnectorRuntimeError(
      "Connector is not activated.",
      "OBSERRA_CONNECTOR_INACTIVE",
      "configuration",
      503,
      false,
    );
  }

  const normalized = validateConnectorBaseUrl({
    url: connector.baseUrl,
    allowedHostnames: [connector.allowedHostname],
  });
  const targetUrl = buildConnectorUrl(normalized.baseUrl, input.path);
  requireSafeBody(input.body);
  requireIdempotency(method, riskTier, input.idempotencyKey);

  const secretRecord = await loadConnectorSecretEnvelope({
    connectorId: connector.connectorId,
    ownerUserId: connector.ownerUserId,
    tenantKey: connector.tenantKey,
    secretName: input.auth.secretName,
  });
  if (!secretRecord) {
    throw new ConnectorRuntimeError(
      "Connector credential is unavailable.",
      "OBSERRA_CONNECTOR_SECRET_MISSING",
      "configuration",
      503,
      false,
    );
  }

  const secret = decryptConnectorSecret(secretRecord.secretEnvelope, {
    connectorId: connector.connectorId,
    tenantKey: connector.tenantKey,
    secretName: input.auth.secretName,
  });
  const operationContext: ConnectorOperationContext = {
    connectorId: connector.connectorId,
    ownerUserId: connector.ownerUserId,
    tenantKey: connector.tenantKey,
    connectorKey: connector.connectorKey,
    provider: connector.provider,
    correlationId,
    riskTier,
    idempotencyKey: input.idempotencyKey,
  };
  const startedAt = Date.now();

  try {
    if (circuitIsOpen({ failureCount: connector.failureCount, openUntil: connector.circuitOpenUntil })) {
      throw new ConnectorRuntimeError(
        "Connector circuit is open.",
        "OBSERRA_CONNECTOR_CIRCUIT_OPEN",
        "circuit_open",
        503,
        true,
      );
    }

    const result = await executeWithConnectorResilience({
      circuit: { failureCount: connector.failureCount, openUntil: connector.circuitOpenUntil },
      policy,
      signal: input.signal,
      request: async (signal) => {
        const headers = validateCallerHeaders(input.headers);
        headers.set("accept", headers.get("accept") ?? "application/json");
        headers.set("x-obserra-correlation-id", correlationId);
        if (input.idempotencyKey) headers.set("idempotency-key", input.idempotencyKey);
        applyAuthentication(headers, input.auth, secret);
        return fetch(targetUrl, {
          method,
          headers,
          body: input.body,
          cache: "no-store",
          redirect: "error",
          signal,
        });
      },
    });

    const latencyMs = Math.max(0, Date.now() - startedAt);
    await persistConnectorHealth({
      connectorId: connector.connectorId,
      ownerUserId: connector.ownerUserId,
      tenantKey: connector.tenantKey,
      state: "healthy",
      failureCount: result.circuit.failureCount,
      circuitOpenUntil: result.circuit.openUntil,
      lastErrorCode: null,
      success: true,
    });
    await appendConnectorHealthEvent({
      ...operationContext,
      state: "healthy",
      failureClass: null,
      errorCode: null,
      latencyMs,
      attemptCount: result.attempts,
      providerStatus: result.response.status,
      occurredAt: new Date().toISOString(),
    });
    return { response: result.response, context: operationContext, attempts: result.attempts };
  } catch (caught) {
    const error = normalizeFailure(caught);
    const nextCircuit = nextCircuitStateAfterFailure(
      { failureCount: connector.failureCount, openUntil: connector.circuitOpenUntil },
      policy,
    );
    const state = failureState(error);
    const attempts = error.retryable ? policy.maxAttempts : 1;
    const latencyMs = Math.max(0, Date.now() - startedAt);

    await persistConnectorHealth({
      connectorId: connector.connectorId,
      ownerUserId: connector.ownerUserId,
      tenantKey: connector.tenantKey,
      state,
      failureCount: nextCircuit.failureCount,
      circuitOpenUntil: state === "open_circuit" || circuitIsOpen(nextCircuit) ? nextCircuit.openUntil : null,
      lastErrorCode: error.code,
      success: false,
    });
    await appendConnectorHealthEvent({
      ...operationContext,
      state,
      failureClass: error.failureClass as ConnectorFailureClass,
      errorCode: error.code,
      latencyMs,
      attemptCount: attempts,
      providerStatus: error.status >= 400 && error.status <= 599 ? error.status : null,
      occurredAt: new Date().toISOString(),
    });

    if (error.retryable) {
      await enqueueConnectorFailure({
        connectorId: connector.connectorId,
        ownerUserId: connector.ownerUserId,
        tenantKey: connector.tenantKey,
        correlationId,
        operationKey: `${connector.connectorKey}:${method.toLowerCase()}`,
        failureClass: error.failureClass,
        errorCode: error.code,
        payloadDigest: secretDigest(input.body),
        nextAttemptAt: new Date(Date.now() + exponentialBackoff(1, policy)).toISOString(),
      });
    }
    throw error;
  }
}
