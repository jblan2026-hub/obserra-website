# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 23:22 ET

This is the current restart pointer for the regulated Florida Class D LMS, Obserra Academy production dependency work, and Class DS filing workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Restart authority

Repository: `jblan2026-hub/obserra-website`  
Branch: `feature/florida-class-d-lms-foundation`  
Pull request: `PR #56`  
PR state at last direct verification: **open, mergeable, unmerged**.

Read these controlled records before changing regulated behavior:

1. `HANDOFF.md`
2. `LATEST-HANDOFF.md`
3. `ACTION-LEDGER.md`
4. `CURRENT-STATUS-2026-08-13.md`
5. `GATE-29-MIGRATION-PARITY-HANDOFF.md`
6. `GATE-30-MUTATION-BOUNDARY-HANDOFF.md`
7. `GATE-31-HA-EVIDENCE-INTEGRITY-HANDOFF.md`
8. `GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`
9. `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

`HANDOFF.md` preserves historical verifier contract language. Do not rewrite historical literals merely to record later state.

## Exact completed Gate 32 source checkpoint

The current completed Gate 32 source checkpoint is:

`c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

All five primary workflows passed on that exact SHA:

- Florida Class D LMS Gates #520.
- Website CI #2233.
- Academy 70x Production Gate #1254.
- Application Release Validation #943.
- Application Production Pipeline #962.

This exact SHA includes Gates 1 through 32 source controls, website and Academy security hardening, Clerk middleware correction, Stripe commerce hardening, Supabase Academy controls, dependency remediation, build reproducibility, preview access hardening, and unified Academy course release identity.

The documentation synchronization commits after `c53e18e3...` change the branch SHA. The final handoff synchronized head must pass the same five workflow set before it becomes the final branch authority.

## Historical Gates 1 through 31 checkpoint

The preserved exact Gates 1 through 31 checkpoint remains:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

Five green workflows on that SHA:

- Florida Class D LMS Gates #474.
- Website CI #2093.
- Academy 70x Production Gate #1192.
- Application Release Validation #881.
- Application Production Pipeline #900.

This checkpoint remains historical evidence and is not rewritten by Gate 32.

## Gate 29 migration parity and promotion manifest

The authoritative regulated migration manifest contains 29 Class D migrations.

Latest Class D migration version:

`20260814011203`

Canonical migration manifest SHA 256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Production activation is cryptographically bound to the exact release candidate, candidate bound Gate 23 UAT, deployed Vercel SHA, production database promotion source SHA, latest regulated migration version, and migration manifest digest.

## Gate 30 regulated mutation boundary

A secure by default global mutation choke point protects POST, PUT, PATCH, and DELETE operations under `/api/florida-class-d`.

Normal regulated Class D mutations require production regulated execution authorization. The Gate 23 acceptance endpoint is separately restricted to explicit regulated nonproduction authorization.

This control is default deny and applies to current and future covered Class D mutation routes.

## Gate 31 cryptographic HA evidence

Gate 31 requires a protected cryptographic HA release artifact covering exactly ten verified subsystems:

1. edge and DNS;
2. application runtime;
3. identity;
4. database;
5. media;
6. document storage;
7. commerce;
8. observability;
9. backup and restore;
10. failover.

The contract requires exact release candidate binding, canonical SHA 256, per evidence digests, recency, RTO at or below 60 minutes, RPO at or below 15 minutes, and failover evidence no older than 90 days.

No external provider HA evidence has been fabricated or inferred from vendor marketing.

## Gate 32 website, Academy, identity, payment, and data security

Detailed handoff:

`GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Gate 32 covers only the public website, Obserra Academy and LMS, GitHub backend for those services, Supabase Academy database and Edge Function dependencies, Clerk identity, Stripe payment, Vercel runtime behavior, Academy course publication, and dependencies directly required by those components. Other Obserra applications are outside this Gate 32 workstream and were not modified.

### Academy publication state

The live Academy control plane contains:

- 60 total reviewed course controls;
- 60 published and purchasable nonregulated Academy courses;
- zero Class D or security officer like controls.

The regulated Class D course remains excluded.

Canonical publication migration:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

### Academy release identity

The reviewed baseline now has one authoritative release identity:

- version `1.0.0`;
- release status `published`.

The public course API, Stripe Checkout and payment intent metadata, dynamic Stripe product metadata, and legacy certificate fallback consume the same publication authority. Signed certificate schema 1.1 claims retain their own signed version authority.

### Academy database performance

Three Academy worker foreign key support indexes were applied and source controlled:

- `academy_openai_usage_events_command_idx`;
- `academy_openai_usage_events_node_idx`;
- `academy_worker_slot_status_command_idx`.

Canonical migration:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

### Clerk and paid learner access

The website proxy directly exports `clerkMiddleware()`.

Paid Academy media and the Obserrian Academy Tutor require authenticated Clerk identity and current course entitlement in preview as well as production. Generic preview authentication bypasses were removed.

The currently serving production deployment predates this fix and has emitted the known Clerk middleware detection error. Post deployment verification is required before identity readiness is accepted.

### Stripe commerce

Stripe Checkout Session creation is POST only, same origin protected, form content type restricted, current course control authorized, webhook readiness checked, and no store.

Deferred paid course claims require a paid Stripe session and either exact Clerk user binding or a verified Clerk email matching the Stripe purchaser email.

Signed Stripe webhooks remain the entitlement fulfillment authority, and entitlement fulfillment remains idempotent.

The live commerce health boundary reports Stripe commerce operational without exposing secret values.

### Public Academy catalog

The Supabase `academy-public-catalog` Edge Function is live as version 5, intentionally unauthenticated only at the gateway, GET only, field limited, public visible only, and fail closed on control service failure.

Hidden or unpublished control records are not returned in the public list response.

### Website security headers

Gate 32 verifies CSP, clickjacking protection, HSTS, MIME sniffing protection, cross origin protections, disabled framework disclosure, and no store handling for Academy APIs, Stripe webhook responses, Class D APIs, Academy payment returns, and identity routes.

The live production site was directly observed serving the expected core security headers.

### Production dependency remediation

The production dependency audit rejected the previous dependency graph because vulnerable transitive PostCSS and Sharp versions remained in the Next.js chain.

The remediated dependency baseline is:

- Next.js `16.3.1`;
- `eslint-config-next` `16.3.1`;
- React `19.2.8`;
- React DOM `19.2.8`.

A one time lock regeneration workflow passed clean install, production dependency audit, tests, lint, and production build before pushing the lockfile, then the temporary write capable workflow was removed.

Next 16.3.1 generated an additional `next-env.d.ts` type reference. That generated file change was committed so clean builds are reproducible.

## Gate 32 validation history

Intermediate failures remain part of the audit record:

- `9576ec126ebc2dc82d165220aa1f019e933213c6`: Academy #1241 failed because its verifier still pinned Next and ESLint 16.2.11 after the security upgrade to 16.3.1.
- `92af58ab77a8eea06c22678991f9f145dfa2fb87`: the Academy gate passed 369 assertions but CI detected uncommitted Next 16.3.1 generated type drift.
- `42fb836463a50aeeb12ba64e6dc43e594d726c25`: exact five green intermediate checkpoint after dependency and reproducibility remediation.
- `9729c3ab09aa280b746d6a1b6ebe3d9c4617723c`: a certificate regression test failed because it asserted old source formatting rather than the actual version security invariant.
- `c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`: exact five green Gate 32 source checkpoint after the test was corrected to validate behavior.

## Supabase environment boundary

Main project:

- name: `Obserra Academy`;
- project ref: `nwxnyqlyzyufgoadtqxs`;
- observed state: `ACTIVE_HEALTHY`;
- Class D schema objects: **zero**.

Regulated nonproduction:

- branch: `obserra-fdacs-lms-nonprod`;
- project ref: `jeklrsratrijrsamdauv`;
- purpose: synthetic Class D acceptance and regulated nonproduction validation only.

No Class D production database promotion has occurred.

## Vercel and public access

Direct Vercel control plane verification established:

- team slug: `obserra`;
- team id: `team_xpUE1GefY2JHuFFCqbAdnZAj`;
- project: `obserra-website-live`;
- project id: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`;
- canonical domain: `www.obserrallc.com`.

Currently serving production deployment:

- deployment id: `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`;
- source SHA: `80473277620e05acd5359330a706204703c999f0`;
- observed state: READY.

Direct feature branch deployments are canceled because Vercel reports their GitHub commit verification state as `unverified`. Verified GitHub generated merge commits are allowed to build and reach READY. This is a verified commit policy behavior rather than evidence that the Gate 32 build is broken.

No project move, new project creation, or DNS change was performed.

Public Academy access:

`https://www.obserrallc.com/academy`

The live Academy serves all 60 authorized nonregulated courses. Because production still runs the older source SHA, it also still contains pre Gate 32 behaviors, including legacy GET checkout links and the old Clerk middleware path. Do not invoke those legacy GET checkout URLs as a test because the old route can create a Stripe session.

## Production and regulatory boundary

Florida Class D production remains **fail closed**.

Nothing in Gates 29 through 32 authorizes:

- public regulated enrollment;
- real regulated learner access;
- production scheduling;
- live Class D instruction;
- production examination access;
- LIAS production execution;
- official completion release;
- regulated observer access;
- Class D database promotion;
- regulated runtime activation.

No source commit, CI result, UAT result, HA artifact, deployment state, filing package, screenshot, or readiness report is FDACS approval.

The historical Gate 23 18 of 18 synthetic UAT record is not candidate bound to the current source and cannot be reused as final acceptance.

## Controlled filing baseline

Current controlled private artifacts remain:

- LMS Guide DOCX v0.15;
- LMS Guide PDF v0.15, 43 pages;
- Submission Readiness Register v1.5, 6 pages;
- Controlled Pre Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA 256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA 256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA 256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

`DS-SUBMISSION-LMS-GUIDE-CONTROL.md` still contains older public metadata and must not be represented as synchronized to the current private filing baseline until a controlled revision actually lands.

## Current blockers before regulated production

- final exact five workflow validation on the handoff synchronized Gate 32 documentation head;
- controlled production deployment of a validated website and Academy candidate;
- deployed Clerk authentication verification;
- deployed Academy entitlement and POST only payment verification;
- authentic Vercel, Clerk, Stripe, Daily, document storage, observability, backup and restore, and failover evidence sufficient for the Gate 31 HA manifest;
- final candidate bound Gate 23 18 of 18 synthetic UAT on regulated nonproduction;
- controlled Class D production database promotion evidence;
- actual Class DS authorization;
- current DI instructor authorization where required;
- final security, rollback, and owner controlled Class D production activation approval.

The current Supabase connector does not expose project backup controls. Backup and restore therefore remains unverified external evidence rather than an assumed capability.

## Next governed actions

1. Synchronize the regulated action record through Gate 32.
2. Validate the resulting final documentation head with all five primary workflows.
3. Record that final exact SHA and run numbers in the handoff if green.
4. Keep PR #56 open and unmerged until the owner explicitly authorizes the verified GitHub merge and website production promotion.
5. Do not promote the Class D schema or activate regulated production.
6. After an authorized website deployment, verify exact deployed SHA, Clerk authentication, Academy entitlement, the 60 course catalog, POST only Stripe checkout, GET checkout rejection, signed webhook fulfillment, course version `1.0.0`, release status `published`, transactional caching protections, fresh runtime errors, and rollback behavior.
7. Obtain authentic provider HA and recovery evidence and construct the Gate 31 manifest only from retained evidence.
8. Execute fresh exact candidate bound Gate 23 18 of 18 synthetic UAT before any regulated production activation decision.

## Access pointers

Detailed Gate 32 handoff:

`docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Pull request:

`https://github.com/jblan2026-hub/obserra-website/pull/56`

Live Academy:

`https://www.obserrallc.com/academy`
