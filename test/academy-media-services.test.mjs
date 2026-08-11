import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const configuration = JSON.parse(
  fs.readFileSync("config/academy-media-services.json", "utf8"),
);
const adapter = fs.readFileSync("lib/academy-media-services.ts", "utf8");
const route = fs.readFileSync(
  "app/api/admin/academy-media/status/route.ts",
  "utf8",
);
const environment = fs.readFileSync(".env.example", "utf8");

const serializedConfiguration = JSON.stringify(configuration);

test("media services configuration preserves provider roles and governed endpoints", () => {
  assert.equal(configuration.heygen.role, "authoritative-presenter");
  assert.equal(configuration.pollo.role, "cinematic-visual-and-campaign");
  assert.equal(configuration.heygen.apiBaseUrl, "https://api.heygen.com");
  assert.equal(configuration.heygen.templatesPath, "/v2/templates");
  assert.equal(configuration.pollo.apiBaseUrl, "https://pollo.ai/api/platform");
  assert.equal(configuration.pollo.creditBalancePath, "/credit/balance");
  assert.equal(configuration.security.automaticProviderSpending, false);
  assert.equal(configuration.security.automaticCreditRefill, false);
  assert.equal(configuration.security.secretsInSourceControl, false);
});

test("media services configuration contains no credential values", () => {
  for (const marker of [
    /sk[-_][a-z0-9]/i,
    /api[_-]?key["']?\s*:\s*["'][^"']+/i,
    /access[_-]?token["']?\s*:\s*["'][^"']+/i,
    /client[_-]?secret["']?\s*:\s*["'][^"']+/i,
    /webhook[_-]?secret["']?\s*:\s*["'][^"']+/i,
  ]) {
    assert.doesNotMatch(serializedConfiguration, marker);
  }
});

test("media service adapter defaults to manual mode and blocks automatic spending", () => {
  assert.match(adapter, /defaultIntegrationMode/);
  assert.match(adapter, /automaticProviderSpending/);
  assert.match(adapter, /automaticCreditRefill/);
  assert.match(adapter, /HEYGEN_MANUAL_SETUP_COMPLETE/);
  assert.match(adapter, /POLLO_MANUAL_SETUP_COMPLETE/);
  assert.match(adapter, /POLLO_PRIVATE_MODE_CONFIRMED/);
  assert.match(adapter, /mode === "api"/);
  assert.match(adapter, /X-Api-Key/);
  assert.match(adapter, /x-api-key/);
});

test("media service probe is bounded and returns only sanitized result fields", () => {
  assert.match(adapter, /AbortController/);
  assert.match(adapter, /probeTimeoutMilliseconds/);
  assert.match(adapter, /cache: "no-store"/);
  const resultObjectStart = adapter.indexOf("const result = {");
  const probeLogicStart = adapter.indexOf(
    "if (status.heygen.mode === \"api\"",
    resultObjectStart,
  );
  assert.ok(resultObjectStart >= 0 && probeLogicStart > resultObjectStart);
  const resultShape = adapter.slice(resultObjectStart, probeLogicStart);
  assert.doesNotMatch(resultShape, /API_KEY|ACCESS_TOKEN|CLIENT_SECRET|WEBHOOK_SECRET/);
  assert.match(resultShape, /templatesAvailable/);
  assert.match(resultShape, /availableCredits/);
  assert.match(adapter, /return \{ status, probe: result \} as const/);
});

test("media status endpoint is owner only, noncacheable, and nonindexable", () => {
  assert.match(route, /ownerEmailAllowed/);
  assert.match(route, /return securedJson\(\{ error: "Not found" \}, 404\)/);
  assert.match(route, /private, no-store, max-age=0/);
  assert.match(route, /default-src 'none'/);
  assert.match(route, /frame-ancestors 'none'/);
  assert.match(route, /noindex, nofollow, noarchive/);
  assert.doesNotMatch(route, /HEYGEN_API_KEY/);
  assert.doesNotMatch(route, /POLLO_API_KEY/);
});

test("environment template supports manual first and separately authorized API modes", () => {
  assert.match(environment, /HEYGEN_INTEGRATION_MODE=manual/);
  assert.match(environment, /HEYGEN_MANUAL_SETUP_COMPLETE=false/);
  assert.match(environment, /HEYGEN_AVATAR_ID=/);
  assert.match(environment, /HEYGEN_VOICE_ID=/);
  assert.match(environment, /POLLO_INTEGRATION_MODE=manual/);
  assert.match(environment, /POLLO_MANUAL_SETUP_COMPLETE=false/);
  assert.match(environment, /POLLO_PRIVATE_MODE_CONFIRMED=false/);
  assert.match(environment, /API mode is separately/);
});
