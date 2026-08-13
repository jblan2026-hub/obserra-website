# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-13

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Website: `https://www.obserrallc.com`

## Purpose

This is the authoritative sanitized restart record for the **Florida FDACS Class D Security Officer School and regulated LMS build** within the Academy master-record ecosystem.

This workstream is separate from the Obserra EPI Academy commercial Course 1 through Course N / LearnWorlds / SCORM workstream. Generic Academy assessment, completion, certificate, and publication rules do not supersede the Florida Class D controls.

Detailed implementation state is maintained on the Florida branch at:

`docs/florida-class-d-lms/HANDOFF.md`

## Current implementation

Primary branch: `feature/florida-class-d-lms-foundation`

Primary pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

Owner reports an active Florida Class DI instructor license and a pending Class DS school application. Private credential numbers/evidence are protected and not committed to the public repository.

Paid enrollment, regulated learner access, production live instruction, production exam access, completion/certificate release, LIAS execution, observer access, and production cohort scheduling remain disabled pending applicable regulatory and production gates.

## Controlled Class D architecture

```text
Instructional days: 5
Credited instructional hours: 40
Credited instructional minutes: 2,400
Credited minutes per qualifying day: 480
Required curriculum areas: 18
Live lessons per day: 4
Instruction per live lesson: 120 minutes
Breaks: 15 minutes after Lessons 1, 2, and 3
Break credit toward instruction: 0
Final examination: separate from instructional hours
Exam questions: 170
Passing threshold: 128/170
```

## Current gate state

**Gates 1 through 18 are implemented in source on `feature/florida-class-d-lms-foundation`.** Production database/runtime promotion and regulated activation remain pending.

### Gates 1-4

Foundation and public fail-closed controls; regulated student records; durable Supabase persistence and administrative APIs; identity verification and regulated enrollment.

### Gates 5-8

Live instructor classroom; single-device presence; server-authoritative connected/instructional/break/uncredited time; daily attendance certification; secure Daily media; temporary view-only regulatory observer access; exact five-day cohort scheduling with 20 two-hour live sessions.

### Gates 9-11

Structured live polls/participation; controlled make-up assignment and atomic credit reconciliation; protected recorded make-up with presence, time, anti-seek, and instructor-review controls.

### Gates 12-15

Protected 170-question examination; minimum two-hour exam duration; randomized question delivery; 128/170 passing threshold; protected exam-bank administration; Division-approval status boundary; active monitoring; one-session/one-device enforcement; interruption/resume/invalidation; failed-attempt preservation; remediation and controlled retest authorization.

### Gate 16 - Successful Completion Review

Completion requires verified identity, all five qualifying 480-minute instructional days, at least 2,400 verified instructional minutes, all 18 curriculum areas/checks, closed remediation, a preserved passing examination attempt at 128/170 or better, no unresolved completion-blocking issue, and authorized compliance approval.

Approval snapshots the evidence, creates the controlled completion record, marks enrollment completed, and prepares the manual LIAS reporting queue.

### Gate 17 - LIAS and Official Completion Documents

Implements manual LIAS workflow with no scraping/impersonation, three-business-day deadline tracking, append-only workflow history, compliance-admin controls, confirmed-LIAS-only FDACS-16103 ingestion, private storage, PDF validation, SHA-256 integrity validation, authenticated learner download, Class D application handoff, and inspection-ready post-course history.

The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS. Obserra does not synthesize or self-generate the official state form.

### Gate 18 - Protected Supplemental Certificate Presentation

Implements protected learner-facing rendering of the supplemental Obserra completion certificate and application-handoff document.

Controls include:

- supplemental records are created automatically only from an authorized successful-completion record;
- the database independently verifies the preserved final exam attempt is passed and at least 128/170 before any supplemental completion document is created;
- **40 instructional hours alone never produce a certificate**;
- protected render payload uses the learner's verified legal name and controlled completion facts;
- server-side rendering and HTML escaping prevent raw learner-controlled markup from becoming document content;
- certificate rendering independently rechecks 40 hours and passing-exam facts;
- certificate displays verified legal name, course title, 40 instructional hours, exam score, completion date, and a unique Obserra certificate ID;
- the certificate states that it is supplemental, does not replace FDACS-16103, and does not itself issue a Class D license;
- student access remains authenticated and completed-enrollment-bound;
- restrictive no-store/noindex/CSP response controls are applied;
- official FDACS-16103 remains a separately handled LIAS-generated PDF.

Primary Gate 18 handoff on the Florida branch:

`docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md`

## Mandatory completion and certificate rule

**Forty instructional hours alone do not constitute successful completion and do not earn any completion certificate.**

A learner who has completed instruction but has not passed the separate 170-question final examination remains incomplete and receives no certificate. Successful completion requires the full regulated completion evidence plus a passing score of at least 128/170 and authorized school approval.

After approval, the LMS automatically creates the protected supplemental Obserra completion certificate/application-handoff record. Authorized staff then complete the official LIAS reporting workflow. The official FDACS-16103 is released to the protected learner portal only after LIAS confirmation and secure ingestion.

Successful course completion does not itself issue a Florida Class D license.

## DS submission-guide documentation and screenshots

The controlled submission-guide record is maintained at:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The next controlled DOCX/PDF revision must include current completion/certification wording and development-preview screenshots showing:

1. Completion Review Console with five qualifying days, 2,400 minutes, 18-area completion, exam pass, issue clearance, and approval.
2. A learner at 40 instructional hours who remains certificate-ineligible until the final exam is passed.
3. The generated supplemental Obserra Course Completion Certificate using demonstration data.
4. FDACS/LIAS prepared, submitted, confirmed, exception, and reporting-deadline states.
5. Student Completion Documents portal distinguishing FDACS-16103, supplemental Obserra certificate, and Class D application instructions.

Development images must be labeled as previews. Controlled production screenshots should replace them before the guide is represented as final operational evidence.

## Current CI boundary

The earlier Gate 17 head passed the regulated source gates, repository tests, and lint but exposed a TypeScript `BodyInit` mismatch during the production build. The protected upload path was corrected to use a standards-compatible `Blob`. Gate 18 also uses `Blob` response bodies for generated/stored document delivery.

Do not call Gates 1-18 fully green until the current Florida workflow completes source verification, repository tests, lint, and production Next.js build on the current implementation head.

CI success is source/build evidence only. It is not FDACS approval, production database promotion, runtime acceptance, or launch authorization.

## Next controlled sequence

1. Complete Gates 1-18 CI and correct any remaining source/type/lint/build defect.
2. Build the next quality/inspection/export layer for complete learner completion packets and school operational review.
3. Promote regulated Supabase migrations only through controlled production change, rollback, and verification procedures.
4. Configure protected runtime settings and private document storage.
5. Validate identity/enrollment, Daily media, attendance/time, presence, examination, completion, documents, inspection, and LIAS end to end with controlled test identities.
6. Finalize the Division-approved exam bank before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with the latest completion/certificate workflow and screenshot evidence.
8. Replace development screenshots with controlled production evidence where applicable.
9. Complete security, accessibility, desktop/mobile, operational, inspection, recovery, and owner acceptance testing.
10. Keep payment/enrollment and regulated production functions disabled until applicable launch gates are accepted.

## Security and public-repository boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private credential evidence, or production secrets.

## Restart instruction

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing Florida Class D school/LMS work. Treat it as a regulated workstream separate from the commercial Academy Course 1-N build. Gates 1-18 are implemented in source on feature/florida-class-d-lms-foundation. Production activation and database/runtime promotion remain pending. Forty hours alone do not complete the course or earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion blockers, and authorized completion approval. After approval the LMS creates a protected supplemental Obserra completion certificate/application-handoff record; staff perform manual LIAS reporting; the official FDACS-16103 is accepted only after LIAS confirmation. Continue from current Gates 1-18 CI validation, quality/inspection/export build-out, controlled production/database preparation, and revision of the DS submission guide with completion/certificate screenshots. Keep all regulated public launch functions fail closed until applicable authorization and production gates pass.
```
