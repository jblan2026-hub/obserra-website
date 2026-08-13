# Florida Class D LMS Gate 17 Handoff

## Scope

Gate 17 implements post-course FDACS/LIAS workflow management, official training-certificate fulfillment, protected student document delivery, and inspection-ready post-course records. This gate does not automate, scrape, or impersonate the FDACS LIAS portal.

## Regulatory boundary

- Successful course completion does not itself issue a Florida Class D license.
- The official Certificate of Security Officer Training is Form FDACS-16103.
- FDACS-16103 must be generated through the licensed Class DS school's LIAS reporting process after successful completion is reported.
- Obserra does not synthesize or self-generate FDACS-16103.
- A school-branded Obserra completion certificate may be provided only as a supplemental record and may not replace FDACS-16103.
- The regulated workflow tracks the three-business-day post-completion reporting/certificate deadline without performing direct LIAS automation.

## Implemented controls

1. LIAS queue records now track reporting due date, manual submission reference, submitted/confirmed timestamps, certificate reference, staff actors, and exceptions.
2. Append-only LIAS workflow events preserve prepared, submitted, confirmed, and exception history.
3. Gate 16 completion approval automatically receives a three-business-day due date and a prepared workflow event after Gate 17 migrations are promoted.
4. Only compliance administrators may record LIAS submission, confirm the LIAS-generated FDACS-16103 reference, or open an exception.
5. The official FDACS-16103 PDF may be uploaded into protected storage only after the LIAS queue is confirmed and the uploaded certificate reference matches the confirmed LIAS certificate reference.
6. Official certificate upload is limited to PDF, bounded to 10 MB, SHA-256 hashed, stored in a private object path, and integrity-checked on student download.
7. Student document access is authenticated and enrollment-bound. A learner may download only documents tied to that learner's completed enrollment.
8. The student completion portal distinguishes the official FDACS-16103 from supplemental Obserra records and links students to the official Florida Class D application and FDACS requirement page.
9. Inspection-ready post-course records include completion, LIAS status/history, attendance, instructional time, live-time evidence, module progress, exam history, and audit history.
10. No exam answer key, learner document, or PII is committed to the public repository.

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
- `scripts/florida-class-d-lias-gate.mjs`

## Production dependencies

Gate 17 remains fail closed until the Class DS school is active and the protected runtime is explicitly enabled. Before production use, provision the private Supabase Storage bucket named by `OBSERRA_FDACS_DOCUMENTS_BUCKET` (default design name `fdacs-class-d-private`) and enable `OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED` and `OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED` only after regulatory and operational acceptance.

## Release status

Source implementation is complete for Gate 17. CI acceptance must not be claimed until the dedicated Florida Class D workflow passes regulated source gates, repository tests, lint, and the production Next.js build on the Gate 17 head commit.
