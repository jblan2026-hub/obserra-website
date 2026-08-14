# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-14 ET

This file is the restart authority for the Obserra public website, Academy/LMS, Florida Class D regulated workstream, and CMMC Level 2 / NIST SP 800-171 Rev. 3 audit-traceability program for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Current authority

Repository: `jblan2026-hub/obserra-website`

Production branch: `main`

Validated recovery-audit PR: `PR #74`

Recovery-audit merge SHA:

`b30bcfba24ca164de13eb2ed4a6cc12b54cc545e`

PR #74 changed documentation and evidence only. It did not create a new application runtime release.

Verified deployed application GitHub merge SHA:

`2261e2bd11bce0986976a2b366ece8949f129f0c`

Verified Vercel production deployment:

`dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp`

Canonical domains directly observed on that deployment:

- `www.obserrallc.com`
- `obserrallc.com`

The deployment is READY. Public root and Academy were verified available after recovery. The Academy retains the reviewed 60-course nonregulated catalog.

A documentation-only repository head must never be mistaken for the deployed application SHA above.

## Scope

Current work is limited to the public website, Obserra Academy/LMS, GitHub backend supporting those services, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime/routing, Academy course publication, and direct dependencies. Unrelated Obserra application products are outside this workstream.

## Read first

Before changing production, regulated, identity, payment, deployment, or audit behavior, read:

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

Historical failures and intermediate releases are retained as audit evidence. Do not rewrite them to make the recovery appear linear or failure free.

## Recovery validation

Current deployed production merge `2261e2bd...` came from exact validated PR #73 head:

`d6ffd3b31a6d4eb69e39fbe856d1248528d5e071`

Required checks on that exact head passed:

- Florida Class D LMS Gates #562.
- Website CI #2330.
- CodeQL Advanced #28.

PR #74 audit synchronization head:

`5eecad046b1da2b531f19acb9b27157fd1b87b24`

Required checks on that exact audit head passed:

- Florida Class D LMS Gates #563.
- Website CI #2332.
- CodeQL Advanced #30.

## Current live state

Verified production behavior includes:

- public root available;
- public Academy available;
- reviewed 60-course nonregulated Academy catalog available;
- both canonical domains bound to the exact READY deployment;
- `GET /api/academy/checkout?...` returns HTTP 405 with `Allow: POST`, so the non-destructive validation request cannot create a Stripe Checkout Session;
- commerce health truthfully reports the current degraded provider state instead of enabling checkout;
- no error/fatal runtime logs were found for the current production deployment in the checked post-recovery window; and
- Florida Class D remains excluded from generic Academy commerce and production activation.

No live POST checkout was performed during recovery acceptance.

## Identity boundary

Identity is intentionally fail closed and is not currently production enabled.

Activation control:

`OBSERRA_IDENTITY_RUNTIME_ENABLED`

Secure default:

`false`

The runtime is identity-ready only when explicit activation is true and the accepted production Clerk configuration passes centralized validation.

When identity is unavailable, public informational content remains available while protected/authenticated routes remain unavailable or follow the controlled configuration-required path. Florida Class D regulated mutation controls execute before identity delegation.

Do not enable identity until the production Clerk instance and matching live protected configuration are verified through the provider control plane. Never place Clerk secret values in Git, audit documents, public issues, logs, or chat.

## Stripe boundary

Current production commerce health reports:

- `operational: false`
- payment provider unavailable
- webhook verification unavailable
- identity degraded
- idempotent fulfillment retained

Source controls remain fail closed:

- Checkout Session creation is POST-only.
- Same-origin validation is required.
- Course purchase authorization is rechecked.
- GET checkout returns 405.
- Webhook fulfillment requires Stripe signature verification and paid status.
- Deferred redemption revalidates payment and verified purchaser identity.
- Generic Academy commerce cannot activate Florida Class D.

Restore and verify protected Stripe production configuration only through the Stripe/Vercel control planes. Do not place secret values in Git or chat. Redeploy and verify commerce health before any real payment test.

## Deployment-integrity controls

The repository contains:

`lib/proxy-release-fingerprint.ts`

`test/vercel-deployment-integrity.test.mjs`

The test binds the exact Git blob identity of `proxy.ts` to a Vercel-recognized `lib/` sentinel and fails on drift. The SHA-1 sentinel is only a Git object/deployment identity, not CMMC cryptographic evidence.

`.vercelignore` no longer excludes `package-lock.json`, so Vercel receives the same dependency lockfile installed and audited by CI.

## Academy database boundary

Main Supabase project: `Obserra Academy`

Project ref: `nwxnyqlyzyufgoadtqxs`

Direct production checks found:

- 60 published/purchasable nonregulated Academy controls;
- zero Class D/security-officer-like course controls; and
- zero production `fdacs_class_d_*` objects.

No Florida Class D production schema promotion has occurred.

Regulated synthetic nonproduction project: `obserra-fdacs-lms-nonprod`

Project ref: `jeklrsratrijrsamdauv`

## Regulated Gate 29 through Gate 31 controls

The Class D migration lineage remains exactly 29 migrations.

Latest regulated migration version:

`20260814011203`

Canonical migration manifest SHA-256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Gate 30 preserves the default-deny Class D mutation boundary. Gate 31 requires candidate-bound cryptographic HA evidence for edge/DNS, application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover.

Authentic provider backup, recovery, RPO, RTO, and failover evidence remains incomplete and has not been inferred from provider marketing.

## CMMC Level 2 / NIST SP 800-171 Rev. 3 evidence

Primary engineering baseline: **NIST SP 800-171 Rev. 3**.

Assessment baseline: **NIST SP 800-171A Rev. 3**.

The current CMMC Level 2 Rev. 2 crosswalk remains separately maintained for the currently enforced DoD assessment regime.

Requirements machine source:

`CMMC-LEVEL-2-REV3-TRACEABILITY.json`

Generated human matrix:

`CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

Authoritative requirements-register SHA-256, verified directly from `CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`:

`7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3`

Production-evidence machine source:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human audit view:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Current production-evidence SHA-256:

`1730a06349965a50d873b18af7ab8b36366bc3f00c2eed85a285ceed0b380ed4`

The production evidence contains 12 PRE records covering identity, canonical routing, exact-SHA runtime validation, Stripe, Academy database controls, no-drift evidence, HA/recovery, regulated Class D separation, GitHub branch enforcement, GitHub code security/dependency monitoring, Vercel deployment integrity, and production incident recovery.

Permanent audit validation is read only through:

`npm run verify:cmmc-traceability`

`npm run verify:cmmc-production-evidence`

## GitHub security boundary

Completed within available authority:

- CodeQL Advanced enabled and operating for GitHub Actions and JavaScript/TypeScript.
- Obserra-specific coordinated vulnerability disclosure policy in `SECURITY.md`.
- Dependabot version-update configuration retained for subsystem-grouped npm dependencies.
- GitHub Actions dependency-update review tightened to weekly.
- GitHub issue #60 records remaining administrator-only repository security work.

Direct GitHub control-plane inspection still reports:

- `main` protected: false;
- branch protection enforcement disabled;
- required status-check enforcement off; and
- repository rulesets: none.

Dependabot alerts were reported disabled by the API. Secret-scanning/push-protection state could not be verified through the current integration.

Issue #60 must remain open until an authorized administrator enables and evidences the required `main` ruleset/protection, required checks, force-push/deletion restrictions, controlled bypass, Dependabot alerts/security updates, and supported secret-scanning/push-protection controls.

## Florida Class D and CUI boundary

Florida Class D production authorized: **false**.

CUI processing authorized: **false**.

Production Class D schema promoted: **false**.

The historical Gate 23 18-of-18 synthetic record is not candidate-bound to the current release and cannot be reused as final regulated acceptance.

Class D production still requires applicable licensing, fresh exact-candidate Gate 23 synthetic acceptance, exact-candidate production database promotion, authentic provider HA/recovery evidence, security acceptance, rollback evidence, and explicit production activation prerequisites.

Formal CUI assessment scope established: false.

SSP complete: false.

Final asset inventory complete: false.

No CI result, source commit, provider state, handoff, filing packet, or audit mapping is FDACS approval, CMMC certification, FedRAMP authorization, or authorization to process CUI.

## Next governed actions

No production source change is currently required for public website availability. Do not change recovered application source merely to create additional checks.

1. Verify Clerk production configuration through the provider control plane. Only after verification, enable `OBSERRA_IDENTITY_RUNTIME_ENABLED=true` through protected runtime configuration, redeploy a verified `main` release, and validate sign-in, protected routes, entitlements, and nonsecret identity health.
2. Restore/verify Stripe production secret and webhook secret through provider/runtime controls, redeploy, and verify commerce health before a real payment test.
3. Complete GitHub issue #60 through an authorized GitHub administrative path and retain direct evidence before closing the repository-security gap.
4. Continue collecting authentic provider HA, recovery, security, and shared-responsibility evidence for Gate 31 and CMMC.
5. Keep Florida Class D and CUI processing fail closed until their separate objective prerequisites are complete.

This pointer does not require another self-referential edit solely to record the merge SHA of a documentation-only pointer update. Production runtime authority remains the explicit deployed application SHA and deployment ID above until a later verified runtime release occurs.
