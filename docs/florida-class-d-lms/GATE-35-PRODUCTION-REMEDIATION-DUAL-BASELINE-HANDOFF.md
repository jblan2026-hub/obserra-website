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

## Confirmed defects and gaps

1. The repository does not yet contain a first-class, complete, machine-validated register for all 110 Rev. 2 requirements.
2. The existing Rev. 3 register identifies Rev. 2 practices only within implementation trace records. This is not complete 110-requirement coverage.
3. The scheduled production end-to-end workflow expects a retired GET checkout flow and a public live Clerk marker. Its assertions conflict with the hardened runtime contract and can produce false results.
4. Live commerce is fail closed because the Stripe secret and webhook runtime configuration are not available to the serving deployment.
5. Live identity is intentionally disabled or degraded because a verified live Clerk control-plane configuration has not been activated.
6. Both canonical domains remain reported against three Git-linked Vercel projects, so exclusive routing ownership is unverified.
7. Academy learner enrollment, progress, assessment, and certificate state is currently persisted in Clerk private metadata even though service-only Supabase learner tables exist. The design requires reconciliation for durable concurrency, auditability, and provider-size limits before it can be accepted as production-ready.
8. Stripe webhook processing did not retain a durable provider-event ledger at the starting SHA. Gate 35 now provides a live empty event ledger and transactional event-ID idempotency, but the code is not a production runtime control until its exact validated commit is deployed and the Vercel dependency configuration is verified.
9. GitHub `main` branch protection, required status checks, rulesets, Dependabot alerts, and secret-scanning state remain external administrator controls tracked by issue #60.
10. CUI scope, SSP, asset categorization, provider responsibility matrices, FIPS boundary evidence, organizational policies, incident exercises, backup/restore, RPO/RTO, and failover evidence remain incomplete. CUI processing must remain unauthorized.
11. Florida Class D production remains blocked by the recorded licensing, candidate-bound acceptance, production database, HA/recovery, rollback, and explicit activation prerequisites.

## Gate 35 execution order

1. Establish complete Rev. 2 and Rev. 3 machine-readable catalogs, status separation, crosswalk, evidence links, deterministic human output, digests, and CI drift enforcement.
2. Correct production operational monitoring to assert the real website, identity, commerce, webhook, Academy, and regulated fail-closed contracts.
3. Harden Academy payment initiation against cross-site and GET mutation behavior and add durable Stripe event processing evidence.
4. Reconcile Academy learner state with service-only durable storage while preserving existing entitlements and a controlled migration path.
5. Remove repository-level canonical aliases after direct Vercel ownership cleanup and retain exact routing evidence.
6. Verify and activate production Clerk and Stripe configuration only through their authorized control planes.
7. Validate database advisors, migrations, runtime routes, complete learner lifecycle, payment fulfillment, recovery, CI, CodeQL, and live deployment.
8. Keep Florida Class D regulated production and CUI processing fail closed until every external prerequisite is objectively satisfied.

## Current Gate 35 checkpoint

- Complete Rev. 2 / Rev. 3 dual-baseline registry: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.json`
- Deterministic human-readable matrix: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MATRIX.md`
- Validation schema: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.schema.json`
- Input digest record: `docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.sha256`
- Dual-baseline SHA-256: `632dc6f7b64ef3a9b798705823b05f85a8abb2de131c3eafb7c972873e0dea38`
- Current Rev. 3 traceability SHA-256: `ab63297c4b6dcccd8e7a6e1b03ded72d150b163217db77832c90d783432de226`
- Current production-evidence SHA-256: `b5ba465f13ac6996ce6ad1a62928007257ea5d34128d06dd798bdd4167819d46`
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
- A local production build compiled and passed TypeScript, then the restricted sandbox stopped static generation when the Academy control plane attempted its external Supabase read. This is an environment limitation, not a completed build result. GitHub/Vercel build evidence remains required on the exact candidate SHA.
- Rev. 3 traceability, production evidence, and the dual-baseline human views and digests were regenerated and all three drift checks pass.
- The scoped implementation checkpoint is `c39f7ce2617b391a4df631227e4683bb320b81db`; no application-product path is included.

## Remaining non-delegable or provider-gated work

1. Verify and configure dedicated Vercel production variables for the live Academy Supabase URL, service-role credential, and purchaser-email HMAC secret without exposing values.
2. Verify and activate matching live Clerk credentials and the explicit identity runtime switch.
3. Verify live Stripe key, account charge capability, and signed webhook endpoint secret, then validate webhook delivery without creating a fabricated charge.
4. Remove canonical-domain attachments from the two duplicate Vercel projects only, after the required action-time confirmation, and verify both domains remain on `obserra-website-live`.
5. Remove static repository aliases only after exclusive Vercel ownership is directly verified.
6. Pass PR #78 Florida gates, Website CI, and CodeQL, then deploy only the exact accepted PR head SHA.
7. Re-run the production operational workflow. It must remain red until website liveness, live identity, live Stripe, signed webhook verification, durable storage, and Class D readiness truthfully pass.

## Latest live runtime and routing recheck

- Canonical traffic still serves deployment `dpl_FYdopKa9RE5XMGMJecQ11AGMe3vb`; the new branch code is not deployed.
- `GET /api/health` returns HTTP 404, as expected before the new liveness route is deployed.
- Academy commerce health remains HTTP 503 and reports identity degraded plus Stripe/webhook unavailable. Its old `stripe-checkout-session-id` idempotency marker confirms the durable event-ID release is not yet serving.
- Florida Class D liveness returns HTTP 200 and `live`; readiness returns HTTP 503 and `not_ready`.
- Direct Vercel project reads still list both canonical domains on all three projects: `obserra-website-live`, `obserra-website-lcn2`, and `obserra-integrated-services`.
- The latest recorded deployment on each of those three projects is canceled. This does not alter the previously observed serving deployment or resolve exclusive domain ownership.

## Evidence update rule

Every material implementation or control-plane change must update this handoff, the Gate 35 action ledger, the dual-baseline mapping, the production evidence register, and any affected recovery or routing record in the same governed change. A failed or blocked attempt must remain recorded with its effect and next action.
