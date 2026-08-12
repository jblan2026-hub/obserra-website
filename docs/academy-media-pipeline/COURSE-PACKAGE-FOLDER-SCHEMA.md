# Obserra EPI Academy Mandatory Course Package Folder Schema

Every current and future course package must use this section-first, LearnWorlds-category-second structure.

```text
<Course-Slug>/
  00_Course_Administration/
  01_Course_Opening_and_Orientation/
    01_Multimedia/
    02_Ebook/
    03_Exams/
    04_Self_Assessment/
    05_Forms/
    06_Certificates/
    07_Social/
    08_Embed/
    09_Evidence_and_QA/
  02_Module_01/
    01_Multimedia/
    02_Ebook/
    03_Exams/
    04_Self_Assessment/
    05_Forms/
    06_Certificates/
    07_Social/
    08_Embed/
    09_Evidence_and_QA/
  03_Module_02/
    ...same nine category folders...
  04_Module_03/
    ...same nine category folders...
  05_Module_04/
    ...same nine category folders...
  06_Module_05/
    ...same nine category folders...
  07_Final_Assessment_and_Completion/
    ...same nine category folders...
  08_Authoritative_Resource_Library/
    ...same nine category folders...
  99_Manifest_Validation_and_Hashes/
```

## Folder-content rule

Every category folder must contain one of the following:

1. the actual learner-facing content and upload artifact;
2. the activity copy, configuration, completion rule, and QA record when the activity is built natively in LearnWorlds;
3. a controlled `NOT-USED-RATIONALE.md` when the verified activity option is not deployed.

Empty category folders are prohibited.

## Required evidence in every section

`09_Evidence_and_QA` must identify:

- actual-site screenshot or verification-record reference;
- exact target course and section;
- exact activity titles and types;
- source files;
- native-template filenames and SHA-256 values;
- required/optional status;
- completion rules;
- import, launch, playback, scoring, and persistence results;
- accessibility findings;
- desktop and mobile findings;
- owner approval state;
- every discrepancy and correction.

## Media rule

All owner-video folders must be marked `OWNER PRODUCTION REQUIRED`. They may contain scripts, storyboards, teleprompter copy, on-screen text, captions/transcript templates, technical requirements, and insertion instructions, but no assistant-generated video.

## Acceptance boundary

The folder structure is a packaging requirement, not proof of LearnWorlds implementation. A course is not complete until the actual Draft course is built, saved, reopened, and tested with direct evidence.
