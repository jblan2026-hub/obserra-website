# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13

This is the current restart pointer for the regulated Florida Class D LMS workstream for **Obserra Executive Protection & Intelligence LLC**. Read this file together with `HANDOFF.md` and the gate-specific handoffs before changing regulated behavior.

## Current source state

Gates 1 through 20 are implemented in source. Gate 20 source verification, repository tests, lint, and the production Next.js build completed successfully on commit `f05f543ef576099bc9405ede51c2a8fe1f001b92` in the dedicated Florida Class D workflow. The public course remains `COMING SOON / LMS IN PROGRESS`; regulated production functions remain fail closed.

Gate 21, Controlled Database Promotion Readiness, is implemented in source and has been wired into the aggregate Florida Class D verification pipeline. Gate 21 is readiness-only. It does not apply Supabase migrations, activate feature flags, expose learner data, or authorize regulated production use.

## Non-negotiable completion and certificate rule

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all 18 curriculum areas and required checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after that controlled successful-completion event may the learner-specific supplemental Obserra completion certificate/application-handoff record be generated. The official FDACS-16103 remains a LIAS-generated Florida document. Obserra must not synthesize the official state form.

## Current documentation and screenshot requirement

The Class DS LMS submission guide must be revised before filing/final operational use to show, with demonstration data first and controlled production evidence later:

- Completion Review Console;
- the 40-hours-but-no-certificate-before-exam-pass boundary;
- FDACS/LIAS prepared, submitted, confirmed, and exception workflow;
- Student Completion Documents portal;
- supplemental Obserra Course Completion Certificate;
- Completion & Inspection Packets;
- Quality, CAPA & Record Retention controls;
- database promotion/readiness evidence as an administrative control, without exposing credentials, project identifiers, connection strings, learner PII, or secrets.

## Gate 21 release boundary

Before any regulated database promotion, the operator must have an approved release candidate, current backup or verified recovery point, deterministic migration inventory, privilege/RLS review, prepared verification queries, rollback or forward-compensating-change plan, controlled change record, and disabled regulated feature flags. Production promotion is not accepted until post-migration verification confirms the regulated security and completion/certificate boundaries remain intact.

## Next controlled sequence

1. Complete the fresh Gates 1-21 CI cycle on the current head and correct any source/type/lint/build defect.
2. Build Gate 22 production runtime/configuration readiness validation for protected Supabase, private document storage, Clerk staff roles, Daily media, DS/DI protected configuration, and all regulated feature flags, without committing secrets.
3. Add controlled environment-validation evidence and operator runbook outputs suitable for audit without revealing credentials.
4. Perform controlled non-production end-to-end validation using test identities across enrollment, identity, live media, attendance/time, security challenges, examination, remediation/retest, completion, certificates/documents, LIAS queue, inspection packet, quality/CAPA, retention, and observer access.
5. Finalize the Division-approved exam-bank boundary before production examination activation.
6. Revise the Class DS LMS submission-guide DOCX/PDF and screenshot set.
7. Keep paid enrollment and all regulated production functions disabled until regulatory authorization, production acceptance, and owner approval are complete.

## Public repository security boundary

Never commit real learner PII, identity documents, protected exam questions or answers, license numbers, FDACS/LIAS credentials, Supabase service-role keys, private storage credentials, Daily keys/tokens, Clerk secrets, observer secrets, authenticated production screenshots with private data, or production environment identifiers that expose sensitive infrastructure.
