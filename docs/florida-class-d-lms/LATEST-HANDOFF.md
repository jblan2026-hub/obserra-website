# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-14 ET

This is the current restart authority for the Obserra public website, Academy/LMS, regulated Florida Class D workstream, and CMMC Level 2 / NIST SP 800-171 Rev. 3 audit-traceability program for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Current scope

Repository: `jblan2026-hub/obserra-website`

Production branch: `main`

Current audit synchronization branch: `docs/production-recovery-audit-2026-08-14`

The authorized workstream is limited to the public website, Obserra Academy/LMS, GitHub backend supporting those services, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime/routing, Academy course publication, and their direct dependencies. Unrelated Obserra application products remain outside scope.

## Current production authority

Verified GitHub production merge SHA:

`2261e2bd11bce0986976a2b366ece8949f129f0c`

Verified Vercel production deployment:

`dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp`

Canonical domains directly observed on that deployment:

- `www.obserrallc.com`
- `obserrallc.com`

The current production deployment is READY. Public root and Academy were verified available after recovery. Academy retains the reviewed 60-course nonregulated catalog.

## Controlled restart records

Read these records before changing production, regulated, identity, payment, deployment, or audit behavior:

1. `LATEST-HANDOFF.md`
2. `PRODUCTION-RECOVERY-2026-08-14-HANDOFF.md`
3. `ACTION-LEDGER-PRODUCTION-RECOVERY-2026-08-14.md`
4. `ACTION-LEDGER.md`
5. `ACTION-LEDGER-GATES-29-32-ADDENDUM.md`
6. `ACTION-LEDGER-GATE-33-ADDENDUM.md`
7. `ACTION-LEDGER-GATE-34-ADDENDUM.md`
8. `GATE-29-MIGRATION-PARITY-HANDOFF.md`
9. `GATE-30-MUTATION-BOUNDARY-HANDOFF.md`
10. `GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
11. `GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`
12. `GATE-33-CMMC-LEVEL-2-REV3-TRACEABILITY-HANDOFF.md`
13. `GATE-34-PRODUCTION-IDENTITY-ROUTING-CMMC-EVIDENCE-HANDOFF.md`
14. `CMMC-LEVEL-2-REV3-TRACEABILITY.json`
15. `CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json`
16. `CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`
17. `CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`
18. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`
19. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`
20. `CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.sha256`
21. `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

Historical records and failed intermediate releases are retained as audit evidence and must not be rewritten to make the recovery appear linear or failure free.

## Production recovery authority

The complete production incident and recovery chronology is recorded in:

`PRODUCTION-RECOVERY-2026-08-14-HANDOFF.md`

`ACTION-LEDGER-PRODUCTION-RECOVERY-2026-08-14.md`

The recovery sequence includes Gate 34 canonical routing/identity changes, Gate 35 removal of runtime environment mutation, Gate 36 conditional Clerk isolation, Vercel deployment-integrity correction, and explicit fail-closed identity activation.

Current production merge `2261e2bd...` was created from exact validated PR #73 head:

`d6ffd3b31a6d4eb69e39fbe856d1248528d5e071`

Required checks on that exact head passed:

- Florida Class D LMS Gates #562.
- Website CI #2330.
- CodeQL Advanced #28.

## Current website and Academy acceptance state

Verified production behavior on the current READY deployment includes:

- public root available;
- public Academy available;
- reviewed 60-course nonregulated Academy catalog available;
- canonical custom domains bound to the exact current deployment;
- `GET /api/academy/checkout?...` returns HTTP 405 with `Allow: POST`, preventing the non-destructive validation request from creating a Stripe Checkout Session;
- commerce health returns no-store and truthfully reports the current degraded provider state rather than enabling checkout;
- current production deployment had no error/fatal runtime logs in the checked post-recovery window; and
- Florida Class D remains excluded from generic Academy commerce and production activation.

No live POST checkout was performed during recovery verification.

## Identity security boundary

Identity is intentionally fail closed and currently not production enabled.

Authoritative runtime control:

`OBSERRA_IDENTITY_RUNTIME_ENABLED`

Secure default:

`false`

The current architecture requires explicit identity activation plus accepted Clerk production configuration before Clerk middleware/provider execution is considered ready.

When identity is unavailable:

- public informational content remains available;
- protected/authenticated routes remain unavailable or redirect through the controlled configuration-required boundary;
- Florida Class D regulated mutation controls execute before identity delegation; and
- no public availability dependency is created on Clerk initialization.

Do not set `OBSERRA_IDENTITY_RUNTIME_ENABLED=true` until the production Clerk instance and matching live protected configuration are verified through the provider control plane.

Never place Clerk secret values in Git, audit documents, public issues, logs, or chat.

## Stripe commerce boundary

Current production commerce health reports:

- `operational: false`
- payment provider unavailable
- webhook verification unavailable
- identity degraded
- idempotent fulfillment retained

Source controls remain secure and fail closed:

- Checkout Session creation is POST-only.
- Same-origin validation is required.
- Current Academy purchase authorization is rechecked.
- GET checkout returns 405.
- Webhook fulfillment requires Stripe signature validation and paid status.
- Deferred redemption revalidates payment and verified purchaser identity.
- Generic Academy commerce cannot activate Florida Class D.

The protected production Stripe secret and webhook secret must be restored/verified through the Stripe/Vercel control planes. Do not place their values in Git or chat.

After provider configuration is restored, redeploy a verified `main` release and prove healthy commerce status before any real payment transaction test.

## Vercel deployment-integrity controls

The production recovery identified two deployment-control defects and closed them in source.

First, the Vercel project Ignored Build Step did not recognize a root-level `proxy.ts` change and canceled the Gate 36 production deployment. The repository now contains:

`lib/proxy-release-fingerprint.ts`

`test/vercel-deployment-integrity.test.mjs`

The test calculates the exact Git blob identity of `proxy.ts` and requires the `lib/` sentinel to remain synchronized. The existing Vercel project rule recognizes `lib/`, so a governed proxy change cannot silently reproduce the observed skip condition under the current rule.

The SHA-1 sentinel is only a Git object identity for deployment relevance. It is not represented as CMMC cryptographic evidence.

Second, `.vercelignore` previously excluded `package-lock.json`. That exclusion was removed. Vercel now receives the same lockfile that CI installs and audits, restoring CI-to-production dependency-resolution parity.

The regulated workflow explicitly verifies both controls.

## Academy database boundary

Main Supabase project:

`Obserra Academy`

Project ref:

`nwxnyqlyzyufgoadtqxs`

Direct production checks during recovery found:

- 60 published/purchasable nonregulated Academy course controls;
- zero Class D/security-officer-like publication controls; and
- zero production `fdacs_class_d_*` objects.

No Florida Class D production schema promotion has occurred.

Regulated synthetic nonproduction project:

`obserra-fdacs-lms-nonprod`

Project ref:

`jeklrsratrijrsamdauv`

Its purpose remains regulated synthetic acceptance only.

## Gate 29 through Gate 31 regulated controls

The authoritative Class D migration lineage remains exactly 29 migrations.

Latest regulated migration version:

`20260814011203`

Canonical migration manifest SHA-256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Gate 30 preserves the default-deny Class D mutation boundary. Normal regulated mutations require production regulated-execution authorization. Gate 23 acceptance mutation remains separately restricted to explicitly authorized synthetic nonproduction execution.

Gate 31 requires candidate-bound cryptographic HA evidence for exactly ten service areas: edge/DNS, application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover.

Missing, stale, incomplete, mismatched, or tampered evidence fails closed. Authentic provider backup, recovery, RPO, RTO, and failover evidence remains incomplete and has not been inferred from vendor marketing.

## CMMC Level 2 and NIST SP 800-171 Rev. 3 traceability

Primary engineering baseline:

**NIST SP 800-171 Rev. 3**

Assessment-procedure baseline:

**NIST SP 800-171A Rev. 3**

The current CMMC Level 2 Rev. 2 practice crosswalk remains separately maintained for the currently enforced DoD assessment regime.

### Primary machine-readable requirements register

`CMMC-LEVEL-2-REV3-TRACEABILITY.json`

Generated human matrix:

`CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

Current requirements-register SHA-256:

`7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3`

### Production evidence register

Machine-readable source:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human-readable audit view:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Current production-evidence SHA-256:

`1730a06349965a50d873b18af7ab8b36366bc3f00c2eed85a285ceed0b380ed4`

The human view and digest were regenerated deterministically from the machine source. The temporary write-capable recovery bootstrap workflow was removed immediately afterward. Permanent validation remains read only through:

`npm run verify:cmmc-production-evidence`

The production evidence now includes 12 PRE records covering identity, canonical routing, exact-SHA release/runtime validation, Stripe, Academy database controls, no-drift audit traceability, HA/recovery, regulated Class D separation, GitHub branch enforcement, GitHub code security/dependency monitoring, Vercel deployment integrity, and the production incident recovery.

## GitHub security and change-control boundary

Source-controlled GitHub security hardening completed within available authority:

- CodeQL Advanced enabled and operating for GitHub Actions and JavaScript/TypeScript.
- Obserra-specific coordinated vulnerability disclosure policy in `SECURITY.md`.
- Dependabot version-update configuration retained for subsystem-grouped npm dependencies.
- GitHub Actions dependency-update review tightened to weekly.
- GitHub issue #60 created as the controlled administrator work item for remaining provider-side repository security settings.

Direct GitHub control-plane inspection still reports:

- `main` protected: false;
- branch protection enforcement disabled;
- required status-check enforcement off; and
- repository rulesets: none.

The Dependabot alerts API reported alerts disabled. Secret-scanning/push-protection state could not be verified through the current integration.

These conditions remain open evidence gaps. Voluntary CI discipline is not represented as equivalent to technical branch enforcement.

GitHub issue #60 must remain open until an authorized administrator enables and evidences the required `main` ruleset/protection, required checks, force-push/deletion restrictions, governed bypass handling, Dependabot alerts/security updates, and supported secret-scanning/push-protection controls.

## Florida Class D regulated production boundary

Florida Class D production authorized: **false**.

CUI processing authorized: **false**.

Production Class D schema promoted: **false**.

Nothing in the production website recovery authorizes real regulated enrollment, learner access, scheduling, instruction, examination, LIAS production execution, official completion release, observer access, Class D database mutation, or regulated production activation.

The historical Gate 23 18-of-18 synthetic acceptance record is not candidate-bound to the current release and cannot be reused as final regulated acceptance.

Class D production still requires at minimum:

- applicable Class DS authorization;
- applicable DI instructor authorization;
- fresh exact-candidate Gate 23 synthetic acceptance;
- production database promotion from the exact candidate;
- authentic provider HA, backup/recovery, RPO/RTO, and failover evidence;
- security acceptance;
- rollback evidence; and
- explicit production activation prerequisites.

No CI result, provider state, source commit, handoff, filing packet, or audit mapping is FDACS approval or CMMC certification.

## Formal CUI / CMMC assessment boundary

Formal CUI assessment scope established: false.

SSP complete: false.

Final asset inventory complete: false.

CUI processing authorized: false.

Before any future authorization to process CUI, complete the contract-specific CUI boundary, asset categorization, SSP, network/data-flow diagrams, organization-defined parameters, policies/procedures, provider responsibility evidence, applicable FIPS evidence, personnel/physical/media/training/incident evidence, and formal assessment artifacts.

## Controlled filing baseline

Private controlled filing baseline remains:

- LMS Guide DOCX/PDF v0.15, PDF 43 pages.
- Submission Readiness Register v1.5.
- Controlled Pre-Filing Packet v0.15, live evidence only.
- Controlled packet ZIP SHA-256 `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.
- Curriculum SHA-256 `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.
- Examination SHA-256 `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

`DS-SUBMISSION-LMS-GUIDE-CONTROL.md` remains older public metadata and must not be represented as synchronized with the current private filing baseline until a controlled revision actually lands.

## Next governed actions

1. Merge this audit-only synchronization only after exact-head CMMC production-evidence verification, regulated workflow validation, Website CI, and CodeQL where triggered.
2. Keep application source frozen unless a production defect is found.
3. Restore/verify Clerk production configuration through the provider control plane, then enable `OBSERRA_IDENTITY_RUNTIME_ENABLED=true` and redeploy only after the identity instance is verified.
4. Restore/verify Stripe production secret and webhook secret through the provider/runtime control planes, redeploy, then verify commerce health before any real payment test.
5. Complete GitHub issue #60 through an authorized GitHub administrative path and retain direct control-plane evidence before closing `PRE-009`/the remaining GitHub security gap.
6. Continue collecting authentic provider HA, recovery, security, and shared-responsibility evidence for Gate 31 and the CMMC package.
7. Keep Florida Class D and CUI processing fail closed until their separate objective prerequisites are complete.
