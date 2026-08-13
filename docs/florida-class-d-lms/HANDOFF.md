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

## Gates 1-22

Gates 1 through 22 are implemented in source. The dedicated Florida Class D workflow has previously completed source verification, repository tests, lint, and the production Next.js build successfully through Gate 22. Production activation remains disabled.

Gate 21 is database-promotion readiness only and does not apply production migrations. Gate 22 checks protected runtime configuration presence without exposing secret values and does not activate regulated functions.

## Gate 23 — Non-Production Acceptance Evidence

**IMPLEMENTED IN SOURCE / CURRENT CI VALIDATION IN PROGRESS / PRODUCTION ACTIVATION DISABLED**

Gate 23 adds real non-production acceptance evidence records. Acceptance runs are limited to development, sandbox, staging, or UAT; bind to a 40-character release commit SHA; require a synthetic test-identity reference and explicit synthetic-identity confirmation; and track 18 required domains.

The 18 domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, exam, retest, completion, completion documents, LIAS workflow, inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

The database finalization function refuses to pass an acceptance run unless all 18 domains are recorded as passed. A failed, blocked, missing, or not-run domain prevents finalization.

Primary Gate 23 artifacts now include:

- `supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql`
- `lib/florida-class-d-acceptance.ts`
- `app/florida-security-training/admin/acceptance/page.tsx`
- `scripts/florida-class-d-acceptance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/LATEST-HANDOFF.md`

The current acceptance page is a real staff-protected view over persisted acceptance records. It is not a mockup. Interactive acceptance mutations remain incomplete until the controlled write workflow is accepted in source and CI.

## Mandatory completion and certificate standard

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

Only after successful completion may the supplemental Obserra completion certificate/application-handoff record be generated. Authorized staff then complete the controlled LIAS workflow. The official FDACS-16103 remains a LIAS-generated Florida document and is not synthesized by Obserra.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be treated as working functionality or audit evidence. Screenshots must come from implemented screens and be labeled accurately as development, staging, UAT, or production evidence.

## Audit and screenshot control

The DS LMS submission guide must remain synchronized with implemented behavior and include accurately labeled screenshots of the completion review, no-certificate-before-pass boundary, LIAS workflow, student completion documents, supplemental certificate, completion/inspection packet, quality/CAPA/retention, database readiness, runtime readiness, and Gate 23 acceptance evidence. Real learner PII, protected exam content, credentials, license numbers, private provider values, and infrastructure secrets must not appear in public-source evidence.

## Current CI note

The dedicated workflow now targets **Gates 1-23 and website compatibility**. Gate 23 source verification and repository contract tests have passed on the current head; lint and the production Next.js build must also pass before Gate 23 is accepted.

CI success is source/build evidence only. It is not regulatory approval, database promotion, runtime activation, or launch authorization.

## Next controlled sequence

1. Complete the current Gates 1-23 CI cycle.
2. Harden the acceptance event ledger as append-only at the database layer.
3. Complete the controlled interactive acceptance write workflow for all 18 domains.
4. Synchronize the Gate 23-specific handoff and DS submission/audit guide controls.
5. Execute real non-production acceptance using synthetic identities after the applicable non-production database/runtime environment is configured.
6. Finalize the Division-approved examination-bank boundary before production examination activation.
7. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
8. Keep payment/enrollment and all regulated production functions disabled until applicable authorization and production gates pass.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md` and this handoff before continuing. Gates 1-22 are green in source/build validation. Gate 23 is implemented in source and currently under CI validation. Resume from the current Gate 23 CI result, then finish append-only audit hardening and the controlled interactive acceptance workflow. Do not treat 40 hours alone as successful completion, do not generate a completion certificate before a passing exam and authorized completion review, do not synthesize FDACS-16103, and do not activate regulated production functions until the applicable authorization and production gates pass.
