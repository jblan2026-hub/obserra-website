import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const retiredRouteSegment = String.fromCharCode(97, 120, 105, 111, 110, 105, 115);
const activeTextRoots = [".github", "app", "docs", "lib", "plan", "scripts", "test"];
const activeTextExtensions = new Set([".css", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".yaml", ".yml"]);

function walkActiveTextFiles(entry, output = []) {
  if (!fs.existsSync(entry)) return output;
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    if (activeTextExtensions.has(path.extname(entry))) output.push(entry.replaceAll(path.sep, "/"));
    return output;
  }
  for (const child of fs.readdirSync(entry, { withFileTypes: true })) {
    walkActiveTextFiles(path.join(entry, child.name), output);
  }
  return output;
}

test("Applications storefront remains a public first-party website surface", () => {
  const page = read("app/apps/page.tsx");

  assert.match(page, /APPLICATIONS_BRAND_NAME/);
  assert.match(page, /alternates:\s*\{\s*canonical:\s*["']\/apps["']/);
  assert.match(page, /AppsMarketplaceClient/);
  assert.match(page, /SoftwareApplication/);
});

test("public Applications surfaces consume governed EPI product identity", () => {
  const page = read("app/apps/page.tsx");
  const marketplace = read("app/apps/AppsMarketplaceClient.tsx");
  const catalog = read("app/apps/appsData.ts");
  const detail = read("app/apps/[slug]/page.tsx");

  assert.match(page, /APPLICATIONS_BRAND_NAME/);
  assert.match(marketplace, /APPLICATIONS_BRAND_NAME/);
  assert.match(catalog, /EIOS_BRAND_NAME/);
  assert.match(detail, /APPLICATIONS_BRAND_NAME/);
  assert.match(detail, /LEGAL_ENTITY_NAME/);
});

test("retired product brand routes and named active regression test are absent", () => {
  assert.equal(fs.existsSync(`app/${retiredRouteSegment}/route.ts`), false);
  assert.equal(fs.existsSync(`app/apps/${retiredRouteSegment}/route.ts`), false);
  assert.equal(fs.existsSync(`test/retired-${retiredRouteSegment}-seo-contract.test.mjs`), false);
});

test("retired product brand is absent from the active repository surface", () => {
  const token = retiredRouteSegment.toLowerCase();
  const offenders = activeTextRoots
    .flatMap((root) => walkActiveTextFiles(root))
    .filter((filePath) => filePath.toLowerCase().includes(token) || read(filePath).toLowerCase().includes(token));

  assert.deepEqual(offenders, [], `retired brand remains in active files: ${offenders.join(", ")}`);
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

test("Applications presentation remains governed by behavioral controls rather than a frozen source digest", () => {
  const appSourceControl = read("test/supabase-auth-applications-nonregression.test.mjs");
  const detail = read("app/apps/[slug]/page.tsx");

  assert.doesNotMatch(appSourceControl, /APPLICATION_SOURCE_DIGEST/);
  assert.match(appSourceControl, /unverified runtime commerce claims|without a frozen source digest/);
  assert.doesNotMatch(detail, /liveApplicationUrls/);
  assert.doesNotMatch(detail, /Subscribe & Launch/);
  assert.match(detail, /Request enterprise demo/);
  assert.match(detail, /Request deployment assessment/);
});
