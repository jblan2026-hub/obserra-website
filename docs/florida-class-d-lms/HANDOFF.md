# Obserra Florida Class D LMS Handoff

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **Obserra Executive Protection & Intelligence LLC**.

It is separate from the commercial Obserra Academy Course 1 through Course N / LearnWorlds course-production handoffs.

This revision supersedes earlier Gate 5/6 statements where applicable. Detailed prior state remains preserved in Git history.

## Current branch and pull request

Branch: `feature/florida-class-d-lms-foundation`

Pull request: PR #56

Public state: `COMING SOON · LMS IN PROGRESS`

## Owner-reported licensing state

- Florida Class DI Security Officer Instructor license: active.
- Florida Class DS Security Officer School / Training Facility application: pending.
- DI and future DS license numbers are protected runtime configuration and must not be committed to the public repository.
- Public paid enrollment, regulated instructional access, certification examination access, completion issuance, and LIAS execution remain disabled.
- Live regulated instruction remains fail closed until the DS is active and all required runtime gates are intentionally enabled.

## Controlled course architecture

The source preserves:

- five instructional days;
- 40 credited instructional hours;
- 480 verified instructional minutes per day;
- 18 required curriculum areas;
- four live 120-minute lessons per day;
- a 15-minute break after Lessons 1, 2, and 3 every day;
- 45 tracked break minutes per day;
- break time retained in the audit record but never credited toward the 40 instructional hours;
- separate final-examination control;
- controlled student identity, enrollment, attendance, instructional-time, learning-check, remediation, examination, completion, and LIAS record boundaries.

## Gate 1 — Foundation Controls

Status: **IMPLEMENTED IN SOURCE / DEDICATED CI WIRED**

Controls include:

- canonical provider identity;
- public Coming Soon state;
- payment and enrollment disabled;
- Florida Training website navigation;
- five-day / 40-hour course definition;
- all 18 curriculum areas in controlled order;
- learning-check or applied-assessment requirement for every area;
- separate certification-examination boundary;
- explicit distinction between course completion and Florida licensure;
- no state-approval claim before actual approval.

Primary gate: `scripts/florida-class-d-foundation-gate.mjs`

## Gate 2 — Regulated Student Record Model

Status: **IMPLEMENTED IN SOURCE / DEDICATED CI WIRED**

Primary model: `lib/florida-class-d-records.ts`

Controls include:

- authenticated learner identity;
- identity-verification status;
- Class D enrollment and cohort assignment;
- five-day attendance evidence;
- credited instructional-time ledger;
- 18-area progress ledger;
- learning-check attempts;
- remediation records;
- live-session and device-presence records;
- append-only audit contracts;
- explicit learner, instructor, school-admin, compliance-admin, and system roles;
- fail-closed examination eligibility.

Examination eligibility remains blocked unless identity is verified, at least 2,400 instructional minutes are credited, all 18 areas are complete, and required remediation is closed.

The Gate 2 source check was updated after a CI false-negative caused by stale handoff heading text. The handoff itself remained separate throughout; the automated check now validates this authoritative handoff title and its explicit separation from the commercial Academy workstream.

Primary gate: `scripts/florida-class-d-records-gate.mjs`

## Gate 3 — Durable Regulated Records and Administrative APIs

Status: **IMPLEMENTED IN SOURCE / DATABASE PROMOTION PENDING**

Primary artifacts:

- `supabase/migrations/20260813033000_fdacs_class_d_regulated_records.sql`
- `lib/florida-class-d-auth.ts`
- `lib/florida-class-d-persistence.ts`
- `app/api/florida-class-d/admin/attendance/route.ts`
- `app/api/florida-class-d/admin/instruction-time/route.ts`
- `app/api/florida-class-d/admin/inspection/route.ts`

Security controls include forced row-level security, revoked direct browser access, server-only service-role persistence, protected staff roles, no-store administrative APIs, idempotency, immutable correlation IDs, and append-only audit history.

No migration is considered production-applied until a separate database promotion and rollback gate is completed and verified.

Primary gate: `scripts/florida-class-d-persistence-gate.mjs`

## Gate 4 — Identity Verification and Regulated Enrollment

Status: **IMPLEMENTED IN SOURCE / PRODUCTION ACTIVATION DISABLED**

Primary artifacts:

- `supabase/migrations/20260813040000_fdacs_class_d_enrollment_workflow.sql`
- `lib/florida-class-d-enrollment-policy.ts`
- `app/api/florida-class-d/enrollment/route.ts`
- `app/api/florida-class-d/admin/enrollments/route.ts`
- `app/api/florida-class-d/admin/identity/route.ts`

Controls include controlled pre-enrollment, legal-name and date-of-birth capture, identity-verification state, versioned acknowledgments, cohort assignment, school/compliance review, and audit events for identity and enrollment transitions.

No identity-document binaries are stored by the current source implementation.

## Gate 5 — Live Instructor Classroom, Presence, Interaction, Breaks and Time Evidence

Status: **IMPLEMENTED IN SOURCE / PREVIOUS CI GREEN / PRODUCTION PROMOTION PENDING**

Primary artifacts:

- `lib/florida-class-d-live-policy.ts`
- `lib/florida-class-d-live-persistence.ts`
- `lib/florida-class-d-live-feed.ts`
- `lib/florida-class-d-live-reporting.ts`
- `supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql`
- `supabase/migrations/20260813044000_fdacs_class_d_daily_attendance_reconciliation.sql`
- `app/api/florida-class-d/live/route.ts`
- `app/api/florida-class-d/admin/live/route.ts`
- student live classroom UI;
- instructor live console UI.

Implemented controls include:

- live instructor-led teaching state;
- one active learner device lease;
- Clerk-authenticated session binding;
- browser-instance control;
- 60-second presence heartbeat;
- server-side connected, instructional, break, and uncredited time;
- daily and full-course cumulative time per learner;
- 15-minute breaks after Lessons 1, 2, and 3 every day;
- presence/security challenges before the two-hour interval;
- retry path and absent-for-review state after challenge failure;
- instructor review path;
- live learner questions;
- instructor answers;
- hand raise;
- instructor prompts;
- participation records;
- daily instructor attendance certification;
- database prevention of full-present certification without 480 verified instructional minutes and no unresolved challenge absence.

Break time is tracked as regulated attendance history but cannot become instructional credit.

Primary gate: `scripts/florida-class-d-live-gate.mjs`

## Gate 6 — Secure Embedded Live Video and Audio

Status: **IMPLEMENTED IN SOURCE / SOURCE VALIDATION WIRED / PRODUCTION ACCEPTANCE PENDING**

Provider architecture: Daily Prebuilt embedded through server-brokered private-room access.

Primary artifacts:

- `lib/florida-class-d-media.ts`
- `app/api/florida-class-d/media/route.ts`
- `app/api/florida-class-d/admin/media/route.ts`
- updated student `LiveClassroom.tsx`;
- updated instructor `InstructorLiveConsole.tsx`;
- updated `live-classroom.css`;
- `scripts/florida-class-d-media-gate.mjs`.

Gate 6 controls include:

- provider API key retained only in protected server configuration;
- separate `OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED` feature gate;
- provider selection locked to `daily` for this implementation;
- media cannot activate unless the underlying regulated Class D live-instruction gate is active;
- private Daily room per regulated live-session ID;
- expiring rooms;
- unique participant user IDs;
- provider-native chat and hand raise disabled so Obserra remains the authoritative interaction record;
- prejoin camera/microphone/browser check for instructors and students;
- short-lived room-scoped meeting tokens with ejection at expiration;
- learner media identity bound to regulated enrollment UUID;
- learner cannot screen share or administer the room;
- instructor receives owner privileges and screen-share capability;
- recording disabled by default;
- student and instructor video embedded directly inside Obserra;
- regulated student join and instructor start controls fail closed unless media is provisioned;
- Obserra remains the system of record for attendance and instructional-time evidence.

### Runtime configuration required later

Do not place these values in Git:

- `OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED=enabled`
- `OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER=daily`
- `OBSERRA_FDACS_DAILY_API_KEY=<secret>`

The media gate must remain disabled in production while the DS license is pending and until production acceptance is completed.

Primary gate: `scripts/florida-class-d-media-gate.mjs`

## Gate 7 — Temporary Regulatory Observer Access

Status: **IMPLEMENTED IN SOURCE / DEDICATED CI WIRED / PRODUCTION PROMOTION PENDING**

Purpose: provide a controlled way for an authorized regulator or other specifically approved observer to view a live Class D instructional session without receiving student-record, examination, credential, or administrative privileges.

Primary artifacts:

- `supabase/migrations/20260813045000_fdacs_class_d_observer_access.sql`
- `lib/florida-class-d-observer.ts`
- observer support in `lib/florida-class-d-media.ts`
- `app/api/florida-class-d/admin/observer/route.ts`
- `app/api/florida-class-d/observer/media/route.ts`
- `app/florida-security-training/admin/observer/[liveSessionId]/ObserverGrantManager.tsx`
- `app/florida-security-training/observer/ObserverClassroom.tsx`
- `scripts/florida-class-d-observer-gate.mjs`.

Gate 7 controls include:

- only school-admin or compliance-admin roles may create or revoke observer grants;
- each grant is bound to one regulated live-session UUID;
- grant duration is bounded to 15 through 240 minutes;
- grant secrets use cryptographically secure random material;
- plaintext grant secrets are not stored in the regulated database;
- only a SHA-256 token digest is persisted;
- access can be revoked before expiration;
- observer access and revocation are audited;
- observer links carry the secret in a URL fragment so it is not sent as part of the initial HTTP request path;
- the observer browser removes the fragment after reading it;
- grant exchange is server-side and returns a separate short-lived media token;
- observer media is view-only: no camera transmission, microphone transmission, screen sharing, room administration, provider chat, hand raise, or recording UI;
- the observer surface does not expose student identity records, attendance ledgers, exam content, answer keys, instructor credentials, school secrets, or administrative controls;
- the observer path remains dependent on the same fail-closed Class D live-media gate and therefore cannot activate while the regulated training environment remains disabled.

This mechanism is an inspection-readiness control. It does not itself assert that FDACS requires a particular proprietary observer technology or that source implementation equals agency acceptance.

Primary gate: `scripts/florida-class-d-observer-gate.mjs`

## Class DS LMS submission guide control

A separate controlled submission-guide record is maintained at:

`docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

That record governs the current submission-draft LMS guide and portal-screenshot exhibit package. Final filing must use the actual filed school information and controlled production screenshots where appropriate.

## Dedicated CI

Workflow: `.github/workflows/florida-class-d-lms-gates.yml`

The workflow now targets Gates 1 through 7 and runs:

- Florida regulated source verification;
- repository contract tests;
- lint;
- production Next.js build.

`npm run verify:florida-class-d` includes foundation, records, persistence, live-classroom, secure-media, and observer-access source gates.

CI success establishes source/build quality only. It does not establish regulatory approval, production database promotion, live-provider acceptance, or public launch authorization.

## Next controlled sequence

1. Validate Gate 7 dedicated CI and correct any source, type, lint, or build failure before advancing.
2. Add cohort scheduling and automatic creation of all 20 live lesson sessions.
3. Add structured instructor polls, learner responses, and participation analytics.
4. Add make-up-session workflow and time reconciliation.
5. Add lesson-screen timing enforcement for any text-based instructional screens where applicable.
6. Add formal end-of-session evidence reconciliation between Obserra presence records and media-provider session evidence as secondary corroboration only.
7. Complete examination-engine gate and protected exam-content boundary.
8. Complete completion, retest, LIAS queue, inspection center, certificate/document, and quality-management gates.
9. Promote regulated migrations through a controlled database-change gate with rollback and verification evidence.
10. Replace submission-draft portal screenshots with final controlled production captures before final filing or agency demonstration where appropriate.
11. Keep public payment, enrollment, regulated access, examination access, completion issuance, and LIAS execution disabled until every applicable regulatory and production gate is satisfied.

## Future Florida investigative-training workstream

A separate future workstream is recorded at:

`docs/florida-investigative-training/FUTURE-SITE-LMS-HANDOFF.md`

The owner reports pending Florida Class C Private Investigator and Class A Private Investigative Agency applications. These are recorded as pending only.

Do not divert the current Class D implementation. After Class D reaches its controlled completion point, perform a separate official-source regulatory design review before building any public license-qualifying investigative training. Class C/Class A status must never be assumed to create authority to issue a Class CC qualifying training certificate.

## Public repository security boundary

Never commit:

- real student names, dates of birth, IDs, addresses, phone numbers, payment information, or identity documents;
- protected examination questions, answer keys, or exam pools;
- FDACS/LIAS credentials, screenshots containing authenticated data, tokens, or session information;
- observer access tokens or observer links generated for real inspections;
- Daily API keys or meeting tokens;
- Supabase service-role keys;
- private instructor credential evidence;
- production secrets;
- investigative case or client data.

## Release discipline

Do not enable public checkout, enrollment, live regulated instruction, examination access, completion issuance, LIAS execution, or external observer access merely because source or CI passes.

Each capability requires its own validated production gate and applicable regulatory authorization.
