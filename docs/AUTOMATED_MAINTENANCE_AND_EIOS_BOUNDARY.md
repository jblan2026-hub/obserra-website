# Automated Maintenance and Private EIOS Boundary

- **Version:** 1.1.0
- **Status:** Approved website operating direction
- **Owner:** Obserra Executive Protection & Intelligence LLC
- **Effective date:** 2026-08-07

## Purpose

The public Obserra website uses governed, AI-assisted maintenance for its own approved runtime, dependencies, configuration, security controls, source, and deployment infrastructure. The public site remains presentation, commerce, and learning-delivery infrastructure. It never hosts private EIOS execution authority, endpoint data, vulnerability evidence, incident data, credentials, internal APIs, or customer-system control.

## First-party-only patch authority

Automated maintenance is restricted to explicitly identified, Obserra-owned website assets. Connection, user access, learner enrollment, customer interaction, vendor integration, telemetry, or possession of an API credential never grants authority to patch another party's system.

Approved maintenance may automatically patch these first-party assets:

- Obserra website application dependencies and compatibility-coupled packages;
- Obserra-controlled security headers, CORS, TLS, caching, logging, and safe runtime configuration;
- Obserra-controlled serverless, container, build, and deployment runtime versions;
- Obserra-owned infrastructure-as-code and content-delivery configuration; and
- vulnerable Obserra application components when applicability and a verified fixed version are established.

Every change must use an approved source, locked or signed artifacts, a restorable pre-change state, preview or sandbox deployment, route and health checks, authentication and authorization checks, commerce and webhook tests, accessibility checks, vulnerability verification, canary or blue/green promotion, and automatic rollback when verification fails.

Routine first-party changes that pass the complete staged safety pipeline do not require per-change human approval. Owner approval is required only when an Obserra-owned dependency or patch retains material predicted outage, restart, or compatibility risk after preview, canary, safe-promotion, and rollback controls are evaluated.

## Protected external parties

The website and its automation must never patch, contain, isolate, upgrade, reconfigure, suspend, or otherwise mutate:

- learner or student laptops, phones, tablets, browsers, accounts, identity-provider records, or personal networks;
- customer devices, customer applications, customer tenants, or customer infrastructure;
- public website visitor devices or accounts;
- Stripe, Clerk, Vercel, email providers, analytics platforms, content-delivery vendors, or any other vendor-managed service;
- partner, contractor, advisor, or supplier systems; or
- any system whose ownership or authority is unknown.

Authorized integrations may exchange the minimum data required for their documented website function. They are not autonomous security-remediation channels. Vendor health or security conditions may be monitored and reported, but the Obserra website must not dispatch patch or containment commands into the vendor environment.

Human approval cannot override this ownership boundary.

## Learning boundary

Obserra may patch its own Academy pages, APIs, course-delivery services, certificate services, and supporting infrastructure. That authority never extends through a learning session to a learner's device, browser, account, home network, employer environment, or identity provider.

## Live operational updates

Private operational systems may receive attributable, sanitized status events for first-party build, patch, deployment, verification, rollback, and health changes. Public browser code does not receive private findings or execution details. Website pages do not calculate authoritative risk or dispatch administrative actions.

## Security boundary

- Secrets remain in protected deployment configuration and never enter source, browser storage, logs, or public artifacts.
- Production changes use least-privileged service identities and allowlisted first-party destinations.
- Arbitrary shell execution from public requests or browser code is prohibited.
- Public routes fail safely when private identity or operational services are unavailable.
- Customer, vendor, learner, and public-user targets remain observe-only for remediation.
- Documentation distinguishes target, implemented, verified, deployed, operating, and effective states.

This repository-specific standard aligns the website with the broader Obserra AI-first operating model without exposing private EIOS architecture or extending authority outside Obserra-owned infrastructure.
