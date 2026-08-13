# Gate 24 Instructional Text-Screen Timing Handoff

Snapshot: 2026-08-13

## Purpose

Gate 24 closes the remaining online instructional text-screen timing control for the Florida Class D LMS. The control is intended to enforce the minimum display time derived from the established policy of 60 seconds per 50 words, prorated by word count, while preserving authenticated learner evidence and instructor discussion before the text screen is closed.

## Current implemented source

The current branch includes `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`.

That migration creates protected instructional text-screen and learner-view records and database functions for opening a text screen, beginning an authenticated learner view, recording active-view timing heartbeats, acknowledging the screen only after the minimum observed time is met, and closing the screen only with an instructor discussion confirmation note.

The migration computes the minimum server-side from the instructional text word count using the same 60-seconds-per-50-words policy already declared in `lib/florida-class-d-live-policy.ts`.

Learner timing is tied to an active authenticated device lease. View timing heartbeats require the same learner identity, live session, and unreleased device lease with a current live-class heartbeat. Each text-screen view retains observed seconds, requirement-met time, and acknowledgment time as regulated evidence.

Only one instructional text screen may be open for a live session at a time. Opening is restricted to active live instruction, not break state. Closing requires an instructor discussion confirmation note and records an audit event with view and acknowledgment counts.

The new tables have forced row-level security. Direct public, anonymous, and authenticated browser database access is revoked. The runtime service role receives only the table and function permissions required by the protected server path.

## Validation evidence

Commit `1687ad60fd106e6a0a8edba18a54f6bfe9e5e5da` added the Gate 24 database control. The existing dedicated Florida Class D workflow completed successfully on that commit, including the current Gates 1-23 source verification, repository contract tests, lint, and production Next.js build.

That green workflow proves compatibility of the new migration with the existing source/build gates. It does not prove end-to-end Gate 24 operation because the server service, protected APIs, learner text-screen surface, instructor control surface, and Gate 24-specific verifier are not yet complete.

## Remaining Gate 24 implementation

Gate 24 is not accepted or operationally complete until all of the following are implemented and revalidated:

1. Protected server-side text-screen service using explicit runtime Supabase configuration with no hardcoded project fallback.
2. Authenticated learner API for active screen retrieval, timed view start, active/visible timing heartbeat, and acknowledgment.
3. Instructor/admin API for opening a controlled instructional text screen, viewing learner timing/acknowledgment evidence, and closing only after instructor discussion confirmation.
4. Learner live-classroom UI that displays the instructional text, visible countdown/progress, and acknowledgment only after the server-enforced minimum is met.
5. Instructor live-console control for creating the instructional text screen and recording discussion confirmation.
6. Gate 24 source verifier and dedicated CI coverage.
7. Synchronization of `HANDOFF.md`, `LATEST-HANDOFF.md`, this handoff, PR #56, and the DS submission/audit guide control after the complete implementation passes CI.

## No mockups or placeholders

No mockup, placeholder, client-only timer, simulated acknowledgment, or fabricated evidence may be treated as Gate 24 functionality. The learner timer must be backed by server/database evidence, and the instructor discussion confirmation must be persisted before a controlled text screen can be closed.

## Production boundary

No production migration has been applied. No production learner text-screen evidence has been created. Paid enrollment and regulated production functions remain fail closed. Gate 24 source/build validation must not be represented as FDACS approval or production acceptance.

## Restart instruction

Continue from `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`. Build the protected server service and APIs first, then integrate the real learner and instructor UI, add source verification, synchronize all audit handoffs, and run the full dedicated Florida Class D workflow before accepting Gate 24.
