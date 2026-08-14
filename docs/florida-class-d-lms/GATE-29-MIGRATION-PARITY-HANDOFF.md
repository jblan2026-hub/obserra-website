# Gate 29 Regulated Migration Parity and Promotion Manifest Handoff

Snapshot: 2026-08-13

## Status

Gate 29 is being implemented on top of exact Gates 1-28 five-green source checkpoint:

`595465a76675693fdcc1b5e5d9a14269a7ccbdfd`

Production remains fail closed. Gate 29 does not apply a production database migration and does not authorize production activation.

## Purpose

Gate 29 makes regulated database promotion depend on the exact ordered Class D migration lineage and a deterministic SHA-256 promotion manifest. Schema similarity alone is not sufficient production evidence.

The controlled lineage contains exactly 27 regulated migrations, beginning with `20260813033000_fdacs_class_d_regulated_records.sql` and ending with `20260814011203_fdacs_class_d_fk_performance_indexes.sql`.

## Deterministic manifest

`scripts/florida-class-d-migration-manifest.mjs`:

- enumerates only `fdacs_class_d` migration files;
- requires the exact expected ordered 27-file lineage;
- fails on missing, extra, reordered, or renamed regulated migrations;
- computes SHA-256 for every migration file from the exact checked-out bytes;
- builds a deterministic canonical JSON manifest;
- computes a SHA-256 digest for the canonical manifest;
- can write the evidence manifest to a workflow artifact;
- prints the migration count, latest version, and manifest digest without exposing credentials or runtime secrets.

The deterministic manifest does not contain learner PII, credentials, license values, protected exam content, or database connection details.

## Production activation binding

The completed Gate 29 design requires Gate 26 production activation to verify all of the following:

- the database-promotion source SHA exactly matches the frozen production release candidate SHA;
- the applied regulated migration version is exactly `20260814011203`;
- the runtime-provided regulated migration-manifest SHA-256 exactly matches the source-controlled expected manifest SHA-256;
- the existing `OBSERRA_FDACS_DB_PROMOTION_STATUS` remains `verified`;
- all other Gate 26 production, licensing, HA, rollback, security, and owner-approval conditions remain satisfied.

This binds production database evidence to the exact validated migration bytes rather than to an operator-entered generic success state.

## Non-production evidence baseline

The regulated non-production branch is:

- branch: `obserra-fdacs-lms-nonprod`
- project ref: `jeklrsratrijrsamdauv`
- parent project: `nwxnyqlyzyufgoadtqxs`

Its applied migration history includes the recovered security migration `20260813204215` and Gate 28 migration `20260814011203`.

Gate 28 post-migration verification found zero Class D foreign-key constraints without a covering index and zero Class D `unindexed_foreign_keys` advisor findings.

The main connected Supabase project remains without any `public.fdacs_class_d_*` objects. Production promotion has not occurred.

## CI evidence

The dedicated Florida Class D workflow will:

1. generate the deterministic migration manifest from the checked-out source;
2. retain the manifest as a workflow artifact tied to the exact Git SHA;
3. run Gate 29 source verification;
4. continue repository tests, lint, and production build only if the migration lineage and Gate 26 binding are valid.

The manifest artifact is evidence for a specific Git commit. It is not FDACS approval and is not permission to promote production.

## Promotion evidence requirements

Before any future authorized production database promotion can be marked verified, the controlled evidence must retain:

- exact frozen candidate SHA;
- exact GitHub workflow/run that generated the migration manifest;
- manifest SHA-256;
- latest expected regulated migration version;
- target production database/project identity;
- pre-promotion backup/recovery evidence;
- migration execution result;
- applied migration-history verification;
- post-migration schema/control verification;
- post-migration Class D foreign-key coverage verification;
- rollback or forward-compensating-change status;
- owner/compliance approval state.

## Security boundary

Gate 29 does not expose database credentials or make migration endpoints public. It does not add browser database privileges and does not weaken RLS/service-role isolation.

No production migration is executed by Gate 29 CI.

## Primary artifacts

- `scripts/florida-class-d-migration-manifest.mjs`
- `scripts/florida-class-d-migration-parity-gate.mjs`
- `lib/florida-class-d-production-activation.ts`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/ACTION-LEDGER.md`

## Validation sequence

1. Generate the manifest in CI and capture the deterministic SHA-256 for the exact regulated source lineage.
2. Bind that digest and latest migration version into Gate 26 source controls.
3. Require the deployment/promotion evidence variables to match the source-controlled digest, version, and release candidate SHA.
4. Run the complete Gates 1-29 workflow, repository tests, lint, and production build.
5. Establish a new exact five-green source checkpoint only after all five primary workflows pass on the same SHA.
6. Do not apply any production database migration until the separately governed production-promotion sequence is authorized.

## Production and regulatory boundary

Gate 29 is a software-supply-chain and database-promotion integrity control. It is not FDACS approval.

Production regulated enrollment, learner access, scheduling, instruction, examination, LIAS execution, certificate release, database promotion, and runtime activation remain fail closed until actual Class DS authorization and every final production condition passes.
