# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-13

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Website: `https://www.obserrallc.com`

## Purpose

This is the authoritative sanitized restart record for the **Florida FDACS Class D Security Officer School and regulated LMS build** within the Academy master-record ecosystem.

This workstream is separate from the Obserra EPI Academy commercial Course 1 through Course N / LearnWorlds / SCORM production workstream. Do not apply generic Academy assessment, certificate, publication, or completion rules to the regulated Florida Class D program.

Detailed implementation state is maintained on the Florida implementation branch at:

`docs/florida-class-d-lms/HANDOFF.md`

## Current repository implementation

Primary implementation branch: `feature/florida-class-d-lms-foundation`

Primary pull request: `PR #56`

Current public state: `COMING SOON · LMS IN PROGRESS`

Owner reports an active Florida Class DI instructor license and a pending Class DS school application. Private credential numbers/evidence remain protected and are not committed to the public repository.

Paid enrollment, regulated student access, production live instruction, production exam access, completion/certificate issuance, LIAS execution, observer access, and production cohort scheduling remain disabled pending applicable regulatory and production gates.

## Controlled Class D architecture

```text
Course: Florida Class D Security Officer Training
Instructional days: 5
Credited instructional hours: 40
Credited instructional minutes: 2,400
Credited minutes per qualifying day: 480
Required curriculum areas: 18
Live lessons per day: 4
Instruction per live lesson: 120 minutes
Breaks: 15 minutes after Lessons 1, 2, and 3
Break credit toward instruction: 0
Final examination: separate from the 40 instructional hours
Exam questions: 170
Passing threshold: 128/170
State approval claim: prohibited until applicable approval exists
```

## Current gate state

**Gates 1 through 17 are implemented in source on `feature/florida-class-d-lms-foundation`.** Production activation and regulated database/runtime promotion remain pending.

### Gates 1-4

- Foundation and public fail-closed controls.
- Regulated student record model.
- Durable Supabase schema, persistence services, and administrative APIs.
- Identity verification and regulated enrollment workflow.

### Gates 5-8

- Live instructor classroom.
- Single-device presence and server-authoritative instructional/break/uncredited time.
- Daily instructor attendance certification.
- Secure embedded Daily media while Obserra remains the attendance system of record.
- Temporary view-only regulatory observer access.
- Five-day cohort scheduling and generation of 20 two-hour live sessions.

### Gates 9-11

- Structured live polls and learner participation evidence.
- Controlled make-up assignment and atomic make-up credit reconciliation.
- Protected recorded make-up with time, presence, anti-seek, and instructor-review controls.

### Gates 12-15

- Protected 170-question final examination architecture.
- Two-hour minimum exam duration.
- Randomized question delivery.
- Passing threshold of at least 128/170.
- Protected exam-bank administration and Division-approval status boundary.
- Active exam monitoring, one-session/one-device enforcement, interruption/resume controls, and auditable invalidation.
- Failed-attempt preservation, remediation, controlled retest authorization, and audit history.

### Gate 16 - Successful Completion Review

Completion is never awarded merely because 40 instructional hours have elapsed. Successful completion requires verified identity, all five qualifying 480-minute instructional days, at least 2,400 verified instructional minutes, all 18 curriculum areas/checks, closed remediation, a preserved passing examination attempt of at least 128/170, no unresolved completion-blocking issue, and authorized compliance review.

Approval snapshots the evidence, creates the controlled completion record, marks the enrollment completed, and prepares the manual LIAS reporting queue.

### Gate 17 - LIAS, Official Documents and Student Application Handoff

Gate 17 implements:

- manual LIAS workflow only, with no scraping or browser impersonation;
- controlled three-business-day reporting/certificate deadline tracking;
- append-only prepared/submitted/confirmed/exception history;
- compliance-admin-only LIAS actions;
- official FDACS-16103 ingestion only after confirmed LIAS output;
- reference matching, private storage, PDF validation, SHA-256 integrity checking, and authenticated learner download;
- protected student Completion Documents portal;
- supplemental Obserra completion/application records generated only after a preserved passing examination and successful-completion approval;
- official FDACS Class D application handoff links;
- inspection-ready post-course history.

The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS. Obserra does not synthesize or self-generate the official state form.

## Mandatory completion and certificate standard

**Forty instructional hours alone do not complete the Class D course and do not earn a certificate.**

A learner who has completed the instructional hours but has not passed the separate 170-question final examination remains incomplete and receives no course-completion certificate.

Only after the learner passes with at least 128/170, clears any required remediation/security issues, and receives authorized school completion approval may the LMS create the learner-specific supplemental Obserra Course Completion Certificate/application handoff record. Authorized staff then complete the official LIAS reporting process. The LIAS-generated FDACS-16103 is the official Florida training certificate made available to the learner after confirmation and secure ingestion.

The supplemental Obserra certificate does not replace FDACS-16103, and successful course completion does not itself issue a Florida Class D license.

The detailed student-facing standard is maintained on the implementation branch at:

`docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`

## Student completion information

The supplemental Obserra completion record may use protected learner information already present in the regulated system. The intended public-facing certificate fields are the learner's verified legal name, course title, 40 instructional hours, completion date, and unique certificate/reference identifier.

Do not place raw identity evidence, internal Clerk IDs, internal enrollment UUIDs, examination answers, identity-document details, or unnecessary sensitive identifiers on the public-facing certificate or in public source code.

## Class DS LMS submission guide and screenshot requirement

The controlled submission-guide record is:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The next controlled DOCX/PDF revision must incorporate the current completion/certification standard and add screenshots showing:

1. Completion Review Console with five qualifying days, 2,400 minutes, 18-area completion, exam-pass evidence, issue clearance, and approval.
2. The no-certificate-before-pass boundary for a learner who has completed 40 hours but has not passed the final examination.
3. FDACS/LIAS prepared, submitted, confirmed, exception, and reporting-deadline states.
4. Student Completion Documents portal distinguishing official FDACS-16103, supplemental Obserra certificate, and Class D application instructions.

Development screenshots must be labeled as submission/development previews. Controlled production screenshots should replace them before final operational evidence is represented as production validation.

## Current CI status boundary

The prior Gate 17 validation passed the Florida regulated source gates, repository tests, and lint but failed the production Next.js build on a TypeScript `BodyInit` mismatch in the protected certificate upload path. The source was corrected by converting the upload payload to a standards-compatible `Blob`.

Do not call Gate 17 fully green until the refreshed Florida workflow completes source verification, repository tests, lint, and the production build on the current implementation head.

CI success is source/build evidence only. It is not FDACS approval, production database promotion, runtime validation, or launch authorization.

## Remaining controlled sequence

1. Complete current Gate 17 CI validation and correct any remaining build defect.
2. Finish downloadable supplemental Obserra certificate/application-handoff rendering from the protected completion record.
3. Promote regulated Supabase migrations only through an approved production change/rollback gate.
4. Configure protected production runtime variables and private completion-document storage.
5. Complete end-to-end controlled runtime validation of identity, live media, attendance/time, presence, examination, completion, LIAS, document delivery, and inspection workflows.
6. Finalize the Division-approved exam bank before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with the latest completion/certificate workflow and screenshots.
8. Replace development screenshots with controlled production evidence where applicable.
9. Complete security, accessibility, desktop/mobile, operational, inspection, recovery, and owner acceptance testing.
10. Keep payment/enrollment and all regulated production functions disabled until applicable regulatory and launch gates are accepted.

## Security and public-repository boundary

Never commit real learner PII, dates of birth, identity documents, protected exam questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily meeting tokens, observer secrets, private instructor credential evidence, or production secrets.

## Restart instruction

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing any Florida Class D school/LMS work. Treat it as a regulated workstream separate from the commercial Academy Course 1-N build. Gates 1-17 are implemented in source on feature/florida-class-d-lms-foundation. Production activation and database/runtime promotion remain pending. Forty hours alone do not complete the course or earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized completion approval. Supplemental Obserra completion/application records may be generated only after that approval. The official FDACS-16103 comes from LIAS and is accepted into the learner portal only after LIAS confirmation. Keep public payment, enrollment, regulated instruction, exam, completion, certificate, LIAS, observer, and production scheduling functions disabled until the applicable regulatory and production gates pass. Continue from current Gate 17 CI validation, protected downloadable completion-document rendering, controlled production/database preparation, and the revised DS submission guide with screenshots.
```
