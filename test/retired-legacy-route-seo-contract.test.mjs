import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const retiredRouteSegment = String.fromCharCode(97, 120, 105, 111, 110, 105, 115);
const robots = fs.readFileSync("app/robots.ts", "utf8").toLowerCase();
const sitemap = fs.readFileSync("app/sitemap.ts", "utf8").toLowerCase();

test("retired legacy brand routes are absent from runtime and search discovery", () => {
  assert.equal(fs.existsSync(path.join("app", retiredRouteSegment)), false);
  assert.equal(fs.existsSync(path.join("app", "apps", retiredRouteSegment)), false);
  assert.equal(robots.includes(retiredRouteSegment), false);
  assert.equal(sitemap.includes(retiredRouteSegment), false);
});
