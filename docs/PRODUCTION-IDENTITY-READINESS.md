# Production Identity Readiness

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

## Rollback

If production authentication fails after the key transition, restore the previous Vercel production deployment while retaining this readiness gate. Do not restore development Clerk credentials as the long term production configuration.
