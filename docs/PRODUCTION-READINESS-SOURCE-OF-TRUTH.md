# Obserra Public Website, Academy, Store, and Trust Production Readiness Source of Truth

**Document ID:** WEBSITE-PROD-SSOT-001  
**Status:** Active controlled status record  
**Owner:** Obserra Product Owner  
**Last updated:** 2026-08-07  
**Canonical public domain:** `https://www.obserrallc.com`  
**Applies to:** Public website, public Academy catalog, protected learner experience, store and commerce, Trust Center, identity, production deployment, runtime verification, and cross-project publication synchronization

## Truth rule

This record separates source implementation, CI, preview deployment, production deployment, public rendering, protected identity, commerce, learner operation, recovery, and regulatory assurance. A passing repository workflow does not establish deployment. A successful deployment does not establish identity, payment, fulfillment, persistence, recovery, regulatory compliance, certification, or operational effectiveness. No capability is described as live or production operational unless direct evidence supports the exact claim.

## Executive status

| Capability | Current state | Evidence boundary |
|---|---|---|
| Public homepage | Directly reachable in the last recorded external review | Reachability only; exact current deployment commit remains unverified through the Vercel connector |
| Public Academy catalog | Directly reachable with 60 course listings in the last recorded external review | Catalog rendering only; protected Studio packages and LCMS reconciliation remain incomplete |
| Store and purchasing | Implemented in source; not directly verified end to end in the current review | Stripe checkout, signed webhook fulfillment, entitlement, refund, dispute, and recovery paths require production tests |
| Protected learner experience | Implemented across active website workstreams; not directly verified end to end | Identity, entitlement, progress, assessment, certificate, persistence, and recovery require deployed tests |
| Trust Center alignment | Implemented in pull request `#46`; exact-head CI rerun is active | Mapping is informational alignment only and is not a compliance or certification claim |
| Private owner Command Center | Removed from the public website branch | The owner site is a separate EIOS application targeted at `https://owner.obserrallc.com` |
| Website exact-head CI | Rerun in progress after a canceled dependency-install attempt | No passing claim until tests, lint, build, and private-content exclusion pass on the exact head |
| Vercel production visibility | Blocked by the connected Vercel permission boundary | GitHub deployment comments are supplementary evidence only |

## Public and private application separation

The public website and the private owner Command Center are different applications and deployment boundaries.

### Public website

The public website may contain:

- approved marketing and service content;
- public application descriptions;
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
- protected Studio-authored learner packages in repository history, public build artifacts, or public APIs.

### Separate owner Command Center

The separate owner site is implemented in the private EIOS repository on branch `agent/owner-command-center-site`, pull request `#74`. Its target is `https://owner.obserrallc.com` in a dedicated private Vercel project. That application owns the owner identity boundary, owner-only BFF, Control Alignment, future Academy production oversight, service monitoring, device management, and governed owner actions.

The owner site is not configured through the public website project. The public website environment contains no owner email allowlist, owner organization identifier, owner-site URL, EIOS backend origin, or owner credentials.

## Active public website workstream

- Repository: `jblan2026-hub/obserra-website`
- Branch: `agent/sitewide-governance-auto-academy`
- Pull request: `#46`
- Source head before this documentation update: `64cca9940eb5c52a2c00fa635cc4f24e91af721e`
- State: draft and mergeable

The current workstream includes:

1. governed Academy Studio catalog ingestion;
2. approved-course append and replacement behavior;
3. public Academy course pages and publication metadata;
4. checkout routing and commerce-health contracts;
5. public Trust Center alignment and machine-readable alignment API;
6. website CI and Academy production gates;
7. public/private source separation checks.

The branch no longer contains `/command-center` or any public owner course-review, answer-key, editing, or certificate-sample route. Legacy `/academy/admin/review` owner redirects were removed rather than redirected to a public namespace.

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

The public website may retain a reviewed safe baseline, but a Studio record replaces or adds a public course only when its publication contract is structurally valid and its release state is approved or published. Missing, empty, malformed, unsupported, draft, or unapproved Studio data fails closed to the reviewed public baseline.

## Academy Production Studio state

The Academy Production Studio workstream is maintained in repository `jblan2026-hub/obserra-academy-production-studio`, branch `agent/continue-course-buildout`, pull request `#16`.

The current Studio design provides:

- 60 manifest-defined owner-review course targets;
- protected AI-authored learner packages;
- authoring-policy and manifest integrity hashes;
- provider capacity and routing preflight before worker launch;
- explicit OpenAI organization and project routing support;
- bounded provider transport and response limits;
- non-retryable classification for exhausted provider credits, invalid credentials, and invalid requests;
- protected PostgreSQL checkpoints for each successfully authored package;
- checkpoint restoration before subsequent authoring runs;
- fail-closed re-audit of all 60 packages before catalog build;
- protected learner catalog validation;
- protected LCMS schema and course loading;
- safe public metadata synchronization through draft pull requests.

The last failed provider execution returned OpenAI `credit_balance_exhausted`. The updated workflow now verifies protected PostgreSQL, restores checkpoints, and runs a minimal provider preflight before launching any course worker. No course is published merely because a package was generated. Publication still requires governed reviews, approved release metadata, public catalog synchronization, website validation, commerce validation, and owner acceptance.

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

## Commerce and fulfillment state

The source includes:

- Stripe-hosted Checkout Session creation;
- signed Stripe webhook processing;
- rejection of invalid webhook signatures;
- authenticated purchase handling;
- identity-degraded guest checkout support where governed;
- deferred purchase claims;
- purchaser-email binding;
- idempotent fulfillment keyed to Stripe Checkout Session identity;
- Academy commerce-health response contracts;
- protected learner entitlement routing.

Production commerce remains unverified until direct tests prove:

1. production Stripe mode and exact price mapping;
2. successful checkout creation for each approved course class;
3. unavailable, unpublished, purchase-disabled, or invalid courses fail closed;
4. signed webhook acceptance and invalid-signature rejection;
5. duplicate event idempotency;
6. paid entitlement creation;
7. pending claim and later account claim;
8. purchaser-email mismatch rejection;
9. failed, canceled, refunded, disputed, and revoked states;
10. receipt, support, audit, alerting, reconciliation, rollback, and recovery;
11. no secret, payment data, or protected learner content appears in logs or browser state.

## Identity and learner boundary

Clerk protects learner, certificate, portal, and administrative namespaces. Production readiness requires direct verification of:

- production Clerk key pairing and issuer;
- sign-in and sign-up behavior;
- session expiration and revocation;
- protected learner route denial when anonymous;
- entitlement denial for authenticated non-purchasers;
- paid and owner-approved review access where applicable;
- organization and role boundaries;
- learner progress persistence;
- assessment attempt and passing-score enforcement;
- certificate issuance only from a valid completion record;
- identity-provider outage and recovery behavior.

Repository configuration checks do not prove production identity or MFA effectiveness.

## Trust Center and regulatory claim boundary

The public Trust Center maps applicable design considerations to NIST CSF 2.0, ISO/IEC 27001:2022, SOC 2 Trust Services Criteria, CISA Cross-Sector Cybersecurity Performance Goals, GDPR, CCPA as amended by CPRA, and PCI DSS v4.0.1.

These mappings communicate design alignment and applicability. They do not establish legal compliance, ISO certification, SOC 2 attestation, PCI validation, regulatory approval, authorization to operate, audit opinion, or independent assurance. Applicable legal, privacy, accessibility, penetration-test, payment, and independent-review gates remain separate.

## Deployment state

The owner has identified the Vercel team `obserra` and the canonical public domain `www.obserrallc.com`. Historical repository evidence references multiple website projects, including `obserra-website-live`, `obserra-integrated-services`, and `obserra-website-lcn2`.

The connected Vercel session currently returns permission-denied or not-found responses for project and deployment inspection. Therefore:

- no current deployment is represented as the exact source head;
- no current build log or runtime log is represented as reviewed;
- no canonical-domain alias is represented as verified against the current commit;
- historical Ready, Ignored, or Canceled bot comments are not used as production-operation proof.

Before production promotion, one authoritative public project and production branch must be designated and directly verified. Duplicate projects must be classified as production, preview, standby, or retired, with environment variables, domains, deployment protection, and Git integration reconciled.

## Rollback boundaries

Public website rollback, protected Studio rollback, Academy database rollback, Stripe configuration rollback, and owner Command Center rollback are independent operations.

- A website rendering or routing failure may be rolled back to the prior verified website deployment without downgrading the Academy database.
- A catalog synchronization failure must not publish a partial or unapproved catalog.
- A Studio authoring failure leaves protected checkpoints and previously approved releases intact.
- A payment or webhook failure must stop new fulfillment without deleting existing valid entitlements.
- Database rollback requires a verified backup, migration review, controlled execution, and direct post-rollback validation.
- The private owner site is rolled back through its separate EIOS project and cannot be restored by reintroducing owner routes into the public website.

## Production acceptance gates

Public production operational status requires all of the following:

1. One authoritative Vercel production project and branch are documented and directly verified.
2. `www.obserrallc.com` resolves to the exact reviewed deployment with valid TLS and a verified rollback target.
3. Tests, lint, production build, dependency, secret, SBOM, security, accessibility, and private-content exclusion gates pass on the exact promoted commit.
4. Homepage, services, applications, industries, Academy, store, resources, Trust, contact, legal, privacy, accessibility, robots, sitemap, and error routes pass direct smoke testing.
5. Public `/command-center` and legacy owner review routes return `404` and expose no owner content.
6. Production identity and protected learner denial paths pass.
7. Stripe checkout, webhook, entitlement, claim, refund, dispute, receipt, audit, reconciliation, rollback, and recovery paths pass.
8. Every published course reconciles to an approved protected learner package, LCMS record, price mapping, duration, progress rule, assessment, certificate, source record, accessibility record, version, and rollback artifact.
9. Public catalog synchronization from Studio is reproducible, review-controlled, and fail-closed.
10. Runtime logs and error clusters show no unresolved security, identity, commerce, or fulfillment failures.
11. Backup, restore, rollback, credential rotation, incident response, and disaster recovery are exercised.
12. Applicable privacy, PCI DSS, NIST CSF 2.0, NIST SSDF, ISO/IEC 27001, SOC 2, healthcare, financial-services, government, accessibility, intellectual-property, legal, and independent assurance gates are completed without unsupported claims.
13. Owner acceptance is recorded for the exact production deployment.

## Active blockers

1. Exact-head website CI and Academy production gate reruns are still executing.
2. OpenAI funding and project routing for the protected 60-course Studio workflow must pass the new provider preflight.
3. The protected Academy PostgreSQL checkpoint and LCMS path must pass the revised workflow.
4. Vercel project and deployment visibility is blocked by connector permissions.
5. Public checkout and end-to-end fulfillment have not been directly verified in production.
6. The protected learner lifecycle has not been directly verified end to end.
7. Regulatory, accessibility, penetration-test, backup, restore, rollback, and owner-acceptance evidence remain incomplete.

## Mandatory documentation update policy

Every material implementation, deployment, identity, connector, course, commerce, security, recovery, or regulatory change must update this record or its controlled successor in the same change set. Each owner update must state what changed, what was directly verified, what remains unverified, active blockers, security and regulatory impact, rollback state, and the next governed action.
