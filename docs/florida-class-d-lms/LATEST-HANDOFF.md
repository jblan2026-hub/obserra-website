# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 24 are implemented in source. The accepted Gate 24 source/build baseline remains commit `cc6470b2466f68578d63884f646462a2ad65ac0c`.

Gate 23 includes protected non-production acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, a real interactive staff console, and restricted acceptance-event runtime permissions.

Gate 24 is implemented end to end in source. The regulated database calculates the minimum instructional text display duration using the 60-seconds-per-50-words rule, prorated by actual word count. Learner timing is tied to the authenticated learner and active device lease, visible-tab heartbeats feed server-observed timing evidence, acknowledgment is unavailable until the server-observed minimum is met, and the instructor must persist a live-discussion confirmation before closing the text screen.

Gate 25, Regulated Runtime Isolation, is **in progress and actively enforced**. `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce` is a required step in the dedicated Florida Class D workflow `Gates 1-25 and website compatibility`. It scans regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and improper `NEXT_PUBLIC_*` secret-class environment names and fails the workflow whenever findings remain.

The runtime-isolation remediation has removed hardcoded Supabase project URL fallbacks from the regulated acceptance, completion, completion-documents, completion-packet, examination, examination administration, examination monitoring, examination retest, LIAS, live feed, live persistence, live reporting, live media, base persistence, polls, quality/CAPA, scheduling, student-certificate, and make-up certification services. These modules now require explicit protected `OBSERRA_SUPABASE_URL` HTTPS runtime configuration and fail closed when required configuration is absent.

Florida Class D LMS Gates run #362 on `f7bcd95158e9077aed89ab000862e70b1cbb7d9d` passed Gates 1 through 24 and then failed intentionally at Gate 25 because the enforcing inventory found exactly three regulated files: `lib/florida-class-d-makeup.ts`, `lib/florida-class-d-observer.ts`, and `lib/florida-class-d-recorded-makeup.ts`. No public secret-class `NEXT_PUBLIC_*` findings were reported. Attempts to remove those three remaining embedded fallbacks through the GitHub connector have been blocked by the connector safety layer, so they must not be represented as completed.

No production database migration, production runtime activation, real-learner acceptance execution, LIAS production execution, or regulated launch activation has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Gate 25 security objective

Regulated `lib/florida-class-d*.ts` server modules must not embed Supabase project URLs and must not use public environment variables for secret-class configuration. Regulated persistence must fail closed when the explicit protected HTTPS Supabase URL or required service-role credential is absent. The enforcing CI step must reach zero findings before Gate 25 can be accepted.

## Current CI evidence

Run #362 proves that Gates 1 through 24 remain green at `f7bcd95158e9077aed89ab000862e70b1cbb7d9d`. Gate 25 then failed on the three remaining runtime-isolation findings. Because the enforcing step stops the regulated workflow, repository contract tests, lint, and the production Next.js build were skipped in that Class D run. Other website/application workflows do not supersede the dedicated regulated Class D gate.

## Next controlled sequence

1. Continue removing the embedded fallback from `lib/florida-class-d-makeup.ts`, `lib/florida-class-d-observer.ts`, and `lib/florida-class-d-recorded-makeup.ts` without weakening the enforcement rule.
2. Require explicit `OBSERRA_SUPABASE_URL` HTTPS configuration and protected server-side credentials for every regulated persistence path.
3. Rerun Gates 1 through 25, repository tests, lint, and the production Next.js build once the inventory reaches zero.
4. Synchronize `HANDOFF.md`, this file, the Gate 25 handoff, DS submission/audit controls, and PR #56 to the actual green Gate 25 head.
5. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
6. Finalize the Division-approved examination-bank boundary before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
8. Prepare owner/admin LMS access using the authenticated Clerk role path without placing credentials or license numbers in source or chat.
9. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or protected production configuration values.

## Restart instruction

Resume from `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`. Gate 24 remains the accepted source/build baseline at `cc6470b2466f68578d63884f646462a2ad65ac0c`. Gate 25 enforcement is active and not accepted. Continue from the three known open runtime-isolation targets: make-up, observer access, and recorded make-up. Do not call Gate 25 accepted until the enforcing inventory is clean and the complete Gates 1 through 25 cycle passes source verification, repository tests, lint, and production build. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a course-completion certificate for hours alone.
