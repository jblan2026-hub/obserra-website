# Gate 29 Regulated Migration Parity and Promotion Manifest Handoff

Snapshot: 2026-08-17

## Status

Gate 29 remains the fail-closed database-promotion integrity control for the Florida Class D LMS. It validates source lineage and deterministic promotion evidence; it does not execute a production migration and does not authorize regulated training delivery.

The current controlled source lineage contains exactly 41 regulated migrations, beginning with `20260813033000_fdacs_class_d_regulated_records.sql` and ending with `20260817104500_fdacs_class_d_completion_document_storage.sql`.

The latest migration adds the exact private storage boundary required by the completion-document service for retained official LIAS-generated FDACS-16103 PDF artifacts. It creates no student, enrollment, attendance credit, instructional credit, examination result, completion authorization, FDACS submission, certificate issuance, or LIAS action.

## Deterministic manifest

`scripts/florida-class-d-migration-manifest.mjs`:

- enumerates only regulated `fdacs_class_d` migration files;
- requires the exact expected ordered 41-file lineage;
- fails on missing, extra, reordered, or renamed regulated migrations;
- computes SHA-256 for every migration file from the exact checked-out bytes;
- builds deterministic canonical JSON;
- computes a SHA-256 digest for the canonical manifest;
- can write the evidence manifest to a workflow artifact;
- prints migration count, latest version, and manifest digest without exposing credentials or runtime secrets.

The current deterministic manifest values are:

- migration count: `41`;
- latest migration version: `20260817104500`;
- migration manifest SHA-256: `bbf692442c2e933892a56d34816dd11c05cdbc6de4092b157f475a6191a032a8`.

The manifest contains no learner PII, credentials, license values, protected exam content, or database connection details.

## Production activation binding

Gate 26 binds production database evidence to the exact source-controlled migration state. Before production database promotion can be marked verified:

- `OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA` must be a valid Git SHA and exactly match the frozen production release candidate SHA;
- `OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION` must exactly equal `20260817104500`;
- `OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256` must exactly equal `bbf692442c2e933892a56d34816dd11c05cdbc6de4092b157f475a6191a032a8`;
- `OBSERRA_FDACS_DB_PROMOTION_STATUS` must be `verified`;
- all other production, licensing, HA, rollback, security, LIAS, and owner-approval conditions remain independently enforced.

This prevents a generic operator-entered success state from substituting for exact migration evidence.

## FDACS record-control relationship

The new storage migration exists to support the record-retention and certificate-control requirements already enforced by the LMS data model:

- Rule 5N-1.140, F.A.C. requires Class D school records to remain retained and reproducible/transmittable for investigator inspection and requires the FDACS-16103 certificate to be generated through the school's LIAS reporting account.
- Rule 5N-1.142(4), F.A.C. requires successful Class D completion to be electronically reported through LIAS within 3 business days.
- FDACS-P-02188 establishes the LIAS submission/certificate workflow, including the unique Certificate Audit Control Number (ACN), correction history, current certificate, and school retention of LIAS-generated records.

The `fdacs-class-d-completion-documents` bucket is therefore private, limited to PDF, capped at 10 MB per object, and intended only for the school's retained official LIAS-generated certificate artifact. It is not a certificate generator and is not evidence by itself that a LIAS submission occurred.

See `docs/florida-class-d-lms/FDACS-CONTROL-MAPPING.md` for the control-to-schema mapping.

## Promotion evidence requirements

Before any authorized production database promotion can be marked verified, evidence must retain:

- exact frozen candidate SHA;
- exact GitHub workflow/run that generated the migration manifest;
- manifest SHA-256;
- latest expected regulated migration version;
- target production database/project identity;
- pre-promotion backup/recovery evidence;
- migration execution result;
- applied migration-history verification;
- post-migration schema/control verification;
- post-migration storage-boundary verification;
- post-migration Class D foreign-key coverage verification;
- rollback or forward-compensating-change status;
- owner/compliance approval state.

## Security boundary

Gate 29 does not expose database credentials, make migration endpoints public, add browser database privileges, or weaken RLS/service-role isolation.

No production migration is executed by Gate 29 CI.

## CI requirement

The dedicated Florida Class D LMS workflow must run Gates 1-35 and production deployment-integrity checks on relevant pull requests and relevant pushes to `main`, ensuring that the SHA eligible for Vercel production deployment also receives the regulated release checks.

A failed Gate 29 run remains audit evidence and must not be reclassified as success. A new exact-head run must pass after any lineage change.

## Production and regulatory boundary

Gate 29 is a software-supply-chain and database-promotion integrity control. It is not FDACS approval.

Production regulated enrollment, learner access, scheduling, instruction, examination, LIAS execution, certificate release, database promotion, and runtime activation remain fail closed until the actual Class DS authorization and every final production condition are satisfied.
