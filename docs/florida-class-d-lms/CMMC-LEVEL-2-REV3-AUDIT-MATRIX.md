# CMMC Level 2 and NIST SP 800-171 Rev. 3 Audit Traceability Matrix

> GENERATED FILE. DO NOT EDIT MANUALLY. Update `CMMC-LEVEL-2-REV3-TRACEABILITY.json` and run `npm run generate:cmmc-traceability`.

Registry SHA-256: `c443e65c6893fc7d251b176bb8a98e60a486520fe3fc4bff15d219a0154d6f92`
Registry schema version: `1.0`
Registry snapshot date: `2026-08-13`
Source checkpoint represented by the register: `ffb08fb2e9cb9033d9a3faf68c653e90c28a7b88`

## Audit Claim Boundary

Historical requirement-level supporting inventory only. The current objective-level authority is docs/compliance/CMMC-SYSTEM-EVIDENCE.json. This register does not claim CMMC certification, a CMMC status in SPRS, FedRAMP authorization, FDACS approval, authorization to process CUI, or an assessor finding.

NIST SP 800-171 Rev. 3 is the engineering baseline and NIST SP 800-171A Rev. 3 is the assessment procedure baseline for this traceability package. The current CMMC Level 2 rule baseline is retained separately because the current DoD assessment regime continues to reference the 110 NIST SP 800-171 Rev. 2 requirements. The Rev. 2 mappings in this report are a crosswalk aid and do not convert Rev. 3 implementation evidence into a CMMC certification claim.

## Scope State

Formal CUI assessment scope established: **no**
SSP complete: **no**
Network diagram complete: **no**
Asset inventory complete: **no**
CUI processing authorized: **no**

Public website, Obserra Academy and LMS, supporting GitHub backend, Supabase Academy database and Edge Functions, Clerk identity, Stripe commerce, Vercel runtime, and direct dependencies required by those components.

## Requirement Coverage Summary

| Resolved status | Count |
| --- | ---: |
| implemented source evidence | 0 |
| partial external evidence required | 65 |
| organizational evidence required | 27 |
| scope dependent | 5 |
| **Total active Rev. 3 requirements** | **97** |

A requirement status is deliberately conservative. The family default remains in force unless trace evidence is at least as restrictive. Source evidence therefore cannot silently promote an organizational or scope dependent requirement to complete.

## NIST SP 800-171 Rev. 3 Requirement Matrix

| Rev. 3 requirement | Title | Family | Resolved status | Trace records |
| --- | --- | --- | --- | --- |
| 03.01.01 | Account Management | Access Control | partial_external_evidence_required | none yet |
| 03.01.02 | Access Enforcement | Access Control | partial_external_evidence_required | TR-001, TR-002, TR-003, TR-005, TR-006, TR-007, TR-008, TR-009, TR-022 |
| 03.01.03 | Information Flow Enforcement | Access Control | partial_external_evidence_required | TR-001, TR-004, TR-007 |
| 03.01.04 | Separation of Duties | Access Control | partial_external_evidence_required | none yet |
| 03.01.05 | Least Privilege | Access Control | partial_external_evidence_required | TR-001, TR-002, TR-003, TR-006, TR-022 |
| 03.01.06 | Least Privilege – Privileged Accounts | Access Control | partial_external_evidence_required | TR-006 |
| 03.01.07 | Least Privilege – Privileged Functions | Access Control | partial_external_evidence_required | TR-001, TR-006 |
| 03.01.08 | Unsuccessful Logon Attempts | Access Control | partial_external_evidence_required | none yet |
| 03.01.09 | System Use Notification | Access Control | partial_external_evidence_required | none yet |
| 03.01.10 | Device Lock | Access Control | partial_external_evidence_required | none yet |
| 03.01.11 | Session Termination | Access Control | partial_external_evidence_required | none yet |
| 03.01.12 | Remote Access | Access Control | partial_external_evidence_required | none yet |
| 03.01.16 | Wireless Access | Access Control | partial_external_evidence_required | none yet |
| 03.01.18 | Access Control for Mobile Devices | Access Control | partial_external_evidence_required | none yet |
| 03.01.20 | Use of External Systems | Access Control | partial_external_evidence_required | TR-019 |
| 03.01.22 | Publicly Accessible Content | Access Control | partial_external_evidence_required | TR-004, TR-005 |
| 03.02.01 | Literacy Training and Awareness | Awareness and Training | organizational_evidence_required | none yet |
| 03.02.02 | Role-Based Training | Awareness and Training | organizational_evidence_required | none yet |
| 03.03.01 | Event Logging | Audit and Accountability | partial_external_evidence_required | TR-008, TR-010 |
| 03.03.02 | Audit Record Content | Audit and Accountability | partial_external_evidence_required | TR-008, TR-010, TR-017 |
| 03.03.03 | Audit Record Generation | Audit and Accountability | partial_external_evidence_required | TR-008, TR-010 |
| 03.03.04 | Response to Audit Logging Process Failures | Audit and Accountability | partial_external_evidence_required | none yet |
| 03.03.05 | Audit Record Review, Analysis, and Reporting | Audit and Accountability | partial_external_evidence_required | TR-010, TR-016 |
| 03.03.06 | Audit Record Reduction and Report Generation | Audit and Accountability | partial_external_evidence_required | none yet |
| 03.03.07 | Time Stamps | Audit and Accountability | partial_external_evidence_required | TR-010 |
| 03.03.08 | Protection of Audit Information | Audit and Accountability | partial_external_evidence_required | TR-006, TR-010, TR-015, TR-021 |
| 03.04.01 | Baseline Configuration | Configuration Management | partial_external_evidence_required | TR-005, TR-012, TR-014, TR-017, TR-021 |
| 03.04.02 | Configuration Settings | Configuration Management | partial_external_evidence_required | TR-003, TR-005, TR-022 |
| 03.04.03 | Configuration Change Control | Configuration Management | partial_external_evidence_required | TR-005, TR-012, TR-014, TR-017, TR-018, TR-021, TR-022 |
| 03.04.04 | Impact Analyses | Configuration Management | partial_external_evidence_required | TR-012, TR-014, TR-018 |
| 03.04.05 | Access Restrictions for Change | Configuration Management | partial_external_evidence_required | TR-018 |
| 03.04.06 | Least Functionality | Configuration Management | partial_external_evidence_required | TR-003, TR-004, TR-007 |
| 03.04.08 | Authorized Software – Allow by Exception | Configuration Management | partial_external_evidence_required | TR-012 |
| 03.04.10 | System Component Inventory | Configuration Management | partial_external_evidence_required | TR-019 |
| 03.04.11 | Information Location | Configuration Management | partial_external_evidence_required | TR-014, TR-019 |
| 03.04.12 | System and Component Configuration for High-Risk Areas | Configuration Management | partial_external_evidence_required | none yet |
| 03.05.01 | User Identification and Authentication | Identification and Authentication | partial_external_evidence_required | TR-002, TR-009 |
| 03.05.02 | Device Identification and Authentication | Identification and Authentication | partial_external_evidence_required | none yet |
| 03.05.03 | Multi-Factor Authentication | Identification and Authentication | partial_external_evidence_required | TR-002 |
| 03.05.04 | Replay-Resistant Authentication | Identification and Authentication | partial_external_evidence_required | TR-002 |
| 03.05.05 | Identifier Management | Identification and Authentication | partial_external_evidence_required | TR-009 |
| 03.05.07 | Password Management | Identification and Authentication | partial_external_evidence_required | none yet |
| 03.05.11 | Authentication Feedback | Identification and Authentication | partial_external_evidence_required | none yet |
| 03.05.12 | Authenticator Management | Identification and Authentication | partial_external_evidence_required | TR-002, TR-009 |
| 03.06.01 | Incident Handling | Incident Response | organizational_evidence_required | none yet |
| 03.06.02 | Incident Monitoring, Reporting, and Response Assistance | Incident Response | organizational_evidence_required | none yet |
| 03.06.03 | Incident Response Testing | Incident Response | organizational_evidence_required | none yet |
| 03.06.04 | Incident Response Training | Incident Response | organizational_evidence_required | none yet |
| 03.06.05 | Incident Response Plan | Incident Response | organizational_evidence_required | none yet |
| 03.07.04 | Maintenance Tools | Maintenance | organizational_evidence_required | none yet |
| 03.07.05 | Nonlocal Maintenance | Maintenance | organizational_evidence_required | none yet |
| 03.07.06 | Maintenance Personnel | Maintenance | organizational_evidence_required | none yet |
| 03.08.01 | Media Storage | Media Protection | organizational_evidence_required | none yet |
| 03.08.02 | Media Access | Media Protection | organizational_evidence_required | none yet |
| 03.08.03 | Media Sanitization | Media Protection | organizational_evidence_required | none yet |
| 03.08.04 | Media Marking | Media Protection | organizational_evidence_required | none yet |
| 03.08.05 | Media Transport | Media Protection | organizational_evidence_required | none yet |
| 03.08.07 | Media Use | Media Protection | organizational_evidence_required | none yet |
| 03.08.09 | System Backup – Cryptographic Protection | Media Protection | organizational_evidence_required | TR-015, TR-020 |
| 03.09.01 | Personnel Screening | Personnel Security | organizational_evidence_required | none yet |
| 03.09.02 | Personnel Termination and Transfer | Personnel Security | organizational_evidence_required | none yet |
| 03.10.01 | Physical Access Authorizations | Physical Protection | scope_dependent | none yet |
| 03.10.02 | Monitoring Physical Access | Physical Protection | scope_dependent | none yet |
| 03.10.06 | Alternate Work Site | Physical Protection | scope_dependent | none yet |
| 03.10.07 | Physical Access Control | Physical Protection | scope_dependent | none yet |
| 03.10.08 | Access Control for Transmission | Physical Protection | scope_dependent | none yet |
| 03.11.01 | Risk Assessment | Risk Assessment | partial_external_evidence_required | none yet |
| 03.11.02 | Vulnerability Monitoring and Scanning | Risk Assessment | partial_external_evidence_required | TR-011 |
| 03.11.04 | Risk Response | Risk Assessment | partial_external_evidence_required | none yet |
| 03.12.01 | Security Assessment | Security Assessment and Monitoring | partial_external_evidence_required | TR-014, TR-015, TR-018, TR-021 |
| 03.12.02 | Plan of Action and Milestones | Security Assessment and Monitoring | partial_external_evidence_required | none yet |
| 03.12.03 | Continuous Monitoring | Security Assessment and Monitoring | organizational_evidence_required | TR-015, TR-016, TR-020, TR-021 |
| 03.12.05 | Information Exchange | Security Assessment and Monitoring | partial_external_evidence_required | TR-019 |
| 03.13.01 | Boundary Protection | System and Communications Protection | partial_external_evidence_required | TR-007, TR-013, TR-022 |
| 03.13.04 | Information in Shared System Resources | System and Communications Protection | partial_external_evidence_required | TR-004 |
| 03.13.06 | Network Communications – Deny by Default – Allow by Exception | System and Communications Protection | partial_external_evidence_required | TR-001, TR-006, TR-022 |
| 03.13.08 | Transmission and Storage Confidentiality | System and Communications Protection | partial_external_evidence_required | TR-013 |
| 03.13.09 | Network Disconnect | System and Communications Protection | partial_external_evidence_required | none yet |
| 03.13.10 | Cryptographic Key Establishment and Management | System and Communications Protection | partial_external_evidence_required | none yet |
| 03.13.11 | Cryptographic Protection | System and Communications Protection | partial_external_evidence_required | TR-013 |
| 03.13.12 | Collaborative Computing Devices and Applications | System and Communications Protection | partial_external_evidence_required | none yet |
| 03.13.13 | Mobile Code | System and Communications Protection | partial_external_evidence_required | none yet |
| 03.13.15 | Session Authenticity | System and Communications Protection | partial_external_evidence_required | TR-002, TR-007, TR-008, TR-013 |
| 03.14.01 | Flaw Remediation | System and Information Integrity | partial_external_evidence_required | TR-011 |
| 03.14.02 | Malicious Code Protection | System and Information Integrity | partial_external_evidence_required | none yet |
| 03.14.03 | Security Alerts, Advisories, and Directives | System and Information Integrity | partial_external_evidence_required | TR-011, TR-016 |
| 03.14.06 | System Monitoring | System and Information Integrity | partial_external_evidence_required | TR-015, TR-016 |
| 03.14.08 | Information Management and Retention | System and Information Integrity | partial_external_evidence_required | TR-004, TR-005, TR-010, TR-017 |
| 03.15.01 | Policy and Procedures | Planning | organizational_evidence_required | TR-021 |
| 03.15.02 | System Security Plan | Planning | organizational_evidence_required | TR-021 |
| 03.15.03 | Rules of Behavior | Planning | organizational_evidence_required | none yet |
| 03.16.01 | Security Engineering Principles | System and Services Acquisition | partial_external_evidence_required | TR-003, TR-007, TR-012, TR-013, TR-014, TR-018, TR-021, TR-022 |
| 03.16.02 | Unsupported System Components | System and Services Acquisition | partial_external_evidence_required | TR-011 |
| 03.16.03 | External System Services | System and Services Acquisition | organizational_evidence_required | TR-008, TR-015, TR-019, TR-020 |
| 03.17.01 | Supply Chain Risk Management Plan | Supply Chain Risk Management | organizational_evidence_required | TR-019 |
| 03.17.02 | Acquisition Strategies, Tools, and Methods | Supply Chain Risk Management | organizational_evidence_required | TR-011, TR-012 |
| 03.17.03 | Supply Chain Requirements and Processes | Supply Chain Risk Management | organizational_evidence_required | TR-012, TR-019 |

## Implementation Trace Records

### TR-001 Default deny regulated mutation boundary

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.03`, `03.01.05`, `03.01.07`, `03.13.06`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.1`, `3.1.2`, `3.1.5`, `3.1.6`, `3.1.7`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra application and GitHub CI

All Florida Class D write operations pass through a global regulated execution boundary before authentication. Unauthorized regulated writes fail closed.

Evidence:

* `lib/florida-class-d-mutation-boundary.ts`
* `proxy.ts`
* `scripts/florida-class-d-regulated-mutation-boundary-gate.mjs`
* `docs/florida-class-d-lms/GATE-30-MUTATION-BOUNDARY-HANDOFF.md`

Open evidence condition: Formal CMMC assessment testing remains separate from source validation.

### TR-002 Clerk identity middleware and paid learner authorization

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.05`, `03.05.01`, `03.05.03`, `03.05.04`, `03.05.12`, `03.13.15`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.1`, `3.1.2`, `3.1.5`, `3.5.1`, `3.5.2`, `3.5.3`, `3.5.10`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Clerk

The website conditionally delegates to validated Clerk middleware, reports the validated identity environment without exposing keys, fails protected routes closed when identity is unavailable, and requires authenticated identity plus current durable entitlement for paid Academy media and tutor access.

Evidence:

* `proxy.ts`
* `lib/identity-runtime.ts`
* `lib/academy.ts`
* `app/api/academy/tutor/route.ts`
* `app/api/academy/media/route.ts`
* `docs/florida-class-d-lms/GATE-35-PRODUCTION-REMEDIATION-DUAL-BASELINE-HANDOFF.md`

Open evidence condition: Production verification, MFA policy, authenticator policy, and Clerk provider assurance remain required.

### TR-003 Preview authentication bypass removal

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.05`, `03.04.02`, `03.04.06`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.1`, `3.1.2`, `3.1.5`, `3.4.2`, `3.4.6`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra application

Generic Vercel preview authentication exceptions were removed from paid learner media and tutor endpoints so preview follows the production authorization model.

Evidence:

* `app/api/academy/tutor/route.ts`
* `app/api/academy/media/route.ts`
* `scripts/florida-class-d-website-academy-commerce-gate.mjs`

Open evidence condition: Deployment verification remains part of release acceptance.

### TR-004 Public Academy catalog data minimization

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.03`, `03.01.22`, `03.04.06`, `03.13.04`, `03.14.08`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.3`, `3.1.22`, `3.4.6`, `3.13.4`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Supabase

The public catalog Edge Function is GET only, exposes a public field allowlist, returns only public visible controls, and omits hidden or unpublished records.

Evidence:

* `supabase/functions/academy-public-catalog/index.ts`
* `supabase/config.toml`
* `scripts/florida-class-d-website-academy-commerce-gate.mjs`

Open evidence condition: Provider platform assurance remains external evidence.

### TR-005 Academy fail closed publication controls

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.22`, `03.04.01`, `03.04.02`, `03.04.03`, `03.14.08`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.2`, `3.1.22`, `3.4.1`, `3.4.2`, `3.4.3`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra application and Supabase database

Missing or malformed Academy course control data resolves to unpublished, invisible, and purchase disabled. The reviewed 60 course baseline is explicitly published by controlled migration.

Evidence:

* `lib/academy-control.ts`
* `supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`
* `docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Open evidence condition: Operator approval procedures and formal configuration management policy require organizational evidence.

### TR-006 Supabase row level security and privileged function boundary

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.05`, `03.01.06`, `03.01.07`, `03.03.08`, `03.13.06`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.1`, `3.1.2`, `3.1.5`, `3.1.6`, `3.1.7`, `3.3.8`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Supabase

Reviewed Academy publication and durable learner-commerce tables use forced row level security with no anonymous or authenticated grants. Nine durable learner-commerce security-definer functions are service-role only with an empty search path, and learner and assessment audit tables reject update and delete operations.

Evidence:

* `supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`
* `supabase/migrations/20260814061110_academy_durable_learner_commerce.sql`
* `supabase/migrations/20260814061912_academy_payment_event_integrity_hardening.sql`
* `lib/academy-persistence.ts`
* `scripts/academy-durable-commerce-gate.mjs`
* `docs/florida-class-d-lms/GATE-35-PRODUCTION-REMEDIATION-DUAL-BASELINE-HANDOFF.md`

Open evidence condition: Full database role inventory, provider assurance, backup controls, and periodic privilege review evidence remain required.

### TR-007 Stripe POST only checkout and same origin enforcement

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.03`, `03.04.06`, `03.13.01`, `03.13.15`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.2`, `3.1.3`, `3.4.6`, `3.13.1`, `3.13.15`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Stripe

Stripe Checkout Session creation is POST only, same origin protected, form content type restricted, current course authorization checked, and responses are no store.

Evidence:

* `app/api/academy/checkout/route.ts`
* `app/academy/AcademyClient.tsx`
* `app/catalog/page.tsx`
* `app/academy/[courseId]/page.tsx`
* `lib/academy-request.ts`
* `scripts/florida-class-d-website-academy-commerce-gate.mjs`

Open evidence condition: Production verification after deployment and Stripe provider assurance remain required.

### TR-008 Signed Stripe webhook and idempotent entitlement fulfillment

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.03.01`, `03.03.02`, `03.03.03`, `03.13.15`, `03.16.03`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.2`, `3.3.1`, `3.3.2`, `3.3.3`, `3.13.15`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Stripe

Payment fulfillment requires a Stripe-signed webhook and paid status. Each provider event is transactionally recorded in the service-only Academy payment ledger using the Stripe event ID as the idempotency authority before an entitlement is fulfilled or placed into paid-pending-claim state.

Evidence:

* `app/api/webhook/stripe/route.ts`
* `app/api/academy/commerce-health/route.ts`
* `lib/academy-persistence.ts`
* `supabase/migrations/20260814061110_academy_durable_learner_commerce.sql`
* `supabase/migrations/20260814061912_academy_payment_event_integrity_hardening.sql`
* `scripts/academy-durable-commerce-gate.mjs`
* `docs/florida-class-d-lms/GATE-35-PRODUCTION-REMEDIATION-DUAL-BASELINE-HANDOFF.md`

Open evidence condition: Provider availability, webhook delivery assurance, and production event evidence remain external.

### TR-009 Verified purchaser identity for deferred course claims

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.05.01`, `03.05.05`, `03.05.12`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.1`, `3.1.2`, `3.5.1`, `3.5.5`, `3.5.10`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra, Clerk, and Stripe

Deferred paid course claims require exact user binding or a verified Clerk email matching the paid Stripe purchaser email. Guest purchaser email is HMAC-SHA-256 protected in durable storage, and a claim cannot succeed unless a signed webhook has already recorded the paid checkout event.

Evidence:

* `app/api/academy/redeem/route.ts`
* `lib/academy-persistence.ts`
* `supabase/migrations/20260814061110_academy_durable_learner_commerce.sql`
* `supabase/migrations/20260814061912_academy_payment_event_integrity_hardening.sql`
* `scripts/florida-class-d-website-academy-commerce-gate.mjs`

Open evidence condition: Provider identity proofing and email verification configuration require external evidence.

### TR-010 Audit ledger and regulated evidence preservation

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.03.01`, `03.03.02`, `03.03.03`, `03.03.05`, `03.03.07`, `03.03.08`, `03.14.08`

Current CMMC Level 2 Rev. 2 crosswalk: `3.3.1`, `3.3.2`, `3.3.3`, `3.3.5`, `3.3.7`, `3.3.8`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra GitHub and Supabase

Course publication, paid fulfillment, assessment, learner progress, and regulated operations retain controlled audit events. Academy assessment and learner event records are append-only. Gate evidence is bound to source checkpoints and retained as GitHub artifacts where implemented.

Evidence:

* `docs/florida-class-d-lms/ACTION-LEDGER-GATES-29-32-ADDENDUM.md`
* `docs/florida-class-d-lms/ACTION-LEDGER-GATE-35-ADDENDUM.md`
* `docs/florida-class-d-lms/LATEST-HANDOFF.md`
* `supabase/migrations/20260814061110_academy_durable_learner_commerce.sql`
* `.github/workflows/florida-class-d-lms-gates.yml`

Open evidence condition: Centralized log retention, immutable external archive, alert review cadence, and time synchronization evidence require completion.

### TR-011 Dependency vulnerability audit and flaw remediation

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.11.02`, `03.14.01`, `03.14.03`, `03.16.02`, `03.17.02`

Current CMMC Level 2 Rev. 2 crosswalk: `3.11.2`, `3.12.1`, `3.14.1`, `3.14.2`, `3.14.3`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra software supply chain

Production dependencies are locked and CI blocks high severity npm audit findings. Gate 32 remediated vulnerable transitive PostCSS and Sharp dependency paths through a targeted Next.js upgrade.

Evidence:

* `package.json`
* `package-lock.json`
* `.github/workflows/florida-class-d-lms-gates.yml`
* `docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Open evidence condition: Broader host, code, runtime, and provider vulnerability scanning coverage must be documented for the final CUI scope.

### TR-012 Deterministic build and dependency lock integrity

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.04.01`, `03.04.03`, `03.04.04`, `03.04.08`, `03.16.01`, `03.17.02`, `03.17.03`

Current CMMC Level 2 Rev. 2 crosswalk: `3.4.1`, `3.4.3`, `3.4.4`, `3.4.8`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra GitHub CI

CI installs locked dependencies, verifies lock immutability, runs tests and lint, and builds the production application. Generated Next type drift is committed rather than ignored.

Evidence:

* `package-lock.json`
* `next-env.d.ts`
* `.github/workflows/florida-class-d-lms-gates.yml`

Open evidence condition: SBOM retention, artifact signing, provenance attestation, and approved software inventory remain additional supply chain evidence targets.

### TR-013 Website browser and transport security headers

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.13.01`, `03.13.08`, `03.13.11`, `03.13.15`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.13.1`, `3.13.8`, `3.13.11`, `3.13.15`, `3.13.16`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Vercel

The website enforces CSP, framing protections, HSTS, MIME sniffing protection, cross origin protections, HTTPS upgrade, and no store handling on transactional routes.

Evidence:

* `next.config.ts`
* `docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Open evidence condition: FIPS validated cryptographic module evidence and end to end storage encryption evidence remain required if the future CUI boundary includes these services.

### TR-014 Regulated migration manifest and database promotion binding

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.04.01`, `03.04.03`, `03.04.04`, `03.04.11`, `03.12.01`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.4.1`, `3.4.3`, `3.4.4`, `3.12.1`, `3.12.4`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra GitHub and Supabase

Gate 29 produces a deterministic regulated migration manifest and binds database promotion to the exact candidate SHA, latest migration version, and manifest digest. Gate 37 reconciles the complete 35-file lineage through version 20260814175000 and pins manifest SHA-256 40eb88f6b8cb6ce2716eb260cde7f29d69d78f0a201e90cd6373ac1ebf2be090; no migration is executed by this source gate.

Evidence:

* `scripts/florida-class-d-migration-manifest.mjs`
* `scripts/florida-class-d-migration-parity-gate.mjs`
* `docs/florida-class-d-lms/GATE-29-MIGRATION-PARITY-HANDOFF.md`

Open evidence condition: Production Class D database promotion is intentionally not authorized or performed.

### TR-015 Cryptographic HA evidence gate

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.03.08`, `03.08.09`, `03.12.01`, `03.12.03`, `03.14.06`, `03.16.03`

Current CMMC Level 2 Rev. 2 crosswalk: `3.3.8`, `3.12.1`, `3.12.3`, `3.13.16`, `3.14.6`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and external providers

Gate 31 requires a candidate bound cryptographic HA evidence manifest covering ten subsystems, per evidence digests, recency, RTO, RPO, and failover testing.

Evidence:

* `lib/florida-class-d-ha-evidence.ts`
* `scripts/florida-class-d-ha-evidence-integrity-gate.mjs`
* `docs/florida-class-d-lms/GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`

Open evidence condition: Authentic Vercel, Clerk, Stripe, Daily, document storage, observability, backup and restore, and failover evidence remains incomplete.

### TR-016 Runtime monitoring and production telemetry review

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.03.05`, `03.12.03`, `03.14.03`, `03.14.06`

Current CMMC Level 2 Rev. 2 crosswalk: `3.3.5`, `3.12.3`, `3.14.3`, `3.14.6`

Assessment methods: `examine`, `test`

Responsible boundary: Shared Obserra and Vercel

Vercel runtime telemetry identified Clerk middleware failures, Academy degradation, and canonical traffic served by an unintended duplicate project. Source remediation includes a noncached website liveness contract that reports the nonsecret Vercel project ID, deployment ID, and Git commit SHA; it verifies the observed project against the intended authority. The scheduled production operational gate requires that routing evidence plus live Clerk, Stripe account capability, signed webhook configuration, durable Academy storage, and regulated LMS readiness instead of suppressing degradation.

Evidence:

* `app/api/health/route.ts`
* `app/api/academy/commerce-health/route.ts`
* `.github/workflows/production-e2e-operational-gate.yml`
* `docs/florida-class-d-lms/GATE-35-PRODUCTION-REMEDIATION-DUAL-BASELINE-HANDOFF.md`
* `docs/florida-class-d-lms/ACTION-LEDGER-GATE-35-ADDENDUM.md`

Open evidence condition: Formal continuous monitoring strategy, alert routing, escalation, retention, and periodic review evidence remain required.

### TR-017 Course release identity and certificate payment parity

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.03.02`, `03.04.01`, `03.04.03`, `03.14.08`

Current CMMC Level 2 Rev. 2 crosswalk: `3.3.2`, `3.4.1`, `3.4.3`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra application

The reviewed Academy baseline has one authoritative release identity, version 1.0.0 and published status, consumed consistently by public API, Stripe metadata, and legacy certificate fallback.

Evidence:

* `app/academy/coursePublication.ts`
* `app/api/academy/checkout/route.ts`
* `app/academy/certificate/[courseId]/page.tsx`
* `test/academy-pricing-version-parity.test.mjs`
* `test/academy-certificate-verification.test.mjs`

Open evidence condition: Formal release approval procedure remains organizational evidence.

### TR-018 GitHub change control and exact SHA validation

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.04.03`, `03.04.04`, `03.04.05`, `03.12.01`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.4.3`, `3.4.4`, `3.4.5`, `3.12.1`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra GitHub

Material website and regulated LMS changes are committed on a controlled branch, preserved at exact Git SHAs, and accepted only after the exact pull-request head passes the applicable Website CI, Florida Class D LMS, CodeQL, and CMMC evidence-governance checks. Gate 37 preserves the original 208-path checkpoint at 83364708ae618555ec514d27a93079bad22a7c4c and reconciles the later main history at merge commit 7f9c8f24a2ee1b73cbd0a748e5768486aaf33dbc without rewriting either parent. Three malformed, mis-nested, tag-pinned Copilot CLI action insertions were removed before publication because they made the workflows invalid and introduced an unreviewed supply-chain dependency.

Evidence:

* `.github/workflows/florida-class-d-lms-gates.yml`
* `.github/workflows/website-ci.yml`
* `.github/workflows/cmmc-evidence-governance.yml`
* `.github/workflows/codeql.yml`
* `.github/workflows/academy-70x-production-gate.yml`
* `docs/florida-class-d-lms/LATEST-HANDOFF.md`
* `docs/florida-class-d-lms/ACTION-LEDGER-GATE-35-ADDENDUM.md`

Open evidence condition: Branch protection, administrator role review, signing policy, and organizational change approval evidence should be retained for formal assessment.

### TR-019 External service inventory and shared responsibility tracking

Status: `partial_external_evidence_required`

NIST SP 800-171 Rev. 3: `03.01.20`, `03.04.10`, `03.04.11`, `03.12.05`, `03.16.03`, `03.17.01`, `03.17.03`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.20`, `3.12.4`

Assessment methods: `examine`, `interview`

Responsible boundary: Shared Obserra and external providers

Controlled handoffs identify Vercel, Clerk, Supabase, Stripe, Daily, document storage, observability, and backup dependencies and record which evidence remains provider dependent.

Evidence:

* `docs/florida-class-d-lms/LATEST-HANDOFF.md`
* `docs/florida-class-d-lms/GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
* `docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Open evidence condition: Formal service inventory, contracts, responsibility matrix, provider authorization evidence where required, and CUI flow approval remain incomplete.

### TR-020 Backup and restore evidence gap

Status: `organizational_evidence_required`

NIST SP 800-171 Rev. 3: `03.08.09`, `03.12.03`, `03.16.03`

Current CMMC Level 2 Rev. 2 crosswalk: `3.12.3`

Assessment methods: `examine`, `interview`, `test`

Responsible boundary: Shared Obserra and data storage providers

Backup and restore is explicitly tracked as unresolved external evidence rather than assumed from provider capabilities.

Evidence:

* `docs/florida-class-d-lms/GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
* `docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Open evidence condition: Authoritative backup configuration, encrypted backup evidence, recovery testing, retention, RPO, and RTO must be obtained.

### TR-021 CMMC and NIST traceability single source of truth

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.03.08`, `03.04.01`, `03.04.03`, `03.12.01`, `03.12.03`, `03.15.01`, `03.15.02`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.3.8`, `3.4.1`, `3.4.3`, `3.12.1`, `3.12.3`, `3.12.4`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra GitHub CI

CMMC and NIST traceability is maintained in machine-readable registers. The Gate 35 dual-baseline register explicitly enumerates all 110 Rev. 2 assessment requirements, all 97 active Rev. 3 engineering requirements, and all 33 withdrawn Rev. 3 identifiers. Human-readable output and digests are generated deterministically, and CI fails on schema, catalog, mapping, evidence reference, or generated-document drift.

Evidence:

* `docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json`
* `docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`
* `scripts/cmmc-level2-rev3-traceability.mjs`
* `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.json`
* `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.schema.json`
* `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MATRIX.md`
* `scripts/cmmc-level2-dual-baseline.mjs`
* `.github/workflows/florida-class-d-lms-gates.yml`

Open evidence condition: The SSP and organization wide policies remain separate required assessment evidence and are not auto satisfied by this register.

### TR-022 Regulated runtime isolation and explicit FDACS project binding

Status: `implemented_source_evidence`

NIST SP 800-171 Rev. 3: `03.01.02`, `03.01.05`, `03.04.02`, `03.04.03`, `03.13.01`, `03.13.06`, `03.16.01`

Current CMMC Level 2 Rev. 2 crosswalk: `3.1.2`, `3.1.5`, `3.4.2`, `3.4.3`, `3.13.1`, `3.13.6`

Assessment methods: `examine`, `test`

Responsible boundary: Obserra regulated LMS and isolated FDACS Supabase runtime

Regulated Florida Class D server modules require explicit protected Supabase URL and service-role configuration. The readiness and activation controls derive the expected HTTPS origin from the controlled FDACS project reference rather than embedding a repository URL or using a fallback. Gate 25 scans all regulated modules and fails on embedded Supabase origins or public secret-class environment names.

Evidence:

* `lib/florida-class-d-runtime-readiness.ts`
* `lib/florida-class-d-production-activation.ts`
* `scripts/florida-class-d-runtime-isolation-audit.mjs`
* `docs/florida-class-d-lms/GATE-25-RUNTIME-ISOLATION-HANDOFF.md`

Open evidence condition: Exact-release CI and protected live runtime configuration must still be verified; production activation and CUI processing remain unauthorized.

## Provisional Asset Scope

| Asset | Provisional category | Evidence state |
| --- | --- | --- |
| GitHub repository and GitHub Actions | Security Protection Asset candidate | Source and CI evidence available. |
| Vercel obserra-website-live | CUI Asset or Security Protection Asset candidate depending future CUI use | Production runtime visible. Provider and failover evidence incomplete. |
| Supabase Obserra Academy | CUI Asset candidate if future CUI is stored, otherwise Security Protection or Contractor Risk Managed Asset candidate | Database controls inspectable. Backup and recovery evidence incomplete. |
| Clerk production identity | Security Protection Asset and external service provider candidate | Integration present. Post deployment identity validation and provider evidence pending. |
| Stripe production commerce | External service dependency not intended to receive CUI | Commerce health verified. Provider assurance evidence pending. |
| Daily media service | CUI Asset or Security Protection Asset candidate depending future information flow | Provider configuration and availability evidence pending. |
| Regulated Class D nonproduction Supabase branch | Contractor Risk Managed or test environment candidate | Synthetic nonproduction only. Production activation prohibited. |

## Open Audit Gaps

### GAP-001 Formal CUI scope and asset categorization

Complete the authoritative CMMC Level 2 assessment boundary, asset inventory, network and data flow diagrams, and final asset categories before authorizing CUI.

Mapped Rev. 3 requirements: `03.04.10`, `03.04.11`, `03.15.02`

### GAP-002 System Security Plan and organization defined parameters

Complete the SSP, policies, procedures, rules of behavior, and all applicable Rev. 3 organization defined parameters.

Mapped Rev. 3 requirements: `03.15.01`, `03.15.02`

### GAP-003 Provider assurance and shared responsibility

Retain authoritative security and shared responsibility evidence for Vercel, Clerk, Supabase, Stripe, Daily, document storage, monitoring, and recovery services.

Mapped Rev. 3 requirements: `03.16.03`, `03.17.01`, `03.17.03`

### GAP-004 Backup, recovery, RPO, RTO, and failover evidence

Obtain encrypted backup configuration, recovery test evidence, retention, RPO, RTO, and failover exercise evidence. Do not infer this from vendor marketing.

Mapped Rev. 3 requirements: `03.08.09`, `03.12.03`

### GAP-005 FIPS validated cryptography boundary if CUI is introduced

Identify all cryptographic modules protecting CUI and retain evidence of applicable FIPS validation before CUI processing is authorized.

Mapped Rev. 3 requirements: `03.13.08`, `03.13.10`, `03.13.11`

### GAP-006 Organizational, personnel, training, media, physical, and incident evidence

Collect and approve the non code evidence required by the final assessment scope.

Mapped Rev. 3 requirements: `03.02.01`, `03.02.02`, `03.06.01`, `03.06.02`, `03.06.03`, `03.06.04`, `03.06.05`, `03.08.01`, `03.08.02`, `03.08.03`, `03.08.04`, `03.08.05`, `03.08.07`, `03.09.01`, `03.09.02`, `03.10.01`, `03.10.02`, `03.10.06`, `03.10.07`, `03.10.08`

### GAP-007 Current CMMC Level 2 Rev. 2 assessment crosswalk completion

Trace records include applicable Rev. 2 practice IDs. A complete formal 110 practice crosswalk must be reviewed against current DoD assessment artifacts before an assessment package is declared complete.

Mapped Rev. 3 requirements: cross framework or program level

## Current CMMC Rule State

The governing Level 2 record is bound to 32 CFR Part 170, the September 2024 CMMC Level 2 Assessment Guide version 2.13, NIST SP 800-171 Revision 2, and NIST SP 800-171A June 2018 as incorporated by reference. This historical supporting register does not infer or declare a CMMC implementation-phase status.

NIST SP 800-171 Revision 3 and NIST SP 800-171A Revision 3 are supplemental forward-engineering references only. The authoritative objective-level record, exact source hashes, system separation, evidence ownership, technical results, human disposition, and claim boundaries are maintained in docs/compliance/CMMC-SYSTEM-EVIDENCE.json.

## Authoritative Sources

* https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170
* https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf
* https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
* https://csrc.nist.gov/pubs/sp/800/171/a/final
* https://csrc.nist.gov/pubs/sp/800/171/r3/final
* https://csrc.nist.gov/pubs/sp/800/171/a/r3/final

## Drift Control

CI fails if the source register is invalid, the NIST Rev. 3 catalog is incomplete, a mapped requirement is unknown, evidence references are missing, the generated Markdown differs, or the recorded SHA-256 digest differs.

Verification command: `npm run verify:cmmc-traceability`

