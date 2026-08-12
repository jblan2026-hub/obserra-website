# Obserra EPI Academy Per-Section LearnWorlds Activity Architecture

**Effective:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Sole approved title:** Founder and CEO  
**Status:** MANDATORY - PERMANENT UNTIL OWNER CHANGES IT  
**Actual-site verification:** REQUIRED BEFORE GENERATION - NO EXCEPTIONS

## Owner directive

Every substantive section of every Obserra EPI Academy course must be designed as a complete LearnWorlds learning experience rather than a single file, isolated lesson, empty shell, or minimal placeholder.

Each section must use the actual current LearnWorlds activity options observed in the authenticated Obserra EPI school and must include the full category-complete activity stack defined below. Course-start and course-end lifecycle activities are added at the appropriate course boundary, while the instructional category stack repeats in every substantive section.

No section may be described as complete until each required activity has a real title, purpose, content artifact, completion rule, accessibility alternative, and package-relative file mapping.

## Actual LearnWorlds activity categories verified by owner screenshots

The owner supplied current screenshots of the actual LearnWorlds `Add learning activity` interface. The verified categories and native options are:

### Multimedia

- Video (interactive)
- PDF
- SCORM / HTML5 package
- LTI, when separately configured
- Presentation
- Audio
- YouTube

### Ebook

- Welcome
- Course overview
- Main content
- FAQ
- Summary
- Course completion

### Exams

- Native graded exam or imported question assessment using the actual downloaded template
- Graded SCORM
- Text assignment
- File assignment
- Video assignment
- Audio assignment

### Self-Assessment

- Assess your knowledge
- Write your views / goals / emotions
- Upload your work
- Record your short video
- Record your audio

### Forms

- Introduce yourself
- Course evaluation, short
- Course evaluation, long
- Instructor evaluation, short
- Instructor evaluation, long
- Pre-event feedback form and other current native forms when applicable

### Certificates

- Certificate
- Certificate of completion

### Social

- Introduce yourself
- Think and Share
- Ask questions and discuss
- Self-Reflection
- Assessment discussion
- Certification and exam activities

### Embed

- Embed
- Slideshare
- External link

## Required activity stack for every substantive section

Every module or substantive section must contain the following minimum stack. A course may add more activities, but it may not remove a category without an owner-approved documented exception based on the actual current platform.

### 1. Ebook activity set

Each section must include:

1. `Section Overview and Objectives` using Course overview or Main content.
2. `Section Main Content` with substantive instruction, examples, decisions, and application.
3. `Section FAQ and Key Terms` using FAQ.
4. `Section Summary and Takeaways` using Summary.

The written instruction must remain usable without video and must include all material required to meet the section objectives.

### 2. Multimedia activity set

Each section must include:

1. One interactive SCORM / HTML5 instructional activity.
2. One PDF learner handout, reference guide, job aid, or worked example.
3. One presentation deck in PPTX and PDF form.
4. One audio-ready narration script and transcript; an owner-supplied audio file may be added later.
5. One interactive-video insertion point labeled `OWNER PRODUCTION REQUIRED` until Dr. Jody Blanchard supplies the final media.
6. One approved thumbnail, poster, or section background image.

YouTube, external video, or third-party embeds are optional and may be used only after direct source verification and owner approval. LTI is prohibited until the actual integration is configured and validated.

### 3. Exam and applied-assessment set

Each section must include:

1. One five-question module knowledge check using the actual current LearnWorlds native assessment template or a validated Graded SCORM activity.
2. One applied assignment selected from Text assignment or File assignment.
3. Video assignment and Audio assignment specifications when the learning objective requires a learner-recorded response; the assistant must not create the learner or owner video.
4. Correct answer rationale, incorrect answer rationale, scoring, feedback, retry, and completion rules.

Every native assessment import must be populated inside a copy of the actual current downloaded LearnWorlds template. Generic or recreated schemas are prohibited.

### 4. Self-assessment set

Each section must include:

1. `Assess Your Knowledge` with immediate feedback and no score when appropriate.
2. `Section Reflection and Goals` using Write your views / goals / emotions.
3. `Upload Your Work` when the section produces a worksheet, decision record, risk analysis, or action plan.
4. Record-your-video or record-your-audio learner activities only when pedagogically appropriate and clearly marked as learner-generated submissions.

### 5. Forms set

Each section must include at least one short check-in, confidence, application, or feedback form tied to the section objective.

The course opening must include an Introduce yourself or learner-intake form. The course ending must include a Course evaluation form. Instructor evaluation may be enabled when the course delivery model requires it.

### 6. Social-learning set

Each section must include:

1. One Think and Share prompt.
2. One Ask questions and discuss space or prompt.
3. One Self-Reflection prompt.
4. One Assessment discussion activity when a graded assessment is used.

Certification and exam activities are used only where certification or exam preparation is explicitly part of the course purpose.

### 7. Embed and external-source set

Each section must include at least one verified official external resource or embed using Embed or External link. Slideshare is optional and must be verified before use.

Every external source must be current, authoritative, directly relevant, and recorded in the source register with URL, publisher, title, revision/date, verification date, applicability, and supersession status.

### 8. Section completion set

Each section must include a documented completion gate based on meaningful learner action. Visit-only completion is prohibited for substantive instruction.

Examples include:

- SCORM completion or pass status;
- knowledge-check pass mark;
- assignment submission;
- form submission;
- required reflection or action plan;
- verified viewing threshold for owner-supplied video;
- completion of selected required activities.

## Course-start lifecycle activities

Every course must begin with:

1. Welcome Ebook activity.
2. Course overview Ebook activity.
3. Official title and identity page.
4. Learner disclosures and acknowledgement.
5. Dr. Jody Blanchard owner-welcome activity marked `OWNER PRODUCTION REQUIRED` until the owner supplies it.
6. Accessible written transcript and introduction script.
7. Introduce yourself form or social activity.
8. Baseline self-assessment.
9. Learner goals form or reflection.
10. Learner workbook download.

## Course-end lifecycle activities

Every course must end with:

1. Comprehensive review and final summary.
2. Final graded assessment using the actual current native LearnWorlds template.
3. Eighty-percent minimum passing score unless the owner changes it.
4. Final applied action plan or assignment.
5. Course evaluation form.
6. Final self-reflection.
7. Certification and exam discussion area when applicable.
8. Certificate or certificate of completion configured according to the actual platform semantics.
9. Course completion Ebook activity.
10. Final accessibility and resource index.

Certificates and Course completion are course-level lifecycle activities and are not duplicated inside every module unless LearnWorlds later supports a verified owner-approved module credential design.

## Mandatory folder architecture for every course package

Course packages must be grouped first by the actual LearnWorlds activity category and then by course section.

```text
00_COURSE_ADMINISTRATION/
  Course_Description_and_Metadata/
  LearnWorlds_Implementation_Guide/
  Activity_Map_and_Completion_Rules/
  Native_Templates_Preserved/
  Manifest_Hashes_and_Validation/

01_EBOOK/
  00_COURSE_OPENING/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_COURSE_COMPLETION/

02_MULTIMEDIA/
  00_COURSE_OPENING/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_COURSE_CLOSE/

03_EXAMS_AND_ASSIGNMENTS/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_FINAL_ASSESSMENT/

04_SELF_ASSESSMENT/
  00_BASELINE/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_FINAL_REFLECTION/

05_FORMS/
  00_LEARNER_INTAKE/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_COURSE_EVALUATION/

06_SOCIAL/
  00_INTRODUCE_YOURSELF/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_ASSESSMENT_AND_COMPLETION_DISCUSSION/

07_EMBED_AND_EXTERNAL_LINKS/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/

08_CERTIFICATES_AND_COMPLETION/
  Certificate_Configuration/
  Certificate_of_Completion_Configuration/
  Completion_Page/
  Runtime_Acceptance_Evidence/

09_OWNER_VIDEO_PRODUCTION_REQUIRED/
  00_OWNER_WELCOME/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_COURSE_CLOSE/

10_AUTHORITATIVE_RESOURCES/
  Coursewide_Source_Register/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/

11_ACCESSIBILITY_TRANSCRIPTS_AND_CAPTIONS/
  00_COURSE_OPENING/
  01_SECTION_01/
  02_SECTION_02/
  03_SECTION_03/
  04_SECTION_04/
  05_SECTION_05/
  90_COURSE_CLOSE/

12_QA_EVIDENCE_AND_RELEASE/
  Actual_Site_Verification/
  Native_Template_Hashes/
  SCORM_Validation/
  Document_Rendering/
  Spreadsheet_Validation/
  Desktop_Mobile_Acceptance/
  LearnWorlds_Runtime_Evidence/
  Owner_Approval/
```

## Required contents of every section folder

Each section folder must contain the actual files required for the corresponding activity. At minimum, the section-level material set includes:

- section overview and learning objectives;
- substantive main-content manuscript;
- FAQ and glossary;
- summary and takeaways;
- SCORM/HTML5 package;
- PDF learner handout or job aid;
- PPTX and PDF presentation;
- owner video teleprompter script;
- storyboard and shot list;
- on-screen text and lower-third plan;
- caption and transcript template;
- module knowledge-check import file derived from the native template;
- applied assignment prompt and rubric;
- self-assessment prompt;
- form questions;
- social discussion prompts;
- verified external resource links;
- completion rule;
- accessibility requirements;
- QA and evidence checklist.

## No-video-generation rule

The assistant and connected providers must not generate any course video, synthetic owner media, avatar output, voice clone, lip-sync, substitute presenter, or paid video render.

The assistant may create complete video-production support materials. Every video file location remains `OWNER PRODUCTION REQUIRED` until Dr. Jody Blanchard supplies and approves the final file.

## Acceptance boundary

A course section is not complete merely because files exist. Completion requires direct evidence that:

1. The actual current LearnWorlds activity options and templates were checked.
2. Every required category has a mapped activity.
3. Every mapped activity has a real artifact and completion rule.
4. Native-template imports pass in the actual Draft course.
5. SCORM launches, retains state, and reports completion or score correctly.
6. Forms and assignments save and reopen correctly.
7. Accessibility alternatives are available.
8. Desktop and mobile behavior pass.
9. The owner approves the learner experience.

Use `NOT PROVEN`, `PENDING`, `BLOCKED`, `FAILED`, or `OWNER PRODUCTION REQUIRED` whenever direct evidence is absent.

## Restart rule

Every future session must read this standard, the Actual-Site Verification Gate, the current handoff, and the current native-template evidence before generating course materials.

The section-level category-complete architecture is permanent and must not require the owner to restate it.
