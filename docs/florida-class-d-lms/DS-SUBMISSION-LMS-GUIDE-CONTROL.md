# Obserra Class DS LMS Submission Guide Control Record

## Purpose

This record preserves the controlled scope of the supplemental LMS evidence package prepared for the Florida Class DS Security Officer School or Training Facility application for **Obserra Executive Protection & Intelligence LLC**.

The supplemental guide does not replace the training curriculum, final examination, or other supporting documents required by FDACS-16003. It explains the proposed online LMS delivery method, attendance controls, security controls, training methods, examination gating, completion standards, certificate controls, records, inspection readiness, quality/CAPA controls, retention governance, non-production acceptance, instructional text-screen timing, regulated runtime isolation, and FDACS/LIAS operating workflow.

## Controlled artifact

Document title: **Obserra Class DS Online LMS Training Delivery and Compliance Guide**

Current binary artifact version: **0.9 Submission Draft**

Prepared date: **August 13, 2026**

Current binary length: **52 pages**

Working artifact names:

- `Obserra_FDACS_Class_DS_LMS_Training_Delivery_and_Compliance_Guide_Submission_Draft.docx`
- `Obserra_FDACS_Class_DS_LMS_Training_Delivery_and_Compliance_Guide_Submission_Draft.pdf`

The generated binary artifacts are not committed to this public repository. Final submission copies must be handled as controlled regulatory records.

**Required next controlled revision:** the DOCX/PDF submission package must be revised before filing to incorporate the current completion/certification standard and the additional completion, LIAS, student-document, certificate, inspection-packet, quality/CAPA, retention, database/runtime readiness, Gate 23 acceptance, Gate 24 instructional text-screen, and accepted Gate 25 runtime-isolation evidence defined below. The repository standard in `STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md` is authoritative for completion/certification wording.

## Submission status

- Class DI instructor status is owner-reported active.
- Class DS school application is pending.
- The portal remains `COMING SOON / LMS IN PROGRESS` and regulated launch functions remain fail closed.
- The guide must not be represented as FDACS approval.
- Before final filing, controlled placeholders must be replaced with the actual DI license number, Florida physical training location, school contact data, final curriculum version, final examination version, and any other information required by the Division.

## Mandatory completion and certification standard

The submission guide, student materials, LMS notices, instructor materials, handbooks, syllabi, FAQs, and application instructions must all make the following distinction explicit:

- 40 verified instructional hours are required, but **40 hours alone do not constitute successful course completion**.
- A learner must also complete the required course activities, close required remediation, pass the separate 170-question final examination with at least 128 correct answers, have no unresolved completion-blocking issues, and receive school/compliance completion approval.
- A learner who has completed the 40 instructional hours but has not passed the final examination receives **no course-completion certificate** and remains in the controlled remediation/retest workflow.
- Only after a qualifying exam pass and successful-completion approval may the LMS create the learner-specific supplemental Obserra Course Completion Certificate and application-handoff record.
- The official **FDACS-16103 Certificate of Security Officer Training** is generated through LIAS after successful completion is reported. Obserra does not synthesize or self-generate the official state form.
- Successful course completion and receipt of training documents do not themselves issue a Florida Class D license.

The controlled supplemental certificate may contain the learner's verified legal name, course title, 40 instructional hours, final-examination score, completion date, and unique certificate/reference identifier. Sensitive identity evidence, raw identity-document data, examination answers, and secrets must not be placed on the student-facing certificate.

## Guide contents

The controlled guide must cover the five-day/40-hour schedule, all 18 curriculum areas, live instructional methods, secure enrollment and identity verification, attendance/timekeeping, breaks, security challenges, regulated text-screen timing and instructor discussion, Q&A, learning checks, remediation, permitted make-up training, the separate final examination, successful-completion review, certificate issuance sequence, records/inspection readiness, FDACS/LIAS workflow, student application handoff, security/privacy, quality/CAPA, retention/legal-hold governance, database/runtime readiness, non-production acceptance evidence, regulated runtime isolation, change control, evidence screenshots, the online compliance matrix, submission checklist, pre-launch status, operating checklists, controlled records, and final submission update fields.

## Current portal screenshot inventory

The current 0.9 guide embeds nine controlled development screenshots using demonstration data:

1. Public Florida Security Training portal showing Coming Soon state and locked enrollment.
2. Student live classroom showing instructor media, independent time ledger, presence status, and Q&A.
3. Student presence/security challenge and retry workflow.
4. Scheduled 15-minute break state with break time separate from instructional credit.
5. Instructor live console with roster, cumulative time, presence code, and student questions.
6. Identity verification and regulated enrollment administration.
7. Daily instructor attendance reconciliation and certification.
8. Inspection/audit center for immediate production of regulated training records.
9. Controlled final-examination eligibility gate.

## Required screenshots for the next submission-guide revision

The next controlled DOCX/PDF revision must add implemented evidence showing the complete post-instruction, school-operations, readiness, acceptance, text-screen, and runtime-isolation workflow:

10. **Completion Review Console:** 2,400 verified minutes, five qualifying 480-minute days, all 18 curriculum areas/learning checks, passing examination evidence, unresolved-issue checks, and authorized completion approval.
11. **Passing Examination / Completion Boundary:** the **no-certificate-before-pass boundary**, visually showing that a learner at 40 instructional hours receives no certificate until the 170-question examination is passed at 128/170 or better.
12. **FDACS / LIAS Completion Workflow:** prepared, submitted, confirmed, exception handling, reporting due date, and the manual/no-scraping control boundary.
13. **Student Completion Documents Portal:** official FDACS-16103, supplemental Obserra certificate, application instructions, and the distinction between successful training completion and state licensure.
14. **Supplemental Obserra Course Completion Certificate:** learner-specific certificate rendered only after successful completion, showing demonstration legal name, course title, 40 instructional hours, exam score, completion date, unique certificate ID, and the supplemental/not-a-license disclaimer.
15. **Completion & Inspection Packets:** protected staff view showing printable and JSON packet export, with attendance, instructional time, exam-result history, completion, LIAS, completion-document metadata, and audit evidence while excluding exam questions/answers and raw identity documents.
16. **Quality, CAPA & Record Retention:** protected staff view showing a demonstration quality/exception case, severity/workflow state, corrective-action and verification controls, the separate two-year regulatory minimum and three-year operational retention dates, next-review date, and legal-hold status. The screenshot must make clear that actual record destruction is not automated.
17. **Database Promotion Readiness:** controlled migration inventory, backup/recovery requirement, preflight state, RLS/service-role review, rollback or compensating-change plan, post-migration verification plan, and regulated feature flags remaining disabled.
18. **Protected Runtime Readiness:** staff-only readiness view showing configuration-presence status for identity, database, live media, licensing, document storage, and regulated feature flags without exposing secret values, license numbers, provider credentials, project identifiers, or private bucket names.
19. **Gate 23 Non-Production Acceptance Evidence:** the implemented staff acceptance console showing a real development, sandbox, staging, or UAT acceptance run tied to a release commit and synthetic test identity; all 18 required acceptance domains; evidence/status recording; aggregate passed-domain progress; and the controlled finalization boundary. The screenshot must identify the actual non-production environment and must not be represented as production acceptance or FDACS approval.
20. **Gate 24 Instructional Text-Screen Timing:** the implemented learner and instructor workflow showing instructional text content, word count, server-calculated minimum duration using the 60-seconds-per-50-words policy, server-observed learner timing, remaining or requirement-met state, learner acknowledgment only after the minimum is met, instructor review of learner timing/acknowledgment evidence, and documented instructor discussion before controlled closure.
21. **Gate 25 Regulated Runtime Isolation Evidence:** controlled CI/audit evidence from accepted source/build head `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` and Florida Class D LMS Gates run #367 showing the mandatory Gate 25 enforcement step passed with zero regulated runtime-isolation findings, followed by passing repository tests, static quality validation/lint, and the production Next.js build. The evidence must not display the configured runtime URL, project identifier, service-role credential, provider secret, license number, learner PII, or other protected runtime information.

All screenshots must use demonstration or synthetic data only unless a separately authorized production evidence procedure applies. Final production screenshots must replace development previews where final operational evidence is required and must never expose learner PII, protected exam content, license numbers, credentials, provider secrets, service-role values, or sensitive infrastructure information.

## Gate 23 acceptance control documented

Gate 23 has a full green source/build baseline. The current source includes the real interactive staff acceptance console, the protected school/compliance acceptance API, explicit protected database runtime configuration, and a follow-on acceptance-event permission migration that restricts the regulated runtime role to read and append operations on the acceptance event ledger.

Acceptance is limited to development, sandbox, staging, or UAT and uses synthetic identities. All 18 required domains must pass before database-controlled finalization succeeds. A failed, blocked, missing, or not-run domain prevents acceptance. Passed checks require an evidence reference.

No production acceptance execution or production database migration has occurred.

## Gate 24 instructional text-screen control documented

Gate 24 is implemented end to end in source and remains part of the accepted Gate 25 source/build baseline.

The regulated text-screen control calculates the minimum duration using controlled server/database logic from actual word count at 60 seconds per 50 words, prorated by word count. The learner cannot supply the authoritative duration. Learner timing is tied to the authenticated learner and active regulated device lease. The learner interface sends timing heartbeats only while the browser tab is visible and shows server-observed progress. The acknowledgment control remains unavailable until the server-observed minimum is satisfied.

Only one instructional text screen may be open for a live session. Opening is restricted to active instruction rather than break state. The instructor console can create the screen, review aggregate learner progress, document the live discussion, and request closure. The database requires the discussion confirmation before closure and does not fabricate missing learner acknowledgments.

The Gate 24 verifier, repository tests, lint, and production Next.js build are green in the accepted Gate 25 regulated cycle. This is source/build evidence only and is not FDACS approval or production acceptance.

## Gate 25 regulated runtime-isolation control documented

Gate 25 is **accepted as a source/build security control** at commit `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` based on Florida Class D LMS Gates run #367.

The runtime-isolation audit is a mandatory enforcing step in the dedicated regulated workflow. It scans regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and secret-class configuration exposed through `NEXT_PUBLIC_*` names. Regulated services are required to use explicit protected HTTPS runtime configuration and protected server-side service-role credentials rather than repository-embedded project fallbacks.

The final remediation removed every embedded project URL fallback identified by the enforcing inventory, including the remaining make-up administration, regulatory observer-access, and recorded make-up modules. Run #367 passed the Gate 25 enforcement with zero findings and then passed repository contract tests, static quality validation/lint, and the production Next.js build.

Gate 25 acceptance does **not** constitute production database promotion, production runtime activation, production acceptance, LIAS production execution, regulated launch approval, or FDACS approval. Regulated feature flags remain fail closed until their separate production and regulatory gates are satisfied.

## Quality, CAPA, and retention controls documented

The controlled guide must explain that school quality and records operations are controlled records rather than informal notes. The LMS architecture supports incident, complaint, exception, security-event, and quality cases; severity; investigation; root cause; corrective and preventive action; verification; closure; append-only case-event history; audit evidence; and protected school/compliance administration.

Retention documentation must keep the applicable regulatory minimum distinct from the school's longer operational retention policy. The current design records a two-year regulatory minimum and a separate three-year operational target. Legal holds prevent disposition eligibility. Actual disposition/destruction is not automated by the LMS and remains a separately authorized human action after applicable requirements and preservation obligations are satisfied.

## Regulatory and workflow control points documented

The guide must document live simultaneous DI instruction, Florida physical training location, investigator live access when required, secure website transport, photo-ID identity verification, daily digital attendance, single-device control, recurring security challenges with retry handling, text-screen timing and instructor discussion, learner-to-DI questions, controlled recorded make-up instruction, randomized online examination questions, completion verification before reporting, separate 40 instructional hours and examination time, the no-certificate-before-pass rule, authorized completion review, supplemental-certificate controls, manual LIAS reporting, official FDACS-16103 handling, protected learner document delivery, completion/inspection packets, quality/CAPA, retention/legal holds, database/runtime readiness, non-production acceptance, runtime isolation, and inspection readiness.

## Student-material publication rule

The completion/certification standard must appear in enrollment acknowledgments, the student handbook and syllabus, LMS orientation, Day 1 introduction, attendance/timekeeping explanation, final-examination instructions, remediation/retest instructions, course-status/completion screen, completion-document portal, Class D application instructions, FAQs/support scripts, and the instructor completion checklist.

No student material may state or imply that a certificate is automatically earned when the 40th instructional hour is recorded.

## Suggested packet position

Recommended DS application package organization:

1. FDACS-16003 application and required fees.
2. Required Class D training curriculum.
3. Required final examination.
4. Proof of fictitious name filing, if applicable.
5. **Exhibit C - Online LMS Training Delivery, Attendance, Security, Completion, Certification, Recordkeeping, Quality, Retention, Readiness, Acceptance, Text-Screen Timing, Runtime Isolation, and Inspection Controls** using this guide.

## Production evidence rule

Source/build validation and development screenshots do not constitute regulatory approval or production acceptance. Before the guide is converted from submission draft to final operational evidence, the school must capture final production evidence after applicable regulatory authorization, database promotion, media-provider configuration, identity/enrollment workflow, attendance/time controls, instructional text-screen controls, examination engine, completion review, certificate/document workflow, completion-packet/inspection center, quality/CAPA and retention operations, runtime-isolation verification, and LIAS procedures have been validated.

The Gate 23 non-production acceptance screenshot remains non-production evidence by design. It may demonstrate the school's controlled acceptance method but must never be relabeled as production acceptance. Any unresolved production dependency must be stated as unresolved rather than inferred or represented as complete.

## Current audit baseline

For repository audit traceability, the accepted Gate 25 source/build baseline is `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`, validated by Florida Class D LMS Gates run #367. The dedicated regulated cycle passed Gates 1 through 25, repository contract tests, static quality validation/lint, and the production Next.js build. This baseline does not authorize production activation or represent FDACS approval.
