import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const RUNTIME_MODULE = "lib/production-runtime-secrets.ts";
const HEALTH_ROUTE = "app/api/ai-marketplace/commerce-health/route.ts";
const TENANT_ID = "7d8b7b64-c80c-4c8a-a514-66f6b1cf8607";
const CLIENT_ID = "dc3ff3e1-ea35-4879-afa9-fa3eee49df85";
const AZURE_AUDIENCE = "api://AzureADTokenExchange";
const VERCEL_ISSUER = "https://oidc.vercel.com/obserra";
const VERCEL_SUBJECT = "owner:obserra:project:obserra-website-live:environment:production";
const APPLICATION_KEYS = [
  "OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY",
  "OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET",
  "APPLICATIONS_STRIPE_SECRET_KEY",
  "APPLICATIONS_STRIPE_WEBHOOK_SECRET",
  "OBSERRA_APPLICATIONS_PRICE_CATALOG_JSON",
];
const TEST_ENVIRONMENT_KEYS = [
  "VERCEL",
  "VERCEL_ENV",
  "OBSERRA_KEY_VAULT_TENANT_ID",
  "OBSERRA_KEY_VAULT_CLIENT_ID",
  ...APPLICATION_KEYS,
];

function clearTestEnvironment() {
  for (const key of TEST_ENVIRONMENT_KEYS) delete process.env[key];
}

function productionEnvironment() {
  clearTestEnvironment();
  process.env.VERCEL_ENV = "production";
  process.env.OBSERRA_KEY_VAULT_TENANT_ID = TENANT_ID;
  process.env.OBSERRA_KEY_VAULT_CLIENT_ID = CLIENT_ID;
}

function encoded(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function oidcAssertion(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return [
    encoded({ alg: "RS256", typ: "JWT" }),
    encoded({ aud: AZURE_AUDIENCE, exp: now + 300, iat: now, iss: VERCEL_ISSUER, nbf: now - 1, sub: VERCEL_SUBJECT, ...overrides }),
    "signature-placeholder-that-keeps-the-test-assertion-realistically-sized",
  ].join(".");
}

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

function loadRuntime({ fetch, oidc }) {
  const output = ts.transpileModule(fs.readFileSync(RUNTIME_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: RUNTIME_MODULE,
  }).outputText;
  const runtimeModule = { exports: {} };
  vm.runInNewContext(output, {
    AbortSignal,
    Buffer,
    Date,
    Error,
    JSON,
    Map,
    Number,
    Promise,
    URLSearchParams,
    encodeURIComponent,
    exports: runtimeModule.exports,
    fetch,
    module: runtimeModule,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return crypto;
      if (specifier === "@vercel/oidc") return { getVercelOidcToken: oidc };
      throw new Error(`Unexpected runtime test import: ${specifier}`);
    },
  });
  return runtimeModule.exports;
}

test("production hydration uses a fresh exact-audience Vercel assertion without requiring VERCEL=1", async (t) => {
  t.after(clearTestEnvironment);
  productionEnvironment();
  const oidcOptions = [];
  const requests = [];
  const runtime = loadRuntime({
    async oidc(options) {
      oidcOptions.push(options);
      return oidcAssertion();
    },
    async fetch(url, options) {
      requests.push({ url, options });
      if (url.startsWith("https://login.microsoftonline.com/")) {
        return response(200, { access_token: "test-azure-access-token", expires_in: 3600 });
      }
      return response(200, { value: `test-secret-${requests.length}` });
    },
  });

  const evidence = await runtime.ensureApplicationsRuntimeSecrets();

  assert.deepEqual({ ...evidence }, { required: true, state: "ready", stage: "environment", bindingCount: 5 });
  assert.equal(process.env.VERCEL, undefined);
  assert.equal(requests.length, 6);
  assert.equal(oidcOptions.length, 1);
  assert.equal(oidcOptions[0].audience, AZURE_AUDIENCE);
  assert.equal(oidcOptions[0].skipCache, true);
  assert.equal(oidcOptions[0].expirationBufferMs, 30_000);
  assert.match(oidcOptions[0].jti, /^[0-9a-f-]{36}$/);
  assert.equal(requests[0].options.body.get("scope"), "https://vault.azure.net/.default");
  for (const key of APPLICATION_KEYS) assert.match(process.env[key], /^test-secret-/);
});

test("OIDC claim mismatch fails before Azure or Key Vault and returns sanitized stage evidence", async (t) => {
  t.after(clearTestEnvironment);
  productionEnvironment();
  let fetchCalls = 0;
  const runtime = loadRuntime({
    async oidc() {
      return oidcAssertion({ aud: "wrong-audience" });
    },
    async fetch() {
      fetchCalls += 1;
      throw new Error("fetch must not run");
    },
  });

  let failure;
  try {
    await runtime.ensureApplicationsRuntimeSecrets();
  } catch (error) {
    failure = error;
  }

  assert.equal(fetchCalls, 0);
  assert.deepEqual(
    { ...runtime.productionRuntimeSecretsEvidence(failure) },
    { required: true, state: "failed", stage: "vercel-oidc", code: "VERCEL_OIDC_ASSERTION_INVALID", retryable: false, bindingCount: 0 },
  );
  for (const key of APPLICATION_KEYS) assert.equal(process.env[key], undefined);
});

test("Key Vault authorization denial is classified without partially hydrating environment values", async (t) => {
  t.after(clearTestEnvironment);
  productionEnvironment();
  const runtime = loadRuntime({
    async oidc() {
      return oidcAssertion();
    },
    async fetch(url) {
      if (url.startsWith("https://login.microsoftonline.com/")) {
        return response(200, { access_token: "test-azure-access-token", expires_in: 3600 });
      }
      return response(403, { ignored: true });
    },
  });

  let failure;
  try {
    await runtime.ensureApplicationsRuntimeSecrets();
  } catch (error) {
    failure = error;
  }

  assert.deepEqual(
    { ...runtime.productionRuntimeSecretsEvidence(failure) },
    { required: true, state: "failed", stage: "key-vault", code: "KEY_VAULT_AUTHORIZATION_REJECTED", retryable: false, bindingCount: 0 },
  );
  for (const key of APPLICATION_KEYS) assert.equal(process.env[key], undefined);
});

test("one Key Vault 401 triggers one fresh Azure exchange and then hydrates successfully", async (t) => {
  t.after(clearTestEnvironment);
  productionEnvironment();
  let azureCalls = 0;
  let oidcCalls = 0;
  const runtime = loadRuntime({
    async oidc() {
      oidcCalls += 1;
      return oidcAssertion();
    },
    async fetch(url, options) {
      if (url.startsWith("https://login.microsoftonline.com/")) {
        azureCalls += 1;
        return response(200, { access_token: `test-azure-access-token-${azureCalls}`, expires_in: 3600 });
      }
      if (options.headers.authorization === "Bearer test-azure-access-token-1") return response(401, { ignored: true });
      return response(200, { value: "test-secret-after-refresh" });
    },
  });

  const evidence = await runtime.ensureApplicationsRuntimeSecrets();

  assert.equal(evidence.state, "ready");
  assert.equal(azureCalls, 2);
  assert.equal(oidcCalls, 2);
  for (const key of APPLICATION_KEYS) assert.equal(process.env[key], "test-secret-after-refresh");
});

test("commerce health evaluates hydrated bindings and emits only staged non-sensitive failures", () => {
  const route = fs.readFileSync(HEALTH_ROUTE, "utf8");
  const hydration = route.indexOf("await ensureApplicationsRuntimeSecrets()");
  const coverage = route.indexOf("marketplaceV12BindingCoverage()", hydration);

  assert.ok(hydration >= 0);
  assert.ok(coverage > hydration);
  assert.match(route, /productionRuntimeSecretsEvidence\(error\)/);
  assert.match(route, /dependencies:/);
  assert.match(route, /failure:/);
  assert.doesNotMatch(route, /error\.message|error\.stack|String\(error\)/);
});
