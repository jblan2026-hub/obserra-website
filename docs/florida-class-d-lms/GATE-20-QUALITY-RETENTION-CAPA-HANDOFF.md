# Florida Class D LMS Gate 20 Handoff

## Scope

Gate 20 adds school quality-management, exception/CAPA, and controlled record-retention review infrastructure to the Florida Class D LMS workstream.

## Implemented controls

- Protected quality cases for incidents, complaints, attendance exceptions, exam exceptions, LIAS exceptions, security events, and quality findings.
- Severity classification: low, medium, high, critical.
- Controlled workflow states: open, investigating, action required, verification, closed, voided.
- Root-cause, corrective-action, preventive-action, assignment, due-date, verification, and closure fields.
- Append-only quality-case event history.
- Audit events for case opening/progression.
- Service-role-only database RPCs for opening/progressing quality cases.
- Staff-only quality console for school-admin and compliance-admin roles.
- Quality dashboard counts for open cases, open critical cases, and retention reviews needing attention.
- Separate retention dates for the two-year regulatory minimum and the school's three-year operational retention policy.
- Legal-hold flag that blocks disposition eligibility.
- Controlled retention-review record tied to the regulated enrollment/completion record.
- Human authorization remains required before actual record disposition; Gate 20 does not implement automated deletion.
- Quality-management actions remain behind `OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED` and therefore fail closed by default.

## Primary artifacts

- `supabase/migrations/20260813083000_fdacs_class_d_quality_retention.sql`
- `lib/florida-class-d-quality.ts`
- `app/api/florida-class-d/admin/quality/route.ts`
- `app/florida-security-training/admin/quality/page.tsx`
- `app/florida-security-training/admin/quality/QualityConsole.tsx`
- `scripts/florida-class-d-quality-gate.mjs`

## Retention boundary

The source explicitly distinguishes the regulatory minimum retention period from the school's longer operational retention policy. The two-year minimum is not silently replaced with the three-year operational target. Legal holds block disposition. Actual disposition remains a later separately authorized action.

## DS submission-guide evidence

The next Class DS LMS submission-guide revision should include a controlled development-preview screenshot of the Quality, CAPA & Record Retention console showing quality-case tracking, corrective-action workflow, retention-review dates, and legal-hold status using demonstration data only.

## Release boundary

Gate 20 does not activate public enrollment, instruction, exams, completion, certificates, or LIAS. Production use requires CI acceptance, controlled database migration, protected runtime configuration, staff role validation, operating-procedure acceptance, and applicable regulatory authorization.
