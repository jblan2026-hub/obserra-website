import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const checkoutRoute = fs.readFileSync("app/api/academy/checkout/route.ts", "utf8");
const statusRoute = fs.readFileSync("app/api/admin/learnworlds/status/route.ts", "utf8");
const adapter = fs.readFileSync("lib/learnworlds.ts", "utf8");
const offers = fs.readFileSync("app/academy/courseOffers.ts", "utf8");
const environment = fs.readFileSync(".env.example", "utf8");
const configuration = JSON.parse(fs.readFileSync("config/learnworlds-products.json", "utf8"));

test("LearnWorlds school identity is governed without secrets", () => {
  assert.equal(configuration.schoolId, "6a7a693d353feb69c94c7654");
  assert.equal(configuration.schoolName, "Obserra EPI Academy");
  assert.equal(configuration.contactEmail, "info@obserrallc.com");
  assert.equal(configuration.schoolUrl, "https://obserraepillc.learnworlds.com");
  assert.equal(configuration.customDomain, "https://academy.obserrallc.com");
  assert.ok(Array.isArray(configuration.products));
  assert.doesNotMatch(JSON.stringify(configuration), /client[_-]?secret|access[_-]?token|stripe[_-]?secret/i);
  assert.doesNotMatch(JSON.stringify(configuration), /@icloud\.com/i);
});

test("Cybersecurity Foundations canary is mapped to the owner supplied LearnWorlds identifiers", () => {
  const product = configuration.products.find((item) => item.courseId === "cybersecurity-foundations");
  assert.ok(product, "Cybersecurity Foundations mapping is missing");
  assert.equal(product.learnWorldsCourseId, "cybersecurity-foundations-for-new-professionals");
  assert.equal(product.productId, "cybersecurity_foundations_for_new_professionals");
  assert.equal(product.packageId, "package_6a7b2d3710387");
  assert.equal(
    product.publicUrl,
    "https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals",
  );
  assert.equal(
    product.checkoutUrl,
    "https://obserraepillc.learnworlds.com/payment?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387",
  );
  assert.equal(
    product.cartUrl,
    "https://obserraepillc.learnworlds.com/cart?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387",
  );
  assert.equal(product.status, "sandbox");
});

test("LearnWorlds adapter locks checkout mappings to governed hosts and identifiers", () => {
  assert.match(adapter, /httpsUrl\(/);
  assert.match(adapter, /requireAllowedHost\(/);
  assert.match(adapter, /validateCommerceUrl\(/);
  assert.match(adapter, /product_id/);
  assert.match(adapter, /packageId/);
  assert.match(adapter, /Duplicate LearnWorlds mapping/);
  assert.match(adapter, /product\.status === "published"/);
  assert.match(adapter, /product\.status === "sandbox" && learnWorldsSandboxMode\(\)/);
  assert.match(adapter, /product\.checkoutUrl/);
  assert.match(adapter, /return null/);
});

test("Academy checkout routes the governed LearnWorlds Sandbox canary before website Stripe secrets", () => {
  const providerDeclaration = checkoutRoute.indexOf("const provider = academyCommerceProvider()");
  const sandboxAuthorization = checkoutRoute.indexOf('provider === "learnworlds" && learnWorldsSandboxMode()');
  const learnWorldsBranch = checkoutRoute.indexOf('if (provider === "learnworlds")');
  const stripeConfiguration = checkoutRoute.indexOf("!process.env.STRIPE_SECRET_KEY");
  assert.ok(providerDeclaration >= 0, "Governed commerce provider declaration is missing");
  assert.ok(sandboxAuthorization > providerDeclaration, "LearnWorlds Sandbox authorization is missing");
  assert.ok(learnWorldsBranch > sandboxAuthorization, "LearnWorlds provider branch is missing");
  assert.ok(stripeConfiguration > learnWorldsBranch, "Website Stripe secrets are incorrectly required before LearnWorlds routing");
  assert.match(checkoutRoute, /learnworlds-product-unavailable/);
  assert.match(checkoutRoute, /x-obserra-learnworlds-product-id/);
  assert.match(checkoutRoute, /status: 303/);
});

test("live Academy commerce fails closed until course content is approved", () => {
  assert.match(offers, /contentState: "not-loaded"/);
  assert.match(offers, /livePurchaseEnabled: false/);
  assert.match(offers, /courseIsLiveForPurchase/);
  assert.match(checkoutRoute, /courseIsLiveForPurchase\(course\.id\)/);
  assert.match(checkoutRoute, /course-build-in-progress/);
  assert.match(checkoutRoute, /x-obserra-course-content-readiness", "not-approved"/);
  assert.match(checkoutRoute, /x-obserra-live-purchase", "blocked"/);
});

test("legacy website Stripe checkout remains present only as a governed rollback path", () => {
  assert.match(checkoutRoute, /stripe\.checkout\.sessions\.create/);
  assert.match(checkoutRoute, /x-obserra-commerce-provider", "website-stripe"/);
  assert.match(checkoutRoute, /x-obserra-webhook-verification", "required"/);
  assert.ok(
    checkoutRoute.indexOf("courseIsLiveForPurchase(course.id)") < checkoutRoute.indexOf("stripe.checkout.sessions.create"),
    "Website Stripe checkout is reachable before content-readiness enforcement",
  );
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
    "OBSERRA_OWNER_EMAIL",
  ]) {
    assert.match(environment, new RegExp(`^${variable}=`, "m"));
  }
  assert.match(environment, /^OBSERRA_OWNER_EMAIL=info@obserrallc\.com$/m);
  assert.doesNotMatch(environment, /@icloud\.com/i);
  assert.match(environment, /Never commit secret values/);
});
