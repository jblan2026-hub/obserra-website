# Obserra Academy Multiplatform Media Factory

This pipeline turns the governed Obserra Academy course catalog into an annual production register for HeyGen, Pollo AI, LearnWorlds, the Obserra website, YouTube, LinkedIn, Instagram Reels, TikTok, and YouTube Shorts.

## Provider responsibilities

### HeyGen

Use HeyGen for consistent instructor presence:

1. Course welcome videos.
2. Module summaries.
3. Executive course trailers.
4. Personalized enterprise enrollment and follow up videos after the core catalog is stable.

The authorized Dr. Jody Blanchard avatar and voice are the default presenter. Each output requires pronunciation, lip sync, pacing, caption, transcript, brand, rights, and owner review.

### Pollo AI

Use Pollo AI for original visuals:

1. Cinematic B roll.
2. Visual explainers.
3. Website hero loops.
4. LinkedIn executive clips.
5. Vertical social assets for YouTube Shorts, Instagram Reels, and TikTok.
6. Visual refreshes for high performing courses throughout the subscription year.

Pollo output may not invent authorities, case facts, statistics, real people, or third party endorsements. Generated text inside scenes is prohibited because it is less reliable than postproduction titles and captions.

## Annual operating model

The portfolio target is five courses per month for twelve months. Each course receives a tiered package:

1. Flagship: one welcome, five module summaries, one host trailer, cinematic B roll, website hero loop, four vertical shorts, and one LinkedIn clip.
2. Standard: one welcome, three module summaries, one host trailer, cinematic B roll, website hero loop, three vertical shorts, and one LinkedIn clip.
3. Catalog: one welcome, one module summary, one host trailer, cinematic B roll, website hero loop, two vertical shorts, and one LinkedIn clip.

This design maximizes both annual subscriptions while keeping human review and publishing capacity realistic.

## Generate the portfolio register

```powershell
node scripts/academy-media-factory.mjs --all
```

Outputs:

```text
release/academy-media-factory/academy-media-job-manifest.json
release/academy-media-factory/academy-media-job-register.csv
release/academy-media-factory/academy-media-annual-calendar.json
release/academy-media-factory/academy-media-validation.json
```

Generate one course:

```powershell
node scripts/academy-media-factory.mjs --course cybersecurity-foundations
```

Validate without writing:

```powershell
node scripts/academy-media-factory.mjs --all --mode validate
```

## Account setup required from the owner

### HeyGen

1. Create the authorized Dr. Jody Blanchard Digital Twin or Instant Avatar.
2. Create or approve the authorized voice clone.
3. Build one reusable Obserra 16:9 template with variables for course title, module title, script, call to action, lower third, and background media.
4. Record the avatar ID, voice ID, and template ID in the secure deployment environment only.
5. Confirm whether the annual subscription includes API access. UI subscription access and API credit access may be separate.

### Pollo AI

1. Create a private Obserra workspace.
2. Upload only approved brand references and authorized likeness material.
3. Create reusable prompt presets for enterprise B roll, hero loops, explainers, and vertical social clips.
4. Confirm whether the annual subscription includes API access. UI subscription access and API usage may be separate.

### LearnWorlds

1. Create the school and retain owner administrator control.
2. Request API credentials under Settings, Developers, API.
3. Connect Stripe and complete a test purchase.
4. Configure webhooks for registration, purchase, course completion, and certificate events.
5. Create the Obserra master course template.

## Publishing matrix

| Master asset | Primary platform | Repurposed platforms |
| --- | --- | --- |
| 16:9 course welcome | LearnWorlds | Website, YouTube |
| 16:9 module summary | LearnWorlds | YouTube playlist |
| 16:9 trailer | Website | YouTube, LinkedIn |
| 4:5 executive clip | LinkedIn | Website article |
| 9:16 short | YouTube Shorts | Instagram Reels, TikTok |
| Transcript | LearnWorlds | Blog, email, accessibility |
| Thumbnail and hero image | Website | YouTube, LinkedIn, email |

## Approval stages

```text
PLANNED
SCRIPT APPROVED
HEYGEN READY
POLLO READY
GENERATED
TECHNICAL QC PASSED
CONTENT REVIEW PASSED
OWNER APPROVED
PUBLISHED
MEASURED
REFRESH SCHEDULED
```

No generated media is published automatically. Publication remains owner approved and evidence based.
