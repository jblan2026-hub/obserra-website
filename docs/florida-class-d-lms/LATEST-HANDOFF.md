# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 22 are implemented in source and remain green through source verification, repository tests, lint, and the production Next.js build.

Gate 23, Non-Production Acceptance Evidence, has a full green dedicated Florida Class D workflow baseline and has now advanced beyond that baseline with additional hardening. The current source includes protected acceptance runs, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API, and a real interactive staff console for creating acceptance runs, recording domain evidence, reviewing progress, and requesting finalization through the database-controlled all-pass rule.

The acceptance service requires explicit protected Supabase runtime configuration and contains no hardcoded fallback project URL. A follow-on database migration now restricts the acceptance event ledger runtime role to read and append operations by revoking update, delete, and truncate privileges and granting only select and insert for that ledger.

The current hardened source head is `a7786ce426879260f3d758d40ee5c898de2f1523`. A fresh Gates 1-23 workflow is validating the interactive console and append-only runtime-permission changes. Do not call those new hardening changes accepted until that complete cycle passes source verification, Gate 22, Gate 23, repository tests, lint, and the production Next.js build.

No production database migration or production acceptance execution has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Gate 23 acceptance domains

Gate 23 requires evidence across all 18 domains before an acceptance run can pass: identity and enrollment; live media; attendance and instructional time; presence challenges; regulatory observer access; make-up training; recorded make-up; final examination; remediation and retest; successful completion; completion documents; LIAS workflow; completion / inspection packet; quality and CAPA; retention; security headers; mobile and desktop behavior; and accessibility.

A run is not accepted when any required domain is missing, failed, blocked, or not run. Passed domain checks require a real evidence reference.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, and Gate 23 acceptance evidence. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Next controlled sequence

1. Complete the fresh Gates 1-23 CI cycle for the interactive console and append-only runtime-permission changes.
2. Strengthen the Gate 23 verifier so it explicitly requires the protected API, explicit runtime Supabase configuration, interactive evidence workflow, and acceptance-event mutation restrictions.
3. Synchronize `HANDOFF.md`, this file, the Gate 23 handoff, and DS submission/audit controls with the final green current head.
4. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
5. Complete remaining online text-screen timing enforcement and other launch-specific regulatory acceptance items before representing the LMS as production-ready.
6. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.
