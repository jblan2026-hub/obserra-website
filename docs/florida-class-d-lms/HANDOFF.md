# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

## Release boundary

Public paid enrollment, regulated learner access, production live instruction, production scheduling, production exam access, completion/certificate release, LIAS execution, observer access, database promotion, and runtime activation remain fail closed until the applicable regulatory and production gates pass.

No source, CI result, preview deployment, screenshot, submission draft, readiness report, or test environment may be represented as FDACS approval.

## Current accepted source/build baseline

Gates 1 through 25 are implemented and green in source. The current accepted Gate 25 source/build baseline is `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`.

Florida Class D LMS Gates run #367 completed successfully on that head, including regulated source verification, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance artifact verification, Gate 24 instructional text-screen verification, mandatory Gate 25 regulated runtime-isolation enforcement with zero findings, repository contract tests, lint/static quality validation, and the production Next.js build.

Website CI, Application Release Validation, and Application Production Pipeline also completed successfully on the same source head. The Academy 70x Production Gate failure is unrelated to this regulated Class D workstream.

This CI evidence establishes source/build compatibility only. It is not regulatory approval, production database promotion, production runtime activation, production acceptance, or launch authorization.

## Controlled Class D architecture

The implemented source architecture includes the five-day / 40-hour regulated course structure, 18 required curriculum areas, four 120-minute live lessons per day, non-credit tracked breaks, live instructor media, one-device attendance and presence controls, security challenges, Q&A and polling, controlled make-up and recorded make-up, a separate 170-question final examination with 128/170 passing threshold, remediation/retest governance, successful-completion review, LIAS workflow, completion documents, inspection evidence, quality/CAPA, retention controls, database/runtime readiness, non-production acceptance evidence, protected instructional text-screen timing, and enforced regulated runtime isolation.

Forty instructional hours alone do not complete the course and do not earn a completion certificate.

### Gates 1-4

Foundation, regulated student records, durable Supabase persistence/admin APIs, identity verification, acknowledgments, cohort assignment, and regulated enrollment are implemented in source. Production activation and database promotion remain disabled.

### Gates 5-8

Live instructor classroom, one-device presence, server-authoritative time evidence, security challenges, daily attendance certification, secure Daily media, temporary view-only observer access, and exact five-day/20-session scheduling are implemented in source.

### Gates 9-11

Structured live polls/participation analytics, controlled make-up assignment and atomic credit reconciliation, and protected recorded make-up delivery/evidence are implemented in source.

### Gates 12-15

Protected final examination, exam-bank administration, active monitoring, interruption/resume/invalidation, failed-attempt preservation, remediation, and controlled retest authorization are implemented in source.

### Gates 16-20

Successful-completion review, LIAS workflow, supplemental completion-document handling, student completion-document presentation, completion/inspection packets, school quality/CAPA, retention, and legal-hold controls are implemented in source.

### Gate 21

Controlled database-promotion readiness is implemented. It inventories regulated migrations, requires backup/recovery and preflight evidence, preserves rollback or forward-compensating-change planning, requires post-migration verification, and keeps regulated feature flags disabled during promotion review. Gate 21 does not apply production migrations.

### Gate 22

Protected runtime readiness is implemented. It checks configuration presence for identity, database, Daily media, licensing, private document storage, and regulated feature flags while suppressing secret values. A green readiness report does not activate regulated functions.

### Gate 23

Non-production acceptance evidence is implemented. Acceptance is limited to development, sandbox, staging, or UAT and requires a release commit, explicit synthetic-identity confirmation, and evidence across 18 required domains. The staff console supports creating runs, recording evidence/status, reviewing aggregate progress, and requesting fail-closed database finalization. Missing, failed, blocked, or not-run domains prevent acceptance. The acceptance event ledger runtime role is restricted from update, delete, and truncate operations.

### Gate 24

Instructional text-screen timing is implemented end to end in source.

The regulated database and protected service calculate the authoritative minimum display duration from actual word count using the established 60-seconds-per-50-words rule, prorated by word count. Learner timing is tied to the authenticated learner and active device lease. The learner UI sends timing heartbeats only while the browser tab is visible, displays server-observed timing evidence, and prevents acknowledgment until the authoritative minimum has been satisfied.

Only one instructional text screen may be open for a live session. Opening is restricted to active instruction rather than break state. The instructor console can create the screen, review learner timing and acknowledgment progress, document the required live discussion, and request controlled closure. The database requires the discussion confirmation before closure and does not fabricate missing learner acknowledgments.

Primary Gate 24 artifacts include `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`, `lib/florida-class-d-text-screen.ts`, the protected learner and instructor live APIs, the learner `InstructionalTextScreen` component, the instructor `InstructionalTextScreenControl`, `scripts/florida-class-d-text-screen-gate.mjs`, and the dedicated workflow step.

### Gate 25

**ACCEPTED SOURCE/BUILD BASELINE / ENFORCEMENT ACTIVE / ZERO FINDINGS / PRODUCTION ACTIVATION DISABLED**

Gate 25 strengthens the regulated runtime-isolation boundary. `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce` is mandatory in the dedicated Florida Class D workflow and inventories regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and improper `NEXT_PUBLIC_*` secret-class environment names.

The remediation removed every embedded Supabase project URL fallback identified by the enforcing inventory. Regulated persistence and service modules now require explicit protected `OBSERRA_SUPABASE_URL` HTTPS configuration and protected server-side credentials. Missing or invalid protected runtime configuration fails closed; service-role credentials are not exposed to regulated browser components.

Florida Class D LMS Gates run #367 on `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` passed the mandatory Gate 25 enforcement with zero findings and then completed repository contract tests, static quality validation/lint, and the production Next.js build successfully.

Gate 25 acceptance does not authorize production activation, public enrollment, database promotion, LIAS production execution, certificate release, or any representation of FDACS approval.

## Mandatory completion and certificate standard

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

Only after successful completion may the supplemental Obserra completion certificate/application-handoff record be generated. Authorized staff then complete the controlled LIAS workflow. The official FDACS-16103 remains a LIAS-generated Florida document and is not synthesized by Obserra.

Successful training completion and receipt of training documents do not themselves issue a Florida Class D license.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Screenshots must come from implemented screens and be labeled accurately as development, staging, UAT, or production evidence.

## Audit and screenshot control

The DS LMS submission guide must remain synchronized with implemented behavior and include accurately labeled screenshots of the completion review, no-certificate-before-pass boundary, LIAS workflow, student completion documents, supplemental certificate, completion/inspection packet, quality/CAPA/retention, database readiness, runtime readiness, Gate 23 acceptance evidence, Gate 24 instructional text-screen timing, and Gate 25 runtime-isolation evidence.

The Gate 24 screenshot should show the instructional text, word count, server-calculated minimum duration, server-observed learner time, remaining or requirement-met state, learner acknowledgment boundary, and instructor discussion/closure control. Gate 25 evidence should show the enforcing workflow/result without exposing protected runtime values. Use demonstration or synthetic data unless an authorized production evidence procedure permits otherwise.

Real learner PII, protected exam content, credentials, license numbers, private provider values, service-role values, and sensitive infrastructure identifiers must not appear in public-source evidence.

## Current CI note

The dedicated Florida Class D LMS workflow is green on `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`. Run #367 passed Gates 1 through 25, repository contract tests, lint/static validation, and production build. Website CI, Application Release Validation, and Application Production Pipeline also completed successfully on that head. The Academy 70x Production Gate failure is unrelated to this regulated Class D workstream.

## Current unresolved production controls

No production database migration has been applied by this workstream. No production acceptance run has been executed against real learner data. No regulated launch function is authorized by these source gates.

The Division-approved examination-bank boundary remains a production activation prerequisite. The protected production exam question bank and answer key must not be committed to the public repository.

The configured non-production and production runtime environments, database promotion evidence, rollback evidence, final media/provider configuration, final regulatory submission evidence, owner/admin access procedure, and final production acceptance remain separate controlled work.

## Next controlled sequence

1. Execute controlled non-production acceptance with synthetic identities only after the applicable non-production database/runtime environment is configured.
2. Validate the Division-approved examination-bank boundary before production exam activation.
3. Revise the controlled Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens, including final Gate 25 evidence.
4. Prepare owner/admin LMS access through the authenticated Clerk staff-role path without placing credentials, secrets, or license numbers in source or chat.
5. Prepare production-promotion evidence, rollback/verification artifacts, and environment configuration without applying production changes until separately authorized.
6. Keep payment/enrollment and all regulated production functions disabled until applicable authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, Clerk secrets, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md`, `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, `docs/florida-class-d-lms/GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`, `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`, and this handoff before continuing. Gate 25 is the accepted source/build baseline at `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`. Continue with controlled non-production runtime acceptance, production-readiness evidence, the examination-bank authorization boundary, submission-guide evidence updates, and owner/admin access preparation. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a completion certificate for hours alone.
