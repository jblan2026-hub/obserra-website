# Security Awareness for High Risk Employees v3.1.0 Audit

**Audit date:** 2026-08-12  
**Course:** Security Awareness for High Risk Employees  
**Delivery:** `C4-SAHR.zip`  
**SHA-256:** `1a11db72bb52e1db82c1e5569d6f00bd92a6eb154c45f52ab115ba7dbfb0aa99`  
**Disposition:** COMPLETE NONVIDEO OWNER-INTEGRATION DELIVERY; AUTHENTICATED LEARNWORLDS COURSE RUNTIME PENDING

## Source lineage

The release preserves the validated v2.3.0 category-complete source package:

`Obserra-EPI-Academy-Security_Awareness_for_High_Risk_Employees-LearnWorlds-Category-Complete-v2.3.0.zip`

Source SHA-256: `d0c024687ff7d9d8eab695c67ea27b2144ed94b94416365712540c7f3c86ee95`

The source package previously passed independent static audit with eight presentations, eight SCORM packages, ten XLSX workbooks, one learner DOCX, and the governed eight-section architecture.

## Preserved failure and correction

The v2.3.0 source contained eight byte-identical presentation PDF exports. All eight displayed the Authoritative Resource Library deck even though the PPTX masters were distinct. The failure was preserved in the package evidence. Each PDF was regenerated from its corresponding PPTX master for v3.1.0.

## SCORM correction standard

The eight section SCORM packages were rebuilt using the SCORM 1.2 structure that was directly accepted by LearnWorlds during Course 1 runtime testing. Each standalone package places `imsmanifest.xml` and `index.html` at ZIP root and explicitly declares ADL SCORM 1.2 metadata without dangling schema-location references.

## Package evidence

- ZIP members: 708
- CRC failure: none
- Zero-byte files: none
- Estimated longest Windows extraction path at `C:\C4`: 166 characters
- Windows path-length control: passed
- Learner-facing sections: 8
- LearnWorlds activity categories per section: 13
- Native assessment workbooks: 8
- Assessment questions: 60 total
- Final assessment: 25 questions
- SCORM 1.2 packages: 8
- Owner video positions: 8
- Video/audio binaries included: 0
- Video production bible accessibility audit: 0 high, 0 medium, 0 low findings

## Video boundary

Final video production and approval remain the responsibility of Dr. Jody Blanchard. The package contains scripts and production controls but no completed video or audio binaries.

## Acceptance boundary

The Course 1 SCORM packaging pattern is proven accepted by LearnWorlds. Full authenticated LearnWorlds course-runtime acceptance for Course 4 remains unproven until activity import, SCORM state retention, assessment scoring, completion, certificate, desktop/mobile, accessibility, and owner end-to-end testing are completed. Publication remains blocked until those gates pass.
