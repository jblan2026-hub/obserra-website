# Action Ledger Gate 34 Addendum

Snapshot: 2026-08-14 ET

This append-only addendum records Gate 34 production identity, routing, and CMMC/NIST evidence actions for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It supplements, and does not rewrite, the earlier action ledgers.

## Production release and routing observations

1. PR #56 was merged to `main` at verified GitHub merge commit `7bb1272847d1f6426ba1cb1b73cf42ea6aee0662` under the user's explicit authorization for website and nonregulated Academy/LMS production hardening.
2. Vercel created READY production deployment `dpl_7e9hNGYHF1M7xxkvYQHqN6kzZxwY` from that exact merge SHA.
3. Direct Vercel runtime inspection established that canonical custom domains remained attached to older READY deployment `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`, source SHA `80473277620e05acd5359330a706204703c999f0`.
4. The old deployment continued to emit the historical Clerk middleware error and retained legacy Academy GET checkout behavior. This established production alias drift rather than a failed Gate 33 merge build.
5. `vercel.json` was hardened to source-control `www.obserrallc.com` and `obserrallc.com` as production aliases. No Vercel project move, project creation, or DNS ownership change was performed.

## Clerk identity hardening

1. A single runtime configuration authority was created at `lib/clerk-runtime-config.ts`.
2. It accepts Clerk's supported `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` names, normalizes harmless surrounding whitespace, validates environment consistency, and requires live keys in Vercel production.
3. Secret key material is never returned from the configuration authority and is not written to audit evidence.
4. `app/layout.tsx`, `proxy.ts`, and `lib/identity-runtime.ts` were converted to the centralized authority.
5. `proxy.ts` retains direct `export default clerkMiddleware(...)` behavior and initializes normalized Clerk configuration before middleware authentication.
6. Diagnostic logging is limited to nonsecret reason codes, publishable-key source name, normalization flag, and environment classification.

## Gate 34 no-drift production evidence

1. Machine-readable source created: `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`.
2. Deterministic generator/verifier created: `scripts/cmmc-level2-rev3-production-evidence.mjs`.
3. Human-readable evidence generated: `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`.
4. Digest record generated: `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`.
5. Current machine-source SHA-256 after adding the GitHub protected-branch control gap: `f0cab58487e732d08fd5a1f340a86fa18f991b5fa38210abbfa8e7ffbc2546cb`.
6. Official NIST Rev. 3 OSCAL provenance is pinned to `usnistgov/oscal-content`, path `nist.gov/SP800-171/rev3/json/NIST_SP800-171_rev3_catalog.json`, blob SHA `1bc9d5ab5f57329c1ab5553b4d2b27ea54d9d13f`.
7. Gate 34 is permanently invoked by `.github/workflows/florida-class-d-lms-gates.yml` as a read-only verification step.
8. `package.json` exposes `generate:cmmc-production-evidence` for controlled generation and `verify:cmmc-production-evidence` for release validation.

## Bootstrap defect and corrective action

1. The first one-time Gate 34 artifact bootstrap used `git diff --quiet` to decide whether generated files changed.
2. That command does not report newly generated untracked files, so the job locally generated and verified the artifacts but did not commit them.
3. The defect was identified before release acceptance.
4. Detection was corrected to `git status --porcelain` scoped to the generated Markdown and digest.
5. The corrected bootstrap successfully committed the generated artifacts.
6. The one-time write-capable workflow was deleted.
7. When `PRE-009` was subsequently added to the machine ledger, a second controlled one-time regeneration used the corrected detection logic, committed the regenerated human evidence and digest, and was deleted again.
8. No permanent write-capable CMMC evidence workflow remains.

## Gate 34 source validation checkpoint

Exact source checkpoint before final documentation synchronization:

`0dbc9f6ce5b082161720f3b9a166482033d919f2`

All five mandatory workflows passed on that exact SHA:

- Florida Class D LMS Gates #537.
- Website CI #2285.
- Academy 70x Production Gate #1275.
- Application Release Validation #964.
- Application Production Pipeline #984.

The regulated job name was `Gates 1-34 and website compatibility`. Locked install, immutable lockfile validation, production dependency audit, Gates 1 through 34, tests, lint, and production build all passed.

## GitHub protected-branch gap

1. Direct repository control-plane inspection found `main` with `protected: false`.
2. Required status-check enforcement is off at the branch boundary.
3. Gate 34 machine evidence records this as `PRE-009 GitHub protected-branch enforcement gap`.
4. Mapped Rev. 3 requirements include `03.01.05`, `03.04.03`, `03.04.05`, `03.12.01`, and `03.16.01`.
5. The connected GitHub toolset does not expose branch-protection or repository-ruleset mutation, so this session cannot truthfully mark the control remediated.
6. An authorized GitHub administrator must enable and retain evidence of a `main` branch protection/ruleset requiring the governed pull-request path and mandatory release checks before this gap can be closed.

## Security boundaries retained

1. The workstream remains limited to the public website, Academy/LMS, Clerk, Stripe, Supabase Academy data services, Vercel, GitHub backend, course publication, and their dependencies. No unrelated Obserra application product source was changed in Gate 34.
2. Florida Class D production remains fail closed.
3. Main Supabase production still has no promoted Class D production schema.
4. CUI processing authorization remains false.
5. No Gate 34 artifact is FDACS approval, CMMC certification, or FedRAMP authorization.
6. Authentic provider HA, backup/restore, failover, RPO/RTO, and shared-responsibility evidence remains required.

## Next evidence actions

1. Revalidate the final documentation-synchronized PR #58 head with all five mandatory workflows.
2. Merge PR #58 only when the exact final head is five green and mergeable.
3. Verify the resulting Vercel production deployment is READY and both canonical domains are attached to the exact merge deployment.
4. Verify production Clerk identity health, Academy course count, POST-only Stripe checkout, GET checkout rejection, signed webhook readiness, security headers, and runtime telemetry.
5. Retain evidence of GitHub protected-branch enforcement once an authorized control-plane path is used.
6. Keep regulated Class D activation disabled until all dedicated licensing, candidate-bound UAT, production database promotion, HA, rollback, and activation controls are actually satisfied.
