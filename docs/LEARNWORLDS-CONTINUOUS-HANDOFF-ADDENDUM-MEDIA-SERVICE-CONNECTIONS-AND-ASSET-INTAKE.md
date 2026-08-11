# LearnWorlds Continuous Handoff Addendum: Media Service Connections and Asset Intake

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner direction

The owner directed continued course and pipeline setup while completing the authorized Dr. Jody Blanchard HeyGen avatar and voice. The required outcome is an end-to-end commercial production pipeline that connects LearnWorlds, the Obserra website, HeyGen, Pollo AI, Stripe, learner identity, media validation, owner approval, and multiplatform publishing.

## Implementation completed

### Governed provider connection configuration

Added:

```text
config/academy-media-services.json
```

The file records non-secret provider roles, governed HTTPS endpoints, manual and API integration modes, required environment variables, official documentation locations, probe timeouts, and security controls.

Provider roles remain:

```text
HeyGen: authoritative presenter
Pollo AI: cinematic visual and campaign
LearnWorlds: course delivery, commerce, and learner system
```

Automatic provider spending and automatic credit refill remain disabled. The owner's willingness to refill web-subscription credits does not authorize separately billed API usage.

### Fail-closed server adapter

Added:

```text
lib/academy-media-services.ts
```

The adapter:

1. Defaults HeyGen and Pollo to manual web-application mode.
2. Requires the authorized HeyGen avatar, voice, 16:9 template, and 9:16 template before manual readiness is true.
3. Requires Pollo private mode and manual setup evidence before manual readiness is true.
4. Supports separately authorized API mode through secure environment variables.
5. Validates exact provider HTTPS hostnames and paths.
6. Performs bounded optional live probes.
7. Returns status only and never returns API keys or secrets.
8. Keeps automatic spending and automatic refill disabled.

Official provider endpoints used for optional API readiness are:

```text
HeyGen template list: GET https://api.heygen.com/v2/templates
HeyGen video generation: POST https://api.heygen.com/v2/video/generate
HeyGen video status: GET https://api.heygen.com/v1/video_status.get
Pollo credit balance: GET https://pollo.ai/api/platform/credit/balance
Pollo task status: GET https://pollo.ai/api/platform/generation/{taskId}/status
```

### Owner-only readiness endpoint

Added:

```text
app/api/admin/academy-media/status/route.ts
```

The endpoint is protected by the existing Clerk owner-email rule, returns 404 to unauthorized callers, uses no-store and noindex headers, and supports an explicit `?probe=1` live connection test. It exposes readiness and sanitized provider status only.

### Secure deployment template

Updated:

```text
.env.example
```

The template now contains placeholders for:

```text
HEYGEN_INTEGRATION_MODE
HEYGEN_MANUAL_SETUP_COMPLETE
HEYGEN_AVATAR_ID
HEYGEN_VOICE_ID
HEYGEN_TEMPLATE_16X9_ID
HEYGEN_TEMPLATE_9X16_ID
HEYGEN_API_KEY
POLLO_INTEGRATION_MODE
POLLO_MANUAL_SETUP_COMPLETE
POLLO_PRIVATE_MODE_CONFIRMED
POLLO_DEFAULT_MODEL_PATH
POLLO_API_KEY
POLLO_WEBHOOK_SECRET
```

No secret value was written to the repository.

### Governed asset receipt and intake pipeline

Added:

```text
config/academy-media-asset-receipt.schema.json
scripts/academy-media-intake.mjs
test/academy-media-intake.test.mjs
```

The intake pipeline:

1. Reads the deterministic HeyGen and Pollo job manifest.
2. Creates Windows-safe asset names and receipt templates.
3. Requires provider asset IDs, local media files, SHA-256 hashes, rights files, quality-gate evidence, synthetic-media disclosure, and owner approval.
4. Requires captions and transcripts for HeyGen presenter assets.
5. Prevents path traversal and out-of-root file references.
6. Supports FFprobe verification of duration, resolution, video stream, audio stream, and 48 kHz presenter audio.
7. Rejects generated but unapproved assets.
8. Writes a machine-readable validation record.

Package commands added:

```text
npm run prepare:academy-media-intake
npm run validate:academy-media-intake
npm run validate:academy-media-canary
```

## Tests added

### Media service tests

Added:

```text
test/academy-media-services.test.mjs
```

The tests verify:

1. Provider roles and exact governed endpoints.
2. Absence of secrets in source configuration.
3. Manual-first defaults.
4. Automatic spending and refill remain disabled.
5. Bounded probes and no-store behavior.
6. Owner-only and nonindexable readiness responses.
7. Deployment environment placeholders.

### Asset intake tests

The tests verify:

1. Deterministic receipt preparation.
2. Accepted media, hashes, captions, transcripts, rights evidence, quality gates, and owner approval.
3. Rejection of unapproved generated receipts.
4. Path containment, SHA-256, FFprobe, duration, resolution, and audio evidence controls.

## Current-head CI incident and correction

GitHub Actions executed the expanded test suite and reported:

```text
Tests: 61
Passed: 60
Failed: 1
```

The single failure was:

```text
media service probe is bounded and returns no provider secrets
```

The runtime adapter did not return a provider secret. The test inspected a broad source-code slice that included the internal outbound request line referencing `process.env.POLLO_API_KEY`. The source scan therefore confused credential use inside an authorized request header with credential exposure in the returned status object.

Correction completed:

1. Isolated the declared sanitized probe-result object shape.
2. Asserted that the result shape has no API-key, access-token, client-secret, or webhook-secret field.
3. Asserted that the return boundary is exactly `{ status, probe: result }`.
4. Retained the separate owner-route assertions that no HeyGen or Pollo key reference exists in the response route.
5. Recorded the incident as Failure 6 in the permanent failure register.
6. Restarted current-head CI after the correction.

No provider generation, API spending, deployment cutover, or publication occurred during the failed CI run.

## Current state

```text
HeyGen avatar creation: owner in progress
HeyGen voice creation: owner in progress
HeyGen 16:9 template: pending
HeyGen 9:16 template: pending
Pollo private workspace confirmation: pending
Pollo presets: pending
Media connection adapter: implemented
Owner readiness endpoint: implemented
Asset intake pipeline: implemented
Connection and intake test attempt: 60 passed, 1 failed
Failure 6 correction: committed
Corrected current-head CI: running or pending
Canary assets generated: not yet
Canary assets accepted: not yet
LearnWorlds media upload: not yet
Production cutover: blocked
```

## Next authenticated owner actions

1. Finish the authorized HeyGen avatar and voice.
2. Create the governed HeyGen 16:9 and 9:16 templates.
3. Record the resulting non-secret avatar, voice, and template IDs in the secure deployment environment.
4. Confirm the private Pollo workspace and create the governed presets.
5. Generate the fifteen-second likeness canary and the Cybersecurity Foundations welcome asset.
6. Download the MP4, captions, transcript, and provider identifiers.
7. Complete the generated asset receipt and run the canary intake validator.

## Acceptance boundary

No production connection, avatar quality, voice quality, Pollo visual quality, LearnWorlds media upload, website cutover, customer purchase, or portfolio publication is claimed until the corresponding runtime or owner evidence passes.
