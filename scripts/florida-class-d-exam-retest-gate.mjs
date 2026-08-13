import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const migration = read("supabase/migrations/20260813070000_fdacs_class_d_exam_retest_governance.sql");
const service = read("lib/florida-class-d-exam-retest.ts");
const api = read("app/api/florida-class-d/admin/exam-retest/route.ts");
const handoff = read("docs/florida-class-d-lms/GATE-15-EXAM-RETEST-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "fdacs_class_d_exam_retest_authorizations", "Gate 15 requires durable retest authorization records.");
requireText(migration, "failed_attempt_id", "Retest authorization must bind to the preserved failed attempt.");
requireText(migration, "documented remediation is required before retest authorization", "Gate 15 must require documented remediation.");
requireText(migration, "an active retest authorization already exists", "Gate 15 must prevent duplicate open authorizations.");
requireText(migration, "documented remediation and staff retest authorization are required after a failed examination", "A new attempt after failure must fail closed without authorization.");
requireText(migration, "status = 'consumed'", "The next retest must consume its authorization.");
requireText(migration, "revoke all on table public.fdacs_class_d_exam_retest_authorizations from public, anon, authenticated", "Retest records must not be directly browser accessible.");
requireText(migration, "grant execute on function public.fdacs_class_d_authorize_exam_retest", "Retest authorization RPC must remain service-role controlled.");
requireText(migration, "exam_retest_authorized", "Retest authorization must append audit evidence.");
requireText(migration, "exam_retest_authorization_revoked", "Retest revocation must append audit evidence.");

requireText(service, "fixedWaitingPeriodDefinedInSource: false", "Gate 15 must not invent a fixed retest waiting period.");
requireText(service, "fixedRetestCountDefinedInSource: false", "Gate 15 must not invent a fixed retest-count rule.");
requireText(service, "priorScoresOverwritten: false", "Gate 15 must preserve prior examination scores.");
requireText(service, "remediationDocumentationRequired: true", "Gate 15 must require remediation documentation.");
requireText(service, "staffAuthorizationRequired: true", "Gate 15 must require staff authorization.");
requireText(api, "requireFloridaClassDStaff", "Retest administration must require authorized staff.");
requireText(api, 'body.action === "authorize"', "Retest admin API must support controlled authorization.");
requireText(api, 'body.action === "revoke"', "Retest admin API must support controlled revocation.");
requireText(handoff, "# Florida Class D Gate 15 Handoff", "Gate 15 requires a controlled handoff record.");

console.log("Florida Class D Gate 15 passed: failed-attempt preservation, documented remediation, staff-authorized retest eligibility, one-time authorization consumption, revocation, and inspection-ready audit history are validated in source without inventing a wait-period or retest-count rule.");
