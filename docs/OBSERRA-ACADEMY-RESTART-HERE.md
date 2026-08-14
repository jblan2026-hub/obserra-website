# Obserra EPI Academy Public Restart Notice v14.0.0

Owner and presenter: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Academy: Obserra EPI Academy

Official website: https://www.obserrallc.com

Snapshot: 2026-08-12 19:39 ET

## Restart sequence

1. Read `docs/academy-media-pipeline/MASTER-HANDOFF-2026-08-12.md`.
2. Read `docs/academy-media-pipeline/LATEST-HANDOFF.md`.
3. Read `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`.
4. Read `docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md`.
5. Read `docs/academy-media-pipeline/PER-SECTION-LEARNWORLDS-ACTIVITY-ARCHITECTURE.md`.
6. Read `docs/academy-media-pipeline/COURSE-SECTION-ASSESSMENT-STANDARD.md`.
7. For any Florida Class D school, FDACS, regulated LMS, attendance, examination-control, LIAS, or school-operations work, also read `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md` and treat it as a separate regulated workstream from the commercial course build.
8. Preserve all completed course assets, failures, corrections, hashes, and runtime evidence before changing anything.
9. Recheck current platform objects and official sources immediately before authenticated import or publication.

## Separate regulated-school workstream

The Florida FDACS Class D Security Officer School / regulated LMS build is tracked separately in `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`. Do not merge its regulatory gates, student-record controls, attendance/time evidence, certification-examination controls, LIAS workflow, or inspection-readiness state into the normal Academy Course 1–N production sequence.

## Permanent controls

- Every learner-facing substantive section uses the complete governed LearnWorlds activity stack.
- Every learner-facing section has its own native-template assessment.
- Standard five-module courses contain 60 assessment questions: 5 welcome, 5 per module, 25 final, 5 resource-library check.
- Final pass threshold is 80 percent unless the owner changes it.
- Final videos are produced and approved by Dr. Jody Blanchard. Assistant-generated final course video remains prohibited.
- Static QA is not LearnWorlds runtime acceptance.
- Keep courses in Draft until authenticated save/reopen, SCORM, assessment, completion, certificate, accessibility, desktop/mobile, and owner end-to-end acceptance pass.
- Use Windows-safe delivery names and short extraction roots.

## Proven SCORM packaging standard

The original Course 1 SCORM upload was rejected by LearnWorlds. The corrected structure uses one standalone SCORM 1.2 ZIP per section with `imsmanifest.xml` at ZIP root, explicit SCORM 1.2 metadata, a valid SCO launch resource, the launch file present in the ZIP, no wrapper directory, and clean CRC validation.

Dr. Jody Blanchard reported that the corrected Course 1 S00 canary uploaded successfully. Treat that result as proof of the packaging pattern only. It does not prove full-course runtime, persistence, scoring, certificate issuance, or all remaining SCORM packages.

## Windows-safe delivery standard

Course 1 exposed a Windows path-too-long extraction failure. All new deliveries must use short ZIP names, short internal roots, and a validated short extraction path such as `C:\C1`, `C:\C3_LLM`, or `C:\C4`.

## Current course state

### Course 1 - Cybersecurity Foundations for New Professionals

```text
Windows-safe package: C1.zip
SHA-256: b9e822415a7d91f072f68789f2d533a7934c8cfa2e37ea61427c0bb0c49a9271
Files: 774
SCORM bundle: C1-SCORM-READY.zip
SCORM SHA-256: 58d9082e7d4aa52f0bf36cce3625bef59e3157e87d4c3e4409ef32c1b37b1c0d
Corrected S00 SCORM canary: ACCEPTED BY LEARNWORLDS, owner reported
Full authenticated course runtime: NOT PROVEN
Publication: BLOCKED
```

### Course 2 - Generative AI Fundamentals for Business Leaders

```text
Integrated package: Obserra-EPI-Academy-Generative-AI-Fundamentals-for-Business-Leaders-Owner-Video-Integration-Ready-v3.1.0.zip
SHA-256: aa1057c26a3e1ddcb401ae372c038242ff7a0a25afbbe8c84daae4002724185b
Learner-facing sections: 8
Native assessments: 8
Questions: 60
Presentations: 8
Owner-video production kit: COMPLETE
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

Important: Course 2 was integrated before the SCORM defect was discovered. Before LearnWorlds upload, replace its eight inner SCORM packages with the Course 1 proven SCORM 1.2 structure and issue a Windows-safe Course 2 delivery. Do not use the inherited Course 2 SCORM files as authoritative.

### Course 3 - Large Language Models, LLMs, Explained for Leaders

```text
Windows-safe package: C3-LLM.zip
SHA-256: b7456c6ee369f798090ad8c010df591598c794a6f6382f88af94530b5e5d3138
Members: 747
SCORM bundle: C3-LLM-SCORM-READY.zip
SCORM SHA-256: 4556814c0c8033b445370f7af6b611479e51b36fd12c064dc08005ed258e601a
Owner-video production bible/scripts/matrix: COMPLETE
SCORM structure: HARDENED TO PROVEN COURSE 1 PATTERN
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

### Course 4 - Security Awareness for High Risk Employees

```text
Windows-safe package: C4-SAHR.zip
SHA-256: 1a11db72bb52e1db82c1e5569d6f00bd92a6eb154c45f52ab115ba7dbfb0aa99
Members: 708
SCORM bundle: C4-SAHR-SCORM-READY.zip
SCORM SHA-256: 70dbf4edd4f811190545f7c324dccb01add4c78ee77687492db511904223e87c
Owner-video production bible/scripts/matrix: COMPLETE
SCORM structure: HARDENED TO PROVEN COURSE 1 PATTERN
Authenticated LearnWorlds runtime: NOT PROVEN
Publication: BLOCKED
```

Preserved Course 4 defect: all eight inherited presentation PDFs were byte-identical and showed the Resource Library deck. The PPTX masters were distinct. Corrected PDFs were regenerated from the proper PPTX masters and the failure was retained in audit history.

## Current controlled work order

1. Remediate Course 2 SCORM using the proven Course 1 structure and issue a Windows-safe Course 2 delivery before LearnWorlds upload.
2. Continue to Course 5, `Executive Travel Risk Management`.
3. Then continue to `Digital Exposure and Executive Privacy`, `AI Ready Workforce`, `Coding for Cyber Leaders`, and the remaining catalog in governed order.
4. Integrate owner-produced videos only after identity, title, branding, transcript, caption, audio, technical, and owner-approval validation.
5. Never claim publication readiness without authenticated end-to-end LearnWorlds runtime evidence.
6. Track Florida Class D school/LMS development only in the separate FDACS Class D handoff and its own gated sequence.

## Continuation command

```text
Read the v14.0.0 Restart Notice, Master Handoff, Latest Handoff, and Continuous Handoff before acting. Preserve all completed work and failures. Treat the corrected Course 1 S00 LearnWorlds upload as the proven SCORM 1.2 packaging pattern. Before Course 2 LearnWorlds upload, replace its eight SCORM packages with the proven structure and issue a Windows-safe delivery. Courses 3 and 4 already use the hardened pattern. Then continue to Executive Travel Risk Management using the same eight-section architecture, native assessment standard, owner-video boundary, Windows-safe packaging, evidence discipline, and Draft runtime acceptance gates. For Florida Class D school/FDACS/LMS work, switch to the separate FDACS Class D School Build Handoff and resume from its latest regulated gate instead of the commercial-course sequence.
```

## Public repository warning

This repository is public. Complete manuscripts, assessment answer keys, owner media, authenticated screenshots containing private data, credentials, provider identifiers, learner data, and protected Academy intellectual property remain outside the public repository.