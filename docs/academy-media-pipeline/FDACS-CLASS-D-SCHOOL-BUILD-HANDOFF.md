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

Owner reports an active Florida Class DI instructor license and a pending Class DS school application. Private credential numbers/evidence remain protected and are not committed to the public repository.

Paid enrollment, regulated learner access, production live instruction, production exam access, completion/certificate release, LIAS execution, observer access, and production scheduling remain disabled pending applicable regulatory and production gates.

## Controlled course architecture

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

**Gates 1 through 19 are implemented in source on `feature/florida-class-d-lms-foundation`.** Production database/runtime promotion and regulated activation remain pending.

### Gates 1-4

Foundation/public fail-closed controls, regulated student records, durable Supabase persistence/admin APIs, identity verification, and regulated enrollment.

### Gates 5-8

Live instructor classroom, single-device presence, server-authoritative instructional/break/uncredited time, attendance certification, secure Daily media, temporary view-only regulatory observer access, and exact five-day/20-session scheduling.

### Gates 9-11

Structured polls/participation, make-up assignment with atomic credit reconciliation, and protected recorded make-up with time/presence/anti-seek/instructor-review controls.

### Gates 12-15

Protected 170-question examination, minimum two-hour duration, randomized delivery, 128/170 passing threshold, protected exam-bank administration, Division-approval status boundary, active exam monitoring, one-session/one-device enforcement, interruption/resume/invalidation, failed-attempt preservation, remediation, and controlled retest authorization.

### Gate 16 - Successful Completion Review

Successful completion requires verified identity, all five qualifying 480-minute instructional days, at least 2,400 verified instructional minutes, all 18 curriculum areas/checks, closed remediation, a preserved passing exam attempt at 128/170 or better, no unresolved completion blocker, and authorized compliance approval.

Approval creates the controlled completion record, marks enrollment completed, snapshots evidence, and prepares the manual LIAS queue.

### Gate 17 - LIAS and Official Completion Documents

Manual LIAS workflow, three-business-day deadline tracking, append-only workflow history, confirmed-LIAS-only FDACS-16103 ingestion, private storage, PDF validation, SHA-256 integrity checking, authenticated learner download, application handoff, and inspection-ready post-course history are implemented.

The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS. Obserra does not synthesize or self-generate the official state form.

### Gate 18 - Protected Supplemental Certificate Presentation

Supplemental Obserra certificate/application-handoff records are created only from an authorized successful-completion record. The database independently verifies a preserved passed exam attempt at 128/170 or better before creating any supplemental completion document.

**Forty instructional hours alone never produce a certificate.**

Protected server-side rendering uses the learner's verified legal name and controlled completion facts, escapes dynamic values, revalidates the passing-exam boundary, and presents the supplemental certificate separately from FDACS-16103.

### Gate 19 - Completion / Inspection Packet

Gate 19 adds a protected staff-only completion/inspection packet that consolidates:

- enrollment and verified learner identity status/name;
- attendance and instructional-time records;
- live-time totals;
- module progress;
- learning-check/remediation history where available;
- examination attempt history without exam questions or answers;
- successful-completion record;
- LIAS state and event history;
- completion-document metadata;
- audit history.

The packet explicitly excludes exam questions/answers, raw identity-document images, payment-card data, and authentication secrets. It receives a deterministic SHA-256 digest over canonicalized packet content and can be opened as a protected printable HTML record or downloaded as JSON evidence.

Primary Gate 19 handoff on the Florida branch:

`docs/florida-class-d-lms/GATE-19-COMPLETION-PACKET-INSPECTION-HANDOFF.md`

## Mandatory completion and certificate rule

**Forty instructional hours alone do not complete the course and do not earn a certificate.**

Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion blockers, and authorized school approval.

After approval the LMS creates the protected supplemental Obserra completion certificate/application handoff. Staff perform manual LIAS reporting. The official FDACS-16103 is accepted into the learner portal only after LIAS confirmation and secure ingestion. Successful course completion does not itself issue a Florida Class D license.

## DS submission-guide screenshots

The next controlled DS LMS submission-guide DOCX/PDF revision must include development-preview screenshots of:

1. Completion Review Console.
2. The no-certificate-before-pass boundary at 40 instructional hours.
3. FDACS/LIAS workflow.
4. Student Completion Documents portal.
5. Supplemental Obserra Course Completion Certificate with demonstration data.
6. Completion & Inspection Packets staff view and a representative printable packet.

Development screenshots must be labeled as previews. Controlled production screenshots should replace them before the guide is represented as final operational evidence.

## Current CI boundary

A prior Gate 17 build exposed a TypeScript `BodyInit` issue that was corrected with standards-compatible `Blob` handling. A later run exposed a brittle Gate 2 handoff-text assertion after consolidation; the validator was updated to recognize the consolidated handoff structure.

Do not call Gates 1-19 fully green until the current Florida workflow completes regulated source verification, repository tests, lint, and production Next.js build on the current implementation head.

CI success is source/build evidence only. It is not FDACS approval, production database promotion, runtime acceptance, or launch authorization.

## Next controlled sequence

1. Complete Gates 1-19 CI and correct any remaining source/type/lint/build defect.
2. Add school quality-management, retention-review, exception, and CAPA operational controls.
3. Promote regulated Supabase migrations through controlled production change/rollback/verification procedures.
4. Configure protected runtime settings, private document storage, and live-media production credentials.
5. Validate identity/enrollment, live media, attendance/time, examination, completion, documents, inspection packets, and LIAS end to end with controlled test identities.
6. Finalize the Division-approved exam bank before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with completion/certificate/inspection evidence and screenshots.
8. Replace development screenshot previews with controlled production evidence where applicable.
9. Complete security, accessibility, desktop/mobile, operational, inspection, recovery, and owner acceptance testing.
10. Keep payment/enrollment and regulated production functions disabled until applicable launch gates are accepted.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private credential evidence, or production secrets.

## Restart instruction

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing Florida Class D school/LMS work. Treat it as a regulated workstream separate from the commercial Academy Course 1-N build. Gates 1-19 are implemented in source on feature/florida-class-d-lms-foundation. Production activation and database/runtime promotion remain pending. Forty hours alone do not complete the course or earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion blockers, and authorized completion approval. After approval the LMS creates a protected supplemental Obserra completion certificate/application handoff; staff perform manual LIAS reporting; the official FDACS-16103 is accepted only after LIAS confirmation. Gate 19 adds protected completion/inspection packet export with sensitive-data exclusions and SHA-256 integrity. Continue from current Gates 1-19 CI validation, then school quality/retention/CAPA controls, controlled production/database preparation, and the revised DS submission guide with completion/certificate/inspection screenshots. Keep regulated launch functions fail closed until applicable authorization and production gates pass.
```
