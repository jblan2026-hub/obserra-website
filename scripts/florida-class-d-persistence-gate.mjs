import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationPath = path.join(root, "supabase", "migrations", "20260813033000_fdacs_class_d_regulated_records.sql");
const authPath = path.join(root, "lib", "florida-class-d-auth.ts");
const persistencePath = path.join(root, "lib", "florida-class-d-persistence.ts");
const attendancePath = path.join(root, "app", "api", "florida-class-d", "admin", "attendance", "route.ts");
const instructionPath = path.join(root, "app", "api", "florida-class-d", "admin", "instruction-time", "route.ts");
const inspectionPath = path.join(root, "app", "api", "florida-class-d", "admin", "inspection", "route.ts");
const coursePath = path.join(root, "lib", "florida-class-d.ts");
const handoffPath = path.join(root, "docs", "florida-class-d-lms", "HANDOFF.md");

for (const file of [migrationPath, authPath, persistencePath, attendancePath, instructionPath, inspectionPath, coursePath, handoffPath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing Gate 3 artifact: ${path.relative(root, file)}`);
}

const migration = fs.readFileSync(migrationPath, "utf8");
const auth = fs.readFileSync(authPath, "utf8");
const persistence = fs.readFileSync(persistencePath, "utf8");
const attendance = fs.readFileSync(attendancePath, "utf8");
const instruction = fs.readFileSync(instructionPath, "utf8");
const inspection = fs.readFileSync(inspectionPath, "utf8");
const course = fs.readFileSync(coursePath, "utf8");
const handoff = fs.readFileSync(handoffPath, "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const table of [
  "fdacs_class_d_cohorts",
  "fdacs_class_d_student_identities",
  "fdacs_class_d_enrollments",
  "fdacs_class_d_attendance_entries",
  "fdacs_class_d_instruction_time_entries",
  "fdacs_class_d_module_progress",
  "fdacs_class_d_learning_check_results",
  "fdacs_class_d_remediation_records",
  "fdacs_class_d_record_holds",
  "fdacs_class_d_audit_events",
]) {
  requireText(migration, `public.${table}`, `Gate 3 migration is missing ${table}.`);
  requireText(migration, `alter table public.${table} enable row level security`, `${table} must enable RLS.`);
  requireText(migration, `alter table public.${table} force row level security`, `${table} must force RLS.`);
  requireText(migration, `revoke all on table public.${table} from public, anon, authenticated`, `${table} must deny direct public/anon/authenticated table access.`);
}

requireText(migration, "fdacs_class_d_reject_audit_mutation", "Audit-mutation rejection trigger is required.");
requireText(migration, "before update or delete on public.fdacs_class_d_audit_events", "Audit ledger must reject update and delete operations.");
requireText(migration, "idempotency_key text not null unique", "Regulated attendance/time/check writes must have unique idempotency keys.");
requireText(migration, "security definer", "Atomic regulated write RPCs must execute in a controlled server-side transaction boundary.");
requireText(migration, "fdacs_class_d_record_attendance", "Atomic attendance RPC is required.");
requireText(migration, "fdacs_class_d_record_instruction_time", "Atomic instructional-time RPC is required.");
requireText(migration, "grant execute on function public.fdacs_class_d_record_attendance", "Attendance RPC must be granted only through the service role boundary.");
requireText(migration, "grant execute on function public.fdacs_class_d_record_instruction_time", "Instruction-time RPC must be granted only through the service role boundary.");

requireText(auth, 'import "server-only"', "FDACS staff authorization must remain server-only.");
requireText(auth, "privateMetadata.fdacsClassD", "Dedicated private-metadata staff roles are required.");
requireText(auth, "ownerEmailAllowed", "Existing protected owner identity must remain a bootstrap admin authority.");
requireText(auth, "school_admin", "School-admin role boundary is required.");
requireText(auth, "compliance_admin", "Compliance-admin role boundary is required.");
requireText(auth, "instructor", "Instructor role boundary is required.");

requireText(persistence, 'import "server-only"', "FDACS persistence adapter must remain server-only.");
requireText(persistence, "OBSERRA_SUPABASE_SERVICE_ROLE_KEY", "Service-role persistence must use a private server environment variable.");
if (persistence.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")) {
  throw new Error("Service-role persistence key must never be exposed through NEXT_PUBLIC variables.");
}
requireText(persistence, "rpc/fdacs_class_d_record_attendance", "Attendance writes must use the atomic database RPC.");
requireText(persistence, "rpc/fdacs_class_d_record_instruction_time", "Instruction-time writes must use the atomic database RPC.");
requireText(persistence, "getFloridaClassDInspectionRecord", "Gate 3 requires an inspection-record export boundary.");
requireText(persistence, 'cache: "no-store"', "Regulated persistence requests must not be cached.");

for (const [source, label] of [[attendance, "attendance"], [instruction, "instruction-time"], [inspection, "inspection"]]) {
  requireText(source, "requireFloridaClassDStaff", `${label} API must enforce server-side staff authorization.`);
  requireText(source, '"cache-control": "private, no-store', `${label} API responses must be private and no-store.`);
}

requireText(attendance, "idempotencyKey", "Attendance API must require an idempotency key.");
requireText(attendance, "correlationId", "Attendance API must carry a correlation id.");
requireText(instruction, "idempotencyKey", "Instruction-time API must require an idempotency key.");
requireText(instruction, "correlationId", "Instruction-time API must carry a correlation id.");
requireText(inspection, '["school_admin", "compliance_admin"]', "Inspection export must be restricted to school/compliance administration.");

requireText(course, 'status: "coming-soon"', "Gate 3 must not open the public regulated course.");
requireText(handoff, "## Gate 3 — Durable Regulated Records and Administrative APIs", "Separate Florida LMS handoff must record Gate 3.");
requireText(handoff, "It is separate from the commercial Obserra Academy", "FDACS LMS handoff must remain separate from commercial course production.");

console.log("Florida Class D Gate 3 passed: durable-record schema, staff authorization, atomic write contracts, and inspection API boundaries validated in source.");
