import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const proxyPath = "proxy.ts";
const fingerprintPath = "lib/proxy-release-fingerprint.ts";
const vercelIgnorePath = ".vercelignore";
const lockfilePath = "package-lock.json";

function gitBlobSha1(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
}

test("proxy release fingerprint tracks the exact proxy Git blob", () => {
  const proxy = fs.readFileSync(proxyPath);
  const fingerprint = fs.readFileSync(fingerprintPath, "utf8");
  const match = fingerprint.match(/gitBlobSha1:\s*"([0-9a-f]{40})"/);

  assert.ok(match, "proxy release fingerprint must contain one 40-character Git blob SHA-1");
  assert.equal(
    match[1],
    gitBlobSha1(proxy),
    "proxy.ts changed without updating lib/proxy-release-fingerprint.ts; Vercel could otherwise skip the production build",
  );
});

test("Vercel production build context retains the audited npm lockfile", () => {
  assert.ok(fs.existsSync(lockfilePath), "package-lock.json must remain source controlled");

  const ignored = fs
    .readFileSync(vercelIgnorePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  assert.ok(!ignored.includes("package-lock.json"), "package-lock.json must not be excluded from Vercel builds");
  assert.ok(!ignored.includes("/package-lock.json"), "package-lock.json must not be excluded from Vercel builds");
});
