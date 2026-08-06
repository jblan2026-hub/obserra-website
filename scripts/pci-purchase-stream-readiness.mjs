import fs from "node:fs";

const checks = [];
const add = (name, pass) => checks.push({ name, pass: Boolean(pass) });
const read = (path) => fs.readFileSync(path, "utf8");

const checkout = read("app/api/academy/checkout/route.ts");
const webhook = read("app/api/webhook/stripe/route.ts");
const crosswalk = JSON.parse(read("compliance/pci-dss-purchase-stream-crosswalk.json"));

add("Stripe-hosted checkout is used", checkout.includes("checkout.sessions.create"));
add("Application does not render card fields", !checkout.match(/cardNumber|cvc|pan|magneticStripe/i));
add("Webhook signature is required", webhook.includes("stripe-signature"));
add("Webhook secret is required", webhook.includes("STRIPE_WEBHOOK_SECRET"));
add("Provider signature verification is used", webhook.includes("constructEvent"));
add("Only paid sessions are fulfilled", webhook.includes('payment_status === "paid"'));
add("PCI crosswalk identifies version 4.0.1", crosswalk.framework === "PCI DSS 4.0.1");
add("PCI crosswalk has at least twelve controls", Array.isArray(crosswalk.controls) && crosswalk.controls.length >= 12);
add("Every PCI control has evidence", crosswalk.controls.every((c) => Array.isArray(c.evidence) && c.evidence.length));
add("Every PCI control has tests", crosswalk.controls.every((c) => Array.isArray(c.tests) && c.tests.length));
add("No certification claim is made", /does not constitute PCI certification/i.test(crosswalk.scopeStatement));
add("Checkout uses provider customer creation", checkout.includes('customer_creation: "always"'));
add("Checkout metadata excludes raw card data", !checkout.match(/primary account number|security code|cvv|cvc/i));
add("Webhook logs bounded provider identifiers", webhook.includes("eventId") && webhook.includes("sessionId"));
add("Webhook response is sanitized", webhook.includes("fulfillmentState") && !webhook.includes("customer_details"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`PCI purchase-stream readiness failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`PCI purchase-stream readiness passed: ${checks.length}/${checks.length}`);
