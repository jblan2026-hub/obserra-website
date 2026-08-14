# Florida Class D LMS Gate 22 Handoff

Snapshot: 2026-08-13

## Scope

Gate 22 implements separate protected runtime-readiness profiles for the regulated Florida Class D LMS:

- **Production activation readiness**
- **Non-production acceptance readiness**

This readiness evidence does not activate regulated functions. Neither profile exposes secret values, authorizes launch, or represents FDACS approval. Protected credentials, license values, tokens, and other sensitive configuration are never written into the public repository.

## Implemented controls

- Server-only runtime readiness service.
- Protected school-admin/compliance-admin readiness API.
- Protected administrative readiness page.
- Backward-compatible default readiness response remains production-oriented.
- Explicit production and non-production readiness evaluators.
- Explicit checks for Clerk server/client configuration presence.
- Explicit protected Supabase HTTPS URL requirement.
- Supabase service-role credential presence check without returning the credential.
- Daily live-media provider and API credential presence checks.
- Private Class DI instructor license configuration check without displaying the license number.
- Private completion-document bucket configuration check.
- Regulated feature-flag inspection with the readiness expectation that those flags remain disabled until controlled activation.
- Readiness results return only booleans, labels, safe status text, blocker identifiers, and enabled feature-flag names. Secret values, tokens, license numbers, bucket names, and infrastructure hostnames are suppressed.

## Production activation readiness

The production profile requires the protected technical runtime controls and retains Class DS licensing as a distinct production-only boundary.

Production readiness requires:

1. Clerk publishable and server credentials are configured.
2. `OBSERRA_FDACS_SUPABASE_URL` is explicitly configured as HTTPS.
3. A protected Supabase service-role credential is configured server-side.
4. Daily is configured as the live-media provider and the protected Daily API credential is present.
5. The private Class DI instructor license value is configured.
6. The private completion-document bucket is configured.
7. Regulated production feature flags remain disabled during readiness review.
8. The Class DS school license status is active only after actual issuance and controlled authorization.
9. The Class DS license number is present only after actual issuance and remains private.

The production report distinguishes three states:

- `READY FOR CONTROLLED ACTIVATION REVIEW` only when there are zero blockers.
- `READY EXCEPT CLASS DS LICENSE` only when every non-license technical blocker is clear and the remaining blockers are limited to the Class DS license status and/or Class DS license number.
- `FAIL CLOSED` for any other blocked state.

`READY EXCEPT CLASS DS LICENSE` is a staged technical-readiness state. It is not permission to activate production.

## Non-production acceptance readiness

The separate non-production profile is now implemented for development, sandbox, staging, or UAT acceptance using synthetic identities only.

It verifies, without exposing protected values:

1. `OBSERRA_FDACS_RUNTIME_ENVIRONMENT` is explicitly one of `development`, `sandbox`, `staging`, or `uat`.
2. `OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED` is explicitly enabled.
3. `OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY` is explicitly enabled.
4. Protected Clerk identity configuration is present.
5. An explicit protected HTTPS Supabase runtime URL and protected server-side service credential are present.
6. Daily live-media configuration required for acceptance testing is present.
7. Private completion-document storage required for acceptance testing is configured.
8. The private Class DI instructor license value is configured.
9. Regulated production feature flags remain disabled during readiness review.
10. The profile does not inspect or require Class DS license status or a Class DS license number.

The non-production profile does not infer environment classification from a hostname. The explicit environment designation and authorization markers are required and fail closed.

## Feature flags covered by Gate 22

- `OBSERRA_FDACS_CLASS_D_LIVE_ENABLED`
- `OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED`
- `OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED`
- `OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED`
- `OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED`

Additional regulated feature flags must be added to this inventory as new runtime-controlled modules are introduced.

## Licensing boundary

`OBSERRA_FDACS_DS_LICENSE_STATUS` must not be set to `active`, and a Class DS license number must not be populated, until an actual Class DS license has been issued and controlled production activation is authorized. Class DI and Class DS license values remain private configuration and are never written into the public repository or readiness response.

The absence of an issued Class DS license is a production activation blocker. It is not, by itself, a blocker to a properly isolated, explicitly authorized, synthetic-only non-production acceptance execution.

Class DS license issuance does not automatically activate the regulated LMS. Production activation remains a controlled decision after applicable regulatory authorization, production verification, end-to-end testing, security and operational acceptance, and owner approval.

## Completion and certificate boundary

Runtime readiness does not change the completion standard. Forty instructional hours alone do not earn a completion certificate. The learner must satisfy the controlled successful-completion requirements, including the passing 170-question final examination at 128/170 or better and authorized completion approval, before supplemental Obserra completion documents may be generated. The official FDACS-16103 remains a LIAS-generated state document.

## Primary artifacts

- `lib/florida-class-d-runtime-readiness.ts`
- `app/api/florida-class-d/admin/runtime-readiness/route.ts`
- `app/florida-security-training/admin/runtime-readiness/page.tsx`
- `scripts/florida-class-d-runtime-readiness-gate.mjs`
- `proxy.ts`
- `docs/florida-class-d-lms/GATE-22-RUNTIME-READINESS-HANDOFF.md`

## Release boundary

Gate 22 runtime-readiness evidence is not FDACS approval, database-promotion approval, launch authorization, or permission to turn on regulated production feature flags.

The next operational milestone is controlled Gate 23 non-production acceptance using synthetic identities only after an authorized non-production runtime is configured and the non-production readiness profile reports ready. Production remains fail closed until the actual Class DS license is issued and privately configured, applicable regulatory and production acceptance gates are satisfied, and owner approval is recorded.

No real learner acceptance, LIAS production execution, certificate release, or FDACS approval claim is authorized by this handoff.
