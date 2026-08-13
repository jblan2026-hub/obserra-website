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

## Current implementation state through Gate 18

### Gates 1-4

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Foundation, public fail-closed controls, regulated student records, durable Supabase persistence/admin APIs, identity verification, and regulated enrollment are implemented. Production database promotion remains a separate controlled change and rollback activity.

### Gates 5-8

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Live instructor classroom, single-device presence, server-authoritative connected/instructional/break/uncredited time, cumulative time, presence challenges, Q&A, participation, daily attendance certification, secure Daily media, temporary view-only observer access, and exact five-day/20-session scheduling are implemented.

Break time remains distinct from credited instructional time.

### Gates 9-11

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Structured polls/participation evidence, make-up assignment and atomic make-up credit reconciliation, and protected recorded make-up with time/presence/anti-seek/instructor-review controls are implemented.

### Gates 12-15

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

The protected 170-question final examination, two-hour minimum duration, randomized delivery, 128/170 passing threshold, protected exam-bank administration, Division-approval status boundary, active exam monitoring, one-session/one-device enforcement, interruption/resume controls, auditable invalidation, failed-attempt preservation, remediation, and controlled retest authorization are implemented.

### Gate 16 - Successful Completion Review and LIAS Preparation

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Successful-completion approval requires:

- verified learner identity;
- all five qualifying 480-minute instructional days;
- at least 2,400 verified instructional minutes;
- all 18 curriculum areas and required learning checks complete;
- required remediation closed;
- a preserved passing final examination of at least 128/170;
- no unresolved live-presence, exam-security, attendance, or completion-blocking state;
- authorized compliance-administrator approval.

Approval snapshots the evidence, marks the enrollment completed, creates the completion record, and prepares the manual LIAS workflow queue.

### Gate 17 - LIAS Reporting, Official Completion Documents and Student Application Handoff

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

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
- official Florida Class D application handoff;
- inspection-ready post-course packet.

The official **FDACS-16103 Certificate of Security Officer Training** is a LIAS-generated state document. Obserra must not synthesize or self-generate it.

### Gate 18 - Protected Supplemental Certificate Presentation

Status: **IMPLEMENTED IN SOURCE / CURRENT CI VALIDATION REQUIRED / PRODUCTION ACTIVATION DISABLED**

Gate 18 makes the supplemental records created after successful completion usable as protected learner documents while preserving the examination-first certificate boundary.

Implemented controls include:

- automatic supplemental Obserra certificate/application-handoff records created only from an authorized completion record;
- database-level independent verification that the preserved final exam attempt is passed and scored at least 128 before document creation;
- no certificate creation for a learner who has merely reached 40 instructional hours;
- learner-specific protected render payload using verified legal name and controlled completion facts;
- server-side rendering for the supplemental Obserra Course Completion Certificate and application-handoff document;
- HTML escaping of dynamic learner values;
- independent render-time validation of the 40-hour and passing-exam facts;
- supplemental certificate presentation of learner legal name, course title, 40 instructional hours, exam score, completion date, and unique Obserra certificate ID;
- clear supplemental-record disclaimer that the document does not replace FDACS-16103 and does not issue a Class D license;
- authenticated completed-enrollment-bound document access;
- restrictive no-store, noindex, nosniff, frame-denial, referrer, and content-security-policy response headers;
- standards-compatible `Blob` response bodies for generated and stored document delivery;
- official FDACS-16103 remaining a separately stored LIAS-generated PDF with integrity validation.

Primary Gate 18 artifacts:

- `supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql`
- `lib/florida-class-d-completion-documents.ts`
- `app/api/florida-class-d/completion-documents/route.ts`
- `app/florida-security-training/completion/page.tsx`
- `scripts/florida-class-d-certificate-presentation-gate.mjs`
- `docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md`

## Mandatory student completion and certification standard

**Completing 40 instructional hours does not, by itself, constitute successful course completion and does not cause any completion certificate to be issued.**

A learner who reaches 40 hours but has not passed the separate 170-question final examination remains incomplete. No Obserra completion certificate and no official Florida training certificate may be released until the learner satisfies the full completion standard and receives authorized school completion approval.

After a passing examination and successful-completion approval:

1. The system automatically creates the learner-specific supplemental Obserra Course Completion Certificate/application-handoff record.
2. The learner can open the protected supplemental Obserra certificate and application handoff from the authenticated Completion Documents portal.
3. Authorized school staff perform the official LIAS reporting step.
4. LIAS generates the official FDACS-16103.
5. After LIAS confirmation and protected ingestion, the learner may download FDACS-16103 from the authenticated portal.

The supplemental Obserra certificate does not replace FDACS-16103 and successful training completion does not itself issue a Florida Class D license.

Authoritative standard:

`docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`

## Student-facing information and privacy

The supplemental certificate uses protected data already present in the regulated system. The intended learner-facing fields are verified legal name, course title, 40 instructional hours, final examination score, completion date, and a unique certificate/reference identifier.

Do not place raw identity evidence, internal Clerk IDs, internal enrollment UUIDs, examination answers, identity-document details, or unnecessary sensitive identifiers on public-facing certificates or in public source code.

## Class DS LMS submission guide and screenshot evidence

Control record:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The controlled submission-guide DOCX/PDF must be revised to incorporate the current completion/certification standard and add screenshots of:

1. Completion Review Console showing five qualifying days, 2,400 minutes, 18-area completion, exam pass, issue clearance, and approval.
2. The no-certificate-before-pass boundary for a learner who has completed instruction but has not passed the final exam.
3. The generated supplemental Obserra Course Completion Certificate using demonstration learner data.
4. FDACS/LIAS workflow states including prepared, submitted, confirmed, exceptions, and reporting due date.
5. Student Completion Documents portal distinguishing official FDACS-16103, supplemental Obserra certificate, and Class D application instructions.

Development screenshots must be labeled as submission/development previews. Production screenshots must replace previews before the guide is used as final operational evidence after applicable authorization and production validation.

## Current CI note

The earlier Gate 17 head passed Florida Class D source gates, repository tests, and lint but failed the production Next.js build on a TypeScript `BodyInit` mismatch in the protected completion-document upload path. That source issue was corrected by converting the upload payload to a standards-compatible `Blob`.

Gate 18 also uses standards-compatible `Blob` response bodies. Current CI on the Gate 18 head must complete source verification, repository tests, lint, and the production build before Gate 18 is called fully green.

CI success is source/build evidence only. It is not FDACS approval, production database promotion, runtime validation, or launch authorization.

## Key current artifacts

- `docs/florida-class-d-lms/HANDOFF.md`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `docs/florida-class-d-lms/GATE-16-COMPLETION-REVIEW-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-17-LIAS-COMPLETION-DOCUMENTS-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md`
- `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`
- `app/florida-security-training/completion/page.tsx`
- `app/florida-security-training/admin/lias/LiasWorkflowConsole.tsx`
- `lib/florida-class-d-completion-documents.ts`
- `lib/florida-class-d-lias.ts`
- `supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql`
- `scripts/florida-class-d-lias-gate.mjs`
- `scripts/florida-class-d-certificate-presentation-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

## Remaining production and build work

1. Complete current Gates 1-18 CI validation and correct any remaining source/type/lint/build defect.
2. Build the next controlled quality/inspection/export layer for complete learner completion packets and school operational review.
3. Promote regulated Supabase migrations through controlled production change, rollback, and verification procedures.
4. Configure protected production runtime variables and private document storage.
5. Validate Daily media, identity/enrollment, attendance/time, presence, examination, completion, document, inspection, and LIAS workflows end to end with controlled test identities.
6. Finalize the Division-approved exam bank before production examination activation.
7. Produce the revised Class DS submission-guide DOCX/PDF with current completion/certification language and required screenshot evidence.
8. Replace development screenshot previews with controlled production evidence where appropriate.
9. Complete security, accessibility, desktop/mobile, operational, inspection, disaster-recovery, and owner acceptance testing.
10. Activate payment/enrollment only after all applicable launch gates are accepted.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions/answers, FDACS/LIAS credentials, authenticated screenshots containing private data, Daily/API keys, Supabase service-role keys, real observer tokens, protected school records, or private credential evidence.

## Restart instruction

```text
Read docs/florida-class-d-lms/HANDOFF.md before continuing Florida Class D LMS work. Resume from the current Gate 18 state. Gates 1-18 are implemented in source; production activation remains fail closed and database/runtime promotion is pending. Forty instructional hours alone do not complete the course and do not earn a certificate. Successful completion requires the full five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared remediation/security issues, and authorized completion approval. After approval, the LMS automatically creates the protected supplemental Obserra completion certificate/application-handoff record. Staff complete manual LIAS reporting, and the official FDACS-16103 is accepted only after LIAS confirmation. Keep all public payment, enrollment, regulated instruction, exam, completion, certificate, LIAS, observer, and production scheduling functions disabled until applicable regulatory and production gates pass. The next controlled work is Gates 1-18 CI validation, quality/inspection/export build-out, controlled production/database preparation, and revision of the Class DS submission guide with completion/certificate screenshots.
```
