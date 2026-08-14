# Florida Class D Gate 9 Handoff — Structured Live Polls and Participation Analytics

## Scope

This controlled handoff supplements `docs/florida-class-d-lms/HANDOFF.md` for the regulated Florida Class D school/LMS workstream of **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It remains separate from the commercial Obserra Academy Course 1 through Course N / LearnWorlds course-production handoffs.

Public state remains `COMING SOON · LMS IN PROGRESS`. The owner reports an active Florida Class DI instructor license and a pending Florida Class DS school/training facility application. Regulated live instruction, production cohort scheduling, paid enrollment, final-examination access, completion issuance, LIAS execution, and public launch remain fail closed until the applicable regulatory and production gates are satisfied.

## Gate 9 — Structured Live Polls and Participation Analytics

Status: **IMPLEMENTED IN SOURCE / DEDICATED CI WIRED / PRODUCTION PROMOTION PENDING**

Purpose: add instructor-controlled live knowledge polling and auditable participation evidence without weakening the independent attendance, instructional-time, presence, identity, and examination controls established in Gates 1 through 8.

Primary artifacts:

- `supabase/migrations/20260813051000_fdacs_class_d_live_polls.sql`
- `lib/florida-class-d-polls.ts`
- `app/api/florida-class-d/live/route.ts`
- `app/api/florida-class-d/admin/live/route.ts`
- `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`
- `app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx`
- `app/florida-security-training/live-classroom.css`
- `scripts/florida-class-d-polls-gate.mjs`

## Durable poll records

The source introduces controlled regulated records for:

- live poll definition;
- live-session binding;
- question text;
- two through six answer options;
- optional instructor-only correct-answer index;
- open/closed poll state;
- poll open/close timestamps;
- per-student poll response;
- selected option index;
- response timing in milliseconds;
- scored correctness when the instructor defines a correct answer;
- correlation identifiers and audit history.

Each live poll is bound to a regulated live-session UUID. A student is limited to one response per poll. Database controls prevent more than one open poll for the same live session at a time.

## Student confidentiality boundary

The student live-class API returns only the question, response options, open state, and the student's own prior-response state needed to prevent duplicate submission. It does **not** return the correct-answer index or correctness/scoring state while the learner is taking the poll.

Student poll responses are accepted only from an authenticated learner enrolled in the cohort associated with the live session. The response is written through the controlled server persistence boundary and is also represented in the regulated live-interaction evidence stream.

## Instructor controls

Authorized instructional staff can:

- open a structured poll while the regulated lesson is live;
- define two through six response options;
- optionally identify a correct response for instructional feedback/analytics;
- see response counts;
- close the poll;
- review poll history;
- review per-student participation evidence.

Poll opening is rejected if the live session is not actively in the live state or another poll is already open for that live session.

## Participation analytics

The instructor roster now supports per-student participation analytics including:

- student-question count;
- hand-raise count;
- poll-response count;
- scored poll-response count;
- correct poll-response count;
- polls presented;
- poll response rate.

These analytics are instructional and participation evidence only. They do not independently grant attendance credit, instructional-time credit, module completion, examination eligibility, or final course completion.

## Security and privacy controls

- Poll tables use row-level security and forced row-level security.
- Direct browser database access by `public`, `anon`, and `authenticated` roles is revoked.
- Persistence remains server-side through protected service-role configuration.
- Correct-answer data is withheld from the student live-class payload.
- Audit events record poll opening, response submission, and closure.
- Public repository code must never contain protected final-examination questions, final-examination answer keys, real student data, or production credentials.

## Verification boundary

Gate 9 source validation checks the database controls, service boundary, student-safe response payload, instructor poll controls, participation analytics, student live-poll UI, instructor console, and this controlled handoff.

Source/CI success does not establish FDACS approval, production database promotion, live-provider acceptance, or authorization to conduct public regulated training.

## Next controlled sequence

1. Obtain a green dedicated Gates 1 through 9 CI run, including source gates, repository contract tests, lint, and production Next.js build.
2. Build controlled make-up-session workflow and time reconciliation.
3. Add lesson-screen timing enforcement for text-based instructional screens where applicable.
4. Add end-of-session reconciliation between Obserra attendance/presence evidence and media-provider session evidence as secondary corroboration only.
5. Build the protected final examination engine and examination-content boundary.
6. Build completion, retest, FDACS/LIAS queue, inspection-center, certificate/document, and quality-management gates.
7. Promote regulated database migrations only through a controlled production database-change gate with rollback and verification evidence.
8. Replace submission-draft portal screenshots with final controlled production captures before final filing or agency demonstration where appropriate.
