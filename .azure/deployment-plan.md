# Azure Deployment Plan

> **Status:** Ready for Validation

Generated: 2026-08-21

---

## 1. Project Overview

**Goal:** Replace the brittle Vercel production promotion/alias dependency with an Azure production hosting and delivery plane for the existing Obserra Next.js application while preserving the current Supabase, Stripe, Daily, identity, regulated-data, and fail-closed boundaries.

**Path:** Modernize Existing

**Non-negotiable release rule:** A change is not classified as fixed or production-live until the public production endpoint proves the intended hosting authority and exact Git commit SHA. Repository state, CI state, package upload, slot deployment, or platform status alone are insufficient.

---

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | Production |
| Scale | Medium; initial target includes at least 220 concurrent authenticated LMS users plus public website traffic |
| Budget | Balanced |
| Azure tenant | Obserra Executive Protection & Intelligence LLC (`5a08a33a-d2b5-491d-ac6d-32f325138143`) |
| Subscription | Azure subscription 1 (`38d660ff-611e-4f6c-ad29-70f5cf118f52`) |
| Subscription role | Owner confirmed by Azure portal |
| Location | East US (`eastus`) approved by owner |
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

**Selected:** Bicep + Azure CLI + GitHub Actions OIDC

**Rationale:** The application is one server-rendered Next.js web/API workload. Azure App Service is the lower-complexity fit because it natively provides deployment slots, staged warm-up, slot swap, rollback by reverse swap, managed identity, Key Vault references, health checks, and GitHub OIDC deployment. This removes ACR/container orchestration and eliminates the Vercel alias-promotion dependency while preserving an auditable infrastructure-as-code control plane.

---

## 5. Architecture

**Stack:** Azure App Service

### Service Mapping

| Component | Azure Service | Initial Production Configuration |
|-----------|---------------|----------------------------------|
| Next.js SSR web/API runtime | Azure App Service on Linux | Standard S1 plan, Node 22 LTS, HTTPS-only, always-on, HTTP/2, health path `/api/health` |
| Staged release environment | App Service deployment slot | `staging`; exact-SHA smoke tested before swap |
| Runtime secret store | Azure Key Vault | Standard SKU, RBAC, soft delete, purge protection |
| Workload identity | User-assigned Managed Identity | Shared by production + staging for Key Vault references |
| Central logs | Log Analytics Workspace | Production workspace |
| Application telemetry | Application Insights | Workspace-based |
| Release identity | GitHub Actions OIDC / Entra workload identity federation | No Azure password, publish profile, or client secret |
| Public DNS | Existing DNS provider | Moved only after Azure production proves exact-release health and functional smoke tests |

### Release Model

1. Merge to `main` produces one build artifact from the exact Git SHA.
2. GitHub OIDC authenticates to Azure without a long-lived Azure credential.
3. Bicep converges the production resource group and App Service configuration.
4. The exact build artifact deploys to the `staging` slot only.
5. The staging slot must return the provider-neutral website health contract with Azure App Service authority and the exact Git SHA.
6. Homepage/security smoke tests run against staging. Academy/Florida regulated modules may remain explicitly fail closed, but cannot be relabeled as ready.
7. Azure swaps `staging` into production only after the staged release passes.
8. The Azure production hostname must prove the exact SHA after swap.
9. If post-swap verification fails, the same slots are swapped again to restore the last known good release.
10. `www.obserrallc.com` remains on Vercel until the Azure production hostname also passes identity/provider/configuration acceptance; DNS cutover is a separate reversible operation.

### Security and Obserra EPI Controls

- GitHub deployment uses OIDC federation; no Azure client secret is stored.
- GitHub deployment authority is scoped to the Obserra production resource group.
- Runtime uses managed identity instead of Azure credentials in application code.
- Key Vault uses RBAC, soft delete, purge protection, and least-privilege runtime secret access.
- No secret values are committed to GitHub, build artifacts, or client bundles.
- Exact Git SHA is injected into the staged runtime and verified before/after slot swap.
- Existing Supabase RLS/service-role boundaries remain unchanged.
- Existing Stripe signature/idempotency controls remain unchanged.
- Florida Class D production authorization remains fail closed.
- Production has a native last-known-good rollback path independent of Git history or rebuilds.
- Vercel remains temporary rollback hosting until Azure production acceptance is complete.

### Simplification Boundary

The initial Azure production plane intentionally excludes AKS, Container Apps, ACR, Azure SQL, Cosmos DB, Service Bus, and database migration. None is required to host this monolithic Next.js runtime or solve the release problem.

---

## 6. Provisioning Limit and Policy Checklist

The subscription and location are confirmed. Subscription-specific Azure Policy and quota inspection cannot be performed from the current ChatGPT tool surface because no authenticated Azure Resource Manager/Quota connector is available and Azure CLI cannot authenticate from this runtime. No quota or policy result is fabricated.

The one-time Azure Cloud Shell bootstrap therefore performs the live control-plane preflight before it creates deployment authority. Infrastructure deployment remains blocked if Azure rejects provider registration, resource-group creation, Standard S1 availability, policy, RBAC, or service limits.

| Resource Type | Number to Deploy | Selected Capacity | Live Preflight |
|---------------|------------------|-------------------|----------------|
| Microsoft.Web/serverfarms | 1 | Standard S1 Linux | Must succeed in East US before deployment |
| Microsoft.Web/sites | 1 production app + 1 staging slot | Node 22 LTS | Must succeed before release workflow can run |
| Microsoft.KeyVault/vaults | 1 | Standard | Must succeed before provider secret migration |
| Microsoft.ManagedIdentity/userAssignedIdentities | 2 | GitHub release identity + runtime identity | Bootstrap/runtime deployment must succeed |
| Microsoft.OperationalInsights/workspaces | 1 | PerGB2018 | Must succeed |
| Microsoft.Insights/components | 1 | Workspace-based | Must succeed |

**Evidence rule:** the bootstrap output and first successful Bicep deployment become the authoritative subscription/region capacity evidence. A portal screenshot or source declaration alone is not treated as quota proof.

---

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Gather production requirements from current Obserra operating constraints
- [x] Confirm Azure tenant, subscription, Owner role, and East US location
- [x] Prepare resource inventory
- [x] Scan codebase
- [x] Select lower-complexity App Service deployment-slot architecture
- [x] Plan architecture
- [x] Owner approved Azure production replacement and authorized execution
- [ ] Capture live Azure policy/service-limit preflight from one-time bootstrap

### Phase 2: Execution
- [x] Research App Service, deployment slots, Key Vault, managed identity, monitoring, and OIDC patterns
- [x] Generate Bicep infrastructure
- [x] Add one-time Azure Cloud Shell bootstrap for GitHub OIDC
- [x] Convert Vercel-only release authority into hosting-provider-neutral release authority for the critical production request/identity/commerce paths
- [x] Configure Next.js standalone production output
- [x] Add GitHub OIDC staging-deploy / verify / swap / rollback workflow
- [x] Preserve regulated fail-closed module behavior
- [x] Converge generated CMMC system evidence through the governed repository generator
- [x] Update plan status to `Ready for Validation`

### Phase 3: Validation
- [ ] Run current exact-head GitHub CI to completion
- [ ] Run unit tests, lint, typecheck, and production build
- [ ] Validate Bicep syntax in an authenticated Azure/GitHub runner
- [ ] Verify no secrets in repository/build artifact
- [ ] Verify provider-neutral health contract and exact-SHA fingerprint
- [ ] Verify staged release and reverse-swap rollback design
- [ ] Update plan status to `Validated`

### Phase 4: Deployment
- [ ] Run one-time Azure bootstrap under Owner session
- [ ] Provision App Service/slot/Key Vault/monitoring/runtime identity
- [ ] Deploy exact-SHA build to staging
- [ ] Verify staging endpoint
- [ ] Swap staging to Azure production
- [ ] Verify Azure production exact SHA
- [ ] Migrate required live provider values into Key Vault without exposing them in chat/GitHub
- [ ] Re-run full identity/commerce/FDACS acceptance
- [ ] Bind custom domain only after Azure production acceptance passes
- [ ] Verify `www.obserrallc.com/api/health` reports Azure production authority + exact main SHA
- [ ] Retain Vercel only as temporary rollback until Azure production acceptance is complete
- [ ] Decommission old Vercel release path only after explicit post-cutover evidence

---

## 8. Validation Proof

| Check | Command Run | Result | Timestamp |
|-------|-------------|--------|-----------|
| Governed CMMC regeneration | `npm run generate:cmmc-system-evidence` then `npm run verify:cmmc-system-evidence` in one-shot GitHub runner | Generated and committed by repository workflow; final exact-head CI pending | 2026-08-21 |
| Azure production-plane contract | `node --test` through repository CI | Pending exact-head CI | 2026-08-21 |
| Florida Class D Gates | repository workflow | Pending exact-head CI after provider-neutral health correction | 2026-08-21 |

**Validated by:** pending exact-head repository CI and Azure control-plane validation

---

## 9. Files Generated

| File | Purpose | Status |
|------|---------|--------|
| `.azure/deployment-plan.md` | Migration and deployment source of truth | Ready for Validation |
| `infra/main.bicep` | App Service, slot, Key Vault, monitoring, runtime identity | Generated |
| `scripts/azure-bootstrap-production.sh` | One-time subscription/provider/RBAC/OIDC bootstrap | Generated |
| `.github/workflows/azure-production-deploy.yml` | OIDC build, staging deploy, verify, swap, rollback | Generated |
| `app/api/health/route.ts` | Provider-neutral exact-release health contract | Generated |
| `lib/runtime-environment.ts` | Provider-neutral production/preview authority | Generated |
| `next.config.ts` | Standalone Azure-compatible production build | Updated |

---

## 10. Current Next Step

Complete exact-head GitHub CI. Do not merge while any required source gate is red. After source validation is green, merge immediately and run the one-time Azure Cloud Shell bootstrap to establish GitHub OIDC. No DNS or Vercel production routing changes occur during this phase.
