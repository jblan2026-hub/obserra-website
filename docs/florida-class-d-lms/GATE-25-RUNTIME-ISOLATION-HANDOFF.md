# Gate 25 Regulated Runtime Isolation Handoff

Snapshot: 2026-08-13

## Purpose

Gate 25 strengthens the regulated Florida Class D runtime boundary by removing hardcoded Supabase project URL fallbacks from regulated server modules and requiring explicit protected HTTPS runtime configuration before those services can operate.

## Current state

**IN PROGRESS / ENFORCEMENT ACTIVE / REMEDIATION UNDERWAY / NOT YET ACCEPTED / PRODUCTION ACTIVATION DISABLED**

Gates 1 through 24 remain the accepted source/build baseline. Gate 25 is now enforced in the dedicated Florida Class D CI workflow as `Gates 1-25 and website compatibility`.

Gate 25 uses `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce`. The audit scans regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and environment names that would improperly expose secret-class configuration through `NEXT_PUBLIC_*` variables. The enforcing step fails the Class D workflow whenever findings remain.

## Security objective

Regulated server modules must fail closed when `OBSERRA_SUPABASE_URL` or the required service-role credential is absent. They must not silently fall back to a repository-embedded project URL. Production project identifiers, service-role values, provider secrets, license numbers, and other protected runtime values must remain outside public source.

The approved configuration boundary is server-only explicit environment configuration using HTTPS and protected credentials. No regulated browser component may receive service-role credentials.

## Remediation completed

The following regulated services have had the hardcoded Supabase fallback removed and now require explicit `OBSERRA_SUPABASE_URL` HTTPS configuration:

- `lib/florida-class-d-acceptance.ts`
- `lib/florida-class-d-completion.ts`
- `lib/florida-class-d-completion-documents.ts`
- `lib/florida-class-d-completion-packet.ts`
- `lib/florida-class-d-exam.ts`
- `lib/florida-class-d-exam-admin.ts`
- `lib/florida-class-d-exam-monitoring.ts`
- `lib/florida-class-d-exam-retest.ts`
- `lib/florida-class-d-lias.ts`
- `lib/florida-class-d-live-feed.ts`
- `lib/florida-class-d-live-persistence.ts`
- `lib/florida-class-d-live-reporting.ts`
- `lib/florida-class-d-media.ts`
- `lib/florida-class-d-persistence.ts`
- `lib/florida-class-d-polls.ts`
- `lib/florida-class-d-quality.ts`
- `lib/florida-class-d-scheduling.ts`
- `lib/florida-class-d-student-certificate.ts`
- `lib/florida-class-d-makeup-certification.ts`

These changes preserve the protected service-role credential boundary and fail closed with service-specific configuration errors when explicit valid runtime configuration is absent.

This remains remediation progress only. Gate 25 is not accepted.

## Current enforced inventory

Florida Class D LMS Gates run #359 at branch head `ac1f17d63b57d98354550cd212fa9db404a40676` completed Gates 1 through 24 successfully and then failed at the mandatory Gate 25 runtime-isolation step as designed.

The enforcing audit inspected 29 regulated modules and reported four remaining embedded Supabase URL findings with no public secret-class `NEXT_PUBLIC_*` findings:

- `lib/florida-class-d-completion-packet.ts`
- `lib/florida-class-d-makeup.ts`
- `lib/florida-class-d-observer.ts`
- `lib/florida-class-d-recorded-makeup.ts`

`lib/florida-class-d-completion-packet.ts` was remediated after run #359, so the next enforcing inventory is expected to reduce the open set further. `makeup`, `observer`, and `recorded-makeup` remain open at this snapshot. Attempts to remove their legacy fallback through the GitHub connector were blocked by the connector safety layer, so they must not be represented as completed.

## Acceptance criteria

Gate 25 is not accepted until all of the following are true:

1. The runtime-isolation audit reports zero embedded Supabase project URLs in regulated `lib/florida-class-d*.ts` modules.
2. No regulated server module uses a `NEXT_PUBLIC_*` variable for a secret, service-role key, API key, token, or password.
3. Regulated Supabase persistence fails closed when an explicit HTTPS runtime URL or protected service-role credential is absent.
4. Existing regulated tests, Gates 1 through 24, lint, and the production Next.js build remain green.
5. The mandatory Gate 25 CI enforcement step passes with zero findings.
6. `HANDOFF.md`, `LATEST-HANDOFF.md`, this handoff, the DS submission/audit control, and PR #56 are synchronized to the accepted Gate 25 head.

## Current CI evidence

Run #359 confirms that Gates 1 through 24 all pass on `ac1f17d63b57d98354550cd212fa9db404a40676`. The Gate 25 enforcement step then stopped the workflow because four regulated files still contained legacy embedded Supabase URLs. Repository contract tests, lint, and the production build were intentionally skipped after the enforcing failure, so Gate 25 cannot yet be called accepted.

Website CI, Application Release Validation, and Application Production Pipeline completed successfully for that same source head. Those workflows do not supersede the dedicated Florida Class D regulated gate.

## Production boundary

No production environment value is to be committed to the repository during this remediation. No production database migration is required merely to remove source-level URL fallbacks. Regulated feature flags remain fail closed. No production database promotion, production runtime activation, LIAS execution, or regulatory approval is implied by Gate 25 source remediation.

## Audit evidence

The final Gate 25 evidence must include the enforcing CI step and a green workflow showing zero runtime-isolation findings, followed by passing repository tests, lint, and the production Next.js build. Evidence must not print secret values, service-role keys, license numbers, or private configuration content.

## Restart instruction

Re-run the mandatory Gate 25 inventory after the completion-packet remediation, then continue eliminating the remaining hardcoded fallback in `lib/florida-class-d-makeup.ts`, `lib/florida-class-d-observer.ts`, and `lib/florida-class-d-recorded-makeup.ts`. Do not weaken or bypass the enforcement rule. Do not call Gate 25 accepted until the complete Gates 1 through 25 cycle passes source verification, repository tests, lint, and production build, and the authoritative audit handoffs are synchronized to that green head.
