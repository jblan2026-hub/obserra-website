# CMMC Continuous Audit and Recovery Handoff

> GENERATED FROM `CMMC-CONTINUOUS-AUDIT-HANDOFF.json`. DO NOT EDIT THIS EXTRACT MANUALLY.

- **Legal owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
- **Updated:** `2026-08-14T20:30:59Z`
- **Repository/branch:** `jblan2026-hub/obserra-website` / `codex/gate37-public-production-hardening`
- **Base commit:** `ca3664dd69635cb7f4e454b0ff22f6054d857606`
- **Status:** `published_release_live_activation_pending`

Do not describe the continuous audit record as live until the production migrations, protected workflow secrets, approved main-branch workflow, actual archive write, controlled catalog read, artifact-chain check, access-event-chain check, health check, and paired receipt have all been verified.

## Canonical paired audit record

- Machine-readable: `docs/compliance/CMMC-SYSTEM-EVIDENCE.json`
- Human-readable extract: `docs/compliance/CMMC-SYSTEM-EVIDENCE.md`
- Paired digest manifest: `docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256`
- Schema: `docs/compliance/CMMC-SYSTEM-EVIDENCE.schema.json`
- Controlled source: `docs/compliance/CMMC-SYSTEM-SCOPE-SOURCE.json`
- Verification: `npm run verify:cmmc-evidence`

Coverage is 320 governing objectives plus 510 supplemental objectives across 3048 separated-system mappings. Current technical results are 0 passed, 0 failed, and 3048 not tested. Human pending is not a technical failure; the finding remains `not_assessed`.

## Permanent archive target and high availability

Physical isolation is required. The Academy project `nwxnyqlyzyufgoadtqxs` is rejected as the archive target because its live boundary includes Applications tables; Academy or Applications mutations performed: `false`. The dedicated project is `awaiting_fresh_cost_confirmation` at the observed quote of $10/monthly.

HA is `not_configured_not_tested` and meets the requirement: `false`. Target RTO is at most 60 minutes and target RPO is at most 15 minutes. A read-only asynchronous replica provides redundancy but is not, by itself, verified automatic writable-primary failover. HA remains pending until an exact-revision failover and restoration test passes.

Required HA evidence:

- Dedicated archive project and exact infrastructure configuration
- Physical backup or PITR configuration receipt
- Replica or approved alternate redundancy configuration receipt
- Replication-lag observation
- Exact-release backup restoration test
- Exact-release failover or documented recovery exercise
- Measured RTO and RPO
- SHA-256 hashes for every final test artifact

## Public website credential remediation

The canonical page [https://www.obserrallc.com/about](https://www.obserrallc.com/about) currently serves Vercel deployment `dpl_FdYBScoDxVX3bDFkk2dTwyvxtBPa` at commit `0e72459a8940f23976038d85d6394409000f48c5`. Live technical result is `failed`: 9 of 9 EC-Council images had zero natural dimensions.

The release is `published_ready_staged_not_canonical` at exact merged commit `2dde838ee176e6f450abeca2daad96ab377ed931` and Vercel deployment `dpl_5wuL2pUUGcpgk6z7HgvZyVrQLbpd`; it is not canonical or final evidence. It contains 9 authorized local assets, 6 exact credential-holder uploads, and 3 live Active ADG issuer observations.

Authoritative candidate technical state is `not_tested` and therefore is not green. Local results are validation observations only:

| Candidate check | Non-authoritative outcome | Result |
| --- | --- | --- |
| `credential_manifest_integrity` | `satisfied_locally_non_authoritative` | Six of six tests were satisfied locally for inventory, live ADG observation binding, exact hashes/dimensions, provenance, authorized-only storage, and stale-fallback rejection. |
| `typescript` | `satisfied_locally_non_authoritative` | ./node_modules/.bin/tsc --noEmit completed with exit code 0. |
| `next_production_build` | `satisfied_locally_non_authoritative` | Next.js 16.3.1 candidate build completed with exit code 0 and generated all 163 static pages. |
| `local_asset_http` | `satisfied_locally_non_authoritative` | All nine direct candidate assets returned HTTP 200 with correct image MIME types; all six PNG optimizer paths returned HTTP 200. |

Human review is `pending`; pending human review is not a technical failure; the assessment finding is `not_assessed`. The current canonical production deployment is verified failed for all nine EC-Council images. Release 2dde838ee176e6f450abeca2daad96ab377ed931 is merged and its exact Vercel deployment is READY, but it remains staged rather than canonical because required deployment checks blocked custom-domain assignment. Local and staged-candidate validations remain non-authoritative; candidate technical state remains not_tested and no production-fix or final-evidence claim is permitted until the exact release is promoted, reverified on the canonical page, and bound to a hashed final result artifact.

## FDACS student-PII database audit

- Machine-readable: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json`
- Human-readable: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.md`
- Paired digest: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256`
- Evidence schema: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json`
- Live receipt: `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT-SOURCE.json`
- Verification: `npm run verify:fdacs-pii-audit`
- Live status: `live_hardened_activation_pending`

6 migrations are live in the isolated project. Provider results: 0 security findings, 0 unindexed foreign keys, 0 browser table privileges, 0 browser execute privileges across 102 FDACS routines, 64 explicit deny policies, and 5 valid/0 failed chains. Technical checks are 6 passed, 0 failed, and 5 not tested. Human review is `pending`; finding is `not_assessed`.

Preflight export `27ea0a5a-1c07-4c68-a37f-eb775df343fb` has payload SHA-256 `588eea7731526ff01704ae06b0b07381ec97340f7d162cb0cd3f3db1bd255d1e` and remains correctly non-final. The isolated live database hardening, zero browser routine grants, preflight generation, and three fail-closed export tests are verified. External encryption-key custody, encrypted export finalization, backup/restore, HA failover, real student workflow, licensing prerequisites, and production authorization remain pending.

## Legal identity source audit

- Machine-readable: `docs/compliance/LEGAL-IDENTITY-AUDIT.json`
- Human-readable: `docs/compliance/LEGAL-IDENTITY-AUDIT.md`
- Paired digest: `docs/compliance/LEGAL-IDENTITY-AUDIT.sha256`
- Machine schema: `docs/compliance/LEGAL-IDENTITY-AUDIT.schema.json`
- Fail-closed gate: `scripts/legal-identity-audit.mjs`
- Verification: `npm run verify:legal-identity-audit`

Authoritative technical state is `not_tested` and candidate validation is `satisfied_locally_non_authoritative` with 0 findings. Human review is `pending`, pending human review is not a technical failure, the assessment finding is `not_assessed`, and final-evidence eligibility is `false`. The generated source audit verifies only that the working-tree candidate satisfies the exact legal-name policy. Its authoritative technical result remains not_tested and cannot become green until an exact approved release is published, deployed READY to production, verified on the canonical endpoint, and bound to a hashed final result artifact.

## Scope

Included: `website`, `academy_lms`, `stripe_payments`, `stripe_identity`, `clerk_identity`, `fdacs_database`, `academy_database`, `cmmc_evidence_archive`, `vercel_runtime`, `github_ci`, `daily_media`, `direct_dependencies`, `organization_governance`.

Excluded: **Applications product workstream** — `app/apps/`, `app/api/apps/`, `app/portal/applications/`, `lib/apps/`.

## Governing and supplemental authorities

| Authority ID | Role |
| --- | --- |
| `32-cfr-part-170-2026-08-12` | governing_regulation |
| `dod-cmmc-l2-assessment-guide-v2.13-2024-09` | governing_assessment_guidance |
| `nist-sp-800-171r2-upd1` | incorporated_governing_requirement_baseline |
| `nist-sp-800-171a-june-2018` | incorporated_governing_assessment_procedure |
| `nist-sp-800-171r3-2024-05` | supplemental_forward_engineering_baseline |
| `nist-sp-800-171ar3-2024-05` | supplemental_forward_assessment_baseline |

## Verified local results

- Governing Revision 2 catalog contains 110 controls and 320 objectives.
- Supplemental Revision 3 catalog contains 97 controls and 510 objectives.
- Per-system register contains 13 systems and 3048 objective mapping rows with zero unmapped required objectives.
- Paired machine-readable JSON and human-readable Markdown are generated from the same in-memory bundle and bound by a SHA-256 manifest.
- Archive source gate verifies exact revisions, ownership, claim boundaries, assessor-only findings, indefinite retention, immutable evidence, paired views, and both integrity-chain verifiers.
- The isolated live FDACS database has six new audit/retention/identity/hardening migrations, 64 explicit browser-deny policies, zero browser execute grants across 102 FDACS routines, zero security-advisor findings, zero unindexed foreign-key findings, five valid integrity chains, and three verified live fail-closed export observations; the unpublished source gate is not_tested and production authorization remains false.
- The website credential release has nine authorized local assets, three live Active ADG issuer observations, a six-of-six integrity result, a clean TypeScript result, a complete Next.js production build, and HTTP 200 results for every direct/optimized asset path; release 2dde838ee176e6f450abeca2daad96ab377ed931 is merged and READY in Vercel but staged, while canonical production still fails all nine images and remains a live blocker.
- Vercel deployment checks identify two independent blockers: the code-controlled required job tested the pre-promotion canonical deployment, creating a circular gate, and Clerk reported incomplete or mismatched production DNS. The code-controlled workflow is remediated to separate pre-promotion source readiness from post-promotion exact-release verification; Clerk/DNS remains an explicit external pending action and is not bypassed or falsely passed.
- The fail-closed legal identity audit generated paired machine/human records, requires the exact legal entity and canonical public origin, preserves only enumerated product brands and stable technical identifiers, maps to CMMC configuration/evidence controls, and records the non-canonical release as not_tested rather than green.
- The optimized Next.js 16.3.1 candidate build generated all 163 static pages; TypeScript, quiet ESLint, the 57-test Node source suite, and regulated Florida Class D source gates through Gate 21 were satisfied locally. These are non-authoritative candidate validations and do not create a green technical result.
- The stale unsupported CMMC Phase II suspension statement was removed from historical supporting records.

## Live activation blockers

| ID | State | Required item |
| --- | --- | --- |
| `LIVE-001` | `complete` | Gate 37 was approved and merged through the governed GitHub main-branch process as signed commit 2dde838ee176e6f450abeca2daad96ab377ed931. |
| `LIVE-002` | `pending` | Obtain fresh confirmation for the quoted $10/month dedicated CMMC archive project. The Academy project is rejected because its shared service-role boundary includes Applications tables. |
| `LIVE-003` | `pending` | Create the dedicated archive project, apply both archive migrations, and verify functions, grants, RLS, immutability, retention constraints, and integrity checks. |
| `LIVE-004` | `pending` | Confirm any additional Small-compute, read-replica, and PITR costs; configure the approved resilience topology. |
| `LIVE-005` | `pending` | Run and hash exact-revision backup restoration, replication-lag, and failover/recovery tests; demonstrate RTO at or below 60 minutes and RPO at or below 15 minutes. |
| `LIVE-006` | `pending` | Configure protected OBSERRA_CMMC_ARCHIVE_URL and OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY environment secrets for the dedicated boundary. |
| `LIVE-007` | `pending` | Run an actual approved in-scope change, archive the exact-revision pair, read it through the controlled catalog, verify both chains and health, and retain the machine/human receipt. |
| `LIVE-008` | `pending` | Release stable continuous-audit links only after LIVE-001 through LIVE-007 are evidenced as complete. |
| `LIVE-009` | `pending` | Publish the Gate 38 deployment-check remediation, allow the intended Vercel project to promote the exact release, and verify all nine EC-Council images have nonzero dimensions and every ADG link resolves to its individual active issuer record. |
| `LIVE-010` | `pending` | Complete the external Clerk production-domain/DNS configuration for obserrallc.com. Remote Clerk authentication is unavailable in this environment; this gate is recorded and must not be bypassed or mislabeled as satisfied. |

## Continuous audit links

Not released: Withheld until an actual production archive receipt and end-to-end approved-change run are verified.

## Resume order

1. Regenerate and verify the CMMC evidence pair and website credential manifest after every in-scope source change without modifying Applications paths.
2. Publish the approved Gate 38 deployment-check remediation through the governed GitHub path, then observe the exact intended-project Vercel deployment.
3. Keep the Clerk production-domain/DNS gate explicitly pending; do not bypass or falsely satisfy it. After its external completion, promote and reverify the nine website credential images plus three ADG issuer links on the canonical page.
4. Obtain the fresh $10/month dedicated-project confirmation; do not use the Academy or FDACS project as the archive target.
5. Create the isolated archive project, then apply and verify the archive migrations without modifying Academy or Applications tables.
6. Confirm and configure the approved HA/backup topology, then run exact-revision recovery tests.
7. Configure and verify the live archive boundary and protected secrets.
8. Publish through the governed GitHub approval path and observe the first exact-revision archive run.
9. Verify the machine receipt, human receipt, catalog record, artifact chain, access-event chain, archive health, and indefinite retention state.
10. Populate and release the stable continuous-audit links.
11. Resume LMS, website, payment, identity, HA, FDACS, Academy, dependency, and provider production-readiness work while updating this record.

## Claim boundary

This handoff records implementation and verification state. It does not claim CMMC certification, a MET assessment finding, authorization to process CUI, FDACS approval, production archive activation, or completion of any item still marked pending.
