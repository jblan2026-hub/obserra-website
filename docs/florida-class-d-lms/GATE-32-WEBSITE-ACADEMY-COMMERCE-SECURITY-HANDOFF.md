# Gate 32 Website, Academy, Commerce, Identity, and Data Security Handoff

Snapshot: 2026-08-13 23:10 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

## Purpose

Gate 32 extends the regulated release chain into the production website and Obserra Academy dependency surface without weakening the Florida Class D fail-closed boundary. The work covers the public website, Academy LMS, Supabase-backed Academy control plane, Clerk identity boundary, Stripe checkout and entitlement fulfillment, Vercel runtime behavior, production dependency hygiene, and the shared security headers that protect these routes.

This handoff is an engineering and audit record. It is not FDACS approval, Class DS authorization, production activation approval, or evidence that external high-availability obligations have been independently verified.

## Historical regulated authority

The last completed exact five-green Gates 1-31 checkpoint remains:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

Five green workflows on that SHA:

- Florida Class D LMS Gates #474.
- Website CI #2093.
- Academy 70x Production Gate #1192.
- Application Release Validation #881.
- Application Production Pipeline #900.

Gate 29 cryptographically bound the Class D migration manifest. Gate 30 established the default-deny regulated mutation boundary. Gate 31 established cryptographically bound HA evidence requirements. Those controls remain part of the source baseline and are not replaced by Gate 32.

## Current Gate 32 source state

Latest source-hardening head before this documentation synchronization:

`7da136c63612b83313d6178a94546d40903213ae`

The complete five-workflow validation set for the final documentation head is still required. Do not treat Gate 32 as an exact five-green checkpoint until the same final SHA has passed all five primary workflows.

## Gate 32 controls implemented

### Clerk identity and middleware

The website proxy now exports `clerkMiddleware()` directly so server-side `auth()` can detect the Clerk middleware boundary correctly. The matcher includes API routes and Clerk internal paths.

Paid Academy lesson media and the Obserrian Academy Tutor no longer contain a preview-environment authentication bypass. Preview and production now require:

- a valid Clerk session;
- a signed-in user;
- current Academy entitlement for the requested course.

Owner access remains available only through the authenticated owner-access path rather than through a generic `VERCEL_ENV=preview` exemption.

### Academy publication control plane

The existing reviewed website catalog was established as the controlled Academy publication baseline.

Live Supabase main-project verification after publication:

- total Academy course controls: **60**;
- published and purchasable controls: **60**;
- Class D or security-officer-like controls: **0**.

The baseline publication migration is idempotent and does not overwrite later operator decisions. Each newly inserted course control is associated with an audit event using the controlled actor identity `system:baseline-reviewed-catalog`.

Canonical source migration:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

The Class D regulated course is intentionally not part of this 60-course Academy baseline.

### Public Academy catalog minimization

The `academy-public-catalog` Supabase Edge Function was tightened so it:

- remains GET-only;
- exposes only public-safe control and override fields;
- returns only `public_visible=true` course controls;
- retrieves content overrides only for public course IDs;
- does not expose hidden/unpublished control records as part of the list response;
- continues to fail closed if the control service is unavailable.

The live Edge Function was deployed as version 5 during this workstream.

### Stripe commerce and purchase boundary

Creating a Stripe Checkout Session is now a state-changing POST operation rather than a GET side effect.

The checkout endpoint now requires:

- POST;
- same-origin `Origin` validation;
- supported form content type;
- current operational Academy control-plane state;
- current course `purchaseEnabled=true` authorization;
- Stripe secret configuration;
- Stripe webhook-secret configuration;
- no-store response caching.

GET requests to the checkout endpoint return HTTP 405 with `Allow: POST`.

Academy catalog and course-detail purchase controls now submit POST forms to `/api/academy/checkout`; legacy query-string checkout links are forbidden by Gate 32.

### Payment claim and entitlement hardening

Deferred course redemption re-fetches the Stripe Checkout Session and requires:

- `mode=payment`;
- completed session status;
- `payment_status=paid`;
- exact course metadata match;
- either exact Clerk user binding from checkout or a verified Clerk email matching the Stripe purchaser email.

An unverified Clerk email alias cannot claim a paid course.

Stripe webhook fulfillment remains signature-verified and grants access only after a paid event.

### Website and transactional security headers

The website retains and Gate 32 now verifies:

- Content Security Policy;
- `object-src 'none'`;
- `frame-ancestors 'none'`;
- HTTPS upgrade policy;
- HSTS with includeSubDomains and preload;
- MIME sniffing protection;
- cross-origin opener/resource protections;
- framework disclosure disabled.

No-store transactional headers were extended to Academy APIs, the Stripe webhook, Class D APIs, Academy payment return, and identity routes.

### Next.js and production dependency remediation

Gate 32 added a production dependency audit:

`npm audit --omit=dev --audit-level=high`

That audit correctly rejected the prior dependency graph because vulnerable transitive PostCSS and Sharp versions remained in the Next.js chain.

The remediation upgraded and aligned:

- `next` to `16.3.1`;
- `eslint-config-next` to `16.3.1`;
- `react` to `19.2.8`;
- `react-dom` to `19.2.8`.

A one-time branch workflow regenerated the lockfile and required all of the following before pushing it:

- deterministic lock regeneration;
- clean `npm ci`;
- production dependency audit;
- repository tests;
- lint;
- production Next.js build.

That one-time workflow completed successfully and pushed lockfile head `a8800916169d7f439b4827d52371dc1563c379b7`. The temporary write-capable workflow was then removed from the branch.

### Supabase Academy database performance and access control

Supabase performance analysis identified three Academy worker foreign keys without covering indexes. The following indexes were applied and source-controlled:

- `academy_openai_usage_events_command_idx`;
- `academy_openai_usage_events_node_idx`;
- `academy_worker_slot_status_command_idx`.

Canonical source migration:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

Academy learner, assessment, certificate, enrollment, owner, production-evidence, and worker tables reviewed during this workstream use the intended service/backend-only access model with forced RLS and no anon or authenticated grants. The `academy_production_live_handoff` object is a security-invoker view, not a table; the attempted table-RLS migration was rejected atomically and removed from Git without changing the database.

## Live environment observations

### Supabase

Main project: `Obserra Academy`

Project ref: `nwxnyqlyzyufgoadtqxs`

Observed state during this workstream: `ACTIVE_HEALTHY`.

The main project contains the live nonregulated Academy control plane and still contains **zero `fdacs_class_d_*` objects**. No Class D production schema promotion occurred.

Regulated nonproduction branch remains:

- branch: `obserra-fdacs-lms-nonprod`;
- project ref: `jeklrsratrijrsamdauv`;
- purpose: Class D synthetic acceptance and regulated nonproduction validation only.

### Vercel

Intended existing project remains `obserra-website-live` under the intended team slug `obserra`.

Canonical public host remains:

`https://www.obserrallc.com`

The currently observed production deployment still reflects the older production SHA until a controlled production deployment of the new release candidate occurs. Production runtime logs previously showed the known Clerk middleware/auth failure on the older deployment. The direct-export Clerk fix exists in the branch but must be verified on the actual deployed candidate before production readiness can be claimed.

### Stripe

The live Academy commerce-health boundary previously returned operational status with Stripe secret configuration present and webhook verification required. No secret values were exposed or requested in this workstream.

### Academy public catalog

The live public Academy catalog was restored to the reviewed 60-course nonregulated baseline through the secure control plane. The Class D regulated course remains excluded.

## High availability and production activation

Gate 31 remains the authority for cryptographic HA evidence. Gate 32 does not replace that requirement.

No HA evidence has been fabricated for Vercel, Clerk, Stripe, Daily, observability, backup/restore, or document storage. External-provider evidence and final release binding are still required before regulated production activation.

Current source policy continues to require authentic evidence for the complete service chain and enforces:

- RTO at or below 60 minutes;
- RPO at or below 15 minutes;
- failover exercise evidence no older than 90 days;
- exact release-candidate binding;
- protected HA evidence manifest and SHA-256 digest.

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

The main Supabase project remains without Class D schema objects. The historical Gate 23 18-of-18 synthetic UAT record is not candidate-bound to the current source and cannot be reused as final acceptance.

Actual Class DS authorization, current DI instructor authorization where required, candidate-bound UAT, provider evidence, production database promotion evidence, rollback/security acceptance, and owner-controlled activation approval remain separate prerequisites.

## Current validation requirement

The branch must not be described as Gate 32 five-green until one exact final SHA passes all five primary workflows:

1. Florida Class D LMS Gates.
2. Website CI.
3. Academy 70x Production Gate.
4. Application Release Validation.
5. Application Production Pipeline.

Any later source or handoff synchronization commit changes the candidate SHA and therefore requires the final checkpoint to be recorded against the new exact head.

## Next governed actions

1. Complete the exact five-workflow validation set on the final handoff-synchronized head.
2. Record the exact workflow run numbers and exact final SHA in this handoff and `LATEST-HANDOFF.md` once green.
3. Keep PR #56 open and unmerged until the controlled release decision is made.
4. Do not activate Class D production or promote the Class D schema to the main Supabase project.
5. When a production candidate is intentionally deployed, verify Clerk authentication, Academy entitlement enforcement, public catalog state, Stripe POST checkout, signed-webhook fulfillment, no-store transactional responses, and rollback behavior against the deployed exact SHA.
6. Obtain authentic provider HA/recovery evidence and build the Gate 31 manifest for the final candidate rather than using generic vendor claims.
7. Run a fresh exact-candidate-bound Gate 23 18-of-18 synthetic UAT on the regulated nonproduction branch before any regulated production activation decision.

## Access pointers

Latest controlled handoff:

`docs/florida-class-d-lms/LATEST-HANDOFF.md`

Gate 32 detailed handoff:

`docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Pull request:

`https://github.com/jblan2026-hub/obserra-website/pull/56`

Live public Academy:

`https://www.obserrallc.com/academy`
