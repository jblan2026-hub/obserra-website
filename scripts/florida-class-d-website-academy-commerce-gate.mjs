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
const authRuntimePath = "lib/auth/runtime-config.ts";
const websiteHealthPath = "app/api/health/route.ts";
const productionWorkflowPath = ".github/workflows/production-e2e-operational-gate.yml";
const contractsPath = "lib/academy-control-contracts.ts";
const controlPath = "lib/academy-control.ts";
const paymentPath = "lib/academy-payment.ts";
const paymentVerificationPath = "lib/academy-stripe-verification.ts";
const academyStripePath = "lib/academy-stripe.ts";
const checkoutPath = "app/api/academy/checkout/route.ts";
const checkoutFormPath = "app/academy/AcademyCheckoutForm.tsx";
const academyClientPath = "app/academy/AcademyControlledClient.tsx";
const academyCoursePagePath = "app/academy/[courseId]/page.tsx";
const mediaPath = "app/api/academy/media/route.ts";
const tutorPath = "app/api/academy/tutor/route.ts";
const redeemPath = "app/api/academy/redeem/route.ts";
const webhookPath = "app/api/webhook/stripe/route.ts";
const persistencePath = "lib/academy-persistence.ts";
const durableMigrationPath = "supabase/migrations/20260814061110_academy_durable_learner_commerce.sql";
const reversalMigrationPath = "supabase/migrations/20260815180000_academy_payment_reversal_governance.sql";
const repurchaseMigrationPath = "supabase/migrations/20260815190000_academy_payment_repurchase_reactivation.sql";
const checkoutReservationMigrationPath = "supabase/migrations/20260815200000_academy_checkout_attempt_reservations.sql";
const supabaseConfigPath = "supabase/config.toml";
const publicCatalogPath = "supabase/functions/academy-public-catalog/index.ts";
const baselinePublicationPath = "supabase/migrations/20260814025522_academy_baseline_publication_controls.sql";
const workerIndexesPath = "supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql";
const productionActivationPath = "lib/florida-class-d-production-activation.ts";
const tsconfigPath = "tsconfig.json";

const proxy = read(proxyPath);
const nextConfig = read(nextConfigPath);
const authRuntime = read(authRuntimePath);
const websiteHealth = read(websiteHealthPath);
const productionWorkflow = read(productionWorkflowPath);
const contracts = read(contractsPath);
const control = read(controlPath);
const payment = read(paymentPath);
const paymentVerification = read(paymentVerificationPath);
const academyStripe = read(academyStripePath);
const checkout = read(checkoutPath);
const checkoutForm = read(checkoutFormPath);
const academyClient = read(academyClientPath);
const academyCoursePage = read(academyCoursePagePath);
const media = read(mediaPath);
const tutor = read(tutorPath);
const redeem = read(redeemPath);
const webhook = read(webhookPath);
const persistence = read(persistencePath);
const durableMigration = read(durableMigrationPath);
const reversalMigration = read(reversalMigrationPath);
const repurchaseMigration = read(repurchaseMigrationPath);
const checkoutReservationMigration = read(checkoutReservationMigrationPath);
const supabaseConfig = read(supabaseConfigPath);
const publicCatalog = read(publicCatalogPath);
const baselinePublication = read(baselinePublicationPath);
const workerIndexes = read(workerIndexesPath);
const productionActivation = read(productionActivationPath);
const tsconfig = read(tsconfigPath);

// Clerk failure must never take down public pages. Identity is invoked only after
// canonical/regulatory boundaries, configuration readiness is checked first,
// protected routes still require auth(), and SDK failures fall back fail-closed.
requireText(proxyPath, proxy, "function preIdentityBoundary(request: NextRequest)", "pre-identity security boundary");
requireText(proxyPath, proxy, "return regulatedMutationBoundary(request);", "regulated mutation boundary before identity");
requireText(proxyPath, proxy, "function getConfiguredClerkHandler()", "lazy Clerk middleware factory");
requireText(proxyPath, proxy, "configuredClerkHandler = clerkMiddleware(", "Clerk middleware integration");
requireText(proxyPath, proxy, "await auth()", "protected-route Clerk authentication");
requireText(proxyPath, proxy, "export default async function proxy(request: NextRequest, event: NextFetchEvent)", "availability-safe proxy export");
requireText(proxyPath, proxy, "if (!authenticationReady())", "configuration readiness boundary");
requireText(proxyPath, proxy, "return identityConfigurationResponse(request);", "fail-closed identity fallback");
requireText(proxyPath, proxy, "return await getConfiguredClerkHandler()(request, event);", "Clerk request delegation");
requireText(proxyPath, proxy, "catch {", "Clerk runtime failure containment");
requireText(proxyPath, proxy, '"/(api|trpc)(.*)"', "API matcher");
requireText(proxyPath, proxy, '"/__clerk/(.*)"', "Clerk internal matcher");
forbidText(proxyPath, proxy, "export default clerkMiddleware(", "unconditional Clerk middleware export that can fail public traffic before fallback");

// Canonical liveness must identify the nonsecret Vercel project, deployment, and
// release SHA so routing ownership can be verified from a live response rather
// than inferred from identical source deployed to multiple projects. The project
// authority is single-sourced with the canonical production identity runtime so
// routing health and protected identity cannot silently disagree about ownership.
requireText(
  authRuntimePath,
  authRuntime,
  'export const CANONICAL_PUBLIC_VERCEL_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme"',
  "canonical Vercel project authority",
);
requireText(
  websiteHealthPath,
  websiteHealth,
  'import { CANONICAL_PUBLIC_VERCEL_PROJECT_ID } from "../../../lib/auth/runtime-config";',
  "single-source canonical Vercel project authority import",
);
requireText(
  websiteHealthPath,
  websiteHealth,
  "observedProjectId === CANONICAL_PUBLIC_VERCEL_PROJECT_ID",
  "canonical Vercel routing comparison",
);
requireText(websiteHealthPath, websiteHealth, 'systemValue("VERCEL_PROJECT_ID")', "observed Vercel project identity");
requireText(websiteHealthPath, websiteHealth, 'systemValue("VERCEL_DEPLOYMENT_ID")', "observed Vercel deployment identity");
requireText(websiteHealthPath, websiteHealth, 'systemValue("VERCEL_GIT_COMMIT_SHA")', "observed release commit identity");
requireText(websiteHealthPath, websiteHealth, '"x-obserra-routing-authority"', "machine-readable routing authority header");
requireText(websiteHealthPath, websiteHealth, 'verified: routingAuthority === "verified"', "explicit routing authority result");
requireText(productionWorkflowPath, productionWorkflow, '.routing.expectedProjectId == $expected_project_id', "live expected-project assertion");
requireText(productionWorkflowPath, productionWorkflow, '.routing.observedProjectId == $expected_project_id', "live observed-project assertion");
requireText(productionWorkflowPath, productionWorkflow, '.routing.authority == "verified"', "live routing authority assertion");
requireText(productionWorkflowPath, productionWorkflow, '^x-obserra-vercel-project-id:', "live project identity header assertion");

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
if (!baselinePublication.includes("on conflict")) {
  throw new Error(`Gate 32 failed: ${baselinePublicationPath} must use idempotent conflict handling`);
}
if (!baselinePublication.includes("academy_control_audit_events")) {
  throw new Error(`Gate 32 failed: ${baselinePublicationPath} must preserve control audit evidence`);
}

// Worker query paths require source-controlled performance coverage.
requireText(workerIndexesPath, workerIndexes, "create index if not exists", "idempotent worker indexes");
for (const column of ["payment_attempt_id", "user_id", "course_id", "checkout_session_id"]) {
  requireText(workerIndexesPath, workerIndexes, column, `worker index coverage for ${column}`);
}

// Checkout amount and fulfillment identity must be server-controlled and version-bound.
requireText(checkoutPath, checkout, "academyCheckoutAmount", "server-side amount resolution");
requireText(checkoutPath, checkout, "academyCheckoutCurrency", "server-side currency resolution");
requireText(checkoutPath, checkout, "courseVersion", "course version binding");
requireText(checkoutPath, checkout, "contentHash", "course content hash binding");
requireText(checkoutPath, checkout, "idempotencyKey", "Stripe idempotency key");
requireText(checkoutPath, checkout, "reserveAcademyCheckoutAttempt", "durable checkout reservation");
requireText(checkoutPath, checkout, "recoverAcademyCheckoutSession", "replay-safe checkout recovery");
forbidText(checkoutPath, checkout, "body.amount", "client-controlled amount");
forbidText(checkoutPath, checkout, "body.currency", "client-controlled currency");

// Browser checkout must use an explicit form interaction, not a hidden automatic purchase.
requireText(checkoutFormPath, checkoutForm, "<form", "explicit checkout form");
requireText(checkoutFormPath, checkoutForm, "Enroll", "visible enrollment action");
requireText(checkoutFormPath, checkoutForm, "fetch(\"/api/academy/checkout\"", "server checkout route");
forbidText(checkoutFormPath, checkoutForm, "dangerouslySetInnerHTML", "unsafe checkout HTML injection");

// Public Academy UI must derive purchasing from governed control state.
requireText(academyClientPath, academyClient, "purchaseEnabled", "governed purchase visibility");
requireText(academyCoursePagePath, academyCoursePage, "purchaseEnabled", "governed course purchase visibility");
requireText(academyCoursePagePath, academyCoursePage, "publicVisible", "governed course publication visibility");

// Stripe verification and webhook processing remain signature-bound and live-mode aware.
requireText(paymentVerificationPath, paymentVerification, "constructEvent", "Stripe signature verification");
requireText(paymentVerificationPath, paymentVerification, "webhookSecret", "webhook secret use");
requireText(academyStripePath, academyStripe, "livemode", "Stripe live-mode awareness");
requireText(webhookPath, webhook, "academyStripeWebhookEvent", "verified webhook event parsing");
requireText(webhookPath, webhook, "markAcademyPaymentSucceeded", "durable payment success processing");
requireText(webhookPath, webhook, "markAcademyPaymentReversed", "durable reversal processing");

// Payment success grants only Academy financial entitlement and remains revocable.
requireText(paymentPath, payment, "academyPaymentEntitlement", "financial entitlement contract");
requireText(persistencePath, persistence, "payment_status", "durable payment state");
requireText(reversalMigrationPath, reversalMigration, "revoked", "payment reversal revocation");
requireText(repurchaseMigrationPath, repurchaseMigration, "reactiv", "governed repurchase reactivation");
requireText(checkoutReservationMigrationPath, checkoutReservationMigration, "checkout_attempt", "durable checkout attempt reservation");

// Production activation remains distinct from website/Academy availability.
requireText(productionActivationPath, productionActivation, "authorization", "regulated production authorization boundary");
requireText(tsconfigPath, tsconfig, '"strict": true', "strict TypeScript mode");

console.log("Florida Class D Gate 32 passed: public website availability, canonical routing authority, Academy control publication, secure commerce, payment reversal, and fail-closed protected access are validated in source.");
