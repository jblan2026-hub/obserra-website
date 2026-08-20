import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const PRIVATE_APPLICATION_PREFIXES = [
  "/apps",
  "/api/apps",
  "/portal/applications",
  "/portal/enterprise",
  "/portal/licenses",
  "/portal/orders",
  "/portal/success",
];

test("Applications routes are Clerk protected and never Clerk public", () => {
  const routing = read("lib/auth/provider-routing.ts");
  const protectedPrefixes = routing.match(/const CLERK_PROTECTED_PREFIXES = \[[^\]]*\]/s)?.[0] ?? "";
  const publicPrefixes = routing.match(/const CLERK_PUBLIC_PREFIXES = \[[^\]]*\]/s)?.[0] ?? "";

  for (const prefix of PRIVATE_APPLICATION_PREFIXES) {
    assert.match(protectedPrefixes, new RegExp(`["']${prefix.replaceAll("/", "\\/")}["']`), `${prefix} must remain Clerk protected`);
    assert.doesNotMatch(publicPrefixes, new RegExp(`["']${prefix.replaceAll("/", "\\/")}["']`), `${prefix} must never be Clerk public`);
  }
});

test("Applications access is an explicit fail-closed team allowlist", () => {
  const access = read("lib/applications-team-access.ts");
  assert.match(access, /OBSERRA_APPLICATIONS_TEAM_USER_IDS/);
  assert.match(access, /return false/);
  assert.match(access, /userId/);
  assert.match(access, /CLERK_USER_ID_PATTERN/);
});

test("every Applications surface receives one private allowlist boundary and anti-index controls", () => {
  const proxy = read("proxy.ts");
  const privatePrefixes = proxy.match(/const APPLICATIONS_PRIVATE_PATH_PREFIXES = \[[^\]]*\]/s)?.[0] ?? "";

  for (const prefix of PRIVATE_APPLICATION_PREFIXES) {
    assert.match(privatePrefixes, new RegExp(`["']${prefix.replaceAll("/", "\\/")}["']`), `${prefix} must be inside the private Applications boundary`);
  }

  assert.match(proxy, /isPrivateApplicationsPath/);
  assert.match(proxy, /PRIVATE_NOINDEX/);
  assert.match(proxy, /private, no-store, max-age=0, must-revalidate/);
  assert.match(proxy, /applicationsTeamUserAuthorized/);
  assert.match(proxy, /applicationsPrivateAccessDeniedResponse/);
  assert.match(proxy, /status:\s*404/);
  assert.match(proxy, /code:\s*"NOT_FOUND"/);
});

test("public discovery and customer-facing surfaces do not publish Applications routes", () => {
  const sitemap = read("app/sitemap.ts");
  const sources = [
    ["enterprise chrome", read("app/components/enterprise/EnterpriseChrome.tsx")],
    ["home header", read("app/HomeHeader.tsx")],
    ["home page", read("app/page.tsx")],
    ["catalog", read("app/catalog/page.tsx")],
    ["store", read("app/store/page.tsx")],
    ["resources", read("app/resources/page.tsx")],
    ["protection and intelligence", read("app/protection-intelligence/page.tsx")],
    ["not found", read("app/not-found.tsx")],
    ["site guide", read("app/ObserraGuide.tsx")],
    ["customer portal", read("app/portal/page.tsx")],
  ];

  assert.doesNotMatch(sitemap, /marketplaceApps/);
  assert.doesNotMatch(sitemap, /\/apps/);
  for (const [name, source] of sources) {
    assert.doesNotMatch(source, /href(?:=|:)\s*["']\/apps(?:["'/?])/i, `${name} must not link to Applications`);
  }
});

test("Applications implementation remains present behind the private boundary", () => {
  assert.ok(fs.existsSync("app/apps/page.tsx"));
  assert.ok(fs.existsSync("app/apps/[slug]/page.tsx"));
  assert.ok(fs.existsSync("app/api/apps/access/route.ts"));
  assert.ok(fs.existsSync("app/portal/applications/page.tsx"));
});
