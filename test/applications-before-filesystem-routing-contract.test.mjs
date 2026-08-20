import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Applications storefront remains a public first-party website surface", () => {
  const page = read("app/apps/page.tsx");

  assert.match(page, /Applications \| Obserra Enterprise Marketplace/);
  assert.match(page, /alternates:\s*\{\s*canonical:\s*["']\/apps["']/);
  assert.match(page, /AppsMarketplaceClient/);
  assert.match(page, /SoftwareApplication/);
});

test("Next routing does not rewrite the public Applications storefront to a private gateway", () => {
  const config = read("next.config.ts");

  assert.doesNotMatch(
    config,
    /source:\s*["']\/apps\/:path\*["'][\s\S]{0,300}destination:\s*["']\/private-applications-gateway\/:path\*["']/,
  );
  assert.doesNotMatch(
    config,
    /source:\s*["']\/apps\/:path\*["'][\s\S]{0,200}headers:\s*protectedRouteHeaders/,
  );
});

test("Vercel routing leaves the public Applications storefront to Next.js", () => {
  const config = JSON.parse(read("vercel.json"));
  const routes = Array.isArray(config.routes) ? config.routes : [];

  assert.equal(
    routes.some((route) => route?.src === "/apps" || route?.src === "/apps/(.*)"),
    false,
    "vercel.json must not intercept public /apps routes before the Next.js storefront",
  );
});

test("proxy authenticates Applications operations without making the public storefront private or team-only", () => {
  const proxy = read("proxy.ts");

  assert.match(proxy, /PROTECTED_PATH_PREFIXES\s*=\s*\[[\s\S]*?"\/api\/apps"/);
  assert.doesNotMatch(proxy, /PROTECTED_PATH_PREFIXES\s*=\s*\[[\s\S]*?\n\s*"\/apps",/);
  assert.doesNotMatch(proxy, /APPLICATIONS_PRIVATE_PATH_PREFIXES/);
  assert.doesNotMatch(proxy, /applicationsTeamUserAuthorized/);
  assert.doesNotMatch(proxy, /applicationsPrivateAccessDeniedResponse/);
});

test("operational Applications endpoints retain server-side authentication and entitlement controls", () => {
  for (const route of [
    "app/api/apps/access/route.ts",
    "app/api/apps/billing-portal/route.ts",
    "app/api/apps/checkout/route.ts",
    "app/api/apps/download/route.ts",
    "app/api/apps/license/route.ts",
  ]) {
    const source = read(route);
    assert.match(source, /await\s+auth\(\)/, `${route} must authenticate on the server`);
  }

  for (const route of [
    "app/api/apps/access/route.ts",
    "app/api/apps/billing-portal/route.ts",
    "app/api/apps/download/route.ts",
    "app/api/apps/license/route.ts",
  ]) {
    assert.match(read(route), /resolve(?:Unified)?App?Entitlement|resolveUnifiedEntitlement/);
  }

  const portal = read("app/portal/applications/page.tsx");
  assert.match(portal, /await\s+auth\(\)/);
  assert.match(portal, /redirect\(["']\/sign-in\?redirect_url=\/portal\/applications["']\)/);
});

test("legacy Applications implementation remains byte-for-byte governed", () => {
  const legacyNonRegression = read("test/supabase-auth-applications-nonregression.test.mjs");
  assert.match(
    legacyNonRegression,
    /Phase 2A Applications implementation surface is byte-for-byte unchanged apart from approved root runtime directives/,
  );
  assert.match(legacyNonRegression, /APPLICATION_SOURCE_DIGEST/);
  assert.match(legacyNonRegression, /APPROVED_ROOT_RUNTIME_DIRECTIVES/);
});
