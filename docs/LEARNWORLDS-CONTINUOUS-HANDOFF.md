# Obserra EPI Academy Public Continuous Handoff v13.4.0

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

## Permanent actual-site verification gate

Dr. Jody Blanchard has directed that the actual applicable sites must be checked before any content is generated, with no exceptions.

```text
Actual current target site checked: REQUIRED
Authenticated target object checked when account-specific: REQUIRED
Exact current native template/export obtained when applicable: REQUIRED
Untouched original preserved and hashed: REQUIRED
Current official vendor documentation checked: REQUIRED
Current official Obserra site and approved brand checked: REQUIRED
Current official primary-source pages checked: REQUIRED
Generation before verification passes: PROHIBITED
Fallback to memory, old files, generic templates, or assumptions: PROHIBITED
No exceptions: ENFORCED
```

This gate applies to course manuscripts, scripts, LearnWorlds imports, assessment workbooks, SCORM/HTML5, workbooks, resources, metadata, course cards, certificate instructions, completion rules, website copy, provider artifacts, and authoritative references.

Governing records:

```text
docs/academy-media-pipeline/ACTUAL-SITE-VERIFICATION-GATE.md
config/academy-actual-site-verification-policy.json
docs/academy-media-pipeline/LEARNWORLDS-ASSESSMENT-NATIVE-TEMPLATE-CORRECTION-2026-08-12.md
```

If the actual site, exact target object, native template, or current official source cannot be inspected, the result is `BLOCKED`. The artifact must not be generated or represented as upload-ready.

## Native LearnWorlds template now preserved

The owner supplied the current actual-school LearnWorlds question-import template. Two preserved copies were byte-identical.

```text
Template: Question Bank Template.xlsx
Preserved copy: Question Bank Template(1).xlsx
Template SHA-256: 23e591abe440b3c05139a44543d9626ef17c251d42f30881e6e49f51e027ad7e
Template size: 19,019 bytes
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

## Assessment failure and corrected workbook

The owner reported that the generated assessment was not in the actual LearnWorlds upload template. The generated workbook had recreated the schema, used `Answer 1` through `Answer 10` instead of the native `Answer1` through `Answer10` headings, and replaced the native Instructions and Examples worksheets.

```text
Prior generated assessment: REJECTED
Prior upload-ready claim: WITHDRAWN
Prior package structural validation: NOT NATIVE-TEMPLATE PROOF
```

A corrected workbook was created from a copy of the actual native template:

```text
File: exam_Cybersecurity_Foundations_Final_Assessment-v2.1.0.xlsx
SHA-256: d3cff502e819cc3e5c4c0fd99fc7a9f0700fb0c179f791e5bee7dc17ffd0aada
Questions: 25
Groups: 5
Types: 25 TMC
Native Instructions and Examples tabs preserved: yes
Exact Questions tab and headings preserved: yes
Plain-text question data: yes
Filename convention exam_: yes
Local template-structure validation: passed
Authenticated LearnWorlds import: pending
```

Current acceptance:

```text
Native-template structural compliance: PASSED
Authenticated import: NOT PERFORMED
Imported question count: NOT PROVEN
80 percent pass rule: NOT PROVEN
Save/reopen persistence: NOT PROVEN
Upload-ready status: PENDING AUTHENTICATED TEST IMPORT
```

All previously delivered packages containing `02_Final_Assessment_25_Questions_Import.xlsx` remain preserved for audit but are superseded for assessment-import purposes. They must not be used for the LearnWorlds assessment upload.

## Official LearnWorlds guidance checked

The current official documentation confirms that administrators must download the template from the assessment activity, retain its worksheets and column names, place questions in the `Questions` worksheet, and use the applicable filename convention.

- https://support.learnworlds.com/support/solutions/articles/12000087253-how-to-import-questions-to-an-assessment-from-an-xls-file
- https://support.learnworlds.com/support/solutions/articles/12000101758-how-to-bulk-upload-course-content

The owner-supplied actual-school template controls over any generic example or generated approximation.

## Permanent owner-video directive

```text
Assistant-generated course video: PROHIBITED
New HeyGen or other paid video generation: PROHIBITED
Additional provider-credit expenditure: PROHIBITED
Avatar, clone, lip-sync, substitute presenter, or synthetic owner media: PROHIBITED
Owner-produced final videos: AUTHORIZED after owner delivery
Document, script, SCORM, assessment, and production-support work: AUTHORIZED only after actual-site verification passes
```

All video activities remain `OWNER PRODUCTION REQUIRED` until the owner supplies the final media.

## Current package evidence

The existing materials-and-scripts packages and hashes remain preserved as draft/review evidence. File integrity and clean extraction do not prove current LearnWorlds template compliance, import success, runtime behavior, learner completion, certificate issuance, or publication.

```text
Master package: Obserra-EPI-Academy-Materials-and-Scripts-Master-Set-v1.0.0.zip
Scripts-only package: Obserra-EPI-Academy-Video-Scripts-Only-v1.0.0.zip
Courses covered: 4
Video files included: 0
Assessment workbook in prior course package: SUPERSEDED
Corrected native-template assessment workbook: BUILT SEPARATELY
Authenticated LearnWorlds upload: NOT PERFORMED
Publication: NOT PERFORMED
```

## Evidence-based acceptance rule

Every claimed result must be supported by direct evidence from the actual current site or exact current artifact.

Plans, scripts, storyboards, manifests, package names, placeholders, expected runtimes, generic templates, old exports, prior screenshots, model memory, and intended configurations are not proof of platform compatibility, template compliance, successful import, runtime acceptance, scoring, completion, certificate issuance, accessibility, desktop/mobile behavior, or publication.

Use `NOT PROVEN`, `PENDING`, `BLOCKED`, `FAILED`, or `OWNER PRODUCTION REQUIRED` whenever direct evidence is absent.

## Current controlled work order

1. Import `exam_Cybersecurity_Foundations_Final_Assessment-v2.1.0.xlsx` into the actual Cybersecurity Foundations Draft exam.
2. Record the import result, warnings, imported question count, five groups, question types, and save result.
3. Configure the 80 percent pass mark, save, reopen, and verify persistence.
4. If the import succeeds, reissue the Cybersecurity Foundations non-video package, materials-and-scripts package, and master set with corrected paths, manifests, versions, validations, and hashes.
5. Audit every remaining LearnWorlds-specific artifact against the actual current school interface and native downloaded templates before regeneration.
6. Before producing any additional course, check the actual current Obserra site/catalog, current LearnWorlds activity options and templates, and current official primary-source pages.
7. Continue `Executive Travel Risk Management` only after its verification record is `PASSED`.
8. Do not generate course video.
9. Update protected and sanitized handoffs after every site check, template retrieval, discrepancy, import result, failure, package version, and owner decision.

## Security boundary

The public repository receives sanitized governance and status evidence only. Actual school-specific templates, authenticated screenshots, complete manuscripts, assessment answers, owner media, provider identifiers, learner data, and protected Academy intellectual property remain in protected storage.

## Release boundary

```text
Actual-site verification before generation: MANDATORY / NO EXCEPTIONS
Corrected assessment workbook: NATIVE-TEMPLATE STRUCTURE PASSED / IMPORT PENDING
Prior assessment workbooks: REJECTED
Continuous non-video production: CONDITIONAL ON PASSED VERIFICATION
Assistant-generated video: PROHIBITED
LearnWorlds runtime acceptance: NOT PROVEN
Certificate issuance acceptance: NOT PROVEN
Desktop/mobile learner journey: NOT PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
Production merge/cutover: BLOCKED
```

## Handoff rule

Every new chat or work session must read the actual-site verification gate and recheck the applicable current sites before generating content. A previous session's check is not a permanent substitute for a current check.

Update protected and sanitized handoffs immediately after every substantive action, site verification, template/export retrieval, result, failure, package change, integrity check, provider-state change, LearnWorlds change, or owner decision. Preserve failures permanently.
