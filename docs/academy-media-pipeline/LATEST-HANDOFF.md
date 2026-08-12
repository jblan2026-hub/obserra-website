# Obserra EPI Academy Public Continuation Notice v14.0.0

Owner and presenter: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Academy: Obserra EPI Academy

Official website: https://www.obserrallc.com

Snapshot: 2026-08-12 19:39 ET

## Governing records

```text
docs/academy-media-pipeline/MASTER-HANDOFF-2026-08-12.md
docs/OBSERRA-ACADEMY-RESTART-HERE.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
docs/academy-media-pipeline/PER-SECTION-LEARNWORLDS-ACTIVITY-ARCHITECTURE.md
docs/academy-media-pipeline/COURSE-SECTION-ASSESSMENT-STANDARD.md
config/academy-actual-site-verification-policy.json
config/academy-per-section-learnworlds-activity-standard.json
config/academy-course-section-assessment-policy.json
```

## Canonical identity

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
www.obserrallc.com
Academy: Obserra EPI Academy
```

No alternate owner title, employer attribution, substitute identity, altered logo, unapproved voice, or unapproved brand form is authorized in learner-facing content.

## Permanent architecture

Every learner-facing substantive section uses the governed 13-category LearnWorlds architecture and its own native-template assessment. Standard five-module courses contain 60 assessment questions and use an 80 percent final pass mark unless the owner changes it.

Final videos remain owner-produced. Course packages include scripts, teleprompter copy, storyboards, on-screen text, caption/transcript controls, technical specifications, and exact insertion filenames, but no final owner video binaries.

## LearnWorlds SCORM runtime discovery and permanent correction

The inherited Course 1 SCORM package was rejected by LearnWorlds as invalid. Investigation found manifests referencing schema files not present in the ZIP and inconsistent SCORM metadata declarations. A second operational issue was that the complete course delivery ZIP is not itself a SCORM upload package.

The corrected mandatory SCORM standard is:

```text
One standalone SCORM 1.2 ZIP per section
imsmanifest.xml at ZIP root
Explicit SCORM 1.2 metadata
Valid SCO resource and launch href
Launch file included in ZIP
No wrapper directory above manifest
Clean CRC validation
```

Dr. Jody Blanchard subsequently reported that the corrected Course 1 S00 canary uploaded successfully to LearnWorlds. Treat this as direct evidence that the corrected packaging pattern is accepted. It does not prove all other SCORM packages, full course persistence, scoring, completion, certificate issuance, or publication readiness.

## Windows path-length discovery and permanent correction

The finalized Course 1 delivery produced a Windows path-too-long extraction error on the owner's computer. The delivery standard now requires short external ZIP names, short internal roots, and validated extraction near the drive root. Course 1 was reissued as `C1.zip`; Courses 3 and 4 were built using the short-path standard from the outset.

## Course 1 - Cybersecurity Foundations for New Professionals

```text
Current Windows-safe package: C1.zip
SHA-256: b9e822415a7d91f072f68789f2d533a7934c8cfa2e37ea61427c0bb0c49a9271
Files: 774
SCORM bundle: C1-SCORM-READY.zip
SCORM SHA-256: 58d9082e7d4aa52f0bf36cce3625bef59e3157e87d4c3e4409ef32c1b37b1c0d
Corrected S00 SCORM canary: ACCEPTED BY LEARNWORLDS, owner reported
Owner-video integration: READY
Full authenticated course runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 2 - Generative AI Fundamentals for Business Leaders

```text
Current integration package: Obserra-EPI-Academy-Generative-AI-Fundamentals-for-Business-Leaders-Owner-Video-Integration-Ready-v3.1.0.zip
SHA-256: aa1057c26a3e1ddcb401ae372c038242ff7a0a25afbbe8c84daae4002724185b
Sections: 8
Native assessments: 8
Questions: 60
Presentations: 8
Owner-video scripts and production controls: COMPLETE
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

Important unresolved item: Course 2 was integrated before the SCORM defect was discovered. Its eight inner SCORM packages must be replaced with the proven Course 1 SCORM 1.2 structure before LearnWorlds upload. A Windows-safe Course 2 delivery should be issued at the same time. Do not treat the inherited Course 2 SCORM packages as authoritative.

## Course 3 - Large Language Models, LLMs, Explained for Leaders

```text
Current Windows-safe package: C3-LLM.zip
SHA-256: b7456c6ee369f798090ad8c010df591598c794a6f6382f88af94530b5e5d3138
Members: 747
SCORM bundle: C3-LLM-SCORM-READY.zip
SCORM SHA-256: 4556814c0c8033b445370f7af6b611479e51b36fd12c064dc08005ed258e601a
Hardened SCORM structure: YES
Owner-video production bible/scripts/matrix: COMPLETE
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 4 - Security Awareness for High Risk Employees

```text
Current Windows-safe package: C4-SAHR.zip
SHA-256: 1a11db72bb52e1db82c1e5569d6f00bd92a6eb154c45f52ab115ba7dbfb0aa99
Members: 708
SCORM bundle: C4-SAHR-SCORM-READY.zip
SCORM SHA-256: 70dbf4edd4f811190545f7c324dccb01add4c78ee77687492db511904223e87c
Hardened SCORM structure: YES
Owner-video production bible/scripts/matrix: COMPLETE
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

Preserved Course 4 failure and correction:

1. All eight inherited presentation PDFs were byte-identical and displayed the Authoritative Resource Library deck.
2. The eight PPTX masters were distinct and retained the correct section-specific content.
3. The PDFs were regenerated from the correct PPTX masters.
4. The inherited failure remains part of the audit history and must not be erased.

## Current runtime boundary

Proven:

- static package integrity for the delivered course packages;
- corrected Course 1 S00 SCORM packaging accepted by LearnWorlds;
- Windows-safe delivery process for Courses 1, 3, and 4;
- owner-video scripts and production controls exist for Courses 1 through 4.

Not proven:

- complete authenticated LearnWorlds import for each course;
- all SCORM packages launching and retaining state;
- all assessment imports, scoring, attempts, and persistence;
- final 80 percent pass behavior in the actual Draft course;
- forms and assignments save/reopen behavior;
- certificate issuance;
- desktop/mobile learner journey;
- LMS accessibility acceptance;
- owner end-to-end acceptance;
- publication or live checkout readiness.

## Current controlled work order

1. Remediate Course 2 SCORM using the Course 1 proven structure and issue a Windows-safe Course 2 package before any LearnWorlds SCORM upload.
2. Continue to Course 5: `Executive Travel Risk Management`.
3. Continue afterward to `Digital Exposure and Executive Privacy`, `AI Ready Workforce`, `Coding for Cyber Leaders`, and the remaining governed catalog.
4. Integrate owner-produced videos only after direct technical, identity, transcript, caption, branding, accessibility, and owner-approval validation.
5. Claim LearnWorlds readiness or completion only after authenticated import, save/reopen, SCORM, assessment, certificate, desktop/mobile, accessibility, and full learner-journey evidence exists.
6. Update protected and sanitized handoffs after every substantive build, failure, correction, runtime result, or owner decision.

## Release boundary

```text
Course 1: COMPLETE NONVIDEO OWNER-VIDEO-READY; S00 SCORM PACKAGING ACCEPTED; FULL RUNTIME PENDING
Course 2: COMPLETE NONVIDEO OWNER-VIDEO-READY; SCORM REMEDIATION REQUIRED BEFORE UPLOAD
Course 3: COMPLETE NONVIDEO OWNER-VIDEO-READY; HARDENED SCORM; RUNTIME PENDING
Course 4: COMPLETE NONVIDEO OWNER-VIDEO-READY; HARDENED SCORM; RUNTIME PENDING
Next course: Executive Travel Risk Management after Course 2 SCORM remediation
Authenticated full-course LearnWorlds acceptance: NOT PROVEN
Certificate issuance acceptance: NOT PROVEN
Desktop/mobile learner journey: NOT PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
Production merge/cutover: BLOCKED
```

## Public repository warning

This repository is public. Complete manuscripts, answer keys, authenticated private screenshots, owner media, provider identifiers, credentials, learner data, and protected Academy intellectual property remain outside the public repository. Public records contain sanitized governance, status, hashes, failures, and release boundaries only.