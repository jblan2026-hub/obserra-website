# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 22 are implemented in source and the dedicated Florida Class D workflow completed successfully through source verification, repository tests, lint, and the production Next.js build on the accepted Gate 22 head.

Gate 23, Non-Production Acceptance Evidence, has started in source. The current migration creates protected acceptance runs, 18 required acceptance domains, synthetic test-identity confirmation, release-commit binding, service-controlled records, and an all-pass finalization rule. Gate 23 is not yet accepted because its service/API/admin evidence workflow, append-only event hardening, verifier, CI wiring, and synchronized gate documentation are not complete.

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

A run is not accepted when any required domain is missing, failed, or blocked.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show implemented, accurately labeled evidence for Completion Review, the 40-hours-but-no-certificate-before-exam-pass boundary, LIAS workflow, Student Completion Documents, the supplemental Obserra Course Completion Certificate, Completion & Inspection Packets, Quality/CAPA/Retention, database-promotion readiness, runtime-readiness evidence, and Gate 23 acceptance evidence. No credential, license number, learner PII, protected exam content, provider secret, or infrastructure secret may appear in public-source screenshots or evidence.

## Next controlled sequence

1. Complete Gate 23 append-only event hardening.
2. Build the Gate 23 server-side acceptance service and protected admin API.
3. Build the actual staff acceptance console for recording evidence against all 18 domains.
4. Add Gate 23 source verification and CI wiring.
5. Update `HANDOFF.md`, the Gate 23 handoff, and DS submission/audit controls in the same increment.
6. Run the full Gates 1-23 source, repository-test, lint, and production-build cycle.
7. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.
