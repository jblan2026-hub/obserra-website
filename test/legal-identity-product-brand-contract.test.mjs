import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("scripts/legal-identity-audit.mjs", "utf8");

test("legal identity audit permits only current EPI product naming for Academy and EIOS", () => {
  assert.match(source, /"Obserra EPI Academy"/);
  assert.match(source, /"Obserra EPI EIOS"/);
  assert.doesNotMatch(source, /\n\s*"Obserra Academy",/);
  assert.doesNotMatch(source, /\n\s*"Obserra EIOS",/);
});

test("legal identity audit recognizes the current EPI product family", () => {
  assert.match(source, /"Obserra EPI Applications"/);
  assert.match(source, /"Obserra EPI Products"/);
});

test("legal identity regex exceptions do not whitelist bare Academy or EIOS product names", () => {
  assert.doesNotMatch(source, /\(\?:Academy\|EIOS\|/);
  assert.match(source, /EPI\s+\(\?:Academy\|EIOS\|Applications\|Products\)/);
});
