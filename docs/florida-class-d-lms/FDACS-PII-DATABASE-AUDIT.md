# FDACS Student-PII Database Audit Record

> GENERATED FROM THE MACHINE-READABLE SOURCE AND LIVE-VERIFICATION RECEIPT. DO NOT EDIT MANUALLY.

- **Legal owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
- **System:** `SYS-FDACS-DATABASE` — FDACS isolated student-record PII database
- **Live project:** `OBSERRA FDACS Student Records Production` (`ggkxgjhsbgbifiqrhavr`, `us-east-1`)
- **Observed:** `2026-08-15T13:36:54Z`
- **State:** `live_hardened_activation_pending`
- **Production runtime authorized:** `false`
- **Evidence schema:** `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json` (SHA-256 `8ee2d32ebd9b4697e9c58283167b0cea26ef2b866839b9ba49792fa2ed28743a`)

## Live result

9 forward FDACS migrations are live. The isolated project contains 64 FDACS tables, 2 governed CMMC evidence tables, 0 unauthorized non-FDACS tables, 64 explicit restrictive browser-deny policies, 0 browser table privileges, 0 browser execute privileges across 114 FDACS routines, and 0 FDACS tables without forced RLS.

Supabase security advisor findings: 2, both INFO-only notices for deliberate forced-RLS, no-policy, RPC-only CMMC archive tables. Error or warning findings: 0. Unindexed foreign-key findings: 0. Remaining performance observations are informational: 107 unused-index notices on the empty/pre-production workload and 1 Auth allocation notice.

## Exact-release owner UAT boundary

Provider migrations `20260814211645` and `20260814213942` establish a capacity-1, Preview-only, non-credit `owner_uat_noncredit` profile. It is bound to an exact release and authorization-evidence digest, expires within 14 days, requires live hosted identity plus a distinct assigned verified-active Class DI instructor, records no Class DS school-license claim for UAT, and cannot coexist with database production authorization.

Transactional live negative tests passed and were rolled back: expiry beyond 14 days rejected `true`; production authorization with unverified gates rejected `true`; wrong-release schedule rejected `true`; schedule without a verified-active assigned DI rejected `true`; valid UAT cohort created then rolled back `true`. Live cohort, enrollment, and session counts remain 0, 0, and 0.

## Governing FDACS requirements

| Source | Exact version | Controlled requirements |
| --- | --- | --- |
| [FAC-5N-1.140-2024-11-28](https://www.flrules.org/gateway/ruleno.asp?id=5n-1.140) | Final adopted rule effective 2024-11-28 | Instructor verification of the student's U.S. state or federal photo identification<br>Instructor verification and digital logging of daily attendance<br>Minimum two-year record retention<br>Immediate production of student records to an FDACS investigator on request<br>Reproducible or transmittable electronic records<br>Online training-session, instructor, attendance, and security-protocol evidence |
| [FS-493.6132-2025](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499%2F0493%2FSections%2F0493.6132.html) | 2025 Florida Statutes | Digital attendance log<br>Training-session and instructor records<br>Proof of compliance with security protocols<br>Investigator access on request<br>Division live course access for audit, monitoring, or inspection |

## Technical and human disposition

| Check | Technical state | Result |
| --- | --- | --- |
| `FDACS-DB-SOURCE-GATE` | `passed` | The isolated retention, archive, identity/attendance, investigator export, CMMC binding, and chain-verifier source contract is published at exact GitHub merge commit 2dde838ee176e6f450abeca2daad96ab377ed931 and the fail-closed source gate passed against that revision. |
| `FDACS-DB-LIVE-MIGRATIONS` | `passed` | Nine forward FDACS hardening migrations are live; the provider ledger contains 38 FDACS migrations plus three governed CMMC evidence-archive migrations, ending with provider version 20260815133241. |
| `FDACS-DB-LIVE-ACCESS-BOUNDARY` | `passed` | Zero browser table privileges, zero browser execute privileges, all 64 FDACS tables forced-RLS, and 64 explicit restrictive deny policies. The only two non-FDACS public tables are the governed RPC-only CMMC evidence archive and its append-only event chain; zero unauthorized non-FDACS tables are present. |
| `FDACS-DB-LIVE-FUNCTION-BOUNDARY` | `passed` | Anon and authenticated have zero execute privileges across all FDACS routines. Fifty-five security-definer routines use an empty search path; the 46 legacy routines fixed to public remain protected by zero anon/authenticated CREATE privilege on that schema. |
| `FDACS-DB-LIVE-CHAIN-VERIFIERS` | `passed` | All five chain verifiers returned valid with zero failures; record-access and investigator-export chains each contain the real preflight event. |
| `FDACS-DB-LIVE-EXPORT-GENERATION` | `passed` | A real boundary-scoped export was generated and its payload digest independently recomputed and matched. |
| `FDACS-DB-LIVE-EXPORT-FAIL-CLOSED` | `passed` | Negative tests rejected an unauthorized actor, rejected finalization without the exact matching protected artifact, and rejected delivery before finalization; the ledger remained one generated event with zero finalized or delivered events. |
| `FDACS-DB-OWNER-UAT-CONTROLS` | `passed` | The exact-release owner UAT profile is Preview-only, capacity one, expires within 14 days, requires live hosted identity and the distinct assigned verified-active Class DI instructor, is non-credit, and has database guards against completion, LIAS, and student self-attestation. |
| `FDACS-DB-OWNER-UAT-INSTRUCTION-SAFETY` | `passed` | The service-role-only live schedule function requires the exact release and a verified-active assigned Class DI record, emits exactly 20 non-credit lessons, stores no Class DS school-license claim, and remains unavailable to anon and authenticated roles. |
| `FDACS-DB-OWNER-UAT-NEGATIVE-TESTS` | `passed` | Transactional live tests rejected an expiry beyond 14 days, rejected production authorization while mandatory gates were false, rejected a schedule bound to the wrong release, rejected a schedule without a verified-active assigned Class DI, rejected owner-UAT live start by the wrong actor, rejected start without assigned DI evidence, and rejected verified-active provisioning without a bounded expiration; all test rows were rolled back. |
| `FDACS-DB-OWNER-UAT-LIVE-EXECUTION` | `passed` | The assigned instructor alone may start an owner-UAT lesson; the start path requires the matching verified-active DI file, accepts no Class DS claim, and the atomic instructor RPC archives only encrypted qualification/license payloads through service-role-only functions with no browser grants. |
| `FDACS-DB-ENCRYPTED-EXPORT-FINALIZATION` | `not_tested` | External AES-256-GCM key custody is not verified, so no protected inspection_export was fabricated and the export remains non-final. |
| `FDACS-DB-BACKUP-RESTORE` | `not_tested` | A candidate-bound restore test has not been executed. |
| `FDACS-DB-HA-FAILOVER` | `not_tested` | A candidate-bound HA failover test has not been executed. |
| `FDACS-DB-STUDENT-DOSSIER` | `not_tested` | The database contains zero student enrollments, so no real student dossier or identity-attendance chain can yet be tested. |

Human review is `pending`. Pending human review is not a technical failure. Assessment finding remains `not_assessed`.

## Investigator audit trail

A real non-PII preflight export was generated as `27ea0a5a-1c07-4c68-a37f-eb775df343fb`. Payload SHA-256 `588eea7731526ff01704ae06b0b07381ec97340f7d162cb0cd3f3db1bd255d1e` matched the independently recomputed digest. Event SHA-256: `0ba5ccc37e71a709f7841722f010aa863e504e35f02139f6653081b73b149105`.

The export is correctly `generated_unarchived` and **not final evidence**. Finality requires exact-payload application-envelope encryption, protected archival, digest matching, and a finalization event.

Fail-closed negative tests passed: unauthorized actor rejected `true`; finalization without a matching protected artifact rejected `true`; delivery before finalization rejected `true`. Finalized and delivered event counts remained 0 and 0.

| Chain | Records | Failures | Valid | Head SHA-256 |
| --- | ---: | ---: | --- | --- |
| `activation_evidence` | 0 | 0 | `true` | `GENESIS` |
| `record_access` | 1 | 0 | `true` | `77d978e19ddf905423d89e93383e4e3f462e8b6f66a03f200e31321030f6601d` |
| `identity_provider_events` | 0 | 0 | `true` | `GENESIS` |
| `protected_artifacts` | 0 | 0 | `true` | `GENESIS` |
| `investigator_exports` | 1 | 0 | `true` | `0ba5ccc37e71a709f7841722f010aa863e504e35f02139f6653081b73b149105` |

## CMMC security-protocol proof

FDACS proof of security protocols is bound to `SYS-FDACS-DATABASE`. Its objective-level mapping contains 287 system-objective rows. Current technical disposition is `not_tested`; human disposition is `pending`.

Only an exact-release, hashed protected `security_protocol_evidence` package can be registered live. This database never creates an assessor finding or CMMC certification claim.

## Open blockers

- Register a final exact-release SYS-FDACS-DATABASE CMMC security-protocol package after objective-level technical tests complete.
- Verify external AES-256-GCM encryption-key custody and run a protected export finalization test.
- Run and hash backup/restore and HA failover tests against the exact release candidate.
- Run the authorized exact-release owner UAT with live Stripe Identity, Daily, and a distinct assigned Class DI instructor to verify the real student dossier without awarding training credit.
- Verify FDACS DS license and online method acceptance before authorizing the production runtime.
- Complete the controlled FDACS investigator access and delivery walkthrough.

## Claim boundary

This record proves the listed live database observations, service-role-only encrypted instructor-provisioning schema, and transactional fail-closed owner-UAT controls at the recorded time. It does not prove FDACS licensure, FDACS approval, CMMC certification, external encryption-key custody, backup restoration, HA failover, a finalized encrypted investigator export, configured external UAT providers, a real instructor file, or a completed real student workflow.

Machine-readable record: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json`. Paired digest: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256`.
