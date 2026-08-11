# Obserra Academy Pollo Media

This directory is reserved for owner-approved Obserra Academy cinematic website media.

## Security boundary

These files are public static website assets only.

They must not:

1. Connect to any database.
2. Read or write learner records.
3. Read or write identity data.
4. Read or write commerce, payment, assessment, or certificate data.
5. Call LearnWorlds, Clerk, Stripe, Pollo, HeyGen, or any external API at runtime.
6. Load external scripts or embedded provider players.
7. Include credentials, tokens, customer data, regulated data, secret data, or unpublished sensitive information.

The browser receives only approved local MP4 files and existing official Obserra poster images.

## Required output paths

```text
public/media/pollo/academy/obserra-academy-learning-hero-loop-12s.mp4
public/media/pollo/academy/obserra-academy-cybersecurity-foundations-15s.mp4
public/media/pollo/academy/obserra-academy-ai-governance-leadership-15s.mp4
public/media/pollo/academy/obserra-academy-ciso-board-leadership-15s.mp4
public/media/pollo/academy/obserra-academy-executive-protection-intelligence-15s.mp4
```

## Activation rule

Keep this feature disabled until every active file is present, technically validated, official-brand reviewed, and owner approved.

```text
NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED=false
```

When disabled, the Academy page uses the existing official Obserra poster images and does not request the planned MP4 files.

## Master requirements

```text
Container: MP4
Codec: H.264
Minimum resolution: 1920 by 1080
Frame rate: 24 frames per second
Color: Rec.709
Audio: none for website playback masters
Official logo: applied by the website or controlled postproduction
Generated official logo: prohibited
Generated critical text: prohibited
Third party logos: prohibited
Public figure likenesses: prohibited
Owner approval: required
SHA 256 record: required
```

The governing manifest is `config/academy-website-cinematic-media.json`.
