import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Applications are intercepted before filesystem resolution", () => {
  const config = read("next.config.ts");

  assert.match(config, /async\s+rewrites\s*\(\)/);
  assert.match(config, /beforeFiles\s*:/);
  assert.match(config, /source:\s*["']\/apps\/:path\*["']/);
  assert.match(config, /destination:\s*["']\/private-applications-gateway\/:path\*["']/);
  assert.match(config, /source:\s*["']\/apps\/:path\*["'][\s\S]*headers:\s*protectedRouteHeaders/);
  assert.match(config, /noindex, nofollow, noarchive, nosnippet, noimageindex/);
  assert.match(config, /private, no-store, max-age=0, must-revalidate/);
});

test("private gateway preserves the real Applications route family for authorized team members", () => {
  const gateway = read("app/private-applications-gateway/[[...path]]/page.tsx");

  assert.match(gateway, /applicationsTeamUserAuthorized/);
  assert.match(gateway, /notFound\(\)/);
  assert.doesNotMatch(
    gateway,
    /redirect\(["']\/portal\/applications["']\)/,
    "authorized Apps traffic must not collapse every /apps route into the portal dashboard",
  );
  assert.match(gateway, /AppsPage/);
  assert.match(gateway, /AppDetailPage/);
  assert.match(gateway, /SubscribePage/);
});

test("public Apps metadata is suppressed at the private gateway boundary", () => {
  const gateway = read("app/private-applications-gateway/[[...path]]/page.tsx");
  assert.match(gateway, /index:\s*false/);
  assert.match(gateway, /follow:\s*false/);
  assert.match(gateway, /nocache:\s*true/);
  assert.match(gateway, /noimageindex:\s*true/);
});

test("privacy controls do not require edits to the frozen Applications implementation", () => {
  const legacyNonRegression = read("test/supabase-auth-applications-nonregression.test.mjs");
  assert.match(legacyNonRegression, /Phase 2A Applications implementation surface is byte-for-byte unchanged/);
});
