# Production Identity Readiness

## Canonical identity and no-drift handoff

This document is an authoritative production handoff for company, merchant, billing, commerce, website, application, and domain identity.

- Legal company name: `OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC`
- Canonical company domain: `obserrallc.com`
- Canonical public website origin: `https://www.obserrallc.com`
- Approved apex domain identity: `https://obserrallc.com`
- Private owner boundary when applicable: `https://owner.obserrallc.com`

Do not substitute `obserra.com` for the legal company name or canonical company/domain identity. Do not shorten the legal merchant or billing identity where a legal entity name is required. Product names such as Obserra EIOS, Obserra EPI Academy, and Obserra Cyber Crisis Commander are product or operating brands under `OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC`, not replacement legal entities.

All future source changes, generated artifacts, application installers, checkout metadata, merchant descriptors, billing records, legal notices, security documentation, handoffs, deployment configuration, emails, certificates, reports, and public website metadata must preserve this canonical identity. A conflicting company or domain value is configuration drift and must be corrected before production release. Historical evidence may retain values that were true at the time it was generated, but historical records are not current configuration authority.

## Current source and live-site handoff

Authoritative website repository: `jblan2026-hub/obserra-website`

Source branch: `main`

Source head at the 2026-08-13 synchronization point: `80473277620e05acd5359330a706204703c999f0`

Direct live review on 2026-08-13 confirmed `https://www.obserrallc.com/` is serving the current Obserra executive-intelligence website and exposes the Applications entry point. Production stability must still be established through direct Vercel deployment, runtime-error, identity, commerce, and canonical-domain verification rather than inferred from source or a successful page load alone.

At this synchronization point, GitHub deployment status for the website source head contains mixed Vercel project states across parallel or legacy project integrations. Vercel project reconciliation and canonical-domain routing therefore remain production-operational verification items even though the canonical `www.obserrallc.com` site is live.

## Current status

The public website and Academy are operational, but the production deployment currently exposes a Clerk development publishable key and loads Clerk from a development domain.

Observed production indicators:

- Publishable key prefix: `pk_test_`
- Clerk host: `*.clerk.accounts.dev`

This configuration is not approved for final production identity readiness.

## Required production configuration

Configure the Vercel production environment with the live Clerk instance values:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Any Clerk webhook signing secret used by the application
- Any production Clerk domain, proxy, or satellite configuration required by the selected deployment model

Secrets must be entered directly into the Vercel production environment and must never be committed to GitHub.

## Required Clerk configuration

The Clerk production instance must include:

- `www.obserrallc.com` as an approved production domain
- `obserrallc.com` where required
- Production sign in and sign up URLs
- Approved redirect URLs for the customer portal and Academy checkout
- Production webhook endpoints
- MFA, session, password, bot protection, and account security settings aligned to Obserra policy

## Commerce authority

Website application commerce is authoritative. Application-local payment implementations must not become an alternate billing authority.

Legal merchant identity: `OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC`

Canonical application-commerce origin: `https://www.obserrallc.com`

Application purchase, entitlement, portal, checkout, and merchant metadata must remain tied to this identity and origin unless the owner explicitly approves a replacement architecture.

## Required redeployment

After updating the Vercel production environment, redeploy the current `main` branch without bypassing the production operational gate.

## Acceptance criteria

Production identity readiness is complete only when all criteria pass:

1. `https://www.obserrallc.com/sign-in` returns HTTP 200.
2. The response contains a Clerk live publishable key prefix and does not contain `pk_test_`.
3. The response does not load resources from `clerk.accounts.dev`.
4. The unauthenticated Academy checkout route redirects to the production sign in flow.
5. The checkout return URL is preserved.
6. Authentication responses remain private and noncacheable.
7. HSTS, CSP, frame denial, MIME protection, referrer policy, and permissions policy remain active.
8. The production end to end operational GitHub workflow passes.
9. Vercel reports no new runtime error clusters after deployment.
10. A controlled authenticated test account can sign in, access the portal, and reach the Stripe checkout handoff.
11. `obserrallc.com` and `www.obserrallc.com` resolve into the approved canonical production experience without serving a stale or unrelated legacy site.
12. Company, merchant, billing, commerce, application, and legal metadata use `OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC` and the `obserrallc.com` domain identity without drift.

## Production truth boundary

Do not represent a deployment, integration, regulated workflow, payment path, identity path, application, Academy course, certificate, or protected owner service as production-ready solely because source exists or a build succeeds. Production claims require direct runtime evidence from the applicable current service.

## Handoff maintenance requirement

Update this handoff whenever any of the following changes: legal identity, canonical domain, production Vercel project, production source head, commerce authority, owner-domain routing, critical production incident, or release truth boundary. No future handoff may silently replace the canonical identity defined here.

## Rollback

If production authentication fails after the key transition, restore the previous Vercel production deployment while retaining this readiness gate. Do not restore development Clerk credentials as the long term production configuration.
