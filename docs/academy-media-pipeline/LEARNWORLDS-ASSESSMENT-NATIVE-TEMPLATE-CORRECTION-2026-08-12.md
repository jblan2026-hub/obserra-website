# LearnWorlds Assessment Native-Template Correction

**Date:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Course:** Cybersecurity Foundations for New Professionals  
**Status:** NATIVE TEMPLATE POPULATED; AUTHENTICATED IMPORT TEST PENDING

## Owner-reported failure

Dr. Jody Blanchard reported that the generated final-assessment workbook was not in the actual LearnWorlds upload template. That report is authoritative and supersedes every earlier claim that the generated workbook was LearnWorlds-template compliant or upload-ready.

## Actual target-template evidence

The owner supplied the current native LearnWorlds `Question Bank Template.xlsx` from the actual school workflow. Two preserved copies were byte-identical.

```text
Native template filename: Question Bank Template.xlsx
Second preserved copy: Question Bank Template(1).xlsx
Native template SHA-256: 23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
Native template size: 19,019 bytes
```

The actual native template contains these exact worksheets in this exact order:

```text
Instructions
Examples
Questions
```

The actual `Questions` worksheet contains these exact required column headings:

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

The absence of spaces in `Answer1` through `Answer10` is material. The official template instructions also state that the `Questions` tab and column names must not be changed.

## Drift identified in the rejected generated workbook

The rejected generated workbook was not a populated copy of the actual native template. It recreated a simplified workbook and used headings including:

```text
Answer 1
Answer 2
...
Answer 10
```

It also replaced the native formatted `Instructions` and `Examples` worksheets with simplified generated content. Similarity of general structure did not establish native-template compliance.

## Corrected workbook

A corrected workbook was created by opening a copy of the untouched native template and populating only the `Questions` worksheet with the existing 25 approved draft questions.

```text
Corrected file: exam_Cybersecurity_Foundations_Final_Assessment-v2.1.0.xlsx
Corrected file SHA-256: d3cff502e819cc3e5c4c0fd99fc7a9f0700fb0c179f791e5bee7dc17ffd0aada
Question count: 25
Question groups: 5
Question type: TMC, 25 questions
Native Instructions worksheet preserved: yes
Native Examples worksheet preserved: yes
Exact Questions worksheet name preserved: yes
Exact native column headings preserved: yes
Filename begins with exam_: yes
Plain-text question data: yes
```

The corrected workbook passed local structural validation against the owner-supplied native template. Each `CorAns` value resolves to an existing answer field.

## Current acceptance boundary

```text
Native-template structural match: PASSED
Question population validation: PASSED
File hash and integrity record: PASSED
Authenticated LearnWorlds import: NOT PERFORMED
Actual question count after import: NOT PROVEN
Assessment scoring in LearnWorlds: NOT PROVEN
80 percent pass rule in LearnWorlds: NOT PROVEN
Save/persistence result: NOT PROVEN
Upload-ready or runtime-accepted claim: PROHIBITED UNTIL TEST IMPORT PASSES
```

The next controlled action is to import the corrected workbook into the actual Cybersecurity Foundations Draft assessment, record the platform result, verify 25 imported questions and five groups, configure the 80 percent passing score, save, reopen, and verify persistence.

## Permanent prevention control

No platform-specific import artifact may be generated from memory, a generic schema, a prior generated file, or a visual approximation.

Before generating any LearnWorlds import file:

1. Open the actual current target school and exact activity.
2. Download the native template from that activity.
3. Preserve the untouched original and calculate SHA-256.
4. Check the current official LearnWorlds documentation.
5. Populate only a copy of the native template.
6. Preserve exact tabs, headings, order, filename rules, and data constraints.
7. Test-import in the Draft activity.
8. Record direct evidence before claiming compatibility or readiness.

This correction is governed by:

```text
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
config/academy-actual-site-verification-policy.json
```
