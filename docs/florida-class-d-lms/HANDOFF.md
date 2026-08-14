# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13 20:53 ET

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

## Audit-preservation rule

The Gates 1-25 baseline language below is preserved from the exact five-green handoff contract at `af4247978c3b1b3aaac45ce7e15f321512cbf71c`. Historical status statements inside that preserved baseline are audit evidence of the accepted state at that time. The later **Current post-baseline state** section is the controlling current-state addendum and must be read together with the preserved baseline.

## Release boundary

Public paid enrollment, regulated learner access, production live instruction, production scheduling, production exam access, completion/certificate release, LIAS execution, observer access, database promotion, and runtime activation remain fail closed until the applicable regulatory and production gates pass.

No source, CI result, preview deployment, screenshot, submission draft, readiness report, or test environment may be represented as FDACS approval.

## Historical accepted source/build baseline

Gates 1 through 25 are implemented and green in source. The accepted Gate 25 source/build baseline is `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`.

Florida Class D LMS Gates run #367 completed successfully on that head, including regulated source verification, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance artifact verification, Gate 24 instructional text-screen verification, mandatory Gate 25 regulated runtime-isolation enforcement with zero findings, repository contract tests, lint/static quality validation, and the production Next.js build.

Website CI, Application Release Validation, and Application Production Pipeline also completed successfully on the same source head. The Academy 70x Production Gate failure recorded at that historical point was unrelated to this regulated Class D workstream.

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

## Historical CI note

The dedicated Florida Class D LMS workflow was green on `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`. Run #367 passed Gates 1 through 25, repository contract tests, lint/static validation, and production build. The exact later handoff checkpoint `af4247978c3b1b3aaac45ce7e15f321512cbf71c` was green across all five primary workflows: Florida Class D LMS Gates #400, Website CI #1942, Academy 70x Production Gate #1118, Application Release Validation #807, and Application Production Pipeline #826.

## Current unresolved production controls

No production database migration has been applied by this workstream. No production acceptance run has been executed against real learner data. No regulated launch function is authorized by these source gates.

The Division-approved examination-bank boundary remains a production activation prerequisite. The protected production exam question bank and answer key must not be committed to the public repository.

The configured non-production and production runtime environments, database promotion evidence, rollback evidence, final media/provider configuration, final regulatory submission evidence, owner/admin access procedure, and final production acceptance remain separate controlled work.

## Current post-baseline state

Current branch head at this handoff update: `5e702fe1c27a4149cc1eb8a2383a8a56108dde42`.

PR #56 remains open, mergeable, and unmerged at last direct verification.

### Gate 26 Production Activation Authorization

Gate 26 is now implemented in source and mandatory in the dedicated Florida Class D workflow. It adds a single server-side fail-closed production release boundary requiring exact release-candidate SHA binding, accepted Gate 23 UAT SHA matching that candidate, deployed Vercel Git SHA matching that candidate, production identity/database/media configuration, actual licensing state, database-promotion verification, examination-bank authorization, LIAS procedure verification, security acceptance, rollback verification, owner approval, and explicit final activation authorization.

Real learner enrollment, production live instruction, production scheduling, and student final-examination API execution are explicitly bound to Gate 26 plus their independent feature flags. Production remains fail closed.

### Mandatory high availability

High availability is mandatory across the complete production service chain. Gate 26 now requires verified evidence for edge/DNS, application runtime, identity, regulated database, live media, completion-document storage, commerce/payment dependency, observability, backup/restore, and end-to-end failover.

Controlled engineering thresholds are RTO of 60 minutes or less, RPO of 15 minutes or less, and end-to-end failover evidence no older than 90 days at activation. No HA status may be marked verified without authentic retained evidence.

### Gate 22 full regulated feature inventory

Gate 22 now inventories live instruction, media, scheduling, make-up, recorded make-up, exam, exam administration, completion review, LIAS workflow, completion documents, quality, pre-enrollment, and the Gate 26 production-activation authorization marker. These remain fail closed during readiness review.

### Current CI result requiring remediation

Florida Class D LMS Gates #415 ran against exact head `5e702fe1c27a4149cc1eb8a2383a8a56108dde42` and failed before Gate 26 execution in the existing Gate 3 persistence verifier. The failure was documentation-contract-only: `HANDOFF.md` no longer contained the exact verifier phrase `durable Supabase persistence/admin APIs`. Gate 26 and subsequent CI steps were skipped and therefore have not yet been accepted by CI on that head.

This file restores the complete five-green `af424...` handoff contract, including that exact Gate 3 phrase, while appending Gate 26 and HA as new current-state content. Run #415 remains retained as audit evidence and must not be relabeled green.

## Controlled Class DS filing baseline

The current private controlled filing set remains:

- LMS Guide DOCX v0.15.
- LMS Guide PDF v0.15, 43 pages.
- Submission Readiness Register v1.5, 6 pages.
- Controlled Pre-Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA-256: `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.

Curriculum SHA-256: `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.

Final examination SHA-256: `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

Do not edit controlled filing binaries without a new controlled revision, renewed render/preflight/integrity validation, updated hashes, and synchronized filing controls.

## Current deployment governance

Existing intended Vercel project remains `obserra-website-live`. Canonical registered domain remains `obserrallc.com`; public host remains `www.obserrallc.com`. Do not create another Vercel project, move the existing project, or change DNS as a workaround. Direct Vercel control-plane verification remains an open production-readiness item in the current connector context.

## Mandatory audit continuity

Every material LMS, FDACS, CI, UAT, Vercel, database, identity, media, examination, LIAS, filing, HA/recovery, security, or production-readiness action must be recorded with exact SHA or external object, result/evidence, workflow identifiers where applicable, production/regulatory effect, rollback state, unresolved blockers, and next governed action.

Historical gate-specific handoffs remain historical evidence. They must not be silently rewritten as current restart authority.

## Next controlled sequence

1. Rerun the complete Gates 1-26 workflow after this restored handoff contract.
2. Repair any remaining verifier regression without weakening existing controls.
3. Record final conclusions for all five primary workflows on the resulting exact head.
4. Continue production-grade Gate 26 integration and HA evidence preparation.
5. Reconcile the existing authoritative Vercel project without project movement or DNS change.
6. Close remaining Class DS filing controls.
7. Freeze the final production candidate and execute a new exact-candidate-bound Gate 23 18-of-18 synthetic UAT run.
8. Produce authentic HA/failover/recovery evidence for every production dependency.
9. Complete production database, identity, media, exam-bank, LIAS, commerce, observability, security, rollback, and owner-approval gates.
10. Do not activate regulated production functions until the Class DS license is actually issued and all final production gates pass.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, Clerk secrets, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md`, `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, `docs/florida-class-d-lms/GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`, `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`, and this handoff before continuing. Preserve the exact Gates 1-25 verifier-contract language above. Current Gate 26/HA state is in the post-baseline section. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a completion certificate for hours alone.
