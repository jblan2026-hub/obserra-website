# Obserra website

Private Next.js website for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. The authoritative production Vercel project is `obserra-website-live` (`prj_lxTKKDa9sbhht7FaigiaF1PONMiC`). The public canonical URL is `https://www.obserrallc.com`.

The repository is connected to multiple Vercel projects, but only `obserra-website-live` is authorized to build production releases. `scripts/vercel-ignore-build.sh` fails closed for every other Vercel project identity. Canonical custom domains are Vercel control-plane state and must not be declared as shared repository-level aliases in `vercel.json`.

## Secure runtime configuration

Configure the following protected environment-variable names in Vercel for both Preview and Production as appropriate. Never place their values in source, browser storage, logs, commits, or issue trackers.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OBSERRA_OWNER_EMAIL`

The Stripe webhook endpoint is `https://www.obserrallc.com/api/webhook/stripe`. Subscribe it only to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`, and `charge.dispute.closed`.

Full refunds set the directly linked Academy entitlement to refunded. Partial refunds and every dispute lifecycle event revoke the directly linked entitlement for operator review. A won or closed dispute never restores access automatically. Replayed events are material-field checked and idempotent, and ambiguous payment mappings never grant or revoke access.

Academy access is granted solely after Stripe verifies a signed webhook. The success page is informational and does not create enrollment. The approved owner email can sign in at `/sign-in` and then access `/admin`; no public route grants owner access.

Protected learning and certificate routes are private, non-indexable, and sent with no-store caching directives. Course content is not provided as a downloadable asset, and protected learner sessions receive a visible watermark. These controls deter redistribution and preserve traceability; no browser-based training product can technically prevent an authorized user from capturing material displayed on their own screen.

## Verification

```powershell
npm run build
```

Before a production deployment, verify public routes, protected Academy routes, Stripe signature rejection, navigation links, robots, sitemap, and security headers. Deploy only the `main` branch through `obserra-website-live` (`prj_lxTKKDa9sbhht7FaigiaF1PONMiC`). After the exact candidate deployment is READY, move canonical domain ownership only through the authenticated Vercel control plane or the governed `.github/workflows/production-vercel-public-cutover.yml` workflow. Require `/api/health` to prove the intended project, deployment, Git SHA, and verified release authority before classifying the public site as live.
