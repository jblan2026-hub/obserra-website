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

test("Vercel edge routing intercepts Applications before directory listing resolution", () => {
  const config = JSON.parse(read("vercel.json"));
  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : [];

  assert.ok(
    rewrites.some(
      (rewrite) =>
        rewrite?.source === "/apps/:path*" &&
        rewrite?.destination === "/private-applications-gateway/:path*",
    ),
    "vercel.json must rewrite /apps/:path* to the authenticated private gateway before Vercel can expose directory listings",
  );
});

test("root Applications route is dynamic so Vercel cannot expose the /apps directory", () => {
  const rootPage = read("app/apps/page.tsx");

  assert.match(rootPage, /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/);
  assert.match(rootPage, /export\s+const\s+revalidate\s*=\s*0/);
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

test("proxy remains a fail-closed authorization boundary for Applications", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /APPLICATIONS_PRIVATE_PATH_PREFIXES\s*=\s*\["\/apps",\s*"\/api\/apps"\]/);
  assert.match(proxy, /applicationsTeamUserAuthorized/);
  assert.match(proxy, /applicationsPrivateAccessDeniedResponse/);
  assert.match(proxy, /status:\s*404/);
});

test("privacy controls preserve the frozen Applications implementation except the approved root runtime directives", () => {
  const legacyNonRegression = read("test/supabase-auth-applications-nonregression.test.mjs");
  assert.match(
    legacyNonRegression,
    /Phase 2A Applications implementation surface is byte-for-byte unchanged apart from approved root runtime directives/,
  );
  assert.match(legacyNonRegression, /APPLICATION_SOURCE_DIGEST/);
  assert.match(legacyNonRegression, /APPROVED_ROOT_RUNTIME_DIRECTIVES/);
});
