# Florida Class D LMS Gate 17 Handoff

## Scope

Gate 17 implements post-course FDACS/LIAS workflow management, official training-certificate fulfillment, protected student document delivery, student completion/certification standards, and inspection-ready post-course records. This gate does not automate, scrape, or impersonate the FDACS LIAS portal.

## Regulatory and student-document boundary

- Successful course completion does not itself issue a Florida Class D license.
- **Forty instructional hours alone do not constitute successful course completion and do not authorize certificate issuance.**
- The learner must complete all required course activities, pass the separate 170-question examination with at least 128 correct answers, clear required completion-blocking issues/remediation, and receive authorized school completion approval.
- A learner who reaches 40 instructional hours but has not passed the final examination receives no completion certificate and remains in the controlled remediation/retest workflow.
- The official Certificate of Security Officer Training is Form FDACS-16103.
- FDACS-16103 must be generated through the licensed Class DS school's LIAS reporting process after successful completion is reported.
- Obserra does not synthesize or self-generate FDACS-16103.
- A school-branded Obserra completion certificate may be provided only after the passing examination and successful-completion approval, is supplemental, and may not replace FDACS-16103.
- The regulated workflow tracks the three-business-day post-completion reporting/certificate deadline without performing direct LIAS automation.

## Implemented controls

1. LIAS queue records track reporting due date, manual submission reference, submitted/confirmed timestamps, certificate reference, staff actors, and exceptions.
2. Append-only LIAS workflow events preserve prepared, submitted, confirmed, and exception history.
3. Gate 16 completion approval receives a three-business-day due date and a prepared workflow event after Gate 17 migrations are promoted.
4. Only compliance administrators may record LIAS submission, confirm the LIAS-generated FDACS-16103 reference, or open an exception.
5. The official FDACS-16103 PDF may be uploaded into protected storage only after the LIAS queue is confirmed and the uploaded certificate reference matches the confirmed LIAS certificate reference.
6. Official certificate upload is limited to PDF, bounded to 10 MB, SHA-256 hashed, stored in a private object path, and integrity-checked on student download.
7. Student document access is authenticated and enrollment-bound. A learner may download only documents tied to that learner's completed enrollment.
8. The student completion portal states that 2,400 verified instructional minutes alone do not earn a certificate and shows the passing 128/170 examination plus school approval as required completion conditions.
9. The student completion portal distinguishes the official FDACS-16103 from supplemental Obserra records and links students to the official Florida Class D application and FDACS requirement page.
10. Supplemental Obserra completion/application records are created from the controlled completion record only after preserved passing-exam evidence exists. The learner's verified legal name, 40 instructional hours, completion date, and controlled certificate reference may be included; unnecessary protected identifiers are excluded from the public-facing record.
11. Inspection-ready post-course records include completion, LIAS status/history, attendance, instructional time, live-time evidence, module progress, exam history, and audit history.
12. No exam answer key, learner document, or PII is committed to the public repository.

## Mandatory student-material standard

`docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md` is the authoritative wording/control record for all learner-facing completion and certification communications.

The standard must be carried into enrollment acknowledgments, handbook/syllabus, LMS orientation, Day 1 materials, attendance/timekeeping explanations, examination instructions, remediation/retest instructions, course-status screens, the Completion Documents portal, Class D application guidance, FAQs/support scripts, and instructor completion checklists.

No material may say or imply that the learner automatically earns a certificate when the 40th instructional hour is recorded.

## DS submission-guide evidence

The next controlled DOCX/PDF Class DS LMS submission-guide revision must show the completion and certification workflow with screenshots. In addition to the existing nine portal images, it must include controlled screenshots of:

1. the Completion Review Console showing the 40-hour/five-day, 18-area, passing-exam, issue-clearance, and approval checks;
2. the no-certificate-before-pass boundary for a learner who has completed instruction but has not yet passed the exam;
3. the FDACS/LIAS workflow console with prepared/submitted/confirmed/exception states and reporting due date;
4. the protected student Completion Documents portal distinguishing FDACS-16103 from the supplemental Obserra certificate and application instructions.

Development screenshots must remain labeled as submission/development previews until final production evidence is available.

## Primary source files

- `lib/florida-class-d-lias.ts`
- `lib/florida-class-d-completion-documents.ts`
- `app/api/florida-class-d/admin/lias/route.ts`
- `app/api/florida-class-d/admin/completion-documents/route.ts`
- `app/api/florida-class-d/completion-documents/route.ts`
- `app/florida-security-training/admin/lias/page.tsx`
- `app/florida-security-training/admin/lias/LiasWorkflowConsole.tsx`
- `app/florida-security-training/completion/page.tsx`
- `supabase/migrations/20260813074500_fdacs_class_d_lias_workflow.sql`
- `supabase/migrations/20260813075000_fdacs_class_d_completion_documents.sql`
- `supabase/migrations/20260813075100_fdacs_class_d_lias_document_hardening.sql`
- `supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql`
- `docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md`
- `scripts/florida-class-d-lias-gate.mjs`

## Production dependencies

Gate 17 remains fail closed until the Class DS school is active and the protected runtime is explicitly enabled. Before production use, provision the private Supabase Storage bucket named by `OBSERRA_FDACS_DOCUMENTS_BUCKET` (default design name `fdacs-class-d-private`) and enable `OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED` and `OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED` only after regulatory and operational acceptance.

## Release status

Source implementation is complete for Gate 17. CI acceptance must not be claimed until the dedicated Florida Class D workflow passes regulated source gates, repository tests, lint, and the production Next.js build on the current Gate 17 head commit.
