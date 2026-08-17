# Florida Class D LMS — FDACS Control Mapping

Status: production-readiness control map for owner testing. This document does not itself authorize regulated training delivery.

## Governing authorities

- Section 493.6303(4), Florida Statutes — Class D applicants require 40 hours of professional training; live online delivery must verify identity, attendance, and successful completion; the school/instructor must electronically submit proof of completion to FDACS and provide training results to the applicant.
- Section 493.6132, Florida Statutes — live online Class D training requires a Florida physical location, one-device-at-a-time access, active-use security questions, minimum screen time, randomized test questions, digital attendance records, instructor/session/security-protocol records, and Division live access for audit/inspection.
- Rule 5N-1.140, F.A.C. — 40 instructional hours; at least 2 testing hours; 170 total exam questions; 128 correct is passing; FDACS-16103 must be issued within 3 business days; school records must include class/student records and instructor qualification/license records; minimum two-year retention; investigator access on request; online records must remain reproducible/transmittable.
- Rule 5N-1.142(4), F.A.C. — Class DS schools use LIAS to report successful Class D completion and generate FDACS-16103; successful completion must be electronically reported within 3 business days.
- FDACS-P-02188, Training Reporting for Class DS Schools — LIAS submission captures completion date, student name/date of birth, DI instructor license information, authorized-school certification, submission confirmation, unique Certificate Audit Control Number (ACN), correction history, and the current certificate supplied to the student.

Official references:
- https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0493/Sections/0493.6303.html
- https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0493/Sections/0493.6132.html
- https://flrules.org/gateway/ruleno.asp?id=5N-1.140
- https://flrules.org/gateway/ruleno.asp?id=5N-1.142
- https://licensing.fdacs.gov/forms/Training-Reporting-for-Class-DS-Schools.pdf

## LMS control implementation

| FDACS requirement | Obserra control / record | Production expectation |
|---|---|---|
| 40 instructional hours | `fdacs_class_d_instruction_time_entries`, `fdacs_class_d_live_time_totals`, `fdacs_class_d_module_progress`, `fdacs_class_d_completion_records.verified_instructional_minutes` | Completion cannot be approved below the required instructional threshold. |
| Minimum 2 hours testing | `fdacs_class_d_exam_attempts.started_at`, `earliest_submit_at`, `submitted_at` | Exam submission remains time-gated. |
| 170 questions / 128 passing | exam bank/questions/responses and `fdacs_class_d_exam_attempts.score`, `passed` | Question count, randomized selection, scoring, and passing threshold are enforced by regulated exam logic. |
| Randomized online tests | `fdacs_class_d_exam_attempts.randomized_question_ids` | Randomized question ordering/selection is retained per attempt. |
| One device at a time | `fdacs_class_d_device_leases` plus browser/session binding on exam attempts | Concurrent device use is rejected/controlled. |
| Student identity verification | `fdacs_class_d_student_identities`, `fdacs_class_d_identity_verification_sessions`, `fdacs_class_d_identity_verification_events`, daily identity check-ins | Identity must be verified before regulated participation/credit. |
| Active presence/security questions | `fdacs_class_d_presence_challenges`, `fdacs_class_d_live_interactions`, `fdacs_class_d_live_poll_responses` | Presence evidence is time-bounded and auditable. |
| Minimum screen time | `fdacs_class_d_live_text_screen_views`, `fdacs_class_d_live_text_screens` | Screen dwell-time controls prevent premature progression. |
| Digital attendance | `fdacs_class_d_attendance_entries`, daily attendance attestations, instruction-time entries | Class/session attendance and credited time are retained per enrollment. |
| Instructor name/license | `fdacs_class_d_live_sessions.instructor_clerk_user_id`, `instructor_license_number`; `fdacs_class_d_instructor_files` | Instructor identity, DI license status, license artifact, and qualification artifact are retained. |
| Florida training location | `fdacs_class_d_live_sessions.physical_location_state` and school license record | Online delivery must remain tied to the authorized Florida school location. |
| Division live audit access | `fdacs_class_d_live_sessions.inspection_access_reference`, observer/audit access controls | Investigator/Division access must be available without exposing student access broadly. |
| Security-protocol evidence | `fdacs_class_d_security_protocol_evidence`, protected artifacts, audit ledger | Evidence is release-bound and integrity-hashed. |
| Separate class/student records | cohort/enrollment relational boundary plus dedicated enrollment-linked tables | Every regulated student record is keyed to an enrollment and class/cohort rather than commingled free-form storage. |
| Signed/original exam record equivalent | `fdacs_class_d_signed_final_exam_records` and protected artifact hash | Final exam result and authenticated signer evidence are retained and integrity-protected. |
| Course curriculum/final exam file | `fdacs_class_d_course_files` | Approved course version, final-exam artifact/version/hash and approval are retained. |
| Minimum two-year retention | `fdacs_class_d_retention_reviews`, record archive jobs, record holds | `minimum_retain_until` must never be earlier than the FDACS minimum; legal/quality holds override disposition. |
| Immediate investigator production | `fdacs_class_d_investigator_audit_exports`, protected artifacts, record access events | Export is auditable and integrity-hashed; records remain reproducible/transmittable. |
| LIAS report within 3 business days | `fdacs_class_d_lias_reporting_queue.reporting_due_on`, prepared/submitted/confirmed timestamps | Queue must surface overdue records and may not treat preparation as submission. |
| LIAS submission/correction history | `fdacs_class_d_lias_workflow_events` | Initial submission, updates, confirmation, exception, and resolution remain independently auditable. |
| FDACS-16103 generated by LIAS only | `fdacs_class_d_completion_documents.source_system='lias'`; application policy forbids Obserra generation of FDACS-16103 | Obserra stores the official LIAS-generated PDF; it does not manufacture the state certificate. |
| Certificate ACN / FDACS confirmation | LIAS queue `certificate_reference` / `submission_reference`; completion document `external_reference` | The unique LIAS/FDACS reference must be captured before the official certificate is treated as available. |
| Current certificate supplied to student | completion-document service and student-authorized download path | Only the current available official LIAS certificate is exposed; superseded records remain retained for audit. |

## Production release invariants

1. Owner testing may exercise the real backend, database, identity, media, audit, and LIAS-preparation workflow without awarding student training credit.
2. No LMS feature may represent an Obserra-generated document as FDACS-16103. The official certificate must originate in LIAS.
3. `OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED` and regulated delivery/credit feature flags remain disabled until the separate legal/licensing activation decision is satisfied.
4. The owner-review path may be enabled only when exact-release binding, owner identity/AAL2, isolated FDACS database binding, Daily provider readiness, and regulated fail-closed conditions all pass.
5. The private `fdacs-class-d-completion-documents` bucket is limited to official retained PDF artifacts, is non-public, and is not itself evidence of LIAS submission.
6. Production readiness evidence must be tied to the exact deployed commit SHA and the exact regulated migration lineage.
