import fs from "node:fs";

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`Gate 32 missing required source file: ${path}`);
  return fs.readFileSync(path, "utf8");
}

function requireText(path, source, text, label = text) {
  if (!source.includes(text)) throw new Error(`Gate 32 failed: ${path} missing ${label}`);
}

function forbidText(path, source, text, label = text) {
  if (source.includes(text)) throw new Error(`Gate 32 failed: ${path} contains forbidden ${label}`);
}

const proxyPath = "proxy.ts";
const contractsPath = "lib/academy-control-contracts.ts";
const controlPath = "lib/academy-control.ts";
const checkoutPath = "app/api/academy/checkout/route.ts";
const webhookPath = "app/api/webhook/stripe/route.ts";
const supabaseConfigPath = "supabase/config.toml";
const publicCatalogPath = "supabase/functions/academy-public-catalog/index.ts";
const productionActivationPath = "lib/florida-class-d-production-activation.ts";

const proxy = read(proxyPath);
const contracts = read(contractsPath);
const control = read(controlPath);
const checkout = read(checkoutPath);
const webhook = read(webhookPath);
const supabaseConfig = read(supabaseConfigPath);
const publicCatalog = read(publicCatalogPath);
const productionActivation = read(productionActivationPath);

// Clerk must wrap the exported Next.js proxy directly so auth() can detect middleware execution.
requireText(proxyPath, proxy, "export default clerkMiddleware(", "direct Clerk middleware export");
requireText(proxyPath, proxy, '"/(api|trpc)(.*)"', "API matcher");
requireText(proxyPath, proxy, '"/__clerk/(.*)"', "Clerk internal matcher");
forbidText(proxyPath, proxy, "const handler = clerkMiddleware(", "nested Clerk middleware handler");

// Missing or malformed Academy control data must fail closed.
requireText(contractsPath, contracts, 'lifecycle: "unpublished"', "unpublished default lifecycle");
requireText(contractsPath, contracts, "publicVisible: false", "non-public default");
requireText(contractsPath, contracts, "purchaseEnabled: false", "non-purchasable default");
requireText(controlPath, control, "courses: []", "empty degraded public catalog");
requireText(controlPath, control, "course: null", "unavailable degraded public course");

// The public catalog is intentionally unauthenticated at the gateway, GET-only, and limited to public fields.
requireText(supabaseConfigPath, supabaseConfig, "[functions.academy-public-catalog]", "public catalog function config");
requireText(supabaseConfigPath, supabaseConfig, "verify_jwt = false", "public catalog JWT gateway disabled");
requireText(publicCatalogPath, publicCatalog, 'request.method !== "GET"', "GET-only method guard");
requireText(publicCatalogPath, publicCatalog, '.select("course_id, lifecycle, public_visible, purchase_enabled, preserve_existing_entitlements, revision, updated_at")', "public control field allowlist");
requireText(publicCatalogPath, publicCatalog, '.select("course_id, course_summary, content_hash, revision, updated_at")', "public override field allowlist");
forbidText(publicCatalogPath, publicCatalog, "requireServiceRole(request)", "caller service-role requirement");

// Academy checkout must fail closed without current catalog authorization and Stripe webhook verification.
requireText(checkoutPath, checkout, "STRIPE_SECRET_KEY", "Stripe secret readiness check");
requireText(checkoutPath, checkout, "STRIPE_WEBHOOK_SECRET", "Stripe webhook readiness check");
requireText(checkoutPath, checkout, 'runtimeCourse.controlPlane !== "operational"', "operational control-plane requirement");
requireText(checkoutPath, checkout, "!runtimeCourse.control.purchaseEnabled", "purchase authorization requirement");
requireText(checkoutPath, checkout, 'response.headers.set("cache-control", "private, no-store, max-age=0")', "no-store commerce response");

// Fulfillment must be driven by signed Stripe webhooks and only after a paid event.
requireText(webhookPath, webhook, 'request.headers.get("stripe-signature")', "Stripe signature header");
requireText(webhookPath, webhook, "webhooks.constructEvent", "Stripe signature verification");
requireText(webhookPath, webhook, 'event.type === "checkout.session.completed"', "checkout completion event");
requireText(webhookPath, webhook, 'session.payment_status === "paid"', "paid status check");
requireText(webhookPath, webhook, 'event.type === "checkout.session.async_payment_succeeded"', "async payment success event");
requireText(webhookPath, webhook, "grantCourseAccess", "post-payment entitlement grant");

// Florida Class D remains controlled by its dedicated activation authority and must not be unlocked by generic Academy commerce.
requireText(productionActivationPath, productionActivation, "production", "regulated production activation source");
requireText(productionActivationPath, productionActivation, "authorize", "regulated authorization source");
forbidText(checkoutPath, checkout.toLowerCase(), "florida-class-d", "Florida Class D generic Academy checkout coupling");
forbidText(webhookPath, webhook.toLowerCase(), "florida-class-d", "Florida Class D generic Stripe fulfillment coupling");

console.log("Gate 32 passed: website identity, Academy control plane, commerce, webhook, and regulated separation are secure-by-default.");
