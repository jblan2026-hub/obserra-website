# Obserra Academy Website Ads Production Pack

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Status: Website placements, static fallbacks, security controls, and paste-ready Pollo prompts implemented. Provider renders pending owner generation and approval.

Effective date: 2026-08-11

## Purpose

This pack creates five cinematic assets specifically for the Obserra Academy page on `www.obserrallc.com`.

The assets promote the governed course roadmap without claiming that unfinished courses are available for live enrollment. They use the official Obserra brand and replace static-only presentation with controlled cinematic media after owner approval.

## Database and application security boundary

The Academy media feature is intentionally isolated from the application data plane.

It uses only:

1. Versioned MP4 files stored under `public/media/pollo/academy`.
2. Existing official poster images under `public/brand/visuals`.
3. Internal Obserra Academy links.
4. A public boolean feature flag.
5. Client-side video playback controls.

It does not:

1. Connect to a database.
2. Query or modify learner records.
3. Query or modify identity records.
4. Query or modify Stripe or LearnWorlds commerce records.
5. Query or modify assessments, progress, certificates, or entitlements.
6. Call a provider API from the browser.
7. load an external script, iframe, widget, or embedded player.
8. Accept user input.
9. Read cookies, local storage, or session storage.
10. expose a provider key, access token, database URL, or secret.

The governing feature flag defaults to false:

```text
NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED=false
```

## Official brand direction

Every asset must use:

```text
Dark navy
Black
Gold
White
Restrained holographic blue
Premium enterprise documentary realism
Motivated practical lighting
Controlled cinematic camera movement
Natural human behavior
Clean negative space for website copy
```

Do not ask Pollo to generate the official Obserra logo. The website applies the official logo as a controlled overlay.

Do not generate critical text, statistics, course names, claims, legal language, captions, or assessment content inside the scene.

Do not use a personal photograph, public figure, third party logo, identifiable company brand, customer information, regulated information, secret information, or unpublished sensitive information.

## Technical master

```text
Container: MP4
Codec: H.264
Resolution: 1920 by 1080 minimum
Aspect ratio: 16 by 9
Frame rate: 24 frames per second
Color: Rec.709
Audio: silent website master
Captions: not required for silent decorative website master
Poster fallback: required
Reduced motion fallback: required
Owner approval: required
```

## Asset 1: Obserra Academy learning hero loop

Output:

```text
public/media/pollo/academy/obserra-academy-learning-hero-loop-12s.mp4
```

Duration: 12 seconds

Website purpose: Present the Obserra Academy learning experience immediately below the page introduction.

### Shot sequence

1. Seconds 0 to 3: A professional learner enters a premium executive learning environment containing realistic cybersecurity, AI governance, intelligence, resilience, and protection contexts.
2. Seconds 3 to 7: Controlled movement across evidence review, scenario practice, decision analysis, and instructor-guided learning.
3. Seconds 7 to 10: Learners apply judgment in a boardroom, operations center, executive travel planning environment, and technology governance meeting.
4. Seconds 10 to 12: Return to a balanced Academy composition compatible with a seamless loop.

### Pollo prompt

```text
Twelve second seamless silent cinematic loop for Obserra Academy, a premium professional learning environment focused on cybersecurity, AI governance, executive leadership, intelligence, resilience, and executive protection. Show diverse professionals learning through realistic evidence review, scenario practice, decision analysis, executive instruction, boardroom discussion, operations center coordination, AI governance review, and protective planning. Dark navy and black architecture, restrained gold, white, and subtle holographic blue, motivated practical lighting, controlled camera movement, natural human behavior, realistic enterprise environments, clean negative space for website copy, no generated text, no logos, no public figures, no personal photograph, no static slide deck, no robotic avatar, no generic stock montage, no morphing people or objects, no excessive cyberpunk imagery, premium corporate documentary quality, 16:9, opening and closing frames compatible for a seamless loop.
```

## Asset 2: Cybersecurity Foundations roadmap advertisement

Output:

```text
public/media/pollo/academy/obserra-academy-cybersecurity-foundations-15s.mp4
```

Duration: 15 seconds

Website headline:

```text
Build the judgment behind secure decisions.
```

Website copy:

```text
Follow the controlled canary build for new professionals learning evidence, identity, risk, escalation, and accountable action.
```

Call to action:

```text
View canary build
```

### Shot sequence

1. Seconds 0 to 4: A new professional notices a suspicious access or message event and pauses before acting.
2. Seconds 4 to 9: The learner reviews evidence, identity, business context, risk, and escalation authority.
3. Seconds 9 to 13: The learner communicates a defensible action to a team and documents the decision.
4. Seconds 13 to 15: Clean Academy composition with negative space for controlled website copy.

### Pollo prompt

```text
Fifteen second cinematic professional learning advertisement for Cybersecurity Foundations for New Professionals. Show a professional noticing a suspicious access request or message, pausing safely, preserving evidence, evaluating identity, business context, risk, and escalation authority, then communicating and documenting a defensible action with a cybersecurity team. Realistic modern workplace and security operations environment, natural human behavior, premium enterprise documentary lighting, controlled camera movement, dark navy and black, restrained gold, white, subtle holographic blue, clean negative space for website copy, no generated text, no logos, no public figures, no hooded hackers, no green code rain, no exaggerated hacking imagery, no morphing people or interfaces, 16:9.
```

Optional voiceover for a separate social version:

```text
Cybersecurity begins with judgment. Learn how to evaluate evidence, protect identity, understand risk, escalate responsibly, and take action you can explain and defend.
```

## Asset 3: AI governance leadership roadmap advertisement

Output:

```text
public/media/pollo/academy/obserra-academy-ai-governance-leadership-15s.mp4
```

Duration: 15 seconds

Website headline:

```text
Govern intelligent systems before risk scales.
```

Website copy:

```text
Explore the planned leadership pathway for AI ethics, policy, oversight, evidence, privacy, and responsible enterprise adoption.
```

Call to action:

```text
View AI course roadmap
```

### Shot sequence

1. Seconds 0 to 4: Business leaders and technical experts review an enterprise AI use case.
2. Seconds 4 to 9: The group evaluates data, privacy, ethical impact, model risk, accountability, and human oversight.
3. Seconds 9 to 13: An approval pathway and monitored deployment are established.
4. Seconds 13 to 15: Clean Academy composition with negative space for controlled website copy.

### Pollo prompt

```text
Fifteen second cinematic executive learning advertisement for enterprise AI governance. Show business leaders, legal, privacy, cybersecurity, data, and technical experts reviewing an AI use case, evaluating data sensitivity, privacy, ethical impact, model risk, human oversight, accountability, evidence, and approval authority, then establishing a governed monitored deployment. Premium realistic boardroom and technology governance environments, natural human behavior, motivated lighting, controlled camera movement, dark navy and black, restrained gold, white, subtle holographic blue, clean negative space for website copy, no generated text, no logos, no public figures, no humanoid robots, no science fiction spectacle, no morphing interfaces or people, 16:9.
```

Optional voiceover for a separate social version:

```text
Responsible AI requires more than policy. Learn how leaders connect ethics, data, privacy, oversight, evidence, accountability, and controlled adoption.
```

## Asset 4: CISO and board leadership roadmap advertisement

Output:

```text
public/media/pollo/academy/obserra-academy-ciso-board-leadership-15s.mp4
```

Duration: 15 seconds

Website headline:

```text
Translate technical risk into executive action.
```

Website copy:

```text
Develop board communication, executive judgment, crisis leadership, program strategy, and defensible investment decisions.
```

Call to action:

```text
View leadership roadmap
```

### Shot sequence

1. Seconds 0 to 4: A CISO receives complex technical risk evidence.
2. Seconds 4 to 9: The evidence is translated into business consequence, options, uncertainty, ownership, and investment tradeoffs.
3. Seconds 9 to 13: The CISO briefs executives or the board and supports a clear decision.
4. Seconds 13 to 15: Clean Academy composition with negative space for controlled website copy.

### Pollo prompt

```text
Fifteen second cinematic executive learning advertisement for CISO and board leadership. Show a senior cybersecurity leader receiving complex technical evidence, translating it into business consequence, uncertainty, ownership, options, investment tradeoffs, and resilience, then briefing executive leaders or a board and supporting a clear accountable decision. Realistic executive office, operations center, and boardroom, natural professional behavior, premium documentary lighting, slow controlled camera language, dark navy and black, restrained gold, white, subtle holographic blue, clean negative space for website copy, no generated text, no logos, no public figures, no exaggerated dashboards, no generic server room montage, no morphing people or objects, 16:9.
```

Optional voiceover for a separate social version:

```text
Technical evidence becomes leadership value only when executives understand the consequence, choices, ownership, and action. Build the judgment to lead that conversation.
```

## Asset 5: Executive protection and intelligence roadmap advertisement

Output:

```text
public/media/pollo/academy/obserra-academy-executive-protection-intelligence-15s.mp4
```

Duration: 15 seconds

Website headline:

```text
Prepare leaders for physical and digital exposure.
```

Website copy:

```text
Explore planned learning in protective intelligence, executive travel risk, situational awareness, resilience, and coordinated response.
```

Call to action:

```text
View protection roadmap
```

### Shot sequence

1. Seconds 0 to 4: A professional team reviews executive travel, location, digital exposure, facility, and threat context.
2. Seconds 4 to 9: Learners evaluate protective intelligence, route conditions, contingencies, communication, and escalation.
3. Seconds 9 to 13: The team coordinates discreet preventive action and continuity support.
4. Seconds 13 to 15: Clean Academy composition with negative space for controlled website copy.

### Pollo prompt

```text
Fifteen second cinematic professional learning advertisement for executive protection and protective intelligence. Show learners and experienced professionals reviewing executive travel, digital exposure, location risk, facility conditions, threat information, routes, contingencies, communication, escalation, and continuity. Conclude with discreet preventive coordination supporting safe executive movement. Realistic office, airport, vehicle, hotel, and corporate environments, natural professional behavior, emphasis on preparation and prevention rather than confrontation, dark navy and black, restrained gold, white, subtle blue, motivated lighting, controlled camera movement, clean negative space for website copy, no generated text, no logos, no public figures, no weapons focus, no tactical fantasy, no morphing people or vehicles, 16:9.
```

Optional voiceover for a separate social version:

```text
Protective intelligence begins before movement. Learn how digital exposure, travel conditions, physical risk, communication, and contingency planning support safer executive decisions.
```

## Website behavior

The Academy page implementation provides:

1. Static official poster fallback by default.
2. A separate Academy-only feature flag.
3. Muted playback when the asset is visible.
4. Automatic pause outside the viewport.
5. User pause and play control.
6. Reduced motion fallback.
7. Video error fallback.
8. Official logo applied by the website.
9. Internal course roadmap links only.
10. No database, API, identity, payment, LMS authoring, or external script connection.

## Acceptance checklist

1. Prompt contains no sensitive or customer information.
2. Asset matches the approved course or learning pathway.
3. Asset does not imply the course is already published.
4. Official Obserra palette and Academy positioning are recognizable.
5. Human movement and environments are realistic.
6. No morphing faces, hands, objects, vehicles, or interfaces.
7. No generated official logo or critical text.
8. No third party logos or public figure likenesses.
9. No robotic avatar, static slide deck, or generic stock montage.
10. H.264, 1920 by 1080, 24 frames per second, and Rec.709 pass.
11. Hero loop seam passes.
12. Poster fallback passes.
13. Pause and play passes.
14. Reduced motion fallback passes.
15. Desktop and mobile performance pass.
16. Database-isolation automated tests pass.
17. Owner approval is recorded.
18. Feature flag remains false until every active file is deployed and validated.
