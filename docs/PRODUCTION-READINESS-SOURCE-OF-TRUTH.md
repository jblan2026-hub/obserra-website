# Obserra Website, Academy, Store, and Private Command Center Production Readiness Source of Truth

**Document ID:** WEBSITE-PROD-SSOT-001  
**Status:** Active controlled status record  
**Owner:** Obserra Product Owner  
**Last updated:** 2026-08-07  
**Canonical public domain:** `https://www.obserrallc.com`  
**Applies to:** Public website, Academy catalog and learner experience, store, identity, commerce, Trust Center, private owner Command Center route, deployment, and runtime verification

## Truth rule

This record separates source implementation, CI, preview deployment, production deployment, public rendering, protected identity, commerce, learner operation, private owner operation, recovery, and regulatory assurance. No successful build, preview, route render, workflow, or marketing statement may be used to imply that an end-to-end production capability works unless its identity, authorization, persistence, transaction, fulfillment, audit, failure, rollback, and recovery paths are directly verified.

## Executive status

- **Public homepage:** DIRECTLY REACHABLE.
- **Public Academy catalog:** DIRECTLY REACHABLE WITH 60 COURSE LISTINGS.
- **Store:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Production sign-in:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Academy checkout and payment handoff:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Paid learner entitlement, progress, assessment, and certificate workflow:** NOT DIRECTLY VERIFIED END TO END.
- **Private owner Command Center at the canonical domain:** NOT DEPLOYED OR DIRECTLY VERIFIED.
- **Current sitewide governance branch deployment to the named live Vercel project:** CANCELED IN THE LATEST AVAILABLE VERCEL BOT EVIDENCE.
- **Vercel project and runtime logs through the connected Vercel API:** BLOCKED BY 403 PERMISSION RESPONSES.

The homepage and `/academy` rendered through the canonical public domain during direct review on August 7, 2026. The Academy page advertises 60 paid courses and presents course detail and purchase actions. That proves public rendering only. It does not prove the protected purchase, entitlement, lesson, progress, assessment, certificate, refund, dispute, recovery, or owner-review paths.

## Active website branches and pull requests

### Complete Academy learner experience

- Branch: `feature/academy-complete-learning-experience`
- Pull request: `#44`
- Head: `96f5a5a66a28c20ddbdc13b0f89c401089b876c6`
- Purpose: complete the learner-facing experience across 60 courses, including final-assessment transition, lesson durations, guided course chapters, materials, knowledge checks, assessment, and certificate delivery.
- Available Vercel bot evidence at the reviewed head: preview deployments reported Ready for `obserra-website-live`, `obserra-integrated-services`, and `obserra-website-lcn2`.

This evidence establishes successful preview deployment at that historical head. It does not establish production promotion to the canonical domain or complete end-to-end learner verification.

### Sitewide governance and Academy Studio ingestion

- Branch: `agent/sitewide-governance-auto-academy`
- Pull request: `#46`
- Head before this status record: `899c074d4064f3d92969f06bde6acda54d6ed6ba`
- Website CI run `8`: success
- Purpose: shared control-alignment registry, Trust Center alignment, governed Academy Studio ingestion, additive approved-course synchronization, fail-closed catalog behavior, and owner-review pull-request automation.
- Latest available Vercel bot evidence: `obserra-website-live` deployment was canceled; secondary projects were ignored while retaining preview URLs.

The branch remains draft and must not be represented as deployed to production.

## Vercel source-of-truth inconsistency

The current repository README identifies `obserra-integrated-services` as the authoritative production project. The owner supplied `obserra-website-live` as the Vercel project to use. Historical pull-request comments show the same repository connected to `obserra-website-live`, `obserra-integrated-services`, and `obserra-website-lcn2`.

This is an unresolved release-governance issue. Before production promotion, one project must be designated as the authoritative production project, one branch must be designated as the production source, and the canonical domain must be verified to resolve to the approved deployment. Duplicate or legacy Vercel projects must be classified as production, preview, standby, or retired. Their environment variables, domains, deployment protections, and Git integration must not drift.

Direct Vercel API review is currently blocked because the connected Vercel session returns 403 for project deployments and runtime errors. GitHub Vercel bot comments remain available, but they do not replace direct project, build-log, runtime-log, environment, domain, and rollback verification.

## Identity state

The repository contains production identity hardening that prevents malformed Clerk keys from crashing public routes and makes protected paths fail closed. That is a resilience control, not proof that production identity is correctly configured.

Production identity remains unverified until all of the following pass against the canonical domain:

1. Live Clerk publishable and secret keys are structurally valid and belong to the same production instance.
2. `www.obserrallc.com` and required redirects are approved in the Clerk production instance.
3. Owner and learner sign-in complete with MFA and secure session behavior.
4. Authenticated responses are private and non-cacheable.
5. Public routes remain available during identity degradation.
6. Protected routes deny anonymous and unauthorized users without HTTP 500 responses.
7. Owner-only routes deny every non-owner identity.
8. Clerk webhook and organization events are signed, scoped, idempotent, and audited where used.

## Academy and course-publication state

The public Academy catalog currently presents 60 course listings. Pull request `#44` contains the active website learner-experience implementation. The separate Academy Production Studio pull request `#16` reports that the protected 60-course AI-authored learner catalog is incomplete because OpenAI capacity was exhausted before all courses were generated and before LCMS loading.

These records are not automatically contradictory because the website may contain a reviewed baseline learner implementation while Studio develops a richer governed protected catalog. They do create a mandatory reconciliation gate. Before production claims or publication changes, each public course must map to an exact protected learner package, entitlement rule, duration, assessment, passing score, certificate rule, source record, version, release status, and rollback artifact. The website must fail closed to an approved baseline when Studio content is missing, malformed, draft, or unapproved.

No course may be described as newly complete or Studio-backed merely because its public catalog record exists. No Studio draft may enter checkout or learner delivery without the approved publication contract.

## Commerce and fulfillment state

The repository includes Stripe-hosted checkout, signed webhook fulfillment, identity-degraded guest checkout support, deferred purchase claims, purchaser-email binding, idempotency by Stripe Checkout Session ID, and a sanitized commerce health contract. Those are implemented source capabilities.

Production commerce remains unverified until direct tests prove:

- production Stripe mode and exact price mapping;
- signed webhook acceptance and invalid-signature rejection;
- authenticated and identity-degraded checkout behavior;
- paid, pending-claim, claimed, rejected, refunded, disputed, and duplicate-event paths;
- purchaser-email matching and account claim rules;
- entitlement persistence and revocation;
- receipt, billing, order, and support access;
- no card-data storage outside the Stripe-hosted boundary;
- audit, alerting, rollback, reconciliation, and recovery.

## Private owner Command Center route

The owner requires a private Command Center accessible only to the company owner at the canonical domain. That route does not yet exist as a directly verified production service in this repository.

The approved target is:

```text
Owner browser
  -> https://www.obserrallc.com/command-center
     -> same-origin owner Command Center BFF
        -> protected EIOS backend
           -> owner identity, MFA, RBAC, organization and tenant enforcement
           -> device registry, service registry, monitoring, evidence, and governed actions
           -> dedicated EIOS PostgreSQL database
```

The public website must not receive database credentials, JWT signing keys, connector secrets, raw evidence, private EIOS source, internal schemas, or customer data. The route must be non-indexable, no-store, owner-only, server-authorized, and directly tested with both owner and denied non-owner identities.

## Production acceptance gates

Production operational status requires all of the following:

1. One authoritative Vercel production project and branch are documented and verified.
2. The canonical domain resolves to the reviewed deployment and rollback target.
3. Website CI, dependency, secret, SBOM, security, accessibility, and production build gates pass.
4. Homepage, services, applications, industries, Academy, store, resources, Trust, contact, legal, robots, sitemap, and error routes pass direct smoke and accessibility testing.
5. Production Clerk identity, owner-only authorization, learner authorization, session, MFA, and denied paths pass.
6. Stripe checkout, webhook, entitlement, claim, refund, dispute, order, receipt, and billing paths pass.
7. All 60 published courses reconcile to approved learner packages and pass duration, progress, assessment, certificate, source, accessibility, version, and rollback checks.
8. The private Command Center web and protected EIOS backend pass direct identity, authorization, tenant, persistence, monitoring, device, connector, audit, and recovery tests.
9. Backup, restore, rollback, credential rotation, device revocation, incident response, and disaster recovery are exercised.
10. Applicable privacy, PCI DSS, NIST CSF 2.0, NIST SSDF, ISO/IEC 27001, SOC 2, healthcare, financial-services, government, accessibility, intellectual-property, legal, and independent assurance gates are completed without unsupported compliance claims.
11. Owner acceptance is recorded for the exact production deployment.

## Mandatory documentation update policy

Every material implementation, deployment, identity, connector, course, commerce, security, recovery, or regulatory change must update this record or its controlled successor in the same change set. Each owner update must state what changed, what was directly verified, what remains unverified, active blockers, security and regulatory impact, rollback state, and the next governed action.
