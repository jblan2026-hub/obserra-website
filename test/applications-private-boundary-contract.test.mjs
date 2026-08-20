import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Applications routes are Clerk protected and never Clerk public", () => {
  const routing = read("lib/auth/provider-routing.ts");
  assert.match(routing, /CLERK_PROTECTED_PREFIXES[\s\S]*["']\/apps["']/);
  assert.match(routing, /CLERK_PROTECTED_PREFIXES[\s\S]*["']\/api\/apps["']/);
  const publicPrefixes = routing.match(/const CLERK_PUBLIC_PREFIXES = \[[^\]]*\]/s)?.[0] ?? "";
  assert.doesNotMatch(publicPrefixes, /["']\/apps["']/);
  assert.doesNotMatch(publicPrefixes, /["']\/api\/apps["']/);
});

test("Applications access is an explicit fail-closed team allowlist", () => {
  const access = read("lib/applications-team-access.ts");
  assert.match(access, /OBSERRA_APPLICATIONS_TEAM_USER_IDS/);
  assert.match(access, /return false/);
  assert.match(access, /userId/);
});

test("Applications receive private anti-index and no-store response controls", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /isPrivateApplicationsPath/);
  assert.match(proxy, /PRIVATE_NOINDEX/);
  assert.match(proxy, /private, no-store, max-age=0, must-revalidate/);
  assert.match(proxy, /applicationsTeamUserAuthorized/);
  assert.match(proxy, /APPLICATIONS_PRIVATE_ACCESS_DENIED/);
});

test("public discovery and both public headers do not publish Applications routes", () => {
  const sitemap = read("app/sitemap.ts");
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const homeHeader = read("app/HomeHeader.tsx");
  const home = read("app/page.tsx");

  assert.doesNotMatch(sitemap, /marketplaceApps/);
  assert.doesNotMatch(sitemap, /\/apps/);
  assert.doesNotMatch(chrome, /href=["']\/apps["']/);
  assert.doesNotMatch(chrome, /\[APPLICATIONS_BRAND_NAME,\s*["']\/apps["']/);
  assert.doesNotMatch(homeHeader, /href:\s*["']\/apps["']/);
  assert.doesNotMatch(homeHeader, /Applications["'],\s*href:\s*["']\/apps["']/);
  assert.doesNotMatch(home, /href=["']\/apps["']/);
});

test("Applications pages explicitly prohibit indexing as defense in depth", () => {
  const page = read("app/apps/page.tsx");
  assert.match(page, /robots:\s*\{[^}]*index:\s*false[^}]*follow:\s*false/s);
});
