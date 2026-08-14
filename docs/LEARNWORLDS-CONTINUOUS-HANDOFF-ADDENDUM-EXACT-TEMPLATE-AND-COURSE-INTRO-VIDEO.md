# LearnWorlds Continuous Handoff Addendum: Exact Exam Template Completed and Personalized Course Intro Video Requirement

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Exact LearnWorlds assessment template supplied

The owner uploaded the exact workbook downloaded from the LearnWorlds assessment-import dialog:

```text
Question Bank Template.xlsx
```

The workbook contains the authoritative LearnWorlds Version 2.0 structure with these worksheets:

```text
Instructions
Examples
Questions
```

## Transformation completed

The exact vendor workbook was used as the immutable base. The transformation changed only the sample question rows in the `Questions` worksheet and preserved the vendor guidance sheets, worksheet names, header values, styles, workbook package structure, shared-string model, and original ZIP-entry metadata where practical.

Output file:

```text
exam_Cybersecurity_Foundations_Final_Assessment_LEARNWORLDS.xlsx
```

Validation result:

```text
Passed: true
Question count: 25
Question type: TMC
Answers per question: 4
CorAns stored as text: true
Questions header preserved: true
Instructions worksheet preserved: true
Examples worksheet preserved: true
Formulas present: false
Macros present: false
Findings: 0
```

Template SHA-256:

```text
23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
```

Output SHA-256:

```text
1dcfbd4757a32010f9eb70fe17db4331eaa094d6729c39e5fbbf5851a859d9af
```

Delivery bundle SHA-256:

```text
69bb3527834d747eef25ca4ecaa79bf0f73e068d10092aef1294ea34a736c677
```

## Required LearnWorlds import action

Inside the existing Exam activity, use:

```text
Import questions
-> From Excel
-> select exam_Cybersecurity_Foundations_Final_Assessment_LEARNWORLDS.xlsx
-> Import
```

Do not upload the workbook through the course-outline generic file uploader. After import, verify that exactly 25 questions appear, configure the passing score at 80 percent, retain Draft/Sandbox status, and capture the result for the handoff.

## Personalized expert-access course introduction requirement

The owner requested a realistic talking-head introduction at the beginning of every course using the owner's authorized likeness and voice. The business objective is to make learners feel that they receive direct, personalized access to Dr. Jody Blanchard as the cybersecurity expert guiding the course, while clearly maintaining the integrity of the instructional product.

The video should not feel like a generic platform greeting. Each introduction should communicate:

1. A direct personal welcome from Dr. Blanchard.
2. Why the specific course matters to the learner's role and decision responsibilities.
3. How to approach the course for maximum practical value.
4. Two or three concise success principles drawn from the owner's cybersecurity leadership experience.
5. A reminder to apply the course material through the scenarios, workbook, knowledge checks, and final assessment.
6. A clear transition into Module 1.

### Standard production contract

- Duration: 60-90 seconds.
- Visual: approved realistic executive digital avatar using the owner's likeness.
- Voice: approved clone or provider-generated voice based only on the owner's consented sample.
- Framing: professional head-and-shoulders presentation, direct eye contact, restrained gestures, premium Obserra background.
- Script: course-specific, factual, owner-approved, and free of unsupported claims.
- Accessibility: burned-in or selectable captions plus a transcript.
- Disclosure: appropriate notice that the introduction was produced using the owner's authorized AI likeness and voice.
- Placement: first LearnWorlds activity before Module 1.
- File outputs: MP4, SRT or VTT captions, transcript, script, approval record, rights record, and SHA-256.
- Governance: no publication until the owner reviews the rendered likeness, voice, pacing, pronunciation, and script.

### Governed production approach

1. Use a commercial consent-based avatar-video service rather than another local worker stack.
2. The owner supplies a high-quality headshot or records a consent/avatar calibration video, depending on the selected provider's requirements.
3. The owner supplies a clean voice sample or records provider-required consent audio.
4. Create one reusable approved executive avatar and one approved voice clone.
5. Create a reusable master intro template and generate a course-specific version for each approved course.
6. Add captions and transcript to every video.
7. Store source scripts, approvals, video hashes, caption files, usage rights, and replacement history in the audit record.
8. Upload the resulting MP4 as the first learning activity in each LearnWorlds course.
9. Require owner review before publishing each course intro.

### Security and rights controls

- Use only owner-authorized photos, recordings, and voice samples.
- Do not upload passwords, API secrets, or private identity documents into chat.
- Do not create or use a digital likeness of any other person without their explicit authorization.
- Keep avatar and voice provider accounts under the owner's business-controlled email.
- Enable multifactor authentication and retain revocation/deletion procedures.
- Prohibit unauthorized reuse of the avatar or voice for sales, endorsements, political content, or statements outside approved scripts.
- Maintain a kill switch: the provider avatar, voice model, and course videos must be revocable or removable on owner direction.

## Current status

```text
Exact LearnWorlds template received: passed
Exact template populated: passed
Workbook validation: passed
Workbook imported into LearnWorlds: not yet proven
25 questions visible in LearnWorlds: not yet proven
Passing score configured: blocked until import
Personalized expert-access objective: approved by owner
Talking-avatar provider selected: pending
Owner headshot or calibration video received: pending
Owner voice sample received: pending
Master course-introduction script approved: pending
First course-specific introduction MP4 generated: pending
Intro uploaded to LearnWorlds: pending
Production release: blocked
```

## Prevention rule

Vendor spreadsheet imports must use the vendor-generated workbook as the immutable base. Digital-likeness video production must use explicit owner authorization, business-controlled provider accounts, approved scripts, disclosure, captions, audit evidence, and owner review before publication.