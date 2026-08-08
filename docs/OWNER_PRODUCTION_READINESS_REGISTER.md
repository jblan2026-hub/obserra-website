# Obserra Website, Store, and Academy Production Readiness Truth Register

- **Document ID:** WEBSITE-OWNER-PROD-TRUTH-001
- **Status:** Controlled current-state record
- **Owner:** Obserra LLC Owner, Web Platform, Commerce, Academy, Security, and Operations
- **Last updated:** 2026-08-07
- **Applies to:** `www.obserrallc.com`, public website, Store, Academy, customer and owner entry points, identity, commerce, Studio ingestion, Trust Center, and production observability

## Purpose

This record prevents a successful local build, CI run, Vercel preview, public catalog, or prior deployment from being represented as the current production state. It records the owner directive that the public website, Store, Academy, and owner-private Command Center entry point must be functional on the Obserra internet presence, use real governed backend services, and contain no placeholder or mock operational claims.

## Mandatory status vocabulary

| State | Meaning |
|---|---|
| **Implemented in source** | Code exists on a named branch or commit. |
| **CI verified** | The exact commit passed the named repository gates. |
| **Preview verified** | The exact Vercel preview passed direct route, identity, commerce, and error checks. |
| **Production verified** | The exact production deployment, domains, identity, commerce, data, integrations, and observability passed direct post-deployment tests. |
| **Blocked** | A required source, merge, deployment, identity, provider, database, commerce, security, regulatory, or operational gate is unmet. |

A Vercel `Ready` preview is not production verification. A deployment associated with a feature branch is not evidence that `www.obserrallc.com` serves that feature. Historical green deployments do not prove current production health.

## Current verified state

| Capability | Current state | Evidence boundary | Blocker or next gate |
|---|---|---|---|
| Complete Academy learner experience website feature | CI and prior preview verified, not production verified | PR 44, branch `feature/academy-complete-learning-experience`, head `96f5a5a66a28c20ddbdc13b0f89c401089b876c6`; Website CI succeeded and historical branch previews reported Ready | Merge/reconciliation, exact production deployment, identity, entitlement, course, assessment, certificate, and runtime verification remain. |
| Sitewide control alignment and Studio ingestion | CI verified, latest production deployment blocked | PR 46, branch `agent/sitewide-governance-auto-academy`, head `899c074d4064f3d92969f06bde6acda54d6ed6ba`; Website CI run 8 succeeded | The latest `obserra-website-live` PR deployment was reported canceled and the secondary project deployments were ignored. Direct production verification is absent. |
| Branch relationship | Blocked for production promotion | PR 46 is based on the PR 44 feature branch rather than `main` | Complete review and reconciliation, then promote one exact release commit through production gates. |
| Public website availability | Must be measured directly | Historical production and preview evidence exists | Run current production route, header, content, error, and availability tests on the exact active deployment. |
| Production identity | Blocked until directly proven | The production identity readiness record identifies development Clerk indicators as unapproved | Configure and verify the approved production Clerk instance, domains, live key pairing, MFA/security policy, redirects, webhooks, private caching, and owner allowlist. |
| Academy public catalog | Operational baseline may exist | Public catalog is descriptive and may preserve a reviewed fallback | Do not infer protected learner readiness, LCMS content, entitlement, assessment, media, or certificate readiness from catalog presence. |
| Academy Studio ingestion | Implemented in source | PR 46 validates supported approved Studio catalog schemas and fails closed to the reviewed baseline | Connect only an approved publication artifact, verify provenance and schema, then test exact production course detail and checkout behavior. |
| Store and Stripe commerce | Existing production-oriented contracts, not current full verification | Checkout, signed webhook, deferred claim, orders, billing, and health work exists in merged history | Verify live Stripe mode, product and price mappings, checkout, webhook signatures, idempotency, purchaser claim, entitlements, refunds, billing, failure containment, and no card-data storage. |
| Trust Center alignment | Implemented in source | PR 46 adds public alignment page and machine-readable API | Deploy and verify wording, evidence dates, accessibility, caching, and restricted claim boundary. |
| Owner-private Command Center entry point | Blocked | No current owner-only production route and backend path have been directly verified | Implement the approved production identity and BFF architecture, deny non-owner access, and verify end to end against the EIOS production tier. |
| Production observability | Blocked until measured | Vercel and application logging capabilities exist | Establish direct deployment lineage, runtime error review, route health, alerting, owner notification, and evidence retention for the production project. |

## Production identity gate

The production site must not initialize identity with malformed, mismatched, test, or development credentials. Public routes may remain available under an intentional fail-safe, but protected routes, owner routes, learner access, customer records, and sensitive commerce operations must fail closed.

Production identity verification requires:

1. Approved production Clerk keys entered only through the Vercel production secret boundary.
2. Matching production instance, domain, redirect, sign-in, sign-up, webhook, and application settings.
3. No `pk_test_` key or `*.clerk.accounts.dev` resource on production pages.
4. Production MFA, session duration, password, bot, account recovery, and administrative policies aligned with Obserra requirements.
5. A single-owner allowlist and role mapping for the private Command Center entry point.
6. Negative tests proving authenticated non-owner, unauthenticated, stale-session, wrong-organization, and revoked identities cannot access owner routes or backend data.
7. Private, noncacheable responses for authenticated and sensitive routes.
8. Audit evidence for sign-in, sign-out, denied access, owner authorization changes, and recovery.

## Website and Store production gate

The exact production release is verified only when all applicable checks pass against `www.obserrallc.com` and the active Vercel production deployment:

1. Domain and TLS validation for apex and `www`, with the approved canonical redirect.
2. Successful current route checks for home, services, industries, EIOS, applications, Academy, Store, Trust Center, contact, legal, accessibility, sign-in, customer portal, and owner entry point.
3. HSTS, CSP, frame denial, MIME protection, referrer policy, permissions policy, and appropriate cache controls.
4. No unresolved production HTTP 5xx cluster, deployment error, middleware failure, or secret exposure.
5. Responsive and accessibility checks for public, learner, customer, and owner routes.
6. Real production data or an explicit empty state. No synthetic orders, learners, licenses, incidents, controls, revenue, inventory, compliance, or deployment status may be presented as real.
7. Live Stripe checkout and signed webhook verification for each approved product class.
8. Idempotent fulfillment, entitlement, purchaser-email claim, refund, cancellation, billing, receipt, and portal behavior.
9. Academy catalog provenance and approved Studio ingestion, with protected content absent from public artifacts.
10. Owner-private Command Center route denied to every identity except the approved owner and connected only through the protected EIOS BFF and API.
11. Production logs, metrics, alerts, deployment lineage, and rollback evidence retained with the release.
12. Post-deployment smoke and transaction tests tied to the exact Git commit and Vercel deployment ID.

## Academy publication boundary

Website catalog presence is not a learner-production status. The website may display only the approved public metadata supplied through the governed publication contract. Protected modules, assessment answers, learner packages, source packages, and owner-review artifacts must remain outside the public repository and public deployment.

The website must preserve a safe reviewed baseline when Studio input is empty, unsupported, malformed, draft, unapproved, stale, or unverifiable. It may replace or add a course only when the individual Studio record is approved, schema-valid, provenance-bound, and eligible for the intended publication state.

## Owner-private Command Center web boundary

The public domain may expose a discoverable or undiscoverable owner entry route, but possession of the URL grants no authority. The route must require the approved owner identity, strong MFA, secure session and device policy, and server-side authorization. It must not accept organization, tenant, role, or owner status from browser-controlled input.

The website tier may hold only the minimum server-side configuration required to contact the approved EIOS backend. Database URLs, EIOS signing keys, connector credentials, provider secrets, and unrestricted service tokens remain outside the browser and outside public build artifacts.

## Regulatory and claim boundary

Trust Center, framework, security, privacy, payment, accessibility, and regulatory content must distinguish implemented safeguards and evidence from legal conclusions or third-party assurance. The website must not claim ISO certification, SOC 2 attestation, PCI validation, HIPAA compliance, regulatory approval, accreditation, audit opinion, or other formal status unless the exact scope and current evidence support the claim and the owner has approved the representation.

## Documentation reconciliation rule

Every material branch, merge, dependency, identity, deployment, domain, route, Academy catalog, commerce, webhook, entitlement, certificate, Trust Center, owner-access, observability, recovery, or regulatory change must update this register and the affected architecture, identity, incident, operations, release, and rollback documents in the same governed change set. Status must always identify the exact commit, deployment, environment, test, and remaining blocker.
