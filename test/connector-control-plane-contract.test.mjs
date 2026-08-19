import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("connector control plane is encrypted, tenant scoped, SSRF safe, fail closed, and durable", () => {
  const contracts = read("lib/connectors/contracts.ts");
  const urls = read("lib/connectors/url-policy.ts");
  const secrets = read("lib/connectors/secret-envelope.ts");
  const keyProvider = read("lib/connectors/key-provider.ts");
  const resilience = read("lib/connectors/resilience.ts");
  const repository = read("lib/connectors/repository.ts");
  const migration = read("supabase/identity/migrations/20260819030000_connector_control_plane.sql");

  assert.match(contracts, /ConnectorHealthState/);
  assert.match(contracts, /"inactive"/);
  assert.match(contracts, /"healthy"/);
  assert.match(contracts, /"degraded"/);
  assert.match(contracts, /"unavailable"/);
  assert.match(contracts, /"open_circuit"/);
  assert.match(contracts, /tenantKey/);
  assert.match(contracts, /connectorId/);
  assert.match(contracts, /correlationId/);

  assert.match(urls, /https:/);
  assert.match(urls, /allowedHostnames/);
  assert.match(urls, /localhost/);
  assert.match(urls, /127\./);
  assert.match(urls, /169\.254\./);
  assert.match(urls, /10\./);
  assert.match(urls, /octets\[0\] === 172/);
  assert.match(urls, /octets\[1\] >= 16/);
  assert.match(urls, /octets\[1\] <= 31/);
  assert.match(urls, /192\.168\./);
  assert.match(urls, /\[::1\]/);
  assert.match(urls, /OBSERRA_CONNECTOR_URL_REJECTED/);

  assert.match(secrets, /aes-256-gcm/);
  assert.match(secrets, /additionalAuthenticatedData/);
  assert.match(secrets, /tenantKey/);
  assert.match(secrets, /connectorId/);
  assert.match(secrets, /secretName/);
  assert.match(secrets, /resolveActiveConnectorEncryptionKey/);
  assert.match(secrets, /resolveConnectorEncryptionKey/);
  assert.doesNotMatch(secrets, /process\.env\.OBSERRA_CONNECTOR_ENCRYPTION_KEY/);
  assert.doesNotMatch(secrets, /NEXT_PUBLIC_/);

  assert.match(keyProvider, /OBSERRA_CONNECTOR_ENCRYPTION_KEY/);
  assert.match(keyProvider, /OBSERRA_CONNECTOR_KEY_PROVIDER/);
  assert.match(keyProvider, /azure-key-vault/);
  assert.match(keyProvider, /OBSERRA_CONNECTOR_AZURE_KEY_MAP_JSON/);
  assert.match(keyProvider, /VERCEL_ENV === "production"/);
  assert.match(keyProvider, /OBSERRA_CONNECTOR_ENVIRONMENT_KEY_PROVIDER_FORBIDDEN/);
  assert.doesNotMatch(keyProvider, /NEXT_PUBLIC_/);

  assert.match(resilience, /exponentialBackoff/);
  assert.match(resilience, /jitter/);
  assert.match(resilience, /retryAfter/);
  assert.match(resilience, /circuit/);
  assert.match(resilience, /failureThreshold/);
  assert.match(resilience, /openUntil/);
  assert.doesNotMatch(resilience, /setInterval/);

  assert.match(repository, /connector_private\.connector_secrets/);
  assert.match(repository, /public\.integration_connectors/);
  assert.match(repository, /public\.integration_connector_health_events/);
  assert.match(repository, /owner_user_id/);
  assert.match(repository, /tenant_key/);
  assert.match(repository, /service_role/);
  assert.match(repository, /persistSession:\s*false/);

  assert.match(migration, /create schema if not exists connector_private/);
  assert.match(migration, /create table public\.integration_connectors/);
  assert.match(migration, /create table connector_private\.connector_secrets/);
  assert.match(migration, /create table public\.integration_connector_health_events/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /force row level security/);
  assert.match(migration, /revoke all on schema connector_private from public, anon, authenticated/);
  assert.match(migration, /owner_user_id uuid not null references auth\.users\(id\)/);
  assert.match(migration, /tenant_key text not null/);
  assert.match(migration, /health_state text not null/);
  assert.match(migration, /failure_count integer not null default 0/);
  assert.match(migration, /circuit_open_until timestamptz/);
  assert.match(migration, /correlation_id uuid not null/);
  assert.match(migration, /secret_envelope text not null/);
  assert.match(migration, /append-only/);
  assert.doesNotMatch(migration, /create table public\.integration_connector_secrets/);
});
