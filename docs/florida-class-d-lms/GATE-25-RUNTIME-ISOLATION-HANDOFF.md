# Gate 25 Regulated Runtime Isolation Handoff

Snapshot: 2026-08-13

## Purpose

Gate 25 strengthens the regulated Florida Class D runtime boundary by removing hardcoded Supabase project URL fallbacks from regulated server modules and requiring explicit protected HTTPS runtime configuration before those services can operate.

## Current state

**ACCEPTED SOURCE/BUILD BASELINE / ENFORCEMENT ACTIVE / ZERO FINDINGS / PRODUCTION ACTIVATION DISABLED**

Gate 25 is accepted at source/build commit `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` based on Florida Class D LMS Gates run #367. The dedicated workflow `Gates 1-25 and website compatibility` completed successfully on that head.

Gate 25 uses `scripts/florida-class-d-runtime-isolation-audit.mjs --enforce`. The audit scans regulated `lib/florida-class-d*.ts` server modules for embedded Supabase project URLs and environment names that would improperly expose secret-class configuration through `NEXT_PUBLIC_*` variables. The enforcing step remains mandatory and fails the Class D workflow whenever findings are present.

## Security objective

Regulated server modules must fail closed when `OBSERRA_SUPABASE_URL` or the required service-role credential is absent. They must not silently fall back to a repository-embedded project URL. Production project identifiers, service-role values, provider secrets, license numbers, and other protected runtime values must remain outside public source.

The approved configuration boundary is server-only explicit environment configuration using HTTPS and protected credentials. No regulated browser component may receive service-role credentials.

## Remediation completed

The runtime-isolation remediation removed the embedded Supabase project URL fallback from every regulated module identified by the Gate 25 enforcing inventory, including acceptance, completion, completion documents, completion packet, exam, exam administration, exam monitoring, exam retest, LIAS, live feed, live persistence, live reporting, secure media, base persistence, polls, quality/CAPA, scheduling, student certificate, make-up certification, make-up administration, recorded make-up, and regulatory observer access.

These services now require explicit protected `OBSERRA_SUPABASE_URL` HTTPS configuration and preserve the protected service-role credential boundary. When required runtime configuration is absent or invalid, the regulated service fails closed with its service-specific configuration error.

## Acceptance evidence

Florida Class D LMS Gates run #367 on source head `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` completed successfully.

The successful regulated cycle includes:

1. Gates 1 through 21 source verification.
2. Gate 22 protected runtime-readiness verification.
3. Gate 23 non-production acceptance artifact verification.
4. Gate 24 instructional text-screen source verification.
5. Gate 25 regulated runtime-isolation enforcement with zero findings.
6. Repository contract tests.
7. Static quality validation/lint.
8. Production Next.js application build.

Website CI, Application Release Validation, and Application Production Pipeline also completed successfully on the same source head. The separate Academy 70x workflow failure is unrelated to the Florida Class D regulated LMS gate and does not supersede the dedicated Class D evidence.

## Acceptance criteria status

Gate 25 acceptance criteria are satisfied at the accepted source/build head:

1. The runtime-isolation audit reports zero embedded Supabase project URLs in regulated `lib/florida-class-d*.ts` modules.
2. No regulated server module uses a `NEXT_PUBLIC_*` variable for a secret, service-role key, API key, token, or password.
3. Regulated persistence requires explicit protected HTTPS runtime configuration and protected server-side credentials.
4. Existing regulated tests, Gates 1 through 24, lint, and the production Next.js build are green.
5. The mandatory Gate 25 CI enforcement step is green.
6. The Gate 25 handoff and restart/audit records are being synchronized to the accepted Gate 25 baseline.

## Production boundary

Gate 25 acceptance establishes source/build runtime-isolation compliance only. It does not authorize public enrollment, production database promotion, production runtime activation, real-learner acceptance execution, LIAS production execution, certificate release, regulated launch, or any representation of FDACS approval.

No production database migration or production configuration activation was performed as part of Gate 25 source hardening. Regulated feature flags remain fail closed until the applicable production and regulatory controls are satisfied.

## Audit evidence rule

The accepted Gate 25 evidence is the mandatory enforcing CI result at run #367 and the source state at `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`. Audit evidence must not expose the configured Supabase URL, project identifier, service-role value, credentials, provider secrets, license numbers, learner PII, protected examination content, or other protected runtime data.

## Restart instruction

Treat `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d` as the accepted Gate 25 source/build baseline. Continue with controlled non-production runtime acceptance, production-readiness evidence, the Division-approved examination-bank boundary, submission-guide evidence updates, and owner/admin LMS access preparation. Keep public enrollment, production database promotion, production runtime activation, LIAS production execution, and regulated launch disabled until their separate authorization and acceptance gates are satisfied. Do not treat CI as FDACS approval, do not generate FDACS-16103 locally, and do not issue a course-completion certificate for hours alone.
