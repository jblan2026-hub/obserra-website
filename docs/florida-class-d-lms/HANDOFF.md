# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy Course 1 through Course N / LearnWorlds course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

Owner-reported licensing state: Florida Class DI instructor license active; Florida Class DS school application pending. Do not place private license numbers or credential evidence in the public repository.

## Release boundary

The Class D implementation is being built and tested before regulatory launch. Public paid enrollment, regulated student course access, production live instruction, production cohort scheduling, production exam access, completion issuance, LIAS execution, observer access, and production certificate/document release remain fail closed until the applicable regulatory and production gates are satisfied.

No source, CI, preview deployment, screenshot, or submission draft may be represented as FDACS approval.

## Controlled course architecture

- Five instructional days.
- Forty credited instructional hours.
- 2,400 verified instructional minutes total.
- 480 verified instructional minutes per qualifying day.
- Eighteen required curriculum areas.
- Four live 120-minute lessons per day.
- Fifteen-minute break after Lessons 1, 2, and 3 each day.
- Break time is tracked but receives zero instructional credit.
- Separate final certification examination.
- Final examination contains 170 questions.
- Passing threshold is at least 128 correct answers.
- Course completion is not issuance of a Florida Class D license.

## Current implementation state through Gate 17

### Gate 1 - Foundation Controls

Status: **IMPLEMENTED IN SOURCE**

Controls: dedicated Florida Training route; Coming Soon public state; payment/enrollment disabled; five-day/40-hour/18-area architecture; exact live-lesson structure; separate exam boundary; no premature approval/licensure claims.

Primary gate: `scripts/florida-class-d-foundation-gate.mjs`

### Gate 2 - Regulated Student Record Model

Status: **IMPLEMENTED IN SOURCE**

Primary model: `lib/florida-class-d-records.ts`

Controls: learner identity, regulated enrollment, cohort assignment, attendance, instructional time, module progress, learning checks, remediation, live-session/device state, audit events, regulated roles, and fail-closed exam eligibility.

### Gate 3 - Durable Regulated Records and Administrative APIs

Status: **IMPLEMENTED IN SOURCE / DATABASE PROMOTION PENDING**

Persistence uses the authorized Obserra Supabase architecture. Protected schemas, server-only service-role persistence, forced RLS, revoked direct browser access, staff authorization, correlation/idempotency controls, append-only audit evidence, and inspection APIs are present in source.

Production database promotion remains a separate controlled change and rollback activity.

### Gate 4 - Identity Verification and Regulated Enrollment

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include legal-name/date-of-birth intake, identity-verification status, controlled acknowledgments, cohort assignment, administrative review, and audit transitions. Identity-document binaries are not committed to the public repository.

### Gate 5 - Live Instructor Classroom, Presence, Time, Interaction and Daily Certification

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include single-device presence, authenticated session binding, server-authoritative connected/instructional/break/uncredited time, cumulative day/course totals, presence challenges, retry/absence review, Q&A, hand raise, instructor prompts, participation evidence, and daily instructor attendance certification.

Break time remains distinct from credited instructional time.

### Gate 6 - Secure Embedded Live Media

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Provider design: Daily private rooms with server-brokered short-lived tokens. Role-specific permissions, no learner screen share, no provider chat/hand raise, recording disabled by default, private scoped rooms, and independent Obserra attendance evidence are enforced in source.

### Gate 7 - Temporary Regulatory Observer Access

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include bounded, auditable, revocable, view-only temporary observer grants tied to one live session. Observer access cannot expose student records, exam content, administrative privileges, or credentials.

### Gate 8 - Five-Day Cohort Scheduling

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Scheduling creates exactly five ordered training days and 20 timezone-aware two-hour live lessons while preserving the required 15-minute non-instructional intervals after Lessons 1 through 3.

### Gate 9 - Structured Polls and Participation

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include instructor polls, one-response learner handling, student-safe payloads, instructor analytics, and participation evidence.

### Gate 10 - Make-Up Training and Atomic Credit Reconciliation

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include make-up assignments, learner/instructor questions, reconciliation ceilings, protected records, administrative workflow, and service-role-only atomic make-up credit certification.

### Gate 11 - Protected Recorded Make-Up

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include authenticated protected playback, one-device control, server-authoritative time, presence challenges, anti-seek controls, instructional-credit ceilings, and instructor review.

### Gate 12 - Controlled 170-Question Final Examination

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include a protected 170-question architecture, two-hour minimum duration, randomized order, 128/170 passing threshold, server-only scoring, and a fail-closed boundary requiring a Division-approved bank before production examination use.

### Gate 13 - Protected Examination Bank Administration

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include protected exam-bank import, source hashing, 170-question validation, 18-subject coverage validation, true/false limits, controlled approval-status promotion, and no answer-key exposure in the public repository.

### Gate 14 - Active Examination Monitoring

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls include one exam session/device, active monitoring, visibility/interruption state, staff-authorized resume, examiner monitoring, and auditable invalidation.

### Gate 15 - Remediation and Retest Governance

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controls preserve failed attempts, require documented remediation before a staff-authorized retest, support one-time authorization consumption/revocation, and retain inspection-ready audit history without inventing a wait-period or retest-count rule.

### Gate 16 - Successful Completion Review and LIAS Preparation

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Completion is never automatic. Successful-completion approval requires:

- verified learner identity;
- all five qualifying 480-minute instructional days;
- at least 2,400 verified instructional minutes;
- all 18 curriculum areas and required learning checks complete;
- required remediation closed;
- a preserved passing final examination of at least 128/170;
- no unresolved live-presence, exam-security, attendance, or completion-blocking state;
- authorized compliance-administrator approval.

Approval snapshots the controlled evidence, marks the enrollment completed, creates the completion record, and prepares the manual LIAS workflow queue.

### Gate 17 - LIAS Reporting, Completion Documents and Student Application Handoff

Status: **IMPLEMENTED IN SOURCE / CURRENT CI VALIDATION REQUIRED / PRODUCTION ACTIVATION DISABLED**

Controls include:

- manual LIAS workflow only, with no scraping or browser impersonation;
- controlled three-business-day reporting/certificate deadline tracking;
- append-only prepared/submitted/confirmed/exception history;
- compliance-admin-only LIAS workflow actions;
- official FDACS-16103 acceptance only after confirmed LIAS output;
- official document reference matching;
- private protected-object storage;
- PDF size/type validation;
- SHA-256 integrity validation;
- authenticated enrollment-bound student download;
- protected student Completion Documents portal;
- application links to the official FDACS Class D process;
- inspection-ready post-course packet.

The official **FDACS-16103 Certificate of Security Officer Training** is a LIAS-generated state document. Obserra must not synthesize or self-generate it.

## Mandatory student completion and certification standard

The following rule is now authoritative across student materials and LMS documentation:

**Completing 40 instructional hours does not, by itself, constitute successful course completion and does not cause any completion certificate to be issued.**

A learner who reaches 40 hours but has not passed the separate 170-question final examination remains incomplete. No Obserra completion certificate and no official Florida training certificate may be released until the learner satisfies the full completion standard and receives authorized school completion approval.

After a passing examination and successful-completion approval:

1. The system may create the learner-specific supplemental Obserra Course Completion Certificate/application-handoff record from the controlled completion record.
2. Authorized school staff perform the official LIAS reporting step.
3. LIAS generates the official FDACS-16103.
4. After confirmation and protected ingestion, the student may download FDACS-16103 from the authenticated Completion Documents portal.

The supplemental Obserra certificate does not replace FDACS-16103 and successful training completion does not itself issue a Florida Class D license.

Authoritative standard:

`docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`

## Student-facing information and privacy

The supplemental Obserra completion record may use protected data already present in the regulated system to accurately identify the learner. At minimum, the public-facing certificate design should use the learner's verified legal name, course title, 40 instructional hours, completion date, and unique certificate/reference identifier.

Do not place raw identity evidence, internal Clerk IDs, internal enrollment UUIDs, examination answers, identity-document details, or unnecessary sensitive identifiers on public-facing certificates or in public source code.

## Class DS LMS submission guide and screenshot evidence

Control record:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The current binary submission guide remains a controlled draft outside the public repository. The next controlled DOCX/PDF revision must incorporate the current completion/certification standard and add screenshots of:

1. Completion Review Console showing five qualifying days, 2,400 minutes, 18-area completion, exam pass, issue clearance, and approval.
2. The no-certificate-before-pass boundary for a learner who has completed instruction but has not passed the final exam.
3. FDACS/LIAS workflow states including prepared, submitted, confirmed, exceptions, and reporting due date.
4. Student Completion Documents portal distinguishing official FDACS-16103, supplemental Obserra record, and application instructions.

Development screenshots must be labeled as submission/development previews. Production screenshots must replace previews before the guide is used as final operational evidence after applicable authorization and production validation.

## Current CI note

The prior Gate 17 head passed all Florida Class D source gates, repository tests, and lint, but the production Next.js build failed on a TypeScript `BodyInit` mismatch for a protected completion-document upload using `Uint8Array`.

That source issue was corrected by converting the protected upload body to a standards-compatible `Blob`. Current CI on the refreshed head must complete before Gate 17 can be called fully green. Do not infer regulatory acceptance from CI success.

## Key current artifacts

- `docs/florida-class-d-lms/HANDOFF.md`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `docs/florida-class-d-lms/GATE-16-COMPLETION-REVIEW-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-17-LIAS-COMPLETION-DOCUMENTS-HANDOFF.md`
- `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`
- `app/florida-security-training/completion/page.tsx`
- `app/florida-security-training/admin/lias/LiasWorkflowConsole.tsx`
- `lib/florida-class-d-completion-documents.ts`
- `lib/florida-class-d-lias.ts`
- `supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql`
- `scripts/florida-class-d-lias-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

## Remaining production work

1. Obtain/confirm applicable Class DS authorization and final regulatory acceptance boundaries.
2. Promote regulated Supabase migrations through controlled production change, rollback, and verification procedures.
3. Configure protected production runtime variables and private document storage.
4. Validate Daily media, regulated identity/enrollment, attendance/time, presence, examination, completion, document, inspection, and LIAS workflows end to end with controlled test identities.
5. Finalize the Division-approved exam bank before production examination activation.
6. Produce the revised Class DS submission-guide DOCX/PDF with current completion/certification language and the new screenshot evidence.
7. Replace development screenshot previews with controlled production evidence when appropriate.
8. Complete security, accessibility, desktop/mobile, operational, inspection, disaster-recovery, and owner acceptance testing.
9. Activate payment/enrollment only after all applicable launch gates are accepted.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions/answers, FDACS/LIAS credentials, authenticated screenshots containing private data, Daily/API keys, Supabase service-role keys, real observer tokens, protected school records, or private credential evidence.

## Restart instruction

```text
Read docs/florida-class-d-lms/HANDOFF.md before continuing Florida Class D LMS work. Resume from the current Gate 17 state. Gates 1-17 are implemented in source; production activation remains fail closed and database/runtime promotion is pending. Forty instructional hours alone do not complete the course and do not earn a certificate. Successful completion requires the full 40-hour/five-day record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared remediation/security issues, and authorized completion approval. After approval, the LMS may create a supplemental Obserra completion record, staff complete manual LIAS reporting, and the official FDACS-16103 is accepted only after LIAS confirmation. Keep all public payment, enrollment, regulated instruction, exam, completion, certificate, LIAS, observer, and production scheduling functions disabled until applicable regulatory and production gates pass. The next controlled work is current CI validation, controlled production/database preparation, and revision of the Class DS submission guide with the completion/certification screenshots.
```
