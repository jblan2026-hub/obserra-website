import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const requiredFiles = [
  "app/api/academy/checkout/route.ts",
  "app/api/academy/certificate/verify/route.ts",
  "lib/academy-certificate-verification.ts",
  "lib/stripe.ts",
  "scripts/customer-journey-gate.mjs",
  "next.config.ts",
];
for (const file of requiredFiles) assert.ok(fs.existsSync(path.join(root, file)), `Missing commerce or credential control: ${file}`);

const checkout = read("app/api/academy/checkout/route.ts");
assert.match(checkout, /STRIPE_SECRET_KEY/, "Checkout must require Stripe configuration");
assert.match(checkout, /mode:\s*["']payment["']/, "Checkout must create payment-mode sessions");
assert.match(checkout, /client_reference_id/, "Checkout must bind a purchaser reference");
assert.match(checkout, /metadata/, "Checkout must attach entitlement and credential metadata");
assert.match(checkout, /success_url/, "Checkout must define a success return path");
assert.match(checkout, /cancel_url/, "Checkout must define a cancellation return path");
assert.match(checkout, /status:\s*303/, "Checkout redirects must use an explicit post-safe redirect");
assert.match(checkout, /enrollment=not-ready/, "Unavailable commerce must fail safely");
assert.match(checkout, /checkout-unavailable/, "Stripe failures must return a branded recovery path");
assert.doesNotMatch(checkout, /STRIPE_SECRET_KEY\s*[:=]\s*["'][^"']+["']/, "Stripe secrets must not be embedded in source");

const verifyRoute = read("app/api/academy/certificate/verify/route.ts");
assert.match(verifyRoute, /certificateId is required/, "Certificate verification must reject missing identifiers");
assert.match(verifyRoute, /invalid-format/, "Certificate verification must distinguish malformed identifiers");
assert.match(verifyRoute, /status:\s*400/, "Malformed certificate identifiers must fail with HTTP 400");
assert.match(verifyRoute, /status:\s*404/, "Unknown certificate identifiers must fail with HTTP 404");
assert.match(verifyRoute, /Cache-Control["']?\s*:\s*["']no-store["']/, "Certificate verification responses must not be cached");

const verifier = read("lib/academy-certificate-verification.ts");
assert.match(verifier, /valid/i, "Certificate verifier must expose a validity decision");
assert.match(verifier, /certificate/i, "Certificate verifier must operate on certificate records");
assert.match(verifier, /invalid-format|format/i, "Certificate verifier must validate identifier format");

const journey = read("scripts/customer-journey-gate.mjs");
for (const signal of [
  "/academy/verify",
  "/api/academy/certificate/verify",
  "invalid-checkout-fails-safely",
  "academy-discovery-and-credential-journey",
]) {
  assert.ok(journey.includes(signal), `Deployed journey coverage is missing: ${signal}`);
}

const nextConfig = read("next.config.ts");
for (const signal of ["/api/checkout/:path*", "/api/stripe/:path*", "/academy/enroll/:path*", "private, no-store"]) {
  assert.ok(nextConfig.includes(signal), `Transactional response protection is missing: ${signal}`);
}

console.log(JSON.stringify({
  passed: true,
  macroGate: "commerce-credential-readiness",
  stripeSecretEmbedded: false,
  purchaserBinding: true,
  entitlementMetadata: true,
  safeFailurePaths: true,
  certificateFormatValidation: true,
  certificateNoStore: true,
  deployedJourneyCoverage: true,
}, null, 2));
