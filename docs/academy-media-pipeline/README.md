# Obserra Academy Multiplatform Cinematic Media Factory

This pipeline turns the governed Obserra Academy course catalog into a controlled production register for HeyGen, Pollo AI, LearnWorlds, the Obserra website, YouTube, LinkedIn, Instagram Reels, TikTok, and YouTube Shorts.

The governing standard is:

```text
config/academy-cinematic-production-standard.json
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md
Standard ID: obserra-cinematic-enterprise-v1
```

Every course uses the same cinematic enterprise quality standard. Course tier may change release order or marketing investment. It may not reduce production quality.

## Provider responsibilities

### HeyGen

Use HeyGen for the authorized Dr. Jody Blanchard presenter layer:

1. One course welcome for every course.
2. Five module anchor films for every course.
3. One course trailer host track for every course.
4. Webinar and campaign host segments after the core catalog is stable.
5. Approved localization after the original course passes.

Each HeyGen output requires likeness, voice similarity, pronunciation, lip synchronization, natural pacing, captions, transcript, brand, rights, LearnWorlds playback, and owner approval.

No uninterrupted avatar segment may exceed 20 seconds. Presenter footage must be combined with cinematic visuals and instructional interaction. A full module or full course may not consist only of a talking avatar.

### Pollo AI

Use Pollo AI for the cinematic visual layer:

1. Five module specific visual packs for every course.
2. Realistic enterprise and operational environments.
3. Scenario and decision visuals.
4. Website hero loops.
5. LinkedIn executive clips.
6. Vertical social assets for YouTube Shorts, Instagram Reels, and TikTok.
7. Visual refreshes for high performing courses.

Every module visual pack requires at least four distinct visual contexts, physically plausible motion, motivated lighting, consistent people and locations, no generated scene text, no public figures, no third party logos, no morphing anatomy, and no generic looping stock appearance.

### LearnWorlds

Use LearnWorlds for:

1. Video learning activities.
2. Captions and transcripts.
3. Chapters and table of contents.
4. Knowledge checks.
5. Completion rules.
6. Assessments.
7. Certificates.
8. Learner progress and reporting.

Every approved module film requires desktop and mobile playback validation. Placeholder people, template copy, unsupported statistics, and legacy branding are prohibited.

## Common course media package

Every course receives:

```text
HeyGen course welcome: 1
HeyGen module anchor films: 5
HeyGen course trailer host: 1
Pollo module cinematic visual packs: 5
Pollo website hero loop: 1
Pollo vertical campaign clips: 3
Pollo LinkedIn executive clip: 1
Total assets per course: 17
```

Current 60 course portfolio target:

```text
HeyGen assets: 420
Pollo assets: 600
Total governed media assets: 1020
Minimum finished video per course: 27 minutes
Target finished video per course: approximately 37 minutes
```

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

1. Complete the authorized Dr. Jody Blanchard avatar.
2. Complete or approve the authorized voice clone.
3. Build one reusable Obserra 16 by 9 course template.
4. Build one reusable Obserra 9 by 16 social template.
5. Record the avatar, voice, and template identifiers in the secure deployment environment only.
6. Render the 15 second likeness canary before longer presenter assets.
7. Do not place credentials in GitHub, chat, prompt packs, or handoff documents.

### Pollo AI

1. Use a private Obserra workspace.
2. Upload only approved brand references and authorized likeness material.
3. Create reusable presets for module visuals, hero loops, executive clips, and vertical clips.
4. Keep customer, regulated, secret, and unpublished sensitive information out of prompts.
5. Record provider asset identifiers and rights evidence for accepted outputs.

### LearnWorlds

1. Retain owner administrator control.
2. Keep unfinished course shells in Draft or Sandbox.
3. Create and validate one Obserra master course template.
4. Load approved video, captions, transcripts, thumbnails, chapters, knowledge checks, and completion rules.
5. Remove all placeholder template content.
6. Complete a Sandbox learner journey before publication.

## Publishing matrix

| Master asset | Primary platform | Repurposed platforms |
| --- | --- | --- |
| 16 by 9 course welcome | LearnWorlds | Website, YouTube |
| 16 by 9 module anchor film | LearnWorlds | YouTube playlist, executive briefing clips |
| 16 by 9 trailer | Website | YouTube, LinkedIn |
| 4 by 5 executive clip | LinkedIn | Website article |
| 9 by 16 short | YouTube Shorts | Instagram Reels, TikTok |
| Transcript | LearnWorlds | Blog, email, accessibility |
| Thumbnail and hero image | Website and LearnWorlds | YouTube, LinkedIn, email |

## Approval stages

```text
PLANNED
SOURCE APPROVED
SCRIPT APPROVED
SCENE PLAN APPROVED
SHOT LIST APPROVED
HEYGEN READY
POLLO READY
GENERATED
TECHNICAL QC PASSED
CONTENT REVIEW PASSED
ACCESSIBILITY PASSED
RIGHTS PASSED
LEARNWORLDS PLAYBACK PASSED
OWNER APPROVED
PUBLISHED
MEASURED
REFRESH SCHEDULED
```

No generated media is published automatically. Publication remains owner approved, evidence based, and course specific.
