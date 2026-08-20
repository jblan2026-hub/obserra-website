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

test("LEGAL-013 detects bare product names while EPI-qualified names remain permitted", () => {
  const legal013 = source.match(/\["LEGAL-013",\s*(\/[^\n]+\/g),/m)?.[1] ?? "";

  assert.ok(legal013, "LEGAL-013 detector must remain present");
  assert.match(legal013, /Obserra/);
  assert.match(legal013, /Academy\|EIOS\|Applications\|Products/);
  assert.doesNotMatch(legal013, /EPI\\s\+/);
  assert.match(source, /EPI\\s\+\(\?:Academy\|EIOS\|Applications\|Products\)/);
});
