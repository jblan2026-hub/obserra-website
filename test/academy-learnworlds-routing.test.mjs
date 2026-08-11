import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const checkoutRoute = fs.readFileSync("app/api/academy/checkout/route.ts", "utf8");
const statusRoute = fs.readFileSync("app/api/admin/learnworlds/status/route.ts", "utf8");
const adapter = fs.readFileSync("lib/learnworlds.ts", "utf8");
const environment = fs.readFileSync(".env.example", "utf8");
const configuration = JSON.parse(fs.readFileSync("config/learnworlds-products.json", "utf8"));

test("LearnWorlds school identity is governed without secrets", () => {
  assert.equal(configuration.schoolId, "6a7a693d353feb69c94c7654");
  assert.equal(configuration.schoolName, "Obserra EPI Academy");
  assert.equal(configuration.schoolUrl, "https://obserraepillc.learnworlds.com");
  assert.equal(configuration.customDomain, "https://academy.obserrallc.com");
  assert.ok(Array.isArray(configuration.products));
  assert.doesNotMatch(JSON.stringify(configuration), /client[_-]?secret|access[_-]?token|stripe[_-]?secret/i);
});

test("LearnWorlds adapter validates HTTPS product mappings and fails closed", () => {
  assert.match(adapter, /httpsUrl\(/);
  assert.match(adapter, /Duplicate LearnWorlds mapping/);
  assert.match(adapter, /product\.status === "published"/);
  assert.match(adapter, /product\.status === "sandbox" && learnWorldsSandboxMode\(\)/);
  assert.match(adapter, /return null/);
});

test("Academy checkout chooses LearnWorlds before requiring website Stripe secrets", () => {
  const providerBranch = checkoutRoute.indexOf('academyCommerceProvider() === "learnworlds"');
  const stripeConfiguration = checkoutRoute.indexOf("!process.env.STRIPE_SECRET_KEY");
  assert.ok(providerBranch >= 0, "LearnWorlds provider branch is missing");
  assert.ok(stripeConfiguration > providerBranch, "Website Stripe secrets are incorrectly required before LearnWorlds routing");
  assert.match(checkoutRoute, /learnworlds-product-unavailable/);
  assert.match(checkoutRoute, /x-obserra-learnworlds-product-id/);
  assert.match(checkoutRoute, /status: 303/);
});

test("legacy website Stripe checkout remains available until governed cutover", () => {
  assert.match(checkoutRoute, /stripe\.checkout\.sessions\.create/);
  assert.match(checkoutRoute, /x-obserra-commerce-provider", "website-stripe"/);
  assert.match(checkoutRoute, /x-obserra-webhook-verification", "required"/);
});

test("owner readiness endpoint fails closed and exposes no secrets", () => {
  assert.match(statusRoute, /ownerEmailAllowed/);
  assert.match(statusRoute, /return NextResponse\.json\(\{ error: "Not found" \}, \{ status: 404 \}\)/);
  assert.match(statusRoute, /readyForSandboxCanary/);
  assert.match(statusRoute, /private, no-store, max-age=0/);
  assert.doesNotMatch(statusRoute, /CLIENT_SECRET|ACCESS_TOKEN|STRIPE_SECRET_KEY/);
});

test("deployment template requires secrets to remain outside source control", () => {
  for (const variable of [
    "ACADEMY_COMMERCE_PROVIDER",
    "LEARNWORLDS_SANDBOX_MODE",
    "LEARNWORLDS_API_URL",
    "LEARNWORLDS_CLIENT_ID",
    "LEARNWORLDS_CLIENT_SECRET",
    "LEARNWORLDS_ACCESS_TOKEN",
  ]) {
    assert.match(environment, new RegExp(`^${variable}=`, "m"));
  }
  assert.match(environment, /Never commit values/);
});
