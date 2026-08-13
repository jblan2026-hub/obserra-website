# Florida Class D Gate 13 Handoff

## Purpose

Gate 13 adds the protected examination-bank administration layer for the Florida Class D regulated LMS. It does not add production examination questions to the public repository and does not claim FDACS approval.

## Regulatory and release boundary

The public website remains `COMING SOON · LMS IN PROGRESS`. The Class DS school application remains a launch dependency. Final-examination delivery remains fail closed until the regulated runtime gates are deliberately enabled, the protected datastore is promoted, and a specific examination bank has been externally accepted/approved by the Division and then recorded as `division_approved` in the protected system.

## Implemented controls

- Protected server-only exam-bank import service.
- Independent `OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED` feature gate.
- Compliance-admin authorization for import and status-changing actions.
- Exact 170-question import validation.
- Coverage requirement across all 18 controlled Class D subject areas.
- No more than 50 percent true/false questions within any subject area.
- Validation of answer choice structure and correct-choice references.
- SHA-256 source digest for duplicate detection and submission traceability.
- Durable protected import audit record.
- Forced RLS and direct browser-role revocation on exam-bank import records.
- Database validation before a draft bank may be marked Division submitted.
- Division submission state must precede approval state.
- Division approval reference is required before `division_approved` may be recorded.
- When a new approved bank is promoted, the prior approved Class D bank is retired.
- Service-role-only execution for exam-bank promotion RPCs.
- Production questions and answer keys remain excluded from public GitHub source.

## Files

- `supabase/migrations/20260813061000_fdacs_class_d_exam_bank_admin.sql`
- `lib/florida-class-d-exam-admin.ts`
- `app/api/florida-class-d/admin/exam-bank/route.ts`
- `scripts/florida-class-d-exam-admin-gate.mjs`

## Protected import contract

The production import payload is expected to contain a version, a school-controlled source reference, and exactly 170 question objects. Each question carries a controlled subject code, question type, prompt, answer choices, protected correct-choice key, and optional rationale. That payload is transmitted only through the authenticated compliance-administration route and written directly to the protected datastore. The source file containing the actual approved examination must not be committed to this public repository.

## Approval state model

1. `draft`: imported and structurally validated inside Obserra.
2. `division_submitted`: school records that this exact bank version has been submitted externally for Division review.
3. `division_approved`: school records the external approval/reference after approval actually exists.
4. `retired`: prior or superseded bank that can no longer be selected for new student attempts.

The system does not self-approve an examination bank and does not infer approval from a successful source validation.

## Next controlled increment

Gate 14 should implement active-attempt monitoring and security administration: one-device enforcement during examination, heartbeat/presence evidence, controlled resume after interruption, administrative invalidation with reason and audit trail, and examiner monitoring views. Retest/remediation policy should remain fail closed until current FDACS requirements and the school's approved policy are mapped without inventing attempt-count or waiting-period rules.
