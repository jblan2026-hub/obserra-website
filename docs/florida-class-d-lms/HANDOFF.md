# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy Course 1 through Course N / LearnWorlds course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

Owner-reported licensing state: Florida Class DI instructor license active; Florida Class DS school application pending. Private license numbers, credential evidence, learner PII, protected exam content, FDACS/LIAS credentials, API keys, tokens, and production secrets must remain outside the public repository.

## Release boundary

Public paid enrollment, regulated learner access, production live instruction, production scheduling, production exam access, completion/certificate release, LIAS execution, observer access, and other regulated launch functions remain fail closed until the applicable regulatory and production gates pass.

No source, CI result, preview deployment, screenshot, submission draft, or test environment may be represented as FDACS approval.

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
- Forty instructional hours alone do not earn a completion certificate.

## Gate 1 — Foundation Controls

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Public Coming Soon state, five-day/40-hour architecture, all 18 curriculum areas, learning-check requirements, separate examination boundary, and no-approval/no-licensure-misrepresentation controls are implemented.

## Gate 2 — Regulated Student Record Model

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

The regulated model covers identity, enrollment, cohort assignment, attendance, instructional time, module progress, learning checks, remediation, live-session/device presence, audit history, role boundaries, and deterministic exam eligibility. Students cannot alter attendance credit, instructional credit, or exam eligibility.

## Gate 3 — Durable Regulated Records and Administrative APIs

**IMPLEMENTED IN SOURCE / DATABASE PROMOTION PENDING**

Supabase durable records, forced RLS, browser-role revocation, service-role-only regulated writes, idempotency, correlation IDs, append-only audit history, staff authorization, and inspection export are implemented. No migration is treated as production-applied until a controlled promotion/rollback/verification gate is completed.

## Gate 4 — Identity Verification and Regulated Enrollment

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Controlled pre-enrollment, legal-name/date-of-birth capture, identity-verification state, acknowledgments, cohort assignment, school/compliance review, and audit transitions are implemented without storing identity-document binaries in the public source tree.

## Gate 5 — Live Instructor Classroom, Presence, Interaction, Breaks and Time Evidence

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Live DI instruction, one-device lease, authenticated presence heartbeat, server-authoritative connected/instructional/break/uncredited time, cumulative learner time, security challenges and retry handling, live Q&A, hand raise, instructor prompts, and daily instructor attendance certification are implemented. Break time is retained but never credited as instruction.

## Gate 6 — Secure Embedded Live Video and Audio

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Daily Prebuilt private-room media is server brokered with short-lived room-scoped tokens, role-specific permissions, recording disabled by default, provider-native chat/hand raise disabled, and Obserra attendance/time evidence retained as the regulated system of record.

## Gate 7 — Temporary Regulatory Observer Access

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Temporary investigator/regulatory observer grants are one-session, short-lived, revocable, auditable, digest-stored, and **view-only**. Observer media cannot transmit camera/microphone, screen share, administer the room, use provider chat/hand raise, or access student records, exam content, credentials, or secrets.

## Gate 8 — Five-Day Cohort Scheduling and 20 Live Sessions

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Exactly five ordered training dates create exactly 20 timezone-aware 120-minute live sessions with 15-minute intervals after Lessons 1-3. Scheduling is staff controlled, separately feature gated, and blocked from revision after regulated live activity begins.

## Gate 9 — Structured Live Polls and Participation Analytics

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Structured 2-6 option live polls, one response per learner, optional server-side correctness, one open poll per live session, learner-safe payloads, instructor response counts, and participation analytics are implemented without exposing correct-answer data to the learner API.

## Gate 10 — Make-Up Training Workflow and Atomic Time Reconciliation

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Make-up assignments, student-to-DI questions, instructor responses, reconciliation preview, evidence references, 480-minute daily ceiling, 2,400-minute course ceiling, recorded-make-up ceiling, and atomic certification are implemented. Original attendance evidence is preserved rather than overwritten.

## Gate 11 — Protected Recorded Make-Up Delivery

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Recorded make-up is isolated from the normal live-course path and produces evidence rather than automatic credit. Controls include authenticated playback, one active device, server-authoritative timing, hidden-tab exclusion, forward-seek anomaly detection, presence challenges, protected media proxying, learner-to-DI questions, and instructor-review handoff.

## Gate 12 — Protected Final Examination Engine

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

The exam engine enforces 170 questions, 128 passing score, at least two hours separate from instruction, randomized online question delivery, per-subject true/false limits, protected answer-key storage, saved responses, and server-side scoring. Production exam start requires full instructional eligibility and a Division-approved bank status.

## Gate 13 — Protected Examination Bank Administration

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Server-only import, SHA-256 source traceability, exact 170-question validation, all 18 subject areas, per-subject true/false limits, protected answer keys, and controlled `draft` → `division_submitted` → `division_approved` lifecycle are implemented. The production question bank and answer key are not committed to public GitHub source.

## Gate 14 — Active Examination Monitoring

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Thirty-second exam heartbeat, one authenticated session/browser instance, durable monitoring events, visibility interruption, fail-closed answering/submission while interrupted, staff-authorized resume, documented invalidation, and examiner monitoring are implemented.

## Gate 15 — Failed-Exam Remediation and Retest Governance

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Failed attempts and scores are preserved. Documented remediation and staff authorization are required before a retest. Only one open retest authorization may exist per enrollment, authorization is consumed when the retest starts, and revocation is auditable. No unsupported waiting period or retest-count rule is invented.

## Gate 16 — Successful Completion Review

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Successful completion requires verified identity, all five qualifying 480-minute instructional days, at least 2,400 verified instructional minutes, all 18 curriculum areas/checks, closed remediation, a preserved passing exam attempt of at least 128/170, no unresolved completion blocker, and authorized compliance approval.

Approval snapshots the evidence, creates the controlled completion record, marks enrollment completed, and prepares the manual LIAS queue.

## Gate 17 — LIAS and Official Completion Documents

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Manual LIAS workflow, three-business-day deadline tracking, append-only prepared/submitted/confirmed/exception history, compliance-admin controls, confirmed-LIAS-only FDACS-16103 ingestion, private storage, PDF validation, SHA-256 integrity verification, authenticated learner download, application handoff, and inspection-ready post-course history are implemented.

The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS. Obserra does not synthesize or self-generate the official state form.

## Gate 18 — Protected Supplemental Certificate Presentation

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Supplemental Obserra certificate/application-handoff records are generated only from an authorized successful-completion record. The database and render path revalidate a preserved passing exam attempt at 128/170 or better before a supplemental certificate can be created or presented.

A learner who reaches 40 instructional hours but has not passed the final examination receives **no course-completion certificate**.

The supplemental certificate uses the learner's verified legal name and controlled completion facts, displays legal name, course title, 40 instructional hours, exam score, completion date, and a unique Obserra certificate ID, and states that it does not replace FDACS-16103 or issue a Class D license.

## Gate 19 — Completion / Inspection Packet

**IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

A protected staff-only completion/inspection packet consolidates enrollment, verified identity status/name, attendance, instructional time, live time, module progress, learning-check/remediation history where available, exam attempt history without questions/answers, successful completion, LIAS state/events, completion-document metadata, and audit history.

The packet explicitly excludes examination questions/answers, raw identity-document images, payment-card data, and authentication secrets. It receives a deterministic SHA-256 digest and supports protected printable HTML and JSON evidence export with restrictive response headers.

## Gate 20 — Quality, CAPA and Record Retention

**IMPLEMENTED IN SOURCE / CURRENT CI VALIDATION REQUIRED / PRODUCTION ACTIVATION DISABLED**

Gate 20 adds school quality-management and retention controls for incidents, complaints, attendance exceptions, exam exceptions, LIAS exceptions, security events, and quality findings. Cases carry severity, controlled status, investigation/action/verification history, corrective-action evidence, and verified closure requirements.

Retention controls keep the regulatory minimum separate from the school's longer operational retention policy, support legal holds, and intentionally do not perform automatic destruction. Retention review/disposition remains a human-controlled school operation.

Primary Gate 20 artifacts:

- `supabase/migrations/20260813085000_fdacs_class_d_quality_retention.sql`
- `lib/florida-class-d-quality.ts`
- `app/api/florida-class-d/admin/quality/route.ts`
- `app/florida-security-training/admin/quality/page.tsx`
- `app/florida-security-training/admin/quality/QualityConsole.tsx`
- `scripts/florida-class-d-quality-gate.mjs`
- `docs/florida-class-d-lms/GATE-20-QUALITY-CAPA-RETENTION-HANDOFF.md`

## Mandatory completion and certificate standard

**Forty instructional hours alone do not constitute successful completion and do not earn a certificate.**

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

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
7. Quality, CAPA & Record Retention console showing controlled findings, corrective action, legal hold, and retention-review state.

Development screenshots must be clearly labeled as previews. Controlled production screenshots should replace them before the guide is represented as final operational evidence.

## Current CI note

The current dedicated workflow targets **Gates 1-20 and website compatibility**. During handoff consolidation, several old source-gate tests exposed brittle exact-heading assertions. Gate 2 and Gate 3 were corrected to validate substantive consolidated-handoff controls. This handoff now preserves explicit gate headings through Gate 20 so legacy gate checks and current restart documentation remain aligned.

Gate 20 is not accepted until regulated source verification, repository tests, lint, and the production Next.js build all pass on the current head.

CI success is source/build evidence only. It is not regulatory approval, production database promotion, runtime acceptance, or launch authorization.

## Key current records

- `docs/florida-class-d-lms/HANDOFF.md`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `docs/florida-class-d-lms/GATE-17-LIAS-COMPLETION-DOCUMENTS-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-19-COMPLETION-PACKET-INSPECTION-HANDOFF.md`
- `docs/florida-class-d-lms/GATE-20-QUALITY-CAPA-RETENTION-HANDOFF.md`
- `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`
- `.github/workflows/florida-class-d-lms-gates.yml`

## Next controlled sequence

1. Complete Gates 1-20 CI and correct any remaining source/type/lint/build defect.
2. Add controlled production database migration planning, rollback manifests, and post-migration verification evidence.
3. Add production-readiness configuration validation for private storage, Supabase service-role access, Daily media, Clerk roles, DS/DI protected configuration, and all regulated feature flags.
4. Validate identity/enrollment, live media, attendance/time, presence, examination, completion, documents, inspection packets, quality/CAPA, retention, and LIAS end to end with controlled test identities.
5. Finalize the Division-approved exam bank before production examination activation.
6. Revise the Class DS LMS submission-guide DOCX/PDF with current completion/certificate/inspection/quality language and screenshot evidence.
7. Replace development screenshot previews with controlled production evidence where applicable.
8. Complete security, accessibility, desktop/mobile, operational, inspection, recovery, and owner acceptance testing.
9. Keep payment/enrollment and all regulated production functions disabled until applicable launch gates are accepted.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private instructor credential evidence, or production secrets.

## Restart instruction

```text
Read docs/florida-class-d-lms/HANDOFF.md before continuing Florida Class D LMS work. Resume from Gate 20 CI validation. Gates 1-20 are implemented in source; production activation and database/runtime promotion remain pending. Forty hours alone do not complete the course or earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required areas/checks, a passing 170-question exam at 128/170 or better, cleared completion blockers, and authorized completion approval. After approval the LMS creates the protected supplemental Obserra completion certificate/application-handoff record; staff perform manual LIAS reporting; the official FDACS-16103 is accepted only after LIAS confirmation. Gate 19 adds protected completion/inspection packets. Gate 20 adds quality/CAPA and human-controlled retention/legal-hold operations. Continue by making Gates 1-20 green, then controlled database/runtime production-readiness gates and revision of the DS submission guide with current screenshots. Keep all regulated public launch functions fail closed until applicable authorization and production gates pass.
```
