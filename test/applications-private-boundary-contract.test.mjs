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
  assert.match(proxy, /applicationsPrivateAccessDeniedResponse/);
});

test("public discovery and customer-facing surfaces do not publish Applications routes", () => {
  const sitemap = read("app/sitemap.ts");
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const homeHeader = read("app/HomeHeader.tsx");
  const home = read("app/page.tsx");
  const catalog = read("app/catalog/page.tsx");
  const store = read("app/store/page.tsx");
  const notFound = read("app/not-found.tsx");

  assert.doesNotMatch(sitemap, /marketplaceApps/);
  assert.doesNotMatch(sitemap, /\/apps/);
  for (const [name, source] of [
    ["enterprise chrome", chrome],
    ["home header", homeHeader],
    ["home page", home],
    ["catalog", catalog],
    ["store", store],
    ["not found", notFound],
  ]) {
    assert.doesNotMatch(source, /href(?:=|:)\s*["']\/apps(?:["'/?])/i, `${name} must not link to Applications`);
  }
});

test("Applications implementation remains present behind the private boundary", () => {
  assert.ok(fs.existsSync("app/apps/page.tsx"));
  assert.ok(fs.existsSync("app/apps/[slug]/page.tsx"));
  assert.ok(fs.existsSync("app/api/apps/access/route.ts"));
});
