# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md`, `GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, `GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, `GATE-25-RUNTIME-ISOLATION-HANDOFF.md`, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` before changing regulated behavior.

## Current authoritative branch state

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

PR state at this synchronization: **open, mergeable, unmerged**.

Audit-synchronized branch head validated by the current regulated cycle: `53eebf6bc9dfc03505e3db16cdb1188014209f5a`.

Gates 1 through 25 remain the accepted regulated source/build scope. The original Gate 25 implementation baseline remains `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`, validated by Florida Class D LMS Gates run #367. Subsequent audit/documentation synchronization advanced the branch head without changing the production or regulatory boundary.

Florida Class D LMS Gates run #374 completed successfully on audit-synchronized head `53eebf6bc9dfc03505e3db16cdb1188014209f5a`. The job `Gates 1-25 and website compatibility` passed Gate 1-21 verification, Gate 22 runtime-readiness source verification, Gate 23 acceptance-evidence source verification, Gate 24 instructional text-screen source verification, mandatory Gate 25 regulated runtime-isolation enforcement, repository contract tests, static quality validation, and the production Next.js build.

Website CI run #1885, Application Release Validation run #781, and Application Production Pipeline run #795 also completed successfully on the same audit-synchronized head. Academy 70x Production Gate run #1092 failed separately and remains unrelated to the Florida Class D regulated LMS gate unless a future review establishes a direct Class D dependency.

## Gate 23 through Gate 25 status

Gate 23 provides protected non-production acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, an interactive staff console, and restricted acceptance-event runtime permissions.

Gate 24 provides server-authoritative instructional text-screen timing using the controlled 60-seconds-per-50-words rule prorated by actual word count. Learner timing is tied to the authenticated learner and active device lease. Visible-tab heartbeats feed server-observed timing evidence. Acknowledgment remains unavailable until the authoritative minimum is satisfied, and instructor discussion confirmation is required before controlled closure.

Gate 25 remains actively enforced. `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce` is mandatory in the dedicated Florida Class D workflow. Regulated `lib/florida-class-d*.ts` server modules require explicit protected `OBSERRA_SUPABASE_URL` HTTPS runtime configuration and protected server-side credentials rather than repository-embedded project URL fallbacks. Missing or invalid protected runtime configuration fails closed.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after the controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## Current production and regulatory boundary

Run #374 is source/build and audit-synchronization evidence only. It is not FDACS approval, production acceptance, database promotion authorization, production runtime authorization, LIAS authorization, certificate-release authorization, or launch approval.

As of this synchronization:

- No production Class D database migration has been applied by this workstream.
- No real-learner acceptance execution has been performed.
- No production runtime activation has been authorized.
- No LIAS production execution has been performed by this workstream.
- No regulated certificate release or public regulated launch has been authorized.
- The public portal remains `COMING SOON / LMS IN PROGRESS` and paid enrollment/regulated learner access remain fail closed.
- The Division-approved examination-bank boundary remains a production prerequisite. Protected production questions and answer keys must not be committed to the public repository.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, simulated text-screen acknowledgment, or fake success state may be treated as working functionality or audit evidence. Evidence screenshots must come from implemented screens and be labeled accurately as development, sandbox, staging, UAT, or production evidence.

## Next controlled milestone

The next controlled milestone is **actual non-production acceptance execution after an authorized non-production database/runtime environment is configured**.

That execution must use synthetic identities only, bind the acceptance run to the release commit actually deployed in the authorized non-production environment, exercise the required Gate 23 acceptance domains using implemented behavior, preserve evidence references, and fail closed unless all required domains pass.

Do not substitute source verification, CI, screenshots, mock data without execution, or a preview build for the actual non-production acceptance run.

## Controlled sequence after run #374

1. Configure and authorize the non-production Class D database/runtime environment without altering production.
2. Apply only the approved Class D migrations to that non-production environment under controlled change records.
3. Configure protected non-production identity, database, Daily/media, private document storage, and required regulated feature settings without exposing secret values.
4. Execute Gate 22 runtime-readiness checks in the authorized non-production environment.
5. Execute the actual Gate 23 non-production acceptance run using synthetic identities and the deployed release commit.
6. Capture accurately labeled non-production acceptance evidence for the DS submission/audit package.
7. Validate the Division-approved examination-bank boundary before any production exam activation.
8. Continue preparation of production-promotion, rollback, verification, owner/admin access, and final submission evidence without applying production changes until separately authorized.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or protected production configuration values.

## Restart instruction

Resume from audit-synchronized head `53eebf6bc9dfc03505e3db16cdb1188014209f5a` and Florida Class D LMS Gates run #374. PR #56 remains open, mergeable, and unmerged at this checkpoint. Continue with authorized non-production runtime configuration and actual non-production acceptance execution. Preserve the production boundary: no production database migration, no real learner acceptance, no production activation, no LIAS production execution, no regulated certificate release, and no FDACS approval claim. Do not generate FDACS-16103 locally and do not issue a course-completion certificate for hours alone.
