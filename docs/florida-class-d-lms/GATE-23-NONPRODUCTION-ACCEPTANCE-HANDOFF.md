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

Acceptance records bind to a real 40-character release commit SHA and a synthetic test identity reference. All 18 required domains must be recorded as passed before the database finalization function can pass an acceptance run.

## Required acceptance domains

The required domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, final examination, remediation/retest, completion, completion documents, LIAS workflow, completion/inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

## Access and evidence controls

The acceptance API requires school-admin or compliance-admin authorization. Passed checks require an evidence reference. The acceptance service requires explicit protected Supabase runtime configuration and does not use a hardcoded fallback project URL. Real learner PII, production credentials, protected exam content, license numbers, provider secrets, and infrastructure secrets must not be placed in acceptance evidence stored in public source.

The interactive acceptance console now provides a real staff workflow to create a controlled non-production run, select the run, record evidence against each required domain, see the current 18-domain status, and request finalization. The client disables finalization until all 18 displayed domains are passed, while the database function independently enforces the same all-pass requirement server-side.

The follow-on acceptance-event permission migration restricts the runtime service role to select and insert on the acceptance event ledger. Update, delete, and truncate privileges are revoked for that runtime role so regulated service activity can append and read events but cannot modify or remove existing event rows.

## Validation evidence

A full dedicated Florida Class D workflow passed on commit `35a7f6ca704a44bc885d1534aa570eb541bc49d3`, including Gates 1-23 source verification, Gate 22 runtime-readiness verification, Gate 23 acceptance verification, repository tests, lint, and the production Next.js build.

The current hardened source head is `a7786ce426879260f3d758d40ee5c898de2f1523`. A fresh Gates 1-23 workflow is validating the interactive console and append-only runtime-permission changes. Those new hardening changes are not accepted until the complete current-head workflow is green.

CI results are source/build evidence only. They do not mean the Class DS license is issued, production migrations are applied, production runtime is activated, or the LMS is approved by FDACS.

## Remaining Gate 23 controls

The major operational hardening items previously open are now implemented in source: the real interactive acceptance console and runtime-role mutation restrictions on the acceptance event ledger. The remaining Gate 23 work is to complete current-head CI, strengthen the Gate 23 verifier to explicitly assert the new API/console/permission controls, synchronize the audit handoffs to the final green commit, and then execute real non-production acceptance only in an appropriately configured non-production environment with synthetic identities.

No production acceptance execution or production database migration has occurred.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be counted as Gate 23 evidence. Screenshots must come from implemented screens and be labeled with the actual environment.

## Completion and certificate boundary

Gate 23 does not change the completion standard. Forty instructional hours alone never generate a completion certificate. Successful completion still requires all controlled course requirements, a passing final examination at 128/170 or better, cleared blockers, and authorized completion approval. The official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra.

## Restart instruction

Read this file together with `HANDOFF.md` and `LATEST-HANDOFF.md`. Resume from the current-head Gates 1-23 CI result, strengthen the Gate 23 verifier, synchronize all audit handoffs, and only then execute real non-production acceptance with synthetic identities in the configured non-production environment. Keep production activation fail closed.
