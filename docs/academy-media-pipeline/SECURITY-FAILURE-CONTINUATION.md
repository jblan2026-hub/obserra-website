# Obserra Academy Security Failure Continuation

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Recorded: 2026-08-11

Status: Append-only continuation of `FAILURE-REGISTER.md` after Failure 18

## Failure 19: Security integration production build missed a required component property

### Action

Added server-only Supabase authorization, fail-closed Academy controls, and security regression tests, then ran GitHub Actions.

### Result

The test suite passed and lint passed, but the Next.js production build failed because:

```text
app/academy/AcademyClient.tsx
```

did not provide the required `cinematicMediaEnabled` property to `AcademyControlledClient`.

### Root cause

The primary Academy page had already been updated for the cinematic-media contract. A legacy wrapper remained on the older component signature and was not included in the initial security-change review.

### Impact

The security integration was not eligible for merge. No deployment or production cutover occurred.

### Correction

Updated the wrapper to pass:

```text
cinematicMediaEnabled={false}
```

This is the secure default and preserves the static-poster fallback.

### Prevention rule

When a shared component contract changes, search every import and invocation before declaring the branch build-ready. Security changes must pass the complete production build, not only targeted tests.

## Failure 20: First inert Edge Function deployment inherited an invalid import-map path

### Action

Attempted to replace `academy-checkpoint-gateway` with a minimal inert 404 implementation.

### Result

Supabase returned a bad-request error because the new function version inherited the prior absolute import-map path, which did not exist in the new deployment workspace.

### Root cause

The old function used an import map. The first replacement supplied only `index.ts` and did not explicitly replace `import_map_path`.

### Impact

The first inert deployment did not apply. The previous function version remained active until the corrected deployment succeeded.

### Correction

1. Added a minimal `deno.json` to the deployment payload.
2. Set `import_map_path` to `deno.json`.
3. Redeployed successfully as version 5.
4. Used the same explicit minimal import-map pattern for subsequent inert replacements.

### Prevention rule

When replacing a function that previously used an import map, always provide a valid replacement import map and path, even when the new implementation imports no external package.

## Failure 21: One static authorization token was reused across multiple service-role functions

### Verified condition

Multiple legacy Edge Functions embedded the same SHA-256 token digest:

```text
49fd34b00dd348760f632382d4a284d0c5036bae5a71e1d2beaa7603090236c7
```

The functions performed high-privilege service-role database operations across Academy worker control, diagnostics, publication, owner work, application work, persistent memory, and production control.

### Root cause

Legacy automation used one long-lived shared bearer token instead of independent short-lived identities and least-privilege credentials.

### Impact

Compromise of one token could authorize multiple unrelated high-privilege functions and create excessive blast radius.

The original token value was not returned by this review and is not recorded in the repository handoff.

### Correction

1. Replaced every function accepting the digest with inert code.
2. Enabled platform JWT verification on every function record.
3. Removed service-role database access from all twelve retired functions.
4. Recorded the digest as retired.

### Remaining action

Revoke or rotate the original token anywhere it may remain in local scripts, environment variables, CI secrets, secret managers, or operator workstations.

### Prevention rule

Never reuse one static bearer token across multiple privileged services. Use independent credentials, short token lifetimes, exact audience and issuer validation, least privilege, and independent rotation.

## Failure 22: Legacy owner and automation functions were broader than the approved commercial architecture

### Verified condition

The Supabase project retained active functions for:

1. A retired local Windows worker farm.
2. Local worker diagnostics.
3. GitHub checkpoint ingestion tied to a separate public repository.
4. Command-center publication.
5. Application worker orchestration.
6. Owner-work automation.
7. Persistent Obserrian memory and actions.
8. Production-control and release queues.

### Impact

Every additional privileged function expanded the attack surface and exposed operational or intellectual-property data beyond the approved LearnWorlds, HeyGen, Pollo, and website architecture.

### Correction

All twelve non-catalog functions were made inert and now return a generic 404 behind platform JWT verification.

### Prevention rule

Retire obsolete APIs when the product architecture changes. Maintain an Edge Function inventory and require explicit reauthorization for every retained function.

## Failure 23: Forensic logs are insufficient to rule out prior unauthorized access

### Action

Reviewed available Supabase API, Edge Function, Auth, and Postgres logs after the public-exposure notice.

### Result

The available window showed repeated old public-catalog traffic and internal Deno or Edge Runtime reads, but the logs did not provide complete caller attribution or a sufficiently long retention window to prove that every request was authorized.

### Impact

No evidence currently proves data theft. No evidence currently supports declaring the environment uncompromised.

### Correction status

Initial log review is recorded. Additional review is required across the longest available retention period, including project access, API, Auth, database, Edge Function, GitHub, Vercel, and secret-manager records.

### Prevention rule

Enable and retain security-relevant logs sufficient for caller attribution, alert on anomalous access, and preserve forensic evidence before rotation or deletion.

## Failure 24: Making owner-control inert interrupts any existing owner-control client

### Action

Replaced `academy-owner-control` with an inert 404 function during emergency containment.

### Result

Any website or owner-site operation still targeting that Edge Function will fail closed.

### Root cause

The owner-control function combined sensitive database access, custom external identity verification, broad preview-origin acceptance, and a publicly reachable function record. The owner identity table also had no bound owner record in the reviewed state.

### Impact

Owner-control editing and mutation features are unavailable until a new isolated owner-only control plane is designed and accepted.

This is an intentional availability tradeoff to protect confidentiality and integrity.

### Correction status

No restoration is authorized. A future replacement must use the private owner site, exact issuer and audience validation, exact origin allowlisting, independent short-lived credentials, least privilege, rate limiting, and complete audit logging.

### Prevention rule

Do not preserve a sensitive control endpoint merely to avoid temporary availability loss when its authorization and exposure boundaries are unresolved.

## Current truth boundary

```text
Direct public-schema access: blocked
RLS enabled and forced: 58 of 58 public base tables
Public table grants to anon or authenticated: 0
Public function grants to anon or authenticated: 0
Public views using security invoker: 9 of 9
All Edge Function records with platform JWT verification: 13 of 13
Retired functions replaced with inert 404 implementations: 12
Functional service-role-only functions: 1
Website private-control code: implemented
Website fail-closed defaults: implemented
Website security tests: implemented
Current-head CI: pending
Owner-control availability: intentionally disabled
Service-role key rotation: incomplete
Legacy shared-token revocation outside function source: not proven
Forensic review: incomplete
GitHub repository private: no
Full security closure: no
```

No data-theft claim, no uncompromised claim, no merge claim, and no production-readiness claim is authorized.
