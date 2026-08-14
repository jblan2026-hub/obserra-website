# Florida Class D LMS Regulated Action Ledger Addendum, Gates 29 through 32

Snapshot: 2026-08-13 23:22 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

## Purpose

This addendum extends the append only regulated action history in `ACTION-LEDGER.md` for Gates 29 through 32. It does not rewrite historical entries or historical verifier contract language. Failed actions and incomplete evidence remain explicitly recorded.

This record is engineering and audit evidence only. It is not FDACS approval, Class DS authorization, CMMC certification, FedRAMP authorization, or Class D production activation approval.

## Gate 29 migration parity and promotion manifest

### Source and nonproduction migration reconciliation

The authoritative source and regulated nonproduction lineage was reconciled to exactly 29 Florida Class D migrations.

A duplicate source only migration named `20260813112000_fdacs_class_d_security_hardening.sql` was removed because it duplicated the already applied and restored migration `20260813204215_fdacs_class_d_security_hardening.sql`.

The canonical migration manifest contains:

- count: 29;
- latest regulated migration version: `20260814011203`;
- manifest SHA 256: `a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`.

The manifest is retained by CI and Gate 29 binds production activation to the exact release candidate, candidate bound Gate 23 UAT, Vercel deployed SHA, production database promotion source SHA, latest regulated migration version, and manifest digest.

Historical exact Gate 29 source five green checkpoint:

`a84c754db81ae805de634dbd74c8745ee8d29714`

Production effect: none. No Class D schema was promoted to the main Supabase project.

## Gate 30 regulated mutation boundary

### Initial finding

Florida Class D LMS Gates run #465 identified 22 regulated mutation routes, of which 17 lacked an explicit route level Gate 26 or shared regulated execution guard.

This finding was not suppressed and was not treated as an acceptable exception.

### Remediation

A secure by default global mutation choke point was implemented in:

`lib/florida-class-d-mutation-boundary.ts`

The boundary classifies POST, PUT, PATCH, and DELETE requests under `/api/florida-class-d`.

Normal Class D mutations require `floridaClassDRegulatedExecutionAuthorized()`.

The exact Gate 23 acceptance endpoint `/api/florida-class-d/admin/acceptance` is separately limited to `floridaClassDNonProductionExecutionAuthorized()`.

`proxy.ts` invokes the boundary before authentication and returns controlled HTTP 503 JSON when regulated execution is not authorized. Existing route level guards remain as defense in depth.

Mandatory verifier:

`scripts/florida-class-d-regulated-mutation-boundary-gate.mjs`

Historical exact Gate 30 five green source checkpoint:

`37ea4c345c5181c3f086e64f0f9b3926fbf17245`

Production effect: none. Regulated production remained fail closed.

## Gate 31 cryptographic HA evidence integrity

### Remediation

Gate 31 replaced operator only HA status assertions with a protected cryptographic release artifact implemented in:

`lib/florida-class-d-ha-evidence.ts`

Schema:

`obserra.fdacs.class-d.ha-evidence.v1`

Protected environment inputs:

- `OBSERRA_FDACS_HA_EVIDENCE_MANIFEST`;
- `OBSERRA_FDACS_HA_EVIDENCE_MANIFEST_SHA256`.

The manifest requires exactly ten verified subsystem identifiers:

1. `edge_dns`;
2. `application_runtime`;
3. `identity`;
4. `database`;
5. `media`;
6. `document_storage`;
7. `commerce`;
8. `observability`;
9. `backup_restore`;
10. `failover`.

The verifier enforces exact candidate binding, canonical manifest SHA 256, per evidence SHA 256, exact subsystem set, no duplicates, review and observation recency, RTO at or below 60 minutes, RPO at or below 15 minutes, and failover test evidence no older than 90 days.

Missing, malformed, stale, mismatched, or tampered evidence fails closed.

Mandatory verifier:

`scripts/florida-class-d-ha-evidence-integrity-gate.mjs`

Historical exact Gate 31 source five green checkpoint:

`4581747e4fcf0adbea8ef7e34dafa314f7ac8092`

Final Gates 1 through 31 documentation head five green checkpoint:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

Green workflows on `99ef49f...`:

- Florida Class D LMS Gates #474;
- Website CI #2093;
- Academy 70x Production Gate #1192;
- Application Release Validation #881;
- Application Production Pipeline #900.

Production effect: none. No external provider HA evidence was fabricated and regulated production remained disabled.

## Gate 32 website, Academy, identity, commerce, data, and dependency security

### Scope control

At owner direction, Gate 32 was explicitly limited to:

- the public website;
- Obserra Academy and LMS;
- the GitHub backend supporting those services;
- Supabase Academy database and Edge Function dependencies;
- Clerk identity;
- Stripe payment and entitlement fulfillment;
- Vercel runtime and deployment evidence;
- Academy course publication and course offerings;
- direct dependencies required by those components.

Other Obserra applications were not modified in this workstream.

### Vercel connector authorization and production mapping

Direct Vercel control plane access was established for the correct scope:

- team slug: `obserra`;
- team id: `team_xpUE1GefY2JHuFFCqbAdnZAj`;
- project: `obserra-website-live`;
- project id: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`.

The canonical public host `www.obserrallc.com` resolves to that project.

Observed currently serving production deployment:

- deployment id: `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`;
- source SHA: `80473277620e05acd5359330a706204703c999f0`;
- state: READY.

Direct feature branch deployments are canceled because Vercel reports their GitHub commit verification state as `unverified`. Verified GitHub generated merge commits are allowed to build and reach READY. This explains the earlier red feature deployment status without treating it as a production application build failure.

No Vercel project was created or moved. No DNS change occurred.

### Live production defects discovered

Vercel runtime telemetry on the old production deployment showed repeated Clerk failures with the server reporting that `auth()` could not detect usage of `clerkMiddleware()`.

The live Academy control path also showed historical 401 degradation before the public catalog service was corrected.

The live Academy currently serves 60 authorized nonregulated courses, but the old production deployment still renders legacy GET checkout mutation links and the old Clerk middleware path. Those observations are deployment lag, not Gate 32 branch regressions.

### Clerk middleware remediation

The branch now directly exports `clerkMiddleware()` in `proxy.ts` and includes Clerk internal paths in the matcher.

Paid Academy media and the Academy Tutor previously contained a generic `VERCEL_ENV=preview` authentication bypass. Both bypasses were removed. Preview and production now require authenticated identity and current course entitlement.

The source validator for production Clerk keys was retained. It was not weakened to hide the old middleware runtime defect.

Production effect: pending controlled deployment. The old production deployment still serves the previous middleware behavior.

### Academy public catalog remediation

The original `academy-public-catalog` Supabase Edge Function was configured with gateway JWT verification and also explicitly required a service role caller, making the supposed public catalog unusable from the website.

The function was corrected narrowly:

- gateway `verify_jwt=false`;
- GET only;
- service role used only internally;
- public safe field allowlist;
- `public_visible=true` controls only;
- content overrides only for public course IDs;
- hidden and unpublished controls omitted;
- fail closed behavior retained.

The live public function was first corrected and later minimized further. Current live version: **5**.

The protected owner function remained separately authenticated and unchanged.

### Fail closed Academy course controls

The website previously defaulted missing or malformed course controls to published and purchasable. Gate 32 reversed this unsafe default.

Missing or malformed control data now defaults to:

- unpublished;
- not public;
- purchase disabled.

A degraded public catalog returns no courses, and a degraded individual course lookup returns no public course.

### Reviewed 60 course publication baseline

The website source catalog was confirmed as the reviewed production baseline for the historical nonregulated Academy offering.

An idempotent migration was created and applied:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

Initial publication execution was rejected atomically because the audit ledger enforces a unique `(request_id, action)` pair. No partial course publication occurred.

The migration was corrected to generate a unique request identifier per publication audit event rather than weakening the audit constraint.

Verified live result:

- total course controls: 60;
- published and purchasable: 60;
- Class D or security officer like controls: 0;
- publication audit events: 60 unique events.

The migration uses `on conflict (course_id) do nothing` and does not overwrite later operator decisions.

### Academy database performance and security review

Three Academy worker foreign key support indexes were identified and applied through migration:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

Indexes:

- `academy_openai_usage_events_command_idx`;
- `academy_openai_usage_events_node_idx`;
- `academy_worker_slot_status_command_idx`.

Academy learner, assessment, certificate, enrollment, owner, production evidence, and worker tables reviewed use the intended backend only model with forced RLS and no anon or authenticated grants.

An apparent RLS exception on `academy_production_live_handoff` was investigated. An attempted `ENABLE ROW LEVEL SECURITY` statement was rejected because the object is a view, not a table. The rejected operation was atomic and made no schema change.

Direct inspection established that the view is `security_invoker` and has no anon or authenticated privileges. Its underlying worker tables are also protected.

Academy security definer functions reviewed have controlled search paths and no anon or authenticated execution grants.

### Stripe checkout and payment remediation

Creating a Stripe Checkout Session was converted from a state changing GET operation to POST only.

The checkout route now requires:

- POST;
- same origin `Origin` validation;
- supported form content type;
- current operational Academy control plane;
- `purchaseEnabled=true`;
- Stripe secret configuration;
- Stripe webhook secret configuration;
- no store responses.

GET returns HTTP 405 with `Allow: POST`.

Catalog and course detail purchase controls submit POST forms. Gate 32 forbids legacy query string checkout mutation links.

The live production deployment predates this remediation. Do not test its old GET checkout links because doing so could create a real Stripe session.

### Payment claim and entitlement remediation

Deferred redemption re fetches the Stripe Checkout Session and requires paid status and exact course binding.

A security gap was found where purchaser email could match any email on the Clerk account without explicit verification. Redemption now requires either exact Clerk user binding or a **verified** Clerk email matching the Stripe purchaser email.

Stripe webhook fulfillment remains signature verified and grants access only after a paid event. Entitlement fulfillment remains idempotent.

Live commerce health returned HTTP 200 with commerce operational, Stripe configuration present, signed event verification required, and idempotent fulfillment enabled. No secret values were exposed.

### Website security headers

Existing strong transport and browser isolation controls were retained and made part of Gate 32 verification, including CSP, HSTS, framing protection, MIME sniffing protection, cross origin protections, and disabled framework disclosure.

No store transactional headers were extended to Academy APIs, Stripe webhook responses, Class D APIs, Academy payment returns, and identity routes.

### Production dependency vulnerability remediation

The new production dependency audit:

`npm audit --omit=dev --audit-level=high`

found high severity transitive dependency findings in the previous Next.js chain, including PostCSS and Sharp.

A targeted dependency impact analysis supported upgrading:

- Next.js to `16.3.1`;
- `eslint-config-next` to `16.3.1`;
- React to `19.2.8`;
- React DOM to `19.2.8`.

The first one time lock regeneration attempt failed before changing the lockfile because React DOM had resolved to 19.2.8 while React remained pinned at 19.2.3. No partial dependency state was retained.

React and React DOM were then aligned to 19.2.8. The one time workflow passed:

- lock regeneration;
- clean locked install;
- production dependency audit;
- repository tests;
- lint;
- production build.

The workflow pushed the patched lockfile and was then deleted. No permanent write capable remediation workflow was left in the repository.

### Gate 32 validation failures retained

#### Documentation head `9576ec126ebc2dc82d165220aa1f019e933213c6`

Academy 70x Production Gate #1241 failed because its verifier still pinned Next and `eslint-config-next` at 16.2.11. The verifier was updated to the audited 16.3.1 baseline rather than rolling the security dependency remediation backward.

#### Head `92af58ab77a8eea06c22678991f9f145dfa2fb87`

The Academy gate passed all 369 assertions, but Next 16.3.1 generated an additional `next-env.d.ts` root parameter type reference. CI correctly rejected the uncommitted generated drift.

The generated reference was committed so clean builds remain reproducible.

#### Intermediate exact five green checkpoint `42fb836463a50aeeb12ba64e6dc43e594d726c25`

All five primary workflows passed after dependency remediation and build reproducibility correction.

This checkpoint was later superseded by additional course release identity hardening.

#### Head `9729c3ab09aa280b746d6a1b6ebe3d9c4617723c`

Publication identity hardening caused repository tests to fail because one certificate regression test asserted old single line source formatting. Certificate behavior remained correct.

The test was corrected to assert the actual invariant: signed schema 1.1 certificates own their signed version, while legacy certificates use the governed publication version.

### Course release identity hardening

The public course API had exposed `releaseStatus: null` and `version: null`, while checkout and certificate paths maintained separate `1.0.0` fallback behavior.

The reviewed baseline is now centrally defined as:

- version `1.0.0`;
- release status `published`.

`app/academy/coursePublication.ts` is the authority. Stripe Checkout metadata, payment intent metadata, dynamic product metadata, public course API, and legacy certificate fallback consume the same publication identity.

Regression tests enforce the cross surface parity.

### Exact Gate 32 source checkpoint

Current completed exact Gate 32 source checkpoint:

`c53e18e33eb7fb6a3bdfc9569b18381b3eef0a19`

All five primary workflows passed:

- Florida Class D LMS Gates #520;
- Website CI #2233;
- Academy 70x Production Gate #1254;
- Application Release Validation #943;
- Application Production Pipeline #962.

Production effect: none from Git source validation. The currently serving production deployment remains on the older main SHA pending explicit owner authorization for the normal verified GitHub merge and production promotion.

## External provider evidence blockers retained

The following regulated HA and recovery evidence remains incomplete and must not be fabricated:

- Vercel production regional failover and end to end application runtime evidence;
- Clerk production identity availability evidence;
- Stripe commerce availability evidence;
- Daily production media availability and failover evidence;
- document storage availability and recovery evidence;
- observability and alerting evidence;
- Supabase backup and restore evidence;
- end to end failover exercise evidence.

The current Supabase connector does not expose project backup controls. Backup and restore is therefore recorded as unverified external evidence, not assumed readiness.

Gate 31 remains fail closed until authentic retained evidence can populate the cryptographic HA manifest for the exact release candidate.

## Permanent regulated production boundary

Florida Class D production remains **fail closed**.

No Gate 29, Gate 30, Gate 31, or Gate 32 source commit, CI result, Vercel state, Supabase state, Academy publication action, payment health result, or handoff record authorizes regulated production.

The main Supabase project still contains zero `fdacs_class_d_*` objects. No Class D production schema promotion occurred.

The historical Gate 23 18 of 18 synthetic UAT is not bound to the current candidate and cannot satisfy final acceptance.

Actual Class DS authorization, current DI instructor authorization where required, fresh exact candidate Gate 23 UAT, production database promotion evidence, provider HA evidence, security and rollback acceptance, and explicit owner controlled Class D production activation approval remain required.
