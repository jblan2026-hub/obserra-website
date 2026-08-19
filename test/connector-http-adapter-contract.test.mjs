import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("connector HTTP adapter composes tenant scope, encrypted credentials, SSRF policy, resilience, and telemetry", () => {
  const adapter = read("lib/connectors/http-adapter.ts");

  assert.match(adapter, /import "server-only"/);
  assert.match(adapter, /getConnectorConfiguration/);
  assert.match(adapter, /loadConnectorSecretEnvelope/);
  assert.match(adapter, /decryptConnectorSecret/);
  assert.match(adapter, /validateConnectorBaseUrl/);
  assert.match(adapter, /buildConnectorUrl/);
  assert.match(adapter, /executeWithConnectorResilience/);
  assert.match(adapter, /persistConnectorHealth/);
  assert.match(adapter, /appendConnectorHealthEvent/);
  assert.match(adapter, /enqueueConnectorFailure/);
  assert.match(adapter, /activated/);
  assert.match(adapter, /OBSERRA_CONNECTOR_INACTIVE/);
  assert.match(adapter, /redirect:\s*"error"/);
  assert.match(adapter, /cache:\s*"no-store"/);
  assert.match(adapter, /idempotency/i);
  assert.match(adapter, /retry-after/i);
  assert.match(adapter, /correlationId/);
  assert.match(adapter, /authorization/i);
  assert.doesNotMatch(adapter, /console\.(log|debug|info)\([^\n]*(secret|authorization|token)/i);
  assert.doesNotMatch(adapter, /NEXT_PUBLIC_/);
});
