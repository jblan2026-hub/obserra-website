# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 24 are implemented in source. The accepted Gate 24 source/build baseline is commit `cc6470b2466f68578d63884f646462a2ad65ac0c`.

The dedicated Florida Class D LMS workflow completed successfully on that commit. The green cycle includes the existing regulated source gates, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance verification, Gate 24 instructional text-screen verification, repository contract tests, lint, and the production Next.js build.

Gate 23, Non-Production Acceptance Evidence, includes protected acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, a real interactive staff console, and restricted acceptance-event runtime permissions.

Gate 24, Instructional Text-Screen Timing, is now implemented end to end in source. The regulated database calculates the minimum instructional text display duration using the 60-seconds-per-50-words rule, prorated by actual word count. Learner timing is tied to the authenticated learner and active device lease, visible-tab heartbeats feed server-observed timing evidence, acknowledgment is unavailable until the server-observed minimum is met, and the instructor must persist a live-discussion confirmation before closing the text screen.

No production database migration, production non-production-acceptance execution against real learner data, production learner text-screen evidence, or regulated launch activation has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Gate 23 acceptance domains

Gate 23 requires evidence across all 18 domains before an acceptance run can pass: identity and enrollment; live media; attendance and instructional time; presence challenges; regulatory observer access; make-up training; recorded make-up; final examination; remediation and retest; successful completion; completion documents; LIAS workflow; completion / inspection packet; quality and CAPA; retention; security headers; mobile and desktop behavior; and accessibility.

A run is not accepted when any required domain is missing, failed, blocked, or not run. Passed domain checks require a real evidence reference.

## Gate 24 audit requirement

The controlled DS LMS submission guide must include a screenshot of the implemented Gate 24 workflow. The evidence should show the instructional text, word count, server-calculated minimum duration, server-observed learner time, remaining or requirement-met state, learner acknowledgment boundary, and instructor discussion/closure control. Use demonstration or synthetic data unless an authorized production evidence procedure permits otherwise.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, Gate 23 acceptance evidence, and Gate 24 instructional text-screen timing. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Current unresolved production controls

Source/build validation is not production acceptance. Before regulated launch, remaining controlled work includes real non-production acceptance in an appropriately configured environment, production database-promotion evidence, protected runtime configuration, final examination-bank approval boundary, final DS submission-guide screenshots, production security review, and controlled owner/admin access readiness.

Several regulated server modules outside the Gate 23/24 services still contain hardcoded Supabase project URL fallbacks. These must be removed so production regulated modules require explicit protected HTTPS runtime configuration and do not publish unnecessary project identifiers.

## Next controlled sequence

1. Synchronize the master handoff, Gate 24 handoff, DS submission/audit control, and PR #56 with the green Gate 24 baseline.
2. Harden regulated runtime configuration by removing remaining hardcoded Supabase project URL fallbacks and requiring explicit protected environment configuration.
3. Add source verification for that runtime-isolation boundary and rerun the complete regulated workflow.
4. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
5. Finalize the Division-approved examination-bank boundary before production examination activation.
6. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
7. Prepare owner/admin LMS access using the authenticated Clerk role path without placing credentials or license numbers in source or chat.
8. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.

## Restart instruction

Resume from the green Gate 24 baseline `cc6470b2466f68578d63884f646462a2ad65ac0c`. Gate 24 is accepted as source/build evidence only. Continue with regulated runtime-isolation hardening and controlled non-production acceptance preparation. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a course-completion certificate for hours alone.