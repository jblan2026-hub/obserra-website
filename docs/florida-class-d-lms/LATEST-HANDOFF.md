# OBSERRA Production Restart Authority and Detailed Handoff

Effective date: 2026-08-19 ET

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Canonical public site: `https://www.obserrallc.com`

Production branch: `main`

Authoritative roadmap: `plan/architecture-obserra-production-readiness-1.md`

This document is the restart authority for the public website, Obserra EPI Academy, Obserra EPI Applications, Obserra EPI EIOS marketing surfaces, Florida Class D LMS, owner and instructor access, authentication, authorization, payments, database, live media, security, CMMC evidence, SEO, headers, routing, deployment, performance, high availability, advanced design, graphics, interactive visualization, 3D, and production release control. It exists so the work does not need to be re explained after a context reset.

## 1. Mandatory restart rules {#restart-rules}

1. Read this file first before changing production, identity, payments, regulated training, deployment, security, branding, SEO, or release governance.
2. Read `plan/architecture-obserra-production-readiness-1.md` second. That plan contains the authoritative 12 phase roadmap and task identifiers. If implementation state changes, update both the plan and this handoff.
3. The live public website is the source of truth for whether a change is actually deployed. A green pull request, green GitHub status, READY Vercel preview, successful build, or successful commit does not count as production completion unless the canonical live domain serves the intended exact Git SHA and expected behavior.
4. Never report a production fix as complete from PR status alone. Verify `https://www.obserrallc.com/api/health`, the relevant live route, live response headers, and exact deployment identity.
5. Do not use mocks, fake provider success, simulated production claims, placeholder integrations, fabricated users, fake payments, fake Daily rooms, fake database state, or fake production test results.
6. Use the strongest applicable installed skills for every subsystem. Cross reference advanced security, networking and headers, routing, SEO, identity, authorization, payments, Stripe, Supabase, databases, Next.js, React, frontend, accessibility, performance, load testing, high availability, CI/CD, Vercel, design systems, branding, graphics, interactive visualization, 3D, and testing skills instead of repeatedly using a narrow subset.
7. Use test first behavior changes where practical. A security or release regression must have a disproving test or live verification before remediation, then green verification after remediation.
8. Do not hand edit generated CMMC, FDACS, legal identity, or release evidence to make checks pass. Regenerate governed evidence only through its deterministic workflow.
9. Do not weaken identity, RLS, origin checks, payment controls, authorization, or regulated state to make a test pass.
10. Do not remove fail closed behavior for regulated credit, attendance, completion, certificates, LIAS, owner authorization, payment fulfillment, or provider outages.
11. Production work must be secure by design and secure by default, with least privilege, defense in depth, strong authentication, server side authorization, private privileged database functions, no secret leakage, no stale protected data caching, and auditable release state.

## 2. Permanent naming and brand rules {#brand-rules}

The legal company name is exactly:

`OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC`

When the company is referenced in branding, legal identity, public sentences, metadata, headers, structured data, trust content, contact content, reports, documentation intended to identify the company, or customer facing copy, use the full legal company name unless the context is an approved product brand.

Approved product naming is:

| Product | Required public product name |
|---|---|
| Academy | `Obserra EPI Academy` |
| EIOS | `Obserra EPI EIOS` |
| Applications | `Obserra EPI Applications` |
| Products | `Obserra EPI Products` |

`EPI` means `Executive Protection & Intelligence`.

Do not brand products as `Obserra Academy`, `Obserra EIOS`, `Obserra Applications`, or `Obserra Products` without the `EPI` identifier.

`retired-legacy-product-brand` is retired and must not remain anywhere in active application code, routes, headers, metadata, sitemap, robots logic, structured data, build output, UI, navigation, test names, active tests, active documentation, or generated evidence. Historical Git history may retain it, but the current tree and compiled production output must not.

Approved visual direction is premium executive dark navy, black, and gold using repository approved OBSERRA assets. Do not invent alternate logos or unauthorized logo variants. Use approved assets including `public/brand/obserra-mark.svg` and the approved logo image assets already in the repository.

## 3. Exact repository and production state {#exact-state}

### 3.1 Repository head

Current `main` head at this handoff write:

`1bea55174d69df720fd75ccaee3443da5a52a823`

Commit message:

`fix(deploy): retire obsolete auxiliary Vercel project`

The GitHub branch API currently reports `main` as not protected. Required status checks are off. The current direct main commit is unsigned and GitHub reports verification as false. This is a release governance drift and must be remediated before final production certification.

### 3.2 Exact live production deployment

The canonical live domain is currently served by:

Vercel project ID: `prj_FfAnssVJU8pcJydGNJHmCliP6Yme`

Vercel project name: `obserra-website-lcn2`

Live deployment ID: `dpl_6hY2sKd36MEiFHZS2fA9nt9gZEaE`

Live Git SHA reported by `/api/health`:

`41bb83ed6cda6fed7bb4947839b7eb5b03f3b88a`

Canonical domains:

`www.obserrallc.com`

`obserrallc.com`

Live health currently reports:

`routing.expectedProjectId = prj_FfAnssVJU8pcJydGNJHmCliP6Yme`

`routing.observedProjectId = prj_FfAnssVJU8pcJydGNJHmCliP6Yme`

`routing.deploymentId = dpl_6hY2sKd36MEiFHZS2fA9nt9gZEaE`

`routing.gitCommitSha = 41bb83ed6cda6fed7bb4947839b7eb5b03f3b88a`

`routing.authority = verified`

`routing.verified = true`

### 3.3 Critical source to production drift

Repository `main` is ahead of the live production deployment.

Current main:

`1bea55174d69df720fd75ccaee3443da5a52a823`

Current live production:

`41bb83ed6cda6fed7bb4947839b7eb5b03f3b88a`

Therefore the repository and production are not at exact SHA parity. Do not report the most recent source changes as live until `/api/health` reports the intended SHA.

The Vercel deployment created for main SHA `1bea55174d69df720fd75ccaee3443da5a52a823` is `dpl_5dCZCjaLfvVVBoYKQenkkUmNZU1W` and is currently CANCELED. The live domain remains on the previous READY deployment from SHA `41bb83ed...`.

### 3.4 Duplicate Vercel project drift

Obsolete auxiliary Vercel project:

Project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`

Project name: `obserra-website-live`

The obsolete project still receives GitHub triggered deployments and posts a failing Vercel commit status. Example on main SHA `1bea5517...`:

`Vercel – obserra-website-live = failure`

The obsolete deployment `dpl_CmqDR9zipTNdB5orNSMMYSf6imk2` is CANCELED.

The production cutover workflow source on main has been changed so the obsolete auxiliary project is removed only after a successful canonical smoke test. That cleanup has not executed because the latest main deployment did not become the live canonical deployment. The duplicate project therefore still exists and remains an open production control plane defect.

### 3.5 Open pull requests

PR 134 is merged.

PR 134 title: `fix(fdacs): enable direct AAL2 owner LMS testing`

PR 134 merge SHA: `34fc04e5b234d180a089f1e549105ff517419c3a`

PR 135 remains open and draft.

PR 135 title: `fix(prod): complete legacy route and production surface cleanup`

PR 135 branch: `fix/production-surface-cleanup-20260819`

PR 135 head: `74bddcc70ff3fc1d065a86cc78d48d2d36ef7a08`

PR 135 contains the intended complete retirement of the old retired-legacy-product-brand route surfaces and additional branding cleanup. It is not merged and its base predates later emergency main commits. It must be reconciled with current main before use.

PR 136 remains open and draft.

PR 136 title: `fix(security): enforce owner-only LMS proxy boundary`

PR 136 branch: `hotfix/lms-owner-boundary-20260819`

PR 136 head: `140c0f26da063d8ddd929de1a1e7c760af1027cf`

PR 136 adds additional owner AAL2 proxy boundary and public route identity behavior. It is not merged and its base predates later main changes. It must be reconciled with current main before use.

## 4. Confirmed live production behavior {#live-behavior}

### 4.1 Public site

The canonical homepage is live at HTTPS and currently returns the correct legal company name in the title, description, organization schema, site name, header, footer, and customer facing company copy.

Current homepage product navigation uses `Obserra EPI Applications`, `Obserra EPI Academy`, and `Obserra EPI EIOS`.

The public instructor sign in entry point has been removed from the Florida training public surface.

### 4.2 HTTPS and security headers

The canonical live site currently returns:

`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

`X-Content-Type-Options: nosniff`

`X-Frame-Options: DENY`

`Cross-Origin-Opener-Policy: same-origin`

`Cross-Origin-Resource-Policy: same-origin`

`Referrer-Policy: strict-origin-when-cross-origin`

`X-Permitted-Cross-Domain-Policies: none`

The CSP includes `default-src 'self'`, `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`, explicit Stripe, Clerk, Daily, Credly, Vercel analytics, and Supabase endpoints. The current CSP still includes `unsafe-inline` for script and style execution and requires additional hardening analysis rather than being declared final.

The wildcard CORS defect was corrected and is confirmed live. Current live responses return:

`Access-Control-Allow-Origin: https://www.obserrallc.com`

Do not reintroduce `Access-Control-Allow-Origin: *` on application HTML, health endpoints, protected pages, APIs, or regulated routes unless a narrowly documented public resource genuinely requires it.

### 4.3 Public identity status header defect

The live public root and `/api/health` currently expose:

`X-Obserra-Identity-Status: configuration-required`

This is misleading because Supabase identity is configured and the protected sign in route reports `X-Obserra-Identity-Status: ready`. Public pages should not inherit a Clerk readiness failure or configuration-required state when they do not require Clerk. This remains an open identity routing defect.

### 4.4 Protected Academy route behavior

An unauthenticated request to an internal Academy learning route such as:

`/academy/learn/zero-trust-strategy`

is redirected to the secure sign in surface.

The resulting sign in response is:

`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`

`X-Robots-Tag: noindex, nofollow, noarchive`

`X-Obserra-Identity-Provider: supabase`

`X-Obserra-Identity-Status: ready`

This confirms that an unauthenticated user cannot directly retrieve the Academy course interior from the tested live path.

Hard requirement remains stronger than authentication alone: access to paid Academy course interiors must require a valid current entitlement for the exact signed in user and exact course. Authentication without entitlement must not grant course access.

### 4.5 Instructor and owner LMS behavior

An unauthenticated request to:

`/florida-security-training/owner-validation/lms`

is redirected to the secure Supabase sign in surface and returns protected no-store and noindex behavior.

Current main source classifies `/florida-security-training/owner-validation` and `/api/florida-class-d/owner-validation` as `internal_owner_read_only` with Supabase authentication required.

The current proxy then performs server side current authority evaluation. The authorization decision requires owner role, verified email, AAL2, internal identity authorization, and protected authority readiness. Owner mutations remain locked unless explicitly authorized by the route and regulated mutation boundary.

This is meaningful defense in depth, but the final acceptance condition is still not closed until a real authenticated negative test proves that a valid non-owner Supabase user, an AAL1 owner session, a stale session, a wrong session ID, and any unauthorized account cannot enter the owner or instructor LMS. The intended permanent boundary must bind the exact owner authority and active session. Until that authenticated negative test is recorded, status is `PARTIAL, FAIL CLOSED FOR UNAUTHENTICATED, FINAL OWNER EXCLUSIVITY NOT YET PROVEN`.

### 4.6 Robots and protected indexing

`robots.txt` is live and blocks internal surfaces including `/admin`, `/api/`, `/academy/admin/`, `/academy/learn/`, `/academy/certificate/`, `/academy/success`, Florida Class D access, admin, completion, enrollment, exam, identity, live, makeup, observer, portal, sign in, and sign up routes.

Protected route responses additionally use noindex headers. Keep both controls. Robots blocking alone is not an authorization mechanism.

## 5. Hard requirements and drift register {#hard-requirements-drift}

Status definitions:

`PASS LIVE` means confirmed on the canonical live domain.

`PASS SOURCE` means implemented in current source but not yet confirmed live at the exact source SHA.

`PARTIAL` means some controls exist but final acceptance evidence is incomplete.

`DRIFT` means current implementation or production state violates the hard requirement.

`BLOCKED` means external provider, human, or control plane evidence is required.

| ID | Hard requirement | Current evidence | Status | Severity and required action |
|---|---|---|---|---|
| HR-001 | A change counts only when the canonical production domain serves the exact intended Git SHA. | Main is `1bea5517...`; live health reports `41bb83ed...`. | DRIFT | CRITICAL. Restore exact source to production parity before any production completion claim. |
| HR-002 | Use full legal company name for company branding and sentences. | Live homepage title, metadata, schema, header and footer use full legal name. | PASS LIVE | Continue source and generated asset sweeps. |
| HR-003 | Product names must use Obserra EPI Academy, Obserra EPI EIOS, Obserra EPI Applications, and Obserra EPI Products. | Live public navigation is corrected. Some internal package and historical source naming remains. | PARTIAL | HIGH. Remove bare active product naming from code, package metadata, active docs, tests, metadata, headers, and generated output. |
| HR-004 | retired-legacy-product-brand must be removed everywhere from the current tree and production output. | Current main still contains `app/retired-legacy-product-brand/route.ts`, `app/apps/retired-legacy-product-brand/route.ts`, and `test/retired-retired-legacy-product-brand-seo-contract.test.mjs`. PR 135 deletes the legacy route pattern but is unmerged. | DRIFT | CRITICAL. Reconcile PR 135 with current main, remove all active retired-legacy-product-brand references, rebuild, deploy, crawl, and verify zero current-tree and live-output matches. |
| HR-005 | Public marketing pages may be public. Internal Academy pages require authentication and exact paid entitlement. | Unauthenticated Academy learn route redirects to Supabase sign in and is no-store/noindex. Entitlement behavior has not been freshly end-to-end verified in this handoff cycle. | PARTIAL | CRITICAL. Prove authenticated user without entitlement is denied and paid user with exact entitlement is granted. |
| HR-006 | Instructor, admin, and owner LMS surfaces must be accessible only to the exact authorized owner identity. No paid-student exception. | Current proxy uses Supabase `internal_owner_read_only` with owner role, verified email, AAL2, internal authorization, and protected authority readiness. Unauthenticated requests are denied by redirect. | PARTIAL | CRITICAL. Run negative authenticated non-owner, AAL1, stale session, wrong session ID, and revoked owner tests. Reconcile PR 136 if it strengthens current boundary. |
| HR-007 | Owner LMS authorization must bind to current durable authority and active session, not client metadata. | Private owner authorization migration is applied in Supabase identity project; public privileged helper is absent; current proxy queries current authority. | PARTIAL | CRITICAL. Reverify exact active session binding live and preserve private Security Definer location. |
| HR-008 | Protected pages and protected data must not use stale shared caching. | Tested owner and Academy sign in responses use private no-cache/no-store. | PASS LIVE | Continue route-by-route protected cache audit. |
| HR-009 | Public site must use HTTPS and strong transport security. | HTTPS live, HSTS 2 years with includeSubDomains and preload, CSP upgrade-insecure-requests. | PASS LIVE | Verify explicit HTTP to HTTPS redirect and certificate chain as part of final network audit. |
| HR-010 | No public SSH service is part of the Vercel website application surface. Any separate infrastructure SSH must be key-based, least privilege, allowlisted, monitored, and not internet open by default. | No SSH service exists in the current Vercel application topology. Separate infrastructure port exposure has not been independently scanned in this cycle. | PARTIAL | HIGH. Include external port and DNS exposure validation in final network security audit. |
| HR-011 | CORS must not be wildcard on production application surfaces. | Live canonical responses now return only `https://www.obserrallc.com`. | PASS LIVE | Add regression tests and route exceptions only if explicitly justified. |
| HR-012 | CSP, frame protections, MIME controls, referrer policy, COOP/CORP, permissions policy, and HSTS must remain secure by default. | Most controls are live. CSP still contains `unsafe-inline`. | PARTIAL | HIGH. Harden CSP where technically compatible and test Clerk, Stripe, Daily, analytics, and Next.js behavior. |
| HR-013 | Camera, microphone, display capture, and fullscreen permissions must only be enabled for legitimate instructor media routes. | Global policy denies by default. Route-specific media behavior still requires final authenticated instructor validation. | PARTIAL | HIGH. Verify actual owner LMS after auth receives only required media permissions and no public route does. |
| HR-014 | Payment amounts and product identity must be server controlled. | Stripe checkout route is server-side and production design uses governed prices and durable state. | PARTIAL | CRITICAL. Fresh code audit and live provider test required. |
| HR-015 | Stripe webhook fulfillment requires valid signature, idempotency, replay protection, out-of-order safety, livemode enforcement, and durable entitlement transition. | Durable commerce and webhook hardening exist from earlier gates. Fresh exact current-main verification is not complete. | PARTIAL | CRITICAL. Re-run live/test provider verification and negative replay tests. |
| HR-016 | No customer receives internal Academy content merely by knowing a URL. Access requires identity and entitlement. | URL-only unauthenticated access is blocked. | PARTIAL | CRITICAL. Verify authenticated but unpaid access denial. |
| HR-017 | Regulated Florida Class D credit, attendance, completion, certificate, and LIAS paths remain fail closed until external authorization. | Owner test and mutation boundary retain noncredit and authorization controls. | PASS SOURCE / PARTIAL LIVE | CRITICAL. Preserve all regulated holds during every remediation. |
| HR-018 | Supabase privileged LMS authorization functions stay in private unexposed schemas and RLS protects exposed data. | `owner_lms_private.obserra_owner_lms_authorized()` migration is applied; public helper was removed. | PASS LIVE | Re-run advisors and policy verification after any schema change. |
| HR-019 | No service role, Stripe secret, Daily API key, signing secret, password, JWT, or private credential may enter browser bundles, logs, docs, issues, or chat. | Current design separates privileged secrets. Publishable Supabase key is intentionally public. | PARTIAL | CRITICAL. Run secret scan and bundle inspection on exact release SHA. |
| HR-020 | Production capacity target is 200 concurrent authenticated students with minimum 220 seat/session headroom where providers enforce quotas. | Load script and policy exist. Daily room limit is 75 with 74 learner seats after instructor reserve; minimum 3 rooms are required. Actual provider quota and full live capacity have not been validated. | BLOCKED | CRITICAL. Verify Daily account quota at or above 220 and run real 200-user load profile before capacity claim. |
| HR-021 | 200-user load test must exercise real student workflow, not a health endpoint. | `load/florida-class-d-200-students.k6.js` requires 200 real identities and covers join/state/heartbeat/leave. Full run has not been completed. | BLOCKED | CRITICAL. Run against authorized target with real credentials, measure p50/p95/p99, throughput and error rate. |
| HR-022 | Non-media unexpected errors at 200 users must remain below 1 percent. | Threshold encoded but no fresh measured production-equivalent run. | BLOCKED | HIGH. Do not claim performance capacity until measured. |
| HR-023 | Live media must use real Daily rooms and tokens, no simulated production participants. | Real Daily provider code exists. Owner preview real room/token implementation exists. | PARTIAL | HIGH. Run real instructor and learner UAT plus provider quota validation. |
| HR-024 | Database, Storage, and Realtime paths must be real Supabase with RLS and live validation. | Supabase identity project and owner migrations are live. Full Storage/Realtime concurrent validation remains open. | PARTIAL | HIGH. Run hot query, Storage, Realtime, advisor and concurrency tests. |
| HR-025 | Every production mutation validates auth, authorization, origin, content type, input, state transition, and provider response. | Central mutation boundary exists for FDACS; checkout has same-origin design. | PARTIAL | CRITICAL. Complete route inventory and negative tests. |
| HR-026 | Secure by design, secure by default, CMMC/NIST aligned engineering is mandatory. | CMMC evidence framework and security controls exist. | PARTIAL | CRITICAL. Current branch protection and exact release governance drift violate the intended standard. |
| HR-027 | Main must be protected with governed merge/release controls and required checks. | GitHub API reports `protected: false` and required checks off. | DRIFT | CRITICAL. Restore branch protection, PR-only change flow, required CI/security checks, and admin bypass governance. |
| HR-028 | Release commits and deployment provenance must be trustworthy. | Current main direct commit is unsigned/unverified. | DRIFT | HIGH. Re-establish verified/signed merge path and avoid ungoverned direct main writes. |
| HR-029 | Duplicate deployment projects must not create conflicting routing or false status signals. | `obserra-website-live` still exists and posts failure/canceled status. | DRIFT | CRITICAL. Complete verified retirement after canonical cutover succeeds. |
| HR-030 | Public identity header must accurately reflect the route's provider requirement. Public routes must not inherit irrelevant Clerk readiness failure. | Root and health report `configuration-required`; protected Supabase sign-in reports `ready`. | DRIFT | HIGH. Fix provider readiness routing and verify live headers. |
| HR-031 | SEO must have correct canonicals, sitemap, robots, noindex on protected routes, no retired brand routes, and no stale legacy naming. | Robots and protected noindex are good. retired-legacy-product-brand active route/test source still exists. Full public canonical audit remains incomplete. | DRIFT / PARTIAL | HIGH. Finish PR 135 intent, crawl live site, validate all public canonicals and noindex surfaces. |
| HR-032 | Public metadata and structured data must use legal name and current product names. | Homepage title, description, Organization and WebSite schema use legal name; current product nav uses EPI. | PASS LIVE / PARTIAL TREE | HIGH. Sweep hidden 404s, package metadata, OpenGraph, JSON-LD, manifest, route metadata, active docs and generated output. |
| HR-033 | Website and LMS design must be advanced, consistent, premium, responsive, accessible, and production quality, not merely functional. | Current public homepage has improved executive design. Full site, Academy, LMS, payment, and owner workspace design unification is incomplete. | PARTIAL | HIGH. Execute phases 8, 9, and 10 of the roadmap after core security/release stability. |
| HR-034 | Interactive visualization and 3D must be progressive enhancement and cannot block LMS, auth, payments, or media. | Roadmap is defined. Production 3D implementation has not landed. | OPEN | MEDIUM/HIGH. Implement only after dependency/security/performance gate. |
| HR-035 | New 3D packages require dependency, vulnerability, license, provenance, lockfile, and bundle review before merge. | Current package.json has no Three/R3F packages. | PASS CURRENT / OPEN FUTURE | HIGH. Do not add until Phase 10 gate. |
| HR-036 | Dependency changes require vulnerability, license, lockfile, provenance, secret, build and runtime necessity review. | package.json and package-lock root dependencies agree. Full current transitive vulnerability/license scan remains open. | PARTIAL | HIGH. Complete dependency gate before final release. |
| HR-037 | Green CI is not equivalent to live production. | This handoff explicitly records main/live SHA mismatch despite Vercel success statuses. | PASS RULE / DRIFT STATE | CRITICAL. Always verify live SHA after deployment. |
| HR-038 | Evidence generation must be deterministic and current with code. | Governed workflows exist. Recent direct production hotfixes create likely evidence drift until regeneration. | DRIFT | HIGH. Regenerate legal identity, CMMC, FDACS and disposition artifacts after source stabilizes. |
| HR-039 | Marketing claims may not overstate licensing, certification, approval, capacity, security, or learner credit. | Licensing-pending language exists. Public homepage includes claims such as procurement readiness that require claim review. | PARTIAL | HIGH. Execute marketing integrity audit before final release. |
| HR-040 | No live release may be declared complete until security, SEO, headers, routing, access, payments, data, performance, design, and production verification are all evidenced on the same release SHA. | Not satisfied today. | BLOCKED | CRITICAL. This is the final definition of done. |

## 6. Authoritative roadmap and exact deliverables {#roadmap-deliverables}

The roadmap is `plan/architecture-obserra-production-readiness-1.md`. The plan remains authoritative even where PR references inside it have become stale. Update the plan metadata and task state as implementation advances.

### Phase 1. Re-establish a clean release baseline

Goal: reproducible current head, actionable checks, governed evidence, and exact source to production truth.

Tasks:

`TASK-001` Treat the current production execution plan and exact active head as the authoritative source before each validation cycle.

`TASK-002` Resolve all GitHub Actions runs that are action_required, failed, canceled, skipped-required, or stale. Do not bypass Website CI, Academy 70x Production Gate, Florida Class D LMS Gates, CMMC Evidence Governance, or CodeQL Advanced.

`TASK-003` Re-run deterministic legal identity, CMMC, FDACS, disposition, and handoff evidence generation only through governed workflows.

`TASK-004` Run focused owner LMS tests, full Academy validation, TypeScript, lint, Node tests, build, CMMC gates, Florida gates, and CodeQL on the same exact SHA.

`TASK-005` Preserve human release control until final authenticated owner live interaction is complete.

Deliverable: one exact release candidate SHA with all required evidence generated from that SHA and no source/live drift.

Current state: IN PROGRESS. PR 134 has already merged, so the old PR 134 draft wording in the plan is stale. Current main/live SHA mismatch is a Phase 1 blocker.

### Phase 2. Identity, sign-in, session integrity, and authorization

Goal: production-correct identity boundaries for public, paid learner, owner, instructor, and application routes.

Tasks:

`TASK-006` Validate `lib/auth/runtime-config.ts`, provider routing, owner identity pages, and owner validation routes. Remove ambiguous Clerk/Supabase authority overlap.

`TASK-007` Verify live private `owner_lms_private.obserra_owner_lms_authorized()` authorization, public helper absence, unauthorized false result, and policy usage.

`TASK-008` Maintain negative tests for unauthenticated, wrong user, non-owner, AAL1, stale session, wrong session ID, and identity outage.

`TASK-009` Load test protected identity and session behavior at 200 concurrent users without weakening owner AAL2 or learner authorization.

`TASK-010` Verify sign in, MFA, sign out, session expiry, refresh, and provider failure in a real browser.

Deliverable: route ownership matrix plus live tests proving public access only where intended, exact paid learner entitlement for Academy interiors, and owner-only AAL2 authority for instructor/admin surfaces.

Current state: PARTIAL. Supabase owner controls are strong, but public identity-status drift and final authenticated owner-exclusivity proof remain open.

### Phase 3. Database, RLS, Storage, Realtime, and data integrity

Goal: correct, indexed, least privilege live data paths at target concurrency.

Tasks:

`TASK-011` Audit owner LMS migrations for constraints, foreign keys, indexes, RLS, private privileged functions, and Storage coverage.

`TASK-012` Measure hot queries for sessions, participants, assets, notes, messages, entitlements, and payments. Add indexes only from evidence.

`TASK-013` Verify Storage upload, replace, signed read, delete, MIME, size, folder isolation, and unauthorized object denial.

`TASK-014` Verify Realtime subscription scale, reconnect, and duplicate event behavior.

`TASK-015` Run Supabase security and performance advisors after schema changes and resolve release blocking findings.

Deliverable: live database and storage evidence set with query plans, RLS proof, advisor results, and concurrent Realtime behavior.

Current state: PARTIAL.

### Phase 4. Live video, advanced audio, playback, and presentation

Goal: real, accessible, observable classroom media and instructional playback.

Tasks:

`TASK-016` Validate owner Daily API route and provider library against real room creation, private room policy, role tokens, expiry, cleanup, and failures.

`TASK-017` Verify instructor camera, microphone, captions, display capture, fullscreen, hand raise, chat, reactions, participant state, and three learner joins against real Daily rooms.

`TASK-018` Remove or fail closed any UI that simulates a production learner without real authenticated Daily participation.

`TASK-019` Validate PDF, PPTX, image, MP4, and WebM courseware using live signed objects with loading, failure, resume, keyboard, captions/transcript support.

`TASK-020` Require explicit user activation for audible audio and expose accessible mute/volume state.

`TASK-021` Add media telemetry for joins, permissions, reconnects, devices, token expiry, playback and cleanup without secret logging.

`TASK-022` Verify Daily account concurrency and room quota for minimum 220 seats before 200 student production class enablement.

Deliverable: real Daily and courseware UAT evidence with accessibility and provider quota proof.

Current state: PARTIAL and provider quota BLOCKED.

### Phase 5. Capacity, high availability, load balancing, and performance

Goal: measured stable operation for 200 concurrent authenticated students with headroom.

Tasks:

`TASK-023` Expand and run the 200 student k6 journey across auth-ready access, discovery, courseware, state reads, protected mutations and realistic think time.

`TASK-024` Make the capacity gate evaluate p50, p95, p99, unexpected error rate, throughput, and provider failures.

`TASK-025` Verify Vercel functions remain stateless and horizontally scalable. Durable truth must not live in process memory.

`TASK-026` Verify Supabase connection/query behavior under load and correct N+1, oversized payloads, scans, excessive broadcasts and unbounded queries.

`TASK-027` Verify bounded retries only for safe transient failures and protect non-idempotent operations from duplication.

`TASK-028` Validate canonical domain cutover and rollback under partial alias attach, smoke failure, and Vercel API failure.

`TASK-029` Run a sustained soak test for connection leaks, Realtime leaks, token refresh, room cleanup, memory and function errors.

Deliverable: capacity report with 200 real identities, 220 provider headroom evidence, percentiles, throughput, error rate, DB metrics, provider metrics, and soak results.

Current state: OPEN/PARTIAL.

### Phase 6. Payments and commerce integrity

Goal: production-correct Stripe integration while preserving licensing holds.

Tasks:

`TASK-030` Audit checkout for same-origin admission, server governed pricing, durable reservation, idempotency, server controlled amount, metadata, URLs and provider errors.

`TASK-031` Audit webhook signature, replay, duplicate delivery, out-of-order delivery, entitlement transitions, refund/cancel behavior and livemode enforcement.

`TASK-032` Exercise a real provider test purchase end to end without bypassing licensing-pending controls.

`TASK-033` Add payment and entitlement concurrency tests proving duplicate submits cannot create duplicate state.

Deliverable: signed Stripe test evidence from checkout through durable entitlement or governed licensing hold, including negative tampering/replay results.

Current state: PARTIAL.

### Phase 7. Advanced security, authorized testing, and abuse resistance

Goal: close exploitable weaknesses before release.

Tasks:

`TASK-034` Run SAST and CodeQL on exact release SHA and resolve high-confidence authorization, injection, secret, SSRF, path, crypto, and unsafe deserialization findings.

`TASK-035` Complete dependency vulnerability and license review for production dependencies and future visualization packages.

`TASK-036` Perform authorized dynamic testing for auth bypass, AAL downgrade, IDOR, CSRF, origin bypass, upload abuse, signed URL leakage, RLS bypass, cache leakage, headers and payment manipulation.

`TASK-037` Validate security headers and route-specific permissions for media, Daily framing, CSP, HSTS, frame ancestry, referrer policy and MIME sniffing.

`TASK-038` Validate rate and abuse controls for sign in, owner APIs, checkout, upload, signed URL generation, messaging and expensive provider operations.

`TASK-039` Verify logs and telemetry redact passwords, tokens, JWTs, Daily tokens, Stripe secrets, signed URLs, payment data and regulated PII.

Deliverable: exact-SHA security evidence pack with SAST, CodeQL, dependency, secret, DAST, authorization, header, abuse and log-redaction results.

Current state: PARTIAL. Branch protection and release provenance drift are additional critical items.

### Phase 8. Frontend, accessibility, responsive behavior, and interaction quality

Goal: complete, fast, accessible and unambiguous student and owner experience.

Tasks:

`TASK-040` Audit owner console, learner workspace, Academy, classroom, sign-in and MFA for semantic structure, focus, keyboard, visible errors, loading and accessible status.

`TASK-041` Keep disabled regulated controls understandable and keyboard discoverable where explanation is required using `aria-disabled`.

`TASK-042` Test phone, tablet, laptop, desktop and ultrawide layouts for overflow, clipping, dialog access, media controls and 3D canvas usability.

`TASK-043` Lazy load/split only where profiling proves meaningful benefit and preserve server rendering where client state is unnecessary.

`TASK-044` Validate navigation, back-forward cache, pagehide cleanup, fullscreen exit, permission denial and route transitions without media or state leaks.

Deliverable: WCAG 2.2 AA oriented accessibility/responsive report plus corrected UI across critical journeys.

Current state: PARTIAL.

### Phase 9. Advanced visual design, branding, graphics, and marketing integrity

Goal: premium, recognizable OBSERRA executive product system with accurate claims.

Tasks:

`TASK-045` Apply one consistent dark navy, black and gold design system across website, Academy, owner LMS, live classroom, payments, reports and visualization.

`TASK-046` Improve visual hierarchy, spacing, typography, depth, state feedback, motion and executive polish while removing generic AI-like card, gradient, icon and animation patterns that add no information.

`TASK-047` Produce optimized branded graphics using approved assets, SVG for UI/marks, AVIF/WebP for raster, and compressed GLB for 3D.

`TASK-048` Use motion only for hierarchy, state, navigation or focus, respect reduced motion and prevent CLS.

`TASK-049` Audit public marketing and certification language against actual implementation and external authorization state.

Deliverable: production design system implementation across every customer-facing and owner-facing surface plus marketing claim traceability.

Current state: PARTIAL.

### Phase 10. Interactive visualization, 3D modeling, and presentation

Goal: advanced accessible visualization without placing LMS critical paths behind WebGL.

Tasks:

`TASK-050` Create semantic-first progressive enhancement shell.

`TASK-051` Create WebGL canvas and robust fallback for no WebGL, reduced motion, low power, load failure and accessibility.

`TASK-052` Create keyboard-operable orbit, reset, pause, fullscreen, information and accessibility controls.

`TASK-053` Create deterministic model manifest with whitelist, byte size, checksum, scene, LOD and accessible description. Arbitrary runtime model URLs are forbidden.

`TASK-054` Create performance budget enforcement for assets, geometry, texture, DPR and frame time.

`TASK-055` Add optimized approved GLB assets under `public/brand/3d/` with unused data removed and integrity checked.

`TASK-056` Create stable accessible visualization CSS.

`TASK-057` Use React Three Fiber only after dependency, vulnerability, license, bundle and compatibility review. Pin required packages.

`TASK-058` Add visualization to public/executive presentation surfaces before live classroom critical paths.

`TASK-059` Use LMS 3D only when it materially improves learning, always with accessible equivalent explanation/static view.

`TASK-060` Test no WebGL, load failure, reduced motion, keyboard, fallback, navigation and asset budgets.

`TASK-061` Profile GPU/CPU frame time and ensure no long tasks interfere with Daily media, keyboard or navigation.

Deliverable: production-ready progressive 3D/interactive visualization system with deterministic assets, accessibility fallback and measured performance.

Current state: NOT IMPLEMENTED. No Three/R3F dependency is currently in package.json. Do not claim otherwise.

### Phase 11. CI, deployment, observability, and release automation

Goal: every release reproducible, evidence-backed, observable and reversible.

Tasks:

`TASK-062` Add visualization and asset budget tests to Website CI after visualization lands.

`TASK-063` Keep Academy and Florida gates independently diagnosable while preserving aggregate release decision.

`TASK-064` Ensure preview and production report exact Git SHA and canonical Vercel project identity.

`TASK-065` Add/verify structured telemetry for auth failures, provider latency, DB latency, RLS denial, signed URL errors, payment transitions, Daily operations, media failures and capacity results.

`TASK-066` Define alerts for elevated 5xx, auth anomalies, provider outages, DB saturation, webhook failure, Daily creation failure and failed cutover.

`TASK-067` Retain deterministic rollback, smoke and release evidence for every production cutover.

Deliverable: protected branch, exact-SHA CI, exact-SHA deployment, clean Vercel project topology, alerts, rollback and evidence archive.

Current state: PARTIAL with CRITICAL drift. Exact health reporting exists, but main is unprotected, live SHA differs from main, duplicate Vercel project exists, and latest canonical deployment was canceled.

### Phase 12. Final owner UAT and production promotion

Goal: human owner gate on exact deployable SHA without changing code after the test.

Tasks:

`TASK-068` Complete exact SHA owner Supabase sign in and AAL2, verify unauthorized sessions cannot enter owner LMS.

`TASK-069` Create real Daily owner session and verify instructor and learner media, screen share, captions, reconnect and cleanup.

`TASK-070` Upload/present real courseware, use signed views, delete assets, create notes/messages and verify Realtime.

`TASK-071` Confirm regulated credit, attendance, completion, certificate and LIAS remain fail closed.

`TASK-072` Confirm required CI, security, evidence, capacity, Vercel, DB, payment, media, accessibility and visualization gates are green on the same SHA.

`TASK-073` Perform governed merge/cutover, smoke production, and verify canonical domain identity on the exact tested SHA.

Deliverable: owner-signed production acceptance record plus canonical `/api/health` proof that production serves the exact accepted SHA.

Current state: OPEN. PR 134 is already merged, so the old plan wording that TASK-073 marks PR 134 ready is stale and must be updated. The final human exact-SHA acceptance concept remains mandatory.

## 7. Exact production deliverables {#production-deliverables}

| Deliverable | Required artifact/evidence | Definition of accepted |
|---|---|---|
| DEL-001 Production source parity | GitHub main SHA, Vercel deployment ID, `/api/health` response | All three identify the same exact SHA and canonical project. |
| DEL-002 Legacy retirement | Current-tree search, build output search, live crawl | Zero retired-legacy-product-brand active references/routes/output. |
| DEL-003 Brand identity | Source scan, rendered HTML, metadata/schema scan | Legal name correct; all Academy/EIOS/Applications/Products names use Obserra EPI. |
| DEL-004 Access control | Auth negative/positive tests | Public only where intended; paid entitlement for course interiors; owner-only AAL2 for instructor/admin. |
| DEL-005 Identity integrity | Supabase authority and session tests | Exact owner, verified email, AAL2, active session, current durable authority, fail closed on outage. |
| DEL-006 Database security | RLS/policy/function/advisor evidence | Private privileged functions, RLS on exposed data, no unauthorized read/write. |
| DEL-007 Stripe commerce | Checkout/webhook/entitlement test evidence | Server prices, signature, idempotency, replay/out-of-order safety, no duplicate entitlements, licensing hold preserved. |
| DEL-008 Live media | Real Daily UAT | Real rooms/tokens, instructor/learner joins, media controls, captions, reconnect, cleanup. |
| DEL-009 Capacity | 200-user load and provider quota evidence | 220 headroom, error <1 percent non-media, p50/p95/p99 and throughput published. |
| DEL-010 Network/header security | Live header audit and external exposure audit | HTTPS/HSTS, restricted CORS, CSP, no public SSH app surface, correct route permissions, no mixed content. |
| DEL-011 SEO | Live crawl, robots, sitemap, canonical, metadata and schema audit | No retired brand, correct canonicals, protected noindex, indexable public pages only. |
| DEL-012 Advanced frontend | Accessibility/responsive/browser evidence | WCAG-oriented keyboard/focus/error behavior, responsive quality, no critical UX defects. |
| DEL-013 Advanced design | Production visual audit | Consistent premium dark navy/black/gold system across public, Academy, LMS, payments and owner surfaces. |
| DEL-014 Interactive 3D | Model manifest, asset budgets, accessibility fallback, performance profile | Progressive enhancement, deterministic GLB assets, no critical path dependency, measured frame/network budgets. |
| DEL-015 Dependency assurance | SBOM/dependency/license/lock/secret evidence | No release-blocking vulnerabilities, unknown/restrictive licenses, lock drift or unnecessary runtime packages. |
| DEL-016 CI/CD governance | Branch protection, required checks, exact-SHA workflow evidence | Main protected, no direct uncontrolled production commits, required checks enforced, clean deployment topology. |
| DEL-017 CMMC/FDACS evidence | Deterministically regenerated machine/human artifacts and digests | Evidence matches exact release code and is not manually modified. |
| DEL-018 Final production UAT | Owner acceptance record plus live SHA proof | Owner AAL2 UAT complete and production serves the exact accepted SHA without post-UAT code drift. |

## 8. Immediate execution sequence after restart {#immediate-sequence}

Execute in this order unless new live evidence proves a more severe security issue.

1. Re-read this handoff and the authoritative roadmap.
2. Query `main` exact SHA and query `https://www.obserrallc.com/api/health`. If the SHAs differ, production parity is the first release blocker.
3. Inspect current Vercel canonical and auxiliary projects. Do not treat a Vercel status check as live proof. Verify canonical deployment identity directly.
4. Complete retirement of the obsolete `obserra-website-live` project only after canonical smoke succeeds. Verify canonical domains remain on `prj_FfAnssVJU8pcJydGNJHmCliP6Yme` after retirement.
5. Restore GitHub main branch protection and required checks. Stop ungoverned direct writes to main after emergency stabilization.
6. Reconcile PR 135 with current main and remove every retired-legacy-product-brand current-tree route, test, source, metadata, and active documentation reference. Search again after merge. Build and live crawl again after deployment.
7. Sweep bare product naming, including internal active package metadata such as the current package name `obserra-academy-restore`, shared 404s, sign-in, Academy success, course data, manifest, metadata, structured data, active tests, generated evidence, and active documentation. Apply EPI naming or full legal entity naming according to the permanent rule.
8. Fix public identity routing so public pages do not report `configuration-required` merely because Clerk is not ready. Public route status must accurately reflect that the route is public. Supabase protected routes must remain fail closed.
9. Reconcile PR 136 with current main only if it strengthens the current owner boundary without regressing the already-live `internal_owner_read_only` authority check.
10. Execute authenticated owner access negative tests for non-owner, AAL1, stale/revoked session, wrong session ID, wrong identity, missing protected authority, and provider outage. Record evidence.
11. Verify authenticated Academy user without entitlement cannot access a course, and exact paid entitlement grants only the purchased course.
12. Audit Stripe checkout and webhook paths. Run test provider purchase and replay/idempotency tests. Preserve licensing pending for gated offerings.
13. Complete Supabase RLS, Storage, Realtime, query plan, advisor, and concurrency validation.
14. Run full live network/header/HTTPS/redirect/certificate/mixed-content/exposure audit. Harden CSP without breaking required providers.
15. Run dependency vulnerability, license, provenance, secret, lockfile and runtime-necessity audit. Do not add 3D dependencies before this gate.
16. Run exact-SHA CodeQL, SAST, authorization, CSRF, IDOR, rate/abuse, logging-redaction and authorized DAST checks.
17. Run 200-student production-equivalent load validation with 220 provider headroom evidence and sustained soak test.
18. Execute advanced frontend, accessibility, responsive and performance remediation.
19. Execute advanced design and branding remediation across every page, not only the homepage.
20. Execute Phase 10 interactive visualization and 3D only after core security, identity, payments, database, release and performance gates are stable.
21. Regenerate all governed evidence after code stabilizes.
22. Produce one exact release candidate SHA. Require all gates on that exact SHA.
23. Complete owner AAL2, Daily and courseware UAT on that exact SHA.
24. Promote that exact SHA to production.
25. Verify `www.obserrallc.com`, `/api/health`, headers, protected routes, SEO, payments, Academy, Applications, EIOS, Florida training, and owner access on the live production domain.
26. Only then report production completion.

## 9. Production verification matrix {#production-verification}

Before saying any item is fixed, verify the canonical live domain.

| Area | Live verification required |
|---|---|
| Deployment | `/api/health` exact project, deployment and Git SHA. |
| Homepage | Rendered HTML, legal name, EPI product names, no retired naming. |
| Headers | HSTS, CSP, CORS, frame, MIME, referrer, permissions, COOP/CORP, cache. |
| HTTP/HTTPS | HTTP redirects to canonical HTTPS; certificate is valid; no mixed content. |
| Robots/sitemap | Protected routes excluded; retired routes absent; public routes canonical. |
| Academy | Public catalog behavior correct; internal learn route requires auth and entitlement. |
| Owner LMS | No public button; direct route requires owner authority; negative auth tests deny everyone else. |
| Payments | No client amount control; licensing hold; signed/idempotent webhook; duplicate prevention. |
| Database | RLS, private privileged functions, current authority, no cross-user leakage. |
| Media | Real Daily provider operation and exact room/token permissions. |
| Performance | Real measured concurrency and percentile evidence. |
| Design | Live rendered pages, not screenshots or mockups. |
| 3D | Live progressive enhancement, fallback and performance evidence. |
| Evidence | Generated artifacts match exact source SHA. |

## 10. Dependency baseline and review rule {#dependency-baseline}

Current top-level production dependencies in `package.json`:

`@clerk/nextjs ^7.6.4`

`@supabase/ssr 0.12.4`

`@supabase/supabase-js 2.112.3`

`@vercel/analytics ^2.0.1`

`framer-motion ^12.23.12`

`lucide-react ^0.543.0`

`next 16.3.1`

`react 19.2.8`

`react-dom 19.2.8`

`stripe ^22.4.0`

Current package metadata name is `obserra-academy-restore`. That internal active package identifier does not conform to the permanent EPI product naming rule and must be reviewed as part of the naming cleanup.

There are currently no Three.js or React Three Fiber dependencies. Do not add them until Phase 10 and the dependency gate approves security, license, provenance, lockfile, compatibility, bundle impact and runtime necessity.

## 11. CMMC and secure by default requirements {#cmmc-security}

CMMC and NIST alignment is an engineering and evidence requirement, not a marketing claim.

Maintain least privilege, separation of duties where practical, strong authentication, MFA/AAL2 for owner authority, auditable actions, deterministic evidence, configuration management, change control, vulnerability management, code security, access enforcement, secure communications, logging, incident readiness, controlled provider integrations, and protected data handling.

Current critical governance drift that must be resolved before claiming the release governance is mature:

1. Main branch protection is disabled.
2. Required status checks are off at the branch protection layer.
3. Current main contains unsigned/unverified direct commits.
4. Main and production are not on the same SHA.
5. Duplicate Vercel project status pollution remains.
6. Governed evidence is likely behind recent hotfix source state until regenerated.

Do not claim CMMC compliance, certification, assessment success, or authorization from these engineering controls. Keep evidence language precise.

## 12. No false reporting rules {#no-false-reporting}

The following statements are prohibited unless directly verified:

`Production is green` when only PR checks are green.

`It is live` when only a Vercel build or preview is READY.

`The owner LMS is owner-only` without authenticated negative authorization tests.

`200 users are supported` without a real 200-user load result and provider headroom evidence.

`Payments work` without a provider-backed checkout/webhook test.

`SEO is fixed` while retired routes, stale canonicals, or stale naming remain in current source or live output.

`retired-legacy-product-brand is removed` while any current active source, route, test, metadata, documentation, or production output still contains it.

`The website is secure` based only on a header scan or CodeQL. Security acceptance requires code, auth, data, payments, headers, routing, dependencies, abuse testing and live production verification.

`Design is complete` based on a homepage screenshot. Every major customer and owner surface must be checked live.

## 13. Skills execution requirement {#skills-execution}

Do not default to the same narrow subset of skills. Select and invoke the strongest relevant installed skills for each workstream and cross-reference them where multiple domains interact.

Required skill domains for this production program include, as applicable:

Security architecture and code security.

Authorization testing, IDOR, input validation, SAST, CodeQL, dependency scanning, license analysis, secret scanning, threat modeling, DAST, secure headers, request routing and networking.

Vercel CLI/platform, production checklist, reliability, rate limits, load scale, observability, deployment patterns and CI/CD.

Next.js, React, TypeScript, frontend, performance, accessibility, SEO, schema markup, site architecture, responsive testing and browser testing.

Supabase, Postgres, RLS, schema design, database optimization, reliability, observability and migrations.

Stripe integration, payment security, webhook verification, entitlement and billing integrity.

Live media, video, audio, playback and browser permissions.

High-end visual design, design systems, branding, graphics, motion, interactive visualization, Three.js/3D and performance budgets.

Project management, implementation plan maintenance, handoff/documentation maintenance, review, testing and verification before completion.

If a specialist skill contradicts an assumption, follow the specialist skill and update this handoff with the resulting evidence.

## 14. Historical evidence and references {#historical-references}

Git history retains the previous handoff content and earlier Gate 29 through Gate 39 evidence. Do not delete historical audit artifacts merely because this file is now current-state focused.

Important references:

`plan/architecture-obserra-production-readiness-1.md`

`docs/compliance/`

`docs/florida-class-d-lms/`

`supabase/identity/migrations/`

`.github/workflows/website-ci.yml`

`.github/workflows/production-vercel-public-cutover.yml`

`lib/auth/provider-routing.ts`

`proxy.ts`

`lib/florida-class-d-mutation-boundary.ts`

`lib/florida-class-d-live-policy.ts`

`load/florida-class-d-200-students.k6.js`

`app/api/academy/checkout/route.ts`

`public/brand/obserra-mark.svg`

## 15. Current continuation point {#continuation-point}

Do not restart from old Gate 38 language.

The current continuation starts from repository main `1bea55174d69df720fd75ccaee3443da5a52a823` with the live canonical domain still serving `41bb83ed6cda6fed7bb4947839b7eb5b03f3b88a` on deployment `dpl_6hY2sKd36MEiFHZS2fA9nt9gZEaE` in project `prj_FfAnssVJU8pcJydGNJHmCliP6Yme`.

The immediate blockers are:

1. Restore exact main/live production SHA parity.
2. Complete safe retirement of `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` without disturbing canonical domains.
3. Restore protected-main release governance and required checks.
4. Remove every active retired-legacy-product-brand route/reference from current main and live output.
5. Complete active bare-product-name cleanup and EPI naming enforcement.
6. Correct misleading public identity status while preserving Supabase fail-closed protected routing.
7. Prove owner-only AAL2 with authenticated negative tests.
8. Prove paid-entitlement access control for Academy interiors.
9. Complete payment, database, network, security, SEO, performance, design and evidence gates.
10. Execute the remaining authoritative roadmap phases through exact-SHA owner UAT and production promotion.

Nothing after this point should be reported as production complete until the canonical live domain itself proves it.