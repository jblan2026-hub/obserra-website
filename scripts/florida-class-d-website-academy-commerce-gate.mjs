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
const nextConfigPath = "next.config.ts";
const contractsPath = "lib/academy-control-contracts.ts";
const controlPath = "lib/academy-control.ts";
const checkoutPath = "app/api/academy/checkout/route.ts";
const checkoutFormPath = "app/academy/AcademyCheckoutForm.tsx";
const academyClientPath = "app/academy/AcademyControlledClient.tsx";
const academyCoursePagePath = "app/academy/[courseId]/page.tsx";
const mediaPath = "app/api/academy/media/route.ts";
const tutorPath = "app/api/academy/tutor/route.ts";
const redeemPath = "app/api/academy/redeem/route.ts";
const webhookPath = "app/api/webhook/stripe/route.ts";
const supabaseConfigPath = "supabase/config.toml";
const publicCatalogPath = "supabase/functions/academy-public-catalog/index.ts";
const baselinePublicationPath = "supabase/migrations/20260814025522_academy_baseline_publication_controls.sql";
const workerIndexesPath = "supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql";
const productionActivationPath = "lib/florida-class-d-production-activation.ts";
const tsconfigPath = "tsconfig.json";

const proxy = read(proxyPath);
const nextConfig = read(nextConfigPath);
const contracts = read(contractsPath);
const control = read(controlPath);
const checkout = read(checkoutPath);
const checkoutForm = read(checkoutFormPath);
const academyClient = read(academyClientPath);
const academyCoursePage = read(academyCoursePagePath);
const media = read(mediaPath);
const tutor = read(tutorPath);
const redeem = read(redeemPath);
const webhook = read(webhookPath);
const supabaseConfig = read(supabaseConfigPath);
const publicCatalog = read(publicCatalogPath);
const baselinePublication = read(baselinePublicationPath);
const workerIndexes = read(workerIndexesPath);
const productionActivation = read(productionActivationPath);
const tsconfig = read(tsconfigPath);

// Clerk must wrap the exported Next.js proxy directly so auth() can detect middleware execution.
requireText(proxyPath, proxy, "export default clerkMiddleware(", "direct Clerk middleware export");
requireText(proxyPath, proxy, '"/(api|trpc)(.*)"', "API matcher");
requireText(proxyPath, proxy, '"/__clerk/(.*)"', "Clerk internal matcher");
forbidText(proxyPath, proxy, "const handler = clerkMiddleware(", "nested Clerk middleware handler");

// The public website and sensitive routes must retain secure transport, framing, caching, and disclosure defaults.
requireText(nextConfigPath, nextConfig, "poweredByHeader: false", "framework disclosure disabled");
requireText(nextConfigPath, nextConfig, '"object-src \'none\'"', "CSP object blocking");
requireText(nextConfigPath, nextConfig, '"frame-ancestors \'none\'"', "CSP framing protection");
requireText(nextConfigPath, nextConfig, '"upgrade-insecure-requests"', "CSP transport upgrade");
requireText(nextConfigPath, nextConfig, "Strict-Transport-Security", "HSTS header");
requireText(nextConfigPath, nextConfig, "max-age=63072000; includeSubDomains; preload", "long-lived HSTS policy");
requireText(nextConfigPath, nextConfig, "X-Content-Type-Options", "MIME sniffing protection");
requireText(nextConfigPath, nextConfig, "Cross-Origin-Opener-Policy", "cross-origin opener protection");
requireText(nextConfigPath, nextConfig, 'source: "/api/academy/:path*"', "Academy API no-store headers");
requireText(nextConfigPath, nextConfig, 'source: "/api/webhook/stripe"', "Stripe webhook no-store headers");
requireText(nextConfigPath, nextConfig, 'source: "/api/florida-class-d/:path*"', "Class D API no-store headers");
requireText(nextConfigPath, nextConfig, 'source: "/academy/success"', "Academy payment-return no-store headers");
requireText(nextConfigPath, nextConfig, 'source: "/sign-in/:path*"', "sign-in no-store headers");
requireText(nextConfigPath, nextConfig, 'source: "/sign-up/:path*"', "sign-up no-store headers");

// Missing or malformed Academy control data must fail closed.
requireText(contractsPath, contracts, 'lifecycle: "unpublished"', "unpublished default lifecycle");
requireText(contractsPath, contracts, "publicVisible: false", "non-public default");
requireText(contractsPath, contracts, "purchaseEnabled: false", "non-purchasable default");
requireText(controlPath, control, "courses: []", "empty degraded public catalog");
requireText(controlPath, control, "course: null", "unavailable degraded public course");

// Paid Academy media and AI tutor access must never bypass authentication or entitlement checks in preview.
for (const [path, source] of [[mediaPath, media], [tutorPath, tutor]]) {
  requireText(path, source, "await auth()", "Clerk authentication");
  requireText(path, source, "academyStateWithOwnerAccess", "entitlement lookup");
  requireText(path, source, "Paid course access is required", "paid entitlement enforcement");
  forbidText(path, source, 'process.env.VERCEL_ENV === "preview"', "preview authentication bypass");
  forbidText(path, source, "ownerPreview", "preview entitlement bypass");
}

// The public catalog is intentionally unauthenticated at the gateway, GET-only, field-limited, and public-visible-only.
requireText(supabaseConfigPath, supabaseConfig, "[functions.academy-public-catalog]", "public catalog function config");
requireText(supabaseConfigPath, supabaseConfig, "verify_jwt = false", "public catalog JWT gateway disabled");
requireText(publicCatalogPath, publicCatalog, 'request.method !== "GET"', "GET-only method guard");
requireText(publicCatalogPath, publicCatalog, '.select("course_id, lifecycle, public_visible, purchase_enabled, preserve_existing_entitlements, revision, updated_at")', "public control field allowlist");
requireText(publicCatalogPath, publicCatalog, '.select("course_id, course_summary, content_hash, revision, updated_at")', "public override field allowlist");
requireText(publicCatalogPath, publicCatalog, '.eq("public_visible", true)', "public-visible-only control filter");
requireText(publicCatalogPath, publicCatalog, '.in("course_id", publicCourseIds)', "public-only override filter");
forbidText(publicCatalogPath, publicCatalog, "requireServiceRole(request)", "caller service-role requirement");

// Reviewed website baseline publication must be idempotent, audited, and contain exactly 60 non-regulated courses.
const baselineIds = [...baselinePublication.matchAll(/\('([a-z0-9]+(?:-[a-z0-9]+)*)'\)/g)].map((match) => match[1]);
if (baselineIds.length !== 60 || new Set(baselineIds).size !== 60) {
  throw new Error(`Gate 32 failed: ${baselinePublicationPath} must contain exactly 60 unique baseline course IDs`);
}
if (baselineIds.some((courseId) => courseId.includes("class-d") || courseId.includes("security-officer"))) {
  throw new Error(`Gate 32 failed: ${baselinePublicationPath} must not publish regulated Class D training`);
}
requireText(baselinePublicationPath, baselinePublication, "on conflict (course_id) do nothing", "idempotent publication insert");
requireText(baselinePublicationPath, baselinePublication, "system:baseline-reviewed-catalog", "audited system publication actor");
requireText(baselinePublicationPath, baselinePublication, "baseline-published", "publication audit event");

// Academy worker foreign keys required by the production control plane must retain covering indexes.
requireText(workerIndexesPath, workerIndexes, "academy_openai_usage_events_command_idx", "OpenAI usage command FK index");
requireText(workerIndexesPath, workerIndexes, "academy_openai_usage_events_node_idx", "OpenAI usage node FK index");
requireText(workerIndexesPath, workerIndexes, "academy_worker_slot_status_command_idx", "worker slot command FK index");

// Deno Edge Function source must remain outside the Next.js application type-check boundary.
requireText(tsconfigPath, tsconfig, '"supabase/functions/**"', "Supabase Edge Function type-check exclusion");

// Creating a Stripe Checkout Session is a state-changing operation and must be POST-only with same-origin CSRF protection.
requireText(checkoutPath, checkout, "export async function POST(request: Request)", "POST checkout handler");
requireText(checkoutPath, checkout, "export async function GET()", "non-mutating GET handler");
requireText(checkoutPath, checkout, "rejectedRequest(405", "GET method rejection");
requireText(checkoutPath, checkout, 'response.headers.set("allow", "POST")', "POST Allow header");
requireText(checkoutPath, checkout, 'request.headers.get("origin")', "Origin validation");
requireText(checkoutPath, checkout, "new URL(origin).origin === requestUrl.origin", "same-origin comparison");
requireText(checkoutPath, checkout, "isSupportedFormContentType(request)", "form content-type restriction");
requireText(checkoutPath, checkout, "await request.formData()", "form body parsing");
forbidText(checkoutPath, checkout, 'requestUrl.searchParams.get("course")', "query-string checkout mutation input");

// Academy UI purchase actions must submit POST forms rather than mutation links.
requireText(checkoutFormPath, checkoutForm, 'action="/api/academy/checkout"', "checkout form action");
requireText(checkoutFormPath, checkoutForm, 'method="post"', "checkout POST method");
requireText(checkoutFormPath, checkoutForm, 'type="hidden" name="course"', "course form field");
requireText(academyClientPath, academyClient, "<AcademyCheckoutForm", "catalog POST checkout component");
requireText(academyCoursePagePath, academyCoursePage, "<AcademyCheckoutForm", "course-page POST checkout component");
forbidText(academyClientPath, academyClient, "/api/academy/checkout?course=", "legacy GET checkout link");
forbidText(academyCoursePagePath, academyCoursePage, "/api/academy/checkout?course=", "legacy GET checkout link");

// Academy checkout must fail closed without current catalog authorization and Stripe webhook verification.
requireText(checkoutPath, checkout, "STRIPE_SECRET_KEY", "Stripe secret readiness check");
requireText(checkoutPath, checkout, "STRIPE_WEBHOOK_SECRET", "Stripe webhook readiness check");
requireText(checkoutPath, checkout, 'runtimeCourse.controlPlane !== "operational"', "operational control-plane requirement");
requireText(checkoutPath, checkout, "!runtimeCourse.control.purchaseEnabled", "purchase authorization requirement");
requireText(checkoutPath, checkout, 'response.headers.set("cache-control", NO_STORE)', "no-store commerce response");

// Deferred payment claims must re-fetch the paid Stripe session and match a verified Clerk email address.
requireText(redeemPath, redeem, "checkout.sessions.retrieve(sessionId)", "Stripe session re-verification");
requireText(redeemPath, redeem, 'session.payment_status === "paid"', "paid redemption requirement");
requireText(redeemPath, redeem, 'session.metadata?.courseId === courseId', "course-bound redemption requirement");
requireText(redeemPath, redeem, 'item.verification?.status === "verified"', "verified Clerk email requirement");
requireText(redeemPath, redeem, "authenticatedUserOwnsVerifiedPurchaserEmail", "verified purchaser-email ownership check");

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
forbidText(redeemPath, redeem.toLowerCase(), "florida-class-d", "Florida Class D generic Academy redemption coupling");
forbidText(webhookPath, webhook.toLowerCase(), "florida-class-d", "Florida Class D generic Stripe fulfillment coupling");

console.log("Gate 32 passed: website headers, identity, Academy paid media/tutor access, publication/control plane, database dependencies, POST-only commerce, verified payment claims, webhook, and regulated separation are secure-by-default.");
