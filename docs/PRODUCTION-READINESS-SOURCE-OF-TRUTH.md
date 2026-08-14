# Obserra Public Website, Academy, Store, and Trust Production Readiness Source of Truth

**Document ID:** WEBSITE-PROD-SSOT-001  
**Status:** Active controlled status record  
**Owner:** Obserra Product Owner  
**Last updated:** 2026-08-13  
**Canonical public domain:** `https://www.obserrallc.com`  
**Applies to:** Public website, applications marketplace, Academy catalog, protected learner experience, store and commerce, Trust Center, identity, production deployment, runtime verification, customer application handoff, and cross-project publication synchronization

## Truth rule

This record separates source implementation, CI, preview deployment, production deployment, public rendering, protected identity, commerce, entitlement, application launch, customer package delivery, learner operation, recovery, and regulatory assurance. A passing repository workflow does not establish deployment. A successful deployment does not establish identity, payment, fulfillment, persistence, application readiness, recovery, regulatory compliance, certification, or operational effectiveness. No capability is described as live or production operational unless direct evidence supports the exact claim.

## Executive status

| Capability | Current state | Evidence boundary |
|---|---|---|
| Canonical public website | Directly verified reachable at `www.obserrallc.com` | HTTP 200 response and Vercel deployment metadata were inspected |
| Authoritative Vercel website project | Directly identified as `obserra-website-live` | Project ID `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` |
| Current canonical production deployment | Directly verified `READY` | Deployment `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`, deployed commit `80473277620e05acd5359330a706204703c999f0` |
| Current GitHub `main` | Ahead of the verified canonical deployment | Main commit `4bc291fb99b05e12a71c7e0bb4660c87cae2fca3` was not the commit serving the canonical domain during this review |
| Applications marketplace | Directly verified reachable | `/apps` returned HTTP 200 and rendered 18 products |
| Cyber Crisis Commander | Pre-production and not commercially active | No Vercel application project, no launch URL, no Stripe price, and no published website release record |
| Cyber Crisis Commander website status | Live deployment still shows the legacy name and `Coming Soon`; review branch canonicalizes the product name | No checkout, SaaS launch, or download may be represented as production ready |
| Store and purchasing | Implemented in source; production end-to-end operation remains unverified | Stripe checkout, signed webhook fulfillment, entitlement, refund, dispute, and recovery paths require production tests |
| Protected learner experience | Implemented in source; production end-to-end operation remains unverified | Identity, entitlement, progress, assessment, certificate, persistence, and recovery require deployed tests |
| Production identity | Configuration remains incomplete | The canonical `/apps` response included `x-obserra-identity-status: configuration-required` during this review |
| Branch and commit governance | Open blocker | GitHub `main` was unprotected and its current commit was unsigned during this review |
| Private owner Command Center | Separate application boundary | It is not Cyber Crisis Commander and is not hosted by the public website project |

## Authoritative website deployment evidence

The connected Vercel account directly established the following production facts:

- Team name: `ObserraLLC`
- Team slug: `obserra`
- Team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`
- Authoritative project: `obserra-website-live`
- Project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- Production deployment ID: `dpl_8VC9x6gKpPjmB2DXyQx1FxDfyEi8`
- Deployment state: `READY`
- Deployment target: `production`
- GitHub repository: `jblan2026-hub/obserra-website`
- GitHub branch: `main`
- Deployed commit: `80473277620e05acd5359330a706204703c999f0`
- Verified aliases: `www.obserrallc.com`, `obserrallc.com`, and the project Vercel aliases
- Verified framework: Next.js
- Verified runtime region in deployment metadata: `iad1`

The production domain and `/apps` were fetched successfully. Security headers included HSTS, CSP, frame denial, content-type protection, referrer policy, permissions policy, cross-origin protections, and no server-powered disclosure.

## Duplicate and obsolete Vercel project boundary

The Vercel project named `obserra-website` is not the canonical website project. Its old manually uploaded production deployment `dpl_PZcEo5268GUQY6GkF9cpZsHSgAZR` failed because the uploaded bundle caused Vercel to run pnpm against an outdated lockfile. The authoritative GitHub repository uses `package-lock.json` and npm CI.

Other similarly named projects, including `obserra-website-lcn2`, do not own the canonical domains based on the inspected deployment metadata. They must not be used as production evidence unless explicitly reclassified and approved. Project consolidation or retirement remains a governance task.

## Repository and deployment divergence

The verified canonical deployment serves commit `80473277620e05acd5359330a706204703c999f0`. During this review, GitHub `main` was at `4bc291fb99b05e12a71c7e0bb4660c87cae2fca3`. Therefore:

1. The canonical site was live, but it was not serving the latest main commit.
2. Source changes after the deployed commit were not represented as production deployed.
3. Production acceptance must identify the exact promoted commit and deployment ID.
4. A successful preview or branch build is not canonical production evidence.
5. Post-promotion smoke tests must be tied to the deployment that owns the canonical aliases.

## Public and private application separation

The public website, the private owner Command Center, and Cyber Crisis Commander are different applications and deployment boundaries.

### Public website

The public website may contain:

- approved marketing and service content;
- public application descriptions and governed status labels;
- application subscription entry points only for approved products;
- entitlement-bound application launch and package-delivery routes;
- the public Academy catalog and approved course descriptions;
- Stripe checkout entry points;
- protected learner routes for authenticated and entitled users;
- public Trust Center and alignment information;
- public contact, legal, privacy, accessibility, and support content.

The public website must not contain or expose:

- an owner Command Center route or owner login;
- owner course-editing controls;
- owner-only answer keys or certificate samples;
- EIOS database credentials, JWT signing keys, internal APIs, raw evidence, device credentials, or connector secrets;
- private EIOS source, architecture, prompts, proprietary decision logic, or customer data;
- protected Studio-authored learner packages in repository history, public build artifacts, or public APIs;
- hardcoded customer application deployment aliases;
- direct links to ephemeral `*.vercel.app` application deployments;
- a SaaS launch target that bypasses authentication, entitlement, release status, or hostname approval.

### Separate owner Command Center

The private owner Command Center is not Cyber Crisis Commander. The Vercel project `obserra-command-center-bootstrap` must not be interpreted as the Cyber Crisis Commander product runtime, sales destination, customer launch target, or release artifact.

The owner application owns owner-only administration and oversight. It is not configured through the public application commerce path and cannot be restored by reintroducing private owner routes into the public website.

### Cyber Crisis Commander

Cyber Crisis Commander is maintained in repository `jblan2026-hub/Obserra--Crisis-commander-app`. Its application source, installer, runtime, high-availability profile, security evidence, SBOM, release package, and production gates remain authoritative in that repository.

There is no Cyber Crisis Commander Vercel project at this stage. The absence of an application project is intentional while production hardening remains open. The public website must stay fail closed until an approved SaaS runtime and customer release exist.

## Cyber Crisis Commander sales handoff state

The website review branch `feature/cyber-crisis-commander-sales-handoff` establishes the following controlled behavior:

- Canonical product name: `Obserra Cyber Crisis Commander`
- Canonical slug: `obserra-cyber-crisis-commander`
- Commercial status: `Coming Soon`
- Allowed public actions: governed preview request and release notification
- Disallowed pre-release actions: checkout, SaaS launch, customer package download, and billing activation
- Legacy marketing paths: permanent redirect to the canonical product page
- Legacy API slugs: normalized to the canonical product record
- SaaS launch: subscription-bound, entitlement-bound, HTTPS-only, and exact-host allow-listed
- Customer package delivery: authentication-bound, entitlement-bound, release-catalog-bound, and signed-URL-bound

The detailed control and activation procedure is maintained in `docs/CYBER-CRISIS-COMMANDER-SALES-HANDOFF.md`.

## Application commerce and fulfillment boundary

An application may create a Stripe checkout session only when its canonical storefront status is `Available`. `Pilot` and `Coming Soon` products fail closed before checkout creation.

For an approved product, the checkout path additionally requires:

1. A valid product, plan, interval, and deployment combination.
2. An authenticated customer identity.
3. A configured Stripe secret.
4. A configured product price identifier.
5. Same-origin success and cancellation routes.
6. Product, customer, plan, deployment, legal merchant, and commerce-source metadata.

SaaS launch occurs only through `/api/apps/access`. That route verifies product status, authentication, authoritative entitlement, deployment model, product launch configuration, HTTPS, TCP 443, absence of embedded credentials or URL state, and exact hostname allow-list membership.

Customer package delivery occurs only through `/api/apps/download`. That route verifies product status, authentication, entitlement, published release metadata, protected delivery configuration, and a short-lived signed download URL.

The website does not make an application production ready. It exposes an approved application only after the application release process has already established production evidence.

## Academy source-of-truth architecture

The Academy uses separate governed layers:

```text
Academy Production Studio
  -> protected authoring packages and review evidence
  -> protected Academy PostgreSQL / LCMS
  -> approved public catalog metadata
  -> governed synchronization pull request
  -> public website Academy catalog and course pages
  -> Stripe checkout and signed webhook fulfillment
  -> protected learner entitlement, progress, assessment, and certificate
```

The public website catalog is descriptive. It must not expose protected lesson narratives, answer keys, source registers, instructor material, or proprietary generated packages.

The website may retain a reviewed safe baseline, but a Studio record replaces or adds a public course only when its publication contract is structurally valid and its release state is approved or published. Missing, empty, malformed, unsupported, draft, or unapproved Studio data fails closed to the reviewed public baseline.

## Public Academy publication gate

A course may become publicly purchasable only when all applicable conditions pass:

1. The course manifest has a unique stable ID and complete public metadata.
2. The protected learner package matches the manifest and current authoring policy hash.
3. Required subject-matter, technical, legal where applicable, accessibility, brand, and owner reviews are complete.
4. The release state is explicitly approved or published.
5. `publishToAcademy` is explicitly enabled.
6. Commerce metadata contains an approved Stripe price mapping or governed payment path.
7. The protected learner package is loaded into the Academy LCMS.
8. The public catalog synchronization workflow validates the publication contract and opens a controlled pull request.
9. Website tests, lint, production build, private-content exclusion, and Academy production gates pass on the exact catalog commit.
10. The production deployment and canonical-domain course page are directly verified.
11. Checkout, signed webhook fulfillment, entitlement, learner access, and rollback are directly verified.

A draft, generated package, catalog entry, preview page, or successful build is not publication approval.

## Store and payment state

The source includes Stripe-hosted checkout creation, signed webhook processing, invalid-signature rejection, authenticated purchase handling, deferred purchase claims, purchaser-email binding, idempotent fulfillment, commerce-health contracts, and protected entitlement routing.

Production commerce remains unverified until direct tests prove:

1. Production Stripe mode and exact price mapping.
2. Successful checkout creation for every approved product or course class.
3. Unavailable, unpublished, purchase-disabled, pre-release, or invalid items fail closed.
4. Signed webhook acceptance and invalid-signature rejection.
5. Duplicate event idempotency.
6. Paid entitlement creation.
7. Pending claim and later account claim.
8. Purchaser-email mismatch rejection.
9. Failed, canceled, refunded, disputed, unpaid, expired, and revoked states.
10. Receipt, support, audit, alerting, reconciliation, rollback, and recovery.
11. No secret, payment data, bearer credential, or protected learner content appears in logs or browser state.

## Identity and protected-route boundary

Clerk protects learner, certificate, portal, commerce, and administrative namespaces. Production readiness requires direct verification of:

- production Clerk key pairing and issuer;
- sign-in and sign-up behavior;
- MFA policy where required;
- session expiration and revocation;
- protected route denial when anonymous;
- entitlement denial for authenticated non-purchasers;
- organization, tenant, and role boundaries;
- learner progress persistence;
- assessment attempt and passing-score enforcement;
- certificate issuance only from a valid completion record;
- application launch denial when status, entitlement, or destination approval is missing;
- identity-provider outage and recovery behavior.

The production response header `x-obserra-identity-status: configuration-required` is an active identity blocker until reconciled and verified.

## Trust Center and regulatory claim boundary

The public Trust Center may map applicable design considerations to NIST CSF 2.0, NIST SSDF, ISO/IEC 27001, SOC 2 Trust Services Criteria, CISA Cross-Sector Cybersecurity Performance Goals, GDPR, CCPA as amended by CPRA, PCI DSS, and government-oriented requirements.

These mappings communicate design alignment and applicability. They do not establish legal compliance, CMMC certification, ISO certification, SOC 2 attestation, PCI validation, regulatory approval, authorization to operate, audit opinion, or independent assurance. Applicable legal, privacy, accessibility, penetration-test, payment, government, and independent-review gates remain separate.

## Rollback boundaries

Public website rollback, application status rollback, Cyber Crisis Commander rollback, protected Studio rollback, Academy database rollback, Stripe configuration rollback, and owner Command Center rollback are independent operations.

- A website rendering or routing failure may be rolled back to the prior verified website deployment without downgrading an application or Academy database.
- A Cyber Crisis Commander safety or availability issue must remove its website launch setting and return its public status to `Coming Soon` or `Pilot`.
- A catalog synchronization failure must not publish a partial or unapproved catalog.
- A payment or webhook failure must stop new fulfillment without deleting existing valid entitlements.
- A package-delivery issue must remove or disable the website release catalog record without exposing the artifact publicly.
- Database rollback requires a verified backup, migration review, controlled execution, and direct post-rollback validation.
- The private owner site is rolled back through its separate project and cannot be restored by reintroducing owner routes into the public website.

## Production acceptance gates

Public production operational status requires all of the following:

1. The authoritative Vercel project, branch, domains, environment, and rollback target are documented and directly verified.
2. `www.obserrallc.com` resolves to the exact reviewed deployment with valid TLS.
3. Tests, lint, production build, dependency, secret, SBOM, security, accessibility, and private-content exclusion gates pass on the exact promoted commit.
4. Homepage, services, applications, industries, Academy, store, resources, Trust, contact, legal, privacy, accessibility, robots, sitemap, and error routes pass direct smoke testing.
5. Public owner routes return `404` and expose no owner content.
6. Production identity and protected-route denial paths pass and the configuration-required header is cleared.
7. Stripe checkout, webhook, entitlement, claim, refund, dispute, receipt, audit, reconciliation, rollback, and recovery paths pass.
8. Application launch rejects pre-release, anonymous, unentitled, non-SaaS, unconfigured, non-HTTPS, and unapproved-host requests.
9. Customer package delivery rejects anonymous, unentitled, unpublished, unsigned, and unconfigured requests.
10. Every published course reconciles to an approved protected learner package, LCMS record, price mapping, duration, progress rule, assessment, certificate, source record, accessibility record, version, and rollback artifact.
11. Public catalog synchronization from source systems is reproducible, review-controlled, and fail closed.
12. Runtime logs and error clusters show no unresolved security, identity, commerce, launch, fulfillment, or application handoff failures.
13. Backup, restore, rollback, credential rotation, incident response, and disaster recovery are exercised.
14. Applicable privacy, PCI DSS, NIST, ISO, SOC 2, healthcare, financial-services, government, accessibility, intellectual-property, legal, and independent assurance gates are completed without unsupported claims.
15. Branch protection, required reviews, required checks, and signed release provenance are enabled.
16. Owner acceptance is recorded for the exact production deployment.

## Active blockers

1. The canonical production deployment is behind the current GitHub main commit.
2. Production identity reports `configuration-required` in the inspected canonical response.
3. GitHub `main` is unprotected and the inspected main commit is unsigned.
4. Duplicate and obsolete Vercel website projects require classification and consolidation or retirement.
5. Public checkout and end-to-end fulfillment have not been directly verified in production.
6. The protected learner lifecycle has not been directly verified end to end.
7. Cyber Crisis Commander has no approved SaaS runtime, launch hostname, Stripe prices, or published website release record.
8. Cyber Crisis Commander application security, supply-chain, release-signing, government-profile, failover, and recovery gates remain separate blockers until their exact workflow evidence is complete.
9. Regulatory, accessibility, penetration-test, backup, restore, rollback, and owner-acceptance evidence remain incomplete.
10. The website review branch must pass unit tests, lint, production build, Application Sales Handoff Verification, Vercel preview inspection, and approval before promotion.

## Mandatory documentation update policy

Every material implementation, deployment, identity, connector, course, commerce, security, application-release, recovery, or regulatory change must update this record or its controlled successor in the same change set. Each update must state what changed, what was directly verified, what remains unverified, active blockers, security and regulatory impact, rollback state, and the next governed action.
