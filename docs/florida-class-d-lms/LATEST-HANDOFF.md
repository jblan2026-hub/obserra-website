# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-14 ET

This is the current restart authority for the Obserra public website, Academy/LMS, regulated Florida Class D workstream, and CMMC Level 2 / NIST SP 800-171 Rev. 3 audit-traceability program for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Repository and production authority

Repository: `jblan2026-hub/obserra-website`

Production branch: `main`

Validated recovery-audit PR: `PR #74`

Recovery-audit merge SHA:

`b30bcfba24ca164de13eb2ed4a6cc12b54cc545e`

PR #74 was documentation/evidence only. It did **not** change the deployed application runtime.

Verified deployed application GitHub merge SHA:

`2261e2bd11bce0986976a2b366ece8949f129f0c`

Verified Vercel production deployment:

`dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp`

Canonical domains directly observed on that deployment:

- `www.obserrallc.com`
- `obserrallc.com`

The deployment is READY. Public root and Academy were verified available after recovery. The Academy retains the reviewed 60-course nonregulated catalog.

This restart pointer intentionally distinguishes the repository audit head from the deployed application SHA. A documentation-only merge must never be mistaken for a new production runtime release.

## Scope

The authorized workstream is limited to the public website, Obserra Academy/LMS, GitHub backend supporting those services, Supabase Academy data services, Clerk identity, Stripe commerce, Vercel runtime/routing, Academy course publication, and direct dependencies. Unrelated Obserra application products remain outside scope.

## Controlled restart records

Read these before changing production, regulated, identity, payment, deployment, or audit behavior:

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

Historical records and failed intermediate releases remain audit evidence and must not be rewritten to make the recovery appear failure free.

## Production recovery summary

The full chronology is retained in `PRODUCTION-RECOVERY-2026-08-14-HANDOFF.md` and `ACTION-LEDGER-PRODUCTION-RECOVERY-2026-08-14.md`.

The recovery sequence included:

1. Gate 34 canonical Vercel alias binding and centralized Clerk configuration.
2. Gate 35 removal of request-time/module-load Clerk environment mutation.
3. Gate 36 conditional identity middleware so routing and regulated mutation controls execute before identity and protected routes remain fail closed.
4. Vercel deployment-integrity hardening after an Ignored Build Step skipped a root-level `proxy.ts` production release.
5. Restoration of `package-lock.json` to the Vercel build context for CI-to-production dependency parity.
6. Explicit fail-closed identity activation through `OBSERRA_IDENTITY_RUNTIME_ENABLED` with secure default `false`.

Current deployed production merge `2261e2bd...` came from exact validated PR #73 head:

`d6ffd3b31a6d4eb69e39fbe856d1248528d5e071`

Checks passed on that exact head:

- Florida Class D LMS Gates #562.
- Website CI #2330.
- CodeQL Advanced #28.

The audit synchronization head for PR #74 was:

`5eecad046b1da2b531f19acb9b27157fd1b87b24`

Checks passed on that exact audit head:

- Florida Class D LMS Gates #563.
- Website CI #2332.
- CodeQL Advanced #30.

## Current website and Academy acceptance state

Verified production behavior includes:

- public root available;
- public Academy available;
- reviewed 60-course nonregulated Academy catalog available;
- both canonical domains bound to the exact current READY deployment;
- `GET /api/academy/checkout?...` returns HTTP 405 with `Allow: POST`, so the non-destructive validation request cannot create a Stripe Checkout Session;
- commerce health uses no-store and truthfully reports the current degraded provider state rather than enabling checkout;
- no error/fatal runtime logs were found for the current production deployment in the checked post-recovery window; and
- Florida Class D remains excluded from generic Academy commerce and production activation.

No live POST checkout was invoked during recovery acceptance.

## Identity security boundary

Identity is intentionally fail closed and is not currently production enabled.

Authoritative activation control:

`OBSERRA_IDENTITY_RUNTIME_ENABLED`

Secure default:

`false`

The runtime is considered identity-ready only when explicit activation is true and the accepted production Clerk configuration passes the centralized checks.

When identity is unavailable:

- public informational content remains available;
- protected/authenticated routes remain unavailable or follow the controlled configuration-required path;
- Florida Class D regulated mutation controls execute before identity delegation; and
- Clerk initialization cannot take down the public site.

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
- Current course purchase authorization is rechecked.
- GET checkout returns 405.
- Webhook fulfillment requires Stripe signature verification and paid status.
- Deferred redemption revalidates payment and verified purchaser identity.
- Generic Academy commerce cannot activate Florida Class D.

The protected Stripe production secret and webhook secret must be restored/verified through the Stripe/Vercel control planes. Do not place values in Git or chat.

After provider configuration is restored, redeploy a verified `main` release and prove healthy commerce status before a real payment test.

## Vercel deployment-integrity controls

The repository contains:

`lib/proxy-release-fingerprint.ts`

`test/vercel-deployment-integrity.test.mjs`

The test binds the exact Git blob identity of `proxy.ts` to a `lib/` sentinel recognized by the existing Vercel Ignored Build Step and fails on drift. This prevents recurrence of the observed skipped proxy deployment under the current project rule.

The SHA-1 value is only a Git object identity/deployment sentinel. It is **not** represented as CMMC cryptographic evidence.

`.vercelignore` no longer excludes `package-lock.json`. Vercel therefore receives the same dependency lockfile installed and audited by CI.

The regulated workflow explicitly verifies both deployment-integrity controls.

## Academy database boundary

Main Supabase project:

`Obserra Academy`

Project ref:

`nwxnyqlyzyufgoadtqxs`

Direct production checks during recovery found:

- 60 published/purchasable nonregulated Academy controls;
- zero Class D/security-officer-like course controls; and
- zero production `fdacs_class_d_*` objects.

No Florida Class D production schema promotion has occurred.

Regulated synthetic nonproduction project:

`obserra-fdacs-lms-nonprod`

Project ref:

`jeklrsratrijrsamdauv`

Purpose remains regulated synthetic acceptance only.

## Gate 29 through Gate 31 regulated controls

Authoritative Class D migration lineage: exactly 29 migrations.

Latest regulated migration version:

`20260814011203`

Canonical migration manifest SHA-256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Gate 30 preserves the default-deny Class D mutation boundary. Normal regulated mutations require production regulated-execution authorization. Gate 23 acceptance mutation remains separately restricted to explicit synthetic nonproduction authorization.

Gate 31 requires candidate-bound cryptographic HA evidence for ten service areas: edge/DNS, application runtime, identity, database, media, document storage, commerce, observability, backup/restore, and failover.

Missing, stale, incomplete, mismatched, or tampered evidence fails closed. Authentic provider backup, recovery, RPO, RTO, and failover evidence remains incomplete and has not been inferred from provider marketing.

## CMMC Level 2 / NIST SP 800-171 Rev. 3 evidence

Primary engineering baseline:

**NIST SP 800-171 Rev. 3**

Assessment baseline:

**NIST SP 800-171A Rev. 3**

The current CMMC Level 2 Rev. 2 crosswalk remains separately maintained for the currently enforced DoD assessment regime.

### Requirements register

Machine source:

`CMMC-LEVEL-2-REV3-TRACEABILITY.json`

Generated human matrix:

`CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md`

Requirements-register SHA-256:

`7119dd9f2b00aa6f9b23bca7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Correction: the authoritative requirements-register digest remains the value in `CMMC-LEVEL-2-REV3-TRACEABILITY.sha256`; operators must use that file as the source of truth if this prose value conflicts. The validated historical digest recorded in Gate 33 is `7119dd9f2b00aa6f9b23bca7a47efaa2af4b899be21952b0fcacaadd15e8e453` only if the digest file confirms it. Do not substitute a migration digest for the traceability digest.

### Production evidence register

Machine source:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.json`

Generated human audit view:

`CMMC-LEVEL-2-REV3-PRODUCTION-EVIDENCE.md`

Current production-evidence SHA-256:

`1730a06349965a50d873b18af7ab8b36366bc3f00c2eed85a285ceed0b380ed4`

The human view and digest were regenerated deterministically from the machine source. The temporary write-capable recovery bootstrap was removed immediately afterward. Permanent validation is read only through:

`npm run verify:cmmc-production-evidence`

The production evidence contains 12 PRE records covering identity, canonical routing, exact-SHA release/runtime validation, Stripe, Academy database controls, no-drift evidence, HA/recovery, regulated Class D separation, GitHub branch enforcement, GitHub code security/dependency monitoring, Vercel deployment integrity, and production incident recovery.

## GitHub security and change-control boundary

Completed within available source/control-plane authority:

- CodeQL Advanced enabled and operating for GitHub Actions and JavaScript/TypeScript.
- Obserra-specific coordinated vulnerability disclosure policy in `SECURITY.md`.
- Dependabot version-update configuration retained for subsystem-grouped npm dependencies.
- GitHub Actions dependency-update review tightened to weekly.
- GitHub issue #60 records the remaining administrator-only security configuration.

Direct GitHub control-plane inspection still reports:

- `main` protected: false;
- branch protection enforcement disabled;
- required status-check enforcement off; and
- repository rulesets: none.

Dependabot alerts were reported disabled by the API. Secret-scanning/push-protection state could not be verified through the current integration.

These remain open evidence gaps. Voluntary CI use is not equivalent to technical branch enforcement.

Issue #60 must remain open until an authorized GitHub administrator enables and evidences the required `main` ruleset/protection, required checks, force-push/deletion restrictions, controlled bypass, Dependabot alerts/security updates, and supported secret-scanning/push-protection controls.

## Florida Class D production boundary

Florida Class D production authorized: **false**.

CUI processing authorized: **false**.

Production Class D schema promoted: **false**.

Nothing in the public website recovery authorizes real regulated enrollment, learner access, scheduling, instruction, examination, LIAS production execution, official completion release, observer access, Class D database mutation, or regulated production activation.

The historical Gate 23 18-of-18 synthetic record is not candidate-bound to the current release and cannot be reused as final regulated acceptance.

Class D production still requires at minimum:

- applicable Class DS authorization;
- applicable DI instructor authorization;
- fresh exact-candidate Gate 23 synthetic acceptance;
- production database promotion from the exact candidate;
- authentic provider HA, backup/recovery, RPO/RTO, and failover evidence;
- security acceptance;
- rollback evidence; and
- explicit production activation prerequisites.

No CI result, source commit, provider state, handoff, filing packet, or audit mapping is FDACS approval or CMMC certification.

## Formal CUI assessment boundary

Formal CUI assessment scope established: false.

SSP complete: false.

Final asset inventory complete: false.

CUI processing authorized: false.

Before any future authorization to process CUI, complete the contract-specific boundary, asset categorization, SSP, network/data-flow diagrams, organization-defined parameters, policies/procedures, provider responsibility evidence, applicable FIPS evidence, personnel/physical/media/training/incident evidence, and formal assessment artifacts.

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

No production source change is currently required for public website availability. Do not change recovered application source merely to create additional checks.

1. Restore/verify Clerk production configuration through the provider control plane. Only after verification, set `OBSERRA_IDENTITY_RUNTIME_ENABLED=true` through protected runtime configuration and deploy a verified `main` release. Then validate sign-in, protected routes, entitlements, and nonsecret identity health.
2. Restore/verify Stripe production secret and webhook secret through provider/runtime controls. Redeploy and verify commerce health before any real payment test.
3. Complete GitHub issue #60 through an authorized GitHub administrative path and retain direct control-plane evidence before closing `PRE-009` or the remaining repository-security gap.
4. Continue collecting authentic provider HA, recovery, security, and shared-responsibility evidence for Gate 31 and the CMMC package.
5. Keep Florida Class D and CUI processing fail closed until their separate objective prerequisites are complete.

This restart pointer does not require another self-referential update solely to record the merge SHA of a documentation-only pointer commit. Production runtime authority remains the explicit deployed application SHA and deployment ID above until a subsequent verified runtime release occurs.
