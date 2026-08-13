# Florida Class D LMS Gate 22 Handoff

## Scope

Gate 22 adds protected production-runtime configuration readiness checks for the regulated Florida Class D LMS. It does not activate regulated functions and does not expose secret values.

## Implemented controls

- Server-only runtime readiness service.
- Protected school-admin/compliance-admin readiness API.
- Protected administrative readiness page.
- Explicit checks for Clerk server/client configuration presence.
- Explicit production Supabase HTTPS URL requirement.
- Supabase service-role credential presence check without returning the credential.
- Daily live-media provider and API credential presence checks.
- Private Class DS and Class DI configuration checks without displaying license numbers.
- Private completion-document bucket configuration check.
- Regulated feature-flag inspection with the readiness expectation that those flags remain disabled until controlled activation.
- Readiness results return only booleans, labels, safe status text, blocker identifiers, and the names of enabled feature flags. Secret values, tokens, license numbers, bucket names, and infrastructure hostnames are suppressed.

## Feature flags covered by the current readiness report

- `OBSERRA_FDACS_CLASS_D_LIVE_ENABLED`
- `OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED`
- `OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED`
- `OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED`
- `OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED`

Additional regulated feature flags must be added to this inventory as new runtime-controlled modules are introduced.

## Licensing boundary

`OBSERRA_FDACS_DS_LICENSE_STATUS` must not be set to `active`, and a Class DS license number must not be populated, until an actual Class DS license has been issued and controlled production activation is authorized. Class DI and Class DS license values remain private configuration and are never written into the public repository or readiness response.

## Completion and certificate boundary

Runtime readiness does not change the completion standard. Forty instructional hours alone do not earn a completion certificate. The learner must satisfy the controlled successful-completion requirements, including the passing 170-question final examination at 128/170 or better and authorized completion approval, before supplemental Obserra completion documents may be generated. The official FDACS-16103 remains a LIAS-generated state document.

## Primary artifacts

- `lib/florida-class-d-runtime-readiness.ts`
- `app/api/florida-class-d/admin/runtime-readiness/route.ts`
- `app/florida-security-training/admin/runtime-readiness/page.tsx`
- `scripts/florida-class-d-runtime-readiness-gate.mjs`
- `docs/florida-class-d-lms/GATE-22-RUNTIME-READINESS-HANDOFF.md`

## Release boundary

Gate 22 is configuration-readiness evidence only. A green readiness report is not FDACS approval, database-promotion approval, launch authorization, or permission to turn on regulated feature flags. Production activation remains a later controlled decision after regulatory authorization, database verification, end-to-end testing, security/operational acceptance, and owner approval.
