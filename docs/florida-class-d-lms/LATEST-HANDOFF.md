# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 22 are implemented in source and remain green through source verification, repository tests, lint, and the production Next.js build.

Gate 23, Non-Production Acceptance Evidence, has now completed a full green dedicated Florida Class D workflow on commit `35a7f6ca704a44bc885d1534aa570eb541bc49d3`. That cycle passed the Gates 1-23 source verification, Gate 22 runtime-readiness verification, Gate 23 acceptance verification, repository contract tests, static quality validation, and the production Next.js build.

Gate 23 source now includes protected acceptance runs, all 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled persistence, an all-pass finalization rule, a protected school/compliance API for creating runs, recording domain evidence, listing evidence, and finalizing an acceptance run, plus the staff-protected acceptance evidence page. The acceptance service no longer uses a hardcoded fallback Supabase project URL and requires explicit protected runtime configuration.

Gate 23 is not yet operationally complete. The remaining controlled items are database-level append-only hardening for the acceptance event ledger and the full interactive staff console for recording and finalizing acceptance evidence. No production database migration or production acceptance execution has occurred.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be treated as working functionality or audit evidence. Screenshots used for audit/submission evidence must come from implemented screens and must be labeled accurately as development, staging, UAT, or production evidence.

## Gate 23 acceptance domains

Gate 23 requires evidence across all 18 domains before an acceptance run can pass:

- identity and enrollment;
- live media;
- attendance and instructional time;
- presence challenges;
- regulatory observer access;
- make-up training;
- recorded make-up;
- final examination;
- remediation and retest;
- successful completion;
- completion documents;
- LIAS workflow;
- completion / inspection packet;
- quality and CAPA;
- retention;
- security headers;
- mobile and desktop behavior;
- accessibility.

A run is not accepted when any required domain is missing, failed, blocked, or not run.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, and Gate 23 acceptance evidence. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Next controlled sequence

1. Implement database-level append-only hardening for the Gate 23 acceptance event ledger.
2. Complete the real interactive staff acceptance console against the existing protected API.
3. Strengthen the Gate 23 verifier to require the protected API, explicit runtime Supabase configuration, append-only event enforcement, and the interactive staff evidence workflow.
4. Add or update the Gate 23-specific handoff and synchronize `HANDOFF.md` plus the DS submission/audit controls in the same increment.
5. Run a fresh full Gates 1-23 source, repository-test, lint, and production-build cycle after those changes.
6. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime environment is configured.
7. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.
