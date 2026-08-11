# LearnWorlds Continuous Handoff Addendum: Annual HeyGen and Pollo Media Pipeline

Date: 2026-08-11

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `#55`

Production cutover: Not authorized

## Owner decision

The owner confirmed active annual subscriptions for both HeyGen and Pollo AI and directed the production system to maximize both services while producing high quality content across LearnWorlds, the Obserra website, YouTube, LinkedIn, Instagram Reels, TikTok, and YouTube Shorts.

No additional avatar, generative video, or media subscription is authorized during the acceptance phase.

## Provider role separation

### HeyGen

HeyGen is the authoritative presenter layer for:

1. Dr. Jody Blanchard course welcome videos.
2. Module summary videos.
3. Course sales trailers.
4. Executive webinar invitations.
5. Localized versions of proven courses.
6. Consistent voice, pronunciation, branding, and presenter identity.

### Pollo AI

Pollo AI is the visual and campaign layer for:

1. Original cinematic B roll.
2. Scenario visualizations.
3. Visual explainers.
4. Website hero loops.
5. Vertical social clips.
6. LinkedIn executive clips.
7. Ongoing visual refreshes for high performing courses.

Pollo is not used as a duplicate presenter platform. HeyGen owns presenter consistency. Pollo owns visual variety.

## Commercial control boundary

The annual web subscriptions do not automatically prove paid API access. The implementation is therefore manual first and API ready:

1. The repository produces governed job manifests, briefs, prompt packs, naming standards, quality gates, calendars, and audit evidence.
2. The owner performs authenticated generation in the subscribed HeyGen and Pollo web applications.
3. API automation remains disabled until the owner confirms API access and explicitly approves any separate API budget.
4. No service secret is stored in source control, chat records, generated manifests, or public documentation.

## Repository implementation completed

The following files were added to the branch:

```text
docs/OBSERRA_ACADEMY_HEYGEN_POLLO_ANNUAL_MEDIA_PIPELINE.md
scripts/academy-media-factory.mjs
config/academy-media-factory.json
test/academy-media-factory.test.mjs
docs/academy-media-pipeline/README.md
docs/academy-media-pipeline/ACCOUNT-SETUP-CHECKLIST.md
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
```

The package scripts now include:

```text
npm run plan:academy-media
npm run validate:academy-media
```

The Academy release gate now runs `validate:academy-media` before the existing alignment, workload, resilience, and application build gates.

## Portfolio production design

The annual target is five courses per month for twelve months.

The baseline governed output register contains:

```text
HeyGen assets: 250
Pollo assets: 335
Total governed media assets: 585
```

The tier model is:

1. Ten flagship courses.
2. Fifteen standard courses.
3. Thirty five catalog courses.

Each tier receives an evidence based mix of presenter videos, trailers, B roll, hero loops, vertical social clips, LinkedIn clips, captions, transcripts, and rights records.

## First canary

Course:

```text
Cybersecurity Foundations for New Professionals
```

The canary production pack contains:

1. A complete 60 to 90 second HeyGen welcome script.
2. Five HeyGen module summary briefs.
3. A HeyGen sales trailer script.
4. Six governed Pollo cinematic prompts.
5. YouTube Shorts, Instagram Reels, TikTok, and LinkedIn variants.
6. A twelve point acceptance checklist.

No portfolio generation is authorized until this canary passes owner review for likeness, voice, pronunciation, captions, transcript, brand, rights, accessibility, playback, and content accuracy.

## Actions completed

1. Read the existing LearnWorlds commercial branch and PR state.
2. Confirmed the existing website already contains Academy catalog, Clerk identity, Stripe checkout, signed webhook fulfillment, learner entitlement, progress, assessment, and certificate capabilities.
3. Added the annual HeyGen and Pollo role separation decision.
4. Added a deterministic media job factory.
5. Added tiered annual media configuration.
6. Added full portfolio and insufficient catalog tests.
7. Added account setup and publishing documentation.
8. Added the Cybersecurity Foundations canary production pack.
9. Added media validation to the Academy release gate.
10. Started GitHub CI validation for the updated branch.

## Failures and corrections

### Failure 1: Direct repository clone unavailable in build environment

Attempt:

```text
git clone https://github.com/jblan2026-hub/obserra-website.git
```

Result:

```text
Could not resolve host: github.com
```

Impact:

The local build container could not clone the repository directly.

Correction:

All source reads and writes were performed through the authenticated GitHub connector. The media factory itself was separately tested in the local build environment with deterministic fixtures.

Prevention rule:

Do not claim a local repository clone or full local build when the environment cannot resolve GitHub. Use authenticated connector evidence and GitHub CI for repository integrated validation.

### Failure 2: Unintended dependency version drift during package script update

The initial package update inadvertently changed:

```text
@types/react-dom: ^19.0.2 -> ^19.2.3
```

Impact:

The media change would have introduced an unrelated dependency modification.

Correction:

The dependency was restored immediately to `^19.0.2`. The media scripts remain the only intended package change.

Prevention rule:

When updating package scripts, preserve all unrelated dependency values exactly and verify the complete replacement file before commit.

## Current validation status

Local deterministic media-factory tests:

```text
Passed: 2
Failed: 0
```

GitHub CI for the latest branch commit:

```text
Website CI: pending
Academy 70x Production Gate: pending
Application Production Pipeline: pending
Application Release Validation: pending
```

No production deployment, HeyGen generation, Pollo generation, LearnWorlds publication, website cutover, or customer purchase is claimed.

## Owner account actions required

The owner only needs to complete authenticated service actions:

1. Confirm the HeyGen monthly credit allocation shown in Plan and Billing.
2. Create or approve the Dr. Jody Blanchard avatar and voice.
3. Create the 16:9 and 9:16 Obserra HeyGen templates.
4. Confirm the Pollo monthly credit allocation shown in Billing.
5. Create private Pollo prompt presets for B roll, hero loops, vertical shorts, and LinkedIn clips.
6. Generate the canary assets from the repository supplied scripts and prompts.
7. Download the rendered assets for validation and ingestion.

## Acceptance gate

Production promotion requires:

1. GitHub CI passes.
2. HeyGen canary passes all presenter and accessibility checks.
3. Pollo canary passes all visual and rights checks.
4. LearnWorlds course import and playback pass.
5. Website trailer playback passes.
6. Stripe test purchase and learner access pass.
7. Owner approval is recorded.
8. No paid API automation is enabled without separate authorization.
