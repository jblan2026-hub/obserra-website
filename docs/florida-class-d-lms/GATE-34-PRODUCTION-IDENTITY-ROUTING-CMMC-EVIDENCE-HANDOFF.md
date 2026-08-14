# Gate 34 Production Identity, Routing, and CMMC Evidence Handoff

Snapshot: 2026-08-14 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/cmmc-level2-rev3-audit-package`

Pull request: `PR #58`

## Purpose and claim boundary

Gate 34 hardens the production website and Academy/LMS dependency chain after the Gate 33 release was merged. It addresses production identity configuration consistency, canonical Vercel domain binding, release evidence provenance, and no-drift CMMC Level 2 / NIST SP 800-171 Rev. 3 evidence.

Gate 34 does **not** authorize CUI processing, activate Florida Class D production, claim CMMC certification, claim FedRAMP authorization, or claim FDACS approval.

## Exact Gate 34 source checkpoint

The exact five-green source checkpoint before documentation synchronization is:

`0dbc9f6ce5b082161720f3b9a166482033d919f2`

All five mandatory release workflows passed on that SHA:

- Florida Class D LMS Gates #537: success.
- Website CI #2285: success.
- Academy 70x Production Gate #1275: success.
- Application Release Validation #964: success.
- Application Production Pipeline #984: success.

The regulated job is named `Gates 1-34 and website compatibility`. Locked dependency installation, immutable lockfile verification, high-severity production dependency audit, Gates 1 through 34, repository tests, lint, and production build all passed.

Documentation/evidence commits after this checkpoint change the PR head and must pass the same five workflows before becoming final Gate 34 authority.

## Production routing defect and remediation

PR #56 was merged to `main` at verified GitHub merge commit:

`7bb1272847d1f6426ba1cb1b73cf42ea6aee0662`

Vercel created READY production deployment:

`dpl_7e9hNGYHF1M7xxkvYQHqN6kzZxwY`

Direct Vercel runtime inspection then established that `www.obserrallc.com` and `obserrallc.com` remained attached to older READY deployment:

`dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`

Older source SHA:

`80473277620e05acd5359330a706204703c999f0`

That old deployment retained the historical Clerk middleware error and legacy Academy GET checkout behavior. The finding was production alias drift, not a failed Gate 33 build.

Gate 34 now source-controls exactly these Vercel production aliases in `vercel.json`:

- `www.obserrallc.com`
- `obserrallc.com`

No Vercel project was created or moved and no DNS ownership change was performed. Post-merge acceptance must prove both canonical domains resolve to the exact accepted Gate 34 production deployment.

Gate 35 supersedes this Gate 34 alias mechanism. Direct inspection proved the shared `vercel.json` alias declaration propagated both canonical domains to three Git-linked projects. Gate 35 removes the source alias property and requires the canonical domains to be governed only in the intended Vercel project control plane.

## Clerk identity remediation

The earlier code had separate Clerk configuration validators in layout, middleware, and identity health logic. Gate 34 replaces those duplicated interpretations with one server-side authority:

`lib/clerk-runtime-config.ts`

The shared authority:

- accepts `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`;
- normalizes harmless surrounding whitespace;
- validates publishable-key structure without exposing key material;
- validates secret-key environment without returning or logging the secret;
- requires publishable and secret environments to match;
- requires live keys in Vercel production;
- normalizes Clerk configuration before middleware authentication; and
- returns only nonsecret readiness metadata and reason codes.

`app/layout.tsx`, `proxy.ts`, and `lib/identity-runtime.ts` consume the same authority. `proxy.ts` retains direct `export default clerkMiddleware(...)` behavior.

Post-deployment identity acceptance must prove Clerk authentication is actually healthy. No key values may be written to GitHub, logs, audit evidence, or chat.

## Gate 34 machine and human audit evidence

Machine-readable source:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human-readable evidence:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Digest record:

`docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`

Current machine-source SHA-256:

`f0cab58487e732d08fd5a1f340a86fa18f991b5fa38210abbfa8e7ffbc2546cb`

Generator/verifier:

`scripts/cmmc-level2-rev3-production-evidence.mjs`

Read-only CI command:

`npm run verify:cmmc-production-evidence`

The evidence package maps production identity, canonical routing, exact-SHA release verification, Stripe payment, Academy database controls, no-drift traceability, HA/recovery evidence, regulated Class D separation, and the GitHub protected-branch gap to NIST SP 800-171 Rev. 3 and the current CMMC Level 2 Rev. 2 practice identifiers.

Official NIST machine-readable provenance is pinned to:

- Repository: `usnistgov/oscal-content`
- Path: `nist.gov/SP800-171/rev3/json/NIST_SP800-171_rev3_catalog.json`
- Blob SHA: `1bc9d5ab5f57329c1ab5553b4d2b27ea54d9d13f`

## Bootstrap integrity record

The first one-time Gate 34 generator workflow used `git diff --quiet` to detect generated artifacts. That command does not detect newly created untracked files. The issue was discovered before release acceptance, corrected to `git status --porcelain`, and rerun successfully.

After `PRE-009` was added, a second controlled regeneration used the corrected detection logic. The generated Markdown and digest were committed, and the temporary writer was deleted again. No permanent write-capable CMMC evidence workflow remains.

This failure-and-remediation history is retained as evidence rather than removed from the audit record.

## CMMC / NIST mapping summary

Key Gate 34 mappings include:

- Identity/authentication: `03.01.02`, `03.01.05`, `03.05.01`, `03.05.03`, `03.05.04`, `03.05.12`, `03.13.15`, `03.16.03`.
- Production configuration/routing: `03.04.01`, `03.04.02`, `03.04.03`, `03.04.05`, `03.13.01`, `03.13.06`, `03.16.01`.
- Release verification/monitoring: `03.03.05`, `03.04.03`, `03.04.04`, `03.12.01`, `03.12.03`, `03.14.06`, `03.16.01`.
- Commerce authorization/auditability: `03.01.02`, `03.01.03`, `03.01.05`, `03.03.01`, `03.03.02`, `03.13.15`, `03.16.03`.
- Database least privilege/default deny: `03.01.02`, `03.01.03`, `03.01.05`, `03.04.01`, `03.04.02`, `03.13.06`, `03.16.03`.
- Audit no-drift/evidence: `03.03.08`, `03.04.01`, `03.04.03`, `03.12.01`, `03.12.03`, `03.15.02`, `03.16.01`.
- Protected-branch enforcement gap: `03.01.05`, `03.04.03`, `03.04.05`, `03.12.01`, `03.16.01`.

NIST SP 800-171 Rev. 3 remains the engineering baseline. NIST SP 800-171A Rev. 3 remains the Rev. 3 assessment-procedure baseline. The current CMMC Level 2 Rev. 2 crosswalk is retained separately for the governing DoD assessment regime.

## PRE-009 GitHub protected-branch enforcement gap

Direct GitHub control-plane inspection on 2026-08-14 established:

- `main` reports `protected: false`;
- branch-protection enforcement is disabled; and
- required status-check enforcement is off at the branch boundary.

Voluntarily waiting for five green workflows is not equivalent to technically enforcing them. Gate 34 therefore records the condition in machine-readable evidence as:

`PRE-009 GitHub protected-branch enforcement gap`

The connected GitHub toolset in this session supports inspection, pull-request operations, commits, and merges, but exposes no branch-protection/ruleset mutation. This control cannot truthfully be marked remediated from the current session.

An authorized GitHub administrator must enable and retain evidence of a `main` protection/ruleset requiring the governed pull-request path and mandatory release checks before PRE-009 can be closed.

## Website, Academy, payment, and database controls retained

Gate 34 preserves the validated Gate 32 controls:

- 60 reviewed nonregulated Academy courses remain the authorized baseline.
- Florida Class D remains excluded from generic Academy commerce.
- Missing or degraded Academy publication/control data fails closed.
- Stripe Checkout Session creation is POST-only and same-origin.
- Stripe fulfillment requires a verified signature and paid status and remains idempotent.
- Deferred redemption revalidates payment and verified Clerk email ownership.
- Academy backend-only database paths retain forced-RLS/no-client-grant posture.
- Public catalog remains GET-only and field-limited.
- Production dependency auditing remains mandatory.

## HA and recovery boundary

Gate 31 remains authoritative for Class D HA acceptance. Authentic evidence remains required for application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover.

A READY Vercel deployment in `iad1` is not represented as multi-region failover evidence. The connected Supabase control plane does not expose authoritative backup/restore configuration evidence, so backup, retention, recovery tests, RPO, RTO, and failover remain open rather than inferred.

## Florida Class D boundary

Florida Class D production remains **fail closed**.

The main Supabase production project has no promoted Class D schema. The historical Gate 23 synthetic acceptance is not candidate-bound to Gate 34. Fresh exact-candidate UAT, licensing prerequisites, production database promotion, authentic HA evidence, security acceptance, rollback evidence, and explicit activation requirements remain mandatory.

Nothing in Gate 34 authorizes real Class D enrollment, instruction, examinations, LIAS production execution, official completion release, regulated observer access, or Class D production mutation execution.

## Next governed actions

1. Synchronize `LATEST-HANDOFF.md` and the append-only Gate 34 action ledger.
2. Revalidate the final documentation head with all five mandatory workflows.
3. Merge PR #58 only after the exact final head is five green and mergeable. Website/nonregulated Academy production hardening has already been owner-authorized.
4. Verify the new verified `main` merge creates a READY Vercel production deployment and moves both canonical domains to that exact deployment.
5. Verify canonical production Clerk identity, 60-course Academy catalog, POST-only checkout, GET checkout 405, Stripe health, security headers, runtime telemetry, and Class D fail-closed behavior.
6. Obtain/enforce GitHub `main` protection/ruleset through an authorized administrator path and retain the resulting evidence.
7. Continue collecting authentic HA, recovery, provider assurance, formal CUI scope, SSP, organizational, personnel, physical, media, training, incident, and cryptographic evidence before any broader CMMC/CUI claim.
