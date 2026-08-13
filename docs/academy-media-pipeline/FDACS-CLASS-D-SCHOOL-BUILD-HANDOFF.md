# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-13

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Website: `https://www.obserrallc.com`

## Purpose

This is the authoritative sanitized restart record for the **Florida FDACS Class D Security Officer School and regulated LMS build** within the Academy master-record ecosystem.

This workstream is separate from the Obserra EPI Academy commercial Course 1 through Course N / LearnWorlds / SCORM workstream. Generic Academy assessment, completion, certificate, and publication rules do not supersede the Florida Class D controls.

Detailed implementation state is maintained on the Florida implementation branch at:

`docs/florida-class-d-lms/HANDOFF.md`

## Current implementation

Primary branch: `feature/florida-class-d-lms-foundation`

Primary pull request: `PR #56`

Public state: `COMING SOON · LMS IN PROGRESS`

Owner reports an active Florida Class DI instructor license and a pending Class DS school application. No private license number or credential evidence belongs in the public repository.

## Controlled completion standard

The Florida Class D course requires five instructional days, 2,400 verified instructional minutes, 480 qualifying instructional minutes per day, all 18 required curriculum areas/checks, and a separate 170-question final examination.

**Forty instructional hours alone do not constitute successful completion and do not earn a certificate.** A learner must pass the final examination with at least 128 correct answers, clear required remediation and other completion blockers, and receive authorized completion approval.

Only after successful completion may the LMS create the learner-specific supplemental Obserra completion certificate/application-handoff record. The official **FDACS-16103 Certificate of Security Officer Training** is a separate LIAS-generated Florida document and is not synthesized by Obserra. Successful course completion and training documents do not themselves issue a Florida Class D license.

## Implemented regulated gates

### Gates 1-4

Foundation, public Coming Soon state, regulated record model, durable Supabase persistence/admin APIs, identity verification, enrollment, acknowledgments, cohort assignment, and protected role boundaries are implemented in source.

### Gates 5-8

Live DI classroom controls, one-device presence, server-authoritative instructional/break/uncredited time, presence challenges, Q&A, daily instructor attendance certification, secure Daily media, temporary view-only regulatory observer access, and exact five-day/20-session scheduling are implemented.

### Gates 9-11

Structured live polls/participation analytics, controlled make-up assignment and atomic credit reconciliation, and protected recorded make-up playback/evidence controls are implemented.

### Gates 12-15

The protected 170-question final exam engine, minimum two-hour exam duration, randomized delivery, 128/170 passing threshold, protected bank administration, Division-approved-bank status, active exam monitoring, interruption/resume/invalidation, failed-attempt preservation, remediation, and controlled retest authorization are implemented.

### Gate 16 — successful-completion review

Completion review reconciles verified identity, five qualifying 480-minute days, at least 2,400 verified instructional minutes, all 18 curriculum/check requirements, closed remediation, preserved passing exam evidence, unresolved security/completion issues, and authorized compliance approval before a completion record is created.

### Gate 17 — LIAS and official completion documents

Manual LIAS workflow, three-business-day deadline tracking, prepared/submitted/confirmed/exception history, confirmed-LIAS-only FDACS-16103 ingestion, private storage, integrity checking, authenticated learner delivery, Class D application handoff, and post-course inspection history are implemented. Direct LIAS scraping/browser automation is intentionally not used.

### Gate 18 — protected supplemental certificate presentation

The supplemental Obserra certificate is generated only after the successful-completion record exists and passing exam evidence is revalidated. It uses the learner's verified legal name and controlled completion facts, is protected from public access, and explicitly states that it is supplemental and not a Florida license or replacement for FDACS-16103.

### Gate 19 — completion / inspection packet

A protected staff-only completion/inspection packet consolidates attendance, instructional time, live time, module progress, exam history without questions/answers, completion, LIAS state/events, completion-document metadata, and audit history. Sensitive raw identity evidence, payment-card data, secrets, and protected exam content are excluded. Printable HTML and JSON evidence include a deterministic SHA-256 packet digest.

### Gate 20 — quality, CAPA and record retention

Protected school quality-management controls now cover incidents, complaints, attendance/exam/LIAS exceptions, security events, and quality findings. Cases carry severity, investigation/action/verification status, corrective-action evidence, and verified closure with append-only history.

Retention review keeps the regulatory minimum separate from the school's longer operational retention policy, supports legal holds, and does not perform automatic destruction. Disposition remains human controlled.

## Class DS submission-guide evidence

The controlled submission-guide record is:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

The next controlled DOCX/PDF revision must incorporate the current completion/certification standard and add demonstration screenshots for:

1. Completion Review Console.
2. Forty-hours-complete but certificate-ineligible-until-exam-pass state.
3. FDACS/LIAS completion workflow.
4. Student Completion Documents portal.
5. Supplemental Obserra Course Completion Certificate.
6. Completion & Inspection Packets.
7. Quality, CAPA & Record Retention.

Development screenshots must remain labeled as previews. Controlled production screenshots replace them before the guide is represented as final operational evidence.

## Production activation boundary

All regulated production functions remain disabled while the Class DS application is pending and until the applicable production gates pass. Source/CI success does not equal FDACS approval, production database promotion, runtime acceptance, or launch authorization.

Production work still requires controlled migration promotion/rollback/verification, protected runtime configuration, private document storage, media-provider configuration, identity/enrollment validation, end-to-end attendance/time/presence testing, approved exam-bank loading, completion/certificate validation, LIAS operating validation, inspection/quality/retention validation, accessibility/mobile/desktop testing, recovery testing, and owner acceptance.

## Public repository security boundary

Never commit real learner PII, identity documents, protected examination questions or answer keys, FDACS/LIAS credentials, authenticated private screenshots, license numbers, Supabase service-role keys, Daily keys/tokens, observer access secrets, private credential evidence, or production secrets.

## Next controlled sequence

1. Make the dedicated **Gates 1-20** Florida CI fully green.
2. Build the controlled production database migration/rollback/verification gate.
3. Build protected runtime-readiness validation for Supabase, private storage, Daily, Clerk roles, DI/DS server configuration, and all regulated feature flags.
4. Run controlled end-to-end validation across enrollment, live instruction, attendance/time, presence, exam, completion, documents, inspection, quality/CAPA, retention, and LIAS.
5. Load/finalize the Division-approved examination bank only through protected administrative controls before production exam activation.
6. Revise the Class DS LMS submission guide and screenshot package.
7. Replace development previews with production evidence where applicable.
8. Keep public payment, enrollment, regulated access, examination, completion/certificate release, LIAS, observer, and other regulated functions disabled until applicable authorization and production gates are accepted.

## Restart instruction

```text
Read docs/florida-class-d-lms/HANDOFF.md on feature/florida-class-d-lms-foundation before continuing the Florida Class D LMS build. Gates 1-20 are implemented in source. Forty hours alone never earn a certificate. Successful completion requires the five-day/2,400-minute record, all 18 required curriculum/check requirements, a passing 170-question exam at 128/170 or better, cleared blockers, and authorized completion approval. After approval the LMS may create the supplemental Obserra completion certificate/application handoff; staff perform manual LIAS reporting; official FDACS-16103 is accepted only after LIAS confirmation. Gate 19 provides protected completion/inspection packets. Gate 20 adds quality/CAPA and human-controlled retention/legal-hold operations. Continue by making Gates 1-20 CI green, then production database/runtime readiness and the revised Class DS submission guide with updated screenshots. Keep all regulated public launch functions fail closed until the applicable regulatory and production gates pass.
```
