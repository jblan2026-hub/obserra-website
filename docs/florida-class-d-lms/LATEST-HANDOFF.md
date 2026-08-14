# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 ET

This is the current restart authority for the Florida Class D LMS, Obserra Academy website and commerce hardening, and CMMC Level 2 audit traceability workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Repository authority

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

PR state at last direct verification: open, mergeable, unmerged.

The current workstream is limited to the public website, Obserra Academy and LMS, the GitHub backend supporting those services, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime, Academy course publication, and direct dependencies required by those components. Other Obserra applications are outside this workstream and must not be modified as part of this release.

## Controlled restart records

Read these records before changing regulated or audit behavior:

1. `HANDOFF.md`
2. `LATEST-HANDOFF.md`
3. `ACTION-LEDGER.md`
4. `ACTION-LEDGER-GATES-29-32-ADDENDUM.md`
5. `ACTION-LEDGER-GATE-33-ADDENDUM.md`
6. `CURRENT-STATUS-2026-08-13.md`
7. `GATE-29-MIGRATION-PARITY-HANDOFF.md`
8. `GATE-30-MUTATION-BOUNDARY-HANDOFF.md`
9. `GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
10. `GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`
11. `GATE-33-CMMC-LEVEL-2-REV3-TRACEABILITY-HANDOFF.md`
12. `CMMC-LEVEL-2-REV3-TRACEABILITY.json`
13. `CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`
14. `CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`
15. `CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`
16. `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

Historical verifier literals in older records remain historical evidence and must not be rewritten merely to reflect a later gate number.

## Exact completed Gate 33 source checkpoint

The current completed Gate 33 source checkpoint before final documentation synchronization is:

`13f7d12050dca9d700c017879b2d1b212bd1d07a`

All five primary workflows passed on that exact SHA:

Florida Class D LMS Gates #532.

Website CI #2263.

Academy 70x Production Gate #1270.

Application Release Validation #959.

Application Production Pipeline #978.

The Florida Class D job is named `Gates 1-33 and website compatibility`. On this SHA the production dependency audit, Gates 1 through 33, repository tests, lint, and production application build all passed.

Documentation commits after `13f7d120...` change the branch SHA. The final documentation head must pass the same five workflows before it becomes the final Gate 33 branch authority.

## Historical checkpoints retained

The historical Gates 1 through 31 exact five-green authority remains:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

The completed Gate 32 source checkpoint remains:

`c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

These checkpoints remain immutable audit evidence rather than being rewritten by Gate 33.

## Gate 29 regulated migration parity

The authoritative Class D migration lineage contains exactly 29 migrations.

Latest regulated migration version:

`20260814011203`

Canonical migration manifest SHA 256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Gate 29 binds regulated database promotion to exact source candidate identity, candidate bound UAT, deployed runtime identity, production database source identity, latest migration version, and manifest digest.

## Gate 30 default deny mutation boundary

All covered Class D POST, PUT, PATCH, and DELETE requests pass through the global regulated mutation boundary before authentication.

Normal regulated writes require production regulated execution authorization. The Gate 23 acceptance route is separately restricted to explicit regulated nonproduction authorization. Existing route controls remain defense in depth.

## Gate 31 cryptographic HA evidence

Gate 31 requires candidate bound cryptographic evidence for exactly ten service areas: edge and DNS, application runtime, identity, database, media, document storage, commerce, observability, backup and restore, and failover.

The evidence contract requires per evidence SHA 256 values, canonical manifest SHA 256, recency, exact candidate identity, RTO at or below 60 minutes, RPO at or below 15 minutes, and failover evidence no older than 90 days.

Missing, stale, incomplete, mismatched, or tampered evidence fails closed. No external provider HA evidence has been fabricated.

## Gate 32 website, Academy, database, identity, and payment security

Gate 32 retains the following validated source controls.

The website exports `clerkMiddleware()` through the supported boundary. Paid Academy media and the Academy Tutor require authenticated identity and current course entitlement in preview and production. Generic preview authentication bypasses were removed.

The Academy public catalog is GET only, public field limited, public visible only, and fail closed if the control service is unavailable.

The reviewed nonregulated Academy baseline contains 60 published and purchasable course controls. There are zero Class D or security officer like controls in that baseline. The regulated Class D course remains excluded.

Canonical publication migration:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

The reviewed Academy release identity is centrally governed as version `1.0.0` with release status `published`. Public API, Stripe metadata, and legacy certificate fallback consume the same authority.

Stripe Checkout Session creation is POST only in the validated branch, same origin protected, form content type restricted, current course authorization checked, webhook readiness checked, and no store. GET is rejected with 405 in the Gate 32 source.

Deferred paid course claims require a paid Stripe session and exact Clerk user binding or a verified Clerk email matching the Stripe purchaser email. Signed Stripe webhooks remain the entitlement fulfillment authority and fulfillment remains idempotent.

The production dependency baseline is Next.js `16.3.1`, `eslint-config-next` `16.3.1`, React `19.2.8`, and React DOM `19.2.8`. CI blocks high severity production dependency audit findings.

The Academy database worker index migration is:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

Reviewed Academy data tables and privileged database functions retain the backend only access model documented in the Gate 32 handoff.

## Gate 33 CMMC Level 2 audit traceability

Gate 33 makes audit traceability a controlled release function rather than a manually maintained document.

### Primary engineering baseline

The primary engineering baseline is **NIST SP 800-171 Rev. 3**.

The assessment procedure baseline is **NIST SP 800-171A Rev. 3**.

The current CMMC Level 2 assessment crosswalk remains separately tied to the 110 NIST SP 800-171 Rev. 2 requirements until the governing DoD assessment regime changes. The Rev. 3 engineering package is not represented as CMMC certification.

### Machine readable source of truth

Authoritative source:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json`

Schema:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`

The machine source includes all 97 active Rev. 3 requirements, all 33 withdrawn numbered identifiers, provisional asset scope, 21 initial implementation trace records, current Rev. 2 cross references, evidence references, assessment methods, responsibility boundaries, and open audit gaps.

### Human readable generated audit matrix

Generated audit matrix:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

The Markdown is generated from the JSON source. It must not be edited independently.

### Source digest

Digest record:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`

Current traceability JSON SHA 256:

`7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3`

### Deterministic generator and verifier

Generator and verifier:

`scripts/cmmc-level2-rev3-traceability.mjs`

Generation command:

`npm run generate:cmmc-traceability`

Read only validation command:

`npm run verify:cmmc-traceability`

Permanent Gate 33 CI executes the read only validation command.

Gate 33 fails for malformed machine data, an incomplete Rev. 3 requirement catalog, missing withdrawn identifiers, unknown or withdrawn mappings, missing evidence paths, malformed trace records, generated Markdown drift, or digest drift.

The one time write capable bootstrap workflow used to create the initial generated artifacts completed successfully and was then deleted. No permanent write capable CMMC generation workflow remains.

### Conservative audit status

Technical source evidence does not automatically satisfy an entire NIST requirement. The generated matrix remains conservative when provider, organizational, personnel, physical, media, training, incident, cryptographic, or scope evidence is incomplete.

The initial matrix records 65 active requirements as requiring additional external evidence, 27 as requiring organizational evidence, and 5 as scope dependent. No active Rev. 3 requirement is represented as fully satisfied solely by source code evidence.

### CUI authorization state

The machine source explicitly records:

Formal CUI assessment scope established: false.

SSP complete: false.

Network diagram complete: false.

Asset inventory complete: false.

CUI processing authorized: false.

The website and Academy must not be marketed or represented as authorized to process CUI until the contract specific scope, asset categorization, SSP, network and data flow diagrams, organization defined parameters, provider responsibility evidence, cryptographic evidence where required, policies, procedures, and assessment evidence are complete.

## Gate 33 open audit gaps

The machine register preserves seven open audit conditions.

`GAP-001` formal CUI scope and asset categorization.

`GAP-002` SSP, policy set, procedures, Rules of Behavior, and organization defined parameters.

`GAP-003` provider assurance and shared responsibility evidence.

`GAP-004` backup, restore, recovery, RPO, RTO, and failover evidence.

`GAP-005` applicable FIPS validated cryptographic evidence if CUI is introduced.

`GAP-006` organizational, personnel, training, media, physical, and incident response evidence.

`GAP-007` formal complete review of the current CMMC Level 2 Rev. 2 110 requirement assessment crosswalk.

These are audit gaps, not approvals and not authorization to process CUI.

## Live Supabase boundary

Main project:

Name: `Obserra Academy`

Project ref: `nwxnyqlyzyufgoadtqxs`

Observed state: `ACTIVE_HEALTHY`

Production Class D schema objects: zero.

Regulated nonproduction branch:

`obserra-fdacs-lms-nonprod`

Project ref: `jeklrsratrijrsamdauv`

Purpose: synthetic Class D acceptance and regulated nonproduction validation only.

No Class D production database promotion has occurred.

The current Supabase connector does not expose authoritative backup configuration or recovery evidence. Backup and restore remains unverified rather than assumed.

## Live Vercel and website boundary

Direct Vercel control plane verification established the intended production scope:

Team slug: `obserra`

Team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`

Project: `obserra-website-live`

Project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`

Public host: `www.obserrallc.com`

Currently serving production deployment:

Deployment ID: `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`

Source SHA: `80473277620e05acd5359330a706204703c999f0`

Observed state: READY.

The live production deployment still predates the Gate 32 and Gate 33 branch fixes. Direct feature branch deployments are canceled under Vercel verified Git commit policy because those direct feature commits are marked unverified. Verified GitHub generated merge commits are allowed to build and reach READY.

No Vercel project move, project creation, or DNS change was performed.

The live Academy currently serves all 60 authorized nonregulated courses. The old production deployment still contains the pre Gate 32 Clerk middleware path and legacy GET checkout behavior. Do not invoke the legacy live GET checkout URL as a test because the old route can create a real Stripe session.

Public Academy:

`https://www.obserrallc.com/academy`

## Florida Class D production boundary

Florida Class D production remains **fail closed**.

Nothing in Gates 29 through 33 authorizes public regulated enrollment, real regulated learner access, production scheduling, live Class D instruction, production examination access, LIAS production execution, official completion release, regulated observer access, Class D database promotion, CUI processing, or regulated runtime activation.

No source commit, audit mapping, CI result, UAT result, HA artifact, provider state, filing package, or traceability record is FDACS approval or CMMC certification.

The historical Gate 23 18 of 18 synthetic UAT record is not candidate bound to the current source and cannot be reused as final acceptance.

## Controlled filing baseline

Current controlled private filing artifacts remain:

LMS Guide DOCX v0.15.

LMS Guide PDF v0.15, 43 pages.

Submission Readiness Register v1.5, 6 pages.

Controlled Pre Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA 256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA 256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA 256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

`DS-SUBMISSION-LMS-GUIDE-CONTROL.md` remains older public metadata and must not be represented as synchronized with the current private filing baseline until a controlled revision actually lands.

## Remaining production and audit blockers

The final Gate 33 documentation head still requires exact five workflow validation.

The website Gate 32 and Gate 33 candidate has not yet been promoted to production.

Post deployment Clerk identity and entitlement behavior remains to be verified on the deployed candidate.

Post deployment Stripe POST only checkout, GET rejection, signed webhook fulfillment, course release identity, and runtime behavior remain to be verified on the deployed candidate.

Authentic Vercel, Clerk, Stripe, Daily, document storage, observability, backup and restore, and failover evidence remains incomplete for Gate 31.

Formal CUI scope, asset categorization, SSP, organization defined parameters, policies, procedures, organizational evidence, provider responsibility evidence, and the complete CMMC assessment crosswalk remain incomplete.

Fresh exact candidate Gate 23 18 of 18 synthetic UAT remains required on regulated nonproduction before Class D production activation.

Class D production database promotion has not occurred.

Actual Class DS authorization remains required.

Current DI instructor authorization remains required where applicable.

Final security, rollback, website production promotion, and Class D activation decisions remain owner controlled.

## Next governed actions

Validate the final documentation synchronized branch head with all five primary workflows.

Update PR #56 to Gates 1 through 33 and record the final exact validated checkpoint without rewriting historical evidence.

Keep PR #56 open and unmerged until the owner explicitly authorizes the normal verified GitHub merge and website production promotion.

Do not promote the Class D schema and do not activate regulated Class D production.

After an authorized website deployment, verify the exact deployed SHA, Clerk authentication, Academy entitlements, all 60 authorized courses, POST only Stripe checkout, GET checkout rejection, signed webhook fulfillment, version `1.0.0`, release status `published`, security headers, runtime telemetry, and rollback behavior.

Continue collecting authentic provider HA, recovery, security, and shared responsibility evidence for the Gate 31 and CMMC audit packages.

Complete formal CUI scoping and SSP work before any future authorization to process CUI.
