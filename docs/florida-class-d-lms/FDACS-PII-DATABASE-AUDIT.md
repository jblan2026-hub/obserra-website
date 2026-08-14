# FDACS Student-PII Database Audit Record

> GENERATED FROM THE MACHINE-READABLE SOURCE AND LIVE-VERIFICATION RECEIPT. DO NOT EDIT MANUALLY.

- **Legal owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
- **System:** `SYS-FDACS-DATABASE` — FDACS isolated student-record PII database
- **Live project:** `OBSERRA FDACS Student Records Production` (`ggkxgjhsbgbifiqrhavr`, `us-east-1`)
- **Observed:** `2026-08-14T17:57:49.805602Z`
- **State:** `live_hardened_activation_pending`
- **Production runtime authorized:** `false`
- **Evidence schema:** `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json` (SHA-256 `88c031c8a8d8257d15148f8ad62ed7ed7d0aaf4cd31032acb67e1b6f640cadf0`)

## Live result

6 forward migrations are live. The isolated project contains 64 FDACS tables, 0 non-FDACS tables, 64 explicit restrictive browser-deny policies, 0 browser table privileges, 0 browser execute privileges across 102 FDACS routines, and 0 FDACS tables without forced RLS.

Supabase security advisor findings: 0. Unindexed foreign-key findings: 0. Remaining performance observations are informational: 104 unused-index notices on the empty/pre-production workload and 1 Auth allocation notice.

## Governing FDACS requirements

| Source | Exact version | Controlled requirements |
| --- | --- | --- |
| [FAC-5N-1.140-2024-11-28](https://www.flrules.org/gateway/ruleno.asp?id=5n-1.140) | Final adopted rule effective 2024-11-28 | Instructor verification of the student's U.S. state or federal photo identification<br>Instructor verification and digital logging of daily attendance<br>Minimum two-year record retention<br>Immediate production of student records to an FDACS investigator on request<br>Reproducible or transmittable electronic records<br>Online training-session, instructor, attendance, and security-protocol evidence |
| [FS-493.6132-2025](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499%2F0493%2FSections%2F0493.6132.html) | 2025 Florida Statutes | Digital attendance log<br>Training-session and instructor records<br>Proof of compliance with security protocols<br>Investigator access on request<br>Division live course access for audit, monitoring, or inspection |

## Technical and human disposition

| Check | Technical state | Result |
| --- | --- | --- |
| `FDACS-DB-SOURCE-GATE` | `not_tested` | The isolated retention, archive, identity/attendance, investigator export, CMMC binding, and chain-verifier source contract was satisfied locally, but the source revision is unpublished and is not an authoritative green technical result. |
| `FDACS-DB-LIVE-MIGRATIONS` | `passed` | Six forward migrations applied transactionally to the isolated live project. |
| `FDACS-DB-LIVE-ACCESS-BOUNDARY` | `passed` | Zero browser table privileges, zero browser execute privileges across 102 FDACS routines, zero non-FDACS tables, all FDACS tables forced-RLS, and 64 explicit restrictive deny policies. |
| `FDACS-DB-LIVE-FUNCTION-BOUNDARY` | `passed` | The last inherited trigger-function execute grant was removed live; anon and authenticated now have zero execute privileges across all FDACS routines. All 49 legacy security-definer routines with a fixed public search path are protected by zero anon/authenticated CREATE privilege on that schema. |
| `FDACS-DB-LIVE-CHAIN-VERIFIERS` | `passed` | All five chain verifiers returned valid with zero failures; record-access and investigator-export chains each contain the real preflight event. |
| `FDACS-DB-LIVE-EXPORT-GENERATION` | `passed` | A real boundary-scoped export was generated and its payload digest independently recomputed and matched. |
| `FDACS-DB-LIVE-EXPORT-FAIL-CLOSED` | `passed` | Negative tests rejected an unauthorized actor, rejected finalization without the exact matching protected artifact, and rejected delivery before finalization; the ledger remained one generated event with zero finalized or delivered events. |
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
- Run an authorized non-production or first-live student workflow to verify automatic enrollment/completion archival and the scoped student dossier.
- Verify FDACS DS license and online method acceptance before authorizing the production runtime.
- Complete the controlled FDACS investigator access and delivery walkthrough.

## Claim boundary

This record proves the listed live database observations and negative fail-closed tests at the recorded time. It does not prove FDACS licensure, FDACS approval, CMMC certification, backup restoration, HA failover, encryption-key custody, a finalized encrypted investigator export, or a real student workflow.

Machine-readable record: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json`. Paired digest: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256`.
