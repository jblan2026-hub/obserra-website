# Obserra Application Production Pipeline

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Status:** Active engineering baseline  
**Last reconciled:** 2026-08-08

## Purpose

The Application Production Pipeline governs how Obserra applications move from intake through design, implementation, staging, owner review, production, maintenance, support, revision, and retirement. It extends the existing website marketplace and controlled release-delivery model; it does not create a separate public catalog.

The website `/apps` marketplace remains the public commercial surface. Application source, staging evidence, support data, build artifacts, security evidence, rollback assets, and owner operations remain protected.

## Portfolio worker allocation

The authoritative Obserra production allocation is **36 logical workers total**:

- **20 application workers** assigned to application development, maintenance, validation, release preparation, and operational support.
- **16 course workers** reserved for Academy course authoring, assessment production, protected package generation, validation, and LCMS preparation.

Cross-pool borrowing is disabled by default. Changing the 20/16 allocation requires an explicit owner-approved policy change across the Application Production Pipeline, Academy Production Studio, and EIOS Worker Operations control plane.

## 20-worker application operating model

The pipeline defines 20 logical application workers. Every marketplace application is deterministically assigned to one worker by application slug. The GitHub Actions matrix uses `max-parallel: 20`; actual simultaneous execution can be lower when account or runner concurrency limits apply. A lower platform concurrency limit does not change the governed 20-worker application allocation.

Workers validate only their assigned application records and write attributable workflow evidence. They do not approve releases, change commercial status, or deploy directly to production.

## Lifecycle

1. Intake
2. Design
3. Development
4. Security review
5. Quality review
6. Staged
7. Owner review
8. Approved
9. Production
10. Maintenance
11. Retired

Applications may re-enter development from production for feature work, revision, maintenance, dependency updates, support fixes, security remediation, configuration changes, or rollback preparation.

## Required release contract

Each application must maintain a governed release manifest identifying:

- immutable application slug and product identity;
- release version and channel;
- supported deployment models;
- Stripe subscription policy where commercially applicable;
- SaaS, private-cloud, hybrid, or on-premises delivery profile;
- source commit and build evidence;
- SBOM and dependency evidence;
- artifact checksums and signature state;
- staging deployment and direct smoke results;
- security and authorization test evidence;
- rollback package and recovery procedure;
- owner approval record;
- production deployment identifier and verification result.

No unsigned placeholder artifact may be treated as customer deliverable. The current `generate-app-release-bundle.mjs` intentionally writes `awaiting-signed-artifact` until a real validated artifact exists.

## Security and regulatory engineering gates

Every application increment must preserve Secure by Design and Secure by Default principles and provide evidence appropriate to its architecture. Baseline gates include source integrity, dependency assurance, secret scanning, static analysis, unit and integration testing, authorization and tenant-isolation testing, secure configuration, production build, SBOM, artifact integrity, staging smoke, rollback readiness, and owner approval.

Architecture and evidence should support applicable NIST CSF 2.0, NIST SSDF, NIST SP 800-53 control objectives, privacy, customer contractual controls, accessibility, and product-specific regulatory requirements. Technical mappings are evidence of engineering alignment; they are not independent certification, accreditation, regulatory approval, or legal conclusions.

## Owner Command Center integration

The private owner Command Center is the control surface for application operations. It will expose, per application:

- lifecycle and commercial status;
- current production and staging versions;
- open revisions and maintenance work;
- worker assignment and pipeline health;
- the fixed portfolio allocation of 20 application workers and 16 course workers;
- GitHub branch, pull request, and CI evidence;
- Vercel or other hosting deployment status;
- dependency and vulnerability findings;
- customer-impacting incidents and support work;
- rollback state;
- approval and promotion controls;
- release history and audit trail.

Promotion controls remain server-authorized and owner-only. Public website code is never the authority for release approval.

## Truthful status model

Use these states consistently:

- **Defined** — application exists in the controlled product catalog.
- **In development** — source or revision work is active.
- **Build verified** — repository build and required static gates pass.
- **Staged** — a named non-production deployment or artifact exists.
- **Staging verified** — direct staging smoke and security checks pass.
- **Approved** — the owner has explicitly approved promotion.
- **Production deployed** — a named production deployment exists.
- **Production verified** — direct runtime checks against the production destination pass.
- **Operational** — production monitoring, support, recovery, and required governance controls are active.
- **Blocked** — a required gate is unresolved.

A GitHub workflow success does not by itself prove production deployment or operational readiness.

## Maintenance and support

Production applications remain inside the pipeline after launch. Security updates, dependency changes, defect corrections, feature revisions, configuration changes, and support fixes must be versioned and pass impact-appropriate gates before production promotion. Emergency remediation can use an accelerated path only when rollback, audit, authorization, direct verification, and post-change evidence are preserved.

## Current implementation

The repository already contains an application marketplace, customer application portal, release delivery logic, controlled download and access routes, release bundle generation, and synchronization tooling. This pipeline adds a 20-worker validation and staging layer around those existing capabilities rather than replacing them. The previous 30-worker application matrix is superseded and must not be treated as the current allocation.

The first production implementation files are:

- `config/application-production-policy.json`
- `config/application-worker-scaling-policy.json`
- `scripts/application-production-worker.mjs`
- `.github/workflows/application-production-pipeline.yml`
- `scripts/generate-app-release-bundle.mjs`
- `scripts/sync-final-apps.mjs`
- `lib/release-delivery.ts`

This document must be reconciled whenever worker allocation, lifecycle, release, security, owner-control, staging, deployment, or support behavior changes.
