# Governed Pollo Website Media

This directory is reserved for owner-approved Pollo AI website media.

Do not commit API keys, account exports, source prompts containing sensitive information, customer information, regulated data, or unapproved likeness material.

## Required output paths

```text
public/media/pollo/site/obserra-eios-intelligence-hero-loop-12s.mp4
public/media/pollo/site/obserra-eios-platform-loop-12s.mp4
public/media/pollo/ads/obserra-eios-executive-intelligence-15s.mp4
public/media/pollo/ads/obserra-academy-cinematic-learning-15s.mp4
public/media/pollo/ads/obserra-protection-intelligence-15s.mp4
public/media/pollo/ads/obserra-cybersecurity-executive-risk-15s.mp4
```

The website feature flag must remain disabled until every referenced asset that will be activated is present, technically validated, brand reviewed, and owner approved.

```text
NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

When disabled, the website displays the existing official Obserra poster images and does not request the planned MP4 files.

## Master requirements

```text
Container: MP4
Codec: H.264
Minimum resolution: 1920 by 1080
Frame rate: 24 frames per second
Color: Rec.709
Background loops: silent
Loop seam: required for hero and platform loops
Official logo: added in controlled website or postproduction layer
Generated logo or critical text: prohibited
Third party logos: prohibited
Public figure likenesses: prohibited
Owner approval: required
```

The governing manifest is `config/website-cinematic-media.json`.
