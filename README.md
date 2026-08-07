# Obserra website

Private Next.js website for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. The authoritative production project is Vercel project `obserra-integrated-services`; the public canonical URL is `https://www.obserrallc.com`.

## Secure runtime configuration

Configure the following protected environment-variable names in Vercel for both Preview and Production as appropriate. Never place their values in source, browser storage, logs, commits, or issue trackers.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OBSERRA_OWNER_USER_ID`

`OBSERRA_OWNER_USER_ID` must contain the exact Clerk user ID for the single company owner. The owner authorization boundary does not inspect an email address and does not use an email allowlist. A missing or mismatched owner user ID fails closed.

The Stripe webhook endpoint is `https://www.obserrallc.com/api/webhook/stripe`. Subscribe it only to `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

Academy access is granted solely after Stripe verifies a signed webhook. The success page is informational and does not create enrollment. The private owner gateway is `/owner-access`; successful authentication is followed by exact user-ID authorization before `/command-center` or any owner API is served. No public navigation route grants owner access.

The private Command Center is separate from the public Academy learner experience. `/command-center/academy` provides a searchable owner catalog, and `/command-center/academy/[courseId]` renders the complete course-specific lesson content, sources, guided practice, materials, knowledge checks, and a non-persistent final-assessment review. Owner review does not create a purchase, learner entitlement, progress record, assessment record, completion, or issued certificate.

Protected learning, certificate, Command Center, and owner-access routes are private, non-indexable, and sent with no-store caching directives. Course content is not provided as a downloadable asset, and protected learner sessions receive a visible watermark. These controls deter redistribution and preserve traceability; no browser-based training product can technically prevent an authorized user from capturing material displayed on their own screen.

## Verification

```powershell
npm test
npm run lint
npm run build
```

Before a production deployment, verify public routes, the exact owner user-ID boundary, denied non-owner access, owner API denial behavior, complete Command Center course rendering, non-persistent owner assessment scoring, protected Academy routes, Stripe signature rejection, navigation links, robots, sitemap, and security headers. Deploy only a reviewed branch through the `obserra-integrated-services` project, then alias the validated production deployment to `www.obserrallc.com`.
