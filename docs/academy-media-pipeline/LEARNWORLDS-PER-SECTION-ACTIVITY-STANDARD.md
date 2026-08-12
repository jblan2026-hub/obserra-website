# Obserra EPI Academy LearnWorlds Per-Section Activity Standard

**Status:** MANDATORY  
**Applies to:** Every learner-facing section of every current and future Obserra EPI Academy course  
**Owner directive:** Each section of every course must use the complete LearnWorlds activity architecture verified from the actual target school, with detailed materials grouped by activity category.

## Core rule

Every course package must be organized by course section and, inside every section, by LearnWorlds activity category. Every applicable category must contain the actual learner-facing material, upload artifact, activity copy, configuration record, completion rule, and QA evidence. No category may be silently omitted.

If an observed activity option is not used, the category folder must contain a `NOT-USED-RATIONALE.md` stating:

1. the verified platform option;
2. the pedagogical, technical, privacy, accessibility, licensing, or account-configuration reason it is not deployed;
3. the owner or instructional-design approval state;
4. the future condition that would permit its use.

Empty category folders are prohibited.

## Required learner-facing course sections

1. Course Opening and Orientation
2. Instructional Module 1
3. Instructional Module 2
4. Instructional Module 3
5. Instructional Module 4
6. Instructional Module 5
7. Final Assessment and Course Completion
8. Authoritative Resource Library

Longer courses may add modules, but they may not remove the category architecture.

## Required category folders inside every learner-facing section

```text
01_Multimedia
02_Ebook
03_Exams
04_Self_Assessment
05_Forms
06_Certificates
07_Social
08_Embed
09_Evidence_and_QA
```

## Minimum instructional-module activity stack

### 01 Multimedia

Every instructional module must include:

- an owner-produced interactive-video slot marked `OWNER PRODUCTION REQUIRED` until Dr. Jody Blanchard supplies the final media;
- complete video script, teleprompter copy, storyboard, lower-third copy, on-screen text, caption template, transcript template, thumbnail specification, filename, and technical delivery requirements;
- one substantive SCORM / HTML5 lesson with valid manifest and launch content;
- one branded presentation file or presentation-ready source;
- one accessible PDF quick reference, job aid, or worksheet;
- one audio-summary script and delivery specification, without synthetic owner audio;
- documented decisions for LTI, YouTube, or other external multimedia.

LTI, YouTube, Slideshare, embedded media, or other external services may be used only after current actual-site, source, privacy, accessibility, security, licensing, and retention verification passes.

### 02 Ebook

Every instructional module must include:

- module overview and objectives;
- substantive main content;
- FAQ;
- summary and key takeaways;
- a complete written alternative that provides the full instructional substance when video is unavailable.

### 03 Exams

Every instructional module must include:

- one native-template module knowledge check, normally at least five questions;
- learning-objective mapping and answer rationale;
- pass mark, attempt, feedback, remediation, and completion settings;
- one applied text or file assignment when the learning objective requires a submitted artifact;
- a controlled rationale when Graded SCORM, Graded LTI, video assignment, or audio assignment is not used.

Every learner-facing section must contain its own native-template assessment activity under the separate Course Section Assessment Standard. Graded files use the `exam_` prefix; non-graded self-assessments use the `selfassessment_` prefix.

### 04 Self-Assessment

Every instructional module must include:

- one ungraded knowledge or confidence self-assessment;
- one reflection prompt tied to the module objective;
- documented decisions for Upload your work, Record your short video, and Record your audio.

Learner-recorded media requires privacy, consent, accessibility, retention, moderation, and deletion controls before use.

### 05 Forms

Every instructional module must include one action, decision, feedback, or practice form. No form may solicit real credentials, regulated data, confidential incident details, protected personal information, or unnecessary sensitive information.

### 06 Certificates

The category folder must exist in every section for traceability. Module-level certificates are not deployed unless the course design explicitly requires them and Dr. Jody Blanchard approves them. The standard module entry is:

```text
NOT APPLICABLE - COURSE-LEVEL COMPLETION CONTROL
```

### 07 Social

Every instructional module must include at least one moderated activity selected from the verified options:

- Think and Share;
- Ask questions and discuss;
- Self-Reflection;
- Assessment discussion;
- another currently verified Social activity appropriate to the objective.

The folder must document the prompt, moderator, conduct rule, sensitive-information warning, completion treatment, and escalation process.

### 08 Embed

Every instructional module must include at least one currently verified official primary-source external link or approved embed relevant to the module. Slideshare, iframe, custom embed, or external link use requires current source, privacy, security, accessibility, copyright, and licensing verification.

### 09 Evidence and QA

Every section must record:

- exact LearnWorlds activity title and type;
- source file or learner copy;
- required or optional status;
- completion rule;
- desktop and mobile checks;
- accessibility checks;
- actual-site verification reference;
- native-template filename and SHA-256 when applicable;
- import, launch, playback, scoring, and persistence result;
- owner approval state;
- every discrepancy and corrective action.

## Course-opening section requirements

The opening section must include:

- Ebook Welcome;
- Ebook Course overview;
- owner-produced interactive welcome-video slot and complete production-support package;
- orientation SCORM or presentation;
- learner disclosures and acknowledgement form;
- pre-course self-assessment;
- learner goals form;
- Introduce yourself form or social activity when moderation is assigned;
- learner workbook PDF;
- verified links to official Academy policies and course resources;
- a category-level rationale for any verified option not used.

## Final-assessment and completion section requirements

The final section must include:

- Ebook Summary or final review;
- native-template final assessment, normally 25 questions with an 80 percent pass mark;
- post-course self-assessment;
- course evaluation form;
- instructor evaluation form when appropriate;
- Certificate of completion;
- Ebook Course completion page;
- Assessment discussion or Certification and exam activities Social item when moderation is assigned;
- owner-produced course-close video slot and full production-support package;
- action plan and verified next-step resources.

## Authoritative Resource Library section requirements

The resource library must include:

- coursewide resource navigator PDF;
- official primary-source external links or approved PDF/embed activities;
- current title, revision, publication date, status, URL, access date, and applicability for each source;
- a native-template source-literacy self-assessment;
- a prohibition on representing an altered copy as an official publication.

Resource activities are normally optional and do not block course completion unless explicitly approved.

## Completion-rule baseline

```text
Interactive video: at least 90 percent watched and required interactions completed
SCORM / HTML5: package reports completed or passed; visit-only prohibited for substantive instruction
Module exam: configured pass mark met, normally 80 percent
Final exam: configured pass mark met, normally 80 percent
Form or survey: submitted
File assignment: required artifact submitted
Self-assessment: submitted, normally ungraded
Ebook: all required pages viewed
PDF or external link: optional unless explicitly designated required
Certificate of completion: issued only after all selected required activities and final assessment pass
```

## Packaging rule

The package directory must mirror the actual LearnWorlds course structure. Each learner-facing section folder must contain the nine category folders. Each category folder must contain the exact upload files, learner copy, configuration notes, completion rules, evidence, or controlled not-used rationale.

## Acceptance rule

A course section is not complete because files exist. Completion requires direct authenticated evidence from the actual LearnWorlds Draft course showing that every required activity was created, imported, configured, saved, reopened, and tested. Until then, status is `NOT PROVEN` or `PENDING AUTHENTICATED TEST`.

## Permanent related controls

This standard operates together with:

```text
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
docs/academy-media-pipeline/ACTUAL-SITE-ACTIVITY-INVENTORY-2026-08-12.md
docs/academy-media-pipeline/COURSE-SECTION-ASSESSMENT-STANDARD.md
docs/academy-media-pipeline/COURSE-PACKAGE-FOLDER-SCHEMA.md
config/academy-actual-site-verification-policy.json
config/academy-course-section-assessment-policy.json
config/academy-learnworlds-section-activity-policy.json
```

**No exceptions.**
