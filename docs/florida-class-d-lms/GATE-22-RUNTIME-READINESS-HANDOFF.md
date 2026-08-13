# Florida Class D LMS Gate 22 Handoff

Snapshot: 2026-08-13

## Scope

Gate 22 currently implements protected **production-runtime configuration readiness** checks for the regulated Florida Class D LMS. It does not activate regulated functions and does not expose secret values.

## Implemented controls

- Server-only runtime readiness service.
- Protected school-admin/compliance-admin readiness API.
- Protected administrative readiness page.
- Explicit checks for Clerk server/client configuration presence.
- Explicit protected Supabase HTTPS URL requirement.
- Supabase service-role credential presence check without returning the credential.
- Daily live-media provider and API credential presence checks.
- Private Class DS and Class DI configuration checks without displaying license numbers.
- Private completion-document bucket configuration check.
- Regulated feature-flag inspection with the readiness expectation that those flags remain disabled until controlled activation.
- Readiness results return only booleans, labels, safe status text, blocker identifiers, and the names of enabled feature flags. Secret values, tokens, license numbers, bucket names, and infrastructure hostnames are suppressed.

## Current sequencing finding

A repository alignment review performed after Florida Class D LMS Gates run #375 identified an important distinction between **production activation readiness** and the **non-production readiness required before Gate 23 acceptance execution**.

The current `lib/florida-class-d-runtime-readiness.ts` report is production-oriented. Its production readiness result requires the Class DS school license status to be active and requires a private Class DS license number. Those are valid production-activation controls and must remain fail closed while the Class DS school application is pending.

However, the next controlled milestone is an actual Gate 23 acceptance execution in development, sandbox, staging, or UAT using synthetic identities only. That non-production acceptance must not require the Class DS license to be marked active and must not require a Class DS license number to be populated before one is actually issued.

Therefore, the current production readiness result must **not** be used as the sole authorization predicate for Gate 23 non-production acceptance. Until the runtime-readiness implementation exposes a separately controlled non-production acceptance-readiness profile, operators must treat Gate 22 production readiness and Gate 23 non-production execution readiness as distinct controls.

## Required non-production readiness remediation

Before the actual Gate 23 non-production acceptance run is executed, the runtime-readiness implementation should provide a separate fail-closed non-production acceptance profile that verifies, without exposing secret values:

1. The runtime is explicitly identified as `development`, `sandbox`, `staging`, or `uat` and not production.
2. Non-production acceptance has been explicitly authorized for that runtime.
3. Synthetic-identity-only mode is explicitly enabled.
4. Protected Clerk identity configuration is present.
5. An explicit protected HTTPS Supabase runtime URL and protected server-side service credential are present for the authorized non-production database.
6. Daily live-media configuration required for acceptance testing is present.
7. Private completion-document storage required for acceptance testing is configured.
8. Regulated production feature flags remain disabled unless a narrowly scoped non-production test procedure explicitly requires an approved test-only behavior.
9. The non-production readiness result does not require an active Class DS school license or a Class DS license number.
10. Production activation readiness continues to require the applicable license status, private license number, production configuration, regulatory authorization, and owner approval.

The non-production acceptance profile must not infer that a protected database is non-production from a hostname alone. It should require an explicit controlled environment designation and authorization marker in addition to protected configuration presence.

## Feature flags covered by the current production readiness report

- `OBSERRA_FDACS_CLASS_D_LIVE_ENABLED`
- `OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED`
- `OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED`
- `OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED`
- `OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED`

Additional regulated feature flags must be added to this inventory as new runtime-controlled modules are introduced.

## Licensing boundary

`OBSERRA_FDACS_DS_LICENSE_STATUS` must not be set to `active`, and a Class DS license number must not be populated, until an actual Class DS license has been issued and controlled production activation is authorized. Class DI and Class DS license values remain private configuration and are never written into the public repository or readiness response.

The absence of an issued Class DS license is a production activation blocker. It is not, by itself, a blocker to a properly isolated, explicitly authorized, synthetic-only non-production acceptance execution.

## Completion and certificate boundary

Runtime readiness does not change the completion standard. Forty instructional hours alone do not earn a completion certificate. The learner must satisfy the controlled successful-completion requirements, including the passing 170-question final examination at 128/170 or better and authorized completion approval, before supplemental Obserra completion documents may be generated. The official FDACS-16103 remains a LIAS-generated state document.

## Primary artifacts

- `lib/florida-class-d-runtime-readiness.ts`
- `app/api/florida-class-d/admin/runtime-readiness/route.ts`
- `app/florida-security-training/admin/runtime-readiness/page.tsx`
- `scripts/florida-class-d-runtime-readiness-gate.mjs`
- `docs/florida-class-d-lms/GATE-22-RUNTIME-READINESS-HANDOFF.md`

## Release boundary

Gate 22 production configuration-readiness evidence is not FDACS approval, database-promotion approval, launch authorization, or permission to turn on regulated production feature flags. Production activation remains a later controlled decision after regulatory authorization, database verification, end-to-end testing, security/operational acceptance, and owner approval.

The next operational milestone remains controlled Gate 23 non-production acceptance using synthetic identities only after an authorized non-production runtime has been configured and separately verified as non-production-ready. No production database migration, real learner acceptance, production activation, LIAS production execution, certificate release, or FDACS approval claim is authorized by this handoff.
