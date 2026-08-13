# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**. It is separate from the commercial Obserra Academy course-production workstream.

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

## Release boundary

Public paid enrollment, regulated learner access, production live instruction, production scheduling, production exam access, completion/certificate release, LIAS execution, observer access, database promotion, and runtime activation remain fail closed until the applicable regulatory and production gates pass.

No source, CI result, preview deployment, screenshot, submission draft, readiness report, or test environment may be represented as FDACS approval.

## Controlled Class D architecture

The implemented source architecture contains the five-day / 40-hour regulated course structure, 18 required curriculum areas, four 120-minute live lessons per day, non-credit tracked breaks, separate 170-question final examination, 128/170 passing threshold, successful-completion review, LIAS workflow, completion documents, inspection evidence, quality/CAPA, retention controls, database/runtime readiness, and non-production acceptance evidence.

Forty instructional hours alone do not complete the course and do not earn a completion certificate.

### Gates 1-4

Foundation, regulated student records, durable Supabase persistence/admin APIs, identity verification, acknowledgments, cohort assignment, and regulated enrollment are implemented in source. Production activation and database promotion remain disabled.

### Gates 5-8

Live instructor classroom, one-device presence, server-authoritative time evidence, security challenges, daily attendance certification, secure Daily media, temporary view-only observer access, and exact five-day/20-session scheduling are implemented in source.

### Gates 9-11

Structured live polls/participation analytics, controlled make-up assignment and atomic credit reconciliation, and protected recorded make-up delivery/evidence are implemented in source.

### Gates 12-15

Protected final examination, exam-bank administration, active monitoring, interruption/resume/invalidation, failed-attempt preservation, remediation, and controlled retest authorization are implemented in source.

## Gates 1-22

Gates 1 through 22 are implemented in source and remain green through source verification, repository tests, lint, and the production Next.js build. Production activation remains disabled.

Gate 21 is database-promotion readiness only and does not apply production migrations. Gate 22 checks protected runtime configuration presence without exposing secret values and does not activate regulated functions.

## Gate 23 - Non-Production Acceptance Evidence

**FULL GREEN SOURCE/BUILD BASELINE ESTABLISHED / OPERATIONAL HARDENING STILL OPEN / PRODUCTION ACTIVATION DISABLED**

Gate 23 adds real non-production acceptance evidence records. Acceptance runs are limited to development, sandbox, staging, or UAT; bind to a 40-character release commit SHA; require a synthetic test-identity reference and explicit synthetic-identity confirmation; and track 18 required domains.

The 18 domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, exam, retest, completion, completion documents, LIAS workflow, inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

The database finalization function refuses to pass an acceptance run unless all 18 domains are recorded as passed. A failed, blocked, missing, or not-run domain prevents finalization.

Primary Gate 23 artifacts now include:

- `supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql`
- `lib/florida-class-d-acceptance.ts`
- `app/api/florida-class-d/admin/acceptance/route.ts`
- `app/florida-security-training/admin/acceptance/page.tsx`
- `scripts/florida-class-d-acceptance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`
- `docs/florida-class-d-lms/LATEST-HANDOFF.md`

The protected acceptance API supports creating runs, recording domain evidence, listing run/check evidence, and finalizing an acceptance run through the fail-closed database function. The server-side acceptance service now requires explicit protected Supabase runtime configuration and no longer uses a hardcoded fallback project URL.

The current acceptance page is a real staff-protected view over persisted acceptance records. It is not a mockup. The full interactive staff acceptance console remains incomplete. Database-level append-only enforcement for the Gate 23 acceptance event ledger also remains open. No production acceptance execution has occurred.

## Mandatory completion and certificate standard

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

Only after successful completion may the supplemental Obserra completion certificate/application-handoff record be generated. Authorized staff then complete the controlled LIAS workflow. The official FDACS-16103 remains a LIAS-generated Florida document and is not synthesized by Obserra.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be treated as working functionality or audit evidence. Screenshots must come from implemented screens and be labeled accurately as development, staging, UAT, or production evidence.

## Audit and screenshot control

The DS LMS submission guide must remain synchronized with implemented behavior and include accurately labeled screenshots of the completion review, no-certificate-before-pass boundary, LIAS workflow, student completion documents, supplemental certificate, completion/inspection packet, quality/CAPA/retention, database readiness, runtime readiness, and Gate 23 acceptance evidence. Real learner PII, protected exam content, credentials, license numbers, private provider values, and infrastructure secrets must not appear in public-source evidence.

## Current CI note

The dedicated workflow targets **Gates 1-23 and website compatibility**. A full dedicated Florida Class D cycle completed successfully on commit `35a7f6ca704a44bc885d1534aa570eb541bc49d3`, including Gates 1-23 source verification, Gate 22 runtime-readiness verification, Gate 23 acceptance verification, repository contract tests, lint, and the production Next.js build.

Later audit-documentation commits do not change the regulated runtime behavior. A fresh CI cycle is still required after the remaining append-only audit enforcement and interactive acceptance console are implemented.

CI success is source/build evidence only. It is not regulatory approval, database promotion, runtime activation, or launch authorization.

## Next controlled sequence

1. Implement database-level append-only enforcement for the Gate 23 acceptance event ledger.
2. Complete the controlled interactive staff acceptance workflow for all 18 domains against the existing protected API.
3. Strengthen Gate 23 source verification to require the protected API, explicit runtime Supabase configuration, append-only event enforcement, and the interactive staff workflow.
4. Synchronize `HANDOFF.md`, `LATEST-HANDOFF.md`, the Gate 23 handoff, and DS submission/audit guide controls in the same increment.
5. Run the full Gates 1-23 source, repository-test, lint, and production-build cycle after those changes.
6. Execute real non-production acceptance using synthetic identities only after the applicable non-production database/runtime environment is configured.
7. Finalize the Division-approved examination-bank boundary before production examination activation.
8. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
9. Keep payment/enrollment and all regulated production functions disabled until applicable authorization and production gates pass.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md`, `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, and this handoff before continuing. Gates 1-22 are green in source/build validation, and Gate 23 has a full green source/build baseline on commit `35a7f6ca704a44bc885d1534aa570eb541bc49d3`. Resume by implementing append-only acceptance audit hardening and the real interactive acceptance console, then re-run full CI. Do not treat 40 hours alone as successful completion, do not generate a completion certificate before a passing exam and authorized completion review, do not synthesize FDACS-16103, and do not activate regulated production functions until the applicable authorization and production gates pass.
