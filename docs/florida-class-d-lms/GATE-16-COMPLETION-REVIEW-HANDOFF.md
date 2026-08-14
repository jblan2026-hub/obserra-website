# Florida Class D Gate 16 Handoff

## Purpose

Gate 16 creates the controlled successful-completion review boundary for the Florida Class D LMS. It reconciles regulated evidence after instruction and examination, requires compliance-administrator approval, creates an immutable completion record, and prepares a manual FDACS/LIAS reporting queue without automating the state portal.

## Implemented source controls

- Completion is never created merely because the learner reaches the end of the LMS.
- Verified learner identity is required.
- Five training days must each reconcile to at least 480 credited instructional minutes using live instructional presence plus certified make-up credit.
- Total verified instructional credit must be at least 2,400 minutes.
- All 18 controlled module progress records must be complete and their learning checks passed.
- A preserved examination attempt with a passing score of at least 128 must exist.
- No examination attempt may remain active or interrupted.
- No unresolved live-presence security state may remain in `absent_challenge`.
- No open remediation record may remain.
- An existing non-voided completion record blocks duplicate completion.
- Compliance-administrator approval requires a documented review note and correlation ID.
- The approval transaction snapshots the readiness evidence, creates the successful-completion record, moves the enrollment to `completed`, and prepares one LIAS queue record.
- Completion and LIAS preparation create append-only audit events.
- Completion records, completion reviews, and LIAS queue records are forced-RLS, service-role-only datastore objects.

## LIAS boundary

Gate 16 is preparation only. The system records a manual reporting queue and does not submit to, scrape, or automate the FDACS LIAS browser portal. A later gate may support status tracking and authorized human confirmation, but direct state-system automation remains prohibited unless a supported FDACS integration method is available and approved.

## Licensing boundary

Course completion is not represented as issuance of a Florida Class D license. The successful-completion record is a school training record used for the controlled post-course workflow.

## Production boundary

Production remains fail closed. The completion-review service requires the protected `OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED` flag and protected service-role datastore access. Source implementation does not equal regulatory approval, production migration promotion, or authority to issue a license.

## Next controlled increment

Gate 17 should implement inspection-ready completion exports and controlled LIAS queue status management, including staff-recorded submission/confirmation references and exception handling, without direct browser automation.
