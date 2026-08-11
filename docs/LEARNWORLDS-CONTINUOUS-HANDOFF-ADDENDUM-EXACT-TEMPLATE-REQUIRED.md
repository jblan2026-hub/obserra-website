# LearnWorlds Continuous Handoff Addendum: Exact Assessment Template Required

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner report

The owner confirmed that the LearnWorlds-generated assessment import template was downloaded and uploaded for correction after multiple reconstructed assessment workbooks were rejected by LearnWorlds.

## Current evidence and limitation

The current chat runtime exposes the screenshot of the failed import, but the actual LearnWorlds `.xls` or `.xlsx` template is not present in the mounted working directory. Therefore, no truthful claim can be made that the school-generated workbook has been inspected or populated yet.

## Failure 18: Reconstructed workbook did not satisfy the school-specific import contract

**Evidence:** Multiple generated workbooks with the documented tabs and columns were rejected by the LearnWorlds assessment importer.

**Likely cause:** LearnWorlds expects the exact workbook downloaded from the school's assessment import dialog, including its sheet structure, headers, workbook metadata, formatting, and any hidden validation or compatibility elements. Recreating a visually similar workbook is insufficient evidence of compatibility.

**Correction:** Use the exact school-generated template as the immutable base. Populate only the approved question data cells in the `Questions` worksheet. Preserve all worksheet names, header values, column order, formatting, hidden sheets, workbook names, validation rules, and metadata.

## Required automated transformation

When the exact template file is accessible, the transformation must:

1. Load the original workbook without changing its structure.
2. Verify the required `Questions` worksheet and its exact header row.
3. Clear only existing sample question rows beneath the header.
4. Insert the 25 approved Cybersecurity Foundations final-assessment questions.
5. Store `CorAns` values in the data type expected by the template.
6. Preserve all workbook styles, validations, hidden content, defined names, and calculation settings.
7. Save a new file named `exam_Cybersecurity_Foundations_Final_Assessment_LEARNWORLDS.xlsx` or preserve `.xls` if the supplied template uses the legacy format.
8. Validate the ZIP/OpenXML package, sheet names, headers, row count, question types, answer counts, correct-answer references, formulas, external links, and macros.
9. Record the output SHA-256 and update this handoff.

## Operational boundary

Do not attempt another LearnWorlds import using a reconstructed spreadsheet. The next import must use a populated copy of the exact template downloaded from the owner's LearnWorlds school.

## Current acceptance state

```text
Five module sections named: passed
Exact LearnWorlds assessment template downloaded by owner: owner-reported
Exact template accessible to ChatGPT runtime: not yet proven
Template populated with 25 questions: blocked
Assessment import: failed
Passing score configuration: blocked
Course completion test: blocked
Certificate test: blocked
Production release: blocked
```

## Prevention rule

For vendor-controlled spreadsheet imports, preserve and modify the vendor-generated template rather than recreating it from documentation. A workbook is accepted only after the authoritative platform successfully imports it and the expected records appear.