# Obserra website

Private Next.js website for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. The authoritative production project is Vercel project `obserra-integrated-services`; the public canonical URL is `https://www.obserrallc.com`.

## Secure runtime configuration

Configure the following protected environment-variable names in Vercel for both Preview and Production as appropriate. Never place their values in source, browser storage, logs, commits, or issue trackers.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OBSERRA_OWNER_EMAIL`

The Stripe webhook endpoint is `https://www.obserrallc.com/api/webhook/stripe`. Subscribe it only to `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

Academy access is granted solely after Stripe verifies a signed webhook. The success page is informational and does not create enrollment. The approved owner email can sign in at `/sign-in` and then access `/admin`; no public route grants owner access.

Protected learning and certificate routes are private, non-indexable, and sent with no-store caching directives. Course content is not provided as a downloadable asset, and protected learner sessions receive a visible watermark. These controls deter redistribution and preserve traceability; no browser-based training product can technically prevent an authorized user from capturing material displayed on their own screen.

## Verification

```powershell
npm run build
```

Before a production deployment, verify public routes, protected Academy routes, Stripe signature rejection, navigation links, robots, sitemap, and headers. Deploy only the `main` branch through the `obserra-integrated-services` project, then alias the validated production deployment to `www.obserrallc.com`.
