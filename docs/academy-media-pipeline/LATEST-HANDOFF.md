# Obserra EPI Academy Public Continuation Notice v13.0.0

Owner and presenter: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Academy: Obserra EPI Academy

Short business name: Obserra EPI

EPI meaning: Executive Protection & Intelligence

Official website: https://www.obserrallc.com

Status: The no-exceptions actual-site verification gate remains mandatory. Every learner-facing section of every current and future course must contain the complete verified LearnWorlds activity-category stack and its own native-template assessment. Course packages must be grouped first by activity category and then by section. Cybersecurity Foundations has an eight-file section-assessment package; authenticated import and runtime acceptance remain pending. Assistant-generated course video remains prohibited. Publication and production release remain blocked.

## Governing records

```text
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
config/academy-actual-site-verification-policy.json
docs/academy-media-pipeline/PER-SECTION-LEARNWORLDS-ACTIVITY-ARCHITECTURE.md
config/academy-per-section-learnworlds-activity-standard.json
docs/academy-media-pipeline/COURSE-SECTION-ASSESSMENT-STANDARD.md
config/academy-course-section-assessment-policy.json
docs/academy-media-pipeline/LEARNWORLDS-ASSESSMENT-NATIVE-TEMPLATE-CORRECTION-2026-08-12.md
```

These requirements are permanent until Dr. Jody Blanchard explicitly changes them. The owner must not be required to repeat them.

## No-exceptions actual-site verification

Before generating any course content or platform-specific artifact:

1. Open the actual current target site and exact target course, section, activity, template, provider object, or source page.
2. Use the authenticated owner/admin interface when account-specific configuration controls the output.
3. Download or export the exact current native template when one exists.
4. Preserve the untouched original and calculate SHA-256.
5. Check current official vendor documentation.
6. Reconcile the documentation with the observed target-site interface and owner-supplied native artifact.
7. Record the URL, UTC timestamp, target context, evidence, template hash, observed constraints, and verification result.
8. Generate only after verification is recorded as PASSED.
9. Recheck immediately before import, upload, publication, or release.

If the actual site or controlling artifact cannot be checked, status is:

```text
BLOCKED - DO NOT GENERATE OR REPRESENT AS UPLOAD-READY
```

## Permanent per-section LearnWorlds activity architecture

Every substantive learner-facing section must include the complete category-level learning stack verified in the actual LearnWorlds interface.

Verified categories:

```text
Multimedia
Ebook
Exams
Self-Assessment
Forms
Certificates
Social
Embed
```

Verified native options include:

```text
Multimedia: Video interactive, PDF, SCORM / HTML5, Presentation, Audio, YouTube, and LTI when configured.
Ebook: Welcome, Course overview, Main content, FAQ, Summary, Course completion.
Exams: Native graded exam using the actual template, Graded SCORM, Text assignment, File assignment, Video assignment, Audio assignment.
Self-Assessment: Assess your knowledge, Write your views / goals / emotions, Upload your work, Record your short video, Record your audio.
Forms: Introduce yourself, Course evaluation short/long, Instructor evaluation short/long, Pre-event feedback and other verified forms.
Certificates: Certificate, Certificate of completion.
Social: Introduce yourself, Think and Share, Ask questions and discuss, Self-Reflection, Assessment discussion, Certification and exam activities.
Embed: Embed, Slideshare, External link.
```

### Required in every substantive section

1. Ebook overview/objectives.
2. Substantive Ebook main content.
3. Ebook FAQ/key terms.
4. Ebook summary/takeaways.
5. Interactive SCORM/HTML5 instruction.
6. PDF learner handout, reference, worked example, or job aid.
7. PPTX presentation and PDF export.
8. Audio-ready narration script and accessible transcript.
9. Interactive-video insertion point labeled `OWNER PRODUCTION REQUIRED`.
10. Approved thumbnail, poster, or section background image.
11. Five-question section knowledge check using the actual native template or validated Graded SCORM.
12. Applied Text assignment or File assignment with rubric.
13. Self-assessment with immediate feedback.
14. Reflection/goals activity.
15. Upload-your-work activity when a learner artifact is produced.
16. Section check-in, confidence, application, or feedback form.
17. Think and Share prompt.
18. Ask questions and discuss prompt.
19. Self-Reflection prompt.
20. Assessment discussion when a graded assessment is used.
21. Verified official external resource or embed.
22. Meaningful completion gate; visit-only completion is prohibited for substantive learning.
23. Accessibility alternatives and direct QA evidence.

Video and audio learner assignments may be added when pedagogically appropriate. The assistant must not create the learner or owner video.

### Course-start lifecycle activities

Every course begins with Welcome, Course overview, official title/identity page, disclosures, acknowledgement, owner welcome, learner introduction/intake, baseline self-assessment, learner goals, and workbook download.

### Course-end lifecycle activities

Every course ends with comprehensive review, final native-template assessment, 80 percent passing, final action plan, course evaluation, final reflection, certification/exam discussion when applicable, certificate or certificate of completion, Course completion, and final accessibility/resource index.

Certificates and Course completion remain course-level lifecycle activities unless the owner later approves a verified module-credential design.

## Every-section assessment requirement

Every learner-facing section of every course must have its own LearnWorlds native-template assessment activity.

For the standard five-module architecture:

```text
Welcome and orientation: 5-question baseline self-assessment
Module 1: 5-question graded knowledge check
Module 2: 5-question graded knowledge check
Module 3: 5-question graded knowledge check
Module 4: 5-question graded knowledge check
Module 5: 5-question graded knowledge check
Final assessment and completion: 25-question cumulative exam
Authoritative resource library: 5-question source-literacy self-assessment
```

Graded section checks and the final exam use an 80 percent pass mark unless the owner explicitly changes it. Administrative-only package folders are excluded because they are not learner-facing sections.

## Native LearnWorlds assessment template

```text
Template: Question Bank Template.xlsx
SHA-256: 23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
Worksheets: Instructions, Examples, Questions
```

Exact `Questions` headings:

```text
Group
Type
Question
CorAns
Answer1
Answer2
Answer3
Answer4
Answer5
Answer6
Answer7
Answer8
Answer9
Answer10
CorrectExplanation
IncorrectExplanation
```

Graded files use `exam_`. Non-graded self-assessments use `selfassessment_`. Native tabs, headings, order, formatting, and plain-text requirements must be preserved. Generated approximations such as `Answer 1` are rejected.

## Current Cybersecurity Foundations section-assessment package

```text
Package: Obserra-EPI-Academy-Cybersecurity-Foundations-LearnWorlds-Section-Assessments-v2.2.0.zip
SHA-256: f80171e10b612d85d3d48d8ba467e529fb1b0677bafc994eccf84021083002c5
Learner-facing sections: 8
Assessment files: 8
Total questions: 60
Welcome baseline: 5
Five module checks: 25 total
Final exam: 25
Resource-library check: 5
Native-template structural validation: PASSED
Clean extraction: PASSED
Authenticated LearnWorlds import: NOT PERFORMED
Runtime acceptance: NOT PROVEN
```

This package is structurally validated only. It is not upload-accepted until the actual Draft course imports, saves, reopens, scores, and persists correctly.

## Mandatory category-first package structure

Every course package must be grouped first by LearnWorlds activity category and then by section:

```text
00_COURSE_ADMINISTRATION
01_EBOOK
02_MULTIMEDIA
03_EXAMS_AND_ASSIGNMENTS
04_SELF_ASSESSMENT
05_FORMS
06_SOCIAL
07_EMBED_AND_EXTERNAL_LINKS
08_CERTIFICATES_AND_COMPLETION
09_OWNER_VIDEO_PRODUCTION_REQUIRED
10_AUTHORITATIVE_RESOURCES
11_ACCESSIBILITY_TRANSCRIPTS_AND_CAPTIONS
12_QA_EVIDENCE_AND_RELEASE
```

Each category folder contains course-opening, every substantive section/module, and course-closing subfolders where applicable. Every mapped activity must have a real artifact, exact title, native activity type, completion rule, accessibility alternative, package-relative path, and verification status.

## Permanent owner-video boundary

```text
Assistant-generated course video: PROHIBITED
Connected-provider course video generation: PROHIBITED
Additional paid video-credit expenditure: PROHIBITED
Avatar, clone, lip-sync, substitute presenter, or synthetic owner media: PROHIBITED
Final video production and approval: Dr. Jody Blanchard
```

The assistant may create complete scripts, teleprompter copy, storyboards, shot lists, on-screen text, caption/transcript specifications, technical standards, and integration instructions. Every video activity remains `OWNER PRODUCTION REQUIRED` until the owner supplies the final media.

## Canonical identity and registered brand

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
www.obserrallc.com

Academy: Obserra EPI Academy
Short business: Obserra EPI
EPI: Executive Protection & Intelligence
```

No alternate title, current or former employer reference, employer logo, employment history, substitute identity, unapproved voice, altered logo, or unapproved brand form is authorized. The owner resume remains internal factual grounding only.

## Current controlled work order

1. Import all eight Cybersecurity Foundations section-assessment workbooks into the matching actual Draft sections.
2. Verify question counts, groups, correct-answer mapping, feedback, pass marks, attempts, remediation, save/reopen persistence, and desktop/mobile learner behavior.
3. Audit every Cybersecurity Foundations section against the complete category-level activity stack.
4. Rebuild the full course package using the mandatory category-first folder architecture and real section artifacts.
5. Reissue activity maps, authoring guides, manifests, validations, versions, and hashes only after actual-site and native-template checks pass.
6. Retrofit Generative AI, LLMs, and High-Risk Employees section by section with the same activity and assessment architecture.
7. Apply the same standard to Executive Travel Risk Management and every subsequent course only after actual-site and primary-source verification passes.
8. Do not generate course video.
9. Update protected and sanitized records after every site check, build, import, discrepancy, failure, package version, and owner decision.

## Release boundary

```text
Actual-site verification before generation: MANDATORY / NO EXCEPTIONS
Complete activity-category stack in every learner-facing section: MANDATORY
Assessment in every learner-facing section: MANDATORY / NO EXCEPTIONS
Cybersecurity section-assessment package: STRUCTURALLY PASSED / IMPORT PENDING
Other courses: FULL SECTION RETROFIT REQUIRED
Assistant-generated video: PROHIBITED
LearnWorlds runtime acceptance: NOT PROVEN
Certificate issuance acceptance: NOT PROVEN
Desktop/mobile learner journey: NOT PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
Production merge/cutover: BLOCKED
```

## Public repository warning

This repository is public. Complete course manuscripts, assessment answers, owner media, provider identifiers, learner data, downloaded school-specific templates, authenticated screenshots, and security evidence remain in protected storage. Public records contain sanitized governance and status evidence only.
