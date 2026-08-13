# Obserra Florida Class D LMS Handoff

## Scope boundary

**Separate from Academy course-content build.**

This handoff governs the Florida Class D regulated-school LMS, student-record, attendance, examination-control, FDACS/LIAS workflow, inspection-readiness, and regulated operations work for **Obserra Executive Protection & Intelligence LLC**.

It is intentionally separate from the Obserra EPI Academy course-production / LearnWorlds handoff. Course manuscripts, generic Academy course creation, owner-produced media, and unrelated commercial course packages are not tracked here.

## LMS / Regulated School System Handoff

### Current branch

`feature/florida-class-d-lms-foundation`

### Pull request

PR #56 — Florida Class D LMS foundation and Coming Soon training tab

### Public release state

`COMING SOON · LMS IN PROGRESS`

- Public Florida Training navigation: implemented in source.
- Public preview page: implemented in source.
- Paid enrollment: disabled.
- Student access: disabled.
- FDACS-approved representation: prohibited until actual approval is established.
- Production deployment: not claimed by this handoff without CI/deployment evidence.

## Gate 1 — Foundation Controls

**Status: IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING**

Controls established:

- Canonical business identity is `Obserra Executive Protection & Intelligence LLC`.
- Course remains `coming-soon`.
- Enrollment and payment remain disabled.
- Five-day / 40-hour / eight-hour-per-day structure is fixed.
- Eighteen required modules are enumerated in controlled order.
- Module instructional hours total exactly 40.
- Every module has a learning check or applied assessment definition.
- Certification exam is represented as separately controlled from the 40 instructional hours.
- Exam metadata is 170 questions with 128 correct as the passing threshold.
- Course completion is explicitly distinguished from Florida Class D licensure.
- No state-approval claim may be shown before applicable approval exists.
- Planned lifecycle includes identity, entitlement, attendance/time evidence, remediation, exam control, retest, FDACS/LIAS queue, inspection records, and quality analytics.

Gate script: `scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

**Status: IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING**

Source model: `lib/florida-class-d-records.ts`

Gate script: `scripts/florida-class-d-records-gate.mjs`

The regulated record model defines:

- student identity record tied to Clerk user identity;
- identity verification state;
- controlled Class D enrollment record;
- cohort / class-session record;
- five-day attendance entries;
- credited instructional-time ledger;
- 18-module progress ledger;
- module learning-check attempts and scores;
- remediation assignment and completion records;
- append-only audit-event contract;
- explicit student, instructor, school-admin, compliance-admin, and system roles;
- deterministic exam-eligibility policy.

Exam eligibility remains blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 modules are complete, and no remediation remains open.

## Gate 3 — Durable Regulated Records & Administrative API

**Status: IMPLEMENTED IN SOURCE / DATABASE PROMOTION AND CI EVIDENCE PENDING**

### Persistence architecture verification

The current authorized website backend was directly inspected before implementation. The existing Obserra Academy Supabase project is active and already contains durable Academy enrollment, lesson-progress, assessment, certificate, owner-control, and production-ledger tables. Existing protected Academy tables use forced row-level security and service-role-only access after the emergency database lockdown. Gate 3 therefore reuses the authorized Supabase backend rather than introducing a parallel database platform.

### Gate 3 source artifacts

- Migration: `supabase/migrations/20260813033000_fdacs_class_d_regulated_records.sql`
- Staff authorization: `lib/florida-class-d-auth.ts`
- Server-only persistence adapter: `lib/florida-class-d-persistence.ts`
- Attendance API: `app/api/florida-class-d/admin/attendance/route.ts`
- Instructional-time API: `app/api/florida-class-d/admin/instruction-time/route.ts`
- Inspection export API: `app/api/florida-class-d/admin/inspection/route.ts`
- Gate script: `scripts/florida-class-d-persistence-gate.mjs`

### Durable record schema now defined

The migration defines restricted records for:

- cohorts;
- student identity state;
- regulated enrollments;
- attendance evidence entries;
- instructional-time entries;
- module progress;
- learning-check results;
- remediation;
- inspection/legal/regulatory/administrative record holds;
- append-only audit events.

No identity-document binaries, payment-card data, examination answer keys, or FDACS/LIAS credentials are part of the schema.

### Security controls

Gate 3 source requires:

- row-level security enabled and forced on every FDACS regulated table;
- direct table access revoked from `public`, `anon`, and `authenticated` roles;
- service-role access only from server-side code;
- no `NEXT_PUBLIC` service-role secret;
- append-only audit history with update/delete rejection trigger;
- restricted Clerk private-metadata staff roles for instructor, school-admin, and compliance-admin operations;
- existing protected owner-email allowlist as bootstrap school/compliance administration authority;
- private, no-store API responses;
- inspection exports limited to school-admin and compliance-admin roles.

### Atomic and idempotent evidence writes

Attendance and instructional-time evidence use database RPC functions designed to perform the regulated evidence write and corresponding audit-event insert in one database transaction. Each request carries:

- a unique idempotency key;
- an immutable correlation ID;
- authenticated actor ID;
- actor role;
- regulated enrollment reference.

Duplicate idempotency keys return the previously recorded entry rather than generating a second evidence record.

### Production promotion boundary

The migration is intentionally committed as source but has **not been applied to the production Supabase database by this gate**. The website operations policy requires owner approval, rollback readiness, direct runtime verification, and audit evidence for production promotion. The private server environment variable `OBSERRA_SUPABASE_SERVICE_ROLE_KEY` (or the controlled legacy server-only equivalent) must also be configured before the administrative APIs can operate. Without that secret, the persistence adapter fails closed with a service-unavailable response.

No real learner data has been created.

## Gate 3 fail-closed invariants

The Gate 3 source test must fail if:

- any regulated table loses forced RLS;
- direct `public`, `anon`, or `authenticated` access is introduced;
- the service-role secret is exposed through a `NEXT_PUBLIC` variable;
- audit update/delete protection is removed;
- attendance or instructional-time atomic RPCs are removed;
- idempotency keys or correlation IDs are removed;
- staff authorization is removed from regulated APIs;
- inspection export becomes available to students or unauthenticated users;
- the public course stops being `coming-soon` during this gate.

Gate 3 is wired into `verify:academy-release` after Gates 1 and 2.

## Next gate — Gate 4: Identity Verification & Regulated Enrollment Workflow

Planned next scope:

- controlled student pre-enrollment record creation;
- legal-name and date-of-birth data-entry workflow;
- identity-verification status workflow without storing identity-document binaries in the public codebase;
- required student acknowledgments and policy acceptance;
- cohort assignment controls;
- school-admin review and approval;
- enrollment status transition rules;
- audit events for every identity/enrollment transition;
- synthetic fixtures only;
- no payment activation yet;
- no student instructional access yet;
- no final examination access yet.

## Security and repository boundary

The repository is public. Never commit:

- real student names, dates of birth, IDs, addresses, contact details, payment information, or identity documents;
- examination answer keys or protected exam material;
- authenticated FDACS/LIAS screenshots, credentials, tokens, or session data;
- private instructor credential files;
- production secrets or private API credentials.

Source code, sanitized schemas, tests, policy gates, and non-sensitive operational documentation may be committed.

## Release discipline

Do not enable public checkout, enrollment, student course access, examination access, certificate/completion issuance, or automated LIAS submission merely because a source gate passes. Each capability must have its own validated gate and applicable regulatory approval evidence before activation.
