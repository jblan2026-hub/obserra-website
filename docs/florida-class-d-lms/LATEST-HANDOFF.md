# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 23:10 ET

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

`HANDOFF.md` preserves historical verifier-contract language. Do not rewrite historical literals merely to record later state.

## Exact completed five-green checkpoint

The current completed exact five-green regulated checkpoint remains:

`99ef49f4b43ee0cd0da6f147a4566e4d22a47aa8`

All five primary workflows are green on that exact SHA:

- Florida Class D LMS Gates #474.
- Website CI #2093.
- Academy 70x Production Gate #1192.
- Application Release Validation #881.
- Application Production Pipeline #900.

This exact SHA is the completed Gates 1-31 authority.

## Gates 29 through 31

### Gate 29 migration parity and promotion manifest

The authoritative regulated migration manifest contains 29 Class D migrations.

Latest Class D migration version:

`20260814011203`

Canonical migration-manifest SHA-256:

`a2099d8610f0427fa2f85cb7a47efaa2af4b899be21952b0fcacaadd15e8e453`

Production activation is cryptographically bound to the exact release candidate, candidate-bound Gate 23 UAT, deployed Vercel SHA, production database promotion source SHA, latest regulated migration version, and migration-manifest digest.

### Gate 30 regulated mutation boundary

A secure-by-default global mutation choke point now protects POST, PUT, PATCH, and DELETE operations under `/api/florida-class-d`.

Normal regulated Class D mutations require production regulated-execution authorization. The Gate 23 acceptance endpoint is separately restricted to explicit regulated nonproduction authorization.

This control is default deny and applies to current and future Class D mutation routes covered by the API matcher.

### Gate 31 cryptographic HA evidence

HA evidence is now a protected cryptographic release artifact rather than a collection of operator-set status strings.

The HA evidence contract requires exactly ten verified subsystems:

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

The contract requires exact release-candidate binding, canonical SHA-256, per-evidence digests, recency, RTO at or below 60 minutes, RPO at or below 15 minutes, and failover evidence no older than 90 days.

No external-provider HA evidence has been fabricated or inferred from vendor marketing.

## Gate 32 current workstream

Detailed handoff:

`GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Gate 32 extends the security boundary across the public website, Obserra Academy, Supabase Academy control plane, Clerk identity, Stripe commerce, Vercel runtime behavior, production dependency hygiene, and shared transactional security headers.

Latest source-hardening head before documentation synchronization:

`7da136c63612b83313d6178a94546d40903213ae`

Gate 32 is not yet an exact five-green checkpoint. The final handoff-synchronized SHA must pass all five primary workflows before Gate 32 can be recorded as completed five-green.

### Academy publication state

The live Academy control plane now contains:

- 60 total reviewed course controls;
- 60 published and purchasable nonregulated Academy courses;
- zero Class D or security-officer-like controls.

The Class D regulated course remains excluded.

Canonical publication migration:

`supabase/migrations/20260814025522_academy_baseline_publication_controls.sql`

### Academy database performance

Three Academy worker foreign-key support indexes were applied and source-controlled:

- `academy_openai_usage_events_command_idx`;
- `academy_openai_usage_events_node_idx`;
- `academy_worker_slot_status_command_idx`.

Canonical migration:

`supabase/migrations/20260814025503_academy_worker_fk_performance_indexes.sql`

### Clerk and paid learner access

The website proxy directly exports `clerkMiddleware()`.

Paid Academy media and the Obserrian Academy Tutor now require authenticated Clerk identity and current course entitlement in preview as well as production. Generic preview authentication bypasses were removed.

### Stripe commerce

Stripe Checkout Session creation is now POST-only, same-origin protected, form-content-type restricted, current course-control authorized, webhook-readiness checked, and no-store.

Deferred paid-course claims require a paid Stripe session and either exact Clerk user binding or a verified Clerk email matching the Stripe purchaser email.

Signed Stripe webhooks remain the entitlement fulfillment authority.

### Public Academy catalog

The Supabase public catalog Edge Function remains intentionally unauthenticated only at the gateway, GET-only, public-field-limited, and public-visible-only.

Hidden or unpublished Academy control records are not returned in the public list response.

### Website security headers

Gate 32 now verifies CSP, clickjacking protection, HSTS, MIME sniffing protection, cross-origin protections, disabled framework disclosure, and no-store handling for Academy APIs, Stripe webhook responses, Class D APIs, Academy payment returns, and identity routes.

### Production dependency remediation

The production dependency audit correctly rejected the previous dependency graph because vulnerable transitive PostCSS and Sharp versions remained in the Next.js chain.

The remediation aligned:

- Next.js `16.3.1`;
- eslint-config-next `16.3.1`;
- React `19.2.8`;
- React DOM `19.2.8`.

A one-time branch workflow regenerated the lockfile and passed clean install, production dependency audit, repository tests, lint, and production build before pushing the patched lock. That temporary write-capable workflow was then removed.

## Supabase environment boundary

Main project:

- name: `Obserra Academy`;
- project ref: `nwxnyqlyzyufgoadtqxs`;
- observed state: `ACTIVE_HEALTHY`;
- Class D schema objects: **zero**.

Regulated nonproduction branch:

- branch: `obserra-fdacs-lms-nonprod`;
- project ref: `jeklrsratrijrsamdauv`;
- purpose: synthetic Class D acceptance and regulated nonproduction validation only.

No Class D production database promotion has occurred.

## Vercel and public access

Existing intended Vercel project: `obserra-website-live`.  
Canonical registered domain: `obserrallc.com`.  
Public website host: `www.obserrallc.com`.  
Owner-confirmed intended Vercel team slug: `obserra`.

The currently observed production deployment still reflects the older production SHA until a controlled deployment of a validated candidate occurs. The branch contains the Clerk middleware fix, but production Clerk behavior must be reverified on the actual deployed candidate before production readiness is claimed.

Public Academy access:

`https://www.obserrallc.com/academy`

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

The historical Gate 23 18-of-18 synthetic UAT record is not candidate-bound to the current source and cannot be reused as final acceptance.

## Controlled filing baseline

Current controlled private artifacts remain:

- LMS Guide DOCX v0.15;
- LMS Guide PDF v0.15, 43 pages;
- Submission Readiness Register v1.5, 6 pages;
- Controlled Pre-Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA-256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA-256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA-256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

`DS-SUBMISSION-LMS-GUIDE-CONTROL.md` still contains older public metadata and must not be represented as synchronized to the current private filing baseline until a controlled revision actually lands.

## Current blockers before regulated production

- final exact five-workflow Gate 32 validation on one exact handoff-synchronized SHA;
- controlled production deployment of the validated candidate;
- deployed Clerk authentication verification;
- deployed Academy entitlement and payment verification;
- authentic Vercel, Clerk, Stripe, media, document-storage, observability, backup/restore, and failover evidence sufficient for the Gate 31 HA manifest;
- final candidate-bound Gate 23 18-of-18 synthetic UAT on the regulated nonproduction branch;
- controlled Class D production database promotion evidence;
- actual Class DS authorization;
- current DI instructor authorization where required;
- final security, rollback, and owner-controlled production activation approval.

## Next governed actions

1. Complete the exact five-workflow validation set on the final handoff-synchronized Gate 32 head.
2. Record that exact SHA and all five workflow run numbers in this handoff and the Gate 32 detailed handoff if green.
3. Keep PR #56 open and unmerged until the controlled release decision is made.
4. Do not promote the Class D schema or activate regulated production.
5. When a validated candidate is intentionally deployed, verify Clerk, Academy entitlement, public catalog, Stripe POST checkout, signed-webhook fulfillment, caching protections, and rollback against the deployed exact SHA.
6. Obtain authentic provider HA and recovery evidence and construct the Gate 31 manifest for the final candidate.
7. Execute fresh exact-candidate-bound Gate 23 18-of-18 synthetic UAT before any regulated production activation decision.

## Access pointers

Detailed Gate 32 handoff:

`docs/florida-class-d-lms/GATE-32-WEBSITE-ACADEMY-COMMERCE-SECURITY-HANDOFF.md`

Pull request:

`https://github.com/jblan2026-hub/obserra-website/pull/56`

Live Academy:

`https://www.obserrallc.com/academy`
