# Obserra website

Private Next.js website for **Obserra Executive Protection & Intelligence LLC**. The authoritative production project is Vercel project `obserra-integrated-services`; the public canonical URL is `https://www.obserrallc.com`.

## AI-assisted automated maintenance

The website follows the [Automated Maintenance and Private EIOS Boundary](docs/AUTOMATED_MAINTENANCE_AND_EIOS_BOUNDARY.md).

Approved Obserra-owned dependencies, compatibility-coupled packages, security configuration, runtime components, source, and deployment infrastructure may be patched automatically after locked-source verification, preview or sandbox testing, route, authentication, commerce, webhook, accessibility, security, canary, and rollback gates pass. Owner approval is required only when a first-party dependency or patch retains material predicted outage risk after the staged safety controls are evaluated.

Autonomous patch authority never extends through the website to learners, students, customers, visitors, vendors, or connected third-party services. Their devices, browsers, accounts, networks, tenants, and vendor-managed platforms remain observe-only for security remediation. Connection, enrollment, telemetry, or API credentials do not establish ownership, and human approval cannot override this boundary.

The public website never contains private EIOS execution authority, endpoint data, vulnerability evidence, incident data, credentials, internal APIs, or customer-system control. Private operational status may be reported through protected backend integrations, but public browser code does not calculate authoritative risk or dispatch administrative actions.

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

Before a production deployment, verify public routes, protected Academy routes, Stripe signature rejection, navigation links, robots, sitemap, headers, dependency state, preview health, first-party ownership scope, and rollback readiness. Deploy only the `main` branch through the `obserra-integrated-services` project, then alias the validated production deployment to `www.obserrallc.com`.

Documentation and release notes must distinguish target, implemented, verified, deployed, operating, and effective states. Automated-maintenance direction alone is not evidence that a patch was applied in production.
