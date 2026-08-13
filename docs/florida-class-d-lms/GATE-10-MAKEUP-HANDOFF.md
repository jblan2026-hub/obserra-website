# Florida Class D Gate 10 Handoff — Make-Up Training and Time Reconciliation

## Scope

This controlled handoff governs the regulated Florida Class D make-up-training increment for **Obserra Executive Protection & Intelligence LLC**. It remains separate from the commercial Academy course-production workstream.

Public state remains `COMING SOON · LMS IN PROGRESS`. The owner reports an active Class DI instructor license and a pending Class DS school/training facility application. Production make-up delivery and all other regulated launch functions remain fail closed until the applicable regulatory and production gates are satisfied.

## Current Gate 10 status

Status: **FOUNDATION IMPLEMENTED IN SOURCE / CONTRACT TEST GREEN / INSTRUCTIONAL-CREDIT MUTATION INTENTIONALLY LOCKED**

The current implementation establishes assignment, student/instructor communication, protected record storage, and reconciliation-preview controls for instructional time missed during the live Class D course. It does not yet mutate credited instructional time and it does not yet deliver recorded instruction.

Primary artifacts:

- `supabase/migrations/20260813052000_fdacs_class_d_makeup_records.sql`
- `supabase/migrations/20260813052100_fdacs_class_d_makeup_access.sql`
- `supabase/migrations/20260813052200_fdacs_class_d_makeup_constraints.sql`
- `lib/florida-class-d-makeup.ts`
- `app/api/florida-class-d/makeup/route.ts`
- `app/api/florida-class-d/admin/makeup/route.ts`
- `app/florida-security-training/makeup/page.tsx`
- `app/florida-security-training/makeup/MakeupPortal.tsx`
- `app/florida-security-training/admin/makeup/page.tsx`
- `app/florida-security-training/admin/makeup/MakeupManager.tsx`
- `scripts/florida-class-d-makeup-gate.mjs`
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
- original live-attendance evidence is not rewritten by the make-up service;
- authenticated student portal for assigned make-up records and instructor Q&A;
- server-protected administrative route and separate administration console source for assignment, question response, and reconciliation preview;
- recorded playback remains explicitly locked;
- instructional-credit certification remains explicitly locked with `FDACS_MAKEUP_CERTIFICATION_TRANSACTION_PENDING`.

## Regulatory design boundary

Recorded make-up delivery remains capped at **600 minutes** in the LMS design. The protected recorded-playback experience will not activate until a later gate provides its timing, participation, evidence, and instructor-question controls. The system preserves the original live attendance record and treats make-up as a separate auditable recovery record.

The current reconciliation service will calculate the permissible ceiling but will not write instructional credit until an atomic database certification transaction is available. This prevents a non-transactional application-layer race from creating excess daily, course, or recorded make-up credit.

## Verification evidence

The latest dedicated Florida Class D workflow completed source verification, repository contract tests, lint, and the production Next.js build successfully after the Gate 10 foundation was added. Gate 10 is executed through `test/florida-class-d-makeup-gate.test.mjs` as part of the repository contract-test step while the older aggregate npm script still enumerates Gates 1 through 9.

CI success establishes source/build quality only. It does not establish FDACS approval, production database promotion, secure recorded-playback acceptance, or public launch authorization.

## Next controlled sequence

1. Add the atomic make-up certification transaction so evidence-reviewed minutes can be credited without race conditions.
2. Wire the administrative console directly into the protected make-up administration page after the certification boundary is complete.
3. Build protected recorded make-up playback with screen-time, participation, question, and completion evidence controls.
4. Add end-of-session evidence reconciliation between Obserra presence records and media-provider evidence as secondary corroboration only.
5. Continue to the protected 170-question final-examination engine and examination-content boundary.
6. Keep public payment, regulated training access, final examination, completion issuance, and LIAS execution disabled until every applicable regulatory and production gate is satisfied.

## Production boundary

Source implementation and CI do not constitute FDACS approval or production authorization. No public payment, regulated access, final examination, completion issuance, or LIAS execution is enabled by this gate.
