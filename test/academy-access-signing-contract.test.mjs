import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("lib/academyAccess.ts", "utf8");

test("Academy access signing is isolated from Stripe webhook credentials", () => {
  assert.match(source, /process\.env\.ACADEMY_ACCESS_SIGNING_SECRET/);
  assert.doesNotMatch(source, /STRIPE_WEBHOOK_SECRET/);
});

test("Academy access signing secret enforces at least 32 bytes of entropy input", () => {
  assert.match(source, /Buffer\.byteLength\(key,\s*["']utf8["']\)\s*<\s*32/);
  assert.match(source, /at least 32 bytes/i);
});

test("Academy access signatures support explicit previous-key rotation", () => {
  assert.match(source, /process\.env\.ACADEMY_ACCESS_PREVIOUS_SIGNING_SECRET/);
  assert.match(source, /previousSigningKey/);
  assert.match(source, /currentSigningKey/);
  assert.match(source, /sign\(payload,\s*currentSigningKey\(\)\)/);
});
