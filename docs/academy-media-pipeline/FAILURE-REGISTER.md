# Obserra Academy HeyGen and Pollo Pipeline Failure Register

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Recorded: 2026-08-11

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

### Prevention rule

Secret-boundary tests must inspect serialized return schemas, route response objects, or isolated result-shape declarations. Do not infer a response leak from a broad source slice that includes internal request construction.

## Current truth boundary

The deterministic media factory, provider readiness adapter, asset intake pipeline, tests, canary production pack, and audit documentation exist on the draft branch. No HeyGen asset, Pollo asset, LearnWorlds publication, website cutover, production purchase, or customer access is claimed complete. Current-head CI must pass after the Failure 6 correction before merge or deployment promotion.
