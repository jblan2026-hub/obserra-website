# Gate 33 CMMC Level 2 and NIST SP 800-171 Rev. 3 Traceability Handoff

Snapshot: 2026-08-13 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

## Purpose

Gate 33 establishes deterministic, audit traceable security documentation for the public website, Obserra Academy and LMS, their GitHub backend, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime, and dependencies directly required by those components.

The primary engineering baseline is **NIST SP 800-171 Rev. 3**. Assessment procedure alignment uses **NIST SP 800-171A Rev. 3**. Because the currently enforced CMMC Level 2 assessment regime still references the 110 requirements in NIST SP 800-171 Rev. 2, the traceability register retains a separate current CMMC Level 2 Rev. 2 crosswalk. The Rev. 3 baseline is not represented as a formal CMMC certification standard until the governing DoD assessment baseline changes.

This handoff does not claim CMMC certification, a CMMC status in SPRS, FedRAMP authorization, FDACS approval, or authorization to process CUI.

## Exact Gate 33 source checkpoint

The completed Gate 33 source checkpoint before this documentation synchronization is:

`13f7d12050dca9d700c017879b2d1b212bd1d07a`

All five primary workflows passed on that exact SHA:

Florida Class D LMS Gates #532.

Website CI #2263.

Academy 70x Production Gate #1270.

Application Release Validation #959.

Application Production Pipeline #978.

The Florida Class D workflow job is now named `Gates 1-33 and website compatibility`. Gate 33 itself passed before repository tests, lint, and the production build completed successfully.

Any later documentation synchronization commit changes the branch SHA and therefore requires the same five workflow validation before becoming the final Gate 33 handoff authority.

## Single source of truth

The authoritative machine readable security traceability source is:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json`

The machine source contains the complete active NIST SP 800-171 Rev. 3 requirement catalog used by this workstream, all withdrawn numbered requirement identifiers, provisional asset scope, implementation trace records, current CMMC Level 2 Rev. 2 cross references, evidence references, assessment methods, responsible boundaries, and open audit gaps.

The JSON source is governed by:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`

The deterministic generator and verifier is:

`scripts/cmmc-level2-rev3-traceability.mjs`

The generated human readable audit matrix is:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

The machine source digest record is:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`

Current generated registry SHA 256:

`7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3`

The human readable file is generated output and is not an independent source of truth.

## Drift prevention

The canonical generation command is:

`npm run generate:cmmc-traceability`

The canonical validation command is:

`npm run verify:cmmc-traceability`

Gate 33 fails if the JSON register is malformed, the active Rev. 3 catalog does not contain exactly 97 active requirements, the withdrawn list does not contain exactly 33 unique identifiers, the active and withdrawn identifiers do not exactly cover the numbered Rev. 3 requirement slots, a trace record maps an unknown or withdrawn requirement, an evidence path does not exist, a required trace field is absent, the generated Markdown differs from deterministic output, or the recorded SHA 256 differs from the machine source.

The normal Gate 33 workflow has read only repository permission. A one time temporary bootstrap workflow was used only to generate the initial Markdown and digest and to correct two stale Academy media evidence references. Bootstrap run #1 completed successfully and generated branch head `2e5eabe6fae7c7bcf499666a84119a31c304a09d`. The write capable bootstrap workflow was then deleted at commit `f2cb2b667a8a61974ac05e9081cc9ca1002d843e` and is not part of the permanent CI architecture.

## NIST SP 800-171 Rev. 3 requirement catalog

The machine register contains the 97 active requirements across all 17 Rev. 3 families and separately records the 33 withdrawn numbered identifiers. Gate 33 verifies the catalog mechanically so a requirement cannot disappear from the audit package without CI failure.

NIST SP 800-171 Rev. 3 remains the authoritative engineering requirement source. NIST SP 800-171A Rev. 3 remains the assessment procedure source. NIST also publishes the Rev. 3 datasets through the Cybersecurity and Privacy Reference Tool in machine consumable formats.

Official NIST sources retained in the machine register include:

`https://csrc.nist.gov/pubs/sp/800/171/r3/final`

`https://csrc.nist.gov/pubs/sp/800/171/a/r3/final`

`https://csrc.nist.gov/projects/cprt/catalog`

## CMMC Level 2 current rule crosswalk

Gate 33 deliberately maintains two concepts separately.

The engineering baseline is NIST SP 800-171 Rev. 3.

The current CMMC Level 2 rule crosswalk remains NIST SP 800-171 Rev. 2 with 110 requirements until the governing DoD assessment regime changes. The Rev. 2 identifiers attached to implementation trace records are audit navigation aids. A formal complete 110 requirement CMMC assessment crosswalk remains an explicit open audit item and is not inferred from the Rev. 3 technical mappings.

The current DoD rule state and source references are retained in the machine register rather than hard coded into security behavior.

## Initial implementation trace records

The initial register contains 21 trace records covering the major design and remediation decisions already implemented in Gates 29 through 33.

The mapped topics include the default deny regulated mutation boundary, Clerk identity and learner authorization, preview authentication bypass removal, public Academy catalog minimization, fail closed course publication controls, Supabase row level and privileged function boundaries, Stripe POST only same origin checkout, signed webhook fulfillment, verified purchaser identity for deferred claims, audit evidence preservation, dependency vulnerability remediation, deterministic locked builds, website transport and browser security headers, regulated migration binding, cryptographic HA evidence, production telemetry review, course release identity parity, exact SHA GitHub change control, external service responsibility tracking, backup and restore evidence gaps, and machine and human audit traceability.

Every trace record carries NIST Rev. 3 requirement identifiers, current CMMC Rev. 2 cross references where applicable, implementation narrative, evidence references, assessment methods using examine, interview, and test terminology, responsible boundary, implementation status, and an unresolved evidence condition where applicable.

## Conservative audit status model

Gate 33 does not treat a source code control as proof that an entire NIST requirement has been satisfied. Family defaults remain conservative when the requirement also depends on provider configuration, organizational process, personnel evidence, physical protection, training, media management, incident response, or final CUI scope.

The initial generated matrix therefore reports no Rev. 3 requirement as fully satisfied solely by source evidence. It records 65 requirements as requiring additional external evidence, 27 as requiring organizational evidence, and 5 as scope dependent. The implementation trace records still identify the technical evidence already available for assessor examination and testing.

This approach prevents technical evidence from silently promoting an incomplete organizational requirement to complete.

## Formal CUI boundary remains closed

The machine register explicitly records:

Formal CUI assessment scope established: false.

SSP complete: false.

Network diagram complete: false.

Asset inventory complete: false.

CUI processing authorized: false.

The current production website and Academy must not be represented as authorized to process, store, or transmit CUI until the contract specific assessment scope, asset categorization, SSP, network and data flow diagrams, organization defined parameters, provider responsibility evidence, required cryptographic evidence, policies, procedures, and assessment evidence are complete.

## Provisional asset tracking

The machine register currently tracks GitHub and GitHub Actions, Vercel `obserra-website-live`, Supabase `Obserra Academy`, Clerk production identity, Stripe production commerce, Daily media, and the regulated Class D nonproduction database as provisional assessment assets or dependencies.

These classifications are intentionally provisional. Final CMMC asset categorization depends on the actual CUI information flow and assessment scope.

## Open audit gaps

Gate 33 explicitly retains seven open program gaps so unresolved work cannot disappear from the audit record.

`GAP-001` covers formal CUI scope and asset categorization.

`GAP-002` covers the System Security Plan, policy set, procedures, Rules of Behavior, and Rev. 3 organization defined parameters.

`GAP-003` covers external provider assurance and the shared responsibility model.

`GAP-004` covers backup, restore, recovery testing, RPO, RTO, and failover evidence.

`GAP-005` covers the FIPS validated cryptographic boundary if CUI is introduced.

`GAP-006` covers organizational, personnel, training, media, physical, and incident response evidence.

`GAP-007` covers formal completion and review of the current CMMC Level 2 Rev. 2 110 requirement assessment crosswalk.

These gaps are not POA&M approvals and do not authorize CUI processing.

## Existing website, Academy, payment, and database controls retained

Gate 33 does not replace Gate 32. The 60 reviewed nonregulated Academy courses remain published through the fail closed control plane. The regulated Class D course remains excluded. The public catalog remains GET only and public field limited. Stripe checkout remains POST only and same origin protected in the validated source. Deferred claims require a paid Stripe session and verified identity binding. Signed Stripe webhooks remain the fulfillment authority. Clerk middleware and paid learner authorization fixes remain in source. Supabase database access controls and the Academy worker indexes remain in place. The production dependency audit remains mandatory.

## Existing Class D regulatory boundary retained

Florida Class D production remains **fail closed**.

No Gate 33 mapping, JSON record, Markdown report, SHA digest, CI result, or NIST crosswalk authorizes public Class D enrollment, real regulated learner access, live regulated instruction, examination, LIAS production execution, completion release, Class D database promotion, or production activation.

The main Supabase project still contains zero `fdacs_class_d_*` production schema objects.

The historical Gate 23 synthetic UAT is not candidate bound to the current source and cannot be reused for final acceptance.

Actual Class DS authorization, current DI instructor authorization where required, fresh exact candidate Gate 23 UAT, authentic provider HA and recovery evidence, production database promotion evidence, security and rollback acceptance, and explicit owner controlled Class D production activation remain required.

## Next governed actions

The immediate action is to synchronize `LATEST-HANDOFF.md`, create the Gate 33 append only audit record, update PR #56 to Gates 1 through 33, and then require all five workflows to pass on the final documentation head.

After a final documentation head is green, PR #56 remains open and unmerged until the owner explicitly authorizes the normal verified GitHub merge and website production promotion.

After an authorized website deployment, the exact deployed SHA, Clerk authentication, learner entitlement enforcement, all 60 Academy courses, POST only Stripe checkout, GET checkout rejection, signed webhook fulfillment, course release identity, security headers, runtime telemetry, and rollback behavior must be verified against production.

Regulated Class D activation remains a separate later decision after all regulatory, UAT, database, provider, HA, recovery, and owner controlled conditions pass.
