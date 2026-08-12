# LearnWorlds Continuous Handoff Addendum: Owner Identity and Registered Brand Lock

**Date:** 2026-08-12  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Course:** Cybersecurity Foundations for New Professionals  
**Publication:** Not authorized

## Authoritative owner attribution

The only approved learner-facing owner attribution is:

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
```

No alternate or additional title is authorized. Current employer names, former employer names, employer logos, outside job titles, and employment history are prohibited from course title pages, owner introductions, scripts, transcripts, captions, lower thirds, course descriptions, landing pages, learner resources, assessments, certificates, advertising, metadata, and LearnWorlds activities.

## Exact identity requirement

Any video that uses Dr. Jody Blanchard's name or title must use his exact approved face and exact approved voice. A similar person, regenerated face, substitute avatar, substitute voice, or merely similar voice is prohibited.

The course-specific script, professional wardrobe, background, set, lighting, framing, pose, restrained natural movement, official graphics, captions, identity-preserving speech cleanup, and identity-preserving 4K processing may change. The person and voice may not change.

The canonical website portrait is:

```text
/leadership/dr-jody-blanchard-executive.webp
```

The exact approved HeyGen source and exact approved voice remain the required production sources. The portrait is a visual identity reference, not permission to regenerate or approximate the owner.

## Registered business identity

```text
Academy name: Obserra EPI Academy
Short business name: Obserra EPI
EPI meaning: Executive Protection & Intelligence
Full legal name: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
Official website: https://www.obserrallc.com
```

Standalone `Obserra` is not an approved Academy or short business name. No other company or owner may be presented as the Academy, course provider, issuer, or business. The registered names, official logo, approved colors, and official website may not be changed.

## HeyGen deletion and remaining project-card state

The incorrect generated owner-welcome video did not depict the exact owner and was rejected.

Verified actions and evidence:

1. The generated video record `7da10cc3dd9441ccb2825805c6e5270b` was identified inside the Video Agent session as failed.
2. The connected HeyGen deletion action returned `deleted: true` for that video record.
3. A subsequent direct lookup returned `video_not_found`, confirming that the underlying video record is no longer retrievable.
4. The Video Agent session or project card can remain visible in the HeyGen web interface after the underlying video record is deleted.
5. The connected HeyGen surface does not expose a delete-session or delete-project action, so deletion of the remaining project card is not claimed.
6. The approved owner source was not deleted or modified.

Current controlled truth:

```text
Incorrect underlying video record: deleted
Incorrect video retrievable: no
Incorrect Video Agent project or session card visible in web interface: owner reports yes
Project or session card deletion through connected tools: unavailable
Approved owner source: preserved
Approved owner source modified: no
Incorrect project authorized for any use: no
```

The remaining incorrect project or session card must not be opened for reuse, exported, uploaded into LearnWorlds, published, marketed, or used as a template. Removal of that card requires a HeyGen web-interface action or a provider-supported project/session deletion function.

## Required owner introduction

Every course must begin with an official Obserra EPI Academy title page, learner disclosures and acknowledgement, a course-specific owner welcome using the exact approved face and voice, and a transition into orientation or Module 1.

The owner lower third must show exactly:

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
```

The final introduction must be a highest-quality 3840 x 2160 master with identity-preserving processing, precision speech cleanup that does not alter the voice, clean 48 kHz audio, selectable captions, a verified transcript, and a music-free master.

## Machine-readable enforcement

The governing policy is:

```text
config/academy-owner-identity-attribution-policy.json
```

## Release rule

The course remains Draft. LearnWorlds upload, owner-media acceptance, assessment, resources, completion, certificate, accessibility, desktop, mobile, template reuse, live checkout, merge, and publication remain blocked until directly verified and explicitly approved by Dr. Jody Blanchard.
