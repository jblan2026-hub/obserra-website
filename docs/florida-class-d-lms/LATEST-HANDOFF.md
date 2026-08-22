# OBSERRA Production Restart Authority and Detailed Handoff

Effective checkpoint: **2026-08-22 12:29 ET / 16:29 UTC**

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Canonical public site: `https://www.obserrallc.com`

Production branch: `main`

Authoritative roadmap: `plan/architecture-obserra-production-readiness-1.md`

This file supersedes the prior Aug. 19 restart snapshot as the current continuation authority. Historical handoffs remain preserved in Git history and the existing gate-specific documentation. This file records the exact current source, deployment, Academy, Florida Class D, database, payment, security, rollback, and next-action state so work can resume without reconstructing context.

---

## 1. Non-negotiable operating rules

1. **Live evidence beats source claims.** A ticket, PR, green workflow, READY preview, deployment object, or commit does not prove production. Production completion requires the intended canonical host to serve the intended exact Git SHA and expected runtime behavior.
2. **No mockups, placeholders, fake provider success, fake payments, fake database state, fake Daily rooms, fake regulatory evidence, or simulated production completion.** Demo mode must remain clearly separate from live mode.
3. **Do not weaken fail-closed controls to make a test green.** Identity, authorization, RLS, origin validation, payment fulfillment, regulated credit, attendance, completion, licensing, LIAS, certificates, evidence, and production activation stay fail closed when dependencies are unavailable or unverified.
4. **Use direct control-plane evidence.** GitHub is authoritative for repository/CI state. Vercel is authoritative for deployment/runtime/routing state. Supabase is authoritative for Academy/FDACS data-plane state when direct database verification is required.
5. **Use the Obserra EPI advanced capability skills as the minimum implementation baseline.** Stack complementary backend, security, IAM, secrets, API integration, testing, reliability, observability, deployment, and verification skills rather than applying a single narrow lens.
6. **No secret values in Git, logs, chat, screenshots, or handoffs.** Key names and validation states may be recorded; credentials, service-role values, Stripe secrets, Daily keys, encryption keys, license numbers, and private learner data may not.
7. **Do not invent a DI or DS license number.** Regulated production stays blocked until the exact issued credential and authorization evidence exist in an authoritative source.
8. **Do not mark HA, backup, RTO, RPO, or failover status verified without retained evidence.**
9. **Preserve rollback.** Do not remove the currently working public deployment until the new exact-SHA deployment has been promoted and canonical smoke tests pass.
10. **If a control cannot be verified, record it as unresolved rather than assuming it is complete.**

---

## 2. Exact GitHub source authority

### 2.1 Current `main`

Current GitHub `main`:

`560367a63e22ccd7c268817f89757f5e70d32319`

Commit:

`fix: replace Academy Vercel database secret with workload identity (#196)`

GitHub reports the merge commit signature as **verified / valid**.

PR #196:

- title: `fix: replace Academy Vercel database secret with workload identity`
- state: **merged**
- merged at: `2026-08-22T16:21:19Z`
- PR head: `8605cdce2cfb9f9dddf78dbeb57bd4e803cdfd8d`
- merge SHA: `560367a63e22ccd7c268817f89757f5e70d32319`
- changed files: 6
- additions: 418
- deletions: 23

Changed files in PR #196:

- `infra/main.bicep`
- `lib/academy-persistence.ts`
- `lib/supabase-project-origin.ts`
- `supabase/config.toml`
- `supabase/functions/academy-persistence-gateway/index.ts`
- `test/academy-workload-identity-persistence.test.mjs`

### 2.2 Exact PR validation

All primary exact-head workflows on PR #196 head `8605cdce...` completed successfully:

- **Azure IaC Validation** run `32584337076` — SUCCESS
- **CodeQL Advanced** run `32584337071` — SUCCESS
- **Florida Class D LMS Gates** run `32584337081` — SUCCESS
- **Website CI** run `32584337070` — SUCCESS

The Florida workflow failure encountered earlier on Gate 35 was not suppressed. It correctly detected the hard-coded Academy Supabase hostname. The implementation was changed so Academy provider origin is runtime-bound and validated through a generic project-ref/origin contract. The final head then passed the full regulated workflow.

### 2.3 Branch governance

The GitHub branch API currently reports `main` as **not protected**. Required status-check enforcement is not configured at the branch level. The current merge itself is verified, but final production governance still needs a protected-branch/ruleset control if the repository is to rely on branch policy rather than operator discipline.

---

## 3. Exact Vercel deployment and public-domain state

### 3.1 Canonical Vercel project

Canonical project:

- project name: `obserra-website-live`
- project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`

The earlier cross-project routing defect is resolved at the **project** level: current public `/api/health` reports the expected and observed project as the canonical `prj_lxTK...`. Public traffic is no longer reporting the old `obserra-website-lcn2` project as authority.

### 3.2 Latest READY production-target deployment

Latest Vercel deployment for current `main`:

- deployment ID: `dpl_3M1XorH66KxxZCH9N7Dxx7fLEjZg`
- URL: `https://obserra-website-live-32xahyo2d-obserra.vercel.app`
- state: **READY**
- target: **production**
- Git ref: `main`
- Git SHA: `560367a63e22ccd7c268817f89757f5e70d32319`
- GitHub commit verification in Vercel metadata: **verified**
- rollback candidate: **true**

Direct candidate `/api/health` at 16:25:49 UTC returned HTTP 200 and proved:

- service: `obserra-website`
- status: `live`
- contract: `website-liveness-v1`
- expected hosting provider: `vercel`
- observed provider: `vercel`
- deployment ID: `dpl_3M1XorH66KxxZCH9N7Dxx7fLEjZg`
- Git SHA: `560367a63e22ccd7c268817f89757f5e70d32319`
- expected project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- observed project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- hosting authority: `verified`
- routing authority: `verified`

This proves the candidate deployment itself is real and exact-SHA healthy.

### 3.3 Canonical public domain is not yet at the new SHA

Current public `https://www.obserrallc.com/api/health` at 16:26:03 UTC returned HTTP 200 but is still serving:

- deployment ID: `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa`
- Git SHA: `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`
- project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- routing authority: `verified`

Therefore:

- canonical **project routing is correct**;
- canonical **release SHA parity is not current** after PR #196;
- the custom production host has not advanced from `dpl_Eepy... / 1d9ad1f...` to `dpl_3M1X... / 560367a...`.

Do **not** claim PR #196 is live on the customer-facing host until `www.obserrallc.com/api/health` reports `560367a...` and `dpl_3M1X...` (or a later intentionally promoted exact-SHA deployment).

The apex `https://obserrallc.com/api/health` currently returns HTTP 308 and redirects to the `www` canonical host. The `www` host remains the production authority.

### 3.4 Release cutover priority

The immediate release-control task is not another project migration. It is a **same-project production alias/promotion** from the currently public old deployment to the already-healthy current-main deployment after candidate checks are satisfied.

Do not delete or invalidate `dpl_Eepy...` before the new canonical release is proven; it remains the current rollback/public-serving point.

---

## 4. Academy architecture after PR #196

### 4.1 Purpose of the change

PR #196 removes the requirement to hold a long-lived Academy Supabase administrator credential in Vercel production.

Intended production trust path:

`Vercel production workload identity (OIDC)`

→ `Supabase Edge Function: academy-persistence-gateway`

→ existing Academy RPC allowlist

→ service-role authority retained inside the Supabase boundary

The Vercel production code explicitly refuses to silently fall back to a long-lived Academy service-role credential.

### 4.2 Workload-identity controls implemented in source

The source-controlled gateway verifies a tightly bounded workload identity rather than accepting generic Vercel identity. Controls include:

- RS256 JWT verification;
- exact issuer;
- exact audience;
- exact Vercel owner/team ID;
- exact Vercel project ID/name;
- exact production environment;
- exact subject for `obserra-website-live:production`;
- token lifetime/age checks;
- an explicit Academy RPC operation allowlist;
- 64 KiB request-body limit;
- no browser CORS exposure;
- no anonymous-key fallback;
- no opening of existing Academy RPCs to browser roles.

`supabase/config.toml` declares the custom function auth mode because the function performs its own Vercel OIDC verification.

### 4.3 Direct/self-hosted fallback

Azure/self-hosted remains supported through a server-side direct credential path. Modern `sb_secret_...` Supabase secret keys are treated as API keys and are no longer incorrectly sent as Bearer JWTs. Legacy `service_role` JWTs retain Bearer compatibility only where appropriate.

Azure IaC continues to source sensitive runtime values through Key Vault references.

### 4.4 Academy persistence configuration contract

Current source requires:

- `OBSERRA_ACADEMY_SUPABASE_URL`
- `OBSERRA_ACADEMY_SUPABASE_PROJECT_REF`
- Vercel production runtime identity through `VERCEL_OIDC_TOKEN`
- `OBSERRA_ACADEMY_EMAIL_HASH_SECRET` for purchaser HMAC

Vercel production uses workload mode only after URL/project-ref validation and OIDC-token validation succeed.

---

## 5. Academy runtime status — exact current result

Direct request to the latest current-main candidate:

`GET https://obserra-website-live-32xahyo2d-obserra.vercel.app/api/academy/commerce-health`

Result: **HTTP 503 Service Unavailable**.

Current response contract:

- `contract = academy-commerce-health-v1`
- `operational = false`
- `identity = available`
- `identityEnvironment = live`
- `purchaserIdentityHashing = available`
- `durableStorage = unavailable`
- `storageSchema = null`
- `paymentProvider = unavailable`
- Stripe environment = `unavailable`
- provider connected = `false`
- charges enabled = `false`
- webhook verification = `unavailable`

The public `www.obserrallc.com` host currently returns the same high-level Academy commerce result, but remember that host is still serving older Git SHA `1d9ad1f...`.

### 5.1 What is proven fixed

- Academy learner identity health is live/available.
- Purchaser identity HMAC configuration is now available.
- The new workload-identity persistence architecture is merged, verified in CI, source-controlled, and built into a READY exact-main Vercel deployment.
- The Academy Supabase durable schema was previously directly verified operational as `academy-durable-state-v2`.
- Existing Academy RPCs remain server/service-role-only; they were not opened to browser roles to make the new gateway work.

### 5.2 What is not yet proven

End-to-end:

`Vercel OIDC → Supabase Edge gateway → academy_storage_health()`

is **not yet proven live**.

Immediately after the candidate commerce-health request, a Vercel runtime-log query found no Academy storage-health error event. In current source, the route only logs a storage-health exception after `academyPersistenceConfigured()` returns true and `academyStorageHealth()` is attempted. The strongest current evidence therefore points to a configuration acceptance failure before the RPC request path, involving one of:

- Academy URL/project-ref binding validation;
- production `VERCEL_OIDC_TOKEN` availability/format;
- or another pre-RPC configuration condition.

This is a narrowed diagnosis, not a completed root-cause determination. Do not claim the OIDC gateway is live until an actual `academy_storage_health()` response is observed through the Vercel workload path.

### 5.3 Academy payment blockers

Academy payment remains fail closed because the current candidate reports no accepted Academy Stripe restricted key and no webhook secret/provider verification.

Required provider-side/runtime completion still includes:

- live `ACADEMY_STRIPE_SECRET_KEY` using the governed restricted-key model;
- `ACADEMY_STRIPE_WEBHOOK_SECRET`;
- Stripe account connectivity;
- `charges_enabled = true` where required for the intended account;
- required webhook event subscriptions;
- live checkout/redeem/fulfillment verification after durable storage is operational.

Do not substitute the generic shared Stripe secret for Academy commerce.

---

## 6. Academy Supabase durable-state baseline

Last direct Academy Supabase verification in this production workstream established:

Project:

- name: `Obserra Academy`
- project ref: `nwxnyqlyzyufgoadtqxs`
- state: `ACTIVE_HEALTHY`

The real Academy RPC surface exists, including:

- `academy_storage_health`
- `academy_aggregate_metrics`
- `academy_get_learner_state`
- `academy_reserve_checkout_attempt`
- `academy_bind_checkout_attempt`
- `academy_record_checkout_session`
- `academy_record_paid_checkout`
- `academy_record_payment_reversal`
- `academy_claim_paid_checkout`
- course/progress/assessment/certificate operations

Direct `academy_storage_health()` previously returned:

- `operational = true`
- `schemaVersion = academy-durable-state-v2`
- `reversalGuard = enabled`
- `checkoutSerialization = purchaser-course-entitlement-revision-v1`

Therefore the current Vercel `durableStorage = unavailable` state must not be misdiagnosed as “Academy database missing.” The durable database schema is real; the unresolved boundary is Vercel-to-Supabase runtime access/configuration.

---

## 7. Florida Class D runtime — exact current result

### 7.1 Latest current-main candidate

Candidate liveness:

`GET /api/florida-class-d/health/live` → **HTTP 200**

Payload:

`{"service":"florida-class-d-lms","status":"live"}`

Candidate readiness:

`GET /api/florida-class-d/health/ready` → **HTTP 503**

Payload:

`{"service":"florida-class-d-lms","status":"not_ready"}`

Header:

`Retry-After: 60`

The public canonical host currently reports the same live/not-ready pattern, but the public host is still on older Git SHA `1d9ad1f...`.

### 7.2 Exact latest candidate technical failure keys

Vercel runtime logs for `dpl_3M1X...` at 16:26:38 UTC report these sanitized technical failures:

1. `stripe_identity_webhook`
2. `supabase_service_role`
3. `daily_api_key`
4. `di_license_number`

Important update: **`documents_bucket` is no longer in the failure list.** The required completion-document bucket and its runtime binding now pass the readiness inventory.

Earlier environment-name auditing indicated that FDACS Supabase service-role and Daily key names existed in the Vercel estate, but the latest runtime still rejects those controls. Therefore **presence is not acceptance**. Treat `supabase_service_role` and `daily_api_key` as unresolved format/value/target/runtime-binding failures until readiness stops flagging them.

Do not expose or copy those credential values into Git or the handoff.

### 7.3 Exact latest HA/evidence failure keys

Current candidate also reports these HA failures:

- `ha:OBSERRA_FDACS_HA_EDGE_DNS_STATUS`
- `ha:OBSERRA_FDACS_HA_APPLICATION_STATUS`
- `ha:OBSERRA_FDACS_HA_IDENTITY_STATUS`
- `ha:OBSERRA_FDACS_HA_DATABASE_STATUS`
- `ha:OBSERRA_FDACS_HA_MEDIA_STATUS`
- `ha:OBSERRA_FDACS_HA_DOCUMENT_STORAGE_STATUS`
- `ha:OBSERRA_FDACS_HA_COMMERCE_STATUS`
- `ha:OBSERRA_FDACS_HA_OBSERVABILITY_STATUS`
- `ha:OBSERRA_FDACS_HA_BACKUP_RESTORE_STATUS`
- `ha:OBSERRA_FDACS_HA_FAILOVER_EXERCISE_STATUS`
- `ha:evidence_manifest`
- `ha:rto`
- `ha:rpo`
- `ha:recent_failover_test`

These must remain unresolved until authentic evidence exists. Do not set “verified” flags merely to make readiness return 200.

### 7.4 Licensing boundary

`di_license_number` remains a hard runtime failure. The exact number has not been established in the connected authoritative production configuration during this workstream. Do not infer it from owner statements or memory.

Florida Class D public regulated enrollment/payment/credit remains fail closed until the applicable external authorization, exact issued license state, runtime readiness, production database/evidence, and owner activation conditions pass.

---

## 8. FDACS Supabase production baseline

Last direct FDACS Supabase verification established:

Project:

- name: `OBSERRA FDACS Student Records Production`
- project ref: `ggkxgjhsbgbifiqrhavr`
- region: `us-east-1`
- state: `ACTIVE_HEALTHY`

Direct regulated-boundary health established:

- 64 FDACS tables in the regulated set;
- browser table privileges: 0;
- forced RLS enforced on the regulated table boundary;
- classification: regulated student PII, non-CUI;
- minimum retention: 2 years;
- operational retention: 3 years;
- production runtime authorization: false;
- CUI processing: unauthorized;
- identity-document-image processing: unauthorized.

The real regulated RPC surface includes attendance, daily identity, instructor attestation, presence challenges, live sessions, polls, text-screen timing, exam/retest, LIAS, completion documents, investigator export, protected artifacts, archival/retention, production authorization, audit-chain verification, quality/CAPA, and cohort scheduling functions.

### 8.1 Completion-document bucket repair

The required bucket was previously missing and was created in the real FDACS Supabase project:

`fdacs-class-d-completion-documents`

Verified contract:

- private: `true` in the sense that public access is disabled (`public = false`);
- size limit: 10 MiB;
- allowed MIME type: `application/pdf`;
- server-side controlled use;
- no ordinary browser storage policy was added to bypass the protected service boundary.

The latest candidate readiness no longer reports `documents_bucket`, which is the runtime proof that this repair and binding are now accepted by the readiness contract.

---

## 9. Florida Class D implementation/release controls that remain mandatory

The source implementation contains the regulated 5-day / 40-hour architecture, 18 curriculum areas, live instruction, presence/attendance evidence, Daily media integration, scheduling, polls, make-up workflows, protected recorded make-up, 170-question exam controls, remediation/retest, completion review, LIAS handoff, completion documents, audit/inspection records, quality/CAPA, retention, database promotion gates, runtime readiness, mutation boundaries, acceptance evidence, resilience/observability, HA evidence integrity, and owner UAT controls.

Those source capabilities do not equal production authorization.

Final production activation still requires, at minimum:

- technical readiness failures cleared;
- exact licensing state verified;
- approved exam-bank authority where applicable;
- production database-promotion evidence;
- exact-candidate UAT evidence;
- secure media/provider readiness;
- identity verification provider readiness;
- completion-document storage readiness;
- LIAS procedure/evidence;
- authentic HA/backup/failover evidence;
- measured RTO/RPO within governed thresholds;
- security acceptance;
- rollback readiness;
- owner authorization;
- any required external regulatory authorization.

---

## 10. Payment and identity boundaries

### Academy

- learner/runtime identity: Supabase;
- Academy identity health: available/live;
- Academy purchaser HMAC: available;
- Academy durable storage path: not yet operational through Vercel workload identity;
- Academy Stripe: unavailable;
- Academy webhook: unavailable;
- Academy commerce: HTTP 503 fail closed.

### Applications

Applications identity remains on its separately governed application identity boundary. Do not change it merely to align with Academy unless a dedicated application migration is approved and tested.

### Florida Class D

The current readiness control still flags Stripe Identity webhook configuration. Regulated learner activation remains fail closed. Do not use payment or identity provider configuration as a substitute for licensing authorization.

---

## 11. Security controls and current residual risks

### Controls currently proven in the candidate

- exact project/SHA/deployment health identity;
- HSTS with preload;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Cross-Origin-Opener-Policy: same-origin`;
- `Cross-Origin-Resource-Policy: same-origin`;
- `Access-Control-Allow-Origin: https://www.obserrallc.com` rather than wildcard;
- no-store health/commerce/regulated readiness responses;
- protected-route noindex behavior;
- fail-closed Academy commerce;
- fail-closed Florida readiness;
- service-only Academy RPC boundary;
- Vercel-production Academy service-role fallback prohibited;
- modern Supabase secret-key header handling corrected;
- regulated FDACS browser table privilege boundary remains closed.

### Residual risks/open controls

- canonical `www` domain is one release behind current `main`;
- `main` branch is not protected by a GitHub ruleset/required checks;
- Academy workload identity is not yet proven end-to-end;
- Academy live Stripe/webhook configuration is absent/unaccepted;
- Florida readiness still rejects Stripe Identity webhook, Supabase service-role, Daily API key, and DI license number;
- HA/backup/RTO/RPO/failover evidence is incomplete;
- CSP still contains `unsafe-inline` and should not be declared final hardened state without further nonce/hash migration analysis;
- production activation and regulatory authorization remain intentionally fail closed.

---

## 12. Rollback points

### Public-serving rollback/current authority

Current public `www` deployment:

`dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa`

Current public Git SHA:

`1d9ad1f042f527552d1e65763b0bc1f26ba0f829`

Do not remove this deployment until the new exact-main deployment is promoted and verified on the canonical host.

### Current-main candidate

Candidate:

`dpl_3M1XorH66KxxZCH9N7Dxx7fLEjZg`

Candidate Git SHA:

`560367a63e22ccd7c268817f89757f5e70d32319`

Vercel marks it as a rollback candidate and READY.

### Database rollback discipline

No destructive production database change is authorized merely by this handoff. Preserve regulated data and evidence before any database rollback, relocation, migration, or cleanup. Use the existing controlled migration/promotion and evidence gates.

---

## 13. Priority continuation sequence

### P0 — promote exact current `main` to the canonical host

1. Keep `dpl_Eepy...` intact as current rollback/public point.
2. Reconfirm `dpl_3M1X...` exact health and candidate application smoke tests.
3. Use the governed Vercel release path to promote the exact current-main deployment to the canonical production host.
4. Verify `https://www.obserrallc.com/api/health` reports:
   - canonical project `prj_lxTK...`;
   - exact intended deployment;
   - exact intended Git SHA `560367a...` or a later intentionally approved main SHA;
   - `authority = verified`;
   - `verified = true`.
5. Re-test Academy, Florida live/ready, public home, protected routes, and required application surfaces on the canonical host.
6. Roll back to `dpl_Eepy...` if canonical smoke tests fail.

### P1 — close Academy workload-identity persistence

1. Add or use a sanitized production diagnostic that distinguishes URL/project-ref validation from OIDC-token availability without emitting secret values or token contents.
2. Prove `academyPersistenceConfigured()` succeeds in Vercel production.
3. Prove the Edge gateway accepts the exact Vercel production identity.
4. Prove `academy_storage_health()` returns `academy-durable-state-v2` through that gateway.
5. Keep service-role-only RPC ACLs intact.
6. Do not reintroduce a long-lived Academy service-role credential into Vercel production as a shortcut.

### P1 — close Academy Stripe readiness

1. Create/verify the governed live Academy restricted Stripe key.
2. Verify the dedicated Academy webhook secret and required event subscriptions.
3. Verify account connectivity and charge capability.
4. Re-run `/api/academy/commerce-health` until all real dependencies are operational.
5. Test authenticated and guest-email checkout, idempotent webhook fulfillment, claim flow, refund/dispute reversal, and no-duplicate-payment behavior using real provider test/live boundaries as authorized.

### P1 — close Florida technical readiness

Resolve and re-test exactly:

- `stripe_identity_webhook`;
- `supabase_service_role`;
- `daily_api_key`;
- `di_license_number`.

For `supabase_service_role` and `daily_api_key`, verify acceptance/format/runtime targeting rather than merely variable-name presence.

### P2 — produce real Florida HA/recovery evidence

Produce, retain, hash, and bind authentic evidence for all current HA keys, including edge/DNS, application, identity, database, media, document storage, commerce, observability, backup/restore, failover exercise, RTO, RPO, manifest, and recent failover test.

Do not fabricate verified status.

### P2 — harden governance

- enable appropriate GitHub branch/ruleset protections;
- preserve signed/verified release path;
- continue deterministic evidence generation;
- harden CSP where technically compatible;
- keep regulated production authorization false until final conditions pass.

---

## 14. Verification commands/endpoints for the next operator

Always compare repository source authority and live authority separately.

GitHub:

- inspect `main` SHA and commit verification;
- inspect relevant PR exact-head workflow runs;
- do not infer live state from GitHub alone.

Vercel candidate health:

`https://obserra-website-live-32xahyo2d-obserra.vercel.app/api/health`

Canonical public health:

`https://www.obserrallc.com/api/health`

Academy commerce health:

`/api/academy/commerce-health`

Florida liveness:

`/api/florida-class-d/health/live`

Florida readiness:

`/api/florida-class-d/health/ready`

When Florida readiness is 503, use Vercel runtime logs for the sanitized message:

`Florida Class D readiness not ready`

Do not expand the public readiness payload with secret/configuration details.

---

## 15. Current completion matrix

| Area | Current status | Evidence level |
|---|---|---|
| GitHub `main` | `560367a...`, verified merge | PASS SOURCE |
| PR #196 CI | Azure IaC, CodeQL, Florida, Website CI all success | PASS SOURCE |
| Canonical Vercel project | `prj_lxTK...` | PASS LIVE |
| Latest main Vercel deployment | `dpl_3M1X...`, READY, exact SHA | PASS CANDIDATE |
| `www` exact-SHA parity | still `dpl_Eepy... / 1d9ad1f...` | OPEN / RELEASE DRIFT |
| Academy identity | available/live | PASS RUNTIME |
| Academy purchaser hash | available | PASS RUNTIME |
| Academy durable DB schema | v2 operational in Supabase | PASS BACKEND |
| Academy Vercel→gateway persistence | not yet operational | OPEN |
| Academy Stripe | unavailable | OPEN |
| Academy webhook | unavailable | OPEN |
| Florida liveness | 200/live | PASS RUNTIME |
| Florida readiness | 503/not_ready | FAIL CLOSED AS DESIGNED |
| FDACS documents bucket | accepted; no longer failure key | PASS RUNTIME |
| FDACS Stripe Identity webhook | failure key | OPEN |
| FDACS Supabase service role | failure key | OPEN |
| FDACS Daily API key | failure key | OPEN |
| DI license number | failure key | OPEN / EXTERNAL EVIDENCE |
| Florida HA evidence | 14 current failure keys | OPEN |
| Regulated production authorization | false | FAIL CLOSED AS DESIGNED |
| GitHub branch protection | disabled/not protected | GOVERNANCE OPEN |

---

## 16. Restart instruction

On any context reset:

1. Read this file first.
2. Read `plan/architecture-obserra-production-readiness-1.md` second.
3. Verify current GitHub `main` SHA and signature.
4. Verify current Vercel latest-main deployment and `www.obserrallc.com/api/health` separately.
5. If they differ, do not call current source live.
6. Verify Academy commerce health and Florida live/ready health.
7. Pull sanitized runtime failure keys before changing production configuration.
8. Use the Obserra EPI advanced capability skills for the subsystem being changed.
9. Make only evidence-backed, reversible changes.
10. Update this handoff after every material merge, production promotion, provider-binding change, database promotion, regulated authorization change, or blocker resolution.

**Current immediate objective:** promote the verified current-main Vercel deployment to the canonical `www` host without losing rollback, then close the Academy workload-identity runtime boundary and the four remaining Florida technical readiness failures. No mockups, no placeholders, no fabricated evidence, and no weakening of fail-closed controls.
