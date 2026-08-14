# Florida Class D Gate 10 Handoff — Make-Up Training and Time Reconciliation

## Scope

This controlled handoff governs the regulated Florida Class D make-up-training increment for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It remains separate from the commercial Academy course-production workstream.

Public state remains `COMING SOON · LMS IN PROGRESS`. The owner reports an active Class DI instructor license and a pending Class DS school/training facility application. Production make-up delivery and all other regulated launch functions remain fail closed until the applicable regulatory and production gates are satisfied.

## Current Gate 10 status

Status: **ATOMIC CERTIFICATION IMPLEMENTED IN SOURCE / DEDICATED SOURCE GATES WIRED / PRODUCTION PROMOTION PENDING**

The implementation now establishes assignment, student/instructor communication, protected record storage, reconciliation preview, and an atomic database certification transaction for evidence-reviewed make-up instructional credit. Protected recorded playback remains intentionally locked for the next controlled increment.

Primary artifacts:

- `supabase/migrations/20260813052000_fdacs_class_d_makeup_records.sql`
- `supabase/migrations/20260813052100_fdacs_class_d_makeup_access.sql`
- `supabase/migrations/20260813052200_fdacs_class_d_makeup_constraints.sql`
- `supabase/migrations/20260813052400_fdacs_class_d_makeup_certification.sql`
- `supabase/migrations/20260813052500_fdacs_class_d_makeup_certification_security.sql`
- `lib/florida-class-d-makeup.ts`
- `lib/florida-class-d-makeup-certification.ts`
- `app/api/florida-class-d/makeup/route.ts`
- `app/api/florida-class-d/admin/makeup/route.ts`
- `app/florida-security-training/makeup/page.tsx`
- `app/florida-security-training/makeup/MakeupPortal.tsx`
- `app/florida-security-training/admin/makeup/page.tsx`
- `app/florida-security-training/admin/makeup/MakeupManager.tsx`
- `scripts/florida-class-d-makeup-gate.mjs`
- `scripts/florida-class-d-makeup-certification-gate.mjs`
- `test/florida-class-d-makeup-gate.test.mjs`

## Implemented controls

- dedicated make-up assignment records tied to enrollment, instructional day, module, and optional source live session;
- separate `live_makeup` and `recorded_makeup` delivery classifications;
- recorded make-up assignment ceiling of **600 minutes per student**;
- second post-insert ceiling check that cancels a concurrently created recorded assignment if it would leave the student above the controlled ceiling;
- student question records tied to the make-up assignment;
- instructor/admin response workflow with audit events;
- server-only service-role persistence boundary;
- row-level security enabled and forced on make-up records;
- direct `public`, `anon`, and `authenticated` table access revoked;
- independent `OBSERRA_FDACS_CLASS_D_MAKEUP_ENABLED` feature gate;
- Class DS status and protected Class DI/Class DS configuration required before the workflow can activate;
- reconciliation preview calculates live-day minutes, prior certified make-up, remaining daily deficit, course deficit, recorded make-up balance, and maximum currently certifiable minutes;
- atomic certification locks the assignment row before calculating and writing make-up credit;
- evidence reference plus ordered evidence start/end timestamps are required before certification;
- evidence duration must be at least as long as the requested certified instructional minutes;
- daily credit cannot exceed 480 instructional minutes;
- total course credit cannot exceed 2,400 instructional minutes;
- recorded make-up credit cannot exceed 600 minutes;
- certification creates a separate `instructor_attested_makeup` instruction-time entry and separate `made_up` attendance evidence;
- original live-attendance evidence is not rewritten;
- certification writes an append-only audit event with assignment, attendance, and instruction-time references;
- certification RPC execution is security-definer, direct public/browser execution is revoked, and execute permission is limited to the Supabase service role;
- administrative certification requires staff authorization, idempotency, correlation ID, and controlled evidence fields;
- authenticated student portal remains available for assigned make-up records and instructor Q&A;
- administrative console now exposes assignment, question response, reconciliation preview, and controlled certification inputs;
- recorded playback remains explicitly locked pending its protected delivery subgate.

## Regulatory design boundary

Recorded make-up delivery remains capped at **600 minutes** in the LMS design. The protected recorded-playback experience will not activate until the next gate provides its timing, participation, evidence, and instructor-question controls. The system preserves the original live attendance record and treats make-up as a separate auditable recovery record.

The atomic certification transaction is intentionally database-enforced rather than application-only. This prevents concurrent application requests from creating excess daily, course, or recorded make-up credit and ensures the assignment update, instruction-time record, attendance evidence, and audit event are committed as one controlled transaction.

## Verification boundary

`npm run verify:florida-class-d` now includes both the Gate 10 make-up foundation gate and the Gate 10 certification-security gate. The dedicated workflow is labeled **Gates 1-10 and website compatibility** and runs regulated source verification, repository contract tests, lint, and the production Next.js build.

CI success establishes source/build quality only. It does not establish FDACS approval, production database promotion, secure recorded-playback acceptance, or public launch authorization.

## Next controlled sequence

1. Validate the complete Gate 10 source/test/lint/build cycle after the atomic certification changes.
2. Build protected recorded make-up playback with timing, participation, question, completion, and evidence controls.
3. Add end-of-session evidence reconciliation between Obserra presence records and media-provider evidence as secondary corroboration only.
4. Continue to the protected 170-question final-examination engine and examination-content boundary.
5. Keep public payment, regulated training access, final examination, completion issuance, and LIAS execution disabled until every applicable regulatory and production gate is satisfied.

## Production boundary

Source implementation and CI do not constitute FDACS approval or production authorization. No public payment, regulated access, final examination, completion issuance, or LIAS execution is enabled by this gate.
