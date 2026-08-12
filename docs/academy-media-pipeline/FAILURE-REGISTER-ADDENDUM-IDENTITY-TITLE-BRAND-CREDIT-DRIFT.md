# Obserra EPI Academy Failure Register Addendum: Identity, Title, Brand, Provider, Credit, and Course-Readiness Drift

**Originally recorded UTC:** 2026-08-12T04:54:17Z  
**Corrected:** 2026-08-12  
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

**Correct current state:**

```text
Incorrect underlying generated video record: deleted
Incorrect video retrievable: no
Owner Review Video project or session card visible in My Projects: yes
Owner Review Video moved to Trash: no evidence
Only two approved projects visible: no
Project or session deletion through connected tools: unavailable
```

**Prevention:** Distinguish video-record state, project-card visibility, session state, Trash status, and permanent purge. Record who performed each action and the exact evidence source.

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

**Correction:** All current records now state that the rejected project card remains visible and is not removed.

**Prevention:** Read screenshots directly. Never infer Trash state, hidden actions, deletion, or an exact project count beyond what is visibly shown.

## Failure 7 - Unverified LearnWorlds readiness implications

Prior package and status language could imply that the course had been loaded into LearnWorlds or was presentable for owner review while the authenticated platform still showed empty placeholder activities.

**Correction:** The course remains Draft. Complete LearnWorlds loading, assessment, completion, certificate, resource, accessibility, desktop, and mobile acceptance are not verified.

**Prevention:** Claim platform completion only from direct authenticated evidence showing exact sections, activities, durations, resources, assessment behavior, completion rules, and course state.

## Failure 8 - Insufficient course robustness

The first course did not yet maximize pedagogically appropriate LearnWorlds activity types and authoritative learner resources.

**Correction:** Rebuild with branded opening activities, exact owner welcome, orientation, diagnostic, interactive lessons, accessible written alternatives, scenarios, guided practice, assignments, knowledge checks, official NIST and other primary resources, self-assessments, final exam, survey, completion, certificate, and accessibility controls.

## Failure 9 - Provider credit waste

Credits were consumed for a wrong-person output that could not be used.

**Correction:** No additional owner-video generation is authorized until the deterministic exact face and exact voice path is proven, the script and official graphics are frozen, and Dr. Jody Blanchard explicitly authorizes one controlled render.

## Failure 10 - Repeated instruction drift

The owner had to repeat identity, title, employer, brand, website, video, course-quality, handoff, and verification rules.

**Correction:** These rules are now present in current handoff, restart, machine-readable policies, protected records, activity and failure addenda, certificate implementation, and the authoritative audit package.

**Prevention:** Every restarted session must read the current records first and continue from the first incomplete controlled action without requiring the owner to repeat these rules.

## Current unresolved blockers

1. The visible `Owner Review Video` project or session card has not been removed from My Projects.
2. The correct exact-owner 4K course introduction is not rendered and approved.
3. The complete Cybersecurity Foundations course is not loaded into LearnWorlds Draft.
4. Assessment, completion, certificate, resources, accessibility, desktop, and mobile acceptance remain pending.
5. Additional course production remains blocked pending first-course approval.
