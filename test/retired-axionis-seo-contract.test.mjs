import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const robots = fs.readFileSync("app/robots.ts", "utf8");
const sitemap = fs.readFileSync("app/sitemap.ts", "utf8");
const retiredRoot = fs.readFileSync("app/axionis/route.ts", "utf8");
const retiredApp = fs.readFileSync("app/apps/axionis/route.ts", "utf8");

test("retired Axionis URLs remain crawlable only long enough to emit explicit 410 retirement signals", () => {
  for (const path of ["/axionis", "/apps/axionis", "/apps/axionis/"]) {
    assert.ok(!robots.includes(`\"${path}\"`), `${path} must not be blocked in robots while its 410 retirement response is needed`);
  }

  assert.doesNotMatch(sitemap, /axionis/i, "retired Axionis URLs must not appear in the XML sitemap source");

  for (const source of [retiredRoot, retiredApp]) {
    assert.match(source, /status:\s*410/);
    assert.match(source, /X-Robots-Tag/);
    assert.match(source, /noindex, nofollow, noarchive/);
    assert.doesNotMatch(source, /redirect/i);
  }
});
