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

- **Public homepage:** DIRECTLY REACHABLE in the last recorded external review.
- **Public Academy catalog:** DIRECTLY REACHABLE WITH 60 COURSE LISTINGS in the last recorded external review.
- **Store:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Production sign-in:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Academy checkout and payment handoff:** NOT DIRECTLY VERIFIED IN THE CURRENT REVIEW.
- **Paid learner entitlement, progress, assessment, and certificate workflow:** NOT DIRECTLY VERIFIED END TO END.
- **Private owner Command Center Academy module:** IMPLEMENTED IN SOURCE, TESTED, LINTED, AND PRODUCTION-BUILD VERIFIED ON THE PRECEDING CODE HEAD; NOT YET DEPLOYED OR DIRECTLY VERIFIED AT THE CANONICAL DOMAIN.
- **Independent preview deployments:** TWO VERCEL PREVIEW PROJECTS REPORTED READY FOR THE VERIFIED CODE HEAD.
- **Named `obserra-website-live` project:** LATEST GITHUB VERCEL EVIDENCE REPORTS CANCELED, NOT READY.
- **Direct Vercel project and runtime-log review:** BLOCKED BY THE CURRENT CONNECTOR PERMISSION BOUNDARY.

Website CI run `70` completed successfully for source head `ea09c6eb95d92586a28d4ba555a112904db63cb6`. It passed dependency installation, unit and catalog contract tests, ESLint, and the production Next.js build. After that successful run, the owner-route regression test was strengthened to require verified-primary-email binding and crawler exclusion. Source head before this documentation update is `7b9a6820cd29bc6468e40b3a6963df3de4dbcdb1`; the exact final head must pass the same CI gate before promotion.

## Active website branches and pull requests

### Complete Academy learner experience

- Branch: `feature/academy-complete-learning-experience`
- Pull request: `#44`
- Reviewed head: `96f5a5a66a28c20ddbdc13b0f89c401089b876c6`
- Purpose: complete the learner-facing experience across 60 courses, including final-assessment transition, lesson durations, guided course chapters, materials, knowledge checks, assessment, and certificate delivery.

Historical preview success does not establish production promotion to the canonical domain or complete end-to-end learner verification.

### Sitewide governance, Academy Studio ingestion, and private owner review

- Branch: `agent/sitewide-governance-auto-academy`
- Pull request: `#46`
- Source head before this status update: `7b9a6820cd29bc6468e40b3a6963df3de4dbcdb1`
- Purpose: shared control-alignment registry, Trust Center alignment, governed Academy Studio ingestion, additive approved-course synchronization, fail-closed catalog behavior, owner-review pull-request automation, and the private owner Academy review site.

The branch contains these private routes:

- `/command-center`
- `/command-center/academy`
- `/command-center/academy/[courseId]`
- `/command-center/academy/[courseId]/certificate`

The old `/academy/admin/review` URLs redirect into the private Command Center. The private course viewer displays complete lesson instruction, guided chapters, transcripts, source grounding, guided practice, decision rubrics, failure modes, business application, materials, lesson knowledge-check answers, and the complete 25-question final-assessment answer key. The owner viewer does not call learner progress, learner assessment, checkout, entitlement, or certificate-issuance APIs.

The pull request remains draft and must not be represented as deployed to production until final exact-head CI, authoritative-project deployment, identity, owner-denial, and direct runtime tests pass.

## Private owner identity boundary

The private Command Center uses separate server-side controls:

1. Middleware protects every `/command-center` route with Clerk authentication.
2. `requireOwnerAccess` requires the signed-in account to match the singular `OBSERRA_OWNER_EMAIL` value as its verified primary Clerk email address.
3. When `OBSERRA_OWNER_USER_ID` is configured, the same request must also match that immutable Clerk user identifier.

There is no Vercel-preview authorization bypass in the owner authorization helper. Missing owner configuration, an anonymous request, an unverified or non-primary matching address, a non-owner identity, or a mismatched user ID fails closed. Production MFA still depends on the approved Clerk production configuration and remains a direct verification gate; repository source does not prove that MFA is enabled or effective.

Every Command Center response is designed to be private and non-indexable through route metadata, `robots.txt`, and middleware headers, including `Cache-Control: private, no-store`, `X-Robots-Tag`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`. The route is absent from the sitemap. Robots directives supplement but do not replace authentication and authorization.

## Deployment evidence and unresolved authoritative-project issue

For code head `ea09c6eb95d92586a28d4ba555a112904db63cb6`, GitHub Vercel status evidence reported:

- `obserra-integrated-services`: Ready preview.
- `obserra-website-lcn2`: Ready preview.
- `obserra-website-live`: Canceled.

The repository and historical pull-request evidence reference multiple Vercel projects. The owner has identified `obserra-website-live` as the intended project. Before production promotion, one project must be designated as the authoritative production project, one branch must be designated as the production source, and the canonical domain must be verified to resolve to the approved deployment. Duplicate or legacy Vercel projects must be classified as production, preview, standby, or retired. Their environment variables, domains, deployment protections, and Git integration must not drift.

The connected Vercel API returns permission-denied or not-found responses for direct deployment inspection. GitHub deployment status and bot comments therefore provide deployment-state evidence, but they do not replace direct build-log, runtime-log, environment, domain, authentication, and rollback verification.

## Academy and course-publication state

The public Academy catalog presented 60 course listings in the last direct review. Pull request `#44` contains the active website learner-experience implementation. The separate Academy Production Studio pull request `#16` reports that the protected 60-course AI-authored learner catalog did not complete because the OpenAI provider returned `credit_balance_exhausted` before all courses were generated and before LCMS loading.

These records are not automatically contradictory because the website may contain a reviewed baseline learner implementation while Studio develops a richer governed protected catalog. They do create a mandatory reconciliation gate. Before production claims or publication changes, each public course must map to an exact protected learner package, entitlement rule, duration, assessment, passing score, certificate rule, source record, version, release status, and rollback artifact. The website must fail closed to an approved baseline when Studio content is missing, malformed, draft, or unapproved.

The owner Command Center review route is a review surface over the current website course runtime. It does not prove that the protected Studio-authored LCMS package for every course is complete or loaded.

## Commerce and fulfillment state

The repository includes Stripe-hosted checkout, signed webhook fulfillment, identity-degraded guest checkout support, deferred purchase claims, purchaser-email binding, idempotency by Stripe Checkout Session ID, and a sanitized commerce health contract. Those are implemented source capabilities.

Production commerce remains unverified until direct tests prove production Stripe mode and exact price mapping; signed webhook acceptance and invalid-signature rejection; authenticated and identity-degraded checkout behavior; paid, pending-claim, claimed, rejected, refunded, disputed, and duplicate-event paths; purchaser-email matching; entitlement persistence and revocation; receipt and support access; audit; alerting; rollback; reconciliation; and recovery.

## Private owner Command Center architecture

The implemented website-side boundary is:

```text
Owner browser
  -> https://www.obserrallc.com/command-center
     -> Clerk authenticated route
        -> singular verified primary owner email
           -> optional immutable Clerk owner user ID
              -> read-only Academy content review
```

The broader approved EIOS target remains:

```text
Owner browser
  -> private Command Center web tier
     -> same-origin owner Command Center BFF
        -> protected EIOS backend
           -> owner identity, MFA, RBAC, organization and tenant enforcement
           -> device registry, service registry, monitoring, evidence, and governed actions
           -> dedicated EIOS PostgreSQL database
```

The current website change implements the private Academy review module only. It does not yet connect the website route to the protected EIOS backend, device registry, service registry, or dedicated EIOS database. The public website must not receive database credentials, JWT signing keys, connector secrets, raw evidence, private EIOS source, internal schemas, or customer data.

## Verification evidence

Website CI run `70` on `ea09c6eb95d92586a28d4ba555a112904db63cb6` passed:

- dependency installation;
- all Node unit and catalog contract tests;
- the owner Command Center regression suite;
- ESLint; and
- the production Next.js build.

The strengthened final regression contract verifies:

- `/command-center` is a protected middleware route;
- the owner helper requires the singular owner email as a verified primary address;
- optional immutable owner-user-ID binding is preserved;
- the owner helper has no Vercel environment bypass;
- Command Center responses are no-store and non-indexable;
- robots explicitly exclude `/command-center`;
- owner course routes use the server owner authorization helper;
- owner course review includes lesson and final-assessment answer-key surfaces;
- owner review source contains no learner progress, assessment, or checkout API call;
- legacy Academy owner URLs redirect into the Command Center; and
- all required owner Command Center files are present.

The exact final documentation head must pass CI again. Source and preview validation do not establish canonical-domain owner access or denied non-owner behavior.

## Rollback state

The owner Command Center change is isolated by route and can be rolled back by restoring the prior proxy and robots configuration, restoring the three legacy Academy review route files, and removing the new `/command-center` route tree, `lib/owner-access.ts`, and the owner Command Center regression test. Rollback preserves the public Academy and learner routes. No database migration or learner-data conversion is introduced by this change.

## Production acceptance gates

Production operational status requires all of the following:

1. One authoritative Vercel production project and branch are documented and verified.
2. The canonical domain resolves to the reviewed deployment and rollback target.
3. Website CI, dependency, secret, SBOM, security, accessibility, and production build gates pass at the exact promoted commit.
4. Homepage, services, applications, industries, Academy, store, resources, Trust, contact, legal, robots, sitemap, and error routes pass direct smoke and accessibility testing.
5. Production Clerk identity, owner-only authorization, learner authorization, session, MFA, and denied paths pass.
6. A non-owner signed-in test account receives no Command Center content, while the exact owner account can inspect all routes without a 5xx response.
7. Stripe checkout, webhook, entitlement, claim, refund, dispute, order, receipt, and billing paths pass.
8. All 60 published courses reconcile to approved learner packages and pass duration, progress, assessment, certificate, source, accessibility, version, and rollback checks.
9. The broader private Command Center web and protected EIOS backend pass direct identity, authorization, tenant, persistence, monitoring, device, connector, audit, and recovery tests before broader EIOS functionality is claimed.
10. Backup, restore, rollback, credential rotation, device revocation, incident response, and disaster recovery are exercised.
11. Applicable privacy, PCI DSS, NIST CSF 2.0, NIST SSDF, ISO/IEC 27001, SOC 2, healthcare, financial-services, government, accessibility, intellectual-property, legal, and independent assurance gates are completed without unsupported compliance claims.
12. Owner acceptance is recorded for the exact production deployment.

## Mandatory documentation update policy

Every material implementation, deployment, identity, connector, course, commerce, security, recovery, or regulatory change must update this record or its controlled successor in the same change set. Each owner update must state what changed, what was directly verified, what remains unverified, active blockers, security and regulatory impact, rollback state, and the next governed action.
