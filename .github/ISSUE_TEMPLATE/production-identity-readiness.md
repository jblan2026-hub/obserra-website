---
name: Production identity readiness
about: Track replacement of development Clerk credentials in Vercel production
labels: security, production, identity
---

## Production blocker

The production site must not expose `pk_test_` or load Clerk from `*.clerk.accounts.dev`.

## Required actions

- Configure live Clerk production keys in Vercel production environment.
- Configure production domains and redirect URLs in Clerk.
- Redeploy `main`.
- Run the production end to end operational workflow.
- Verify authenticated portal and Academy checkout with a controlled test account.

## Acceptance criteria

- No `pk_test_` in the production response.
- No `clerk.accounts.dev` resources in production.
- Protected checkout preserves the return URL.
- Authentication responses remain private and noncacheable.
- Security headers remain active.
- GitHub operational gate passes.
- Vercel reports no runtime error clusters.
