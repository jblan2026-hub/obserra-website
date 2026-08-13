# Obserra Website, Store, and Academy Production Readiness Truth Register

- **Document ID:** WEBSITE-OWNER-PROD-TRUTH-001
- **Status:** Controlled current-state record
- **Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC, Web Platform, Commerce, Academy, Security, and Operations
- **Last updated:** 2026-08-13
- **Applies to:** `www.obserrallc.com`, `obserrallc.com`, public website, Store, Academy, customer and owner entry points, identity, commerce, Studio ingestion, Trust Center, and production observability

## Canonical identity and domain authority

The legal company and merchant identity is **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. The canonical company domain is `obserrallc.com`, and the canonical public production origin is `https://www.obserrallc.com`. Product names such as Obserra EIOS, Obserra EPI Academy, and other Obserra applications are products or brands under the legal entity and must not replace the company identity in legal, merchant, billing, deployment, installer, certificate, policy, or handoff records.

`obserra.com` is not the canonical company domain. Any current source, deployment configuration, merchant metadata, generated artifact, installer, email, report, certificate, legal notice, or handoff that substitutes another company identity or domain is configuration drift and a release blocker. Historical evidence may retain historical values only when clearly identified as historical evidence rather than current authority.

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
| Canonical company and domain identity | Controlled in source and handoff | `docs/PRODUCTION-IDENTITY-READINESS.md` and this register identify **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**, `obserrallc.com`, and `https://www.obserrallc.com` as current authority | Continue automated and release-time drift checks across source, deployment, commerce, generated artifacts, policies, certificates, and application integrations. |
| Current website source | Implemented in source | `main` commit `dca2a5d481549b5c80c034a50a7e24c3ea7f698d`, `security: fail closed on Clerk test keys in production` | Exact production identity, deployment lineage, protected-route behavior, and post-deployment verification remain required. |
| Public website availability | Directly verified for current public routes | On 2026-08-13 direct checks of `https://www.obserrallc.com`, `/apps`, `/trust`, and `/about` returned the current Obserra executive-intelligence experience | Complete direct checks for the remaining production route inventory, apex-to-`www` convergence, headers, accessibility, protected routes, transactions, and error state. |
| Applications marketplace | Directly verified current public route | `/apps` presents the Obserra enterprise application marketplace, identifies available, pilot, and coming-soon products, and states secure-by-design deployment expectations | Verify each commercial product brief, live commerce path, entitlement path, and deployment claim against authoritative backend and merchant evidence before production sign-off. |
| Trust Center | Directly verified current public route | `/trust` reports the Obserra Enterprise Trust Center as published and operational and distinguishes framework alignment from certification or approval | Continue evidence-date, policy, accessibility, legal-claim, procurement, and security-control verification. |
| Production identity source guard | Implemented in source, not yet production verified | At `dca2a5d481549b5c80c034a50a7e24c3ea7f698d`, `app/layout.tsx` accepts only `pk_live_` and `sk_live_` Clerk keys when `VERCEL_ENV=production`; invalid or test credentials do not initialize `ClerkProvider` | Configure and directly verify the approved production Clerk instance, live key pairing, production domains, redirects, webhooks, MFA/security policy, private caching, and owner allowlist. Confirm no `pk_test_` or `*.clerk.accounts.dev` resource is exposed by the active production deployment. |
| Vercel deployment lineage | Reconciliation required | For exact source commit `dca2a5d481549b5c80c034a50a7e24c3ea7f698d`, `Vercel - obserra-website-lcn2` reported deployment success. A separate `obserra-website-live` status under the `obserra-59e6b33d` scope reported `Canceled from the Vercel Dashboard`. `Vercel - obserra-integrated-services` was still pending at the latest recorded check. | Reconcile the parallel Vercel scopes and Git integrations so one governed production project owns the canonical domains and produces an unambiguous exact-commit production status. Do not treat the canceled parallel status as a successful release. |
| Connected Vercel control plane | Blocked for complete administrative verification | The connected Vercel account exposes team `Obserra` / slug `obserra` / ID `team_xpUE1GefY2JHuFFCqbAdnZAj`, but project enumeration returned zero projects during the 2026-08-13 check | Repair or reauthorize the Vercel project connection through approved account controls. Do not bypass the authorization boundary. |
| Complete Academy learner experience website feature | Not production verified | Historical feature and preview evidence exists, but current production learner identity, entitlement, course, assessment, certificate, and runtime behavior have not all been reverified against one exact release | Reconcile current Academy source with `main`, then verify production identity, entitlement, course, assessment, certificate, checkout, and runtime behavior against the exact production deployment. |
| Academy public catalog | Operational baseline may exist | Public catalog is descriptive and may preserve a reviewed fallback | Do not infer protected learner readiness, LCMS content, entitlement, assessment, media, or certificate readiness from catalog presence. |
| Academy Studio ingestion | Implemented in source history, current production state not fully verified | Prior governed Studio ingestion work validates supported approved catalog schemas and fails closed to a reviewed baseline | Connect only an approved publication artifact, verify provenance and schema, then test exact production course detail and checkout behavior. |
| Store and Stripe commerce | Existing production-oriented contracts, not current full verification | Checkout, signed webhook, deferred claim, orders, billing, and health work exists in merged history | Verify live Stripe mode, legal merchant identity, product and price mappings, checkout, webhook signatures, idempotency, purchaser claim, entitlements, refunds, billing, failure containment, and no card-data storage. |
| Owner-private Command Center entry point | Blocked | No current owner-only production route and backend path have been directly verified end to end | Implement or verify the approved production identity and BFF architecture, deny non-owner access, and verify end to end against the EIOS production tier. |
| Production observability | Blocked until measured against the governed production project | Vercel and application logging capabilities exist, but project lineage remains ambiguous | Establish direct deployment lineage, runtime error review, route health, alerting, owner notification, and evidence retention for the authoritative production project. |

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

The exact production release is verified only when all applicable checks pass against `www.obserrallc.com` and the active authoritative Vercel production deployment:

1. Domain and TLS validation for apex and `www`, with the approved canonical redirect.
2. Successful current route checks for home, services, industries, EIOS, applications, Academy, Store, Trust Center, contact, legal, accessibility, sign-in, customer portal, and owner entry point.
3. HSTS, CSP, frame denial, MIME protection, referrer policy, permissions policy, and appropriate cache controls.
4. No unresolved production HTTP 5xx cluster, deployment error, middleware failure, or secret exposure.
5. Responsive and accessibility checks for public, learner, customer, and owner routes.
6. Real production data or an explicit empty state. No synthetic orders, learners, licenses, incidents, controls, revenue, inventory, compliance, or deployment status may be presented as real.
7. Live Stripe checkout and signed webhook verification for each approved product class under the legal merchant identity **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.
8. Idempotent fulfillment, entitlement, purchaser-email claim, refund, cancellation, billing, receipt, and portal behavior.
9. Academy catalog provenance and approved Studio ingestion, with protected content absent from public artifacts.
10. Owner-private Command Center route denied to every identity except the approved owner and connected only through the protected EIOS BFF and API.
11. Production logs, metrics, alerts, deployment lineage, and rollback evidence retained with the release.
12. Post-deployment smoke and transaction tests tied to the exact Git commit and authoritative Vercel deployment ID.
13. Exact identity and domain drift checks proving no active production configuration substitutes `obserra.com` or another legal entity for current Obserra authority.

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
