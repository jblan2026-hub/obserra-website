# Obserra FDACS Class D School Build Handoff

Snapshot: 2026-08-12

Owner: Dr. Jody Blanchard

Sole approved owner title: Founder and CEO

Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Website: https://www.obserrallc.com

## Purpose

This is the authoritative sanitized handoff for the **Florida FDACS Class D Security Officer School / regulated LMS build**.

This workstream is **separate from the Obserra EPI Academy commercial course-production build**. Do not mix this handoff with the Course 1, Course 2, Course 3, Course 4, Course 5, LearnWorlds SCORM, owner-video, or general Academy catalog production state except where shared website infrastructure is intentionally reused.

## Current repository implementation

Primary implementation branch:

`feature/florida-class-d-lms-foundation`

Primary pull request:

`PR #56 — Florida Class D LMS foundation and Coming Soon training tab`

Current public state:

`COMING SOON · LMS IN PROGRESS`

Paid enrollment, student course access, regulatory completion issuance, and live examination access remain disabled.

## Regulatory-course architecture currently modeled

```text
Provider: Obserra Executive Protection & Intelligence LLC
Course: Florida Class D Security Officer Training
Instructional days: 5
Instructional hours: 40
Hours per day: 8
Required curriculum modules: 18
Certification examination: separately controlled from instructional hours
Exam questions: 170
Passing threshold metadata: 128 correct
Public approval claim: prohibited until applicable approval is established
```

## Gate 1 — Foundation controls

Status: `IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING`

Implemented controls include:

- dedicated Florida Training website navigation;
- premium Florida Class D Coming Soon / LMS In Progress page;
- payment and enrollment disabled;
- exact five-day / 40-hour / 18-module course structure modeled;
- learning check or applied assessment defined for every module;
- separate controlled examination metadata;
- licensure distinction language;
- no state-approval representation before applicable approval;
- planned identity, entitlement, attendance, instructional-time, remediation, examination, FDACS/LIAS, inspection, and quality-management lifecycle;
- fail-closed source gate wired into the Academy release-verification path.

Gate script:

`scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

Status: `IMPLEMENTED IN SOURCE / DURABLE PERSISTENCE AND CI EVIDENCE PENDING`

Source domain model:

`lib/florida-class-d-records.ts`

Gate script:

`scripts/florida-class-d-records-gate.mjs`

The model now defines sanitized production contracts for:

- student identity tied to authenticated user identity;
- identity-verification state;
- controlled Class D enrollment;
- cohort / class-session assignment;
- five-day attendance records;
- credited instructional-time ledger;
- 18-module progress ledger;
- learning-check attempts and results;
- remediation records;
- append-only audit-event history;
- student, instructor, school-admin, compliance-admin, and system role boundaries;
- deterministic exam-eligibility policy.

Exam eligibility is designed to remain blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 modules are complete, and no remediation remains open.

Students may not alter credited attendance, instructional time, or their own exam eligibility.

## Separate FDACS school operations package already produced outside the public repository

The school-administration workstream includes controlled materials for:

- student enrollment;
- identity verification;
- daily attendance and time sheets;
- instructor attendance certification;
- make-up training;
- module learning checks;
- remediation;
- final examination score records;
- examination security and chain of custody;
- student acknowledgments;
- course evaluations;
- incident records;
- records-retention logs;
- instructor rosters;
- curriculum revision control;
- FDACS inspection binder;
- LIAS operational workflow;
- post-course Class D licensing instructions;
- quality-management and corrective-action controls.

Protected operational documents, examination answers, learner records, private credentials, and regulated PII must not be committed to this public repository.

## Website / LMS target lifecycle

```text
Public Florida Training page
→ authenticated account
→ identity verification
→ enrollment acknowledgments
→ payment entitlement after launch authorization
→ cohort assignment
→ Day 1–5 sequential regulated instruction
→ attendance and instructional-time evidence
→ module learning checks
→ remediation where required
→ 40 instructional hours complete
→ controlled certification examination eligibility
→ pass/fail and retest workflow
→ instructor / school administrator review
→ FDACS/LIAS administrative reporting queue
→ completion-document workflow
→ student Florida Class D licensing instructions
→ inspection-ready retained record
```

## Next gate — Gate 3: Durable Regulated Records & Administrative API

Planned next scope:

1. Verify the current authorized production persistence architecture before implementation.
2. Add durable records for student identity state, enrollment, cohort, attendance, instructional time, module progress, learning checks, remediation, and audit history.
3. Add authenticated server-side administrative APIs.
4. Enforce instructor, school-admin, and compliance-admin authorization server-side.
5. Make attendance and instructional-time writes idempotent and auditable.
6. Add immutable correlation IDs and append-only event history.
7. Define record-retention, legal-hold, and inspection-export boundaries.
8. Use synthetic test data only in the public repository.
9. Keep payment, enrollment activation, final exam, completion issuance, and LIAS execution behind later explicit gates.

## Future gated sequence

```text
Gate 3 — Durable regulated records and administrative API
Gate 4 — Identity verification and regulated enrollment workflow
Gate 5 — Cohort scheduling, attendance, and instructional-time controls
Gate 6 — Module player, learning checks, and remediation engine
Gate 7 — Controlled 170-question certification examination engine
Gate 8 — Pass/fail, retest, instructor review, and completion workflow
Gate 9 — FDACS/LIAS administrative queue and inspection center
Gate 10 — Stripe purchase entitlement and launch activation controls
Gate 11 — End-to-end regulatory, security, accessibility, and owner acceptance
```

## Security and public-repository boundary

Never commit:

- real learner names, dates of birth, addresses, identity documents, or contact details;
- payment card data;
- FDACS/LIAS credentials, tokens, private screenshots, or session information;
- protected final examination questions or answer keys;
- private instructor credential documents;
- production secrets or private API credentials.

Public repository content is limited to sanitized source code, schemas, tests, policy gates, release evidence, and non-sensitive handoff documentation.

## Truth and release boundary

Do not claim that the Florida Class D LMS is FDACS approved, deployed, purchasable, open for student enrollment, capable of issuing regulatory completion, or accepted by FDACS merely because source code exists or a local/static gate passes.

Each capability requires its own implementation evidence, CI evidence, deployment evidence, and applicable regulatory authorization before activation or representation.

## Restart instruction for this workstream

```text
Read docs/academy-media-pipeline/FDACS-CLASS-D-SCHOOL-BUILD-HANDOFF.md before continuing any Florida Class D school/LMS work. Treat it as a separate regulated workstream from the Obserra EPI Academy commercial course build. Resume from the latest passed or implemented gate, preserve every regulatory boundary and failure, keep the public page Coming Soon until launch authorization, and never enable payment, student access, examination, completion issuance, or LIAS execution ahead of its validated gate.
```
