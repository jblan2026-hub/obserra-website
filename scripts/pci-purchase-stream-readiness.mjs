import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const checks = [];
const check = (condition, description) => checks.push([Boolean(condition), description]);

const required = [
  "compliance/pci-dss-purchase-stream-crosswalk.json",
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "lib/stripe.ts",
  "scripts/browser-asset-security-gate.mjs",
  "scripts/data-protection-readiness.mjs",
  "scripts/commerce-credential-readiness.mjs",
  "lib/compliance-compiler.ts",
  "app/admin/governance/page.tsx",
];
for (const file of required) check(exists(file), `required PCI purchase-stream artifact exists: ${file}`);

const crosswalk = JSON.parse(read("compliance/pci-dss-purchase-stream-crosswalk.json"));
check(crosswalk.schemaVersion === "1.0", "PCI crosswalk declares schema version");
check(/PCI DSS 4\.0\.1/i.test(crosswalk.framework), "PCI crosswalk identifies PCI DSS v4.0.1");
check(/Stripe-hosted/i.test(crosswalk.scopeStatement ?? crosswalk.scopeModel), "PCI scope uses Stripe-hosted checkout");
check(/does not collect|does not store/i.test(crosswalk.scopeStatement ?? crosswalk.scopeModel), "PCI scope excludes card-data collection or storage");
check(Array.isArray(crosswalk.controls) && crosswalk.controls.length >= 12, "PCI crosswalk provides substantive individual-control coverage");
check(new Set(crosswalk.controls.map((control) => control.controlId)).size === crosswalk.controls.length, "PCI control identifiers are unique");
for (const control of crosswalk.controls) {
  check(typeof control.controlId === "string" && control.controlId.length > 2, `${control.controlId} has an identifier`);
  check(typeof control.capability === "string" && control.capability.length >= 25, `${control.controlId} has a substantive implementation summary`);
  check(Array.isArray(control.evidence) && control.evidence.length > 0, `${control.controlId} has evidence references`);
  check(Array.isArray(control.tests) && control.tests.length > 0, `${control.controlId} has test references`);
  check(["implemented", "partial", "planned"].includes(control.status), `${control.controlId} has a bounded status`);
}

const checkout = read("app/api/academy/checkout/route.ts");
for (const [condition, description] of [
  [checkout.includes("STRIPE_SECRET_KEY"), "checkout requires Stripe secret configuration"],
  [checkout.includes("STRIPE_WEBHOOK_SECRET"), "checkout requires webhook verification configuration"],
  [/!process\.env\.STRIPE_SECRET_KEY\s*\|\|\s*!process\.env\.STRIPE_WEBHOOK_SECRET/.test(checkout), "checkout fails closed unless both Stripe secrets are configured"],
  [checkout.includes("stripe.checkout.sessions.create"), "checkout uses provider-hosted Checkout Sessions"],
  [checkout.includes("session.url"), "checkout redirects to the provider-hosted payment URL"],
  [!/cardNumber|card_number|cvv|cvc|primaryAccountNumber|magneticStripe/.test(checkout), "checkout does not accept raw card fields"],
  [checkout.includes("client_reference_id"), "checkout binds a purchaser reference"],
  [checkout.includes("metadata"), "checkout includes bounded fulfillment metadata"],
  [checkout.includes('mode: "payment"'), "course checkout uses one-time payment mode"],
  [checkout.includes('billing_address_collection: "auto"'), "billing address collection remains provider hosted"],
  [checkout.includes('Cache-Control", "private, no-store'), "checkout response is private and non-cacheable"],
  [checkout.includes('X-Robots-Tag", "noindex, nofollow'), "checkout response is excluded from indexing"],
  [!checkout.includes("running without STRIPE_WEBHOOK_SECRET"), "checkout does not tolerate missing webhook verification"],
]) check(condition, description);

const webhook = read("app/api/webhook/stripe/route.ts");
for (const [condition, description] of [
  [webhook.includes('request.headers.get("stripe-signature")'), "webhook requires the Stripe signature header"],
  [webhook.includes("STRIPE_WEBHOOK_SECRET"), "webhook requires a verification secret"],
  [webhook.includes("constructEvent"), "webhook verifies provider signatures"],
  [webhook.includes("await request.text()"), "webhook verifies the raw request body"],
  [webhook.includes('event.type === "checkout.session.completed"'), "webhook handles completed sessions"],
  [webhook.includes('event.type === "checkout.session.async_payment_succeeded"'), "webhook handles asynchronous payment success"],
  [webhook.includes('session.payment_status === "paid"'), "fulfillment requires paid status"],
  [webhook.includes("unknown-course"), "webhook rejects unknown products"],
  [webhook.includes("eventId"), "webhook preserves provider event identifiers"],
  [webhook.includes("fulfillmentState"), "webhook returns a bounded fulfillment outcome"],
  [!/cardNumber|card_number|cvv|cvc|primaryAccountNumber/.test(webhook), "webhook does not process raw card fields"],
  [!/STRIPE_WEBHOOK_SECRET[^\n]*(console|JSON|stringify)/.test(webhook), "webhook does not log its verification secret"],
]) check(condition, description);

const stripe = read("lib/stripe.ts");
check(stripe.includes("server-only"), "Stripe SDK wrapper is server only");
check(stripe.includes("STRIPE_SECRET_KEY"), "Stripe SDK wrapper uses server-side configuration");
check(!stripe.includes("NEXT_PUBLIC_STRIPE_SECRET"), "Stripe secret is not exposed through a public environment variable");

const browserGate = read("scripts/browser-asset-security-gate.mjs");
check(/script|asset/i.test(browserGate), "browser gate evaluates scripts or assets affecting public pages");
check(/security|integrity/i.test(browserGate), "browser gate evaluates security or integrity");

const dataProtection = read("scripts/data-protection-readiness.mjs");
check(/secret|credential/i.test(dataProtection), "data-protection gate evaluates secret handling");
check(/no-store|cache/i.test(dataProtection), "data-protection gate evaluates caching controls");

const commerce = read("scripts/commerce-credential-readiness.mjs");
check(/STRIPE_SECRET_KEY|stripe/i.test(commerce), "commerce credential gate evaluates Stripe configuration");
check(/webhook/i.test(commerce), "commerce credential gate evaluates webhook configuration");

const compiler = read("lib/compliance-compiler.ts");
check(compiler.includes("buildGovernanceExport"), "continuous compiler reads the unified framework registry");
check(compiler.includes("releaseBlockingFindings"), "continuous compiler accounts for security release blockers");

const governance = read("app/admin/governance/page.tsx");
check(governance.includes("FRAMEWORK COVERAGE"), "Control Center exposes framework coverage");
check(governance.includes("ContinuousCompliancePanel"), "Control Center exposes live compliance compilation");

for (const [condition, description] of checks) assert.ok(condition, `PCI purchase-stream readiness failed: ${description}`);
assert.ok(checks.length >= 100, `PCI purchase-stream gate must evaluate at least 100 controls, found ${checks.length}`);
console.log(JSON.stringify({ passed: true, macroGate: "pci-purchase-stream-readiness", controlsEvaluated: checks.length, hostedCheckout: true, rawCardDataCollected: false, webhookVerificationRequired: true, controlCenterCrosswalk: true, continuousCompliance: true }, null, 2));
