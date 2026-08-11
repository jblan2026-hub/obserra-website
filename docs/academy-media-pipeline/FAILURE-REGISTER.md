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

## Current truth boundary

The learner dashboard shells, deterministic media factory, common cinematic enterprise standard, provider readiness adapter, owner-only status route, asset intake pipeline, LearnWorlds shell plan, website cinematic media slots, four official-brand website advertisements, Pollo production prompts, poster fallbacks, feature flag, tests, canary production pack, and audit documentation exist on the working branch.

Current-head GitHub Actions validation is required before the latest website implementation can be represented as passing.

No HeyGen likeness canary, complete Cybersecurity Foundations cinematic package, remaining LearnWorlds shell transfer, Pollo website MP4 render, Pollo website MP4 upload, cinematic website activation, LearnWorlds publication, production cutover, or customer release is claimed complete.
