# Autonomous Patch Authority Boundary

- **Version:** 1.0.0
- **Status:** Mandatory public-site boundary
- **Effective date:** 2026-08-07

Visiting the Obserra website, purchasing a product, using the Academy, authenticating, opening a course, submitting a form, or connecting through a browser never grants Obserra authority to patch or administer the visitor's, learner's, customer's, or vendor's device or system.

Automated maintenance is limited to Obserra-owned website, application, deployment, and infrastructure assets, plus separately authorized customer-managed enterprise assets outside the public-site trust boundary. The public website itself does not grant or broker that authority.

The following are always observe-only from this repository: learner and student devices; customer personal devices; browsers; payment-provider infrastructure; identity-provider infrastructure; email, analytics, content-delivery, hosting, collaboration, and learning-platform vendor systems; supplier and partner systems; and unknown assets.

The site may protect its own routes, sessions, APIs, and infrastructure by blocking, rate-limiting, challenging, revoking an Obserra-issued session, or rolling back an Obserra-owned deployment. It may not mutate a remote user or vendor system.

Owner approval for a website dependency with outage risk does not create authority over a visitor, learner, customer, or vendor asset. Backend controls must enforce this boundary regardless of browser state.