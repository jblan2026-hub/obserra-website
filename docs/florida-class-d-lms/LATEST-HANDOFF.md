# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 22 are implemented in source and remain green through source verification, repository tests, lint, and the production Next.js build.

Gate 23, Non-Production Acceptance Evidence, is implemented with protected acceptance records, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, a real interactive staff console, and restricted acceptance-event runtime permissions. The complete interactive and event-ledger hardening source passed the dedicated Florida Class D workflow on commit `a7786ce426879260f3d758d40ee5c898de2f1523`.

Gate 24, Instructional Text-Screen Timing, has now started with a real database control at `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`. The migration creates protected instructional text screens and learner view evidence, calculates the minimum server-side from the 60-seconds-per-50-words policy, ties learner timing to an active authenticated device lease, records active timing heartbeats, blocks learner acknowledgment until the minimum observed time is met, and requires an instructor discussion confirmation before the screen can be closed.

Commit `1687ad60fd106e6a0a8edba18a54f6bfe9e5e5da` added the Gate 24 database control and passed the existing dedicated Florida Class D source/build workflow. Gate 24 is not yet accepted because the protected server service, student and instructor APIs, live learner/instructor UI integration, and Gate 24-specific verifier are still incomplete.

No production database migration, production acceptance execution, or regulated launch activation has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Gate 23 acceptance domains

Gate 23 requires evidence across all 18 domains before an acceptance run can pass: identity and enrollment; live media; attendance and instructional time; presence challenges; regulatory observer access; make-up training; recorded make-up; final examination; remediation and retest; successful completion; completion documents; LIAS workflow; completion / inspection packet; quality and CAPA; retention; security headers; mobile and desktop behavior; and accessibility.

A run is not accepted when any required domain is missing, failed, blocked, or not run. Passed domain checks require a real evidence reference.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, Gate 23 acceptance evidence, and the completed Gate 24 instructional text-screen timing workflow. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Next controlled sequence

1. Continue Gate 24 from `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`.
2. Build the protected server-side text-screen service using explicit runtime Supabase configuration with no hardcoded project fallback.
3. Build authenticated learner and instructor/admin APIs for timed text-screen operation and evidence.
4. Integrate the real learner display/timing/acknowledgment workflow and instructor creation/discussion/closure workflow into the live classroom surfaces.
5. Add Gate 24-specific source verification and CI coverage.
6. Synchronize `HANDOFF.md`, this file, `GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, PR #56, and the DS submission/audit control after the complete Gate 24 implementation passes CI.
7. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
8. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.
