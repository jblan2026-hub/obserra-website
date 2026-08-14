# Gate 35 Production Remediation and CMMC Dual-Baseline Handoff

Status: **IN PROGRESS**

Last synchronized: 2026-08-14

## Claim boundary

This gate records engineering remediation and audit readiness for the public website, Obserra Academy, commerce, and the regulated Florida Class D LMS. It does not claim CMMC certification, CMMC status in SPRS, authorization to process CUI, FedRAMP authorization, or FDACS school approval.

CMMC Level 2 is evaluated against all 110 NIST SP 800-171 Rev. 2 requirements under the current 32 CFR part 170 assessment regime. NIST SP 800-171 Rev. 3 remains the forward engineering baseline with 97 active requirements and 33 withdrawn identifiers. Gate 35 must preserve both baselines and their relationship without treating the Rev. 3 overlay as a substitute for the 110-requirement assessment.

## Scope boundary

This workstream may change only the public website, Obserra Academy/LMS, Academy checkout and fulfillment, Academy storage, Florida Class D fail-closed controls, and the GitHub, Vercel, Clerk, Stripe, and Supabase dependencies required by those services. Obserra application products, application product routes, application billing, and their implementation files are a separate concurrent workstream. Gate 35 must not modify, stage, restore, or claim those application changes.

## Starting identity

- Repository: `jblan2026-hub/obserra-website`
- Branch base: `main`
- Verified starting SHA: `ffb08fb2e9cb9033d9a3faf68c653e90c28a7b88`
- Working branch: `codex/production-readiness-cmmc-dual-baseline`
- Implementation checkpoint: `c39f7ce2617b391a4df631227e4683bb320b81db`
- GitHub candidate: PR #78; initial candidate commit `f1ff531a3f015c85d5028be2e7c79aef90cd7f4a`; exact candidate tree `02b81adc614b75caba5b0441a31e6ddf42a2bda8`
- Merged release: `2189c73ff5ba15ea07aa51ab84da23112403a720`
- Intended READY deployment: `dpl_6ERkFxUAKg6yjnrJVQ649dLeM6rz`
- Alias-propagation correction: PR #80 / verified merge `d35917f417d24489ffd5877b989f36dbb3bbb613` / intended READY deployment `dpl_DxojVNKBd9hJtcjXth3QptKei4Lw`
- Active routing-evidence branch: `codex/gate36-routing-rebind`
- Previously observed live deployment: `dpl_FYdopKa9RE5XMGMJecQ11AGMe3vb`
- Intended Vercel authority: `obserra-website-live` / `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- Duplicate Vercel claimants: `obserra-website-lcn2` and `obserra-integrated-services`

## Verified starting state

| Surface | Evidence | Starting disposition |
| --- | --- | --- |
| Public website | Canonical homepage and Academy return HTTP 200 with production security headers | Live, routing authority unresolved |
| Academy catalog | Live page states 60 currently published courses; Supabase main contains controlled publication records | Live public catalog |
| Academy checkout | `GET /api/academy/checkout` returns 405 with `Allow: POST` | Correct source/runtime method boundary |
| Commerce health | `GET /api/academy/commerce-health` returns HTTP 503, `operational:false`, Stripe unavailable, webhook unavailable | Not production operational |
| Identity | Runtime reports `configuration-required` / degraded | Protected services not production operational |
| Florida Class D | Public informational page is live; regulated mutation and activation paths remain fail closed | Not production authorized |
| Main Supabase | Project `nwxnyqlyzyufgoadtqxs` is `ACTIVE_HEALTHY` on Postgres 17.6.1.155 | Live provider |
| Regulated nonproduction branch | Project ref `jeklrsratrijrsamdauv` is `ACTIVE_HEALTHY` | Synthetic nonproduction only |
| Database least privilege | Reviewed Academy tables use forced RLS; `anon` and `authenticated` have no DML; service role retains required DML | Source/provider control verified |
| Supabase security advisors | 59 informational `rls_enabled_no_policy` notices, consistent with the service-only deny-by-default model; no warning or error finding | Review required, no current elevated advisory |
| Supabase performance advisors | 63 notices, including four duplicate-index warnings outside the learner-commerce table set | Remediation assessment required |
| Source tests | 43 of 43 Node tests passed | Verified baseline |
| Rev. 3 mapping gate | 97 active requirements and 21 trace records passed; digest `7119dd9f2b00aa6f9b23bca7a4f4677303e80066c1936dee4b5ae136d1b0eab3` | Verified but not the complete CMMC Level 2 assessment baseline |
| Production evidence gate | Existing production evidence passed; digest `3a4952b12a81dbff2dfbec4f05c3f6933e654a5ef710af9e2fb1f970b1efd1e4` | Verified for recorded state, requires Gate 35 updates |

## Current resolved items and remaining gaps

1. The repository now contains a first-class, complete, machine-validated register for all 110 Rev. 2 requirements plus the 97-active/33-withdrawn Rev. 3 overlay. Every Rev. 2 assessment result remains `not_assessed`.
2. The dual-baseline generator, human matrix, schema, digests, and CI drift enforcement passed on the exact PR head.
3. The scheduled production end-to-end workflow now asserts the POST-only checkout, real website liveness, live identity/commerce dependencies, durable fulfillment, and regulated readiness contracts without creating a payment.
4. Live commerce is fail closed because the Stripe secret and webhook runtime configuration are not available to the serving deployment.
5. Live identity is intentionally disabled or degraded because a verified live Clerk control-plane configuration has not been activated.
6. Repository-propagated aliases are removed and operator control-plane evidence shows the canonicals only on the intended project, but an older lcn2 deployment still owns both deployment-level aliases and serves live canonical traffic. Exclusive runtime ownership remains unverified.
7. Durable Academy learner, progress, assessment, certificate, payment-event, and audit code is deployed, and the live service-only schema is ready. Runtime storage remains fail closed until its dedicated protected Vercel variables are configured.
8. Stripe webhook event-ID idempotency and the durable provider-event ledger are deployed, but live Stripe and webhook configuration remains unavailable and commerce health correctly returns HTTP 503.
9. GitHub `main` branch protection, required status checks, rulesets, Dependabot alerts, and secret-scanning state remain external administrator controls tracked by issue #60.
10. CUI scope, SSP, asset categorization, provider responsibility matrices, FIPS boundary evidence, organizational policies, incident exercises, backup/restore, RPO/RTO, and failover evidence remain incomplete. CUI processing must remain unauthorized.
11. Florida Class D production remains blocked by the recorded licensing, candidate-bound acceptance, production database, HA/recovery, rollback, and explicit activation prerequisites.

## Gate 35 execution order

1. Establish complete Rev. 2 and Rev. 3 machine-readable catalogs, status separation, crosswalk, evidence links, deterministic human output, digests, and CI drift enforcement.
2. Correct production operational monitoring to assert the real website, identity, commerce, webhook, Academy, and regulated fail-closed contracts.
3. Harden Academy payment initiation against cross-site and GET mutation behavior and add durable Stripe event processing evidence.
4. Reconcile Academy learner state with service-only durable storage while preserving existing entitlements and a controlled migration path.
5. Remove repository-level canonical aliases, establish intended-only Vercel project configuration, and require live project/deployment/commit identity before accepting canonical routing.
6. Verify and activate production Clerk and Stripe configuration only through their authorized control planes.
7. Validate database advisors, migrations, runtime routes, complete learner lifecycle, payment fulfillment, recovery, CI, CodeQL, and live deployment.
8. Keep Florida Class D regulated production and CUI processing fail closed until every external prerequisite is objectively satisfied.

## Current Gate 35 checkpoint

- Complete Rev. 2 / Rev. 3 dual-baseline registry: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.json`
- Deterministic human-readable matrix: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MATRIX.md`
- Validation schema: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.schema.json`
- Input digest record: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.sha256`
- Dual-baseline SHA-256: `c49494b4ac9fc739b5ac9f4ae826e6100b0acfdcea95464f51db4b287aba2c60`
- Current Rev. 3 traceability SHA-256: `11f110691aa6d7c98e65e451862bb8d69726ba6d24244064dd33dc9b1b9dd6bd`
- Current production-evidence SHA-256: `dd6f912527b864fb1de870a12355ea2edcbb379d6ce66363bc50eaaaea9b1b71`
- CI verification command: `npm run verify:cmmc-dual-baseline`
- CI workflow now runs Gate 35 and validates exact catalog counts, identifier dispositions, trace references, local evidence existence, generated report drift, and input digests.

## Current implementation and live database checkpoint

- Live Supabase migration: `20260814061110_academy_durable_learner_commerce`
- Source migration: `supabase/migrations/20260814061110_academy_durable_learner_commerce.sql`
- Source migration SHA-256 at apply time: `79989afa5488cd256e9eb334893d45fba005a57d2025e333d837a4b1b09134d4`
- Live integrity-hardening migration: `20260814061912_academy_payment_event_integrity_hardening`
- Integrity-hardening source: `supabase/migrations/20260814061912_academy_payment_event_integrity_hardening.sql`
- Integrity-hardening SHA-256 at apply time: `4af041dd50928c66e9f0f3e8f51a8fc49c74934266c8fffa16dd3bb110630b6e`
- Live Academy storage contract: `academy-durable-state-v1`
- Live tables: `academy_learner_state`, `academy_payment_events`, `academy_assessment_records`, and `academy_learner_events`
- Live row counts after migration: zero learner states, zero payment events, zero assessment records, and zero learner audit events. No fabricated data was inserted.
- All four tables have RLS enabled and forced. `anon` and `authenticated` have no select/insert/update/delete privilege. `service_role` has only the table privileges required by the server-side functions.
- Nine Academy functions are security-definer functions with an empty search path, are executable by `service_role`, and are not executable by `anon` or `authenticated`.
- Assessment and learner event triggers reject update and delete operations.
- Stripe event replay validation now binds event type, Checkout Session, PaymentIntent, course, course version, identity mode, Clerk user identity, and purchaser email HMAC. A material mismatch aborts the transaction. Paid claims must match the signed-webhook course version.
- The main Academy project still contains zero `fdacs_class_d_*` tables.
- Post-migration security advisors report 63 informational `rls_enabled_no_policy` notices and no warning or error. Four new notices correspond to the intentional service-only, policy-free Academy tables.
- Post-migration performance advisors report 63 informational notices and four duplicate-index warnings. All four warnings remain outside the new Academy learner-commerce tables and outside this workstream's application-product scope. New Academy indexes are reported only as unused because the tables intentionally contain no fabricated data.

## Current source validation

- Gate 32 passes with durable signed-webhook fulfillment and regulated separation.
- Gate 35 durable-commerce source gate passes with four durable tables, nine service-only functions, and zero production transactions created by validation.
- Academy alignment validates exactly 60 reviewed baseline courses, exact Supabase publication parity, and zero approved Studio overrides. The empty override catalog is not represented as authored course evidence.
- Academy 70x passes 369 assertions. The 500, 1000, and 2000 case suites pass as static contract tests only and are not live transaction evidence.
- Repository tests pass 51 of 51.
- Targeted ESLint and non-incremental TypeScript compilation pass.
- Website CI #2340 and the intended Vercel production deployment built the exact validated release successfully.
- Rev. 3 traceability, production evidence, and the dual-baseline human views and digests were regenerated and all three drift checks pass.
- The scoped implementation checkpoint is `c39f7ce2617b391a4df631227e4683bb320b81db`; no application-product path is included.

## Remaining non-delegable or provider-gated work

1. Verify and configure dedicated Vercel production variables for the live Academy Supabase URL, service-role credential, and purchaser-email HMAC secret without exposing values.
2. Verify and activate matching live Clerk credentials and the explicit identity runtime switch.
3. Verify live Stripe key, account charge capability, and signed webhook endpoint secret, then validate webhook delivery without creating a fabricated charge.
4. Deploy the routing-evidence liveness change from the intended project so the newly configured canonicals are assigned to its current production deployment.
5. Verify canonical `/api/health` reports project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, an exact deployment ID, and exact Git commit SHA; verify the older lcn2 deployment loses both canonical aliases; then close issue #76 with retained evidence.
6. Re-run the production operational workflow. It must remain red until website liveness, live identity, live Stripe, signed webhook verification, durable storage, and Class D readiness truthfully pass.

## Latest live runtime and routing recheck

- PR #80 verified merge SHA `d35917f417d24489ffd5877b989f36dbb3bbb613` is deployed to all three Git-linked Vercel projects. Intended deployment `dpl_DxojVNKBd9hJtcjXth3QptKei4Lw` is READY and production-targeted.
- `GET /api/health` returns HTTP 200 with `website-liveness-v1`.
- Academy commerce health remains HTTP 503 and reports the new Stripe-event-ID/durable-Supabase contract, but identity, Stripe/webhook, durable Academy storage, and purchaser identity hashing are unavailable.
- Florida Class D liveness returns HTTP 200 and `live`; readiness returns HTTP 503 and `not_ready`.
- Operator control-plane screenshots show both canonicals on `obserra-website-live`; `www` is valid and the apex is attached with Vercel's optional DNS modernization recommendation. No DNS change is required for this remediation. Both duplicate project overviews show no production domain/deployment.
- Direct inspection of the latest duplicate deployments confirms neither includes a canonical alias. However, older lcn2 deployment `dpl_AYZXGVZurpGcKXLSzvKrudM7rt5w` still lists both canonicals and a cache-busted canonical request still returns that deployment marker; the apex redirect still includes `_vercel_share`. Exclusive live routing is therefore not accepted.
- The intended PR #80 deployment build completed successfully with no build errors, but its Vercel commit status is `failure` / dashboard state `Checks Failed`; lcn2 is `success`. No runtime requests are recorded on the intended deployment. This is retained as a postdeployment-control failure, not hidden or misreported as a build failure.
- The current candidate makes `/api/health` report nonsecret `VERCEL_PROJECT_ID`, `VERCEL_DEPLOYMENT_ID`, and `VERCEL_GIT_COMMIT_SHA`; the production operational gate requires the intended project ID and exact-form deployment/commit values.

## Gate 37 publication-resume reconciliation

- The original unpublished 208-path checkpoint remains immutable at commit `83364708ae618555ec514d27a93079bad22a7c4c`, tree `2d75297998906cb0e84666dc4d5c72e9ecaf682b`, parent `0e72459a8940f23976038d85d6394409000f48c5`.
- GitHub `main` independently advanced from the same base through `885fdacf7cf77896da770f4e6ee1ebc921a13b00`, `a61603991692e3789263dc7d3f2177f172f40369`, and `25cace20213bb4579fde27f996ac9b4d0cb37710`.
- Local merge commit `7f9c8f24a2ee1b73cbd0a748e5768486aaf33dbc` preserves both histories. The only remote content changes were three malformed, mis-nested `austenstone/copilot-cli@v3.2` insertions and a missing final newline. The third-party action insertions were removed because the workflows would not parse as valid jobs or steps and the tag was not an immutable commit pin. The harmless final newline was retained.
- Full local revalidation then found and corrected two fail-closed source defects in the checkpoint: Gate 25 removed the last literal regulated Supabase origin while preserving exact protected project binding, and Gate 29 reconciled its stale 29-migration expectation to the complete 35-file lineage ending at `20260814175000` with manifest SHA-256 `40eb88f6b8cb6ce2716eb260cde7f29d69d78f0a201e90cd6373ac1ebf2be090`. Neither correction authorizes production activation or executes a database migration.
- Publication, pull-request checks, merge, intended-project Vercel deployment, canonical runtime verification, and final exact-release evidence remain pending. Human review remains `pending`; assessment findings remain `not_assessed`; Applications paths remain excluded.

## Evidence update rule

Every material implementation or control-plane change must update this handoff, the Gate 35 action ledger, the dual-baseline mapping, the production evidence register, and any affected recovery or routing record in the same governed change. A failed or blocked attempt must remain recorded with its effect and next action.
