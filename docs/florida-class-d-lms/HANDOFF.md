# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13 20:37 ET

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It is separate from the commercial Obserra Academy course-production workstream.

Repository: `jblan2026-hub/obserra-website`  
Branch: `feature/florida-class-d-lms-foundation`  
Pull request: `PR #56`  
PR state: **open, mergeable, unmerged**.

## Current validated restart checkpoint

Validated five-green checkpoint: `af4247978c3b1b3aaac45ce7e15f321512cbf71c`.

Green on that exact SHA:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

Historical Gate 25 implementation baseline: `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`, Florida Class D LMS Gates #367. Historical implementation SHAs remain audit evidence and are not the current restart pointer.

## Controlled Class D architecture

Gates 1 through 25 are implemented in source.

### Gates 1-4

Foundation, regulated student records, durable persistence and protected administrative APIs, identity verification, learner acknowledgments, cohort assignment, and regulated enrollment controls are implemented in source. Production enrollment and regulated learner activation remain fail closed.

### Gates 5-8

Live instructor classroom operation, one-device presence, server-authoritative instructional time, security challenges, attendance certification, live media, temporary observer access, and the controlled five-day schedule are implemented in source.

### Gates 9-15

Participation, controlled make-up, recorded make-up, protected final examination, examination-bank administration boundary, monitoring, remediation, and retest authorization are implemented in source.

### Gates 16-20

Completion review, LIAS workflow, completion documents, student document presentation, inspection packets, quality/CAPA, retention, and legal-hold controls are implemented in source.

### Gates 21-25

Database promotion readiness, protected runtime readiness, Gate 23 non-production acceptance, Gate 24 server-authoritative instructional text-screen timing, and Gate 25 regulated runtime isolation are implemented in source. These controls do not authorize production activation.

## Current regulated control state

Gate 23 requires an authorized non-production environment, exact release-SHA binding, synthetic identities only, evidence for all 18 required acceptance domains, and fail-closed finalization. A previous real UAT run finalized 18 of 18 domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. A new final-candidate-bound run is required because source advanced.

Gate 24 uses server-authoritative text-screen timing at 60 seconds per 50 words, prorated by word count, tied to the authenticated learner and active device lease. Acknowledgment remains blocked until the authoritative minimum is met, and instructor discussion confirmation is required before closure.

Gate 25 requires protected server runtime configuration and fails closed when required regulated configuration is absent or invalid. The mandatory runtime-isolation enforcement remains part of the dedicated Class D workflow.

## Controlled Class DS filing baseline

Current controlled artifacts:

- LMS Guide DOCX v0.15.
- LMS Guide PDF v0.15, 43 pages.
- Submission Readiness Register v1.5, 6 pages.
- FDACS-16003 Prefill Data Sheet v1.3.
- Prefiling Compliance Audit v1.5.
- Corporate Entity, Ownership, and Class DS School Location Baseline v1.5.
- Controlled Pre-Filing Packet v0.15, not for submission until open filing controls close.

Controlled packet ZIP SHA-256: `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.

Curriculum SHA-256: `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.

Final examination SHA-256: `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

## No mockups or placeholders

All continued LMS work must be real production-grade functionality intended for operational use by students and authorized staff. No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, fake acceptance result, or fake success state may be treated as implementation or filing evidence.

## Completion and certificate standard

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the full five-day / 2,400-minute record, all required curriculum areas and checks, a passing 170-question final examination at 128/170 or better, cleared blockers, and authorized school/compliance approval. The official FDACS-16103 remains LIAS-generated and must not be synthesized locally.

## Filing and deployment state

Class DS category: **Tuition/Fee Charging**. Designated filing/training email: **info@obserrallc.com**. The proposed school is online only, with live online instruction from the controlled Florida physical training location. The owner reports no applicable HOA or private-covenant restriction.

The existing intended Vercel project remains `obserra-website-live`. Canonical registered domain: `obserrallc.com`; public website host: `www.obserrallc.com`. Do not create another project, move the existing project, or change DNS as a workaround.

## Production boundary

Production regulated functions remain **fail closed**. Public paid enrollment, regulated learner access, production scheduling, live Class D instruction, production examination access, LIAS production execution, completion/certificate release, regulated database promotion, and runtime activation remain disabled until actual Class DS authorization and final production gates pass. No CI result, source commit, UAT result, screenshot, filing draft, or deployment state is FDACS approval.

## Mandatory audit continuity rule

Every material LMS, FDACS, Vercel, CI, UAT, database, identity, media, examination, LIAS, filing, security, or production-readiness action must update the controlled handoff state. Each action record must preserve the exact SHA or external object, result/evidence, workflow identifiers where applicable, production and regulatory impact, rollback state, unresolved blockers, and next governed action.

`CURRENT-STATUS-2026-08-13.md`, `LATEST-HANDOFF.md`, this file, applicable gate handoffs, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` must remain synchronized in authority. Historical gate records remain historical evidence and must defer current state to `LATEST-HANDOFF.md`.

## Audit action history

- `af4247978c3b1b3aaac45ce7e15f321512cbf71c`: all five primary workflows green, runs #400/#1942/#1118/#807/#826.
- `e57be5e50c7ecfb0da9052f47bb41267aaf2087c`: documentation-only current-status synchronization.
- `b838c691f8d42d9160fb762e124b3ae172a2b1b8`: synchronized `LATEST-HANDOFF.md` and established mandatory audit continuity.
- `89a408b618fabe5741fbf857d9e3e9939ea1aa69`: synchronized consolidated handoff. Website CI #1951, Academy 70x #1121, Release Validation #810, and Production Pipeline #829 passed. Florida Class D LMS Gates #403 failed only because the consolidated handoff had lost the verifier-required `### Gates 1-4` heading. This update restores that contract.

## Next controlled sequence

1. Revalidate the complete Class D workflow after this handoff fix.
2. Synchronize remaining controlled handoff and submission-control records.
3. Continue production-grade LMS readiness buildout.
4. Reconcile the existing authoritative Vercel project without project movement or DNS change.
5. Freeze the final production candidate and execute candidate-bound non-production acceptance.
6. Complete production database, runtime, media, examination-bank, LIAS, security, rollback, and owner-approval gates.
7. Do not activate regulated production functions until the Class DS license is actually issued and final production approval gates pass.
