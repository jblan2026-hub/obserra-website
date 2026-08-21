# Azure Deployment Plan

> **Status:** Planning

Generated: 2026-08-21

---

## 1. Project Overview

**Goal:** Replace the brittle Vercel production promotion/alias dependency with an Azure production hosting and delivery plane for the existing Obserra Next.js application while preserving the current Supabase, Stripe, Daily, identity, regulated-data, and fail-closed boundaries.

**Path:** Modernize Existing

**Non-negotiable release rule:** A change is not classified as fixed or production-live until the public production endpoint proves the intended hosting authority and exact Git commit SHA. Repository state, CI state, image push, or platform deployment state alone are insufficient.

---

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | Production |
| Scale | Medium architecture; initial target includes at least 220 concurrent authenticated LMS users plus public website traffic |
| Budget | Balanced |
| Subscription | Pending authenticated Azure subscription selection from the owner's Azure tenant |
| Location | East US proposed to minimize latency to existing US-East service dependencies; final value requires owner subscription context/policy confirmation |
| Data boundary | Existing Supabase projects remain authoritative; no database migration is part of this hosting cutover |
| Payment boundary | Existing Stripe controls remain server-side and fail closed |
| Media boundary | Existing Daily provider remains authoritative |
| Regulated activation | Florida Class D and other regulated capabilities remain independently fail closed until their real external and technical activation evidence is satisfied |

---

## 3. Components Detected

| Component | Type | Technology | Path |
|-----------|------|------------|------|
| Obserra website + Academy + APIs | SSR Web Application | Next.js 16.3.1 / React 19.2.8 / Node.js | repository root |
| Academy durable state | External managed database | Supabase PostgreSQL/RPC | external |
| FDACS regulated student records | External managed database/storage | Supabase PostgreSQL + Storage | external |
| Identity | External identity services | Supabase Auth + bounded Clerk responsibilities | external |
| Payments | External payment provider | Stripe | external |
| Live classroom media | External media provider | Daily | external |
| CI/CD | Source + automation | GitHub Actions | `.github/workflows/` |

Specialized Azure technology scan: no GitHub Copilot SDK markers detected in `package.json` or repository search; standard Azure modernization path applies.

---

## 4. Recipe Selection

**Selected:** AZD + Bicep

**Rationale:** Azure Developer CLI with Bicep provides a reproducible one-command deployment path, native environment management, GitHub CI/CD compatibility, and a simpler operating model than the current multi-project Vercel promotion/alias workflow. The application is an SSR Node/Next.js workload and maps directly to Azure Container Apps.

---

## 5. Architecture

**Stack:** Containers

### Service Mapping

| Component | Azure Service | Initial Production Configuration |
|-----------|---------------|----------------------------------|
| Next.js SSR web/API runtime | Azure Container Apps | External HTTPS ingress, min 2 replicas, max 10, HTTP autoscaling, immutable revisions |
| Container image registry | Azure Container Registry | Standard SKU, admin user disabled |
| Runtime secret store | Azure Key Vault | Standard SKU, RBAC, soft delete, purge protection |
| Central logs | Log Analytics Workspace | Production workspace |
| Application telemetry | Application Insights | Workspace-based |
| Workload identity | System-assigned Managed Identity | Least-privilege access to Key Vault and ACR |
| Release identity | GitHub Actions OIDC / Entra workload identity federation | No stored Azure password/client secret |
| Public DNS | Existing DNS provider | Moved only after Azure candidate passes exact-release smoke tests |

### Release Model

1. Merge to `main` produces one immutable container image tagged by exact Git SHA.
2. GitHub OIDC authenticates to Azure without a long-lived deployment credential.
3. Image is pushed to ACR.
4. Azure Container Apps creates a new immutable revision.
5. Startup/liveness/readiness probes run against the website liveness contract; regulated-module 503 states remain valid fail-closed states and do not masquerade as readiness.
6. Production traffic moves only to the healthy candidate revision.
7. Public `/api/health` must report Azure hosting authority and exact Git SHA before release is called live.
8. Rollback is traffic reassignment to the prior healthy Container Apps revision; no rebuild required.

### Security and Obserra EPI Controls

- Managed identity instead of application-stored Azure credentials.
- Key Vault RBAC, soft delete, purge protection, and least-privilege secret access.
- No secret values committed to GitHub, container images, or client bundles.
- Immutable image/SHA provenance and release evidence.
- Existing Supabase RLS/service-role boundaries remain unchanged.
- Existing Stripe signature/idempotency controls remain unchanged.
- Florida Class D production authorization remains fail closed.
- Health, rollback, logging, and evidence are first-class release requirements.
- DNS cutover is reversible and happens only after verified Azure candidate health.

### Simplification Boundary

The initial Azure production plane intentionally excludes AKS, Service Bus, Cosmos DB, Azure SQL, and a database migration. They are not required to host the current application and would add operational complexity without solving the current release problem.

---

## 6. Provisioning Limit Checklist

The Azure portal supplied by the owner currently shows **no resources to display**, so current resource usage in the visible tenant/subscription scope appears to be zero. Subscription-specific quota and Azure Policy validation must still run against the exact selected subscription and region before provisioning.

### Phase 1 Resource Inventory

| Resource Type | Number to Deploy | Current Visible Usage | Quota Validation State | Notes |
|---------------|------------------|-----------------------|------------------------|-------|
| Microsoft.App/managedEnvironments | 1 | 0 visible | Pending authenticated subscription/region | Container Apps Environment |
| Microsoft.App/containerApps | 1 | 0 visible | Pending authenticated subscription/region | Production Next.js runtime |
| Microsoft.ContainerRegistry/registries | 1 | 0 visible | Pending authenticated subscription/region | Immutable image registry |
| Microsoft.KeyVault/vaults | 1 | 0 visible | Pending authenticated subscription/region | Production secrets |
| Microsoft.OperationalInsights/workspaces | 1 | 0 visible | Pending authenticated subscription/region | Central logging |
| Microsoft.Insights/components | 1 | 0 visible | Pending authenticated subscription/region | Application Insights |

**Status:** Blocked only on authenticated Azure subscription + region context for policy/quota validation. No resource provisioning is authorized until that exact context is confirmed.

---

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Gather production requirements from current Obserra operating constraints
- [ ] Confirm exact Azure subscription and location
- [x] Prepare resource inventory
- [ ] Fetch subscription-specific quotas and Azure Policy constraints
- [x] Scan codebase
- [x] Select recipe
- [x] Plan architecture
- [x] Owner authorized replacement of the failing hosting/release architecture with an Azure solution aligned to Obserra EPI requirements

### Phase 2: Execution
- [ ] Research Container Apps, Key Vault, ACR, managed identity, monitoring, and OIDC implementation details
- [ ] Generate `azure.yaml`
- [ ] Generate Bicep infrastructure
- [ ] Generate production Dockerfile and `.dockerignore`
- [ ] Convert Vercel-only release authority into hosting-provider-neutral release authority
- [ ] Add Azure startup/liveness/readiness probes
- [ ] Add GitHub OIDC production deployment workflow
- [ ] Add rollback and exact-SHA production verification
- [ ] Preserve regulated fail-closed module behavior
- [ ] Update plan status to `Ready for Validation`

### Phase 3: Validation
- [ ] Invoke Azure validation workflow/skill
- [ ] Build container locally/CI
- [ ] Validate Bicep/AZD configuration
- [ ] Run unit tests, lint, typecheck, and production build
- [ ] Verify no secrets in image/repository
- [ ] Verify health contract and exact-SHA release fingerprint
- [ ] Verify rollback design
- [ ] Update plan status to `Validated`

### Phase 4: Deployment
- [ ] Provision Azure resources
- [ ] Configure GitHub OIDC federation and least-privilege RBAC
- [ ] Deploy immutable exact-SHA image
- [ ] Verify Azure candidate endpoint
- [ ] Bind custom domain only after candidate passes
- [ ] Verify `www.obserrallc.com/api/health` reports Azure production authority + exact main SHA
- [ ] Retain Vercel only as temporary rollback until Azure production acceptance is complete
- [ ] Decommission old Vercel release path only after explicit post-cutover evidence

---

## 8. Validation Proof

| Check | Command Run | Result | Timestamp |
|-------|-------------|--------|-----------|
| Pending | Pending Phase 3 | Not yet run | - |

**Validated by:** pending Azure validation phase

---

## 9. Files to Generate

| File | Purpose | Status |
|------|---------|--------|
| `.azure/deployment-plan.md` | Migration and deployment source of truth | Created |
| `azure.yaml` | AZD service configuration | Pending execution |
| `infra/main.bicep` | Azure production infrastructure | Pending execution |
| `infra/main.parameters.json` or AZD environment inputs | Non-secret deployment parameters | Pending execution |
| `Dockerfile` | Production Next.js image | Pending execution |
| `.dockerignore` | Container build boundary | Pending execution |
| `.github/workflows/azure-production-deploy.yml` | OIDC build/deploy/verify/rollback pipeline | Pending execution |

---

## 10. Current Next Step

Resolve the exact Azure subscription and approved deployment region, then execute Azure Policy/quota validation before generating or provisioning infrastructure.
