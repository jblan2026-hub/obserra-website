# Gate 34 Production Identity, Routing, and CMMC Evidence Handoff

Snapshot: 2026-08-14 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/cmmc-level2-rev3-audit-package`

Pull request: `PR #58`

## Purpose

Gate 34 hardens the production website and Academy/LMS dependency chain after the Gate 33 release was merged. It addresses production identity configuration consistency, canonical Vercel domain binding, release evidence provenance, and no-drift CMMC Level 2 / NIST SP 800-171 Rev. 3 evidence.

This gate does **not** authorize CUI processing, activate Florida Class D production, claim CMMC certification, claim FedRAMP authorization, or claim FDACS approval.

## Exact Gate 34 source checkpoint

The exact five-green source checkpoint is:

`0dbc9f6ce5b082161720f3b9a166482033d919f2`

All five mandatory release workflows passed on that SHA:

- Florida Class D LMS Gates #537: success.
- Website CI #2285: success.
- Academy 70x Production Gate #1275: success.
- Application Release Validation #964: success.
- Application Production Pipeline #984: success.

The regulated job is named `Gates 1-34 and website compatibility`. On the exact checkpoint, the locked dependency install, immutable lockfile check, high-severity production dependency audit, Gates 1 through 34, repository tests, lint, and production build passed.

Documentation commits after this checkpoint change the PR head and must pass the same five workflows before becoming final Gate 34 authority.

## Production state inherited from Gate 33 merge

PR #56 was merged to `main` at:

`7bb1272847d1f6426ba1cb1b73cf42ea6aee0662`

Vercel created production deployment:

`dpl_7e9hNGYHF1M7xxkvYQHqN6kzZxwY`

That deployment reached READY and is bound to the exact merge SHA.

Direct runtime review then established that the canonical custom domains were still attached to older production deployment:

`dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`

Older source SHA:

`80473277620e05acd5359330a706204703c999f0`

The older deployment retained the historical Clerk middleware error and legacy Academy GET checkout behavior. The issue was therefore production routing drift, not evidence that the validated merge build had failed.

## Canonical production routing remediation

`vercel.json` now source-controls exactly these production aliases:

- `www.obserrallc.com`
- `obserrallc.com`

Vercel's project schema applies configured aliases when a deployment is READY and targets production. The source-controlled alias declaration is intended to ensure future verified `main` production deployments deterministically receive the canonical domains instead of leaving them pinned to an older deployment.

No Vercel project was created or moved. No DNS ownership change was performed.

Post-merge acceptance must prove that both canonical domains resolve to the exact accepted Gate 34 production deployment before PRE-002 is closed.

## Clerk identity remediation

The previous source had separate Clerk configuration validators in layout, middleware, and identity health logic. That allowed configuration interpretation to drift.

Gate 34 introduces one server-side authority:

`lib/clerk-runtime-config.ts`

The runtime authority:

- accepts Clerk's supported `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` names;
- normalizes harmless surrounding whitespace;
- validates publishable-key structure without exposing key material;
- validates secret-key environment without returning or logging the secret;
- requires publishable and secret environments to match;
- requires live keys in Vercel production;
- normalizes the supported publishable-key environment names before Clerk middleware initialization; and
- returns only nonsecret readiness metadata and reason codes.

`app/layout.tsx`, `proxy.ts`, and `lib/identity-runtime.ts` consume this shared authority. The duplicated validators were removed. `proxy.ts` retains direct `export default clerkMiddleware(...)` behavior.

Post-deployment identity acceptance must prove production Clerk authentication is healthy. If identity remains degraded, only nonsecret reason codes may be used for diagnosis. Key values must never be placed in GitHub, audit documents, logs, or chat.

## Gate 34 CMMC / NIST production evidence

Machine-readable source:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human-readable evidence:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Digest:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`

Current source SHA-256:

`540397937a06531468d307a6f5b01c196f5cd8907619efe73cb48fd0f555b8c4`

Generator/verifier:

`scripts/cmmc-level2-rev3-production-evidence.mjs`

Read-only CI command:

`npm run verify:cmmc-production-evidence`

The evidence package maps production identity, canonical routing, release verification, Stripe payment, Academy database controls, no-drift traceability, HA/recovery evidence, and regulated Class D separation to NIST SP 800-171 Rev. 3 requirements and current CMMC Level 2 Rev. 2 practice identifiers.

Official NIST machine-readable provenance is pinned to:

Repository: `usnistgov/oscal-content`

Path: `nist.gov/SP800-171/rev3/json/NIST_SP800-171_rev3_catalog.json`

Blob SHA: `1bc9d5ab5f57329c1ab5553b4d2b27ea54d9d13f`

The one-time Gate 34 generator workflow was used only to create generated artifacts and was deleted before permanent validation. Its first artifact-detection implementation incorrectly used `git diff --quiet`, which does not detect new untracked generated files. That bootstrap defect was identified before release acceptance, corrected to `git status --porcelain`, rerun successfully, and the temporary writer was then removed. This history is retained as audit evidence rather than hidden.

## CMMC / Rev. 3 control mapping summary

Key Gate 34 mappings include:

- Identity and authentication: `03.01.02`, `03.01.05`, `03.05.01`, `03.05.03`, `03.05.04`, `03.05.12`, `03.13.15`, `03.16.03`.
- Production configuration and routing: `03.04.01`, `03.04.02`, `03.04.03`, `03.04.05`, `03.13.01`, `03.13.06`, `03.16.01`.
- Exact-SHA release evidence and monitoring: `03.03.05`, `03.04.03`, `03.04.04`, `03.12.01`, `03.12.03`, `03.14.06`, `03.16.01`.
- Commerce authorization and auditability: `03.01.02`, `03.01.03`, `03.01.05`, `03.03.01`, `03.03.02`, `03.13.15`, `03.16.03`.
- Database least privilege and default deny: `03.01.02`, `03.01.03`, `03.01.05`, `03.04.01`, `03.04.02`, `03.13.06`, `03.16.03`.
- Audit no-drift and evidence protection: `03.03.08`, `03.04.01`, `03.04.03`, `03.12.01`, `03.12.03`, `03.15.02`, `03.16.01`.

The current CMMC Level 2 Rev. 2 crosswalk remains preserved in the machine-readable evidence because the DoD assessment regime has not yet moved to Rev. 3. Rev. 3 remains the Obserra engineering baseline.

## New GitHub change-control gap

Direct GitHub control-plane inspection on 2026-08-14 established that the repository `main` branch currently reports:

- `protected: false`
- branch protection enabled: false
- required status checks enforcement: off

This is a material configuration/change-control gap. Voluntarily waiting for five green workflows is not equivalent to technically enforcing those workflows at the protected branch boundary.

Applicable Rev. 3 mappings include:

- `03.01.05` Least Privilege
- `03.04.03` Configuration Change Control
- `03.04.05` Access Restrictions for Change
- `03.12.01` Security Assessment
- `03.16.01` Security Engineering Principles

The connected GitHub toolset in this session exposes repository inspection and PR/commit operations but does not expose branch-protection or ruleset mutation. Therefore this control cannot be represented as remediated from this session.

Before the repository is represented as fully production change-control aligned, an authorized GitHub administrator must enforce a `main` branch protection/ruleset requiring the governed PR path and mandatory release checks, and the resulting control-plane state must be retained as evidence.

## Website, Academy, payment, and database controls retained

Gate 34 preserves the Gate 32 controls:

- 60 reviewed nonregulated Academy courses remain the authorized baseline.
- Florida Class D is excluded from generic Academy commerce.
- Academy publication/control failure remains fail closed.
- Stripe Checkout Session creation remains POST-only and same-origin.
- Stripe fulfillment remains signature-verified, paid-status checked, and idempotent.
- Deferred redemption revalidates payment and verified Clerk email ownership.
- Academy backend-only database paths retain forced RLS/no client-grant posture.
- Public catalog remains GET-only and field-limited.
- Production dependency audit remains mandatory.

## High availability and recovery boundary

Gate 31 remains authoritative for Class D HA acceptance. Authentic evidence is still required for application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover.

A READY Vercel deployment in `iad1` is not represented as multi-region failover evidence.

The connected Supabase control plane does not expose authoritative project backup/restore configuration evidence. Backup, restore, RPO, RTO, retention, and failover evidence remain open rather than inferred.

## Florida Class D boundary

Florida Class D production remains **fail closed**.

The main Supabase production project has no promoted Class D production schema. The historical Gate 23 UAT record is not candidate-bound to Gate 34. Fresh exact-candidate synthetic acceptance, licensing prerequisites, provider HA evidence, production database promotion, security acceptance, rollback evidence, and explicit activation requirements remain required before regulated production may be enabled.

Nothing in Gate 34 authorizes real Class D enrollment, instruction, examinations, LIAS production execution, official completion release, regulated observer access, or Class D production mutation execution.

## Next governed actions

1. Synchronize the restart handoff and append-only Gate 34 action ledger.
2. Revalidate the final documentation head with all five mandatory workflows.
3. Merge PR #58 only after the exact final head is five green and mergeable. User authorization for the website/nonregulated Academy production hardening path has already been provided.
4. Verify Vercel creates a READY production deployment from the verified merge commit and that both canonical domains move to that exact deployment.
5. Verify canonical production runtime: Clerk identity, Academy 60-course catalog, POST-only checkout, GET checkout 405 behavior, Stripe health, security headers, runtime telemetry, and Class D fail-closed behavior.
6. Obtain/enforce GitHub `main` branch protection/ruleset through an authorized control-plane path and retain the resulting evidence.
7. Continue collecting authentic HA, recovery, provider assurance, formal CUI scope, SSP, organizational, personnel, physical, media, training, incident, and cryptographic evidence before making any broader CMMC or CUI claim.
