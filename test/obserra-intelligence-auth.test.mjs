import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/obserra/intelligence/route.ts", "utf8");

test("owner intelligence compares fixed length digests instead of raw token lengths", () => {
  assert.match(route, /createHash\("sha256"\)\.update\(actual/);
  assert.match(route, /createHash\("sha256"\)\.update\(expected/);
  assert.match(route, /timingSafeEqual\(actualDigest, expectedDigest\)/);
  assert.doesNotMatch(route, /actualBuffer\.length\s*===\s*expectedBuffer\.length/);
});

test("owner intelligence rejects oversized authorization headers", () => {
  assert.match(route, /MAX_AUTHORIZATION_HEADER_CHARS = 4096/);
  assert.match(route, /authorization\.length > MAX_AUTHORIZATION_HEADER_CHARS/);
});

test("owner intelligence remains fail closed without a configured token", () => {
  assert.match(route, /if \(!expected\) return false/);
  assert.match(route, /status: 401/);
  assert.match(route, /www-authenticate/);
});

test("owner intelligence responses are noncacheable and nonindexable", () => {
  assert.match(route, /private, no-store, max-age=0/);
  assert.match(route, /"vary": "authorization"/);
  assert.match(route, /"x-robots-tag": "noindex, nofollow, noarchive"/);
  assert.match(route, /"referrer-policy": "no-referrer"/);
});

test("owner intelligence never authorizes direct production changes", () => {
  assert.match(route, /directProductionWriteAllowed: false/);
  assert.match(route, /automaticMergeAllowed: false/);
  assert.match(route, /automaticProductionDeploymentAllowed: false/);
  assert.match(route, /ownerApprovalRequired: true/);
});
