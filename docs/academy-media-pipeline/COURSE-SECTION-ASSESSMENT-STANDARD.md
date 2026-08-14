# Obserra EPI Academy Course Section Assessment Standard

**Effective:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Sole approved title:** Founder and CEO  
**Status:** MANDATORY FOR EVERY COURSE

## Governing requirement

Every learner-facing section of every Obserra EPI Academy course must contain its own assessment activity using the exact current native LearnWorlds question-import template downloaded from the actual target school.

This requirement applies to every current and future course. It is not limited to Cybersecurity Foundations.

Administrative-only package folders are not learner-facing course sections and do not require an assessment activity.

## Required course pattern

Every course must include, at minimum:

1. **Welcome and orientation section** - a non-graded baseline diagnostic using the LearnWorlds self-assessment filename convention.
2. **Each substantive instructional module section** - a graded knowledge check using the LearnWorlds exam filename convention.
3. **Final assessment and completion section** - a cumulative graded final assessment.
4. **Authoritative resource-library section** - a non-graded source-literacy and resource-use assessment.

For the standard five-module course architecture, this produces eight assessment activities:

```text
1. Welcome baseline diagnostic
2. Module 1 knowledge check
3. Module 2 knowledge check
4. Module 3 knowledge check
5. Module 4 knowledge check
6. Module 5 knowledge check
7. Final cumulative assessment
8. Authoritative resource-library check
```

Courses with more or fewer instructional modules must still include one assessment for every learner-facing section.

## Minimum assessment depth

```text
Welcome baseline diagnostic: minimum 5 questions
Each instructional section/module: minimum 5 questions
Final cumulative assessment: minimum 25 questions
Authoritative resource-library check: minimum 5 questions
Standard passing score for graded checks: 80 percent
Standard passing score for final assessment: 80 percent
```

A different question count or passing standard requires explicit owner approval and must be documented in the course handoff.

## Native-template controls

Every assessment import must:

1. Be created only after the actual current target LearnWorlds school and activity type are checked.
2. Use a copy of the exact native template downloaded from the actual target assessment workflow.
3. Preserve the untouched original template and its SHA-256.
4. Preserve the exact worksheet order: `Instructions`, `Examples`, `Questions`.
5. Preserve the exact `Questions` headings:

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

6. Use `exam_` for graded exam files and `selfassessment_` for non-graded self-assessment files.
7. Use text group names rather than numeric-only group names.
8. Use plain text in the import columns.
9. Include correct-answer and incorrect-answer feedback where supported.
10. Be test-imported into the actual Draft course before any upload-ready claim.

## Instructional-quality controls

Each section assessment must:

- map directly to the learning objectives of that section;
- test decisions, judgment, application, and safe action rather than trivia alone;
- use plausible distractors;
- avoid unsupported claims, trick wording, and ambiguous correct answers;
- provide useful corrective feedback;
- use current official primary sources for source-based questions;
- remain distinct from the teaching content and not become the sole instructional activity;
- support remediation and a clear next action after an incorrect response.

Question types may include `TMC`, `TMCMA`, `TTF`, `TD`, and `TST` where pedagogically appropriate and supported by the actual current template.

## LearnWorlds runtime acceptance

Structural validation of an XLS/XLSX file is not runtime acceptance.

Before an assessment is classified as ready:

1. Import it into the actual Draft activity.
2. Record the imported question count and groups.
3. Confirm correct-answer mapping and feedback.
4. Configure the pass mark and attempt/remediation settings.
5. Save, reopen, and verify persistence.
6. Preview the learner experience on desktop and mobile.
7. Record every warning, failure, correction, and final result.

Use `NOT PROVEN`, `PENDING`, `BLOCKED`, or `FAILED` until direct evidence exists.

## Current Cybersecurity Foundations implementation

The current section-assessment package is:

```text
Package: Obserra-EPI-Academy-Cybersecurity-Foundations-LearnWorlds-Section-Assessments-v2.2.0.zip
SHA-256: f80171e10b612d85d3d48d8ba467e529fb1b0677bafc994eccf84021083002c5
Learner-facing sections: 8
Assessment files: 8
Total questions: 60
Native-template structural validation: PASSED
Authenticated LearnWorlds import: NOT PERFORMED
Runtime acceptance: NOT PROVEN
```

The package includes a welcome baseline diagnostic, five module knowledge checks, the 25-question final assessment, and an authoritative resource-library check.

## Permanent handoff rule

Every future course handoff, activity map, package manifest, QA checklist, and release record must include section-by-section assessment evidence. A course is incomplete when any learner-facing section lacks its required native-template assessment activity.
