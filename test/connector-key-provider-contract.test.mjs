import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("connector encryption keys use a production Key Vault provider with fail-closed rotation and local bootstrap fallback", () => {
  const provider = read("lib/connectors/key-provider.ts");
  const envelope = read("lib/connectors/secret-envelope.ts");
  const adapter = read("lib/connectors/http-adapter.ts");

  assert.match(provider, /azure-key-vault/);
  assert.match(provider, /\.vault\.azure\.net/);
  assert.match(provider, /OBSERRA_CONNECTOR_AZURE_KEY_MAP_JSON/);
  assert.match(provider, /OBSERRA_CONNECTOR_AZURE_KEY_VAULT_API_VERSION/);
  assert.match(provider, /immutable secret version/i);
  assert.match(provider, /https:\/\/vault\.azure\.net\/\.default/);
  assert.match(provider, /grant_type:\s*"client_credentials"/);
  assert.match(provider, /client_assertion_type/);
  assert.match(provider, /VERCEL_OIDC_TOKEN/);
  assert.match(provider, /OBSERRA_CONNECTOR_AZURE_FEDERATED_AUDIENCE/);
  assert.match(provider, /OBSERRA_CONNECTOR_AZURE_CLIENT_SECRET/);
  assert.match(provider, /AbortSignal\.timeout/);
  assert.match(provider, /retryAfter/);
  assert.match(provider, /exponentialBackoff/);
  assert.match(provider, /azureAccessTokenCache/);
  assert.match(provider, /azureKeyCache/);
  assert.match(provider, /VERCEL_ENV === "production"/);
  assert.match(provider, /OBSERRA_CONNECTOR_ENVIRONMENT_KEY_PROVIDER_FORBIDDEN/);
  assert.match(provider, /resolveActiveConnectorEncryptionKey/);
  assert.match(provider, /resolveConnectorEncryptionKey/);
  assert.doesNotMatch(provider, /NEXT_PUBLIC_/);
  assert.doesNotMatch(provider, /console\.(?:log|info|warn|error)/);

  assert.match(envelope, /aes-256-gcm/);
  assert.match(envelope, /additionalAuthenticatedData/);
  assert.match(envelope, /await resolveActiveConnectorEncryptionKey/);
  assert.match(envelope, /await resolveConnectorEncryptionKey/);
  assert.match(envelope, /activeKey\.keyId/);
  assert.doesNotMatch(envelope, /process\.env\.OBSERRA_CONNECTOR_ENCRYPTION_KEY/);

  assert.match(adapter, /await decryptConnectorSecret/);
});
