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

Gates 1 through 24 are implemented in source. The current accepted Gate 24 source/build baseline is `cc6470b2466f68578d63884f646462a2ad65ac0c`.

The dedicated Florida Class D LMS workflow completed successfully on that commit, including regulated source verification, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance verification, Gate 24 instructional text-screen verification, repository contract tests, lint, and the production Next.js build.

Gate 25, Regulated Runtime Isolation, is now in progress. It is not yet an accepted gate and does not alter the accepted Gate 24 baseline.

This CI evidence establishes source/build compatibility only. It is not regulatory approval, production database promotion, production runtime activation, production acceptance, or launch authorization.

## Controlled Class D architecture

The implemented source architecture includes the five-day / 40-hour regulated course structure, 18 required curriculum areas, four 120-minute live lessons per day, non-credit tracked breaks, live instructor media, one-device attendance and presence controls, security challenges, Q&A and polling, controlled make-up and recorded make-up, a separate 170-question final examination with 128/170 passing threshold, remediation/retest governance, successful-completion review, LIAS workflow, completion documents, inspection evidence, quality/CAPA, retention controls, database/runtime readiness, non-production acceptance evidence, and protected instructional text-screen timing.

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

Primary Gate 24 artifacts include `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`, `lib/florida-class-d-text-screen.ts`, the protected learner and instructor live APIs, the learner `InstructionalTextScreen` component, the instructor `InstructionalTextScreenControl`, `scripts/florida-class-d-text-screen-gate.mjs`, and the dedicated Gates 1-24 workflow step.

### Gate 25

**IN PROGRESS / PARTIAL REMEDIATION COMPLETE / NOT ACCEPTED / PRODUCTION ACTIVATION DISABLED**

Gate 25 strengthens the regulated runtime isolation boundary. `scripts/florida-class-d-runtime-isolation-audit.mjs` inventories regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and improper `NEXT_PUBLIC_*` secret-class environment names. `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md` defines the acceptance criteria.

The Gate 23 acceptance service and Gate 24 text-screen service already require explicit protected Supabase runtime configuration without hardcoded project fallback URLs. Runtime-isolation remediation has now removed hardcoded Supabase fallbacks from `lib/florida-class-d-quality.ts`, `lib/florida-class-d-completion.ts`, `lib/florida-class-d-lias.ts`, `lib/florida-class-d-media.ts`, and `lib/florida-class-d-completion-documents.ts`. Those services now require an explicit protected `OBSERRA_SUPABASE_URL` HTTPS value and fail closed when required runtime configuration is absent.

`lib/florida-class-d-live-persistence.ts` remains a known open remediation target because its source still contains a hardcoded Supabase project fallback. Gate 25 will not be accepted until the runtime-isolation inventory is clean, enforcement is added to the required CI path, and the full regulated workflow remains green.

## Mandatory completion and certificate standard

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

Only after successful completion may the supplemental Obserra completion certificate/application-handoff record be generated. Authorized staff then complete the controlled LIAS workflow. The official FDACS-16103 remains a LIAS-generated Florida document and is not synthesized by Obserra.

Successful training completion and receipt of training documents do not themselves issue a Florida Class D license.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Screenshots must come from implemented screens and be labeled accurately as development, staging, UAT, or production evidence.

## Audit and screenshot control

The DS LMS submission guide must remain synchronized with implemented behavior and include accurately labeled screenshots of the completion review, no-certificate-before-pass boundary, LIAS workflow, student completion documents, supplemental certificate, completion/inspection packet, quality/CAPA/retention, database readiness, runtime readiness, Gate 23 acceptance evidence, and Gate 24 instructional text-screen timing.

The Gate 24 screenshot should show the instructional text, word count, server-calculated minimum duration, server-observed learner time, remaining or requirement-met state, learner acknowledgment boundary, and instructor discussion/closure control. Use demonstration or synthetic data unless an authorized production evidence procedure permits otherwise.

Real learner PII, protected exam content, credentials, license numbers, private provider values, service-role values, and sensitive infrastructure identifiers must not appear in public-source evidence.

## Current CI note

The dedicated Florida Class D LMS workflow is green on `cc6470b2466f68578d63884f646462a2ad65ac0c`. Website CI, Application Release Validation, and the Application Production Pipeline also completed successfully on that commit. The Academy 70x Production Gate failure is unrelated to this regulated Class D workstream.

Gate 25 commits after the accepted baseline are audit/hardening work in progress and must not be described as an accepted gate until their own full green cycle is established. The Gate 2 historical-heading compatibility assertion was corrected at `e25230665f6e264f21bbd9cdd264e411eceb3b83`; the current handoff also restores the exact historical gate heading forms expected by earlier verifiers.

## Current unresolved production controls

No production database migration has been applied by this workstream. No production acceptance run has been executed against real learner data. No regulated launch function is authorized by these source gates.

The current security hardening priority is to finish removing hardcoded Supabase project URL fallbacks from regulated server modules and require explicit protected HTTPS runtime configuration. This reduces unnecessary exposure of production infrastructure identifiers and strengthens the fail-closed runtime boundary.

The Division-approved examination-bank boundary also remains a production activation prerequisite. The protected production exam question bank and answer key must not be committed to the public repository.

## Next controlled sequence

1. Continue the Gate 25 runtime-isolation inventory and identify every remaining regulated module with an embedded Supabase project URL fallback.
2. Remove the remaining fallbacks, including live persistence, and require explicit `OBSERRA_SUPABASE_URL` HTTPS configuration plus protected server-side credentials.
3. Add Gate 25 enforcement to the dedicated Florida Class D CI workflow after remediation.
4. Rerun Gates 1 through 25, repository tests, lint, and the production Next.js build and synchronize audit evidence to the actual green head.
5. Execute controlled non-production acceptance with synthetic identities only after the applicable non-production database/runtime environment is configured.
6. Finalize the Division-approved examination-bank boundary before production exam activation.
7. Revise the controlled Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
8. Prepare owner/admin LMS access through the authenticated Clerk staff-role path without placing credentials, secrets, or license numbers in source or chat.
9. Keep payment/enrollment and all regulated production functions disabled until applicable authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, Clerk secrets, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md`, `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, `docs/florida-class-d-lms/GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`, `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`, and this handoff before continuing. Gate 24 remains the accepted source/build baseline at `cc6470b2466f68578d63884f646462a2ad65ac0c`. Gate 25 is in progress. Resume with the remaining runtime-isolation inventory and do not call Gate 25 accepted until the enforcing CI cycle is green. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a completion certificate for hours alone.