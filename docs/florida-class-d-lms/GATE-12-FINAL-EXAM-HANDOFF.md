# Florida Class D Gate 12 Handoff — Protected Final Examination Engine

## Scope

This handoff governs the regulated Florida Class D final-examination subsystem for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It remains separate from the commercial Academy Course 1-N / LearnWorlds workstream.

Public state remains `COMING SOON · LMS IN PROGRESS`. The owner reports an active Class DI instructor license and a pending Class DS school/training facility application. Examination delivery remains fail closed until the applicable licensing, Division-approval, production-database, and release gates are satisfied.

## Regulatory controls represented in source

- The security-officer curriculum remains 40 instructional hours.
- Examination time is separate from the 40 instructional hours and is not less than two hours.
- The controlled examination contains exactly 170 questions.
- Passing score is 128 correct answers.
- No more than 50 percent of the questions in any subject area may be true/false.
- Online test questions are randomized.
- The active examination bank must be explicitly marked `division_approved` and carry a Division approval reference before the student start transaction can succeed.
- Successful completion is not represented as state licensure and remains subject to the controlled completion/LIAS workflow.

Primary reference: Rule 5N-1.140(1)(b)-(d), (1)(f)12-13, F.A.C., effective November 28, 2024.

## Implemented architecture

Primary artifacts:

- `supabase/migrations/20260813060000_fdacs_class_d_final_exam.sql`
- `lib/florida-class-d-exam.ts`
- `app/api/florida-class-d/exam/route.ts`
- `app/florida-security-training/exam/page.tsx`
- `app/florida-security-training/exam/FloridaClassDExam.tsx`
- `app/florida-security-training/exam/exam.css`
- `scripts/florida-class-d-exam-gate.mjs`

Controls implemented in source:

1. Dedicated examination-bank and question tables isolated from the learner browser.
2. Separate bank lifecycle states: draft, Division submitted, Division approved, retired.
3. Exactly 170 active questions required before the bank can be used.
4. Database validation rejects any subject area in which true/false questions exceed 50 percent.
5. Start transaction refuses access unless 40 instructional hours are verified and a Division-approved bank is active.
6. Attempt question order is randomized and persisted per learner attempt.
7. One active attempt per enrollment.
8. Browser/session identity is recorded on the attempt.
9. Earliest submission time is two hours after attempt start.
10. Answers are stored separately from the question bank.
11. Correct answers and scoring logic are never returned in the student question payload.
12. Submission scoring occurs on the protected database boundary using the fixed 128/170 passing threshold.
13. Attempt start and final submission create regulated audit events.
14. Student interface displays question number, elapsed time, earliest submit timer, controlled navigation, and a final confirmation before submission.
15. Examination feature remains independently fail closed behind `OBSERRA_FDACS_CLASS_D_EXAM_ENABLED`, active DS status, and protected DI/DS configuration.

## Examination-content boundary

The Git repository must not be treated as the production answer-key store. The current migration defines the secure database structure only. The Division-approved final examination bank must be imported into the protected production datastore under a controlled administrative process after approval. Production question prompts, answer choices, answer keys, and rationales must not be exposed through public GitHub source, public browser APIs, client bundles, logs, or analytics.

The examination submitted to FDACS for Class DS review remains the authoritative content candidate until the Division accepts or approves it. Any Division-required revision must create a new versioned bank rather than silently altering a bank already used by students.

## Remaining Gate 12 work before production promotion

- Build the protected school-admin examination-bank import and validation workflow.
- Add cryptographic content hash/version evidence for each imported approved bank.
- Add single-device and active-presence examination monitoring aligned with the existing regulated live/session controls.
- Add examination interruption/resume policy with audit evidence and fail-closed invalidation conditions.
- Add instructor/compliance review views that expose scores and attempt evidence without exposing answer keys unnecessarily.
- Add retest/remediation workflow using only the approved school policy and current Division requirements.
- Add printable/reproducible examination record output for the student course file, consistent with Rule 5N-1.140 retention requirements.
- Connect passing outcome to the later completion/LIAS gate only after all other course requirements are verified.

## Production boundary

No source implementation, CI result, or internal test constitutes FDACS approval. Paid enrollment, regulated course launch, final-examination delivery, completion issuance, or LIAS execution must remain disabled until the Class DS license and all applicable regulatory and production gates are satisfied.
