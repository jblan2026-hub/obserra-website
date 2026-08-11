# Obserra Academy HeyGen and Pollo Pipeline Failure Register

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Recorded: 2026-08-11

Last updated: 2026-08-11

Status: Permanent audit record

## Failure 1: Direct repository clone unavailable in the build environment

### Action

Attempted to clone the authenticated repository into the local build environment.

```text
git clone https://github.com/jblan2026-hub/obserra-website.git
```

### Result

```text
Could not resolve host: github.com
```

### Impact

The local container could not perform a repository-integrated build from a direct clone.

### Correction

Repository reads and writes were performed with the authenticated GitHub connector. The new media-factory code was tested independently with deterministic fixtures, then committed to the governed branch and validated through GitHub Actions.

### Prevention rule

Never claim a local repository clone, local full build, or local deployment when network resolution prevents the clone. Use connector evidence and repository CI as the source of truth.

## Failure 2: Unrelated dependency drift introduced during package script update

### Action

Updated `package.json` to add media-planning and validation scripts.

### Result

The first replacement unintentionally changed:

```text
@types/react-dom: ^19.0.2
```

to:

```text
@types/react-dom: ^19.2.3
```

### Impact

The media change would have included an unrelated dependency modification and could have changed the lockfile or build behavior.

### Correction

Restored `@types/react-dom` to `^19.0.2` immediately. No dependency upgrade is part of the media-pipeline scope.

### Prevention rule

When replacing a complete package manifest, compare every dependency and development dependency before committing. Script-only changes must not alter dependency versions.

## Failure 3: Pull-request update used an invalid same-repository collaboration option

### Action

Attempted to update pull request 55 while setting `maintainer_can_modify=true`.

### Result

GitHub returned:

```text
422 Validation Failed
Fork collab can only be enabled on cross-repo pull requests
```

### Impact

The first pull-request metadata update did not apply.

### Correction

Retried the update without the cross-repository collaboration parameter. The pull-request title and complete LearnWorlds, HeyGen, and Pollo implementation description were updated successfully.

### Prevention rule

Do not set fork-collaboration options on same-repository pull requests.

## Failure 4: One Vercel deployment scope could not be inspected

### Action

Attempted to inspect the failing `Vercel – obserra-website-live` deployment from the GitHub status URL.

### Result

The Vercel connector returned `403 forbidden` for scope `obserra-59e6b33d` and identified team `team_OlQtSwNE72O3PSVJV92XAz6w` as a scope that requires reauthentication.

### Impact

The cause of that one Vercel status could not be verified. No conclusion about its root cause is authorized.

### Correction

Recorded the deployment status as unresolved and retained the other successful Vercel deployment statuses. Production cutover remains blocked independently by the LearnWorlds and media canary acceptance gates.

### Prevention rule

Never infer a Vercel failure cause without authenticated deployment logs. Reauthenticate to the exact project scope before diagnosing or changing that deployment.

## Failure 5: Intermediate CI runs were cancelled by newer commits

### Action

Committed configuration, canary documentation, and handoff updates in sequence.

### Result

GitHub cancelled intermediate workflow runs after newer commits superseded them.

### Impact

Those cancelled runs are not passing or failing evidence for the final branch head.

### Correction

Retained the successful CI evidence from the code-bearing commit and added a real-catalog test to the latest branch. Final promotion still requires CI on the current head.

### Prevention rule

Do not represent cancelled workflow runs as successful validation. Cite the exact commit SHA associated with each passing result.

## Failure 6: Secret-return regression test inspected implementation source instead of returned result shape

### Action

Added a regression test intended to prove that the optional HeyGen and Pollo readiness probe never returns provider credentials.

### Result

GitHub Actions executed 61 tests. Sixty passed and one failed:

```text
media service probe is bounded and returns no provider secrets
Expected source slice not to match /API_KEY/
Found: process.env.POLLO_API_KEY in outbound request construction
```

All four pull-request workflows failed at the shared `npm test` gate because they consume the same repository test suite.

### Root cause

The runtime adapter did not return a secret. The test took a broad source-code slice immediately before the return statement. That slice legitimately contained the secure outbound request header construction using the environment-variable name `POLLO_API_KEY`. The assertion therefore tested implementation text rather than the shape of the object returned to the owner endpoint.

### Impact

The current-head CI was red and lint, build, application validation, and release promotion did not proceed. No production deployment or external provider generation occurred.

### Correction

Replaced the broad source-slice assertion with a precise test that isolates the declared sanitized `result` object shape, verifies that shape contains no credential fields, and separately confirms the return boundary is exactly:

```text
return { status, probe: result } as const
```

The existing owner-route test continues to verify that neither `HEYGEN_API_KEY` nor `POLLO_API_KEY` appears in the public response route.

### Verification evidence

GitHub Actions validated commit:

```text
50fea832849c3456626f4ffb0b75627b27bf2c16
```

Results:

```text
Tests: 61
Passed: 61
Failed: 0
Website CI: passed
Academy 70x Production Gate: passed
Application Production Pipeline: passed
Application Release Validation: passed
Production build: passed
```

### Prevention rule

Secret-boundary tests must inspect serialized return schemas, route response objects, or isolated result-shape declarations. Do not infer a response leak from a broad source slice that includes internal request construction.

## Failure 7: Cinematic configuration update used a stale blob SHA

### Action

Attempted to replace `config/academy-media-factory.json` after reading an earlier revision.

### Result

GitHub returned:

```text
409 Conflict
config/academy-media-factory.json does not match the supplied SHA
```

### Root cause

The actively changing branch received another committed update after the earlier read. The first replacement therefore used a stale blob SHA.

### Impact

The first cinematic configuration replacement did not apply. No configuration data was lost and no production action occurred.

### Correction

1. Re-read the current file and blob SHA.
2. Preserved the already committed cinematic controls.
3. Merged the stricter common quality standard, 20 second presenter limit, five module films, five visual packs, and updated portfolio totals.
4. Updated the file using the current SHA.

### Prevention rule

Re-read the exact target file immediately before every sequential update on an actively changing branch. A prior read is not sufficient when another commit may have modified the path.

## Failure 8: Cinematic test create action targeted a path that already existed

### Action

Attempted to create:

```text
test/academy-cinematic-production-standard.test.mjs
```

### Result

GitHub returned:

```text
422 Invalid request
sha was not supplied
```

### Root cause

The path already existed from another committed action. A create request was therefore invalid for the existing file.

### Impact

The new test content was not written on the first attempt. No existing test was deleted or overwritten.

### Correction

1. Fetched the existing file and current blob SHA.
2. Replaced it through `update_file`.
3. Preserved the original cinematic test intent.
4. Aligned the assertions to the machine-readable standard, 20 second avatar limit, 1020 asset portfolio, same-quality rule, and LearnWorlds playback controls.

### Prevention rule

Before creating a file in an actively changing branch, verify whether the exact path already exists. Use `update_file` with the current blob SHA when it does.

## Failure 9: Cinematic documentation assertion failed on equivalent wording

### Action

Strengthened the cinematic production document and its automated contract test.

### Result

At commit `89fdbdad274d11480f3a7de72cf7f5dded53e9d6`, GitHub Actions executed 79 tests:

```text
Passed: 78
Failed: 1
```

The failing assertion expected:

```text
not a robotic avatar presentation
```

The document stated:

```text
must not feel like a robotic avatar presentation
```

### Root cause

The test asserted one exact connective phrase instead of the durable policy concept. The document still prohibited robotic avatar presentation, static avatar only course videos, robotic narration over static slides, and uninterrupted avatar segments longer than 20 seconds.

### Impact

Website CI, Academy 70x, Application Release Validation, and the shared application pipeline reported failure or remained blocked. No merge, provider generation, LearnWorlds upload, or production cutover occurred.

### Correction

Updated the documentation assertions to validate the durable semantic requirements:

```text
robotic avatar presentation
no uninterrupted avatar segment may exceed 20 seconds
full course videos consisting only of a talking avatar
robotic narration over static slides
```

Correction commit:

```text
a04576292044ddc11122b0d08905b6f4987cd9a0
```

### Prevention rule

Documentation contract tests must validate stable policy language and required concepts. They must not fail a release because a grammatically equivalent sentence uses a different connective phrase.

## Failure 10: LearnWorlds shell manifests do not equal uploaded LearnWorlds courses

### Action

Created a governed 60 course LearnWorlds shell manifest, CSV, validation record, and controlled clone plan.

### Result

The repository can generate and validate all 60 Draft shell definitions, but this environment has not executed an authenticated LearnWorlds course creation or clone operation. The owner screenshot still proves only the existing Cybersecurity Foundations course in the LearnWorlds course manager.

### Root cause

No direct authenticated LearnWorlds authoring connector is available in this conversation. Current connector access has not established a supported course creation operation that can be safely executed from here.

### Impact

The shell plan is ready, but the remaining LearnWorlds course shells are not claimed uploaded. Website learner shell visibility and repository manifests must not be confused with LearnWorlds authoring state.

### Correction

The repository keeps every planned shell in Draft and provides deterministic manifests for controlled cloning or a supported import. Actual LearnWorlds creation remains an authenticated owner or verified API execution step. The pipeline will record every created LearnWorlds course identifier and publication state when execution is proven.

### Prevention rule

Never claim LearnWorlds shells are uploaded because a CSV, manifest, portal card, or local package exists. Require authenticated LearnWorlds evidence for every created course shell.

## Failure 11: Failure register update also encountered an advancing branch SHA

### Action

Attempted to append Failures 7 through 10 to this register using the blob SHA read before additional automated handoff commits completed.

### Result

GitHub returned:

```text
409 Conflict
FAILURE-REGISTER.md does not match the supplied SHA
```

### Root cause

The branch continued to receive related cinematic and handoff commits during the documentation update.

### Impact

The first register replacement did not apply. No prior failure record was lost.

### Correction

Refetched the latest pull request head and this file, preserved all existing failures, and applied the complete replacement using the current blob SHA.

### Prevention rule

Treat audit files as concurrency sensitive. Refetch both the branch head and exact file blob immediately before replacing an authoritative handoff, activity ledger, or failure register.

## Failure 12: No direct Pollo rendering plugin or authenticated connector was available

### Action

Searched the available plugin catalog for a Pollo AI video generation integration so the website assets could be rendered directly from this environment.

### Result

```text
Plugins returned: 0
```

### Root cause

No installable Pollo AI plugin or authenticated Pollo authoring connector is exposed in the current environment.

### Impact

The repository implementation, website media slots, official brand ad copy, Pollo prompts, governed filenames, poster fallbacks, feature flag, and automated tests can be completed here. Direct authenticated rendering inside the owner's Pollo account cannot be claimed.

The six planned MP4 files remain unrendered and unuploaded. The website feature flag remains disabled, so the official static posters continue to display.

### Correction

1. Implemented a manual-web-subscription production path.
2. Created paste-ready Pollo prompts and shot sequences.
3. Created exact governed output filenames and repository paths.
4. Added official poster fallbacks.
5. Added reduced motion, pause, viewport playback, and error fallback controls.
6. Added a fail-closed feature flag that remains false until all active assets exist and are owner approved.
7. Added automated tests for the website media contract.

### Prevention rule

Never claim a Pollo asset was rendered, downloaded, uploaded, or activated without authenticated provider evidence and the actual approved MP4 file. Keep the feature flag disabled until every referenced active file is present and validated.

## Failure 13: Supabase public database exposure condition existed

### Trigger

The owner received a Supabase notice that an Obserra Academy table was publicly accessible.

### Verified condition

The initial security advisor and direct privilege inventory identified:

1. Multiple public schema tables without RLS.
2. Anonymous and authenticated privileges on exposed Academy production and operational objects.
3. Security definer views using owner privileges.
4. Security definer functions executable by anonymous or ordinary authenticated roles.
5. A publicly callable Academy catalog Edge Function that used a service role client internally.

### Impact

The condition created a credible risk of unauthorized database access, modification, operational disruption, or intellectual property exposure.

There is currently no evidence sufficient to claim that data was taken. There is also no forensic evidence sufficient to rule out unauthorized access.

### Correction

Applied the emergency lockdown migrations, forced RLS on all public base tables, removed direct public schema object privileges, changed views to security invoker, hardened the Academy catalog Edge Function, and blocked production release pending full review.

### Prevention rule

Every new public schema table must be deny by default at creation. Every Edge Function must have an explicit authentication classification. Security advisor review and direct privilege verification must be part of every database migration and release gate.

## Failure 14: Security inventory verification query used an invalid information schema column

### Action

Ran a consolidated grant verification query using `schema_name` against `information_schema.role_usage_grants`.

### Result

Postgres returned:

```text
ERROR 42703: column schema_name does not exist
```

### Root cause

`role_usage_grants` exposes `object_schema`, not `schema_name`.

### Impact

The first verification query did not complete. It made no database change and did not weaken containment.

### Correction

Inspected the information schema column names and reran the query using `object_schema`. Subsequent verification completed successfully.

### Prevention rule

Before writing consolidated catalog queries, verify the exact information schema columns for each source view. Treat a failed verification query as no evidence until a corrected query succeeds.

## Failure 15: Storage, Realtime, and GraphQL grants could not be fully removed by SQL migration

### Action

Applied migration `disable_unused_public_api_surfaces` to revoke anonymous and authenticated access from Storage, Realtime, and GraphQL schemas.

### Result

The migration succeeded, but post migration inspection still showed Supabase platform managed grants and schema usage on parts of Storage, Realtime, and GraphQL.

### Root cause

Supabase maintains system level privileges and role relationships for managed platform services. Database SQL revocation alone does not guarantee that every platform managed grant disappears.

### Impact

The unused service surfaces require additional project level configuration and application review. Direct access to the Obserra `public` schema remains independently blocked.

No Storage buckets currently exist, and Storage RLS is enabled with no permissive policies.

### Correction

Recorded the residual platform surface as unresolved. Planned review includes Supabase API settings, Storage, Realtime, GraphQL, network restrictions, and disabling or avoiding unused client surfaces.

### Prevention rule

Do not equate a successful revoke migration with complete managed service shutdown. Verify effective privileges and platform settings after every migration.

## Failure 16: Private Academy catalog hardening broke the existing unauthenticated website call

### Action

Upgraded `academy-public-catalog` to require a platform validated service role JWT.

### Result

The current website server request does not send an Authorization header, so the new private function rejects it.

### Root cause

The original integration treated the Academy catalog control function as a public endpoint. The security model changed before the website server adapter was updated.

### Impact

The control plane is contained but degraded. The website cannot retrieve Supabase control data through the existing path.

More importantly, the website catch path currently falls back to baseline courses and default published controls. This is fail open behavior for course visibility and purchasing.

### Correction status

Not yet complete. The next code change must add server only service role authorization and change every control service failure to fail closed.

### Prevention rule

Security boundary changes and application compatibility changes must be planned together. Any control plane failure must hide unpublished content and disable purchasing rather than exposing a default published state.

## Failure 17: Twelve active Edge Functions remain without platform JWT verification

### Verified condition

After hardening `academy-public-catalog`, the project contains:

```text
Active Edge Functions: 13
Platform JWT verification enabled: 1
Platform JWT verification disabled: 12
```

### Impact

Some functions may implement custom authentication, but that has not yet been verified function by function. Any function lacking effective custom authentication could expose operational or intellectual property data or allow unauthorized action.

### Correction status

Not yet complete. Each function must be reviewed and either retained with verified custom authentication, redeployed with platform JWT verification, restricted to service role only, disabled, or deleted.

### Prevention rule

Every Edge Function requires a documented authentication mode, caller population, data scope, authorization test, and retirement decision. Default to platform JWT verification unless a verified custom authentication design requires otherwise.

## Failure 18: GitHub repository containing internal Academy material is public

### Verified condition

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
```

### Impact

Internal implementation, system architecture, production planning, prompts, course structures, security controls, and other intellectual property may be copied from current or historical public repository content.

No secret value was intentionally identified in the current review. Public intellectual property exposure and public history exposure remain material risks even without committed credentials.

### Correction status

Not yet complete. The repository must be made private, access and forks reviewed, public history assessed, and affected credentials rotated if exposure is suspected.

### Prevention rule

Confidential Obserra development must use private repositories by default. Repository visibility, collaborators, installed applications, deploy keys, branch protection, and secret scanning must be verified before confidential work is committed.

## Current truth boundary

The emergency Supabase containment is implemented and verified for the exposed `public` schema:

```text
Public base tables: 58
RLS enabled and forced: 58
Anonymous public schema usage: false
Authenticated public schema usage: false
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Academy catalog Edge Function: service role only
```

The environment is not yet eligible to be described as fully secure. Website fail closed integration, remaining Edge Function review, managed API surface review, key rotation, forensic log review, and GitHub privacy remediation are incomplete.

The learner dashboard shells, deterministic media factory, common cinematic enterprise standard, provider readiness adapter, owner-only status route, asset intake pipeline, LearnWorlds shell plan, website cinematic media slots, four official-brand website advertisements, Pollo production prompts, poster fallbacks, feature flag, tests, canary production pack, and audit documentation exist on the working branch.

No HeyGen likeness canary, complete Cybersecurity Foundations cinematic package, remaining LearnWorlds shell transfer, Pollo website MP4 render, Pollo website MP4 upload, cinematic website activation, LearnWorlds publication, production cutover, customer release, or full security closure is claimed complete.
