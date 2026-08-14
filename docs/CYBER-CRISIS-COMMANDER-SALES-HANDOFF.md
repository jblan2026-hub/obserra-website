# Cyber Crisis Commander Sales and Application Handoff

**Legal entity:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Public website repository:** `jblan2026-hub/obserra-website`  
**Application repository:** `jblan2026-hub/Obserra--Crisis-commander-app`  
**Document status:** Pre-production control baseline  
**Control owner:** Product Security, Commerce, and Release Engineering  

## 1. Purpose

This document defines how the public Obserra website will market, sell, provision, launch, and deliver Obserra Cyber Crisis Commander without treating the website as the application runtime. It establishes a fail-closed boundary while the application remains in production hardening and provides the exact handoff controls required before SaaS sales or customer package delivery can be enabled.

The public website and Cyber Crisis Commander are separate systems with separate repositories, release evidence, deployment responsibilities, and security boundaries. The website may present a product brief and collect a governed preview request today. It must not create a Cyber Crisis Commander subscription, redirect a customer to an application runtime, or deliver an installer until the corresponding production release is explicitly approved.

## 2. Current verified state

| Item | Current state |
|---|---|
| Canonical public website | `https://www.obserrallc.com` |
| Vercel team | `ObserraLLC` / `obserra` |
| Authoritative website project | `obserra-website-live` |
| Authoritative website project ID | `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` |
| Verified production deployment | `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8` |
| Verified deployment state | `READY` |
| Verified deployed website commit | `80473277620e05acd5359330a706204703c999f0` |
| Current GitHub `main` during this review | `4bc291fb99b05e12a71c7e0bb4660c87cae2fca3` |
| Cyber Crisis Commander Vercel project | **Not created** |
| Cyber Crisis Commander commercial status | **Coming Soon** |
| Cyber Crisis Commander SaaS launch URL | **Not configured** |
| Cyber Crisis Commander Stripe prices | **Not configured** |
| Cyber Crisis Commander published customer package | **Not configured in the website release catalog** |

The Vercel project named `obserra-command-center-bootstrap` is not Cyber Crisis Commander and must not be used as its application runtime, launch target, sales destination, or release evidence.

The separate Vercel project named `obserra-website` is not the authoritative public website project. Its old manual production deployment failed during dependency installation. The canonical domains are attached to `obserra-website-live`.

## 3. Canonical product identity

The public marketplace identity is:

- **Product name:** Obserra Cyber Crisis Commander
- **Canonical slug:** `obserra-cyber-crisis-commander`
- **Current status:** `Coming Soon`
- **Canonical marketing path:** `/apps/obserra-cyber-crisis-commander`
- **Canonical enrollment path:** `/apps/obserra-cyber-crisis-commander/subscribe`

Legacy product paths are redirected permanently:

- `/apps/obserra-incident-command-console`
- `/apps/obserra-incident-command-console/subscribe`
- `/apps/obserra-incident-command`
- `/apps/obserra-incident-command/subscribe`

Legacy API query slugs are normalized to the canonical product slug. They are not mapped to an application deployment URL.

## 4. Fail-closed customer experience

While the product is `Coming Soon`, the product page exposes only:

1. A governed preview request.
2. A release-notification request.
3. Product, deployment, security, and documentation information that accurately reflects pre-production status.

The page does not expose checkout, SaaS launch, package download, or billing actions. Direct requests to the commerce and delivery endpoints are also blocked by server-side status checks.

The structured data for the page does not publish an in-stock offer while the product is pre-release. This prevents search engines and other consumers from interpreting the product as commercially available.

## 5. Governed SaaS handoff design

The future SaaS flow is:

`Public product page -> authenticated checkout -> Stripe subscription -> entitlement synchronization -> authenticated access endpoint -> approved HTTPS launch URL -> Cyber Crisis Commander`

The website access endpoint is `/api/apps/access?app=obserra-cyber-crisis-commander`. It performs the following checks in order:

1. The product exists in the canonical storefront catalog.
2. The product is not `Coming Soon`.
3. The visitor is authenticated through the approved website identity provider.
4. The visitor or organization has an authoritative, active entitlement for the product and launch action.
5. The entitlement deployment model is `SaaS`.
6. The launch environment setting exists.
7. The launch URL uses HTTPS.
8. The launch URL has no embedded username, password, query, or fragment.
9. The launch URL uses TCP 443.
10. The launch hostname exactly matches `APP_LAUNCH_ALLOWED_HOSTS`.

Only after every check succeeds does the website issue an HTTP 303 redirect to the application. The product page never contains a hardcoded Vercel deployment URL. Ephemeral preview aliases and generated `*.vercel.app` deployment URLs are prohibited as production launch destinations.

## 6. Production environment mapping

The following values remain empty until the separate SaaS runtime is approved:

```dotenv
APP_LAUNCH_ALLOWED_HOSTS=
APP_LAUNCH_OBSERRA_CYBER_CRISIS_COMMANDER=
STRIPE_PRICE_OBSERRA_CYBER_CRISIS_COMMANDER_PROFESSIONAL_MONTHLY=
STRIPE_PRICE_OBSERRA_CYBER_CRISIS_COMMANDER_PROFESSIONAL_ANNUAL=
STRIPE_PRICE_OBSERRA_CYBER_CRISIS_COMMANDER_ENTERPRISE_ANNUAL=
```

When SaaS production is approved, use a stable customer-facing hostname controlled by OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC. The environment value must be the canonical application origin or approved application path. Example values in documentation are illustrative only and must not be copied into production without DNS, certificate, ownership, security, and runtime verification.

The website remains fail closed when either the launch hostname allow-list or the product-specific launch URL is missing.

## 7. Commerce activation gates

Cyber Crisis Commander may be changed from `Coming Soon` to `Available` only after the exact release candidate has objective evidence for all of the following:

1. Authentication, session rotation, revocation, invitation, and secure-default validation.
2. High-availability topology, readiness, disruption, failover, and recovery validation.
3. Customer installer fresh-state validation.
4. Real on-premises runtime validation.
5. Dependency audit, vulnerability enforcement, SBOM, provenance, and release manifest validation.
6. Secret scanning across source, reachable history, package contents, and container images.
7. Signed release artifacts and approved release custody.
8. Government and CMMC support profile review, including explicit claim boundaries.
9. Current administrator, user, installation, upgrade, rollback, recovery, audit, and support documentation.
10. Legal terms, privacy, support, pricing, tax, refund, and procurement approval.
11. SaaS tenant isolation, enterprise identity, logging, monitoring, backup, recovery, and incident-response validation.
12. Website-to-application entitlement integration and end-to-end test purchase validation.
13. Approved production DNS name, TLS certificate, host allow-list, and application launch setting.
14. Production support ownership, escalation, maintenance, vulnerability, and service-level procedures.

No single successful workflow run is sufficient if another required gate remains open.

## 8. Checkout controls

The checkout route accepts only applications whose catalog status is `Available`. `Pilot` and `Coming Soon` products cannot create a Stripe checkout session.

For an `Available` product, checkout additionally requires:

- A valid product, plan, billing interval, and deployment combination.
- An authenticated customer identity.
- A configured Stripe secret.
- A configured product, plan, and interval price identifier.
- Same-origin success and cancellation destinations.
- Product, plan, deployment, customer, legal merchant, and commerce-source metadata.

Missing or invalid configuration returns the customer to the product enrollment page without creating a transaction.

## 9. Customer package delivery controls

The download endpoint is not a public file link. It requires:

1. A product status other than `Coming Soon`.
2. An authenticated customer identity.
3. An active product entitlement.
4. A published release record in `app/apps/store-catalog.json`.
5. An artifact filename, object key, and version.
6. Configured protected CDN signing material.
7. A short-lived signed release URL.

Cyber Crisis Commander is not listed as a published customer package in the website release catalog during pre-production. The application repository remains the authority for build, installer, SBOM, signature, checksum, and runtime evidence. The website release catalog may be updated only after release approval.

## 10. On-premises and private-cloud fulfillment

The one-click customer bundle and SaaS service are distinct fulfillment paths.

For customer-hosted fulfillment, the website must not redirect to the SaaS runtime. The entitlement identifies the approved deployment model and routes the customer to the protected portal for release delivery, implementation instructions, support, and lifecycle records.

The approved customer bundle must include or reference:

- Installation and prerequisite guide.
- Automated secure installation workflow.
- First-administrator bootstrap procedure.
- Enterprise identity and integration configuration.
- Secure-default settings.
- High-availability deployment guide.
- Backup, restore, upgrade, rollback, and disaster-recovery procedures.
- Administrator and user guides.
- Audit, logging, monitoring, and evidence guidance.
- SBOM, checksums, signatures, provenance, and release notes.
- Support and vulnerability reporting procedures.

## 11. Audit evidence

The `Application Sales Handoff Verification` workflow validates the fail-closed contract and uploads evidence containing:

- Test output.
- Exact repository commit.
- Workflow and run identifiers.
- Canonical product slug.
- Explicit record that no SaaS runtime project exists at this stage.
- Commercial status.
- Source SHA-256 hashes for catalog, commerce, launch, download, routing, and test files.

The workflow tests that:

- Cyber Crisis Commander is canonical and `Coming Soon`.
- Legacy marketing paths redirect to the canonical page.
- Product pages do not contain hardcoded Vercel application URLs.
- Coming Soon pages expose preview actions only.
- Checkout accepts only `Available` products.
- Launch requires entitlement and an approved HTTPS host.
- Customer package delivery requires entitlement and a published signed release.
- Production environment values remain empty during pre-production.

Website CI separately runs the complete unit, lint, build, and owner-boundary validation suite.

## 12. Release transition procedure

When the application becomes eligible for commercial activation, Release Engineering must perform the following as one reviewed change set:

1. Confirm the exact Cyber Crisis Commander application commit and release version.
2. Attach all required application workflow evidence to the release record.
3. Publish the approved application catalog record and customer package metadata.
4. Configure protected CDN delivery and validate a short-lived entitled download.
5. Deploy the approved SaaS runtime under a stable Obserra-controlled hostname.
6. Configure the exact launch hostname allow-list and product launch URL in the Vercel production environment.
7. Configure approved Stripe product and price identifiers.
8. Change the website product status from `Coming Soon` to `Available`.
9. Run website CI, Application Sales Handoff Verification, Vercel preview validation, test checkout, entitlement synchronization, SaaS launch, package download, billing portal, cancellation, nonpayment, and revocation scenarios.
10. Review accessibility, mobile, browser, SEO, legal, support, security, privacy, and procurement presentation.
11. Obtain recorded Product Security, Commerce, Legal, Operations, and Release approvals.
12. Promote the reviewed website deployment to the canonical production aliases.
13. Run post-deployment smoke tests and retain evidence tied to the promoted deployment ID.

A launch URL or price identifier must never be configured as a shortcut around the catalog release status or entitlement checks.

## 13. Rollback

If the SaaS runtime, commerce, entitlement, download, or support path becomes unsafe or unavailable:

1. Change the product status to `Coming Soon` or `Pilot` as appropriate.
2. Remove the product launch environment value.
3. Remove or deactivate Stripe prices.
4. Remove the published website release catalog record if delivery must stop.
5. Revoke affected entitlements when required.
6. Promote the fail-closed website configuration.
7. Record the incident, customer impact, approvals, corrective actions, and recovery evidence.

Because the product page and server routes enforce status independently, a pre-release status immediately suppresses public commerce actions and blocks direct endpoint attempts.

## 14. Claim boundary

This website integration does not state that Cyber Crisis Commander is CMMC certified, government authorized, generally available, or deployed as a SaaS product. It documents product capabilities and release controls intended to support a future compliant deployment and commercial handoff. Any government use requires contract-specific, environment-specific, and assessment-specific review.
