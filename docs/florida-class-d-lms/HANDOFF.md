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

The implemented source architecture contains the five-day / 40-hour regulated course structure, 18 required curriculum areas, four 120-minute live lessons per day, non-credit tracked breaks, separate 170-question final examination, 128/170 passing threshold, successful-completion review, LIAS workflow, completion documents, inspection evidence, quality/CAPA, retention controls, database/runtime readiness, non-production acceptance evidence, and the initial protected database control for instructional text-screen timing.

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

**INTERACTIVE AND EVENT-LEDGER HARDENING IMPLEMENTED / GREEN SOURCE-BUILD EVIDENCE ESTABLISHED / PRODUCTION ACTIVATION DISABLED**

Gate 23 adds real non-production acceptance evidence records. Acceptance runs are limited to development, sandbox, staging, or UAT; bind to a 40-character release commit SHA; require a synthetic test-identity reference and explicit synthetic-identity confirmation; and track 18 required domains.

The 18 domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, exam, retest, completion, completion documents, LIAS workflow, inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

The database finalization function refuses to pass an acceptance run unless all 18 domains are recorded as passed. A failed, blocked, missing, or not-run domain prevents finalization.

Primary Gate 23 artifacts include:

- `supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql`
- `supabase/migrations/20260813105000_fdacs_class_d_acceptance_event_permissions.sql`
- `lib/florida-class-d-acceptance.ts`
- `app/api/florida-class-d/admin/acceptance/route.ts`
- `app/florida-security-training/admin/acceptance/page.tsx`
- `app/florida-security-training/admin/acceptance/AcceptanceConsole.tsx`
- `scripts/florida-class-d-acceptance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`
- `docs/florida-class-d-lms/LATEST-HANDOFF.md`

The protected acceptance API supports creating runs, recording domain evidence, listing run/check evidence, and finalizing an acceptance run through the fail-closed database function. The server-side acceptance service requires explicit protected Supabase runtime configuration and does not use a hardcoded fallback project URL.

The staff acceptance page includes a real interactive console. Authorized staff can create a non-production acceptance run, select a run, record evidence and status for all 18 required domains, review current domain progress, and request finalization. The client prevents finalization until all 18 displayed domains are passed, and the database independently enforces the all-pass rule.

A follow-on database migration restricts the acceptance event ledger runtime role to read and append operations. Update, delete, and truncate privileges are revoked for the runtime service role while select and insert remain available. No production migration has been applied.

The complete interactive and event-ledger hardening source passed the dedicated Gates 1-23 workflow on commit `a7786ce426879260f3d758d40ee5c898de2f1523`, including source verification, Gate 22, Gate 23, repository tests, lint, and the production Next.js build.

## Gate 24 - Instructional Text-Screen Timing

**DATABASE CONTROL IMPLEMENTED / EXISTING SOURCE-BUILD WORKFLOW GREEN / END-TO-END IMPLEMENTATION IN PROGRESS / PRODUCTION ACTIVATION DISABLED**

Gate 24 closes the remaining online instructional text-screen timing control. The current branch includes `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql` and the dedicated `GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`.

The Gate 24 migration creates protected instructional text-screen and learner-view records. It calculates required display time server-side from the established 60-seconds-per-50-words policy, prorated by actual word count. Learner timing is tied to an active authenticated device lease and is accumulated through server-controlled timing heartbeats. A learner cannot acknowledge the text screen until the required observed time has been met. Only one text screen may be open for a live session, and opening is restricted to active instruction rather than break state.

The database close function requires a documented instructor discussion confirmation before the text screen may be closed. View and acknowledgment evidence remain auditable. The new tables use forced row-level security and direct public, anonymous, and authenticated browser database access is revoked.

Commit `1687ad60fd106e6a0a8edba18a54f6bfe9e5e5da` added the Gate 24 database control. The existing dedicated Florida Class D workflow completed successfully on that commit, including the current source gates, repository tests, lint, and production Next.js build. That result establishes compatibility only; Gate 24 is not accepted because the protected server service, student/instructor APIs, live UI integration, and Gate 24-specific verifier are still incomplete.

No client-only timer, mock screen, or simulated acknowledgment may count as Gate 24 evidence. The final learner timer must be backed by server/database timing evidence, and instructor discussion confirmation must be persisted.

## Mandatory completion and certificate standard

Successful completion requires the full five-day/2,400-minute record, all 18 required curriculum areas/checks, a passing 170-question exam at 128/170 or better, cleared completion-blocking issues, and authorized school/compliance approval.

Only after successful completion may the supplemental Obserra completion certificate/application-handoff record be generated. Authorized staff then complete the controlled LIAS workflow. The official FDACS-16103 remains a LIAS-generated Florida document and is not synthesized by Obserra.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, client-only compliance timer, or fake success state may be treated as working functionality or audit evidence. Screenshots must come from implemented screens and be labeled accurately as development, staging, UAT, or production evidence.

## Audit and screenshot control

The DS LMS submission guide must remain synchronized with implemented behavior and include accurately labeled screenshots of the completion review, no-certificate-before-pass boundary, LIAS workflow, student completion documents, supplemental certificate, completion/inspection packet, quality/CAPA/retention, database readiness, runtime readiness, Gate 23 acceptance evidence, and the completed Gate 24 instructional text-screen timing workflow. Real learner PII, protected exam content, credentials, license numbers, private provider values, and infrastructure secrets must not appear in public-source evidence.

## Current CI note

The Gate 23 interactive/event-ledger source is green. The first Gate 24 database migration was added by commit `1687ad60fd106e6a0a8edba18a54f6bfe9e5e5da`, and the existing dedicated Florida Class D workflow also completed successfully on that commit. Gate 24-specific source verification has not yet been added, so Gate 24 must not be called accepted.

CI success is source/build evidence only. It is not regulatory approval, database promotion, runtime activation, or launch authorization.

## Next controlled sequence

1. Continue Gate 24 from `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`.
2. Build the protected server-side text-screen service using explicit runtime Supabase configuration with no hardcoded project fallback.
3. Build authenticated learner and instructor/admin APIs for timed text-screen operation and evidence.
4. Integrate the real learner display/timing/acknowledgment workflow and instructor creation/discussion/closure workflow into the live classroom surfaces.
5. Add Gate 24 source verification and CI coverage.
6. Synchronize `HANDOFF.md`, `LATEST-HANDOFF.md`, `GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, PR #56, and the DS submission/audit control after complete Gate 24 implementation passes CI.
7. Execute real non-production acceptance using synthetic identities only after the applicable non-production database/runtime environment is configured.
8. Finalize the Division-approved examination-bank boundary before production examination activation.
9. Revise the Class DS LMS submission-guide DOCX/PDF with screenshots from implemented screens.
10. Keep payment/enrollment and all regulated production functions disabled until applicable authorization and production gates pass.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions/answers, FDACS/LIAS credentials, authenticated private screenshots, API keys, Supabase service-role keys, Daily tokens, observer secrets, private instructor credential evidence, license numbers, or production secrets.

## Restart instruction

Read `docs/florida-class-d-lms/LATEST-HANDOFF.md`, `docs/florida-class-d-lms/GATE-23-NONPRODUCTION-ACCEPTANCE-HANDOFF.md`, `docs/florida-class-d-lms/GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md`, `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`, and this handoff before continuing. Gate 23 is green in source/build validation. Gate 24 has started with a real protected database timing control and remains incomplete. Resume with the server-side text-screen service and authenticated APIs, then integrate the learner/instructor live surfaces, add Gate 24 verification, synchronize audit evidence, and rerun the full workflow. Do not treat 40 hours alone as successful completion, do not generate a completion certificate before a passing exam and authorized completion review, do not synthesize FDACS-16103, and do not activate regulated production functions until the applicable authorization and production gates pass.
