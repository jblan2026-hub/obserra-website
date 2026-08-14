# Florida Class D LMS Gate 18 Handoff

## Scope

Gate 18 turns the post-completion records created by Gate 17 into protected learner-facing documents that can actually be opened and printed from the LMS while preserving the no-certificate-before-exam-pass rule.

This gate does not create or imitate the official FDACS-16103. The official state certificate remains a LIAS-generated PDF accepted into protected storage only after LIAS confirmation.

## Completion boundary

A supplemental Obserra certificate is created only from an authorized successful-completion record. That record already requires the five-day/2,400-minute instructional record, all required curriculum/checks, a preserved passing 170-question final examination at 128/170 or better, closed remediation/completion blockers, and compliance approval.

The automatic completion-document trigger independently verifies the preserved exam attempt is `passed`, `passed = true`, and score is at least 128 before it creates either the supplemental certificate record or the application-handoff record.

Therefore, a learner who has completed 40 instructional hours but failed or has not yet passed the final examination receives no completion certificate.

## Implemented presentation controls

1. Supplemental Obserra completion-certificate and Class D application-handoff records are created automatically only after successful-completion approval.
2. The protected render payload contains the learner's verified legal name and controlled completion facts.
3. Learner access remains Clerk authenticated and bound to the learner's completed enrollment.
4. Generated Obserra documents are rendered server-side from protected `render_payload`; the browser does not receive a general document-template editor or raw database query capability.
5. Dynamic values are HTML escaped before rendering.
6. The supplemental certificate revalidates 40 instructional hours and a passing exam score before rendering.
7. The supplemental certificate displays verified legal name, course title, instructional hours, exam score, completion date, and a unique Obserra certificate ID.
8. The certificate prominently states that it is a supplemental school record, does not replace FDACS-16103, and does not itself issue a Florida Class D license.
9. The application-handoff document identifies FDACS-16103 as the official training record and explains that the Class D application is completed through the official FDACS process.
10. Generated documents are delivered with no-store, noindex, nosniff, frame-denial, referrer, and restrictive content-security-policy headers.
11. Binary response bodies use standards-compatible `Blob` objects to satisfy the production Next.js/TypeScript request/response body contracts.
12. Official LIAS-generated FDACS-16103 downloads continue to use private object storage plus SHA-256 integrity validation.

## Primary artifacts

- `supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql`
- `lib/florida-class-d-completion-documents.ts`
- `app/api/florida-class-d/completion-documents/route.ts`
- `app/florida-security-training/completion/page.tsx`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md`
- `scripts/florida-class-d-certificate-presentation-gate.mjs`

## Screenshot evidence requirement

The Class DS submission-guide revision must include development-preview screenshots showing:

- a learner who has reached the 40-hour instructional requirement but is still certificate-ineligible because the exam has not been passed;
- a successfully completed learner's supplemental Obserra Course Completion Certificate;
- the learner Completion Documents portal showing the official FDACS-16103 separately from the supplemental Obserra record;
- the staff LIAS workflow used before official FDACS-16103 release.

Final controlled production screenshots must replace development previews when production evidence is appropriate.

## Release boundary

Gate 18 source implementation does not authorize regulated production use. Completion-document runtime flags, production data-store migration, private storage, final DS authorization, LIAS operations, and production acceptance remain separate launch controls.
