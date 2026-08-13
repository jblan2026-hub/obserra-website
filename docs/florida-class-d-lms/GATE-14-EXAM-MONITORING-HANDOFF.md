# Florida Class D Gate 14 Handoff

## Purpose

Gate 14 adds protected active-examination monitoring to the Florida Class D LMS. It extends the Gate 12 final examination and Gate 13 protected examination-bank administration without changing the fail-closed production launch boundary.

## Implemented source controls

- 30-second student examination monitoring heartbeat.
- Examination attempt remains bound to the authenticated Clerk session and browser instance recorded when the attempt starts.
- Durable monitoring-event ledger with heartbeat, visibility, mismatch, interruption, resume, and invalidation events.
- Browser visibility loss moves an active attempt to an interrupted state.
- Answering and submission fail closed while monitoring is not active.
- Interrupted attempts require an authorized school/compliance administrator to document a reason and explicitly authorize resume.
- Staff can invalidate an active attempt only through a protected server route with a documented reason and append-only audit evidence.
- Staff monitoring console displays active attempts, current question number, monitoring state, last heartbeat, stale-heartbeat indicator, interruption time, and interruption reason.
- Direct browser access to regulated monitoring tables and RPCs is revoked. Protected server/service-role execution remains the database boundary.

## Security and privacy boundary

The public repository contains only the monitoring architecture and source controls. It must not contain real student records, real examination content, answer keys, DS/DI credentials, private provider credentials, or production evidence. Examination-bank content remains protected outside public GitHub.

## Production boundary

Gate 14 source implementation does not activate regulated examination delivery. Production remains fail closed until the Class DS authorization is active, protected runtime configuration is complete, the approved examination bank has been promoted through the controlled Gate 13 lifecycle, migrations are promoted to the production datastore, and final regulatory/security acceptance is complete.

## Next controlled increment

Gate 15 should implement examination retest and remediation governance without inventing a wait period or retest-count rule that has not been verified from current Florida requirements. It should preserve the failed attempt, create an explicit remediation/retest eligibility record, require administrator authorization, prevent silent replacement of prior scores, and maintain inspection-ready history.
