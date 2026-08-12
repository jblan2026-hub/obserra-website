# Obserra EPI Academy Public Continuous Handoff v13.6.0

The authoritative sanitized operational record is `docs/academy-media-pipeline/LATEST-HANDOFF.md`.

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

No alternate title, employer reference, employment history, substitute identity, unapproved voice, altered logo, or unapproved brand form is authorized in learner-facing content. The owner resume is internal factual grounding only.

## Permanent no-exceptions controls

Before generating any Academy content or platform-specific artifact:

```text
Actual current target site checked: REQUIRED
Authenticated target object checked when account-specific: REQUIRED
Exact current native template/export obtained when applicable: REQUIRED
Untouched original preserved and hashed: REQUIRED
Current official vendor documentation checked: REQUIRED
Current official Obserra site and registered brand checked: REQUIRED
Current official primary-source pages checked: REQUIRED
Generation before verification passes: PROHIBITED
Fallback to memory, old files, generic templates, or assumptions: PROHIBITED
No exceptions: ENFORCED
```

If verification cannot be completed, status is `BLOCKED`.

Governing records:

```text
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
config/academy-actual-site-verification-policy.json
```

## Permanent per-section LearnWorlds architecture

Every learner-facing substantive section of every current and future course must contain the full verified LearnWorlds activity-category stack and its own native-template assessment.

Governing records:

```text
docs/academy-media-pipeline/PER-SECTION-LEARNWORLDS-ACTIVITY-ARCHITECTURE.md
config/academy-per-section-learnworlds-activity-standard.json
docs/academy-media-pipeline/COURSE-SECTION-ASSESSMENT-STANDARD.md
config/academy-course-section-assessment-policy.json
```

Verified activity categories:

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

Each substantive section must contain:

1. Ebook overview/objectives.
2. Substantive Ebook main content.
3. Ebook FAQ/key terms.
4. Ebook summary/takeaways.
5. Interactive SCORM/HTML5 instruction.
6. PDF learner handout, worked example, resource, or job aid.
7. PPTX presentation and PDF export.
8. Audio-ready narration script and accessible transcript.
9. Owner-video insertion point labeled `OWNER PRODUCTION REQUIRED`.
10. Approved thumbnail, poster, or section background image.
11. Five-question native-template knowledge check or validated Graded SCORM.
12. Applied Text assignment or File assignment with rubric.
13. Self-assessment with immediate feedback.
14. Reflection/goals activity.
15. Upload-your-work activity when an artifact is produced.
16. Section check-in or application form.
17. Think and Share prompt.
18. Ask questions and discuss prompt.
19. Self-Reflection prompt.
20. Assessment discussion when graded assessment is used.
21. Verified official external resource or embed.
22. Meaningful completion gate; visit-only completion is prohibited for substantive learning.
23. Accessibility alternatives and QA evidence.

Course opening and closing contain the lifecycle activities defined in the governing architecture. Certificates and Course completion remain course-level unless the owner later approves a verified module-credential design.

## Every-section assessment requirement

For a standard five-module course:

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

Graded checks and final assessments use an 80 percent pass mark unless the owner explicitly changes it. Administrative-only package folders are not learner-facing sections and are excluded.

## Native LearnWorlds template

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

Graded files use `exam_`. Non-graded self-assessments use `selfassessment_`. Native tabs, headings, order, formatting, and plain-text requirements must remain exact.

## Mandatory category-first folder architecture

Every course package must use:

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

Each category contains course-opening, each substantive section/module, and course-closing subfolders where applicable. Every mapped activity must have a real artifact, exact title, native activity type, completion rule, accessibility alternative, package-relative path, and verification status.

## Current Cybersecurity Foundations section-assessment evidence

```text
Package: Obserra-EPI-Academy-Cybersecurity-Foundations-LearnWorlds-Section-Assessments-v2.2.0.zip
SHA-256: f80171e10b612d85d3d48d8ba467e529fb1b0677bafc994eccf84021083002c5
Learner-facing sections: 8
Assessment files: 8
Total questions: 60
Native-template structural validation: PASSED
Clean extraction: PASSED
Authenticated LearnWorlds import: NOT PERFORMED
Runtime acceptance: NOT PROVEN
```

The complete Cybersecurity course still requires section-by-section retrofit against the full category-level activity architecture.

## Permanent owner-video directive

```text
Assistant-generated course video: PROHIBITED
Connected-provider course video generation: PROHIBITED
Additional provider-credit expenditure: PROHIBITED
Final course videos: produced and approved by Dr. Jody Blanchard
```

Every video activity remains `OWNER PRODUCTION REQUIRED` until the owner supplies the final file. The assistant may create scripts, teleprompter copy, storyboards, shot lists, on-screen text, caption/transcript specifications, technical standards, and integration instructions.

## Current controlled work order

1. Import the eight Cybersecurity Foundations section-assessment workbooks into the matching actual Draft sections.
2. Verify question counts, groups, answer mapping, feedback, pass marks, attempts, remediation, save/reopen persistence, and desktop/mobile behavior.
3. Audit and rebuild every Cybersecurity section against the complete category-level activity stack.
4. Reissue the full course package using the mandatory category-first folder architecture.
5. Retrofit Generative AI, LLMs, and High-Risk Employees with the same activity and assessment standard.
6. Apply the standard to Executive Travel Risk Management and every later course only after actual-site and source verification passes.
7. Do not generate course video.
8. Update protected and sanitized handoffs after every site check, build, import, discrepancy, failure, package version, and owner decision.

## Release boundary

```text
Actual-site verification: MANDATORY / NO EXCEPTIONS
Complete activity stack in every learner-facing section: MANDATORY
Assessment in every learner-facing section: MANDATORY / NO EXCEPTIONS
Cybersecurity section-assessment pack: STRUCTURALLY PASSED / IMPORT PENDING
All courses: FULL SECTION RETROFIT REQUIRED
Assistant-generated video: PROHIBITED
LearnWorlds runtime acceptance: NOT PROVEN
Certificate issuance acceptance: NOT PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
Production merge/cutover: BLOCKED
```

## Handoff rule

Every new work session must read the Actual-Site Verification Gate, Per-Section LearnWorlds Activity Architecture, and Course Section Assessment Standard before generating content. Update protected and sanitized records immediately after every site check, build, import result, failure, package change, integrity check, or owner decision.
