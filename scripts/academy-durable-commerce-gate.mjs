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
const persistenceFile = "lib/academy-persistence.ts";
const academyFile = "lib/academy.ts";
const requestFile = "lib/academy-request.ts";
const checkoutFile = "app/api/academy/checkout/route.ts";
const webhookFile = "app/api/webhook/stripe/route.ts";
const redeemFile = "app/api/academy/redeem/route.ts";
const assessmentFile = "app/api/academy/assessment/route.ts";
const progressFile = "app/api/academy/progress/route.ts";
const commerceHealthFile = "app/api/academy/commerce-health/route.ts";
const operationalWorkflowFile = ".github/workflows/production-e2e-operational-gate.yml";

const migration = read(migrationFile);
const eventHardening = read(eventHardeningFile);
const persistence = read(persistenceFile);
const academy = read(academyFile);
const request = read(requestFile);
const checkout = read(checkoutFile);
const webhook = read(webhookFile);
const redeem = read(redeemFile);
const assessment = read(assessmentFile);
const progress = read(progressFile);
const commerceHealth = read(commerceHealthFile);
const operationalWorkflow = read(operationalWorkflowFile);

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
requireText(persistenceFile, persistence, "createHmac", "purchaser identity HMAC");
requireText(persistenceFile, persistence, "AbortSignal.timeout(10_000)", "bounded persistence request");
requireText(persistenceFile, persistence, 'redirect: "error"', "persistence redirect rejection");
forbidText(persistenceFile, persistence, "NEXT_PUBLIC_", "client-exposed Academy storage secret");
forbidText(persistenceFile, persistence, "supabase.co", "hard-coded Academy storage project");

requireText(academyFile, academy, "durableAcademyState", "durable learner-state primary read");
requireText(academyFile, academy, "importLegacyAcademyState", "one-time Clerk metadata migration");
requireText(academyFile, academy, "durableCertificate", "durable certificate lookup");
requireText(academyFile, academy, "durableAcademyAggregateMetrics", "durable administrative metrics");
forbidText(academyFile, academy, "updateUserMetadata", "new Clerk private-metadata writes");

requireText(checkoutFile, checkout, "export async function POST(request: Request)", "POST-only payment initiation");
requireText(checkoutFile, checkout, "export async function GET()", "explicit checkout GET rejection");
requireText(checkoutFile, checkout, "isSameOrigin", "checkout same-origin enforcement");
requireText(checkoutFile, checkout, "isSupportedFormContentType", "checkout media-type enforcement");
requireText(checkoutFile, checkout, "academyStorageHealth", "pre-payment durable fulfillment health");
requireText(checkoutFile, checkout, "identity.configured", "pre-payment identity health");
requireText(checkoutFile, checkout, "STRIPE_WEBHOOK_SECRET", "pre-payment signed webhook readiness");
requireText(checkoutFile, checkout, "checkout.sessions.create", "real Stripe Checkout session creation");
forbidText(checkoutFile, checkout, 'requestUrl.searchParams.get("course")', "GET payment mutation input");

requireText(webhookFile, webhook, "webhooks.constructEvent", "Stripe webhook signature verification");
requireText(webhookFile, webhook, 'session.payment_status === "paid"', "paid-event fulfillment boundary");
requireText(webhookFile, webhook, "recordPaidCheckout", "durable webhook event recording");
requireText(webhookFile, webhook, "event.id", "Stripe event idempotency authority");
requireText(redeemFile, redeem, "checkout.sessions.retrieve(sessionId)", "server-side paid session revalidation");
requireText(redeemFile, redeem, "authenticatedUserOwnsVerifiedPurchaserEmail", "verified purchaser identity claim");
requireText(redeemFile, redeem, "claimCourseAccess", "durable entitlement claim");

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
  "identity.configured",
  'status: operational ? 200 : 503',
  'idempotencyKey: "stripe-event-id"',
  'auditLedger: "durable-supabase"',
]) {
  requireText(commerceHealthFile, commerceHealth, text, "live Academy commerce health contract");
}

for (const text of [
  '.operational == true',
  '.providerVerification.environment == "live"',
  '.providerVerification.connected == true',
  '.providerVerification.chargesEnabled == true',
  '.identityEnvironment == "live"',
  '.durableStorage == "available"',
  '.storageSchema == "academy-durable-state-v1"',
  '.purchaserIdentityHashing == "available"',
]) {
  requireText(operationalWorkflowFile, operationalWorkflow, text, "production operational verification");
}
requireText(operationalWorkflowFile, operationalWorkflow, "Origin: https://invalid.example", "non-mutating checkout boundary probe");
forbidText(operationalWorkflowFile, operationalWorkflow, "checkout.sessions.create", "live payment creation in production gate");
forbidText(operationalWorkflowFile, operationalWorkflow, "sk_live_", "embedded live Stripe credential");

console.log(JSON.stringify({
  gate: "academy-durable-commerce-gate-35",
  durableTables: tables.length,
  serviceOnlyRpcs: 9,
  productionTransactionsCreated: 0,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
