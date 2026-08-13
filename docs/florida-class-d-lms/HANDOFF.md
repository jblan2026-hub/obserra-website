# Obserra Florida Class D LMS Handoff

## Scope boundary

**Separate from Academy course-content build.**

This handoff governs the Florida Class D regulated-school LMS, student records, live instruction, attendance, time evidence, assessment controls, FDACS/LIAS workflow, inspection readiness, and regulated operations work for **Obserra Executive Protection & Intelligence LLC**.

It is intentionally separate from the Obserra EPI Academy commercial course-production and LearnWorlds handoffs. Generic Academy course manuscripts, SCORM packages, owner-produced media for nonregulated Academy courses, and unrelated commercial catalog work are not tracked here.

## LMS / Regulated School System Handoff

### Current branch

`feature/florida-class-d-lms-foundation`

### Pull request

PR #56 — Florida Class D LMS foundation and Coming Soon training tab

### Regulatory launch status

- Owner reports an active Florida Class DI instructor license.
- Class DS school application is pending.
- DI and future DS license numbers must be provided to the runtime as protected server-side configuration and are not committed to the public repository.
- Live instruction is explicitly fail-closed until `OBSERRA_FDACS_DS_LICENSE_STATUS=active`, a DS license number is configured, a DI license number is configured, and the separate live feature gate is enabled.
- Public paid enrollment and regulatory completion issuance remain disabled.

### Public release state

`COMING SOON · LMS IN PROGRESS`

- Public Florida Training navigation: implemented in source.
- Public preview page: implemented in source.
- Paid enrollment: disabled.
- Student regulated course access: disabled.
- Live regulated instruction: disabled pending DS activation and later production gates.
- FDACS-approved representation: prohibited until actual approval is established.
- Production deployment is never inferred merely because source, CI, or preview deployment exists.

## Controlled course architecture

The current source preserves:

- 5 instructional days;
- 40 credited instructional hours;
- 480 instructional minutes each day;
- 18 required curriculum areas with hours totaling exactly 40;
- 4 live instructional lessons per day;
- 120 instructional minutes per live lesson;
- 15-minute scheduled break after Lessons 1, 2, and 3 each day;
- 45 tracked break minutes per day;
- break time recorded separately and never credited toward the 40 instructional hours;
- separately controlled 170-question certification examination with 128 correct as the stored passing threshold metadata.

The fourth lesson ends the instructional day, so no post-day break is scheduled after Lesson 4.

## Gate 1 — Foundation Controls

**Status: IMPLEMENTED IN SOURCE / DEDICATED CI WIRED**

Controls established:

- Canonical business identity is `Obserra Executive Protection & Intelligence LLC`.
- Course remains `coming-soon`.
- Enrollment and payment remain disabled.
- Five-day and 40-hour instructional structure is fixed.
- Eighteen required curriculum areas are enumerated in controlled order.
- Curriculum-area hours total exactly 40.
- Every curriculum area has a learning check or applied assessment definition.
- Certification exam is represented as separately controlled from instructional hours.
- Course completion is explicitly distinguished from Florida Class D licensure.
- No state-approval claim may be shown before applicable approval exists.

Gate script: `scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

**Status: IMPLEMENTED IN SOURCE / DEDICATED CI WIRED**

Source model: `lib/florida-class-d-records.ts`

Gate script: `scripts/florida-class-d-records-gate.mjs`

The regulated record model defines:

- student identity tied to Clerk authenticated identity;
- identity verification state;
- controlled Class D enrollment;
- cohort/class-session assignment;
- five-day attendance evidence;
- credited instructional-time ledger;
- 18-area progress ledger;
- learning-check attempts and scores;
- remediation records;
- live-session records;
- device leases;
- presence challenges;
- separate instructional, break, connected, and uncredited time evidence;
- live student/instructor interactions;
- append-only audit-event contracts;
- explicit student, instructor, school-admin, compliance-admin, and system roles;
- deterministic exam-eligibility policy.

Exam eligibility remains blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 curriculum areas are complete, and no remediation remains open.

## Gate 3 — Durable Regulated Records & Administrative API

**Status: IMPLEMENTED IN SOURCE / DATABASE PROMOTION PENDING**

### Persistence architecture

The existing authorized Obserra Supabase backend is used rather than introducing a parallel database platform.

### Gate 3 artifacts

- `supabase/migrations/20260813033000_fdacs_class_d_regulated_records.sql`
- `lib/florida-class-d-auth.ts`
- `lib/florida-class-d-persistence.ts`
- `app/api/florida-class-d/admin/attendance/route.ts`
- `app/api/florida-class-d/admin/instruction-time/route.ts`
- `app/api/florida-class-d/admin/inspection/route.ts`
- `scripts/florida-class-d-persistence-gate.mjs`

### Security controls

Gate 3 requires:

- forced row-level security on regulated tables;
- direct browser-role access revoked;
- private server-only service-role access;
- append-only audit history;
- Clerk private-metadata staff roles;
- protected owner allowlist as bootstrap school/compliance authority;
- private no-store APIs;
- inspection exports restricted to school/compliance administrators;
- idempotency and immutable correlation IDs for attendance and instructional-time evidence.

The migrations remain source artifacts until a separate production database promotion is approved and verified.

## Gate 4 — Identity Verification & Regulated Enrollment

**Status: IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

### Gate 4 artifacts

- `supabase/migrations/20260813040000_fdacs_class_d_enrollment_workflow.sql`
- `lib/florida-class-d-enrollment-policy.ts`
- `app/api/florida-class-d/enrollment/route.ts`
- `app/api/florida-class-d/admin/enrollments/route.ts`
- `app/api/florida-class-d/admin/identity/route.ts`

### Implemented controls

- controlled learner pre-enrollment;
- legal-name and date-of-birth capture;
- identity-verification status workflow;
- versioned required acknowledgments;
- cohort assignment controls;
- school/compliance review before enrollment advances;
- audit events for identity and enrollment transitions;
- verified identity required before approval;
- all required acknowledgments required before approval;
- payment entitlement is still a later gate;
- instructional access and exam access remain disabled.

No identity-document binaries are stored by this source implementation.

## Gate 5 — Live Instructor Classroom, Presence & Interaction

**Status: IMPLEMENTED IN SOURCE / CI AND PRODUCTION PROMOTION PENDING**

### Purpose

Gate 5 establishes the regulated live-class control plane so the DI instructor can teach in real time while the LMS records attendance, presence evidence, student interaction, instructional time, break time, and exceptions.

### Gate 5 artifacts

- `lib/florida-class-d-live-policy.ts`
- `lib/florida-class-d-live-persistence.ts`
- `lib/florida-class-d-live-feed.ts`
- `supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql`
- `app/api/florida-class-d/live/route.ts`
- `app/api/florida-class-d/admin/live/route.ts`
- `app/florida-security-training/live/[liveSessionId]/page.tsx`
- `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`
- `app/florida-security-training/admin/live/[liveSessionId]/page.tsx`
- `app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx`
- `app/florida-security-training/live-classroom.css`
- `scripts/florida-class-d-live-gate.mjs`

### Live-instruction controls

The source now models and enforces:

- a live DI instructor-operated classroom;
- Florida physical-location policy metadata for live instruction;
- DI and DS license-number capture at the live-session layer;
- fail-closed live activation while the DS license remains pending;
- one active learner device lease per regulated enrollment;
- authenticated Clerk session binding plus per-browser instance identifier;
- presence heartbeat every 60 seconds;
- stale-device recovery after a controlled 150-second threshold;
- server-side instructional-time tracking;
- server-side break-time tracking;
- total-connected and uncredited-connected time tracking;
- explicit instruction versus break segments controlled by the instructor;
- 15-minute breaks after the first three two-hour lessons each day;
- security challenges issued before the two-hour maximum interval;
- five-minute retry opportunity after a failed security challenge;
- second challenge failure marks the learner absent in the live-presence record and stops further instructional credit until review;
- documented instructor review path for presence restoration;
- daily attendance still requires instructor verification;
- student questions to the instructor;
- instructor answers;
- hand raise;
- instructor prompts and participation records;
- poll-response data contract;
- append-only live-interaction history;
- minimum text-screen timing policy of one minute per 50 words with proration helper;
- inspection/access-reference field on the live-session record.

### Instructor console

The instructor console currently provides controls to:

- start the live lesson;
- issue a classwide presence code;
- automatically issue an opening presence check;
- automatically issue another security check at approximately 105 instructional minutes, before the two-hour limit;
- start the scheduled 15-minute break;
- resume instruction;
- end the lesson;
- view each student’s connected time, instructional-presence time, break time, uncredited time, and presence state;
- review a security-challenge absence with a documented note;
- send class prompts;
- receive student questions;
- answer individual student questions.

### Student live classroom

The student live classroom currently provides:

- authenticated live-session entry;
- single-device lease acquisition;
- continuous server-side heartbeat;
- visible live instruction/break state;
- visible connected, instructional, break, and uncredited time counters;
- presence-challenge response form;
- live Q&A feed;
- question submission;
- hand raise;
- interaction logging.

### Important live-media boundary

**The regulated attendance, presence, time, Q&A, instructor-control, and audit control plane is implemented in source, but the actual embedded live video/audio transport is not yet selected or configured.**

The student and instructor pages deliberately contain a media surface placeholder. The next live subgate must integrate an approved real-time media provider while preserving:

- instructor and student real-time interaction;
- secure authenticated access;
- one-device policy;
- FDACS investigator real-time access capability;
- auditability;
- accessibility;
- desktop/mobile operation;
- no weakening of the independent Obserra attendance and time evidence system.

A third-party meeting attendance report alone must never replace Obserra’s controlled attendance/time ledger.

## Dedicated CI

Workflow: `.github/workflows/florida-class-d-lms-gates.yml`

The dedicated Florida workflow runs:

- Gates 1 through 5 source verification;
- repository contract tests;
- lint;
- production Next.js build.

`npm run verify:florida-class-d` includes the live-instruction source gate. This independent workflow prevents unrelated commercial Academy catalog assertions from being mistaken for Florida regulated-LMS acceptance.

## Next controlled sequence

1. Validate the new Gate 5 CI run and fix any source/build failures.
2. Select and integrate the secure live video/audio provider.
3. Implement FDACS investigator live-access procedure and technical access path.
4. Complete structured instructor polls and participation analytics.
5. Add cohort scheduling and automatic creation of the 20 live lesson sessions.
6. Add daily instructor attendance certification and reconciliation from live evidence into the formal attendance ledger.
7. Add make-up-session workflow for permitted missed online instruction.
8. Add lesson-screen timing enforcement for text-based instructional screens.
9. Promote regulated migrations to production only through an approved database change gate with rollback and verification evidence.
10. Keep public enrollment, payment, instructional access, exam access, completion issuance, and LIAS execution disabled until their separate launch gates and regulatory conditions are met.

## Security and repository boundary

The repository is public. Never commit:

- real student names, dates of birth, IDs, addresses, contact details, payment information, or identity documents;
- examination answer keys or protected exam material;
- authenticated FDACS/LIAS screenshots, credentials, tokens, or session data;
- private instructor credential files or license-number evidence documents;
- production secrets or private API credentials.

Source code, sanitized schemas, tests, policy gates, and non-sensitive operational documentation may be committed.

## Release discipline

Do not enable public checkout, enrollment, regulated student course access, live instruction, examination access, completion issuance, or LIAS execution merely because source code or CI passes. Each capability requires its own validated production gate and the applicable regulatory authorization.
