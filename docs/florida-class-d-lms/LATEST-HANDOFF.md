# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 25 are implemented and green in source. The accepted Gate 25 source/build baseline is commit `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`.

Florida Class D LMS Gates run #367 completed successfully on that head. The green regulated cycle includes Gates 1 through 21 source verification, Gate 22 runtime-readiness verification, Gate 23 non-production acceptance artifact verification, Gate 24 instructional text-screen verification, mandatory Gate 25 runtime-isolation enforcement with zero findings, repository contract tests, lint/static quality validation, and the production Next.js build.

Gate 23 includes protected non-production acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, a real interactive staff console, and restricted acceptance-event runtime permissions.

Gate 24 is implemented end to end in source. The regulated database calculates the minimum instructional text display duration using the 60-seconds-per-50-words rule, prorated by actual word count. Learner timing is tied to the authenticated learner and active device lease, visible-tab heartbeats feed server-observed timing evidence, acknowledgment is unavailable until the server-observed minimum is met, and the instructor must persist a live-discussion confirmation before closing the text screen.

Gate 25, Regulated Runtime Isolation, is **accepted in source/build and actively enforced**. `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce` is a required step in the dedicated Florida Class D workflow `Gates 1-25 and website compatibility`. The accepted run reports zero embedded Supabase project URL findings and zero prohibited public secret-class environment-name findings across the regulated `lib/florida-class-d*.ts` inventory.

The regulated persistence and service modules remediated under Gate 25 now require explicit protected `OBSERRA_SUPABASE_URL` HTTPS runtime configuration and protected server-side credentials rather than repository-embedded project fallbacks. Missing or invalid protected runtime configuration fails closed.

Website CI, Application Release Validation, and Application Production Pipeline also completed successfully on the accepted Gate 25 source head. The separate Academy 70x workflow failure is unrelated to the Florida Class D regulated LMS workstream.

No production database migration, production runtime activation, real-learner acceptance execution, LIAS production execution, regulated certificate release, or regulated launch activation has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Current production and regulatory boundary

Gate 25 acceptance is source/build evidence only. It is not FDACS approval, production acceptance, database promotion authorization, production runtime authorization, or launch approval.

The public portal must remain `COMING SOON / LMS IN PROGRESS`. Paid enrollment and regulated learner access remain disabled until applicable regulatory authorization, production configuration, controlled database promotion, production acceptance, and owner approval are complete.

The Division-approved examination-bank boundary remains a production prerequisite. Protected production exam questions and answer keys must not be committed to the public repository.

## Next controlled sequence

1. Synchronize the master handoff, Gate 25 handoff, DS submission/audit control, and PR #56 to the accepted Gate 25 baseline.
2. Execute controlled non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
3. Validate the final Division-approved examination-bank boundary before production examination activation.
4. Revise the Class DS LMS submission-guide DOCX/PDF with accurately labeled evidence from implemented screens, including final Gate 25 evidence.
5. Prepare owner/admin LMS access using the authenticated Clerk staff-role path without placing credentials, secrets, or license numbers in source or chat.
6. Prepare controlled production-promotion evidence and rollback/verification artifacts without applying production changes until separately authorized.
7. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or protected production configuration values.

## Restart instruction

Resume from the accepted Gate 25 source/build baseline `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` and `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`. Continue with non-production runtime acceptance, production-readiness evidence, examination-bank authorization boundaries, submission-guide evidence updates, and owner/admin access preparation. Do not treat CI as FDACS approval, do not apply production migrations from source-gate work, do not generate FDACS-16103 locally, and do not issue a course-completion certificate for hours alone.
