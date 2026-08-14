# Production Recovery and Security Handoff

Snapshot: 2026-08-14 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Production branch: `main`

## Current production authority

Verified GitHub production merge SHA:

`2261e2bd11bce0986976a2b366ece8949f129f0c`

Verified Vercel production deployment:

`dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp`

Canonical domains bound to that deployment:

- `www.obserrallc.com`
- `obserrallc.com`

The public root and Academy are available on this deployment. The Academy retains the reviewed 60-course nonregulated catalog. Production Class D database objects remain zero and Florida Class D remains fail closed.

## Incident and recovery chronology

### Gate 34

PR #58 introduced centralized Clerk runtime validation, canonical Vercel aliases, and CMMC production-evidence controls. Exact validated PR head:

`827de1699be5b3560825a27287233c49058ef936`

Verified merge:

`14b7476fbd1b2b110424e7aace34cd7ad9368206`

Vercel deployment:

`dpl_7YZMe6j6HLsWNScrpH67pr8CoifH`

The deployment became READY and received both canonical aliases, but public root and Academy returned HTTP 500. The incident was not hidden or represented as successful production acceptance.

### Gate 35

PR #59 removed runtime writes to Clerk environment variables and updated Gate 34 to prohibit environment mutation. Exact validated head:

`b8a3463c8ce78f580d37478369836abb158170cf`

Verified merge:

`be5b2cfe81d773bb399bd52114b53e791146bb74`

Vercel deployment:

`dpl_2UoSi2aD8fgR8eGmZN9Bo6EA6sDj`

The deployment reached READY but public HTTP 500 persisted.

### Gate 36 conditional identity boundary

PR #71 changed the global proxy architecture so canonical routing and regulated Class D mutation controls execute before identity. Clerk middleware is constructed conditionally only after identity configuration readiness succeeds. Protected routes still require `auth()`, while Clerk initialization/runtime failures fall back to the fail-closed identity configuration boundary instead of taking down public traffic.

Exact validated head:

`50f6e08da01817724190157fff515c1b9b349fec`

Verified merge:

`b190f6d4b3addd9b67b4c7bbb1bf09372b10c7f1`

The corresponding Vercel deployment was canceled by the project Ignored Build Step because that rule did not recognize a root-level `proxy.ts` change as deploy relevant.

### Production deployment-integrity correction

PR #72 corrected two CI-to-production parity defects.

First, `lib/proxy-release-fingerprint.ts` binds the exact Git blob identity of `proxy.ts` to a file under `lib/`, which the existing Vercel Ignored Build Step recognizes. CI calculates the Git blob identity and fails if proxy/fingerprint drift occurs.

Second, `.vercelignore` no longer excludes `package-lock.json`, ensuring Vercel receives the same dependency lockfile that CI audits.

Exact validated head:

`31056038178ae538c23b9bc247d0e96daa874c58`

Verified merge:

`50a0bc2b6633aa093feb77ffa8e1b1454549310a`

Vercel deployment:

`dpl_GzztQsu5BkkiyxuTXL8Nf37qsZMQ`

This deployment reached READY and proved the build-skip and lockfile defects were corrected. `robots.txt` returned successfully through the new proxy and reported identity configuration required, which isolated the remaining application HTTP 500 to the application identity-provider rendering path.

### Explicit fail-closed identity activation

PR #73 introduced `OBSERRA_IDENTITY_RUNTIME_ENABLED` as an explicit server-side activation control. The secure default is false. Clerk middleware and `ClerkProvider` are not considered ready until the flag is true and the production Clerk configuration passes the existing key/environment checks.

Public informational content therefore remains available when identity is unavailable, but protected/authenticated surfaces remain fail closed. This is not an authentication bypass.

Exact validated head:

`d6ffd3b31a6d4eb69e39fbe856d1248528d5e071`

Required checks passed on that exact head:

- Florida Class D LMS Gates #562: success.
- Website CI #2330: success.
- CodeQL Advanced #28: success.

Verified merge/current production SHA:

`2261e2bd11bce0986976a2b366ece8949f129f0c`

Current READY Vercel deployment:

`dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp`

## Current live acceptance state

Verified non-destructive production behavior includes:

- public root returns successfully;
- public Academy returns successfully and retains the reviewed 60-course catalog;
- canonical domains are bound to the exact current READY deployment;
- `GET /api/academy/checkout?...` returns HTTP 405 with `Allow: POST`, so the safety test cannot create a Stripe Checkout Session;
- commerce health returns HTTP 503, no-store, with `operational: false`, payment provider unavailable, webhook verification unavailable, and identity degraded;
- the current production deployment produced no error/fatal runtime logs in the checked post-recovery window;
- identity remains intentionally fail closed and reports configuration required; and
- Florida Class D remains excluded from generic Academy commerce and production activation.

No live POST checkout was invoked during recovery validation.

## Current provider-configuration dependencies

### Clerk

Identity is intentionally not activated. Do not set `OBSERRA_IDENTITY_RUNTIME_ENABLED=true` until the production Clerk instance and matching live key configuration have been verified through the provider control plane.

The activation flag, publishable key, and secret key must remain protected runtime configuration. Never place values in Git, audit documents, public issues, or chat.

After provider configuration is corrected, deploy a verified `main` release and prove sign-in, protected route authorization, Academy entitlement access, and nonsecret health status before closing the identity gap.

### Stripe

Current production commerce health reports both payment provider and webhook verification unavailable. Source controls remain fail closed, so checkout does not become operational without both protected Stripe runtime secrets.

Restore/verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` only through the Vercel/Stripe control planes. Do not place values in Git or chat. After restoration, redeploy and verify commerce health before any real checkout test.

### GitHub

CodeQL is enabled and operating. The Obserra-specific `SECURITY.md` and source-controlled Dependabot update policy are present.

Direct GitHub control-plane inspection still reports `main` as unprotected with required status-check enforcement off and no repository ruleset. Dependabot alerts were reported disabled by the API, and secret-scanning alert state cannot be read by the current integration.

GitHub issue #60 is the controlled work item for the remaining administrator-only settings. Do not close it without direct evidence that the ruleset/protection and requested security settings are actually enforced.

## NIST SP 800-171 Rev. 3 / CMMC Level 2 traceability

The production recovery maps principally to:

- `03.01.02`, `03.01.05` for access enforcement and least privilege;
- `03.04.01`, `03.04.03`, `03.04.05` for configuration baselines, change control, and access restrictions for change;
- `03.11.02` and `03.14.01` for vulnerability monitoring and flaw remediation;
- `03.12.01`, `03.12.03` for assessment and continuous monitoring;
- `03.13.06`, `03.13.15` for deny-by-default communications and session/authentication protections where applicable;
- `03.14.06` for system monitoring;
- `03.16.01`, `03.16.03` for security engineering and external system/service controls.

The current CMMC Level 2 Rev. 2 crosswalk remains preserved separately in the machine-readable production evidence register.

## Gate 37 publication-resume and workflow recovery

The unpublished production-hardening checkpoint is preserved at exact commit `83364708ae618555ec514d27a93079bad22a7c4c` and tree `2d75297998906cb0e84666dc4d5c72e9ecaf682b`. It contains exactly 208 changed paths relative to `0e72459a8940f23976038d85d6394409000f48c5` and no protected Applications path.

Before publication, current GitHub `main` was fetched and found to contain three later workflow-only commits. Each added a mis-nested `austenstone/copilot-cli@v3.2` action block; the insertions made the affected Website CI, Florida Class D LMS Gates, and Academy Studio synchronization YAML operationally invalid and used a mutable tag instead of an immutable commit pin. Merge commit `7f9c8f24a2ee1b73cbd0a748e5768486aaf33dbc` retains both Git histories while removing those blocks. The workflows must still pass exact-head GitHub validation before merge, and this record does not treat local YAML parsing as provider execution evidence.

Full local regulated validation subsequently retained two blocked runs and their fixes. Gate 25 first rejected one embedded FDACS Supabase origin; the exact-binding control now derives that origin from the controlled project reference and the enforcing rerun reports zero findings across 36 regulated modules. Gate 29 then rejected its stale 29-file expectation against the intended 35-file source lineage; the gate, activation constants, and handoff now bind version `20260814175000` and manifest SHA-256 `40eb88f6b8cb6ce2716eb260cde7f29d69d78f0a201e90cd6373ac1ebf2be090`. These source checks do not execute database migrations.

No Vercel deployment, canonical routing result, FDACS activation, CUI authorization, CMMC assessor finding, or human approval is created by this reconciliation. Those states remain pending and fail closed where required.

## Regulated and CUI boundary

Florida Class D production authorized: **false**.

CUI processing authorized: **false**.

Production Class D schema promotion completed: **false**.

Current main Academy database Class D objects: **zero**.

Fresh exact-candidate Gate 23 synthetic acceptance, Class DS authorization, applicable DI authorization, production Class D database promotion, authentic provider HA/recovery evidence, rollback evidence, and explicit activation controls remain required before regulated production can be enabled.

Nothing in this recovery record represents FDACS approval, CMMC certification, FedRAMP authorization, or authorization to process CUI.
