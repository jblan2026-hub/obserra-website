# Obserra EPI capability level and category taxonomy

**Status:** governed inventory and release model. This taxonomy does not assert that a capability is live, purchasable, or production-ready without the relevant endpoint and provider evidence.

## Inventory sources

| Collection | Verified skills | Levels represented | Purpose |
| --- | ---: | --- | --- |
| Core repository | 2,160 | Beginner, Intermediate, Expert | Engineering, security, privacy, governance, platform, product, operations |
| Set 2 add-ons | 2,160 | Beginner, Intermediate, Expert | Protection, intelligence, education, instructional media, accessibility, service design, resilience |
| Set 3 final add-ons | 5,000 | Beginner, Intermediate, Expert | Extended domain and operating-model coverage |
| Set 4 advanced | 2,000 | Advanced | High-assurance operational, credentialing, publishing, broadcast, membership, and regulatory patterns |
| Marketplace suite | 216 | Product/package-specific | Governed agent teams, workflows, certifications, and industry editions |

## Release order

A capability is placed by **level first**, then its **operating category**. Higher levels inherit—not replace—the controls in lower levels.

| Level | Release standard | Eligible categories |
| --- | --- | --- |
| Beginner | Clear scope, owner, user journey, accessibility baseline, evidence record | Public website, discovery, SEO, content, course foundations |
| Intermediate | Role-aware workflows, tested integrations, durable records, error handling | Applications, Academy/LMS, video learning, marketplace operations |
| Expert | Threat modeling, authorization, auditability, privacy, incident/recovery controls, performance evidence | Identity, payments, enrollment, APIs, protected delivery, analytics |
| Advanced | Independent assurance evidence, adversarial/resilience testing, governance gates, measurable control effectiveness | Payment operations, regulated learning, enterprise marketplace, agent teams, executive/protective operations |
| Product package | Versioned manifest, integrity check, licence/price mapping, entitlement and revocation rules | Downloadable AI skills, agent teams, workflow packs, certification packs |

## Operating categories

| Category | Capability families | Production evidence required before enabled |
| --- | --- | --- |
| Website, UX and SEO | Navigation, responsive design, accessibility, structured data, search performance | Canonical HTTP 200; accessibility and metadata checks |
| Marketplace and catalogue | Product discovery, package manifests, pricing, licence terms, customer support | Published product metadata and valid release integrity record |
| Payments and entitlements | Checkout, webhook verification, refunds/disputes, subscriptions, delivery/revocation | Live provider connected; signed webhooks; durable ledger and entitlement authority operational |
| Applications | Enterprise product workflows, identity, tenant controls, APIs | Health endpoint operational; authorization and durable-storage checks |
| Academy and video LMS | Catalogue, enrollment, protected video, assessments, completion and records | Academy/LMS health operational; enrollment/payment/durable-record proof |
| Identity, privacy and security | RBAC, MFA/AAL, audit trails, secure delivery, secrets, incident handling | Identity and authorization health; audit and security test evidence |
| Governance and assurance | AI governance, decision records, policy lifecycle, evidence and reporting | Defined owner, approval gate, evidence retention and verification |
| Executive protection and intelligence | Risk, travel, investigations, crisis and command workflows | Human authorization boundaries; non-autonomous escalation and audit evidence |
| Operations and resilience | Continuity, incident command, recovery, observability, capacity | Recovery and monitoring evidence; documented service objectives |

## Package admission gate

Every future skill, agent, or package is admitted only when it has:

1. A level, category, accountable owner, version, and integrity hash.
2. A human-readable description, licence terms, support path, and accessibility-compliant catalogue presentation.
3. A product record that is separate from provider credentials and secret values.
4. A price mapping only after the live payment provider, signed webhook verification, durable ledger, and entitlement service all report operational.
5. A post-release endpoint check. Failed health means the package remains visible only in its truthful non-purchasable state.

## Current fail-closed boundary

The public Marketplace experience may be browseable, but payments, Applications commerce, Academy commerce/enrollment, Florida LMS, and protected product delivery remain unavailable until their live health checks prove operational. No capability is advertised as self-service purchasable merely because its source package exists.
