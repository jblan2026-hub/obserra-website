# Obserra EPI Academy Master Handoff

Snapshot: 2026-08-12 19:39 ET

Owner and presenter: Dr. Jody Blanchard

Sole approved title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Academy: Obserra EPI Academy

Website: https://www.obserrallc.com

## Purpose

This is the consolidated sanitized restart state for the current Academy build. Read it with `docs/OBSERRA-ACADEMY-RESTART-HERE.md`, `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`, and `docs/academy-media-pipeline/LATEST-HANDOFF.md` before changing any course artifact. Preserve completed work, failures, corrections, hashes, and runtime evidence.

For the separate Florida FDACS Class D Security Officer School / regulated LMS build, read `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`. That regulated-school workstream is parallel to, but distinct from, the commercial Academy Course 1–N production sequence.

## Permanent course rules

- Preserve canonical identity and brand exactly.
- Final course video is produced and approved by Dr. Jody Blanchard.
- Every learner-facing substantive section uses the governed LearnWorlds activity stack and its own native-template assessment.
- Standard five-module courses use 60 assessment questions and an 80 percent final passing threshold unless the owner changes it.
- Static QA is not LearnWorlds runtime acceptance.
- Use Windows-safe delivery naming and short extraction roots.
- Keep courses in Draft until authenticated save/reopen, SCORM, assessment, completion, certificate, accessibility, desktop/mobile, and owner acceptance pass.

## Separate FDACS Class D school/LMS workstream

Authoritative handoff:

`docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`

Current implementation branch:

`feature/florida-class-d-lms-foundation`

Current PR:

`#56 — Florida Class D LMS foundation and Coming Soon training tab`

Current regulated build status:

```text
Public state: COMING SOON · LMS IN PROGRESS
Gate 1 — Foundation controls: IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING
Gate 2 — Regulated Student Record Model: IMPLEMENTED IN SOURCE / DURABLE PERSISTENCE AND CI EVIDENCE PENDING
Next gate: Gate 3 — Durable Regulated Records & Administrative API
Payment/enrollment activation: BLOCKED
Student LMS access: BLOCKED
Controlled final examination access: BLOCKED
Regulatory completion issuance: BLOCKED
LIAS execution: BLOCKED
FDACS approval representation: PROHIBITED UNTIL APPLICABLE APPROVAL IS ESTABLISHED
```

Do not treat the Class D build as Course 5 or as part of the normal LearnWorlds course-production queue. Its student records, instructional-time evidence, attendance, examination-control, LIAS, inspection, and regulatory launch controls are governed independently.

## LearnWorlds SCORM discovery

The inherited Course 1 SCORM upload was rejected. The corrected pattern uses one standalone SCORM 1.2 ZIP per section, `imsmanifest.xml` at ZIP root, explicit SCORM 1.2 metadata, valid SCO resource and launch href, the launch file inside the ZIP, no wrapper directory, and clean CRC validation.

Dr. Jody Blanchard reported that the corrected Course 1 S00 canary uploaded successfully. This is evidence that the packaging pattern is accepted by LearnWorlds. It does not prove all packages or full course runtime.

## Windows extraction discovery

The finalized Course 1 package produced a Windows path-too-long extraction error. New deliveries use short ZIP names, short internal roots, and validated short extraction paths close to the drive root.

## Course 1

Cybersecurity Foundations for New Professionals

```text
Package: C1.zip
SHA-256: b9e822415a7d91f072f68789f2d533a7934c8cfa2e37ea61427c0bb0c49a9271
Files: 774
SCORM bundle: C1-SCORM-READY.zip
SCORM SHA-256: 58d9082e7d4aa52f0bf36cce3625bef59e3157e87d4c3e4409ef32c1b37b1c0d
Corrected S00 SCORM canary: ACCEPTED BY LEARNWORLDS, owner reported
Full authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 2

Generative AI Fundamentals for Business Leaders

```text
Package: Obserra-EPI-Academy-Generative-AI-Fundamentals-for-Business-Leaders-Owner-Video-Integration-Ready-v3.1.0.zip
SHA-256: aa1057c26a3e1ddcb401ae372c038242ff7a0a25afbbe8c84daae4002724185b
Sections: 8
Native assessments: 8
Questions: 60
Presentations: 8
Owner-video kit: COMPLETE
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

Required remediation: Course 2 predates discovery of the SCORM manifest defect. Replace its eight inner SCORM packages with the Course 1 proven SCORM 1.2 structure and issue a Windows-safe Course 2 delivery before LearnWorlds upload.

## Course 3

Large Language Models, LLMs, Explained for Leaders

```text
Package: C3-LLM.zip
SHA-256: b7456c6ee369f798090ad8c010df591598c794a6f6382f88af94530b5e5d3138
Members: 747
SCORM bundle: C3-LLM-SCORM-READY.zip
SCORM SHA-256: 4556814c0c8033b445370f7af6b611479e51b36fd12c064dc08005ed258e601a
Hardened SCORM pattern: YES
Owner-video production bible/scripts/matrix: COMPLETE
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 4

Security Awareness for High Risk Employees

```text
Package: C4-SAHR.zip
SHA-256: 1a11db72bb52e1db82c1e5569d6f00bd92a6eb154c45f52ab115ba7dbfb0aa99
Members: 708
SCORM bundle: C4-SAHR-SCORM-READY.zip
SCORM SHA-256: 70dbf4edd4f811190545f7c324dccb01add4c78ee77687492db511904223e87c
Hardened SCORM pattern: YES
Owner-video production bible/scripts/matrix: COMPLETE
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

Preserved Course 4 defect: all eight inherited presentation PDFs were byte-identical and incorrectly displayed the Resource Library deck. The eight PPTX masters were distinct and correct. Corrected PDFs were regenerated from the proper PPTX masters and the failure was retained in the audit record.

## What is proven

- Static package integrity for current delivered packages.
- Corrected Course 1 S00 SCORM packaging accepted by LearnWorlds.
- Windows-safe delivery standard for Courses 1, 3, and 4.
- Owner-video scripts and production controls exist for Courses 1 through 4.
- Florida Class D Gate 1 and Gate 2 source contracts have been implemented on the dedicated Class D branch.

## What is not proven

- Complete authenticated LearnWorlds import for each course.
- All SCORM launch, state retention, scoring, and completion behavior.
- All native assessment import and persistence behavior.
- Final 80 percent pass behavior in the actual Draft course.
- Forms and assignment save/reopen behavior.
- Certificate issuance.
- Desktop/mobile learner journey.
- LMS accessibility acceptance.
- Owner end-to-end acceptance.
- Publication or live checkout readiness.
- Durable persistence, CI acceptance, deployment, regulatory approval, live enrollment, final-exam runtime, completion issuance, or LIAS execution for the Florida Class D school/LMS build.

## Next controlled work

### Commercial Academy course build

1. Remediate Course 2 SCORM and issue a Windows-safe Course 2 package before LearnWorlds upload.
2. Continue to Course 5: Executive Travel Risk Management.
3. Continue afterward to Digital Exposure and Executive Privacy, AI Ready Workforce, Coding for Cyber Leaders, and the remaining governed catalog.

### Separate Florida Class D school/LMS build

1. Resume from `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`.
2. Continue with Gate 3: Durable Regulated Records & Administrative API.
3. Preserve the Coming Soon state and keep payment, enrollment, examination, completion issuance, and LIAS execution blocked until their own validated gates and applicable regulatory authorization exist.

Update protected and sanitized handoffs after every substantive build, failure, correction, runtime result, or owner decision.

## Restart command

```text
Read the Master Handoff, Restart Here, Continuous Handoff, and Latest Handoff before acting. Preserve all completed work and failures. For the commercial Academy course build, treat the corrected Course 1 S00 LearnWorlds upload as the proven SCORM 1.2 packaging pattern, remediate Course 2, then continue to Executive Travel Risk Management. For Florida Class D school/FDACS/LMS work, read the separate FDACS Class D School Build Handoff and resume from its latest gate. Never mix the two workstreams or claim publication/regulatory readiness without the applicable authenticated and regulatory evidence.
```

## Public repository boundary

The repository is public. Do not commit complete course manuscripts, assessment answer keys, owner videos, credentials, provider identifiers, private learner data, regulated learner PII, protected examination material, FDACS/LIAS credentials, or protected Academy intellectual property. Public handoffs contain sanitized status, hashes, controls, failures, and release boundaries only.