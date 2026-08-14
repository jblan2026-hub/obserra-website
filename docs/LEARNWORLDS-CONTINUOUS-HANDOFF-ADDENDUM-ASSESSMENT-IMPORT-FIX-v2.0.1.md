# LearnWorlds Continuous Handoff Addendum: Assessment Import Fix v2.0.1

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Evidence supplied by owner

The owner supplied a current LearnWorlds Course outline screenshot for `Cybersecurity Foundations for New Professionals`.

The screenshot proves:

1. Five Draft sections are now named correctly:
   - Security and Business Risk
   - Identity, Access, and Authentication
   - Threat Recognition and Safe Response
   - Incident Reporting and Evidence Preservation
   - Secure Habits and Continuous Improvement
2. No learning activity is yet visible inside any section.
3. The required sixth section, `Final Assessment and Completion`, is not yet visible.
4. The owner reported that the exam spreadsheet did not upload.

## Failure 17: Assessment spreadsheet did not upload

**Observed symptom:** The LearnWorlds assessment spreadsheet was rejected or did not create an exam activity.

**Most likely immediate cause:** The spreadsheet was being treated as a normal course-outline file upload rather than being imported from inside an Exam learning activity. LearnWorlds' supported question-import path is:

```text
Create Exam activity
-> Save and Edit
-> Add/Import
-> Import Questions
-> From XLS
```

The Course outline `Upload file` control is not the primary question-import control for an already structured course.

**Secondary compatibility risk:** LearnWorlds requires its exact three-tab XLS/XLSX contract, an unchanged `Questions` tab, unchanged column headings, letter-based question groups, supported question-type codes, and plain text. A workbook that merely resembles the template may be rejected by a strict import validator.

## Correction completed

A corrected package was created:

```text
Obserra-Cybersecurity-Foundations-LearnWorlds-Import-v2.0.1.zip
```

The corrected primary workbook is:

```text
learnworlds-upload/exam_Cybersecurity_Foundations_Final_Assessment-v2.0.1.xlsx
```

It contains:

- tabs named `Instructions`, `Examples`, and `Questions`
- 25 questions
- exact published headers
- letter-based groups
- `TMC` question types
- 1-based correct-answer numbers
- no formulas
- no macros
- no tables
- no merged cells
- no external links
- no auto-filters

A fallback data-only workbook is also included:

```text
admin/LearnWorlds-Questions-Data-Only-v2.0.1.xlsx
```

If the corrected workbook is rejected, the owner must download the current template from the school's LearnWorlds Exam import dialog and copy the 25 rows from the data-only workbook into the official template's `Questions` tab without changing the tab name or headings.

## Correct next action

1. Add a sixth Draft section named `Final Assessment and Completion`.
2. Under that section, click `Add activity`.
3. Select `Exam`.
4. Name it `Cybersecurity Foundations Final Assessment`.
5. Select `Save and Edit`.
6. Inside the Exam editor select `Add/Import` -> `Import Questions` -> `From XLS`.
7. Upload `exam_Cybersecurity_Foundations_Final_Assessment-v2.0.1.xlsx`.
8. Confirm that 25 questions are imported.
9. Set the passing score to 80 percent.
10. Keep the Exam and course in Draft/Sandbox.

## Current acceptance state

```text
Five module sections named: passed
Sixth final-assessment section created: not yet proven
Five SCORM activities uploaded: not yet proven
Original assessment workbook import: failed
Corrected assessment workbook created: passed
Corrected assessment workbook imported: not yet proven
Final assessment question count: blocked until import
Passing score configured: blocked until import
Course completion tested: blocked
Certificate tested: blocked
Production release: blocked
```

## Prevention rule

Do not treat a spreadsheet as a normal course file when its purpose is assessment-question import. Assessment acceptance requires proof that the Exam activity exists, 25 questions are visible, the answer keys are correct, the passing score is 80 percent, completion rules work, and no real learner can purchase an empty or incomplete course.