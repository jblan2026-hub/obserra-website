# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-13

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Website: https://www.obserrallc.com

## Purpose

This is the authoritative sanitized restart record for the **Florida FDACS Class D Security Officer School and regulated LMS build**.

This workstream is **separate from the Obserra EPI Academy commercial course-production build**. Do not mix this handoff with the Course 1 through Course N, LearnWorlds SCORM, owner-video, or general Academy catalog production state except where shared website infrastructure is intentionally reused.

Implementation detail is also maintained on the Florida branch at:

`docs/florida-class-d-lms/HANDOFF.md`

## Current repository implementation

Primary implementation branch:

`feature/florida-class-d-lms-foundation`

Primary pull request:

`PR #56 — Florida Class D LMS foundation and Coming Soon training tab`

Current public state:

`COMING SOON · LMS IN PROGRESS`

Paid enrollment, regulated student access, live instruction activation, regulatory completion issuance, live examination access, and LIAS execution remain disabled.

## Current licensing state and activation boundary

Owner reports an active Florida Class DI instructor license and a pending Class DS school application.

No private license documentation or license number is committed to this public repository. The production live-instruction gate requires protected server configuration for both the DI and DS license numbers and refuses to enable live regulated instruction unless the DS status is explicitly configured as active.

Therefore:

- continue building and testing source now;
- keep the Florida public page Coming Soon;
- do not activate paid enrollment or regulated live student access while the DS remains pending;
- do not claim FDACS approval merely because source, CI, or a preview deployment exists.

## Controlled course architecture

```text
Provider: Obserra Executive Protection & Intelligence LLC
Course: Florida Class D Security Officer Training
Instructional days: 5
Credited instructional hours: 40
Credited instructional minutes: 2,400
Credited instructional minutes per day: 480
Live instructional lessons per day: 4
Instruction per live lesson: 120 minutes
Scheduled breaks: 15 minutes after Lessons 1, 2, and 3 each day
Tracked break time: 45 minutes per day
Break credit toward instruction: zero
Required curriculum areas: 18
Certification examination: separately controlled from instructional hours
Exam questions: 170
Passing threshold metadata: 128 correct
Public approval claim: prohibited until applicable approval is established
```

The fourth live lesson concludes the instructional day, so no post-day break is scheduled after Lesson 4.

## Gate 1 — Foundation Controls

Status: `IMPLEMENTED IN SOURCE / DEDICATED CI WIRED`

Implemented controls include:

- dedicated Florida Training website navigation;
- premium Florida Class D Coming Soon / LMS In Progress page;
- payment and enrollment disabled;
- five-day / 40-hour / 18-area course architecture;
- four two-hour live lesson blocks each day;
- fifteen-minute breaks after the first three lesson blocks each day;
- break time explicitly tracked but never credited as instruction;
- learning check or applied assessment defined for every curriculum area;
- separate controlled examination metadata;
- licensure distinction language;
- no state-approval representation before applicable approval;
- fail-closed Florida-specific source gates.

Gate script:

`scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

Status: `IMPLEMENTED IN SOURCE / DEDICATED CI WIRED`

Source domain model:

`lib/florida-class-d-records.ts`

Gate script:

`scripts/florida-class-d-records-gate.mjs`

The model defines sanitized production contracts for:

- student identity and verification;
- regulated enrollment and cohort assignment;
- five-day attendance;
- instructional-time credit;
- 18-area progress;
- learning checks and remediation;
- live sessions;
- single-device leases;
- presence challenges;
- separate instructional, break, connected, and uncredited time;
- student/instructor live interactions;
- append-only audit events;
- regulated role boundaries;
- deterministic examination eligibility.

Exam eligibility remains blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 curriculum areas are complete, and no remediation remains open.

Students may not alter credited attendance, instructional time, or their own exam eligibility.

## Gate 3 — Durable Regulated Records & Administrative API

Status: `IMPLEMENTED IN SOURCE / DATABASE PROMOTION PENDING`

### Production persistence architecture

The existing authorized Obserra Supabase backend is the selected persistence platform. Do not introduce a second database platform for this regulated school build without an explicit architecture change.

### Gate 3 implementation

```text
supabase/migrations/20260813033000_fdacs_class_d_regulated_records.sql
lib/florida-class-d-auth.ts
lib/florida-class-d-persistence.ts
app/api/florida-class-d/admin/attendance/route.ts
app/api/florida-class-d/admin/instruction-time/route.ts
app/api/florida-class-d/admin/inspection/route.ts
scripts/florida-class-d-persistence-gate.mjs
```

The durable schema defines protected cohorts, identity state, regulated enrollments, attendance, instructional-time evidence, progress, learning checks, remediation, record holds, and append-only audit events.

Security controls include forced RLS, revoked browser-role table access, server-only service-role access, Clerk staff authorization, no-store APIs, restricted inspection export, idempotency keys, correlation IDs, and transactional evidence/audit writes.

Production database promotion remains a separate approval and validation step. No real learner data is created by source implementation.

## Gate 4 — Identity Verification & Regulated Enrollment Workflow

Status: `IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED`

### Gate 4 implementation

```text
supabase/migrations/20260813040000_fdacs_class_d_enrollment_workflow.sql
lib/florida-class-d-enrollment-policy.ts
app/api/florida-class-d/enrollment/route.ts
app/api/florida-class-d/admin/enrollments/route.ts
app/api/florida-class-d/admin/identity/route.ts
```

Implemented controls include:

- controlled pre-enrollment;
- legal-name and date-of-birth data capture;
- identity-verification workflow;
- versioned learner acknowledgments;
- cohort assignment controls;
- school/compliance administrator review;
- verified identity required before approval;
- all required acknowledgments required before approval;
- auditable status transitions;
- payment, instructional access, examination access, completion issuance, and LIAS still disabled.

No identity-document binaries are committed or stored by this source workflow.

## Gate 5 — Live Instructor Classroom, Presence, Interaction & Time Evidence

Status: `IMPLEMENTED IN SOURCE / CI AND PRODUCTION PROMOTION PENDING`

### Gate 5 implementation

```text
lib/florida-class-d-live-policy.ts
lib/florida-class-d-live-persistence.ts
lib/florida-class-d-live-feed.ts
lib/florida-class-d-live-reporting.ts
supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql
supabase/migrations/20260813044000_fdacs_class_d_daily_attendance_reconciliation.sql
app/api/florida-class-d/live/route.ts
app/api/florida-class-d/admin/live/route.ts
app/florida-security-training/live/[liveSessionId]/page.tsx
app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx
app/florida-security-training/admin/live/[liveSessionId]/page.tsx
app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx
app/florida-security-training/live-classroom.css
scripts/florida-class-d-live-gate.mjs
```

### Live classroom controls implemented in source

- real-time instructor-operated classroom control plane;
- Florida physical-location policy metadata;
- DI and DS license data bound to live sessions through protected runtime configuration;
- fail-closed live activation while DS status is not active;
- one active learner device lease at a time;
- authenticated Clerk session plus browser-instance binding;
- 60-second presence heartbeat;
- controlled stale-device recovery;
- separate connected, instructional-presence, break-presence, and uncredited-connected time;
- cumulative day time by student;
- cumulative full-course time by student;
- instructor-controlled instruction/break segments;
- fifteen-minute breaks after each of the first three live lessons every day;
- security presence challenges before the two-hour maximum interval;
- five-minute retry opportunity after a failed challenge;
- failed retry marks the learner absent for review and stops continued instructional credit;
- documented instructor presence-restoration review;
- daily attendance certification by the instructor after all four daily lessons end;
- database prevention of a full `present` certification without 480 verified instructional minutes and no unresolved challenge absence;
- audit evidence that preserves connected, instructional, break, and uncredited time for the certified day;
- student questions;
- instructor answers;
- hand raise;
- instructor prompts;
- participation records and poll-response contract;
- minimum text-screen timing policy helper of one minute per 50 words with proration;
- live-session inspection-access reference field;
- append-only live interaction history.

### Instructor console

The instructor console can:

- start and end the live lesson;
- start the fifteen-minute break and resume instruction;
- issue classwide presence checks;
- automatically issue an opening check and another at approximately 105 instructional minutes, before two hours elapse;
- display the current security code without publishing it in the Q&A feed;
- view each learner's current live connection state;
- view daily instructional and break time;
- view cumulative course connected, instructional, break, and uncredited time;
- document review of a security-challenge absence;
- certify daily attendance after Lesson 4 has ended;
- send class prompts;
- receive student questions;
- send instructor answers.

### Student classroom

The student classroom can:

- enter with an authenticated account;
- acquire the single-device lease;
- send recurring server-side presence heartbeats;
- see live instruction versus break state;
- see current-lesson connected, instructional, break, and uncredited time;
- see day cumulative connected, instructional, break, and uncredited time;
- see full-course cumulative connected, instructional, break, and uncredited time;
- answer security challenges;
- ask questions;
- raise a hand;
- view live Q&A and instructor responses.

Every tracked time category is associated with the authenticated regulated enrollment. Break time is retained for the attendance history but remains structurally separate from instructional credit.

### Live media transport boundary

**The regulated attendance, presence, cumulative-time, daily-certification, Q&A, instructor-control, and audit control plane is implemented, but the actual embedded video/audio transport is not yet selected or configured.**

The student and instructor pages deliberately contain media placeholders. The next live subgate must integrate a secure real-time provider without replacing Obserra's independent attendance/time evidence controls.

The media integration must preserve authenticated real-time interaction, investigator live-access capability, accessibility, desktop/mobile operation, and the one-device policy. A third-party meeting attendance report must never become the sole regulated attendance record.

## Dedicated Florida CI

Workflow:

`.github/workflows/florida-class-d-lms-gates.yml`

`npm run verify:florida-class-d` executes the foundation, record-model, persistence, and live-instruction source gates. The workflow also runs repository contract tests, lint, and production build.

Do not treat unrelated commercial Academy gate failures as Florida regulated-LMS acceptance or rejection. The dedicated Florida workflow is the authoritative automated source/build signal for this workstream, followed by runtime and regulatory validation.

## Separate FDACS school operations package outside the public repository

The school-administration workstream includes controlled materials for student enrollment, identity verification, daily attendance/time sheets, instructor certification, make-up training, module learning checks, remediation, final-exam records, exam chain of custody, acknowledgments, evaluations, incidents, retention logs, instructor rosters, curriculum revision control, FDACS inspection binder, LIAS workflow, graduate licensing instructions, and quality/CAPA controls.

Protected operational documents, examination answers, learner records, private credentials, and regulated PII must not be committed to this public repository.

## Target lifecycle

```text
Public Florida Training page
→ authenticated account
→ identity verification and acknowledgments
→ payment entitlement only after launch authorization
→ cohort assignment
→ Day 1–5 live regulated instruction
→ single-device session control
→ attendance and instructional-time evidence
→ tracked breaks separated from instructional credit
→ security presence challenges
→ live Q&A and participation
→ instructor-certified daily attendance
→ module learning checks
→ remediation and permitted make-up where required
→ 40 credited instructional hours complete
→ controlled certification examination eligibility
→ pass/fail and retest workflow
→ instructor / school administrator review
→ FDACS/LIAS administrative reporting queue
→ completion-document workflow
→ student Florida Class D licensing instructions
→ inspection-ready retained record
```

## Next controlled sequence

1. Validate Gate 5 through the dedicated Florida CI workflow and fix any failures.
2. Select and integrate the secure live video/audio provider.
3. Implement the FDACS investigator live-access technical and operating procedure.
4. Complete structured live polls and participation analytics.
5. Automate cohort schedules and creation of all 20 live lesson sessions.
6. Build the permitted online make-up workflow and reconcile make-up credit into daily attendance.
7. Enforce timing for text-based screens in the live lesson player.
8. Promote regulated database migrations only through approved production database-change gates with rollback evidence.
9. Build module learning-check/remediation automation.
10. Build the controlled 170-question examination engine with protected/randomized question delivery.
11. Build completion/retest/instructor-review and FDACS/LIAS queue workflows.
12. Activate Stripe entitlement only after the regulatory and operational launch gates are satisfied.
13. Complete end-to-end regulatory, security, accessibility, mobile/desktop, inspection, and owner acceptance.

## Security and public-repository boundary

Never commit:

- real learner names, dates of birth, addresses, identity documents, or contact details;
- payment-card data;
- FDACS/LIAS credentials, tokens, private screenshots, or session information;
- protected final examination questions or answer keys;
- private instructor credential documents or license-number evidence;
- production secrets or private API credentials.

Public repository content is limited to sanitized source code, schemas, tests, policy gates, release evidence, and non-sensitive handoff documentation.

## Truth and release boundary

Do not claim that the Florida Class D LMS is FDACS approved, deployed for regulated use, purchasable, open for student enrollment, capable of issuing regulatory completion, or accepted by FDACS merely because source code or CI exists.

Each capability requires implementation evidence, source/build CI evidence, runtime evidence, deployment evidence, and applicable regulatory authorization before activation or public representation.

## Restart instruction for this workstream

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing any Florida Class D school/LMS work. Treat it as a separate regulated workstream from the Obserra EPI Academy commercial course build. Resume from the latest implemented gate. Gates 1 through 5 have source implementation, including live interaction, single-device presence, security challenges, tracked breaks, cumulative student time, and instructor-certified daily attendance. Regulated migrations have not been promoted to production and live media transport is not yet configured. Owner reports DI active and DS pending. Keep the public page Coming Soon and keep paid enrollment, regulated student access, live activation, examination, completion issuance, and LIAS execution disabled until their later validated gates and regulatory conditions are satisfied. Next priority is Gate 5 CI validation followed by secure live video/audio and investigator-access integration.
```
