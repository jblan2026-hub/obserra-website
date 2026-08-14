# LearnWorlds Continuous Handoff Addendum: Course Outline Ready for Governed Import

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Evidence supplied by owner

The owner supplied a current screenshot of the LearnWorlds author dashboard for `Cybersecurity Foundations for New Professionals` at the Course outline page.

The screenshot proves:

1. The correct course shell is open in the LearnWorlds author interface.
2. Three existing sections are present.
3. All three sections are unnamed.
4. All three sections remain in Draft state.
5. The interface exposes `Add activity`, `Upload file`, `Import existing`, and `Add section` controls.
6. No instructional activity is yet visible inside the sections.

## Import package available

The governed import package is:

```text
Obserra-Cybersecurity-Foundations-LearnWorlds-Import-v2.0.0.zip
```

The five SCORM 1.2 module files are:

```text
01-security-and-business-risk-scorm.zip
02-identity-and-access-scorm.zip
03-threat-recognition-scorm.zip
04-incident-reporting-scorm.zip
05-secure-habits-and-continuous-improvement-scorm.zip
```

The native LearnWorlds final assessment source is:

```text
exam_Cybersecurity_Foundations_Final_Assessment.xlsx
```

## Required section structure

The course must contain six ordered Draft sections before final validation:

1. `Module 1: Security and Business Risk`
2. `Module 2: Identity, Access, and Authentication`
3. `Module 3: Threat Recognition and Safe Response`
4. `Module 4: Incident Reporting and Evidence Preservation`
5. `Module 5: Secure Habits and Continuous Improvement`
6. `Final Assessment and Completion`

## Immediate owner action

1. Rename the current section `01` to `Module 1: Security and Business Risk`.
2. Rename section `02` to `Module 2: Identity, Access, and Authentication`.
3. Rename section `03` to `Module 3: Threat Recognition and Safe Response`.
4. Add section `04`, section `05`, and section `06` using the titles above.
5. Keep every section in Draft state.
6. Under each of sections 01 through 05, select `Add activity` and create a `SCORM/HTML5 Package` activity.
7. Upload the correspondingly numbered SCORM ZIP.
8. Under section 06, create a native LearnWorlds Exam and import the populated XLS question source.
9. Set the final passing score to 80 percent.
10. Do not switch any section to Paid or publish the course until content, completion, assessment, certificate, accessibility, branding, and owner-approval gates pass.

## Current acceptance state

```text
Course package built: passed
Course package validation: passed
Correct LearnWorlds course shell open: passed
Course outline controls available: passed
Required sections named: not started
Five SCORM modules uploaded: not started
Final assessment imported: not started
Course completion tested: blocked
Certificate tested: blocked
Production release: blocked
```

## Prevention rule

Do not use the presence of empty LearnWorlds sections as evidence that instructional content was loaded. Import acceptance requires visible activities, launch testing for each SCORM package, completion reporting, assessment scoring, and certificate issuance evidence.