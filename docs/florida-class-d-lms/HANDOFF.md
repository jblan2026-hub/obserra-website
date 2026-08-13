# Obserra Florida Class D LMS Handoff

## Scope boundary

**Separate from Academy course-content build.**

This handoff governs the Florida Class D regulated-school LMS, student-record, attendance, examination-control, FDACS/LIAS workflow, inspection-readiness, and regulated operations work for **Obserra Executive Protection & Intelligence LLC**.

It is intentionally separate from the Obserra EPI Academy course-production / LearnWorlds handoff. Course manuscripts, generic Academy course creation, owner-produced media, and unrelated commercial course packages are not tracked here.

## LMS / Regulated School System Handoff

### Current branch

`feature/florida-class-d-lms-foundation`

### Pull request

PR #56 — Florida Class D LMS foundation and Coming Soon training tab

### Public release state

`COMING SOON · LMS IN PROGRESS`

- Public Florida Training navigation: implemented in source.
- Public preview page: implemented in source.
- Paid enrollment: disabled.
- Student access: disabled.
- FDACS-approved representation: prohibited until actual approval is established.
- Production deployment: not claimed by this handoff without CI/deployment evidence.

## Gate 1 — Foundation Controls

**Status: IMPLEMENTED IN SOURCE / CI EVIDENCE PENDING**

Controls established:

- Canonical business identity is `Obserra Executive Protection & Intelligence LLC`.
- Course remains `coming-soon`.
- Enrollment and payment remain disabled.
- Five-day / 40-hour / eight-hour-per-day structure is fixed.
- Eighteen required modules are enumerated in controlled order.
- Module instructional hours total exactly 40.
- Every module has a learning check or applied assessment definition.
- Certification exam is represented as separately controlled from the 40 instructional hours.
- Exam metadata is 170 questions with 128 correct as the passing threshold.
- Course completion is explicitly distinguished from Florida Class D licensure.
- No state-approval claim may be shown before applicable approval exists.
- Planned lifecycle includes identity, entitlement, attendance/time evidence, remediation, exam control, retest, FDACS/LIAS queue, inspection records, and quality analytics.

Gate script: `scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

**Status: IMPLEMENTED IN SOURCE / PERSISTENCE AND CI EVIDENCE PENDING**

Source model: `lib/florida-class-d-records.ts`

Gate script: `scripts/florida-class-d-records-gate.mjs`

The regulated record model now defines:

- student identity record tied to Clerk user identity;
- identity verification state;
- controlled Class D enrollment record;
- cohort / class-session record;
- five-day attendance entries;
- credited instructional-time ledger;
- 18-module progress ledger;
- module learning-check attempts and scores;
- remediation assignment and completion records;
- append-only audit-event contract;
- explicit student, instructor, school-admin, compliance-admin, and system roles;
- deterministic exam-eligibility policy.

### Gate 2 fail-closed invariants

The source gate must fail if any of these protections are removed:

- minimum instructional credit is less than 2,400 minutes;
- fewer than five instructional days are represented;
- fewer than 18 modules are required;
- audit policy is no longer append-only;
- exam eligibility does not require completion of instruction;
- payment is allowed to bypass the regulatory launch gate;
- completion bypasses instructor review;
- LIAS is treated as unverified direct automation rather than an authorized administrative action;
- a student can change credited attendance, instructional time, or exam eligibility;
- exam eligibility does not require verified identity;
- exam eligibility does not require all modules complete;
- exam eligibility can pass with open remediation.

### Persistence boundary

Gate 2 establishes the production domain contract and policy boundary only. It does **not** yet claim a deployed durable database, completed Clerk identity-verification integration, live attendance capture, or live regulated student data. Those require the persistence/integration gate.

## Next gate — Gate 3: Durable Regulated Records & Administrative API

Planned scope:

- select and validate the production persistence mechanism already authorized for the website architecture;
- durable student/enrollment/cohort tables or equivalent storage contracts;
- append-only audit persistence;
- authenticated server-side administrative API;
- authorization checks for instructor, school-admin, and compliance-admin actions;
- idempotent attendance/time writes;
- immutable correlation IDs and event history;
- record-retention and inspection-export boundaries;
- test fixtures with synthetic data only;
- no production learner PII committed to the public repository.

## Security and repository boundary

The repository is public. Never commit:

- real student names, dates of birth, IDs, addresses, contact details, payment information, or identity documents;
- examination answer keys or protected exam material;
- authenticated FDACS/LIAS screenshots, credentials, tokens, or session data;
- private instructor credential files;
- production secrets or private API credentials.

Source code, sanitized schemas, tests, policy gates, and non-sensitive operational documentation may be committed.

## Release discipline

Do not enable public checkout, enrollment, student course access, examination access, certificate/completion issuance, or automated LIAS submission merely because a source gate passes. Each capability must have its own validated gate and applicable regulatory approval evidence before activation.
