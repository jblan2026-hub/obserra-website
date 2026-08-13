# Gate 24 Instructional Text-Screen Timing Handoff

Snapshot: 2026-08-13

## Purpose

Gate 24 closes the online instructional text-screen timing control for the Florida Class D LMS. The control enforces the minimum display time derived from the established policy of 60 seconds per 50 words, prorated by actual word count, while preserving authenticated learner evidence and a required live instructor discussion confirmation.

## Accepted source state

**IMPLEMENTED IN SOURCE / GATES 1-24 WORKFLOW GREEN / PRODUCTION ACTIVATION DISABLED**

The accepted Gate 24 source head is `cc6470b2466f68578d63884f646462a2ad65ac0c`.

The dedicated Florida Class D LMS workflow completed successfully on this commit. The successful cycle includes the existing regulated source gates, Gate 22 runtime-readiness verification, Gate 23 acceptance verification, the Gate 24 instructional text-screen verifier, repository contract tests, lint, and the production Next.js build.

This is source/build evidence only. It is not FDACS approval, production database promotion, production runtime activation, or launch authorization.

## Implemented control set

Primary Gate 24 artifacts include:

- `supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql`
- `lib/florida-class-d-text-screen.ts`
- `app/api/florida-class-d/live/route.ts`
- `app/api/florida-class-d/admin/live/route.ts`
- `app/florida-security-training/live/[liveSessionId]/InstructionalTextScreen.tsx`
- `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`
- `app/florida-security-training/admin/live/[liveSessionId]/InstructionalTextScreenControl.tsx`
- `app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx`
- `scripts/florida-class-d-text-screen-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

The database creates protected instructional text-screen and learner-view records and server-controlled functions for opening a screen, beginning an authenticated learner view, recording active-view timing heartbeats, acknowledging a screen only after the minimum observed time is met, and closing a screen only after a documented instructor discussion confirmation.

The minimum duration is calculated by controlled server/database logic from the instructional text word count using the 60-seconds-per-50-words policy. The learner cannot supply or shorten the authoritative duration.

Learner timing is tied to the authenticated student and active regulated device lease. The learner UI sends timing heartbeats only while the browser tab is visible. Hidden-tab time is not intentionally submitted as credited viewing time. Returning to the visible tab re-establishes the regulated timing path without converting hidden-tab elapsed time into client-authoritative credit.

The learner acknowledgment control remains unavailable until the server-observed requirement is met. The learner UI displays the authoritative minimum, observed server time, and remaining time. Acknowledgment is persisted through the protected API rather than treated as a client-only state.

Only one instructional text screen may be open for a live session at a time. Opening is restricted to an active live instructional segment and cannot occur during a break. The instructor console can create the instructional text, review aggregate learner timing and acknowledgment progress, document the required live discussion, and request controlled closure.

The database close function requires a discussion confirmation note before closure. Closing the screen does not fabricate missing learner acknowledgments. Incomplete learner timing or acknowledgment evidence remains available for review.

The new regulated tables use forced row-level security and direct public, anonymous, and authenticated browser database access is revoked. The protected server path uses explicit Supabase runtime configuration and no hardcoded project fallback for this service.

## Gate 24 verifier

`scripts/florida-class-d-text-screen-gate.mjs` validates the controlled migration, protected service/API path, learner timing surface, learner acknowledgment boundary, instructor discussion confirmation, and live-class integration. The dedicated GitHub Actions workflow runs this verifier as a named Gate 24 step.

The successful workflow on `cc6470b2466f68578d63884f646462a2ad65ac0c` establishes the accepted Gate 24 source/build baseline.

## Audit evidence requirement

The next controlled DS LMS submission-guide revision must include an accurately labeled development, staging, UAT, or authorized production screenshot showing the implemented instructional text-screen workflow. At minimum the evidence should show the instructional text title/body, word count, server-calculated minimum duration, server-observed learner time, remaining time or requirement-met state, learner acknowledgment boundary, and instructor discussion/closure control.

The screenshot must use demonstration or synthetic data unless an authorized production evidence procedure permits otherwise. It must not expose learner PII, identity documents, license numbers, credentials, provider secrets, protected exam content, private infrastructure identifiers, or service-role values.

## No mockups or placeholders

No mockup, placeholder, client-only timer, simulated acknowledgment, fabricated instructor discussion, or fake success state counts as Gate 24 evidence. The accepted implementation uses server/database timing evidence and persists the instructor discussion boundary.

## Production boundary

No production database migration has been applied by Gate 24 work. No production learner text-screen evidence has been created through this source gate. Public paid enrollment, regulated learner access, production live instruction, examination activation, completion/certificate release, LIAS execution, and other regulated launch functions remain fail closed until the applicable authorization and production gates pass.

## Completion and certificate boundary

Gate 24 does not change the successful-completion rule. Forty instructional hours alone do not earn a completion certificate. Successful completion still requires the controlled five-day/2,400-minute record, all required curriculum activities/checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance approval. The official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra.

## Next controlled sequence

1. Preserve `cc6470b2466f68578d63884f646462a2ad65ac0c` as the current green Gate 24 source/build evidence baseline.
2. Synchronize `HANDOFF.md`, `LATEST-HANDOFF.md`, this Gate 24 handoff, the DS submission/audit control, and PR #56 to the accepted state.
3. Execute real non-production acceptance using synthetic identities only after the applicable non-production database and runtime configuration is established.
4. Remove remaining hardcoded regulated Supabase project fallbacks from other server modules and require explicit protected runtime configuration before production activation.
5. Finalize the Division-approved examination-bank boundary before production examination activation.
6. Revise the controlled DS submission-guide DOCX/PDF with screenshots from implemented screens.
7. Keep public payment/enrollment and all regulated production functions disabled until applicable regulatory authorization, production acceptance, and owner approval are complete.

## Restart instruction

Gate 24 is implemented and green in source/build validation at `cc6470b2466f68578d63884f646462a2ad65ac0c`. Continue from controlled non-production acceptance preparation and regulated runtime security hardening. Do not apply production migrations from source-gate work, do not expose secrets or license numbers, do not treat source validation as FDACS approval, and do not issue a completion certificate for hours alone.