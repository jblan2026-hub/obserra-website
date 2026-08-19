export type ConnectorHealthState =
  | "inactive"
  | "healthy"
  | "degraded"
  | "unavailable"
  | "open_circuit"
  | "misconfigured";

export type ConnectorFailureClass =
  | "configuration"
  | "authentication"
  | "authorization"
  | "rate_limit"
  | "timeout"
  | "transient"
  | "provider_rejected"
  | "invalid_response"
  | "circuit_open"
  | "policy_denied";

export type ConnectorRiskTier = "read" | "low" | "consequential" | "privileged" | "regulated";

export type ConnectorIdentity = {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  connectorKey: string;
  provider: string;
};

export type ConnectorConfiguration = ConnectorIdentity & {
  displayName: string;
  baseUrl: string;
  allowedHostname: string;
  activated: boolean;
  healthState: ConnectorHealthState;
  failureCount: number;
  circuitOpenUntil: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastErrorCode: string | null;
  configVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type ConnectorSecretContext = {
  connectorId: string;
  tenantKey: string;
  secretName: string;
};

export type ConnectorHealthEvent = ConnectorIdentity & {
  correlationId: string;
  state: ConnectorHealthState;
  failureClass: ConnectorFailureClass | null;
  errorCode: string | null;
  latencyMs: number | null;
  attemptCount: number;
  providerStatus: number | null;
  occurredAt: string;
};

export type ConnectorOperationContext = ConnectorIdentity & {
  correlationId: string;
  riskTier: ConnectorRiskTier;
  idempotencyKey?: string;
};

export class ConnectorRuntimeError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly failureClass: ConnectorFailureClass,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ConnectorRuntimeError";
  }
}
