import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ConnectorRuntimeError,
  type ConnectorConfiguration,
  type ConnectorHealthEvent,
  type ConnectorHealthState,
} from "./contracts";
import {
  type ConnectorConfigurationRow,
  type ConnectorDatabase,
  type ConnectorUpdate,
  type Json,
} from "./database";

const CANONICAL_CONNECTOR_PROJECT_REF = "ftkjhmtfyfkartfsnkjb";
const CANONICAL_CONNECTOR_ORIGIN = `https://${CANONICAL_CONNECTOR_PROJECT_REF}.supabase.co`;
const CONNECTORS_TABLE = "public.integration_connectors";
const HEALTH_EVENTS_TABLE = "public.integration_connector_health_events";
const FAILURES_TABLE = "public.integration_connector_failures";
const PRIVATE_SECRETS_TABLE = "connector_private.connector_secrets";
const TENANT_KEY_PATTERN = /^[a-z0-9][a-z0-9_.:-]{1,127}$/;
const CONNECTOR_KEY_PATTERN = /^[a-z0-9][a-z0-9_.:-]{1,127}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ConnectorStorageClient = SupabaseClient<ConnectorDatabase>;

function storageError(message: string, code = "OBSERRA_CONNECTOR_STORAGE_UNAVAILABLE", status = 503): never {
  throw new ConnectorRuntimeError(message, code, "configuration", status, false);
}

function serviceRoleKeyLooksValid(value: string) {
  if (value.startsWith("sb_secret_") && value.length >= 32) return true;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function connectorStorageConfig() {
  const rawUrl = process.env.OBSERRA_CONNECTOR_SUPABASE_URL?.trim() || CANONICAL_CONNECTOR_ORIGIN;
  const serviceRoleKey = process.env.OBSERRA_CONNECTOR_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    storageError("Connector storage origin is invalid.", "OBSERRA_CONNECTOR_STORAGE_CONFIGURATION_INVALID");
  }
  if (
    url.origin !== CANONICAL_CONNECTOR_ORIGIN
    || url.protocol !== "https:"
    || url.username
    || url.password
    || url.search
    || url.hash
    || (url.pathname !== "/" && url.pathname !== "")
    || !serviceRoleKeyLooksValid(serviceRoleKey)
  ) {
    storageError("Connector storage is not configured for the canonical identity project.", "OBSERRA_CONNECTOR_STORAGE_CONFIGURATION_INVALID");
  }
  return { url: url.origin, serviceRoleKey };
}

function connectorStorageClient(): ConnectorStorageClient {
  const config = connectorStorageConfig();
  return createClient<ConnectorDatabase>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-obserra-runtime": "connector-control-plane/service_role",
      },
    },
  });
}

function requireTenantKey(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!TENANT_KEY_PATTERN.test(normalized)) {
    throw new ConnectorRuntimeError("Connector tenant key is invalid.", "OBSERRA_CONNECTOR_TENANT_INVALID", "policy_denied", 400, false);
  }
  return normalized;
}

function requireConnectorKey(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!CONNECTOR_KEY_PATTERN.test(normalized)) {
    throw new ConnectorRuntimeError("Connector key is invalid.", "OBSERRA_CONNECTOR_KEY_INVALID", "policy_denied", 400, false);
  }
  return normalized;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new ConnectorRuntimeError(`${field} is invalid.`, "OBSERRA_CONNECTOR_IDENTITY_INVALID", "policy_denied", 400, false);
  }
  return value;
}

function mapConnector(row: ConnectorConfigurationRow): ConnectorConfiguration {
  return {
    connectorId: row.id,
    ownerUserId: row.owner_user_id,
    tenantKey: row.tenant_key,
    connectorKey: row.connector_key,
    provider: row.provider,
    displayName: row.display_name,
    baseUrl: row.base_url,
    allowedHostname: row.allowed_hostname,
    activated: row.activated,
    healthState: row.health_state,
    failureCount: row.failure_count,
    circuitOpenUntil: row.circuit_open_until,
    lastSuccessAt: row.last_success_at,
    lastFailureAt: row.last_failure_at,
    lastErrorCode: row.last_error_code,
    configVersion: row.config_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function singleConnector(
  client: ConnectorStorageClient,
  ownerUserId: string,
  tenantKey: string,
  connectorKey: string,
) {
  const result = await client
    .from("integration_connectors")
    .select("id,owner_user_id,tenant_key,connector_key,provider,display_name,base_url,allowed_hostname,activated,health_state,failure_count,circuit_open_until,last_success_at,last_failure_at,last_error_code,config_version,created_at,updated_at")
    .eq("owner_user_id", requireUuid(ownerUserId, "Owner user ID"))
    .eq("tenant_key", requireTenantKey(tenantKey))
    .eq("connector_key", requireConnectorKey(connectorKey))
    .maybeSingle();
  if (result.error) storageError("Connector configuration lookup failed.");
  return result.data ? mapConnector(result.data) : null;
}

export async function getConnectorConfiguration(input: {
  ownerUserId: string;
  tenantKey: string;
  connectorKey: string;
}) {
  return singleConnector(connectorStorageClient(), input.ownerUserId, input.tenantKey, input.connectorKey);
}

export async function upsertConnectorConfiguration(input: {
  ownerUserId: string;
  tenantKey: string;
  connectorKey: string;
  provider: string;
  displayName: string;
  baseUrl: string;
  allowedHostname: string;
  provenance?: Json;
}) {
  const client = connectorStorageClient();
  const ownerUserId = requireUuid(input.ownerUserId, "Owner user ID");
  const tenantKey = requireTenantKey(input.tenantKey);
  const connectorKey = requireConnectorKey(input.connectorKey);
  const provider = input.provider.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!provider || provider.length > 120 || !displayName || displayName.length > 200) {
    throw new ConnectorRuntimeError("Connector provider metadata is invalid.", "OBSERRA_CONNECTOR_CONFIGURATION_INVALID", "policy_denied", 400, false);
  }

  const result = await client
    .from("integration_connectors")
    .upsert({
      owner_user_id: ownerUserId,
      tenant_key: tenantKey,
      connector_key: connectorKey,
      provider,
      display_name: displayName,
      base_url: input.baseUrl,
      allowed_hostname: input.allowedHostname,
      activated: false,
      health_state: "inactive",
      provenance: input.provenance ?? {},
    }, { onConflict: "owner_user_id,tenant_key,connector_key" })
    .select("id,owner_user_id,tenant_key,connector_key,provider,display_name,base_url,allowed_hostname,activated,health_state,failure_count,circuit_open_until,last_success_at,last_failure_at,last_error_code,config_version,created_at,updated_at")
    .single();
  if (result.error || !result.data) storageError("Connector configuration persistence failed.");
  return mapConnector(result.data);
}

export async function setConnectorActivation(input: {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  activated: boolean;
  healthState: ConnectorHealthState;
}) {
  const result = await connectorStorageClient()
    .from("integration_connectors")
    .update({
      activated: input.activated,
      health_state: input.healthState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requireUuid(input.connectorId, "Connector ID"))
    .eq("owner_user_id", requireUuid(input.ownerUserId, "Owner user ID"))
    .eq("tenant_key", requireTenantKey(input.tenantKey))
    .select("id,owner_user_id,tenant_key,connector_key,provider,display_name,base_url,allowed_hostname,activated,health_state,failure_count,circuit_open_until,last_success_at,last_failure_at,last_error_code,config_version,created_at,updated_at")
    .single();
  if (result.error || !result.data) storageError("Connector activation persistence failed.");
  return mapConnector(result.data);
}

export async function persistConnectorSecret(input: {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  secretName: string;
  secretEnvelope: string;
  encryptionKeyId: string;
}) {
  const secretName = input.secretName.trim().toLowerCase();
  if (!CONNECTOR_KEY_PATTERN.test(secretName) || input.secretEnvelope.length > 100_000) {
    throw new ConnectorRuntimeError("Connector secret metadata is invalid.", "OBSERRA_CONNECTOR_SECRET_INVALID", "policy_denied", 400, false);
  }
  const result = await connectorStorageClient().rpc("obserra_connector_store_secret", {
    p_connector_id: requireUuid(input.connectorId, "Connector ID"),
    p_owner_user_id: requireUuid(input.ownerUserId, "Owner user ID"),
    p_tenant_key: requireTenantKey(input.tenantKey),
    p_secret_name: secretName,
    p_secret_envelope: input.secretEnvelope,
    p_encryption_key_id: input.encryptionKeyId,
  });
  if (result.error) storageError(`Connector secret persistence failed for ${PRIVATE_SECRETS_TABLE}.`);
}

export async function loadConnectorSecretEnvelope(input: {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  secretName: string;
}) {
  const result = await connectorStorageClient().rpc("obserra_connector_load_secret", {
    p_connector_id: requireUuid(input.connectorId, "Connector ID"),
    p_owner_user_id: requireUuid(input.ownerUserId, "Owner user ID"),
    p_tenant_key: requireTenantKey(input.tenantKey),
    p_secret_name: requireConnectorKey(input.secretName),
  });
  if (result.error) storageError(`Connector secret lookup failed for ${PRIVATE_SECRETS_TABLE}.`);
  const row = result.data?.[0];
  if (!row) return null;
  if (typeof row.secret_envelope !== "string" || typeof row.encryption_key_id !== "string") {
    storageError("Connector secret lookup returned an invalid response.", "OBSERRA_CONNECTOR_STORAGE_INVALID_RESPONSE", 500);
  }
  return {
    secretEnvelope: row.secret_envelope,
    encryptionKeyId: row.encryption_key_id,
  };
}

export async function persistConnectorHealth(input: {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  state: ConnectorHealthState;
  failureCount: number;
  circuitOpenUntil: string | null;
  lastErrorCode: string | null;
  success: boolean;
}) {
  const now = new Date().toISOString();
  const patch: ConnectorUpdate = {
    health_state: input.state,
    failure_count: Math.max(0, Math.floor(input.failureCount)),
    circuit_open_until: input.circuitOpenUntil,
    last_error_code: input.lastErrorCode,
    updated_at: now,
  };
  if (input.success) patch.last_success_at = now;
  else patch.last_failure_at = now;

  const result = await connectorStorageClient()
    .from("integration_connectors")
    .update(patch)
    .eq("id", requireUuid(input.connectorId, "Connector ID"))
    .eq("owner_user_id", requireUuid(input.ownerUserId, "Owner user ID"))
    .eq("tenant_key", requireTenantKey(input.tenantKey));
  if (result.error) storageError(`Connector health update failed for ${CONNECTORS_TABLE}.`);
}

export async function appendConnectorHealthEvent(event: ConnectorHealthEvent) {
  const result = await connectorStorageClient().from("integration_connector_health_events").insert({
    connector_id: requireUuid(event.connectorId, "Connector ID"),
    owner_user_id: requireUuid(event.ownerUserId, "Owner user ID"),
    tenant_key: requireTenantKey(event.tenantKey),
    connector_key: requireConnectorKey(event.connectorKey),
    provider: event.provider,
    correlation_id: requireUuid(event.correlationId, "Correlation ID"),
    health_state: event.state,
    failure_class: event.failureClass,
    error_code: event.errorCode,
    latency_ms: event.latencyMs,
    attempt_count: event.attemptCount,
    provider_status: event.providerStatus,
    occurred_at: event.occurredAt,
  });
  if (result.error) storageError(`Connector health event append failed for ${HEALTH_EVENTS_TABLE}.`);
}

export async function enqueueConnectorFailure(input: {
  connectorId: string;
  ownerUserId: string;
  tenantKey: string;
  correlationId: string;
  operationKey: string;
  failureClass: string;
  errorCode: string;
  payloadDigest: string | null;
  nextAttemptAt: string;
}) {
  const result = await connectorStorageClient().from("integration_connector_failures").insert({
    connector_id: requireUuid(input.connectorId, "Connector ID"),
    owner_user_id: requireUuid(input.ownerUserId, "Owner user ID"),
    tenant_key: requireTenantKey(input.tenantKey),
    correlation_id: requireUuid(input.correlationId, "Correlation ID"),
    operation_key: requireConnectorKey(input.operationKey),
    failure_class: input.failureClass,
    error_code: input.errorCode,
    payload_digest: input.payloadDigest,
    next_attempt_at: input.nextAttemptAt,
  });
  if (result.error) storageError(`Connector failure queue append failed for ${FAILURES_TABLE}.`);
}
