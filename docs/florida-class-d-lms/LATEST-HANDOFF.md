# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 24 are implemented in source. The accepted Gate 24 source/build baseline is commit `cc6470b2466f68578d63884f646462a2ad65ac0c`.

The dedicated Florida Class D LMS workflow completed successfully on that commit. The green cycle includes the existing regulated source gates, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance verification, Gate 24 instructional text-screen verification, repository contract tests, lint, and the production Next.js build.

Gate 23 includes protected non-production acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, a real interactive staff console, and restricted acceptance-event runtime permissions.

Gate 24 is implemented end to end in source. The regulated database calculates the minimum instructional text display duration using the 60-seconds-per-50-words rule, prorated by actual word count. Learner timing is tied to the authenticated learner and active device lease, visible-tab heartbeats feed server-observed timing evidence, acknowledgment is unavailable until the server-observed minimum is met, and the instructor must persist a live-discussion confirmation before closing the text screen.

Gate 25, Regulated Runtime Isolation, is **in progress**. `scripts/florida-class-d-runtime-isolation-audit.mjs` inventories regulated server modules for embedded Supabase project URLs and improper `NEXT_PUBLIC_*` secret-class environment names. `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md` defines the acceptance criteria and production boundary.

Gate 25 remediation has removed the hardcoded Supabase project fallback from `lib/florida-class-d-quality.ts`, `lib/florida-class-d-completion.ts`, `lib/florida-class-d-lias.ts`, `lib/florida-class-d-media.ts`, and `lib/florida-class-d-completion-documents.ts`. Those services now require explicit protected `OBSERRA_SUPABASE_URL` HTTPS runtime configuration and fail closed when required protected configuration is missing.

`lib/florida-class-d-live-persistence.ts` remains a known open remediation target because it still contains a hardcoded Supabase project fallback. Gate 25 is therefore not accepted and CI enforcement for the runtime-isolation audit is not yet enabled.

The Gate 2 historical handoff-heading assertion was corrected at `e25230665f6e264f21bbd9cdd264e411eceb3b83`. A subsequent run confirmed Gate 2 passes and then exposed the same legacy exact-heading dependency in the Gate 3 verifier. The authoritative `HANDOFF.md` has now restored the exact historical gate heading forms while preserving the current Gate 25 audit state, so a fresh validation cycle is required from the current head.

No production database migration, production acceptance execution against real learner data, production learner text-screen evidence, or regulated launch activation has occurred.

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

## Gate 25 security objective

Regulated `lib/florida-class-d*.ts` server modules must not embed Supabase project URLs and must not use public environment variables for secret-class configuration. Regulated persistence must fail closed when the explicit protected HTTPS Supabase URL or required service-role credential is absent. The Gate 23 acceptance service and Gate 24 text-screen service already follow this explicit-runtime pattern; remaining legacy regulated modules are being brought to the same boundary.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, Gate 23 acceptance evidence, and Gate 24 instructional text-screen timing. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Next controlled sequence

1. Re-run the dedicated Florida Class D workflow from the current head after the restored historical handoff headings.
2. Continue the Gate 25 runtime-isolation inventory and remediate every remaining regulated module with an embedded Supabase project URL fallback, especially live persistence.
3. Confirm all regulated services require explicit `OBSERRA_SUPABASE_URL` HTTPS configuration and protected server-side credentials.
4. Add Gate 25 enforcement to the dedicated Florida Class D CI workflow only after the inventory is clean.
5. Rerun Gates 1 through 25, repository tests, lint, and the production Next.js build and synchronize all audit handoffs to the actual green head.
6. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
7. Finalize the Division-approved examination-bank boundary before production examination activation.
8. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
9. Prepare owner/admin LMS access using the authenticated Clerk role path without placing credentials or license numbers in source or chat.
10. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.

## Restart instruction

Resume from `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`. Gate 24 remains the accepted source/build baseline at `cc6470b2466f68578d63884f646462a2ad65ac0c`; Gate 25 is in progress with quality, completion-review, LIAS, live-media, and completion-document runtime fallbacks remediated. Continue with live-persistence runtime isolation and the remaining regulated inventory. Do not call Gate 25 accepted until the inventory is clean and the enforcing CI cycle is green. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a course-completion certificate for hours alone.