# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-12

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Website: https://www.obserrallc.com

## Purpose

This is the authoritative sanitized handoff for the **Florida FDACS Class D Security Officer School / regulated LMS build**.

This workstream is **separate from the Obserra EPI Academy commercial course-production build**. Do not mix this handoff with the Course 1, Course 2, Course 3, Course 4, Course 5, LearnWorlds SCORM, owner-video, or general Academy catalog production state except where shared website infrastructure is intentionally reused.

## Current repository implementation

Primary implementation branch:

`feature/florida-class-d-lms-foundation`

Primary pull request:

`PR #56 — Florida Class D LMS foundation and Coming Soon training tab`

Current public state:

`COMING SOON · LMS IN PROGRESS`

Paid enrollment, student course access, regulatory completion issuance, live examination access, and LIAS execution remain disabled.

## Regulatory-course architecture currently modeled

```text
Provider: Obserra Executive Protection & Intelligence LLC
Course: Florida Class D Security Officer Training
Instructional days: 5
Instructional hours: 40
Hours per day: 8
Required curriculum modules: 18
Certification examination: separately controlled from instructional hours
Exam questions: 170
Passing threshold metadata: 128 correct
Public approval claim: prohibited until applicable approval is established
```

## Gate 1 — Foundation controls

Status: `IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING`

Implemented controls include:

- dedicated Florida Training website navigation;
- premium Florida Class D Coming Soon / LMS In Progress page;
- payment and enrollment disabled;
- exact five-day / 40-hour / 18-module course structure modeled;
- learning check or applied assessment defined for every module;
- separate controlled examination metadata;
- licensure distinction language;
- no state-approval representation before applicable approval;
- planned identity, entitlement, attendance, instructional-time, remediation, examination, FDACS/LIAS, inspection, and quality-management lifecycle;
- fail-closed source gate wired into the Academy release-verification path.

Gate script:

`scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

Status: `IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING`

Source domain model:

`lib/florida-class-d-records.ts`

Gate script:

`scripts/florida-class-d-records-gate.mjs`

The model defines sanitized production contracts for student identity, identity verification, enrollment, cohort assignment, five-day attendance, instructional-time credit, 18-module progress, learning checks, remediation, append-only audit events, regulated role boundaries, and deterministic examination eligibility.

Exam eligibility remains blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 modules are complete, and no remediation remains open.

Students may not alter credited attendance, instructional time, or their own exam eligibility.

## Gate 3 — Durable Regulated Records & Administrative API

Status: `IMPLEMENTED IN SOURCE / DATABASE PROMOTION AND CI EVIDENCE PENDING`

### Production persistence architecture verified

Before building Gate 3, the current authorized Obserra backend was inspected directly. The active **Obserra Academy Supabase** production project already contains durable Academy enrollment, lesson-progress, assessment, certificate, owner-control, and production-event tables. Existing protected Academy tables have forced row-level security and are limited to service-role access after the database-lockdown migrations.

Decision: **reuse the existing authorized Supabase backend**. Do not introduce a separate database or duplicate persistence platform for the FDACS school build.

### Gate 3 implementation on the Florida LMS branch

```text
supabase/migrations/20260813033000_fdacs_class_d_regulated_records.sql
lib/florida-class-d-auth.ts
lib/florida-class-d-persistence.ts
app/api/florida-class-d/admin/attendance/route.ts
app/api/florida-class-d/admin/instruction-time/route.ts
app/api/florida-class-d/admin/inspection/route.ts
scripts/florida-class-d-persistence-gate.mjs
```

`package.json` now runs Gate 3 after Gates 1 and 2 inside `verify:academy-release`.

### Durable schema defined

The migration defines restricted tables for:

- cohorts;
- student identity state;
- regulated enrollments;
- attendance evidence;
- instructional-time evidence;
- module progress;
- learning-check results;
- remediation;
- inspection/legal/regulatory/administrative record holds;
- append-only audit events.

The schema intentionally excludes identity-document binaries, payment-card data, final examination answer keys, and FDACS/LIAS credentials.

### Gate 3 security architecture

- RLS enabled and forced on every FDACS regulated table.
- Direct table access revoked from `public`, `anon`, and `authenticated` roles.
- Service-role access is server-only.
- The service-role secret is never exposed through a `NEXT_PUBLIC` variable.
- Audit events reject update/delete operations.
- Clerk private metadata defines instructor, school-admin, and compliance-admin roles.
- Existing protected owner-email allowlist remains bootstrap school/compliance administration authority.
- Regulated APIs use private/no-store responses.
- Inspection export is limited to school-admin and compliance-admin roles.

### Atomic evidence and audit writes

Attendance and instructional-time writes use controlled database RPC contracts. Each regulated write carries an authenticated actor, actor role, enrollment ID, idempotency key, and correlation ID. The database function is designed to create the evidence record and its audit event in one transaction. Duplicate idempotency keys return the prior evidence record rather than creating a second one.

### Production promotion status

The Gate 3 migration is committed as controlled source but is **not represented as applied to production**. The current operations policy requires owner approval, rollback readiness, audit evidence, and direct runtime verification before production promotion.

The server-side persistence adapter also fails closed until a private `OBSERRA_SUPABASE_SERVICE_ROLE_KEY` or controlled equivalent is configured in the deployment environment.

No real learner data was created during Gate 3 source implementation.

## Separate FDACS school operations package already produced outside the public repository

The school-administration workstream includes controlled materials for student enrollment, identity verification, daily attendance/time sheets, instructor certification, make-up training, module learning checks, remediation, final-exam records, exam chain of custody, acknowledgments, evaluations, incidents, retention logs, instructor rosters, curriculum revision control, FDACS inspection binder, LIAS workflow, graduate licensing instructions, and quality/CAPA controls.

Protected operational documents, examination answers, learner records, private credentials, and regulated PII must not be committed to this public repository.

## Website / LMS target lifecycle

```text
Public Florida Training page
→ authenticated account
→ identity verification
→ enrollment acknowledgments
→ payment entitlement after launch authorization
→ cohort assignment
→ Day 1–5 sequential regulated instruction
→ attendance and instructional-time evidence
→ module learning checks
→ remediation where required
→ 40 instructional hours complete
→ controlled certification examination eligibility
→ pass/fail and retest workflow
→ instructor / school administrator review
→ FDACS/LIAS administrative reporting queue
→ completion-document workflow
→ student Florida Class D licensing instructions
→ inspection-ready retained record
```

## Next gate — Gate 4: Identity Verification & Regulated Enrollment Workflow

Planned next scope:

1. Controlled student pre-enrollment creation.
2. Legal-name and date-of-birth capture with data minimization.
3. Identity-verification status workflow without committing identity documents to the public repository.
4. Required student acknowledgments and policy acceptance.
5. Cohort assignment controls.
6. School-admin review and approval.
7. Enrollment state-transition rules.
8. Audit events for every identity/enrollment transition.
9. Synthetic test fixtures only.
10. Keep payment activation, instructional access, final exam, completion issuance, and LIAS execution disabled.

## Future gated sequence

```text
Gate 4 — Identity verification and regulated enrollment workflow
Gate 5 — Cohort scheduling, attendance, and instructional-time controls
Gate 6 — Module player, learning checks, and remediation engine
Gate 7 — Controlled 170-question certification examination engine
Gate 8 — Pass/fail, retest, instructor review, and completion workflow
Gate 9 — FDACS/LIAS administrative queue and inspection center
Gate 10 — Stripe purchase entitlement and launch activation controls
Gate 11 — End-to-end regulatory, security, accessibility, and owner acceptance
```

## Security and public-repository boundary

Never commit:

- real learner names, dates of birth, addresses, identity documents, or contact details;
- payment card data;
- FDACS/LIAS credentials, tokens, private screenshots, or session information;
- protected final examination questions or answer keys;
- private instructor credential documents;
- production secrets or private API credentials.

Public repository content is limited to sanitized source code, schemas, tests, policy gates, release evidence, and non-sensitive handoff documentation.

## Truth and release boundary

Do not claim that the Florida Class D LMS is FDACS approved, deployed, purchasable, open for student enrollment, capable of issuing regulatory completion, or accepted by FDACS merely because source code exists or a local/static gate passes.

Each capability requires its own implementation evidence, CI evidence, deployment evidence, and applicable regulatory authorization before activation or representation.

## Restart instruction for this workstream

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing any Florida Class D school/LMS work. Treat it as a separate regulated workstream from the Obserra EPI Academy commercial course build. Resume from the latest passed or implemented gate. Gate 3 durable-record and admin-API source exists but production database promotion remains pending. Continue with Gate 4 identity verification and regulated enrollment while keeping the public page Coming Soon and payment, learner access, examination, completion issuance, and LIAS execution disabled until their later validated gates.
```
