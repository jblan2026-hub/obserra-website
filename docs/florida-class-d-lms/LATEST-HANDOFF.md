# OBSERRA Production Restart Authority and Detailed Handoff

Effective checkpoint: **2026-08-22 12:36 ET / 16:36 UTC**

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Canonical public site: `https://www.obserrallc.com`

Production branch: `main`

Authoritative roadmap: `plan/architecture-obserra-production-readiness-1.md`

This document is the current restart authority for the OBSERRA public website, Obserra EPI Academy, Obserra EPI Applications website integration, Florida Class D LMS, production identity, payments, Supabase persistence, Vercel deployment, regulated readiness, security, rollback, and release control.

Historical handoffs remain preserved in Git history. This file intentionally distinguishes **repository HEAD**, **application-changing source authority**, **Vercel deployment authority**, and **canonical public-domain authority** so a later documentation-only commit does not get misrepresented as a new application behavior baseline.

---

## 1. Non-negotiable operating rules

1. **Live evidence beats source claims.** A ticket, PR, green workflow, READY preview, deployment object, or commit does not prove production. A production claim requires the intended canonical host to serve the intended approved Git SHA and expected runtime behavior.
2. **No mockups, placeholders, fake provider success, fake payments, fake database state, fake Daily rooms, fake regulatory evidence, or simulated production completion.** Demo mode must remain clearly separate from live mode.
3. **Do not weaken fail-closed controls to make a test green.** Identity, authorization, RLS, origin validation, payment fulfillment, regulated credit, attendance, completion, licensing, LIAS, certificates, evidence, and production activation remain fail closed when dependencies are unavailable or unverified.
4. **Use direct control-plane evidence.** GitHub is authoritative for repository/CI state. Vercel is authoritative for deployment/runtime/routing state. Supabase is authoritative for Academy/FDACS data-plane state when direct database verification is required.
5. **Use the Obserra EPI advanced capability skills as the minimum implementation baseline.** Stack complementary backend, security, IAM, secrets, API integration, testing, reliability, observability, deployment, and verification skills rather than applying a single narrow lens.
6. **No secret values in Git, logs, chat, screenshots, or handoffs.** Key names and validation states may be recorded. Credentials, service-role values, Stripe secrets, Daily keys, encryption keys, private learner data, and license numbers must not be exposed.
7. **Do not invent a DI or DS license number.** Regulated production remains blocked until the exact issued credential and authorization evidence exist in an authoritative connected source or approved production configuration.
8. **Do not mark HA, backup, RTO, RPO, or failover status verified without authentic retained evidence.**
9. **Preserve rollback.** Do not remove the currently working public deployment until the new approved deployment has been promoted and canonical smoke tests pass.
10. **If a control cannot be verified, record it as unresolved rather than assuming completion.**

---

## 2. Source authority: repository HEAD versus application behavior baseline

### 2.1 Dynamic repository HEAD rule

Always re-read the GitHub `main` branch before starting work. Do not copy a SHA from this handoff and assume it is still repository HEAD.

At the initial publication of this Aug. 22 handoff, PR #198 produced verified GitHub merge:

`d401acaf44870593f5744407a93720e09d71c384`

Commit:

`docs(handoff): refresh Aug 22 production restart authority (#198)`

GitHub reported that merge as **verified / valid**. It is documentation-only and does not change application runtime behavior.

This file may itself be advanced by later documentation-only handoff corrections. Such a documentation-only merge must **not** replace the application-changing source authority below unless application/runtime files actually changed.

### 2.2 Application-changing source authority at this checkpoint

The last verified application-changing merge is PR #196:

`560367a63e22ccd7c268817f89757f5e70d32319`

Commit:

`fix: replace Academy Vercel database secret with workload identity (#196)`

PR #196 facts:

- state: **merged**
- merged at: `2026-08-22T16:21:19Z`
- PR head: `8605cdce2cfb9f9dddf78dbeb57bd4e803cdfd8d`
- merge SHA: `560367a63e22ccd7c268817f89757f5e70d32319`
- changed files: 6
- additions: 418
- deletions: 23

Changed files:

- `infra/main.bicep`
- `lib/academy-persistence.ts`
- `lib/supabase-project-origin.ts`
- `supabase/config.toml`
- `supabase/functions/academy-persistence-gateway/index.ts`
- `test/academy-workload-identity-persistence.test.mjs`

### 2.3 Exact PR #196 validation

All primary exact-head workflows on PR #196 head `8605cdce...` completed successfully:

- **Azure IaC Validation** run `32584337076` — SUCCESS
- **CodeQL Advanced** run `32584337071` — SUCCESS
- **Florida Class D LMS Gates** run `32584337081` — SUCCESS
- **Website CI** run `32584337070` — SUCCESS

An earlier Florida Gate 35 failure was not suppressed. It correctly detected a hard-coded Academy Supabase hostname. The implementation was changed so Academy provider origin is runtime-bound and validated through a generic project-ref/origin contract. The final PR head then passed Gate 35 and the full regulated workflow.

### 2.4 Handoff PR #198 validation

The detailed handoff itself was validated before merge:

- Website CI run `32584958401` — SUCCESS
- Florida Class D LMS Gates run `32584958408` — SUCCESS
- CodeQL Advanced run `32584958403` — SUCCESS for JavaScript/TypeScript and GitHub Actions analysis

PR #198 merged as verified GitHub merge `d401acaf...`.

### 2.5 Branch governance

At this checkpoint, GitHub reports `main` as **not protected** and required status-check enforcement as off at the branch-policy level.

The verified merge path is functioning, but repository governance remains incomplete until an appropriate branch/ruleset policy enforces the intended review/status/signature controls rather than relying only on operator discipline.

---

## 3. Vercel deployment and canonical-domain authority

### 3.1 Canonical Vercel project

Canonical project:

- name: `obserra-website-live`
- project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`

The earlier cross-project routing defect is resolved at the **project** level. Public `/api/health` now reports the expected and observed project as the canonical `prj_lxTK...`; public traffic is no longer reporting `obserra-website-lcn2` as production authority.

### 3.2 Verified application deployment for PR #196

The PR #196 application-changing source baseline produced:

- deployment ID: `dpl_3M1XorH66KxxZCH9N7Dxx7fLEjZg`
- URL: `https://obserra-website-live-32xahyo2d-obserra.vercel.app`
- state: **READY**
- target: **production**
- Git SHA: `560367a63e22ccd7c268817f89757f5e70d32319`
- Vercel metadata Git verification: **verified**
- rollback candidate: **true**

Direct `/api/health` returned HTTP 200 and proved:

- service `obserra-website`
- status `live`
- contract `website-liveness-v1`
- deployment `dpl_3M1X...`
- Git SHA `560367a...`
- expected/observed project `prj_lxTK...`
- hosting authority `verified`
- routing authority `verified`

This proves the PR #196 application deployment is real and exact-SHA healthy.

### 3.3 Verified repository deployment after handoff merge

The documentation-only PR #198 merge also auto-built on Vercel:

- deployment ID: `dpl_B3mQAX2kcShiS932sNHp5znUUV8m`
- URL: `https://obserra-website-live-fo0jvceeq-obserra.vercel.app`
- state: **READY**
- target: **production**
- Git SHA: `d401acaf44870593f5744407a93720e09d71c384`
- Vercel metadata Git verification: **verified**
- rollback candidate: **true**

Direct `/api/health` at 16:36 UTC returned HTTP 200 and exact authority:

- deployment `dpl_B3mQAX...`
- Git SHA `d401acaf...`
- canonical project `prj_lxTK...`
- hosting authority `verified`
- routing authority `verified`

Because PR #198 is documentation-only, its application behavior is inherited from the PR #196 application baseline. Future documentation-only commits may similarly create newer repository deployments without changing application behavior.

### 3.4 Canonical public domain is still on older deployment

Direct canonical request at 16:36 UTC:

`GET https://www.obserrallc.com/api/health`

returned HTTP 200 but still serves:

- deployment ID: `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa`
- Git SHA: `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`
- project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- routing authority: `verified`

Therefore:

- canonical **project routing is correct**;
- canonical **release SHA parity is not current**;
- newer READY production-target deployments exist but `www.obserrallc.com` has not advanced to them.

The apex `https://obserrallc.com` redirects to the `www` canonical host. The `www` host remains the customer-facing authority.

Do not call PR #196 or PR #198 live on the canonical host until `www.obserrallc.com/api/health` reports the intentionally promoted current approved deployment SHA.

### 3.5 Promotion rule

The immediate release-control task is a **same-project production promotion/alias update**, not another project migration.

When performing promotion:

1. re-read GitHub `main`;
2. classify any commits after PR #196 as application-changing versus docs/evidence-only;
3. select the newest intentionally approved, verified READY deployment whose tree contains the PR #196 application changes;
4. preserve `dpl_Eepy...` until canonical smoke tests pass;
5. promote through the governed Vercel release path;
6. verify the canonical host reports the exact promoted deployment/SHA;
7. smoke-test public, Academy, Florida, protected, and application integration surfaces;
8. roll back if any release-critical check fails.

---

## 4. Academy architecture after PR #196

### 4.1 Purpose

PR #196 removes the requirement to keep a long-lived Academy Supabase administrator credential in Vercel production.

Production trust path:

`Vercel production workload identity (OIDC)`

→ `Supabase Edge Function: academy-persistence-gateway`

→ explicit Academy RPC allowlist

→ service-role authority remains inside Supabase

Vercel production explicitly refuses to silently fall back to a long-lived Academy service-role credential.

### 4.2 Workload-identity controls

The source-controlled gateway verifies a tightly bounded workload identity rather than generic Vercel identity. Controls include:

- RS256 JWT verification;
- exact issuer;
- exact audience;
- exact Vercel owner/team ID;
- exact Vercel project ID/name;
- exact production environment;
- exact production subject;
- expiration/issued-at/token-age checks;
- explicit Academy RPC operation allowlist;
- 64 KiB request-body limit;
- no browser CORS exposure;
- no anonymous-key fallback;
- no opening of existing Academy RPCs to browser roles.

`supabase/config.toml` declares custom function authentication because the function performs Vercel OIDC verification itself.

### 4.3 Direct/self-hosted fallback

Azure/self-hosted remains supported through a server-side direct credential path.

Modern Supabase `sb_secret_...` keys are treated as API keys and are no longer incorrectly sent as Bearer JWTs. Legacy `service_role` JWTs retain Bearer compatibility only where appropriate.

Azure IaC continues to source sensitive values through Key Vault references.

### 4.4 Academy persistence runtime contract

Source requires:

- `OBSERRA_ACADEMY_SUPABASE_URL`
- `OBSERRA_ACADEMY_SUPABASE_PROJECT_REF`
- Vercel production `VERCEL_OIDC_TOKEN`
- `OBSERRA_ACADEMY_EMAIL_HASH_SECRET`

Vercel workload mode activates only after URL/project-ref validation and OIDC-token validation succeed.

---

## 5. Academy runtime status

On the verified PR #196 application deployment, direct:

`GET /api/academy/commerce-health`

returned **HTTP 503 Service Unavailable** with:

- `contract = academy-commerce-health-v1`
- `operational = false`
- `identity = available`
- `identityEnvironment = live`
- `purchaserIdentityHashing = available`
- `durableStorage = unavailable`
- `storageSchema = null`
- `paymentProvider = unavailable`
- Stripe environment `unavailable`
- provider connected `false`
- charges enabled `false`
- webhook verification `unavailable`

### 5.1 Proven fixed

- Academy learner identity health is live/available.
- Purchaser identity HMAC configuration is available.
- The workload-identity persistence architecture is merged, source-controlled, CI-verified, and present in a READY Vercel deployment.
- The Academy Supabase durable schema was directly verified operational as `academy-durable-state-v2`.
- Existing Academy RPCs remain server/service-role-only.

### 5.2 Not yet proven

End-to-end:

`Vercel OIDC → Supabase Edge gateway → academy_storage_health()`

is **not yet proven live**.

Immediately after a candidate commerce-health request, no Academy storage-health exception was present in Vercel runtime logs. In source, the route only attempts/logs `academyStorageHealth()` after `academyPersistenceConfigured()` succeeds.

The strongest evidence therefore points to a **pre-RPC configuration acceptance failure**, potentially involving:

- Academy URL/project-ref binding validation;
- production `VERCEL_OIDC_TOKEN` availability/format;
- another pre-RPC configuration condition.

This is a narrowed diagnosis, not a completed root-cause determination.

Do not claim the gateway operational until an actual `academy_storage_health()` response is observed through the Vercel workload path.

### 5.3 Academy payment blockers

Academy payment remains fail closed. Required real completion includes:

- governed live `ACADEMY_STRIPE_SECRET_KEY` restricted key;
- `ACADEMY_STRIPE_WEBHOOK_SECRET`;
- Stripe account connectivity;
- accepted live environment;
- `charges_enabled = true` where required for the intended account;
- required webhook event subscriptions;
- authenticated and guest-email checkout verification;
- idempotent signed-webhook fulfillment;
- claim flow;
- refund/dispute reversal handling;
- duplicate-payment prevention.

Do not substitute the generic shared Stripe secret for Academy commerce.

---

## 6. Academy Supabase durable-state baseline

Direct production-backend verification established:

- project: `Obserra Academy`
- project ref: `nwxnyqlyzyufgoadtqxs`
- state: `ACTIVE_HEALTHY`

Real RPC surface includes:

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

Therefore Vercel `durableStorage = unavailable` must not be misdiagnosed as “Academy database missing.” The durable database exists; the unresolved boundary is Vercel-to-Supabase runtime access/configuration.

---

## 7. Florida Class D runtime status

### 7.1 Liveness versus readiness

On the verified PR #196 application deployment:

`GET /api/florida-class-d/health/live` → **HTTP 200**

`{"service":"florida-class-d-lms","status":"live"}`

`GET /api/florida-class-d/health/ready` → **HTTP 503**

`{"service":"florida-class-d-lms","status":"not_ready"}`

with:

`Retry-After: 60`

The public canonical host reports the same high-level live/not-ready pattern but still runs older deployment `dpl_Eepy... / 1d9ad1f...`.

### 7.2 Exact latest verified candidate technical failures

Vercel runtime logs for PR #196 candidate `dpl_3M1X...` reported:

1. `stripe_identity_webhook`
2. `supabase_service_role`
3. `daily_api_key`
4. `di_license_number`

Important: **`documents_bucket` is no longer a failure key.** The required completion-document bucket and its runtime binding now pass the readiness inventory.

Earlier environment-name auditing found FDACS Supabase service-role and Daily key names in the Vercel estate, but the runtime still rejects those controls. Presence is not acceptance. Treat `supabase_service_role` and `daily_api_key` as unresolved format/value/target/runtime-binding failures until readiness stops flagging them.

### 7.3 Exact HA/evidence failures

Current verified candidate failure keys:

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

These remain unresolved until authentic evidence exists. Do not set “verified” flags merely to make readiness return 200.

### 7.4 Licensing boundary

`di_license_number` remains a hard runtime failure.

The exact license number has not been established in the connected authoritative production configuration during this workstream. Do not infer it from chat history, memory, or owner identity.

Florida Class D public regulated enrollment, payment, learner credit, completion authority, and production activation remain fail closed until applicable external authorization, exact issued license state, runtime readiness, production evidence, and owner activation conditions pass.

---

## 8. FDACS Supabase production baseline

Direct verification established:

- project: `OBSERRA FDACS Student Records Production`
- project ref: `ggkxgjhsbgbifiqrhavr`
- region: `us-east-1`
- state: `ACTIVE_HEALTHY`

Regulated-boundary health established:

- 64 FDACS tables in the regulated set;
- browser table privileges: 0;
- forced RLS on the regulated table boundary;
- classification: regulated student PII, non-CUI;
- minimum retention: 2 years;
- operational retention: 3 years;
- production runtime authorization: false;
- CUI processing: unauthorized;
- identity-document-image processing: unauthorized.

The real regulated RPC surface includes attendance, daily identity, instructor attestation, presence challenges, live sessions, polls, text-screen timing, exam/retest, LIAS, completion documents, investigator export, protected artifacts, archival/retention, production authorization, audit-chain verification, quality/CAPA, and cohort scheduling functions.

### 8.1 Completion-document bucket repair

Required real bucket:

`fdacs-class-d-completion-documents`

was previously absent and was created in the production FDACS Supabase project.

Verified contract:

- `public = false`
- size limit: 10 MiB
- allowed MIME type: `application/pdf`
- server-side controlled use
- no permissive ordinary-browser storage policy added

The latest verified candidate readiness no longer reports `documents_bucket`, proving this defect is closed at the readiness-contract level.

---

## 9. Florida Class D implementation versus production authorization

The source contains the regulated 5-day / 40-hour architecture, 18 curriculum areas, live instruction, presence/attendance evidence, Daily media integration, scheduling, polls, make-up workflows, protected recorded make-up, 170-question exam controls, remediation/retest, completion review, LIAS handoff, completion documents, audit/inspection records, quality/CAPA, retention, database promotion gates, runtime readiness, mutation boundaries, acceptance evidence, resilience/observability, HA evidence integrity, and owner UAT controls.

Those source capabilities do **not** equal production authorization.

Final regulated activation still requires, as applicable:

- all technical readiness failures cleared;
- exact licensing state verified;
- approved exam-bank authority;
- production database-promotion evidence;
- exact-candidate UAT evidence;
- secure media/provider readiness;
- identity-verification provider readiness;
- completion-document storage readiness;
- LIAS procedure/evidence;
- authentic HA/backup/failover evidence;
- measured RTO/RPO within governed thresholds;
- security acceptance;
- rollback readiness;
- owner authorization;
- required external regulatory authorization.

---

## 10. Identity and payment boundaries

### Academy

- learner/runtime identity: Supabase
- identity health: available/live
- purchaser HMAC: available
- durable DB: real and healthy in Supabase
- Vercel→gateway persistence: not yet operational
- Academy Stripe: unavailable
- Academy webhook: unavailable
- Academy commerce: HTTP 503, fail closed

### Applications

Applications identity remains on its separately governed application identity boundary. Do not change it merely to align with Academy without a dedicated migration, tests, and release evidence.

### Florida Class D

Readiness still flags Stripe Identity webhook configuration. Regulated learner activation remains fail closed. Provider configuration cannot substitute for licensing or regulatory authorization.

---

## 11. Security controls and residual risks

### Proven controls

- exact project/SHA/deployment health identity;
- HSTS with preload;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Cross-Origin-Opener-Policy: same-origin`;
- `Cross-Origin-Resource-Policy: same-origin`;
- canonical-origin CORS rather than wildcard;
- no-store health/commerce/readiness responses;
- protected-route noindex behavior;
- fail-closed Academy commerce;
- fail-closed Florida readiness;
- service-only Academy RPC boundary;
- Vercel-production Academy service-role fallback prohibited;
- modern Supabase secret-key header handling corrected;
- regulated FDACS browser table privilege boundary closed.

### Residual/open controls

- canonical `www` domain serves older deployment/SHA;
- GitHub `main` branch is not protected by an enforced ruleset;
- Academy workload identity is not proven end-to-end;
- Academy live Stripe/webhook configuration is absent/unaccepted;
- Florida readiness rejects Stripe Identity webhook, Supabase service-role, Daily API key, and DI license number;
- HA/backup/RTO/RPO/failover evidence is incomplete;
- CSP still contains `unsafe-inline` and must not be declared final hardened state without further nonce/hash migration analysis;
- regulated production authorization remains intentionally false.

---

## 12. Rollback authority

### Current customer-facing rollback/public point

At this checkpoint the canonical `www` host serves:

- deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa`
- Git SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`

Do not delete or invalidate this deployment before a newer approved deployment is promoted and canonical smoke tests pass.

### Verified newer rollback candidates

PR #196 application deployment:

- `dpl_3M1XorH66KxxZCH9N7Dxx7fLEjZg`
- SHA `560367a63e22ccd7c268817f89757f5e70d32319`
- READY

PR #198 documentation-only repository deployment:

- `dpl_B3mQAX2kcShiS932sNHp5znUUV8m`
- SHA `d401acaf44870593f5744407a93720e09d71c384`
- READY

Future handoff-only commits may produce newer READY deployments. Re-read Vercel before promotion.

### Database rollback discipline

No destructive production database change is authorized by this handoff. Preserve regulated data and evidence before database rollback, relocation, migration, or cleanup. Use controlled migration/promotion/evidence gates.

---

## 13. Priority continuation sequence

### P0 — advance canonical `www` to the newest approved verified deployment

1. Re-read GitHub `main` and Vercel deployments.
2. Classify any commits after PR #196 as application-changing versus docs/evidence-only.
3. Select the newest approved READY production-target deployment containing the PR #196 application tree.
4. Keep `dpl_Eepy...` intact as rollback until completion.
5. Reconfirm candidate `/api/health` exact project/SHA/deployment authority.
6. Promote through the governed Vercel release path.
7. Verify `https://www.obserrallc.com/api/health` reports the exact promoted deployment and SHA, canonical project `prj_lxTK...`, `authority = verified`, and `verified = true`.
8. Smoke-test public home, Academy, Florida live/ready, protected identity routes, and required application integration surfaces.
9. Roll back to the last proven public deployment if release-critical checks fail.

### P1 — close Academy workload-identity persistence

1. Add/use a sanitized production diagnostic that distinguishes URL/project-ref validation from OIDC-token availability without logging token or secret content.
2. Prove `academyPersistenceConfigured()` succeeds in Vercel production.
3. Prove the Edge gateway accepts the exact Vercel production identity.
4. Prove `academy_storage_health()` returns `academy-durable-state-v2` through the workload gateway.
5. Preserve service-role-only RPC ACLs.
6. Do not reintroduce a long-lived Academy service-role credential into Vercel production as a shortcut.

### P1 — close Academy Stripe readiness

1. Create/verify the governed live Academy restricted Stripe key.
2. Verify the dedicated Academy webhook secret and required event subscriptions.
3. Verify account connectivity and charge capability.
4. Re-run `/api/academy/commerce-health` until all real dependencies are operational.
5. Verify checkout, fulfillment, claim, refund/dispute reversal, and idempotency using real authorized provider boundaries.

### P1 — close Florida technical readiness

Resolve and re-test exactly:

- `stripe_identity_webhook`
- `supabase_service_role`
- `daily_api_key`
- `di_license_number`

For Supabase service-role and Daily, validate value format, environment target, runtime acceptance, and provider operation rather than variable-name presence only.

### P2 — produce authentic Florida HA/recovery evidence

Produce, retain, hash, and bind authentic evidence for:

- edge/DNS
- application
- identity
- database
- media
- document storage
- commerce
- observability
- backup/restore
- failover exercise
- evidence manifest
- RTO
- RPO
- recent failover test

Do not fabricate verified status.

### P2 — harden repository/release governance

- enable appropriate GitHub branch/ruleset protections;
- preserve verified release merges;
- continue deterministic evidence generation;
- harden CSP where technically compatible;
- keep regulated production authorization false until final conditions pass.

---

## 14. Verification endpoints for the next operator

Always compare repository authority and live authority separately.

Canonical public health:

`https://www.obserrallc.com/api/health`

Academy commerce health:

`https://www.obserrallc.com/api/academy/commerce-health`

Florida liveness:

`https://www.obserrallc.com/api/florida-class-d/health/live`

Florida readiness:

`https://www.obserrallc.com/api/florida-class-d/health/ready`

Known verified PR #196 application candidate health:

`https://obserra-website-live-32xahyo2d-obserra.vercel.app/api/health`

Known verified PR #198 docs-only repository deployment health:

`https://obserra-website-live-fo0jvceeq-obserra.vercel.app/api/health`

When Florida readiness is 503, use Vercel runtime logs for the sanitized message:

`Florida Class D readiness not ready`

Do not expand the public readiness payload with secrets or protected configuration details.

---

## 15. Completion matrix at the Aug. 22 checkpoint

| Area | Status | Evidence level |
|---|---|---|
| Repository HEAD | must be re-read dynamically; initial handoff publication merge was `d401acaf...` | DYNAMIC / VERIFIED AT CHECKPOINT |
| Application-changing source baseline | PR #196 merge `560367a...` | PASS SOURCE |
| PR #196 CI | Azure IaC, CodeQL, Florida, Website CI success | PASS SOURCE |
| Handoff PR #198 CI | Website CI, Florida, CodeQL success | PASS SOURCE |
| Canonical Vercel project | `prj_lxTK...` | PASS LIVE |
| PR #196 application deployment | `dpl_3M1X...`, READY | PASS CANDIDATE |
| PR #198 docs-only deployment | `dpl_B3mQAX...`, READY | PASS CANDIDATE |
| `www` exact-SHA parity | still `dpl_Eepy... / 1d9ad1f...` at checkpoint | OPEN / RELEASE DRIFT |
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
3. Re-read GitHub `main` SHA and signature; do not rely on a hard-coded “current HEAD” in documentation.
4. Compare the latest commits to PR #196 and classify later changes as application-changing or docs/evidence-only.
5. Re-read Vercel production-target deployments.
6. Verify `www.obserrallc.com/api/health` separately from candidate deployments.
7. If canonical host and intended approved deployment differ, do not call current source live.
8. Verify Academy commerce health and Florida live/ready health.
9. Pull sanitized runtime failure keys before changing production configuration.
10. Use the relevant Obserra EPI advanced capability skills for every subsystem change.
11. Make only evidence-backed, reversible changes.
12. Update this handoff after every material application merge, production promotion, provider-binding change, database promotion, regulated authorization change, or blocker resolution. Documentation-only edits should not be promoted to “new application behavior” merely because they advance Git history.

**Immediate objective:** advance the canonical `www` host to the newest approved verified READY deployment containing the PR #196 application changes without losing rollback; then close Academy workload-identity runtime persistence, Academy Stripe readiness, the four remaining Florida technical readiness failures, and authentic HA/recovery evidence. No mockups, no placeholders, no fabricated evidence, and no weakening of fail-closed controls.
