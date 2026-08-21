import fs from "node:fs";

const failures = [];
const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
};
const requireText = (file, source, text, control) => {
  if (!source.includes(text)) failures.push(`${control}: ${file} is missing ${text}`);
};
const forbidText = (file, source, text, control) => {
  if (source.includes(text)) failures.push(`${control}: ${file} contains forbidden ${text}`);
};

const migrationFile = "supabase/migrations/20260814061110_academy_durable_learner_commerce.sql";
const eventHardeningFile = "supabase/migrations/20260814061912_academy_payment_event_integrity_hardening.sql";
const reversalMigrationFile = "supabase/migrations/20260815180000_academy_payment_reversal_governance.sql";
const repurchaseMigrationFile = "supabase/migrations/20260815190000_academy_payment_repurchase_reactivation.sql";
const checkoutReservationMigrationFile = "supabase/migrations/20260815200000_academy_checkout_attempt_reservations.sql";
const persistenceFile = "lib/academy-persistence.ts";
const paymentFile = "lib/academy-payment.ts";
const academyStripeFile = "lib/academy-stripe.ts";
const academyFile = "lib/academy.ts";
const academyIdentityFile = "lib/academy-identity.ts";
const legacyClerkFile = "lib/academy-legacy-clerk.ts";
const requestFile = "lib/academy-request.ts";
const checkoutFile = "app/api/academy/checkout/route.ts";
const webhookFile = "app/api/webhook/stripe/route.ts";
const redeemFile = "app/api/academy/redeem/route.ts";
const assessmentFile = "app/api/academy/assessment/route.ts";
const progressFile = "app/api/academy/progress/route.ts";
const commerceHealthFile = "app/api/academy/commerce-health/route.ts";
const operationalWorkflowFile = ".github/workflows/production-e2e-operational-gate.yml";
const websiteCiWorkflowFile = ".github/workflows/website-ci.yml";

const migration = read(migrationFile);
const eventHardening = read(eventHardeningFile);
const reversalMigration = read(reversalMigrationFile);
const repurchaseMigration = read(repurchaseMigrationFile);
const checkoutReservationMigration = read(checkoutReservationMigrationFile);
const persistence = read(persistenceFile);
const payment = read(paymentFile);
const academyStripe = read(academyStripeFile);
const academy = read(academyFile);
const academyIdentity = read(academyIdentityFile);
const legacyClerk = read(legacyClerkFile);
const request = read(requestFile);
const checkout = read(checkoutFile);
const webhook = read(webhookFile);
const redeem = read(redeemFile);
const assessment = read(assessmentFile);
const progress = read(progressFile);
const commerceHealth = read(commerceHealthFile);
const operationalWorkflow = read(operationalWorkflowFile);
const websiteCiWorkflow = read(websiteCiWorkflowFile);

const tables = [
  "academy_learner_state",
  "academy_payment_events",
  "academy_assessment_records",
  "academy_learner_events",
];
for (const table of tables) {
  requireText(migrationFile, migration, `create table if not exists public.${table}`, `${table} durable schema`);
  requireText(migrationFile, migration, `alter table public.${table} enable row level security`, `${table} RLS enabled`);
  requireText(migrationFile, migration, `alter table public.${table} force row level security`, `${table} RLS forced`);
  requireText(migrationFile, migration, `revoke all on public.${table} from public, anon, authenticated`, `${table} public access denied`);
}

for (const rpc of [
  "academy_record_paid_checkout",
  "academy_claim_paid_checkout",
  "academy_import_legacy_state",
  "academy_get_learner_state",
  "academy_complete_lesson",
  "academy_record_assessment",
  "academy_find_certificate",
  "academy_storage_health",
  "academy_aggregate_metrics",
]) {
  requireText(migrationFile, migration, `create or replace function public.${rpc}`, `${rpc} defined`);
  requireText(migrationFile, migration, `grant execute on function public.${rpc}`, `${rpc} service-role execution`);
}

requireText(migrationFile, migration, "security definer", "server-side transaction authority");
requireText(migrationFile, migration, "set search_path = ''", "security-definer search path hardening");
requireText(migrationFile, migration, "academy_reject_audit_mutation", "append-only audit enforcement");
requireText(migrationFile, migration, "before update or delete on public.academy_assessment_records", "assessment audit immutability");
requireText(migrationFile, migration, "before update or delete on public.academy_learner_events", "learner audit immutability");
requireText(migrationFile, migration, "answers_retained boolean not null default false", "assessment answer minimization");
requireText(migrationFile, migration, "constraint academy_assessment_records_no_answers check (answers_retained = false)", "assessment answer retention prohibition");
requireText(migrationFile, migration, "on conflict (event_id) do update", "Stripe event idempotency");
requireText(migrationFile, migration, "Stripe event identity mismatch", "idempotency collision rejection");
for (const text of [
  "payment_intent_id is distinct from",
  "course_version <> p_course_version",
  "identity_mode <> p_identity_mode",
  "clerk_user_id is distinct from",
  "purchaser_email_hash is distinct from",
  "Stripe event material identity mismatch",
  "Paid checkout course version mismatch",
]) {
  requireText(eventHardeningFile, eventHardening, text, "material Stripe event and claim identity binding");
}
requireText(eventHardeningFile, eventHardening, "v_event.course_version", "signed-webhook course version authority");
requireText(eventHardeningFile, eventHardening, "academy_payment_events_user_id", "payment-event user identity bound");
for (const text of [
  "academy_payment_reversal_events",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
  "academy_record_payment_reversal",
  "Ambiguous paid checkout mapping",
  "idempotentReplay",
  "academy_learner_state_reversal_guard",
]) requireText(reversalMigrationFile, reversalMigration, text, "durable payment reversal governance");
requireText(reversalMigrationFile, reversalMigration, "force row level security", "payment reversal forced RLS");
requireText(reversalMigrationFile, reversalMigration, "from public, anon, authenticated", "payment reversal browser denial");
requireText(
  reversalMigrationFile,
  reversalMigration,
  "revoke all on public.academy_payment_reversal_events from service_role",
  "payment reversal service-role default privilege reset",
);
requireText(
  reversalMigrationFile,
  reversalMigration,
  "grant select, insert, update on public.academy_payment_reversal_events to service_role",
  "payment reversal service-role least privilege",
);
for (const text of [
  "create or replace function public.academy_record_paid_checkout",
  "create or replace function public.academy_claim_paid_checkout",
  "on conflict (clerk_user_id, course_slug) do update",
  "access_status in ('refunded', 'revoked')",
  "payment_reference is distinct from excluded.payment_reference",
  "not exists (",
  "academy_payment_reversal_events",
  "returning * into v_state",
  "Verified payment did not activate exact Academy access",
]) requireText(repurchaseMigrationFile, repurchaseMigration, text, "distinct verified repurchase reactivation");
requireText(repurchaseMigrationFile, repurchaseMigration, "from public, anon, authenticated, service_role", "replacement RPC ACL normalization");
for (const text of [
  "create table if not exists public.academy_checkout_attempts",
  "force row level security",
  "pg_advisory_xact_lock",
  "academy_reserve_checkout_attempt",
  "academy_bind_checkout_attempt",
  "academy_record_checkout_session",
  "request_fingerprint",
  "stripe_session_id",
  "from public, anon, authenticated, service_role",
]) requireText(checkoutReservationMigrationFile, checkoutReservationMigration, text, "durable checkout creation serialization");
for (const text of [
  "create or replace function public.academy_storage_health()",
  "academy-durable-state-v2",
  "paymentReversalRows",
  "checkoutAttemptRows",
  "academy_learner_state_reversal_guard",
]) requireText(checkoutReservationMigrationFile, checkoutReservationMigration, text, "exact Academy v2 health authority");
forbidText(repurchaseMigrationFile, repurchaseMigration.toLowerCase(), "public.fdacs_", "regulated LMS schema separation");
forbidText(eventHardeningFile, eventHardening.toLowerCase(), "public.fdacs_", "regulated LMS schema separation");
forbidText(migrationFile, migration.toLowerCase(), "public.fdacs_", "regulated LMS schema separation");

for (const variable of [
  "OBSERRA_ACADEMY_SUPABASE_URL",
  "OBSERRA_ACADEMY_SUPABASE_SERVICE_ROLE_KEY",
  "OBSERRA_ACADEMY_EMAIL_HASH_SECRET",
]) {
  requireText(persistenceFile, persistence, variable, `dedicated server-only configuration ${variable}`);
}
requireText(persistenceFile, persistence, 'import "server-only"', "server-only persistence module");
requireText(persistenceFile, persistence, 'schemaVersion: "academy-durable-state-v2"', "exact Academy v2 runtime health contract");
requireText(persistenceFile, persistence, "academyCommerceStorageReady(value)", "exact v2 health predicate before provider use");
requireText(paymentFile, payment, 'health.schemaVersion === "academy-durable-state-v2"', "partial Academy schema rejection");
requireText(persistenceFile, persistence, "createHmac", "purchaser identity HMAC");
requireText(persistenceFile, persistence, "AbortSignal.timeout(10_000)", "bounded persistence request");
requireText(persistenceFile, persistence, 'redirect: "error"', "persistence redirect rejection");
forbidText(persistenceFile, persistence, "NEXT_PUBLIC_", "client-exposed Academy storage secret");
forbidText(persistenceFile, persistence, "supabase.co", "hard-coded Academy storage project");

requireText(academyFile, academy, "durableAcademyState", "durable learner-state primary read");
requireText(academyIdentityFile, academyIdentity, "safeSupabaseIdentity", "Supabase learner identity authority");
requireText(academyIdentityFile, academyIdentity, "academyIdentityRuntimeReady", "session-independent Supabase identity readiness");
requireText(legacyClerkFile, legacyClerk, "importLegacyAcademyState", "isolated one-time Clerk metadata migration");
forbidText(academyFile, academy, "@clerk/nextjs/server", "Clerk runtime dependency in canonical Academy domain service");
requireText(academyFile, academy, "durableCertificate", "durable certificate lookup");
requireText(academyFile, academy, "durableAcademyAggregateMetrics", "durable administrative metrics");
forbidText(academyFile, academy, "updateUserMetadata", "new Clerk private-metadata writes");

requireText(checkoutFile, checkout, "export async function POST(request: Request)", "POST-only payment initiation");
requireText(checkoutFile, checkout, "export async function GET()", "explicit checkout GET rejection");
requireText(checkoutFile, checkout, "isSameOrigin", "checkout same-origin enforcement");
requireText(checkoutFile, checkout, "isSupportedFormContentType", "checkout media-type enforcement");
requireText(checkoutFile, checkout, "academyStorageHealth", "pre-payment durable fulfillment health");
requireText(checkoutFile, checkout, "identity.configured", "pre-payment identity health");
requireText(checkoutFile, checkout, "academyCommerceWebhookConfigured", "centralized pre-payment signed webhook readiness");
requireText(checkoutFile, checkout, 'expand: ["product"]', "governed price expanded product preflight");
requireText(checkoutFile, checkout, "createAcademyCheckoutAfterGovernedPriceValidation", "governed price product identity preflight");
requireText(checkoutFile, checkout, "checkout.sessions.create", "real Stripe Checkout session creation");
requireText(checkoutFile, checkout, 'existingState?.access_status === "active"', "active-entitlement duplicate payment denial");
requireText(checkoutFile, checkout, "reserveAcademyCheckoutAttempt", "durable checkout reservation");
requireText(checkoutFile, checkout, "const canonicalAttempt =", "server-authoritative attempt identity");
requireText(checkoutFile, checkout, "academyCheckoutRequestFingerprint", "exact Checkout parameter fingerprint");
requireText(checkoutFile, checkout, "reservation.stripeSessionId", "recorded Checkout Session reuse");
requireText("app/academy/AcademyCheckoutForm.tsx", read("app/academy/AcademyCheckoutForm.tsx"), "navigator.locks.request", "first-use cross-tab browser identity serialization");
forbidText(checkoutFile, checkout, 'requestUrl.searchParams.get("course")', "GET payment mutation input");

requireText(webhookFile, webhook, "webhooks.constructEvent", "Stripe webhook signature verification");
requireText(webhookFile, webhook, 'session.payment_status === "paid"', "paid-event fulfillment boundary");
requireText(webhookFile, webhook, "recordPaidCheckout", "durable webhook event recording");
requireText(webhookFile, webhook, "event.id", "Stripe event idempotency authority");
requireText(webhookFile, webhook, "recordAcademyPaymentReversal", "durable refund and dispute processing");
requireText(webhookFile, webhook, 'throw new AcademyStripeVerificationError("paid-session-course-unavailable")', "unknown-course paid event retryable failure");
forbidText(webhookFile, webhook, "academyCourseAmountCents", "immutable paid-session fulfillment amount");
requireText(persistenceFile, persistence, '"academy_record_payment_reversal"', "payment reversal service RPC client");
requireText(redeemFile, redeem, "retrieveVerifiedAcademyPaidSession", "server-side canonical paid session revalidation");
forbidText(redeemFile, redeem, "academyCourseAmountCents", "immutable deferred-claim payment amount");
requireText(redeemFile, redeem, "authenticatedUserOwnsVerifiedPurchaserEmail", "verified purchaser identity claim");
requireText(redeemFile, redeem, "claimCourseAccess", "durable entitlement claim");
requireText(redeemFile, redeem, "courseVersion: validation.courseVersion", "immutable signed checkout claim version");

for (const [file, source] of [
  [paymentFile, payment], [academyStripeFile, academyStripe], [checkoutFile, checkout],
  [webhookFile, webhook], [redeemFile, redeem], [commerceHealthFile, commerceHealth],
]) {
  forbidText(file, source, "process.env.STRIPE_SECRET_KEY", "shared Stripe secret fallback in Academy commerce");
}
requireText(paymentFile, payment, "ACADEMY_STRIPE_SECRET_KEY", "dedicated Academy restricted Stripe key");
requireText(paymentFile, payment, "ACADEMY_STRIPE_WEBHOOK_SECRET", "dedicated Academy webhook secret");
requireText(academyStripeFile, academyStripe, "rk_live_", "production restricted Stripe key");
requireText(academyStripeFile, academyStripe, "rk_test_", "nonproduction restricted Stripe key");

requireText(requestFile, request, 'request.headers.get("origin")', "Academy mutation origin validation");
requireText(requestFile, request, 'contentType.startsWith("application/json")', "Academy mutation JSON-only boundary");
for (const [file, source] of [[assessmentFile, assessment], [progressFile, progress]]) {
  requireText(file, source, "validateAcademyJsonMutation", "same-origin mutation validation");
  requireText(file, source, '"cache-control": "private, no-store, max-age=0"', "learner response cache prohibition");
}

for (const text of [
  "accounts.retrieve(null)",
  "chargesEnabled",
  "academyStorageHealth",
  "academyPurchaserHashConfigured",
  "academyIdentityRuntimeReady",
  "academyIdentityEnvironment",
  "identityReady",
  'status: operational ? 200 : 503',
  'idempotencyKey: "stripe-event-id"',
  'auditLedger: "durable-supabase"',
]) {
  requireText(commerceHealthFile, commerceHealth, text, "live Academy commerce health contract");
}
forbidText(commerceHealthFile, commerceHealth, "safeIdentity", "session-level identity dependency in public Academy commerce health");
forbidText(commerceHealthFile, commerceHealth, "safeAcademyIdentity", "learner-session dependency in public Academy commerce health");
forbidText(commerceHealthFile, commerceHealth, "prepareClerkRuntime", "Clerk learner identity dependency in public Academy commerce health");

for (const text of [
  '.operational == true',
  '.providerVerification.environment == "live"',
  '.providerVerification.connected == true',
  '.providerVerification.chargesEnabled == true',
  '.identityEnvironment == "live"',
  '.durableStorage == "available"',
  '.storageSchema == "academy-durable-state-v2"',
  '.purchaserIdentityHashing == "available"',
]) {
  requireText(operationalWorkflowFile, operationalWorkflow, text, "production operational verification");
}
requireText(operationalWorkflowFile, operationalWorkflow, "Origin: https://invalid.example", "non-mutating checkout boundary probe");
forbidText(operationalWorkflowFile, operationalWorkflow, "checkout.sessions.create", "live payment creation in production gate");
forbidText(operationalWorkflowFile, operationalWorkflow, "sk_live_", "embedded live Stripe credential");
forbidText(websiteCiWorkflowFile, websiteCiWorkflow, "secrets.STRIPE_SECRET_KEY", "routine CI access to the Stripe API secret");
forbidText(websiteCiWorkflowFile, websiteCiWorkflow, "secrets.STRIPE_WEBHOOK_SECRET", "routine CI access to the Stripe webhook secret");

console.log(JSON.stringify({
  gate: "academy-durable-commerce-gate-35",
  durableTables: tables.length + 2,
  serviceOnlyRpcs: 13,
  productionTransactionsCreated: 0,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
