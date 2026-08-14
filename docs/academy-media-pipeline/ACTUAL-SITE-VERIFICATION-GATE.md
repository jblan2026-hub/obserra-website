# Obserra EPI Academy Actual-Site Verification Gate

**Effective:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Sole approved title:** Founder and CEO  
**Status:** MANDATORY - NO EXCEPTIONS

## Governing rule

Before generating any Academy content, upload artifact, platform template, SCORM package, assessment file, course description, metadata, certificate configuration, resource list, script, workbook, or implementation instruction, the actual applicable site and target object must be checked.

No prior conversation, model memory, old screenshot, generic template, earlier package, file name, mockup, or similar-platform assumption may substitute for checking the current actual site.

If the actual site, authenticated target object, exact current template, or current official documentation cannot be checked, work is `BLOCKED`. The artifact must not be generated or described as upload-ready.

## Required verification sequence

1. Identify the exact target site, platform, school, course, page, activity, template, or provider object.
2. Open the actual current target site. Use the authenticated owner/admin interface when the task depends on account-specific configuration.
3. Capture direct evidence: screenshot, export, downloaded template, field list, activity settings, or exact page structure.
4. Record the target URL, UTC timestamp, platform context, object name or ID, evidence reference, and observed constraints.
5. Download the exact current native template or export when the output depends on a platform schema.
6. Preserve the downloaded original unchanged and calculate its SHA-256.
7. Check the current official vendor documentation for the same feature.
8. Reconcile the official documentation with the actual target-site interface and owner-supplied native artifact. The actual current target object controls when they differ.
9. Check the official Obserra site and registered brand assets for naming, positioning, identity, legal-company wording, website, logo, and colors.
10. Check current official publisher pages for every authoritative source used.
11. Generate content only after the verification status is recorded as `PASSED`.
12. Recheck the actual site immediately before import, upload, publication, or release.

## LearnWorlds-specific mandatory controls

For every LearnWorlds course, section, activity, assessment, certificate, course card, page, completion rule, or bulk-upload artifact:

1. Open the actual Obserra EPI LearnWorlds school and the exact target course or page.
2. Inspect the current activity options and the exact target activity type.
3. Download the current native template from the actual target activity when LearnWorlds provides one.
4. Preserve the original template without modification and record its SHA-256.
5. Populate only a copy of that exact template.
6. Do not rename worksheets, tabs, columns, fields, or headers.
7. Do not reorder, add, delete, merge, restyle, or otherwise alter required template structure unless the actual current template explicitly permits it.
8. Use plain text where LearnWorlds requires plain text.
9. Use the exact filename convention required by the current LearnWorlds interface.
10. Test the file in the existing Draft course.
11. Record successful import, question count, activity type, scoring, pass mark, completion behavior, persistence, and any platform warnings.
12. Do not claim `UPLOAD-READY`, `IMPORTED`, `VALIDATED`, or `COMPLETE` without direct authenticated evidence.

Current official LearnWorlds guidance states that an assessment-import file must be downloaded from the assessment activity, contains `Instructions`, `Examples`, and `Questions` tabs, and fails if the tab or column names are changed. The bulk-upload guidance also requires creating the exam or self-assessment activity, downloading the premade template, and using the required filename convention.

Official references:

- https://support.learnworlds.com/support/solutions/articles/12000087253-how-to-import-questions-to-an-assessment-from-an-xls-file
- https://support.learnworlds.com/support/solutions/articles/12000101758-how-to-bulk-upload-course-content

## Verified native LearnWorlds assessment template

The owner supplied the actual current target-school LearnWorlds question-import template. Two copies were byte-identical.

```text
Template filename: Question Bank Template.xlsx
Preserved copy: Question Bank Template(1).xlsx
Template SHA-256: 23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
Template size: 19,019 bytes
Worksheet order: Instructions, Examples, Questions
```

Exact required `Questions` worksheet headings:

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

The exact no-space headings `Answer1` through `Answer10` are controlling. A generated approximation such as `Answer 1` is not compliant.

## Current assessment correction

The previously generated Cybersecurity Foundations assessment workbook is rejected because it was not populated inside the actual native template. It recreated a simplified workbook, used incorrect spaced answer headings, and replaced the native Instructions and Examples worksheets.

A corrected workbook was built from a copy of the actual native template:

```text
Corrected workbook: exam_Cybersecurity_Foundations_Final_Assessment-v2.1.0.xlsx
Corrected workbook SHA-256: d3cff502e819cc3e5c4c0fd99fc7a9f0700fb0c179f791e5bee7dc17ffd0aada
Questions: 25
Groups: 5
Question type: TMC
Native Instructions and Examples worksheets preserved: yes
Exact Questions worksheet and headings preserved: yes
Filename begins with exam_: yes
Local structural validation: passed
Authenticated import test: pending
```

```text
Prior generated workbook: REJECTED FOR UPLOAD
Corrected native-template workbook: STRUCTURALLY PASSED
LearnWorlds import success: NOT PROVEN
Imported question count and groups: NOT PROVEN
80 percent pass mark and persistence: NOT PROVEN
Upload-ready status: PENDING AUTHENTICATED TEST IMPORT
```

The 25 questions may be used only through the corrected native-template workbook or a later native-template-derived version. Every prior package containing `02_Final_Assessment_25_Questions_Import.xlsx` is superseded for assessment-import purposes.

Detailed correction record:

```text
docs/academy-media-pipeline/LEARNWORLDS-ASSESSMENT-NATIVE-TEMPLATE-CORRECTION-2026-08-12.md
```

## Official Obserra-site verification

Before generating Academy identity, course metadata, positioning, public descriptions, or brand-related content, check:

- https://www.obserrallc.com
- the current Academy catalog and course page;
- the approved registered logo files;
- the approved brand palette and legal-company wording;
- the owner-approved learner-facing attribution.

The current learner-facing owner attribution remains:

```text
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
www.obserrallc.com
```

The owner resume remains internal factual grounding only and is not authority to add other titles, employers, or employment history to learner-facing content.

## Official-source verification

Before citing or packaging NIST, CISA, regulatory, legal, technical, or standards content:

1. Open the current official publisher page.
2. Verify the title, revision, publication date, status, URL, and applicability.
3. Confirm that the source has not been withdrawn, superseded, replaced, or materially updated.
4. Record the official URL and verification date.
5. Do not rely on a cached title, old PDF, search-result snippet, or secondary summary when the primary source is available.

## Evidence record

Every verification record must include:

```text
Target site/platform
Target URL
UTC verification timestamp
Account, school, course, page, activity, template, or object context
Verifier
Screenshot/export/template reference
Original template filename and SHA-256, when applicable
Official documentation URL
Observed fields, tabs, columns, options, and constraints
Verification result: PASSED / BLOCKED / FAILED
Generation authorization: YES / NO
Upload/import test result, when applicable
```

## Hard-stop conditions

Stop immediately and record `BLOCKED` when:

- the actual site is not accessible;
- authentication is required but unavailable;
- the exact current target object cannot be inspected;
- the exact native template cannot be downloaded or supplied;
- live fields, tabs, columns, options, or completion rules are unknown;
- the live site conflicts with an older artifact;
- the owner reports a mismatch;
- the official source cannot be verified;
- brand or attribution conflicts with the official site or approved assets.

## Restart requirement

Every new chat or work session must read this gate before generating content. The session must check the actual applicable sites again; a prior session's check is not a permanent substitute for a current check.

**No exceptions.**
