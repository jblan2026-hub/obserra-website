# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy Course 1 through Course N / LearnWorlds course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

Owner-reported licensing state: Florida Class DI instructor license active; Florida Class DS school application pending. Private license numbers and credential evidence must remain outside the public repository.

## Release boundary

Public paid enrollment, regulated learner access, production live instruction, production scheduling, production exam access, completion/certificate release, LIAS execution, observer access, and other regulated launch functions remain fail closed until the applicable regulatory and production gates pass.

No source, CI result, preview deployment, screenshot, or submission draft may be represented as FDACS approval.

## Controlled Class D architecture

- Five instructional days.
- Forty credited instructional hours / 2,400 verified instructional minutes.
- 480 verified instructional minutes per qualifying day.
- Eighteen required curriculum areas.
- Four live 120-minute lessons per day.
- Fifteen-minute breaks after Lessons 1, 2, and 3 each day.
- Break time is tracked but receives zero instructional credit.
- Separate 170-question final examination.
- Passing threshold is at least 128/170.
- Course completion is not issuance of a Florida Class D license.

## Current implementation state through Gate 19

### Gates 1-4

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Foundation and public fail-closed controls, regulated student records, durable Supabase persistence/admin APIs, identity verification, and regulated enrollment are implemented. Production database promotion remains a separate controlled change with rollback and verification evidence.

### Gates 5-8

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Live instructor classroom, single-device presence, server-authoritative connected/instructional/break/uncredited time, cumulative learner time, presence/security challenges, Q&A and interaction, daily instructor attendance certification, secure Daily media, temporary view-only regulatory observer access, and exact five-day/20-session cohort scheduling are implemented.

### Gates 9-11

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Structured polls and participation evidence, make-up assignment with atomic credit reconciliation, and protected recorded make-up with time/presence/anti-seek/instructor-review controls are implemented.

### Gates 12-15

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Protected 170-question examination architecture, minimum two-hour exam duration, randomized delivery, 128/170 passing threshold, protected exam-bank administration, Division-approval status boundary, active exam monitoring, one-session/one-device enforcement, interruption/resume controls, auditable invalidation, failed-attempt preservation, remediation, and controlled retest authorization are implemented.

### Gate 16 - Successful Completion Review

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Successful completion requires verified identity, all five qualifying 480-minute instructional days, at least 2,400 verified instructional minutes, all 18 curriculum areas/checks, closed remediation, a preserved passing exam attempt of at least 128/170, no unresolved completion blocker, and authorized compliance approval.

Approval snapshots the evidence, creates the controlled completion record, marks enrollment completed, and prepares the manual LIAS queue.

### Gate 17 - LIAS and Official Completion Documents

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Manual LIAS workflow, three-business-day deadline tracking, append-only prepared/submitted/confirmed/exception history, compliance-admin controls, confirmed-LIAS-only FDACS-16103 ingestion, private storage, PDF validation, SHA-256 integrity verification, authenticated learner download, application handoff, and inspection-ready post-course history are implemented.

The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS. Obserra does not synthesize or self-generate the official state form.

### Gate 18 - Protected Supplemental Certificate Presentation

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Supplemental Obserra certificate/application-handoff records are generated only from an authorized successful-completion record. The database independently verifies the preserved final exam attempt is passed and scored at least 128 before any supplemental completion document is created.

A learner who reaches 40 instructional hours but has not passed the final examination receives **no course-completion certificate**.

Protected server-side rendering uses the learner's verified legal name and controlled completion facts. Dynamic values are escaped. The supplemental certificate displays legal name, course title, 40 instructional hours, exam score, completion date, and a unique Obserra certificate ID, and states that it does not replace FDACS-16103 or issue a Class D license.

### Gate 19 - Completion / Inspection Packet

**IMPLEMENTED IN SOURCE / CURRENT CI VALIDATION REQUIRED / PRODUCTION ACTIVATION DISABLED**

Gate 19 consolidates a completed learner's regulated evidence into one protected staff-only packet for operational review, inspection readiness, and controlled export.

Implemented controls include:

- school-admin or compliance-admin authorization;
- server-only service-role packet assembly;
- enrollment and verified learner identity status/name;
- attendance records;
- instructional-time evidence;
- live-time totals;
- module progress;
- learning-check and remediation history where available;
- examination attempt history without examination questions or answers;
- successful-completion record;
- LIAS workflow state and event history;
- completion-document metadata;
- append-only audit history;
- explicit exclusion of exam questions/answers, raw identity-document images, payment-card data, and authentication secrets;
- deterministic SHA-256 packet digest over canonicalized packet content;
- printable protected HTML view and downloadable JSON evidence record;
- HTML escaping of dynamic values;
- restrictive private/no-store/noindex/nosniff/frame-denial/referrer/CSP response headers.

Primary Gate 19 artifacts:

- `lib/florida-class-d-completion-packet.ts`
- `app/api/florida-class-d/admin/completion-packet/route.ts`
- `app/florida-security-training/admin/completion-packets/page.tsx`
- `scripts/florida-class-d-completion-packet-gate.mjs`
- `docs/florida-class-d-lms/GATE-19-COMPLETION-PACKET-INSPECTION-HANDOFF.md`

## Mandatory completion and certificate standard

**Forty instructional hours alone do not constitute successful completion and do not earn a certificate.**

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school approval.

After approval, the LMS creates the protected supplemental Obserra completion certificate/application-handoff record. Authorized staff complete the official LIAS reporting workflow. The official FDACS-16103 is released to the learner portal only after LIAS confirmation and protected ingestion.

Authoritative student-facing standard:

`docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`

## Class DS submission guide and screenshots

Control record:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The next controlled DOCX/PDF revision must include development-preview screenshots of:

1. Completion Review Console.
2. A learner at 40 instructional hours who remains certificate-ineligible until the final exam is passed.
3. FDACS/LIAS prepared/submitted/confirmed/exception workflow.
4. Student Completion Documents portal.
5. Supplemental Obserra Course Completion Certificate using demonstration data.
6. Completion & Inspection Packets staff view and representative printable packet.

Development screenshots must be clearly labeled as previews. Controlled production screenshots should replace them before the guide is represented as final operational evidence.

## Current CI note

A prior Gate 17 build exposed a TypeScript `BodyInit` issue in protected document upload and was corrected with standards-compatible `Blob` handling. A subsequent Gate 18 run exposed a brittle Gate 2 handoff text assertion after the master handoff was consolidated; the Gate 2 validator was updated to validate the consolidated handoff semantically rather than depend on an obsolete exact heading.

The current Gates 1-19 head must complete regulated source verification, repository tests, lint, and production Next.js build before Gate 19 is called fully green.

CI success is source/build evidence only. It is not regulatory approval, production database promotion, runtime acceptance, or launch authorization.

## Key current records

- `docs/florida-class-d-lms/HANDOFF.md`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `docs/florida-class-d-lms/GATE-17-LIAS-COMPLETION-DOCUMENTS-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-19-COMPLETION-PACKET-INSPECTION-HANDOFF.md`
- `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`
- `.github/workflows/florida-class-d-lms-gates.yml`

## Next controlled sequence

1. Complete current Gates 1-19 CI and correct any remaining source/type/lint/build defect.
2. Add school quality-management, record-retention review, and exception/CAPA operational controls.
3. Promote regulated Supabase migrations only through controlled production change/rollback/verification procedures.
4. Configure protected runtime settings, private document storage, and live-media production credentials.
5. Validate identity/enrollment, live media, attendance/time, presence, examination, completion, documents, inspection packets, and LIAS end to end with controlled test identities.
6. Finalize the Division-approved exam bank before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with current completion/certificate/inspection language and screenshot evidence.
8. Replace development screenshot previews with controlled production evidence where applicable.
9. Complete security, accessibility, desktop/mobile, operational, inspection, recovery, and owner acceptance testing.
10. Keep payment/enrollment and all regulated production functions disabled until applicable launch gates are accepted.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private instructor credential evidence, or production secrets.

## Restart instruction

```text
Read docs/florida-class-d-lms/HANDOFF.md before continuing Florida Class D LMS work. Resume from Gate 19. Gates 1-19 are implemented in source; production activation and database/runtime promotion remain pending. Forty hours alone do not complete the course or earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion blockers, and authorized completion approval. After approval the LMS creates the protected supplemental Obserra completion certificate/application-handoff record; staff perform manual LIAS reporting; the official FDACS-16103 is accepted only after LIAS confirmation. Gate 19 adds protected staff-only completion/inspection packets with printable HTML, JSON evidence, sensitive-data exclusions, and a SHA-256 packet digest. Continue from current Gates 1-19 CI validation, then school quality/retention/CAPA controls, controlled production/database preparation, and revision of the DS submission guide with completion/certificate/inspection screenshots. Keep regulated public launch functions fail closed until applicable authorization and production gates pass.
```
