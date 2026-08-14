# Obserra EPI Academy Public Continuous Handoff v14.0.0

The authoritative sanitized operational record is `docs/academy-media-pipeline/LATEST-HANDOFF.md`. The consolidated restart snapshot is `docs/academy-media-pipeline/MASTER-HANDOFF-2026-08-12.md`.

The separate authoritative sanitized record for the Florida FDACS Class D Security Officer School / regulated LMS build is `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`. That workstream must remain distinct from the commercial Academy course-production sequence.

## Canonical identity

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
www.obserrallc.com

Academy: Obserra EPI Academy
Short business: Obserra EPI
EPI: Executive Protection & Intelligence
```

No alternate title, employer reference, employment history, substitute identity, unapproved voice, altered logo, or unapproved brand form is authorized in learner-facing content.

## Permanent no-exceptions controls

1. Verify the actual current target object and current official source before any account-specific import, publication, or release claim.
2. Preserve and hash native templates and validated source packages.
3. Generate only after verification passes.
4. Preserve every defect, discrepancy, rejection, correction, package version, runtime result, and owner decision.
5. Static package QA never equals LearnWorlds runtime acceptance.
6. Final owner video is produced and approved only by Dr. Jody Blanchard.
7. Use Windows-safe delivery names and short extraction roots.
8. Keep every course in Draft until authenticated save/reopen, SCORM, assessment, completion, certificate, accessibility, desktop/mobile, and owner acceptance gates pass.
9. For Florida Class D school/LMS work, preserve the separate FDACS gated sequence and do not activate payment, enrollment, examination, completion issuance, or LIAS execution before its applicable gate and regulatory authorization.

## Separate Florida Class D regulated-school workstream

```text
Handoff: docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md
Implementation branch: feature/florida-class-d-lms-foundation
PR: #56
Public state: COMING SOON · LMS IN PROGRESS
Gate 1: IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING
Gate 2: IMPLEMENTED IN SOURCE / DURABLE PERSISTENCE AND CI EVIDENCE PENDING
Next: Gate 3 — Durable Regulated Records & Administrative API
```

The Class D build is not a normal LearnWorlds catalog course. It has independent regulated controls for identity, enrollment, cohorts, attendance, instructional-time evidence, learning checks, remediation, certification-exam eligibility, school administration, FDACS/LIAS workflow, retained records, inspection readiness, and regulatory launch.

## Permanent course architecture

Every learner-facing substantive section contains the governed LearnWorlds activity-category stack and its own native-template assessment.

```text
Multimedia
Live Sessions controls
Ebook
Exams and Assignments
Self-Assessment
Forms
Certificates and Completion
Social
Embed and External Links
Owner Video Production Required
Authoritative Resources
Accessibility, Transcripts and Captions
QA Evidence and Release
```

## Native assessment standard

```text
Template: Question Bank Template.xlsx
SHA-256: 23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
Worksheets: Instructions, Examples, Questions
Required headings: Group, Type, Question, CorAns, Answer1 through Answer10, CorrectExplanation, IncorrectExplanation
```

Standard five-module course assessment count:

```text
Welcome baseline: 5
Modules 1-5: 5 each
Final assessment: 25
Resource-library check: 5
Total: 60
Final pass mark: 80 percent unless owner changes it
```

This generic Academy assessment standard does not supersede the separately controlled Florida Class D certification-examination requirements recorded in the FDACS Class D School Build Handoff.

## Proven SCORM packaging pattern

Course 1 originally failed LearnWorlds SCORM validation. The corrected packaging pattern is now mandatory:

- standalone SCORM 1.2 ZIP per section;
- `imsmanifest.xml` at ZIP root;
- explicit SCORM 1.2 metadata;
- valid SCO resource and launch reference;
- launch file included;
- no wrapper folder above the manifest;
- clean CRC validation.

Dr. Jody Blanchard reported that the corrected Course 1 S00 canary uploaded successfully to LearnWorlds. This proves the packaging pattern, not full-course runtime behavior.

## Windows-safe delivery pattern

Course 1 exposed a Windows path-too-long extraction failure. New deliveries must use a short external ZIP name, short internal root, and validated extraction near the drive root. Do not ship deep nested delivery roots that can exceed Windows path limits.

## Course 1 - Cybersecurity Foundations for New Professionals

```text
Package: C1.zip
SHA-256: b9e822415a7d91f072f68789f2d533a7934c8cfa2e37ea61427c0bb0c49a9271
Files: 774
SCORM bundle: C1-SCORM-READY.zip
SCORM SHA-256: 58d9082e7d4aa52f0bf36cce3625bef59e3157e87d4c3e4409ef32c1b37b1c0d
S00 corrected SCORM upload: ACCEPTED BY LEARNWORLDS, owner reported
Full authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 2 - Generative AI Fundamentals for Business Leaders

```text
Integrated package: Obserra-EPI-Academy-Generative-AI-Fundamentals-for-Business-Leaders-Owner-Video-Integration-Ready-v3.1.0.zip
SHA-256: aa1057c26a3e1ddcb401ae372c038242ff7a0a25afbbe8c84daae4002724185b
Sections: 8
Native assessments: 8
Questions: 60
Presentations: 8
Owner-video kit: COMPLETE
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

Course 2 predates discovery of the SCORM manifest defect. Before LearnWorlds upload, replace its eight inherited SCORM packages with the proven Course 1 SCORM 1.2 structure and issue a Windows-safe Course 2 package.

## Course 3 - Large Language Models, LLMs, Explained for Leaders

```text
Package: C3-LLM.zip
SHA-256: b7456c6ee369f798090ad8c010df591598c794a6f6382f88af94530b5e5d3138
Members: 747
SCORM bundle: C3-LLM-SCORM-READY.zip
SCORM SHA-256: 4556814c0c8033b445370f7af6b611479e51b36fd12c064dc08005ed258e601a
Owner-video production bible/scripts/matrix: COMPLETE
Hardened SCORM pattern: YES
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

## Course 4 - Security Awareness for High Risk Employees

```text
Package: C4-SAHR.zip
SHA-256: 1a11db72bb52e1db82c1e5569d6f00bd92a6eb154c45f52ab115ba7dbfb0aa99
Members: 708
SCORM bundle: C4-SAHR-SCORM-READY.zip
SCORM SHA-256: 70dbf4edd4f811190545f7c324dccb01add4c78ee77687492db511904223e87c
Owner-video production bible/scripts/matrix: COMPLETE
Hardened SCORM pattern: YES
Authenticated runtime: NOT PROVEN
Publication: BLOCKED
```

Preserved defect: the eight inherited Course 4 presentation PDFs were byte-identical and incorrectly showed the Resource Library deck. The distinct PPTX masters were used to regenerate correct PDFs. The failure remains documented.

## Permanent owner-video directive

```text
Assistant-generated final course video: PROHIBITED
Connected-provider final course-video generation: PROHIBITED
Final video production and approval: Dr. Jody Blanchard
```

Scripts, teleprompter copy, storyboards, shot lists, on-screen text, caption/transcript specifications, technical requirements, and insertion instructions remain authorized.

## Current controlled work order

### Commercial Academy course build

1. Remediate Course 2 SCORM and Windows-safe packaging before its LearnWorlds upload.
2. Continue to `Executive Travel Risk Management`.
3. Then continue to `Digital Exposure and Executive Privacy`, `AI Ready Workforce`, `Coding for Cyber Leaders`, and the remaining governed catalog.
4. Integrate owner-produced videos only after technical, identity, caption, transcript, brand, accessibility, and owner-approval validation.
5. Never claim LearnWorlds completion or publication readiness without authenticated end-to-end runtime evidence.

### Florida Class D school / regulated LMS build

1. Read `docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md`.
2. Resume from Gate 3 — Durable Regulated Records & Administrative API.
3. Preserve the Coming Soon state and all later regulatory launch gates.

## Release boundary

```text
Course 1 content package: COMPLETE NONVIDEO / OWNER VIDEO READY
Course 1 corrected S00 SCORM packaging: LEARNWORLDS ACCEPTED, OWNER REPORTED
Course 2 content package: COMPLETE NONVIDEO / SCORM REMEDIATION REQUIRED BEFORE UPLOAD
Course 3 content package: COMPLETE NONVIDEO / HARDENED SCORM / RUNTIME PENDING
Course 4 content package: COMPLETE NONVIDEO / HARDENED SCORM / RUNTIME PENDING
Florida Class D School/LMS: SEPARATE WORKSTREAM / GATE 1 + GATE 2 SOURCE IMPLEMENTED / GATE 3 NEXT
Authenticated full-course runtime: NOT PROVEN
Certificate issuance acceptance: NOT PROVEN
Desktop/mobile learner journey: NOT PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
Production merge/cutover: BLOCKED
```

## Handoff rule

Every new work session must read the Master Handoff, Latest Handoff, Restart Here, Actual-Site Verification Gate, Per-Section LearnWorlds Activity Architecture, and Course Section Assessment Standard before generating or changing commercial course assets. Any Florida Class D school/FDACS/LMS work must additionally read and follow the separate FDACS Class D School Build Handoff before changing regulated-school source or operations.