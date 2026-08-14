# Gate 32 Website, Academy, Commerce, Identity, and Data Security Handoff

Snapshot: 2026-08-13 23:22 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

## Purpose

Gate 32 extends the regulated release chain across the public website and Obserra Academy dependency surface without weakening the Florida Class D fail closed boundary. The work covers the public website, Academy LMS, Supabase Academy control plane, Clerk identity boundary, Stripe checkout and entitlement fulfillment, Vercel runtime behavior, production dependency hygiene, course release identity, database access controls, and shared transactional security headers.

This handoff is an engineering and audit record. It is not FDACS approval, Class DS authorization, production activation approval, CMMC certification, FedRAMP authorization, or independent verification of every external provider high availability obligation.

## Historical Gates 1 through 31 authority

The completed Gates 1 through 31 checkpoint remains preserved as historical evidence:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

Five green workflows on that SHA:

- Florida Class D LMS Gates #474.
- Website CI #2093.
- Academy 70x Production Gate #1192.
- Application Release Validation #881.
- Application Production Pipeline #900.

Gate 29 cryptographically bound the Class D migration manifest. Gate 30 established the default deny regulated mutation boundary. Gate 31 established cryptographically bound HA evidence requirements. Gate 32 preserves those controls.

## Exact Gate 32 source checkpoint

The current completed exact Gate 32 source checkpoint is:

`c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

All five primary workflows passed on that exact SHA:

- Florida Class D LMS Gates #520.
- Website CI #2233.
- Academy 70x Production Gate #1254.
- Application Release Validation #943.
- Application Production Pipeline #962.

This checkpoint includes the website, Academy, payment, identity, database, dependency, preview access, course publication identity, and build reproducibility hardening described below.

A later documentation synchronization commit changes the branch SHA. The final documentation head must therefore receive its own five workflow validation before it becomes the final handoff checkpoint.

## Gate 32 controls implemented

### Clerk identity and middleware

The website proxy directly exports `clerkMiddleware()` so server side `auth()` executes inside Clerk's supported middleware boundary. The matcher includes API routes and Clerk internal paths.

Paid Academy lesson media and the Obserrian Academy Tutor no longer contain a preview environment authentication bypass. Preview and production require:

- a valid Clerk session;
- a signed in user;
- current Academy entitlement for the requested course.

Owner access remains available only through the authenticated owner access path.

The live production deployment still runs the older production SHA and has emitted the known `auth()` cannot detect `clerkMiddleware()` runtime failure. Gate 32 corrects that source defect, but the fix must be verified after an intentionally authorized production deployment.

### Academy publication control plane

The reviewed website catalog is the controlled nonregulated Academy publication baseline.

Live Supabase main project verification after publication:

- total Academy course controls: **60**;
- published and purchasable controls: **60**;
- Class D or security officer like controls: **0**.

The baseline publication migration is idempotent and does not overwrite later operator decisions. Each newly inserted course control is associated with an audit event using actor `system:baseline-reviewed-catalog`.

Canonical source migration:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

The regulated Class D course is intentionally excluded from this 60 course baseline.

### Course release identity and commercial traceability

The reviewed baseline now has one authoritative semantic release identity:

- version: `1.0.0`;
- release status: `published`.

`app/academy/coursePublication.ts` is the publication authority for baseline release identity. The public course API, Stripe Checkout metadata, payment intent metadata, dynamic Stripe product metadata, and legacy certificate fallback now derive course release identity from the same publication authority.

Signed certificate schema 1.1 claims remain authoritative for certificates already carrying their own signed course title and semantic version. Legacy certificate rendering uses the governed publication version rather than an unrelated hard coded fallback.

Regression tests enforce version and release status parity across publication, checkout, public course API, and certificate rendering.

### Public Academy catalog minimization

The `academy-public-catalog` Supabase Edge Function is source controlled and deployed as live version 5. It:

- is GET only;
- is intentionally unauthenticated only at the gateway;
- exposes only public safe control and override fields;
- returns only `public_visible=true` controls;
- retrieves content overrides only for public course IDs;
- does not expose hidden or unpublished control records in the list response;
- fails closed when the control service is unavailable.

The protected owner function remains separately authenticated and was not weakened.

### Stripe commerce and purchase boundary

Creating a Stripe Checkout Session is a state changing POST operation rather than a GET side effect.

The checkout endpoint requires:

- POST;
- same origin `Origin` validation;
- supported form content type;
- current operational Academy control plane state;
- current `purchaseEnabled=true` authorization;
- Stripe secret configuration;
- Stripe webhook secret configuration;
- no store response caching.

GET requests return HTTP 405 with `Allow: POST`.

Academy catalog and course detail purchase controls submit POST forms to `/api/academy/checkout`. Legacy query string checkout mutation links are forbidden by Gate 32.

The currently serving production deployment predates this fix and still renders legacy GET checkout links. No production checkout test should invoke those old GET links because doing so could create a Stripe session. Post deployment verification must confirm GET returns 405 before commerce is accepted as fully remediated.

### Payment claim and entitlement hardening

Deferred course redemption re fetches the Stripe Checkout Session and requires:

- payment mode;
- completed session state;
- `payment_status=paid`;
- exact course metadata match;
- either exact Clerk user binding from checkout or a verified Clerk email matching the Stripe purchaser email.

An unverified Clerk email alias cannot claim a paid course.

Stripe webhook fulfillment remains signature verified and grants access only after a paid event. Entitlement creation remains idempotent.

The live commerce health boundary returned operational status during this workstream and confirmed Stripe configuration, signed event verification, and idempotent fulfillment without exposing any secret values.

### Website and transactional security headers

Gate 32 verifies the website retains:

- Content Security Policy;
- `object-src 'none'`;
- `frame-ancestors 'none'`;
- HTTPS upgrade policy;
- HSTS with includeSubDomains and preload;
- MIME sniffing protection;
- cross origin opener and resource protections;
- framework disclosure disabled.

No store transactional headers cover Academy APIs, the Stripe webhook, Class D APIs, the Academy payment return, and identity routes.

The live site was directly observed serving CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, cross origin opener protection, and a restrictive permissions policy.

### Next.js and production dependency remediation

Gate 32 added:

`npm audit --omit=dev --audit-level=high`

The audit rejected the prior dependency graph because vulnerable transitive PostCSS and Sharp versions remained in the Next.js dependency chain.

The remediation aligned:

- `next` to `16.3.1`;
- `eslint-config-next` to `16.3.1`;
- `react` to `19.2.8`;
- `react-dom` to `19.2.8`.

A one time branch workflow regenerated the lockfile and required clean `npm ci`, the production dependency audit, repository tests, lint, and a production Next.js build before pushing the lockfile. That workflow completed successfully and was removed immediately afterward.

Next 16.3.1 generated an additional `next-env.d.ts` root parameter type reference. That generated reference is committed so clean CI builds are reproducible and do not leave uncommitted framework generated drift.

### Supabase Academy database performance and access control

Three Academy worker foreign key support indexes were applied and source controlled:

- `academy_openai_usage_events_command_idx`;
- `academy_openai_usage_events_node_idx`;
- `academy_worker_slot_status_command_idx`.

Canonical source migration:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

Academy learner, assessment, certificate, enrollment, owner, production evidence, and worker tables reviewed during this workstream use the intended backend only access model with forced RLS and no anon or authenticated grants.

`academy_production_live_handoff` is a security invoker view, not a table. An attempted table RLS migration was rejected atomically and removed from Git. No database change occurred from that rejected migration.

Academy security definer functions reviewed have controlled search paths, no anon or authenticated execute grants, and service role only execution.

## Validation history retained for audit

Gate 32 did not become green on the first attempt. The following intermediate failures are part of the controlled history and must not be rewritten as successes.

### Gate 32 documentation head `9576ec126ebc2dc82d165220aa1f019e933213c6`

Academy 70x Production Gate #1241 failed because the Academy verifier still pinned Next and `eslint-config-next` at 16.2.11 after the audited dependency remediation intentionally moved both to 16.3.1. The verifier was updated to the patched security baseline rather than rolling dependencies backward.

### Head `92af58ab77a8eea06c22678991f9f145dfa2fb87`

The Academy gate itself passed all 369 assertions, but the clean build generated an additional Next 16.3.1 type reference in `next-env.d.ts`. CI correctly rejected the uncommitted generated drift. The generated reference was committed instead of disabling the reproducibility control.

### Exact five green intermediate checkpoint `42fb836463a50aeeb12ba64e6dc43e594d726c25`

All five primary workflows passed on this SHA after the dependency and reproducibility fixes. It remains valid intermediate evidence but is superseded as Gate 32 source authority by `c53e18e3...` because later course release identity hardening was added.

### Head `9729c3ab09aa280b746d6a1b6ebe3d9c4617723c`

The publication identity change caused test failures because one certificate test asserted old single line source formatting. The certificate behavior itself remained correct. The test was changed to assert the security invariant rather than source formatting.

### Final source checkpoint `c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

All five primary workflows passed. This is the current completed Gate 32 source checkpoint before final documentation synchronization.

## Live environment observations

### Supabase

Main project: `Obserra Academy`

Project ref: `nwxnyqlyzyufgoadtqxs`

Observed state: `ACTIVE_HEALTHY`.

The main project contains the live nonregulated Academy control plane and still contains **zero `fdacs_class_d_*` objects**. No Class D production schema promotion occurred.

Regulated nonproduction remains:

- branch: `obserra-fdacs-lms-nonprod`;
- project ref: `jeklrsratrijrsamdauv`;
- purpose: Class D synthetic acceptance and regulated nonproduction validation only.

### Vercel

Direct control plane access verified the intended Vercel scope:

- team slug: `obserra`;
- team id: `team_xpUE1GefY2JHuFFCqbAdnZAj`;
- project: `obserra-website-live`;
- project id: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`.

Canonical public host remains:

`https://www.obserrallc.com`

The currently serving production deployment is READY on the older main source SHA:

`80473277620e05acd5359330a706204703c999f0`

Observed deployment id:

`dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`

Direct feature branch deployments are canceled because their GitHub commit verification metadata is `unverified`. Verified GitHub generated merge commits are allowed to build and reach READY. This is a Vercel verified commit policy behavior, not evidence that the Gate 32 application build is failing.

No project move, project creation, or DNS change was performed.

### Live Academy

The live public Academy currently serves all 60 authorized nonregulated courses from the intended production project and reports the Academy control plane as operational.

Because production still serves the older source SHA, it also still reflects pre Gate 32 behaviors, including legacy GET checkout links and the old Clerk middleware path. These are deployment lag observations, not branch regressions.

### Stripe

The live Academy commerce health boundary returned HTTP 200 and reported commerce operational with:

- Stripe secret configuration present;
- webhook secret configuration present;
- signed event verification required;
- idempotent fulfillment enabled.

No Stripe secret value was read, exposed, or requested.

### Clerk

The live site has owner confirmed Clerk integration, but the old production deployment continues to report identity degraded and runtime telemetry contains the known middleware detection error. Current Clerk documentation confirms the branch production key validation pattern is consistent with the supported `pk_live_` and `sk_live_` production key structure. The validator was not weakened.

The identity state must be rechecked after Gate 32 is actually deployed before concluding that production Clerk credentials need owner action.

## High availability and production activation

Gate 31 remains the authority for cryptographic HA evidence. Gate 32 does not replace it.

No HA evidence has been fabricated for Vercel, Clerk, Stripe, Daily, observability, backup and restore, document storage, or end to end failover.

The current Supabase connector does not expose project backup controls. Backup and restore therefore remains unverified external evidence for regulated activation rather than an assumed capability.

Current policy requires authentic evidence for the complete regulated service chain and enforces:

- RTO at or below 60 minutes;
- RPO at or below 15 minutes;
- failover exercise evidence no older than 90 days;
- exact release candidate binding;
- protected HA evidence manifest and SHA 256 digest.

## Florida Class D regulatory boundary

Florida Class D production remains **fail closed**.

Nothing in Gate 32 authorizes:

- public Class D enrollment;
- real regulated learner access;
- production Class D scheduling;
- live Class D instruction;
- production Class D examination access;
- LIAS production execution;
- official completion release;
- regulated observer access;
- Class D database promotion;
- production activation.

The main Supabase project remains without Class D schema objects. The historical Gate 23 18 of 18 synthetic UAT record is not candidate bound to the current source and cannot be reused as final acceptance.

Actual Class DS authorization, current DI instructor authorization where required, candidate bound UAT, provider evidence, production database promotion evidence, rollback and security acceptance, and owner controlled activation approval remain separate prerequisites.

## Next governed actions

1. Synchronize `LATEST-HANDOFF.md` and the regulated action record to exact source checkpoint `c53e18e3...`.
2. Revalidate all five workflows on the resulting final documentation SHA.
3. Keep PR #56 open and unmerged until the owner explicitly authorizes the normal verified GitHub merge and production promotion.
4. Do not promote the Class D schema or activate regulated production.
5. After an authorized production deployment, verify the exact deployed SHA, Clerk authentication, Academy entitlement enforcement, the 60 course public catalog, POST only Stripe checkout, GET checkout rejection, signed webhook fulfillment, course version `1.0.0`, release status `published`, transactional caching protections, and fresh runtime errors.
6. Obtain authentic provider HA and recovery evidence and construct the Gate 31 manifest only from retained evidence.
7. Execute fresh exact candidate bound Gate 23 18 of 18 synthetic UAT before any regulated production activation decision.

## Access pointers

Latest controlled handoff:

`docs/florida-class-d-lms/LATEST-HANDOFF.md`

Gate 32 detailed handoff:

`docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Pull request:

`https://github.com/jblan2026-hub/obserra-website/pull/56`

Live public Academy:

`https://www.obserrallc.com/academy`
