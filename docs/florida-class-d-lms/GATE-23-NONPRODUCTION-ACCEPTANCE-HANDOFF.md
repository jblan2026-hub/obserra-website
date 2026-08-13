# Gate 23 Non-Production Acceptance Evidence Handoff

Snapshot: 2026-08-13

## Purpose

Gate 23 provides controlled, auditable acceptance evidence for the Florida Class D LMS in development, sandbox, staging, or UAT environments. It is not a production activation gate and does not represent FDACS approval.

## Implemented source

The current source includes:

- `supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql`
- `supabase/migrations/20260813105000_fdacs_class_d_acceptance_event_permissions.sql`
- `lib/florida-class-d-acceptance.ts`
- `app/api/florida-class-d/admin/acceptance/route.ts`
- `app/florida-security-training/admin/acceptance/page.tsx`
- `app/florida-security-training/admin/acceptance/AcceptanceConsole.tsx`
- `scripts/florida-class-d-acceptance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

Acceptance records bind to an exact 40-character release commit SHA and a synthetic test identity reference. All 18 required domains must be recorded as passed before the database finalization function can pass an acceptance run.

## Required acceptance domains

The required domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, final examination, remediation/retest, completion, completion documents, LIAS workflow, completion/inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

## Access and evidence controls

The acceptance API requires school-admin or compliance-admin authorization. Passed checks require an evidence reference. The acceptance service requires explicit protected Supabase runtime configuration and does not use a hardcoded fallback project URL. Real learner PII, production credentials, protected exam content, license numbers, provider secrets, and infrastructure secrets must not be placed in acceptance evidence stored in public source.

The interactive acceptance console provides the implemented staff workflow to create a controlled non-production run, select the run, record evidence against each required domain, review the current 18-domain status, and request finalization. The client disables finalization until all 18 displayed domains are passed, while the database function independently enforces the same all-pass requirement server-side.

The acceptance-event permission migration restricts the runtime service role to select and insert on the acceptance event ledger. Update, delete, and truncate privileges are revoked for that runtime role so regulated service activity can append and read events but cannot modify or remove existing event rows.

## Source-verifier hardening

The Gate 23 source verifier was strengthened at commit `7e2195d675cf060eac76c9460c8e841590e45f97` so the dedicated regulated workflow explicitly checks more than the original artifact-presence assertions. The verifier now checks the 18-domain database finalization boundary, controlled non-production environment vocabulary, explicit protected database runtime configuration, 40-character release binding, synthetic-identity confirmation, evidence-required passing checks, database-controlled finalization, the implemented staff page, and school/compliance authorization on the protected acceptance API.

This strengthens regression detection for the implemented acceptance controls. It does not replace a real non-production acceptance execution.

## Validation evidence

Gate 23 is included in the accepted Gates 1-25 source/build baseline. Florida Class D LMS Gates run #367 passed on source commit `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`, and the synchronized documentation head `03c35fd4dff84d3f9ae168d13eae0c7b7fc93c5f` passed the full regulated cycle again in run #372.

The stronger Gate 23 verifier at `7e2195d675cf060eac76c9460c8e841590e45f97` has already passed its Gate 23 verification step in Florida Class D LMS Gates run #373. At this snapshot, the same run has also passed Gates 1-25, repository contract tests, and static quality validation; the production Next.js build is still in progress. The strengthened verifier commit is therefore not yet promoted as a new accepted current-head baseline until the complete run finishes green.

CI results are source/build evidence only. They do not mean the Class DS license is issued, production migrations are applied, production runtime is activated, a real non-production acceptance run has occurred, or the LMS is approved by FDACS.

## Remaining Gate 23 operational work

The source architecture, interactive console, protected API, event-ledger permission hardening, and strengthened verifier are implemented. The remaining Gate 23 work is operational rather than a fabricated source success state: configure an appropriate non-production database/runtime environment, use synthetic identities only, execute the implemented acceptance workflow against the intended release commit, collect evidence for all 18 domains, and allow the database finalization rule to determine whether the run passes.

A production environment must not be used for this Gate 23 acceptance execution. No production acceptance execution or production database migration has occurred.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be counted as Gate 23 evidence. Screenshots must come from implemented screens and be labeled with the actual environment. Development, sandbox, staging, or UAT evidence must not be relabeled as production evidence.

## Completion and certificate boundary

Gate 23 does not change the completion standard. Forty instructional hours alone never generate a completion certificate. Successful completion still requires all controlled course requirements, a passing final examination at 128/170 or better, cleared blockers, and authorized completion approval. The official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra.

## Restart instruction

Treat Gate 23 as implemented source architecture with operational non-production execution still outstanding. First confirm the complete current-head CI result for `7e2195d675cf060eac76c9460c8e841590e45f97`. Then configure an authorized non-production runtime, execute the implemented 18-domain acceptance process with synthetic identities and a real release commit, preserve evidence without secrets or learner PII, and synchronize the resulting acceptance record into the audit package. Keep production activation fail closed.
