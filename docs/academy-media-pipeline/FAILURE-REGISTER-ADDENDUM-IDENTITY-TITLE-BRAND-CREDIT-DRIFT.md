# Obserra EPI Academy Failure Register Addendum: Identity, Title, Brand, Provider, Credit, Course-Readiness, and Package-QA Drift

**Originally recorded UTC:** 2026-08-12T04:54:17Z  
**Updated:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Sole approved title:** Founder and CEO  
**Status:** CURRENT CORRECTIVE AUDIT RECORD

## Failure 1 - Wrong person represented as Dr. Jody Blanchard

A generated owner-review output depicted a different person while using Dr. Jody Blanchard's name and business context.

**Impact:** Identity, credibility, reputational, and business risk. Provider credits were consumed for an unusable output.

**Correction:** The output was rejected. The underlying generated video record was deleted through the connected HeyGen delete-video action and is no longer retrievable. The associated `Owner Review Video` project or session card remains visible in My Projects.

**Prevention:** Any asset using the owner's name or title must bind the exact approved face and exact approved voice before generation. Unconstrained Video Agent substitution is prohibited.

## Failure 2 - Title drift

Prior drafts used titles including `Founder and Cybersecurity Executive`, `Owner, Founder, and Cybersecurity Executive`, `Founder and Owner`, and other unapproved variants.

**Correct title:** `Founder and CEO` only.

**Prevention:** Enforce one literal title across scripts, title cards, lower thirds, captions, transcripts, descriptions, metadata, certificates, assessments, and LearnWorlds fields.

## Failure 3 - Employer and resume drift

The course context risked using current or former employment titles or employers as learner-facing credibility statements.

**Correction:** Current and former employer names, employer logos, outside job titles, and employment history are prohibited in all learner-facing Academy content. The resume is internal grounding only.

## Failure 4 - Registered brand drift

Prior files used `Obserra Academy`, `OBSERRA ACADEMY`, standalone `Obserra`, and flexible logo or naming language.

**Correction:** Use only `Obserra EPI Academy`, `Obserra EPI`, `Executive Protection & Intelligence`, `OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC`, the official registered logo, the approved colors, and https://www.obserrallc.com.

**Prevention:** Run a prohibited-term and brand-whitelist scan on every course package and learner-facing implementation.

## Failure 5 - Deletion assumptions and inaccurate state reporting

Provider 404 results, incomplete list endpoints, and deletion of an underlying video record were treated as stronger proof than the authenticated owner interface.

**Correct evidence boundary:**

```text
Pre-action screenshot: three visible cards
Later owner statement: rejected project moved to Trash
Post-action screenshot: not supplied
Current active-project count: not independently verified
Permanent provider purge: not verified
```

**Prevention:** Distinguish video-record state, project-card visibility, session state, owner-reported action, Trash status, and permanent purge. Record who performed each action and the exact evidence source.

## Failure 6 - Owner-supplied screenshot was misread

The owner-supplied HeyGen My Projects screenshot was incorrectly summarized as showing only two approved projects and as proving that the rejected project had been moved to Trash.

The screenshot identified by SHA-256:

```text
68316b82e22f922fe27a2019babb64965d9e0d69a8c908c4e5c898f434291d13
```

actually shows three visible cards:

1. `Owner Review Video` - rejected wrong-person project or session card.
2. `Professional man speaking to camera.` - approved owner project.
3. `Confident_Cybersecurity_Leadership` - approved owner project.

**Correction:** Current records treat the screenshot as pre-action evidence and the later Trash statement as owner-reported post-capture information. No permanent purge is claimed.

**Prevention:** Read screenshots directly. Never infer hidden actions, Trash state, deletion, or a post-action project count beyond the evidence provided.

## Failure 7 - Unverified LearnWorlds readiness implications

Prior package and status language could imply that the course had been loaded into LearnWorlds or was presentable for owner review while the authenticated platform still showed empty placeholder activities.

**Correction:** Cybersecurity Foundations remains Draft. Complete LearnWorlds loading, assessment, completion, certificate, resource, accessibility, desktop, and mobile acceptance are not verified.

**Prevention:** Claim platform completion only from direct authenticated evidence showing exact sections, activities, durations, resources, assessment behavior, completion rules, and course state.

## Failure 8 - Insufficient course robustness

The first course did not initially maximize pedagogically appropriate LearnWorlds activity types and authoritative learner resources.

**Correction:** The validated v4.1.0 package includes branded opening activities, owner-welcome controls, orientation, diagnostic, interactive lessons, accessible written alternatives, scenarios, guided practice, assignments, knowledge checks, official NIST and CISA resources, self-assessments, final exam, survey, completion, certificate, and accessibility controls.

## Failure 9 - Provider credit waste

Credits were consumed for a wrong-person output that could not be used.

**Correction:** No additional owner-video generation is authorized until the deterministic exact face and exact voice path is proven, the script and official graphics are frozen, and Dr. Jody Blanchard explicitly authorizes one controlled render.

## Failure 10 - Repeated instruction drift

The owner had to repeat identity, title, employer, brand, website, video, course-quality, handoff, and verification rules.

**Correction:** These rules are now present in current handoff, restart, machine-readable policies, protected records, activity and failure addenda, certificate implementation, and the authoritative audit package.

**Prevention:** Every restarted session must read the current records first and continue from the first incomplete controlled action without requiring the owner to repeat these rules.

## Failure 11 - Generative AI pre-release package failed the enhanced QA gate

The first generated `Generative AI Fundamentals for Business Leaders` review package reached static quality assurance but did not pass the enhanced release gate.

The enhanced audit identified:

1. The SCORM packages used a valid basic package structure but did not satisfy the stronger screen-navigation, keyboard-support, responsive-layout, and interaction validation standard adopted for the next course set.
2. Several LearnWorlds digital-download cells used human-readable labels rather than exact package-relative file paths, which prevented deterministic file-mapping validation.
3. The package contained 66 mapped activities because the resource library included one navigator plus thirteen official resource activities. Earlier builder metadata incorrectly reported 65.
4. A post-build finalization step changed the package contents and hash after the initial build result was recorded, creating a hash and file-count inconsistency.

**Impact:** The package could have been represented as complete despite inconsistent integrity evidence and insufficient SCORM interaction validation.

**Correction:** The package is quarantined and is not an authorized delivery. The builder is being corrected to produce stronger navigable SCORM, exact activity-map paths, truthful dynamic activity counts, one final package hash, and clean extraction evidence from the same immutable ZIP. The corrected package will receive a new version and will not be released until all validation gates pass.

**Prevention:** A course package is complete only when its final immutable ZIP, SHA-256 file, validation report, manifest, internal file hashes, clean-extraction result, activity map, and SCORM checks all agree. Any post-build modification requires a new version, a new hash, and a full rerun of every quality gate.

## Current unresolved blockers

1. Cybersecurity Foundations authenticated LearnWorlds loading and runtime acceptance remain pending.
2. Exact-owner course media remains blocked pending separate explicit authorization and owner approval.
3. The Generative AI package is under corrective rebuild and is not yet released.
4. The LLM and high-risk-employee courses remain queued behind the corrected Generative AI package.
5. Publication, live checkout, production merge, production cutover, and courses beyond the owner-authorized three-course set remain blocked.
