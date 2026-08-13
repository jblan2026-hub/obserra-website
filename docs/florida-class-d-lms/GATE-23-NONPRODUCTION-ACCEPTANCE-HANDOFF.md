# Gate 23 Non-Production Acceptance Evidence Handoff

Snapshot: 2026-08-13

## Purpose

Gate 23 provides controlled, auditable acceptance evidence for the Florida Class D LMS in development, sandbox, staging, or UAT environments. It is not a production activation gate and does not represent FDACS approval.

## Implemented source

The current source includes:

- `supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql`
- `lib/florida-class-d-acceptance.ts`
- `app/api/florida-class-d/admin/acceptance/route.ts`
- `app/florida-security-training/admin/acceptance/page.tsx`
- `scripts/florida-class-d-acceptance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

Acceptance records bind to a real 40-character release commit SHA and a synthetic test identity reference. All 18 required domains must be recorded as passed before the database finalization function can pass an acceptance run.

## Required acceptance domains

The required domains are identity/enrollment, live media, attendance/time, presence challenges, observer access, make-up, recorded make-up, final examination, remediation/retest, completion, completion documents, LIAS workflow, completion/inspection packet, quality/CAPA, retention, security headers, mobile/desktop behavior, and accessibility.

## Access and evidence controls

The acceptance API requires school-admin or compliance-admin authorization. Passed checks require an evidence reference. The acceptance service requires explicit protected Supabase runtime configuration and does not use a hardcoded fallback project URL. Real learner PII, production credentials, protected exam content, license numbers, provider secrets, and infrastructure secrets must not be placed in acceptance evidence stored in public source.

## Validation evidence

A full dedicated Florida Class D workflow passed on commit `35a7f6ca704a44bc885d1534aa570eb541bc49d3`, including Gates 1-23 source verification, Gate 22 runtime-readiness verification, Gate 23 acceptance verification, repository tests, lint, and the production Next.js build.

That CI result is source/build evidence only. It does not mean the Class DS license is issued, production migrations are applied, production runtime is activated, or the LMS is approved by FDACS.

## Remaining Gate 23 controls

Gate 23 is not operationally complete until both of these controls are implemented and revalidated:

1. Database-level append-only enforcement for acceptance audit events so existing acceptance events cannot be updated or deleted through the regulated service path.
2. A complete interactive staff acceptance console that records and finalizes real acceptance evidence through the protected API rather than presenting a read-only list.

After those controls land, strengthen the Gate 23 verifier so it explicitly validates the protected API, explicit runtime configuration, append-only event enforcement, and the interactive evidence workflow.

## No mockups or placeholders

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, or fake success state may be counted as Gate 23 evidence. Screenshots must come from implemented screens and be labeled with the actual environment.

## Completion and certificate boundary

Gate 23 does not change the completion standard. Forty instructional hours alone never generate a completion certificate. Successful completion still requires all controlled course requirements, a passing final examination at 128/170 or better, cleared blockers, and authorized completion approval. The official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra.

## Restart instruction

Read this file together with `HANDOFF.md` and `LATEST-HANDOFF.md`. Resume by implementing append-only acceptance audit enforcement and the real interactive acceptance console. Then update the Gate 23 verifier and audit handoffs and run the complete Gates 1-23 CI cycle. Keep production activation fail closed.
