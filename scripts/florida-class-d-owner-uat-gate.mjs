import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const files = {
  policy: "lib/florida-class-d-owner-uat.ts",
  auth: "lib/florida-class-d-auth.ts",
  activation: "lib/florida-class-d-production-activation.ts",
  persistence: "lib/florida-class-d-persistence.ts",
  identity: "lib/florida-class-d-identity-verification.ts",
  media: "lib/florida-class-d-media.ts",
  readiness: "lib/florida-class-d-provider-readiness.ts",
  scheduling: "lib/florida-class-d-scheduling.ts",
  instructorProvisioning: "lib/florida-class-d-instructor-provisioning.ts",
  livePersistence: "lib/florida-class-d-live-persistence.ts",
  enrollmentApi: "app/api/florida-class-d/enrollment/route.ts",
  enrollmentAdminApi: "app/api/florida-class-d/admin/enrollments/route.ts",
  scheduleApi: "app/api/florida-class-d/admin/schedule/route.ts",
  instructorApi: "app/api/florida-class-d/admin/instructor-file/route.ts",
  identityAdminApi: "app/api/florida-class-d/admin/identity/route.ts",
  liveApi: "app/api/florida-class-d/admin/live/route.ts",
  enrollmentUi: "app/florida-security-training/enroll/EnrollmentClient.tsx",
  enrollmentActivationUi: "app/florida-security-training/admin/enrollments/EnrollmentActivationConsole.tsx",
  providerReadinessUi: "app/florida-security-training/admin/runtime-readiness/ProviderReadinessPanel.tsx",
  accessUi: "app/florida-security-training/access/page.tsx",
  scheduleUi: "app/florida-security-training/admin/schedule/ScheduleManager.tsx",
  identityUi: "app/florida-security-training/identity/IdentityVerificationClient.tsx",
  identityVideoApi: "app/api/florida-class-d/identity-video/route.ts",
  identityAttendanceMigration: "supabase/migrations/20260814172000_fdacs_class_d_instructor_identity_attendance.sql",
  migration: "supabase/migrations/20260814210337_fdacs_class_d_owner_real_identity_uat.sql",
  instructionSafety: "supabase/migrations/20260814213309_fdacs_class_d_owner_uat_instruction_safety.sql",
  liveExecution: "supabase/migrations/20260814215217_fdacs_class_d_owner_uat_live_execution_and_instructor_provisioning.sql",
  identityLobbyAssignment: "supabase/migrations/20260815160000_fdacs_class_d_identity_video_lobby_assignment.sql",
  environment: ".env.example",
};

for (const relativePath of Object.values(files)) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Gate 38 failed: missing ${relativePath}.`);
  }
}

const source = Object.fromEntries(Object.entries(files).map(([key, relativePath]) => [key, read(relativePath)]));
const requireText = (key, value, message) => {
  if (!source[key].includes(value)) throw new Error(`Gate 38 failed: ${message}`);
};

for (const marker of [
  "preview_environment",
  "owner_allowlist",
  "release_binding",
  "authorization_expiry",
  "authorization_evidence",
  "stripe_identity_live",
  "fdacs_database",
  "record_encryption",
  "daily_media",
]) {
  requireText("policy", marker, `owner-UAT policy is missing ${marker}`);
}

for (const marker of [
  "fdacs_class_d_start_live_session",
  "only the assigned Class DI instructor may start an owner UAT lesson",
  "fdacs_class_d_archive_and_register_instructor_file",
  "fdacs_class_d_owner_uat_instructor_readiness",
  "regulated_personnel_pii",
  "verified_active",
  "license_expires_on is not null",
  "set search_path = ''",
  "from public,anon,authenticated,service_role",
  "to service_role",
]) {
  requireText("liveExecution", marker, `owner-UAT live execution migration is missing ${marker}`);
}
requireText("policy", "maximumAuthorizationDays: 14", "authorization must expire within fourteen days");
requireText("policy", "trainingCreditEligible: false", "owner UAT must be non-credit");
requireText("policy", "completionAndLiasProhibited: true", "completion and LIAS must be prohibited");
requireText("policy", "floridaClassDOwnerUatProfileRequested", "partial owner-UAT configuration must still select the restricted profile");
requireText("auth", "floridaClassDOwnerUatProfileRequested", "owner-only authorization must apply before all provider checks are ready");
requireText("auth", "ownerEmailAllowed", "the existing protected owner allowlist must be enforced");
requireText("auth", "requireFloridaClassDAuthenticatedSession", "staff authentication must remain available to the distinct assigned DI instructor");
if (source.auth.includes("const { userId, sessionId } = await requireFloridaClassDSignedInUser();")) {
  throw new Error("Gate 38 failed: the owner-only learner guard must not block distinct authorized staff.");
}
requireText("activation", "floridaClassDOwnerUatExecutionAuthorized", "regulated execution must recognize the distinct owner-UAT profile");
requireText("activation", "ownerRealIdentityUatCannotAuthorizeProduction: true", "owner UAT must not authorize production");

for (const marker of [
  "execution_profile",
  "training_credit_eligible",
  "uat_expires_at",
  "release_commit_sha",
  "authorization_evidence_sha256",
  "fdacs_class_d_create_owner_uat_cohort",
  "fdacs_class_d_activate_owner_uat_enrollment",
  "fdacs_class_d_completion_noncredit_guard",
  "fdacs_class_d_lias_noncredit_guard",
  "fdacs_class_d_reject_student_self_attestation",
  "2026-08-13-v2",
]) {
  requireText("migration", marker, `database migration is missing ${marker}`);
}
requireText("migration", "interval '14 days'", "database UAT authorization must enforce the same fourteen-day maximum");
requireText("migration", "production_runtime_authorized = true", "database UAT paths must explicitly reject active production authorization");
requireText("migration", "trainingCreditEligible',false", "database audit metadata must preserve the non-credit disposition");
requireText("migration", "from public,anon,authenticated,service_role", "legacy or trigger-only privileged functions must be explicitly revoked");
requireText("migration", "to service_role", "new transactional RPCs must be service-role only");
requireText("migration", "set search_path = ''", "new privileged functions must use an empty search path");

for (const marker of [
  "fdacs_class_d_publish_owner_uat_schedule",
  "owner_uat_noncredit",
  "school_license_number is null",
  "verified active Class DI instructor record",
  "instructor_clerk_user_ids",
  "all owner UAT live lessons must end before the UAT authorization expires",
  "production_runtime_authorized = true",
  "set search_path = ''",
  "from public,anon,authenticated,service_role",
  "to service_role",
]) {
  requireText("instructionSafety", marker, `owner-UAT instruction safety migration is missing ${marker}`);
}

requireText("persistence", "p_authorization_evidence_sha256", "pre-enrollment must bind the authorization evidence digest");
requireText("persistence", "fdacs_class_d_activate_owner_uat_enrollment", "the server adapter must expose the controlled non-credit activation RPC");
requireText("enrollmentApi", "floridaClassDOwnerUatProfileRequested", "blocked owner UAT must not be mislabeled as production");
requireText("enrollmentApi", "floridaClassDOwnerUatEvidenceSha256", "pre-enrollment must send the controlled evidence digest");
requireText("identity", "require_matching_selfie: true", "Stripe Identity must require a matching selfie");
requireText("identity", "owner_uat_noncredit", "live Identity sessions must be labeled with the non-credit profile");
requireText("identity", "fdacs_enrollment_id", "Stripe metadata must use an opaque enrollment reference rather than learner PII");
requireText("identityVideoApi", "requireFloridaClassDSignedInUser", "the protected identity video lobby must require an authenticated learner");
requireText("identityVideoApi", "getFloridaClassDIdentityLobbyMediaAccess", "the identity video lobby must use the controlled media broker");
requireText("identityAdminApi", "const attestedAt = new Date().toISOString();", "identity and attendance evidence timestamps must be assigned by the authenticated server route");
if (source.identityAdminApi.includes("body.attestedAt")) {
  throw new Error("Gate 38 failed: identity and attendance evidence must not trust a browser-supplied attestation timestamp.");
}
requireText("media", '"/rooms?limit=1"', "Daily readiness must authenticate without creating a room or token");
requireText("media", "identity_lobby_noninstructional", "identity video access must be explicitly non-instructional");
requireText("media", "tokenExpiresInSeconds = 30 * 60", "identity video access must use a short-lived scoped token");
requireText("media", "instructionalTimeCredited: false", "identity video access must never credit instructional time");
requireText("media", "attendanceCredited: false", "identity video access must never credit attendance");
requireText("media", "rawIdentityImagesStoredByLms: false", "identity video access must not copy raw ID images into the LMS");
requireText("media", "FDACS_IDENTITY_LOBBY_PROVIDER_EVIDENCE_REQUIRED", "the lobby must require verified hosted ID and matching-selfie evidence");
requireText("media", "FDACS_IDENTITY_LOBBY_ASSIGNED_SESSION_REQUIRED", "the lobby must require an exact assigned cohort session");
requireText("identityLobbyAssignment", "fdacs_class_d_identity_attestation_assignment_guard", "durable identity evidence must have an assigned-DI database guard");
requireText("identityLobbyAssignment", "s.instructor_clerk_user_id = new.instructor_clerk_user_id", "the database guard must bind the attesting DI to the assigned session");
requireText("identityLobbyAssignment", "does not store an ID image, grant attendance, credit instructional time, or authorize production", "the migration must preserve the identity-lobby claim boundary");
requireText("identityAttendanceMigration", "'studentLegalName',i.legal_name", "the assigned DI review context must expose the learner's full legal name from the protected record");
requireText("identityAttendanceMigration", "identity_images_copied_to_lms boolean not null default false", "the LMS must enforce that provider identity images are not copied into its database");
requireText("identityAttendanceMigration", "biometric_template_stored_by_lms boolean not null default false", "the LMS must enforce that biometric templates are not stored");
requireText("readiness", "fdacs_class_d_boundary_health", "provider readiness must verify the isolated database boundary");
requireText("readiness", "verificationSessions.list({ limit: 1 })", "provider readiness must authenticate Stripe Identity read-only");
requireText("readiness", "sk_live_", "provider readiness must independently require live Stripe Identity mode");
requireText("readiness", "webhookEndpoints.list({ limit: 100", "provider readiness must enumerate Stripe webhook configuration read-only");
requireText("readiness", "candidate.url === expectedUrl", "provider readiness must bind Stripe Identity callbacks to the exact Preview endpoint");
requireText("readiness", 'candidate.status === "enabled"', "provider readiness must reject disabled Stripe Identity callbacks");
requireText("readiness", 'candidate.livemode === true', "provider readiness must reject test-mode Stripe Identity callbacks");
for (const event of [
  "identity.verification_session.processing",
  "identity.verification_session.requires_input",
  "identity.verification_session.verified",
  "identity.verification_session.canceled",
  "identity.verification_session.redacted",
]) {
  requireText("readiness", event, `provider readiness must require the handled Stripe event ${event}`);
}
requireText("readiness", "getFloridaClassDOwnerUatInstructorReadiness", "provider readiness must require verified-active Class DI coverage");
requireText("providerReadinessUi", "Run read-only provider preflight", "live provider readiness must be operable from the protected administrator UI");
requireText("enrollmentApi", "getFloridaClassDProviderReadiness", "live providers must pass before owner learner PII is stored");
requireText("scheduling", "fdacs_class_d_publish_owner_uat_schedule", "owner UAT must have a real non-credit scheduling path");
requireText("scheduling", "prepareFloridaClassDOwnerUatCohort", "owner UAT cohort creation must be operable through the protected scheduler");
requireText("instructorProvisioning", 'createCipheriv("aes-256-gcm"', "instructor evidence must be encrypted before database transmission");
requireText("instructorProvisioning", "fdacs_class_d_archive_and_register_instructor_file", "instructor evidence and the verified-active file must be registered atomically");
requireText("instructorApi", "verificationAttestation", "real instructor provisioning must require an explicit administrator attestation");
requireText("instructorApi", "ensureFloridaClassDInstructorRole", "successful evidence registration must activate the distinct Clerk instructor role");
requireText("livePersistence", "assertFloridaClassDLiveSessionInstructor", "owner-UAT instructor controls must be assigned-instructor scoped");
requireText("livePersistence", "assertFloridaClassDLiveActionScope", "lesson resources must be bound to the selected live session");
requireText("livePersistence", "listFloridaClassDStudentLiveSessions", "the activated student must receive release-bound live-session links");
requireText("liveApi", "FDACS_OWNER_UAT_EXACT_SCHEDULER_REQUIRED", "the generic scheduler must not bypass exact-release owner-UAT scheduling");
requireText("enrollmentAdminApi", "activate_owner_uat", "owner UAT activation must have a protected administrator endpoint");
requireText("enrollmentActivationUi", "Activate exact-release owner UAT", "owner UAT activation must be operable through the protected administrator UI");
requireText("accessUi", "Assigned live lessons", "the activated student must have an operational live-lesson list");
requireText("scheduleApi", "prepare_owner_uat", "the scheduler must expose protected exact-release cohort preparation");
requireText("scheduleUi", "Instructor console", "generated owner-UAT sessions must expose the protected instructor console link");
requireText("scheduleUi", "Prepare exact-release owner UAT cohort", "the administrator must not need to invent an owner-UAT cohort identifier");
requireText("environment", "OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64", "the protected envelope-key setting must be documented");
requireText("environment", "OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_REFERENCE", "the external key reference setting must be documented");
requireText("enrollmentUi", "cannot produce completion or LIAS records", "learner UI must disclose the non-credit boundary");
requireText("identityUi", "government ID and selfie are processed by Stripe", "learner UI must disclose hosted identity processing");
requireText("identityUi", "assigned-instructor video verification pending", "learner UI must expose the assigned-DI video step");
requireText("identityUi", "This lobby records no instructional time or attendance credit", "learner UI must disclose the non-instructional lobby boundary");

const combined = Object.values(source).join("\n");
if (/NEXT_PUBLIC_(?:OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY|OBSERRA_FDACS_DAILY_API_KEY|OBSERRA_FDACS_RECORD_ENCRYPTION_KEY_BASE64|STRIPE_SECRET_KEY|STRIPE_IDENTITY_WEBHOOK_SECRET)/.test(combined)) {
  throw new Error("Gate 38 failed: a protected FDACS provider credential was assigned a NEXT_PUBLIC_ name.");
}

console.log("Florida Class D Gate 38 passed: the exact-release owner-only real-identity UAT profile is Preview-only, expiring, provider-backed, assigned-DI scoped, encrypted before instructor-evidence persistence, database-enforced as non-credit, completion/LIAS blocked, and unable to authorize production.");
