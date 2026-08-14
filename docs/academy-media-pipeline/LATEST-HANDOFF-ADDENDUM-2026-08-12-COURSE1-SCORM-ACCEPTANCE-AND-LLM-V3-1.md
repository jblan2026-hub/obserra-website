# Obserra EPI Academy Handoff Addendum - Course 1 SCORM Acceptance and LLM Course v3.1

**Recorded:** 2026-08-12  
**Owner:** Dr. Jody Blanchard  
**Sole approved title:** Founder and CEO  
**Legal company:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Academy:** Obserra EPI Academy  
**Website:** www.obserrallc.com

## Course 1 LearnWorlds SCORM runtime evidence

Dr. Jody Blanchard reported that the rebuilt Course 1 SCORM 1.2 package successfully uploaded to LearnWorlds after the earlier package was rejected as invalid.

The accepted packaging pattern is now the mandatory Academy SCORM packaging standard for subsequent courses:

- `imsmanifest.xml` at ZIP root;
- explicit `<schema>ADL SCORM</schema>` metadata;
- explicit `<schemaversion>1.2</schemaversion>` metadata;
- no dangling `xsi:schemaLocation` references to schema files that are not included;
- root-level `index.html` launch file;
- `adlcp:scormtype="sco"` resource declaration;
- complete file declarations for packaged launch resources;
- ZIP CRC validation before delivery.

This runtime success supersedes prior assumptions that the earlier static SCORM structure was sufficient for LearnWorlds. Historical failures remain preserved.

## Course 3 - Large Language Models, LLMs, Explained for Leaders

A v3.1.0 owner-video-ready course derivative was built from the validated v2.3.0 category-complete source without rebuilding completed instructional assets.

### Preserved source baseline

```text
Source package: Obserra-EPI-Academy-Large_Language_Models_LLMs_Explained_for_Leaders-LearnWorlds-Category-Complete-v2.3.0.zip
Source SHA-256: 0597dad827c5b2e37cbeb41829209187d6b9bcb75e9fa9d0195bfe15a672e138
Validated source counts: 8 PPTX, 47 PDF, 10 XLSX, 1 DOCX, 8 SCORM packages
```

### v3.1.0 corrections and controls

1. Preserved the eight-section, thirteen-category LearnWorlds architecture.
2. Preserved eight native-template assessments and sixty total questions, including the twenty-five-question final assessment.
3. Preserved the corrected eight distinct presentation masters and PDF exports.
4. Preserved the eight owner-video scripts and production controls.
5. Rebuilt all eight SCORM packages to the Course 1 LearnWorlds-proven SCORM 1.2 structure.
6. Added a Windows-safe delivery archive using a short internal root to reduce path-length risk.
7. Re-rendered the owner video production bible; 26 pages visually reviewed with no observed layout failure.
8. DOCX accessibility audit passed with zero high, medium, or low findings after the table-header correction.
9. Production matrix rendered successfully across twelve PDF pages for QA.
10. No final owner video or audio binaries are included.

### Release boundary

```text
Course 3 static package: PASSED
SCORM structural validation: PASSED
SCORM packaging standard: Course 1 LearnWorlds-proven SCORM 1.2
Owner video production: REQUIRED
Course 3 authenticated LearnWorlds runtime: NOT YET PROVEN
Assessment import/persistence: NOT YET PROVEN
Certificate issuance: NOT YET PROVEN
Desktop/mobile learner journey: NOT YET PROVEN
Publication: BLOCKED
Live checkout: BLOCKED
```

## Next controlled work order

1. Dr. Jody Blanchard produces Course 3 videos V00 through V07 using the controlled scripts and approved identity/voice.
2. Upload the Course 3 S00 SCORM 1.2 package as the LearnWorlds canary before uploading S01-S99.
3. If S00 is accepted, continue all eight SCORM uploads and record runtime evidence.
4. Continue build work to `Security Awareness for High Risk Employees` using the same proven SCORM 1.2 standard and owner-video boundary.
5. Do not publish any course until full authenticated LearnWorlds runtime, assessment, accessibility, completion, certificate, desktop/mobile, and owner-acceptance gates pass.
