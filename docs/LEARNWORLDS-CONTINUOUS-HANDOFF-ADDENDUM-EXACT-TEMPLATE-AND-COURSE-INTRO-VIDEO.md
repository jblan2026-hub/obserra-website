# LearnWorlds Continuous Handoff Addendum: Exact Exam Template Completed and Course Intro Video Requirement

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

The exact vendor workbook was used as the immutable base. The transformation changed only the sample question rows in the `Questions` worksheet and preserved the vendor guidance sheets, worksheet names, header values, styles, workbook package structure, and original file metadata where practical.

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
Questions header preserved: true
Instructions worksheet preserved: true
Examples worksheet preserved: true
Findings: 0
```

Template SHA-256:

```text
23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
```

Output SHA-256:

```text
35a4d3f3f328795dbdffbf25317b06e5a8bcbd51b9979eaf0c0c3c478379851c
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

## Course introduction video requirement

The owner requested a realistic talking-head introduction at the beginning of each course using the owner's likeness and voice. The intended result is an approved digital avatar that appears to speak an original course-specific welcome and cybersecurity-success guidance.

### Governed production approach

1. Use a commercial consent-based avatar-video service rather than another local worker stack.
2. The owner supplies a high-quality headshot or records a consent/avatar calibration video, depending on the selected provider's requirements.
3. The owner supplies a clean voice sample or records provider-required consent audio.
4. Create one reusable approved executive avatar and one approved voice clone.
5. Generate a 45-90 second course-specific introduction for each course from a governed script.
6. Add captions and transcript to every video.
7. Display an appropriate disclosure that the introduction is AI-generated using the owner's authorized digital likeness and voice.
8. Store source scripts, approvals, video hashes, caption files, usage rights, and replacement history in the audit record.
9. Upload the resulting MP4 as the first learning activity in each LearnWorlds course.
10. Require owner review before publishing each course intro.

### Security and rights controls

- Use only owner-authorized photos, recordings, and voice samples.
- Do not upload passwords, API secrets, or private identity documents into chat.
- Do not create or use a digital likeness of any other person without their explicit authorization.
- Keep avatar and voice provider accounts under the owner's business-controlled email.
- Enable multifactor authentication and retain revocation/deletion procedures.
- Prohibit unauthorized reuse of the avatar or voice for sales, endorsements, political content, or statements outside approved scripts.

## Current status

```text
Exact LearnWorlds template received: passed
Exact template populated: passed
Workbook validation: passed
Workbook imported into LearnWorlds: not yet proven
25 questions visible in LearnWorlds: not yet proven
Passing score configured: blocked until import
Talking-avatar provider selected: pending
Owner headshot or calibration video received: pending
Owner voice sample received: pending
Course introduction script approved: pending
First course introduction MP4 generated: pending
Intro uploaded to LearnWorlds: pending
Production release: blocked
```

## Prevention rule

Vendor spreadsheet imports must use the vendor-generated workbook as the immutable base. Digital-likeness video production must use explicit owner authorization, business-controlled provider accounts, approved scripts, disclosure, captions, audit evidence, and owner review before publication.