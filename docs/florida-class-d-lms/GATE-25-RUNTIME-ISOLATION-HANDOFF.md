# Gate 25 Regulated Runtime Isolation Handoff

Snapshot: 2026-08-13

## Purpose

Gate 25 strengthens the regulated Florida Class D runtime boundary by removing hardcoded Supabase project URL fallbacks from regulated server modules and requiring explicit protected HTTPS runtime configuration before those services can operate.

## Current state

**IN PROGRESS / INVENTORY CONTROL ACTIVE / REMEDIATION UNDERWAY / NOT YET ACCEPTED / PRODUCTION ACTIVATION DISABLED**

Gate 24 remains the current accepted source/build baseline at `cc6470b2466f68578d63884f646462a2ad65ac0c`.

Gate 25 uses `scripts/florida-class-d-runtime-isolation-audit.mjs`. The audit scans regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and environment names that would improperly expose secret-class configuration through `NEXT_PUBLIC_*` variables.

The audit supports an enforcement mode. Enforcement must not be added to the required CI path until all identified legacy fallbacks are removed, because the final enforcing step is intended to prove a zero-finding state rather than create a knowingly failing release gate during remediation.

## Security objective

Regulated server modules must fail closed when `OBSERRA_SUPABASE_URL` or the required service-role credential is absent. They must not silently fall back to a repository-embedded project URL. Production project identifiers, service-role values, provider secrets, license numbers, and other protected runtime values must remain outside public source.

The approved configuration boundary is server-only explicit environment configuration using HTTPS and protected credentials. No regulated browser component may receive service-role credentials.

## Remediation completed in this increment

The following regulated services have now had the hardcoded Supabase fallback removed and require explicit `OBSERRA_SUPABASE_URL` HTTPS configuration:

- `lib/florida-class-d-quality.ts`
- `lib/florida-class-d-completion.ts`
- `lib/florida-class-d-lias.ts`

These changes preserve the existing protected service-role credential boundary and fail closed with their existing service-specific configuration errors when an explicit valid runtime URL is absent.

This is remediation progress only. Gate 25 is not accepted because additional regulated modules still require review and any remaining embedded Supabase project URL must be removed before enforcement is enabled.

## Remaining known remediation scope

Prior source review identified hardcoded Supabase project URL fallbacks in additional regulated server modules, including live persistence, live media authorization persistence, completion-document handling, and potentially other legacy regulated services. The Gate 23 acceptance service and Gate 24 text-screen service already use explicit protected Supabase configuration without a hardcoded project fallback.

The runtime-isolation audit remains the source-of-truth inventory mechanism for completing this remediation. Each flagged regulated file must be corrected and then rechecked in enforcement mode.

## Acceptance criteria

Gate 25 is not accepted until all of the following are true:

1. The runtime-isolation audit reports zero embedded Supabase project URLs in regulated `lib/florida-class-d*.ts` modules.
2. No regulated server module uses a `NEXT_PUBLIC_*` variable for a secret, service-role key, API key, token, or password.
3. Regulated Supabase persistence fails closed when an explicit HTTPS runtime URL or protected service-role credential is absent.
4. Existing regulated tests, Gates 1 through 24, lint, and the production Next.js build remain green.
5. The audit is added to the required Florida Class D CI workflow in enforcement mode.
6. `HANDOFF.md`, `LATEST-HANDOFF.md`, this handoff, the DS submission/audit control, and PR #56 are synchronized to the accepted Gate 25 head.

## Production boundary

No production environment value is to be committed to the repository during this remediation. No production database migration is required merely to remove source-level URL fallbacks. Regulated feature flags remain fail closed.

## Audit evidence

The final Gate 25 evidence must include the enforcing CI step and a green workflow showing zero runtime-isolation findings. Evidence must not print secret values, service-role keys, license numbers, or private configuration content.

## Restart instruction

Continue the runtime-isolation inventory and remediate every remaining regulated server module that embeds a Supabase project URL fallback. Then enable `--enforce` in the dedicated Florida Class D workflow and rerun the complete regulated validation. Do not call Gate 25 accepted until the complete Gates 1 through 25 cycle passes source verification, repository tests, lint, and production build.