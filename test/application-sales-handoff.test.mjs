import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const appsData = source("app/apps/appsData.ts");
const storefront = source("app/apps/storefront.ts");
const productPage = source("app/apps/[slug]/page.tsx");
const subscribePage = source("app/apps/[slug]/subscribe/page.tsx");
const commerce = source("app/apps/commerce.ts");
const checkoutRoute = source("app/api/apps/checkout/route.ts");
const accessRoute = source("app/api/apps/access/route.ts");
const downloadRoute = source("app/api/apps/download/route.ts");
const launchPolicy = source("lib/application-launch.ts");
const nextConfig = source("next.config.ts");
const environmentExample = source(".env.example");
const vercelIgnore = source(".vercelignore");

function crisisCommanderRecord() {
  const match = appsData.match(/\{\s*slug: "obserra-cyber-crisis-commander",[\s\S]*?\n\s*\},\n\s*\{/);
  assert.ok(match, "Canonical Cyber Crisis Commander catalog record is missing");
  return match[0];
}

test("Cyber Crisis Commander is canonical and remains pre-release", () => {
  const record = crisisCommanderRecord();
  assert.match(record, /name: "Obserra Cyber Crisis Commander"/);
  assert.match(record, /status: "Coming Soon"/);
  assert.match(record, /"SaaS"/);
  assert.match(record, /"Private Cloud"/);
  assert.match(record, /"On-Premises"/);
  assert.doesNotMatch(appsData, /slug: "obserra-incident-command-console"/);
});

test("legacy product links resolve only to the canonical marketing page", () => {
  assert.match(storefront, /"obserra-incident-command-console": "obserra-cyber-crisis-commander"/);
  assert.match(storefront, /"obserra-incident-command": "obserra-cyber-crisis-commander"/);
  assert.match(nextConfig, /source: "\/apps\/obserra-incident-command-console"[\s\S]*?destination: "\/apps\/obserra-cyber-crisis-commander"/);
  assert.match(nextConfig, /source: "\/apps\/obserra-incident-command-console\/subscribe"[\s\S]*?destination: "\/apps\/obserra-cyber-crisis-commander\/subscribe"/);
});

test("product pages never link directly to ephemeral Vercel application deployments", () => {
  assert.doesNotMatch(productPage, /liveApplicationUrls/);
  assert.doesNotMatch(productPage, /https:\/\/[^"'\s]*\.vercel\.app/i);
  assert.match(productPage, /href=\{`\/api\/apps\/access\?app=\$\{entry\.slug\}`\}/);
});

test("Coming Soon product actions expose preview only", () => {
  const branch = productPage.match(/entry\.status === "Coming Soon" \? \([\s\S]*?\) : entry\.status === "Pilot"/);
  assert.ok(branch, "Coming Soon action branch is missing");
  assert.match(branch[0], /Request governed preview/);
  assert.match(branch[0], /Join release notification/);
  assert.doesNotMatch(branch[0], /api\/apps\/(?:access|checkout|download|billing-portal)/);
  assert.doesNotMatch(branch[0], /Choose subscription|Launch entitled SaaS|Download approved release|Manage subscription/);
});

test("subscription selection is available only for approved Available products", () => {
  assert.match(commerce, /return app\.status === "Available" \? commercePlans : \[\]/);
  assert.match(subscribePage, /app\.status === "Coming Soon"/);
  assert.match(subscribePage, /Commercial enrollment is not open/);
  assert.match(subscribePage, /Pilot enrollment is controlled/);
  assert.match(checkoutRoute, /if \(app\.status !== "Available"\)/);
  assert.match(checkoutRoute, /checkout=release-not-approved/);
});

test("SaaS launch requires entitlement, approved status, HTTPS, and an exact host allow-list", () => {
  const statusCheck = accessRoute.indexOf('app.status === "Coming Soon"');
  const authentication = accessRoute.indexOf("await auth()");
  assert.ok(statusCheck >= 0 && statusCheck < authentication, "Release status must be checked before authentication and launch work");
  assert.match(accessRoute, /resolveUnifiedEntitlement/);
  assert.match(accessRoute, /resolveApprovedApplicationLaunchUrl/);
  assert.doesNotMatch(accessRoute, /process\.env\[launchEnvironmentKey/);
  assert.match(launchPolicy, /target\.protocol !== "https:"/);
  assert.match(launchPolicy, /APP_LAUNCH_ALLOWED_HOSTS/);
  assert.match(launchPolicy, /!allowedHosts\.has\(host\)/);
  assert.match(launchPolicy, /target\.username \|\| target\.password \|\| target\.hash \|\| target\.search/);
});

test("customer package delivery is blocked until release publication and entitlement", () => {
  assert.match(downloadRoute, /app\.status === "Coming Soon"/);
  assert.match(downloadRoute, /resolveAppEntitlement/);
  assert.match(downloadRoute, /publishedReleaseFor/);
  assert.match(downloadRoute, /signedReleaseUrl/);
});

test("Cyber Crisis Commander production environment settings remain intentionally empty", () => {
  assert.match(environmentExample, /^APP_LAUNCH_ALLOWED_HOSTS=$/m);
  assert.match(environmentExample, /^APP_LAUNCH_OBSERRA_CYBER_CRISIS_COMMANDER=$/m);
  assert.match(environmentExample, /^STRIPE_PRICE_OBSERRA_CYBER_CRISIS_COMMANDER_PROFESSIONAL_MONTHLY=$/m);
  assert.match(environmentExample, /^STRIPE_PRICE_OBSERRA_CYBER_CRISIS_COMMANDER_ENTERPRISE_ANNUAL=$/m);
});

test("Vercel preserves the npm lockfile for reproducible dependency installation", () => {
  const ignoredPaths = vercelIgnore
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry && !entry.startsWith("#"));
  assert.ok(!ignoredPaths.includes("package-lock.json"), "package-lock.json must be present in the Vercel build context");
});
