import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/admin/ai-marketplace-v12/legacy-release-migration/route.ts", import.meta.url), "utf8");

test("release authority migration is production-only, OIDC-bound, vault-first, and fail-closed", () => {
  assert.match(route, /process\.env\.VERCEL_ENV !== "production"/);
  assert.match(route, /GITHUB_PRODUCTION_SUBJECT/);
  assert.match(route, /TOKEN_ISSUER/);
  assert.match(route, /TOKEN_AUDIENCE/);
  assert.match(route, /exchangeForVaultToken/);
  assert.match(route, /secretExists\(candidate\.keyVaultSecretName/);
  assert.match(route, /missing\.push\(candidate\.keyVaultSecretName\)/);
  assert.match(route, /status: missing\.length === 0 \? 200 : 503/);
});

test("release authority migration covers every protected-delivery prerequisite without committing credential values", () => {
  for (const secret of [
    "ai-marketplace-release-aws-access-key-id",
    "ai-marketplace-release-aws-secret-access-key",
    "ai-marketplace-release-bucket",
    "ai-marketplace-release-kms-key-id",
    "ai-marketplace-release-cdn-url",
    "ai-marketplace-cloudfront-key-pair-id",
    "ai-marketplace-cloudfront-private-key",
    "ai-marketplace-v12-release-evidence-hmac-key",
  ]) assert.match(route, new RegExp(secret));

  assert.match(route, /randomBytes\(48\)/);
  assert.doesNotMatch(route, /AKIA[A-Z0-9]{16}/);
  assert.doesNotMatch(route, /-----BEGIN (?:RSA )?PRIVATE KEY-----/);
  assert.doesNotMatch(route, /sk_(?:live|test)_/);
  assert.doesNotMatch(route, /whsec_/);
});

test("migration response exposes only state/source names and missing binding names", () => {
  assert.match(route, /contract: "obserra-marketplace-v12-release-authority-migration-v1"/);
  assert.match(route, /states,/);
  assert.match(route, /sources,/);
  assert.match(route, /missing,/);
  assert.doesNotMatch(route, /value:\s*source\.value/);
});
