# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-14 ET

This is the current restart authority for the Florida Class D LMS, Obserra Academy website and commerce hardening, and CMMC Level 2 / NIST SP 800-171 Rev. 3 audit-traceability workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Repository authority

Repository: `jblan2026-hub/obserra-website`

Current hardening branch: `feature/cmmc-level2-rev3-audit-package`

Current pull request: `PR #58`

Base: `main`

Gate 33 / PR #56 was merged to `main` at:

`7bb1272847d1f6426ba1cb1b73cf42ea6aee0662`

The current scope is limited to the public website, Obserra Academy/LMS, GitHub backend supporting those services, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime/routing, Academy course publication, and direct dependencies required by those components. Other Obserra application products are outside this workstream.

## Controlled restart records

Read these before changing regulated or audit behavior:

1. `HANDOFF.md`
2. `LATEST-HANDOFF.md`
3. `ACTION-LEDGER.md`
4. `ACTION-LEDGER-GATES-29-32-ADDENDUM.md`
5. `ACTION-LEDGER-GATE-33-ADDENDUM.md`
6. `ACTION-LEDGER-GATE-34-ADDENDUM.md`
7. `GATE-29-MIGRATION-PARITY-HANDOFF.md`
8. `GATE-30-MUTATION-BOUNDARY-HANDOFF.md`
9. `GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
10. `GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`
11. `GATE-33-CMMC-LEVEL-2-REV3-TRACEABILITY-HANDOFF.md`
12. `GATE-34-PRODUCTION-IDENTITY-ROUTING-CMMC-EVIDENCE-HANDOFF.md`
13. `CMMC-LEVEL-2-REV3-TRACEABILITY.json`
14. `CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`
15. `CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`
16. `CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`
17. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`
18. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`
19. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`
20. `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

Historical verifier literals remain historical evidence and must not be rewritten merely because a later gate exists.

## Exact Gate 34 source checkpoint

The completed Gate 34 source checkpoint before final documentation synchronization is:

`0dbc9f6ce5b082161720f3b9a166482033d919f2`

All five mandatory workflows passed on that exact SHA:

- Florida Class D LMS Gates #537.
- Website CI #2285.
- Academy 70x Production Gate #1275.
- Application Release Validation #964.
- Application Production Pipeline #984.

The regulated job is named `Gates 1-34 and website compatibility`. Locked dependency installation, immutable lockfile verification, high-severity production dependency audit, Gates 1 through 34, repository tests, lint, and production build passed.

Documentation/evidence synchronization commits after `0dbc9f6c...` change the PR head. The final documentation head must pass the same five workflows before becoming final Gate 34 authority.

## Historical checkpoints retained

Gates 1 through 31 five-green historical authority:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

Gate 32 source checkpoint:

`c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

Gate 33 final validated documentation authority before merge:

`4891b3b0f1c8a4ad4aa7c9804dd683e22e03b5d2`

Gate 33 merge commit:

`7bb1272847d1f6426ba1cb1b73cf42ea6aee0662`

These remain immutable audit evidence.

## Gate 29 through Gate 31 regulated controls

The Class D regulated migration lineage contains exactly 29 migrations. Latest regulated migration version:

`20260814011203`

Canonical migration manifest SHA-256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Gate 30 enforces the global default-deny Class D mutation boundary before authentication. Normal regulated writes require production regulated-execution authorization. Gate 23 acceptance mutations are separately restricted to explicit regulated nonproduction authorization.

Gate 31 requires candidate-bound cryptographic HA evidence for exactly ten service areas: edge/DNS, application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover. Missing, stale, incomplete, mismatched, or tampered evidence fails closed. No provider HA evidence has been fabricated.

## Gate 32 website, Academy, database, identity, and payment controls

Validated controls retained through Gate 34 include:

- The reviewed nonregulated Academy baseline contains 60 published/purchasable course controls.
- Zero Class D/security-officer-like controls are included in that baseline.
- Academy control failure defaults to unpublished, invisible, and non-purchasable.
- Public catalog is GET-only, public-field-limited, public-visible-only, no-store, and source-controlled.
- Paid Academy media and tutor access require authenticated identity and entitlement in preview and production.
- Stripe Checkout Session creation is POST-only, same-origin protected, and no-store.
- GET checkout is rejected with 405 in the validated source.
- Stripe fulfillment requires signed webhooks and paid status and remains idempotent.
- Deferred redemption revalidates the paid session and verified Clerk email ownership.
- Generic Academy commerce does not activate Florida Class D.
- Academy backend data paths retain forced-RLS/no-client-grant posture where designed as service-only paths.
- Reviewed Academy release identity is version `1.0.0`, status `published`.
- Production dependency audit blocks high-severity findings.

Canonical Academy database migrations added during Gate 32 hardening:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

## Gate 33 CMMC Level 2 / Rev. 3 traceability

Primary engineering baseline: **NIST SP 800-171 Rev. 3**.

Assessment-procedure baseline: **NIST SP 800-171A Rev. 3**.

Current CMMC Level 2 crosswalk: the 110 NIST SP 800-171 Rev. 2 practice identifiers remain separately maintained for the current DoD assessment regime.

Authoritative requirements/register source:

`CMMC-LEVEL-2-REV3-TRACEABILITY.json`

Generated human audit matrix:

`CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

Current Gate 33 register SHA-256:

`7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3`

The Rev. 3 register includes 97 active requirements, 33 withdrawn numbered identifiers, provisional asset scope, implementation traces, Rev. 2 cross-references, evidence references, assessment methods, responsibility boundaries, and explicit gaps. The human matrix is generated, not manually maintained.

Formal CUI assessment scope established: false.

SSP complete: false.

Asset inventory complete: false.

CUI processing authorized: false.

## Gate 34 production identity and routing hardening

Gate 34 creates one Clerk runtime configuration authority:

`lib/clerk-runtime-config.ts`

It normalizes Clerk's supported publishable-key environment names, trims harmless surrounding whitespace, validates matching key environments, requires live keys in Vercel production, and returns only nonsecret diagnostic reason codes. Layout, middleware, and identity health now consume the same authority. Secret values are not retained in audit evidence.

`vercel.json` now source-controls exactly these production aliases:

- `www.obserrallc.com`
- `obserrallc.com`

This is intended to prevent canonical custom domains from remaining pinned to an older READY deployment after a verified production release.

## Gate 34 production evidence no-drift package

Machine-readable source:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human-readable evidence:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Digest:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`

Current machine-source SHA-256:

`f0cab58487e732d08fd5a1f340a86fa18f991b5fa38210abbfa8e7ffbc2546cb`

Generator/verifier:

`scripts/cmmc-level2-rev3-production-evidence.mjs`

Permanent read-only validation:

`npm run verify:cmmc-production-evidence`

Official NIST OSCAL provenance is pinned to `usnistgov/oscal-content`, path `nist.gov/SP800-171/rev3/json/NIST_SP800-171_rev3_catalog.json`, blob SHA:

`1bc9d5ab5f57329c1ab5553b4d2b27ea54d9d13f`

Gate 34 production evidence includes `PRE-009 GitHub protected-branch enforcement gap` so the repository control-plane weakness is machine-readable rather than hidden in prose.

The temporary write-capable Gate 34 bootstrap workflow was removed after generated artifacts were produced. No permanent write-capable CMMC evidence workflow remains.

## GitHub branch-protection gap

Direct repository inspection on 2026-08-14 found `main` with:

- `protected: false`
- branch-protection enforcement disabled
- required status-check enforcement off

This is an open configuration/change-control gap mapped to Rev. 3 requirements including `03.01.05`, `03.04.03`, `03.04.05`, `03.12.01`, and `03.16.01`.

The current connected GitHub toolset exposes no branch-protection/ruleset mutation. Therefore the gap remains open until an authorized GitHub administrator enables and evidences a `main` protection/ruleset requiring the governed pull-request path and mandatory release checks.

Do not represent voluntary five-green validation as equivalent to technical branch enforcement.

## Live Supabase boundary

Main project: `Obserra Academy`

Project ref: `nwxnyqlyzyufgoadtqxs`

Last directly observed state: `ACTIVE_HEALTHY`.

Production Class D schema objects: zero.

Regulated nonproduction branch: `obserra-fdacs-lms-nonprod`

Project ref: `jeklrsratrijrsamdauv`

Purpose: synthetic regulated acceptance only.

No Class D production database promotion has occurred.

The connected Supabase control plane does not expose authoritative backup/restore configuration evidence. Backup, restore, retention, recovery testing, RPO, RTO, and failover remain unverified rather than assumed.

## Live Vercel and canonical routing boundary

Team: `ObserraLLC`

Team slug: `obserra`

Team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`

Project: `obserra-website-live`

Project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`

Gate 33 merge deployment:

`dpl_7e9hNGYHF1M7xxkvYQHqN6kzZxwY`

Source SHA:

`7bb1272847d1f6426ba1cb1b73cf42ea6aee0662`

Observed state: READY.

However, direct runtime logs established that canonical traffic remained on older deployment:

`dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`

Older source SHA:

`80473277620e05acd5359330a706204703c999f0`

That routing drift is the reason Gate 34 source-controls the canonical aliases. After PR #58 merge, both domains must be verified against the exact new production deployment before routing acceptance is closed.

## Florida Class D production boundary

Florida Class D production remains **fail closed**.

Nothing in Gates 29 through 34 authorizes public regulated enrollment, real regulated learner access, production Class D scheduling, instruction, examination access, LIAS production execution, official completion release, regulated observer access, Class D production database promotion, CUI processing, or regulated runtime activation.

The historical Gate 23 18-of-18 synthetic UAT record is not candidate-bound to the current release and cannot be reused as final acceptance.

Class D production still requires, at minimum, applicable licensing/authorization, fresh exact-candidate UAT, production database promotion from the exact candidate, authentic HA/recovery evidence, security acceptance, rollback evidence, and explicit production activation prerequisites.

No CI result, handoff, source commit, provider state, or evidence mapping is FDACS approval or CMMC certification.

## Controlled filing baseline

Private controlled filing baseline remains:

- LMS Guide DOCX/PDF v0.15, PDF 43 pages.
- Submission Readiness Register v1.5.
- Controlled Pre-Filing Packet v0.15, live evidence only.
- Controlled packet ZIP SHA-256 `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.
- Curriculum SHA-256 `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.
- Examination SHA-256 `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

`DS-SUBMISSION-LMS-GUIDE-CONTROL.md` remains older public metadata and must not be represented as synchronized with the private filing baseline until a controlled revision lands.

## Next governed actions

1. Validate the final Gate 34 documentation/evidence head with all five mandatory workflows.
2. Confirm PR #58 is mergeable and still limited to website/Academy/LMS dependencies.
3. Merge PR #58 under the existing owner authorization only after the exact final head is five green.
4. Verify the new Vercel production deployment is READY, bound to the exact merge SHA, and owns both canonical custom domains.
5. Verify canonical production Clerk authentication/identity, Academy 60-course catalog, POST-only checkout, GET checkout 405, Stripe commerce health, signed-webhook readiness, security headers, runtime telemetry, and Class D fail-closed behavior.
6. Enable/evidence GitHub `main` branch protection/ruleset through an authorized administrative path and close `PRE-009` only after direct verification.
7. Continue authentic provider HA/recovery evidence collection and complete formal CUI scope, SSP, organization-defined parameters, policies/procedures, and organizational assessment evidence before any CUI authorization or broader CMMC claim.
