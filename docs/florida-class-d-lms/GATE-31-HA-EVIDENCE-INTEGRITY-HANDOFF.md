# Gate 31 HA Evidence Integrity Handoff

Snapshot: 2026-08-13

## Status

Gate 31 is implemented and validated at exact five-green source checkpoint:

`4581747e4fcf0adbea8ef7e34dafa314f7ac8092`

Production remains fail closed. Gate 31 does not itself prove external provider HA, does not fabricate evidence, and does not authorize regulated activation.

## Purpose

Gate 31 prevents operator-set HA status strings from being sufficient production evidence. Gate 26 now additionally requires a candidate-bound, cryptographically verified HA evidence manifest before production activation can become authorized.

## Evidence contract

`lib/florida-class-d-ha-evidence.ts` requires the protected HA evidence manifest to use schema:

`obserra.fdacs.class-d.ha-evidence.v1`

The manifest must be bound to the exact frozen release candidate SHA and contain exactly one current verified evidence entry for every required subsystem:

- edge/DNS;
- application runtime;
- identity;
- database;
- media;
- document storage;
- commerce;
- observability;
- backup/restore;
- failover.

Each subsystem evidence entry requires a controlled evidence reference, SHA-256 digest, verified status, and current observation timestamp.

The manifest also requires:

- a controlled evidence-package identifier;
- current review timestamp;
- RTO of 60 minutes or less;
- RPO of 15 minutes or less;
- end-to-end failover exercise no older than 90 days;
- exact release-candidate binding;
- a deterministic canonical manifest SHA-256 supplied separately in protected configuration.

The runtime recomputes the canonical manifest digest and compares it with the configured digest using a timing-safe comparison. Missing, malformed, stale, incomplete, candidate-mismatched, or digest-mismatched evidence fails closed.

## Gate 26 integration

`lib/florida-class-d-production-activation.ts` now sets `cryptographicHaEvidenceRequired: true` and includes a distinct `ha:evidence_manifest` production blocker.

Gate 26 requires `getFloridaClassDHaEvidenceReport(...)` to return ready for the exact release candidate. Existing HA status markers, RTO/RPO values, and failover recency checks remain independently required as defense in depth, but status markers alone cannot authorize production activation.

Protected runtime variables introduced by Gate 31 are:

- `OBSERRA_FDACS_HA_EVIDENCE_MANIFEST`
- `OBSERRA_FDACS_HA_EVIDENCE_MANIFEST_SHA256`

No HA evidence value is exposed through a `NEXT_PUBLIC_*` variable.

## CI enforcement

`scripts/florida-class-d-ha-evidence-integrity-gate.mjs` verifies that the HA contract retains:

- exact schema identifier;
- exact ten-subsystem coverage;
- SHA-256 hashing;
- timing-safe digest comparison;
- exact release-candidate binding;
- per-evidence SHA-256 requirements;
- evidence/review/failover recency;
- RTO/RPO ceilings;
- secret suppression;
- Gate 26 runtime dependency on `evidence.ready`;
- mandatory regulated workflow execution.

## CI evidence

All five primary workflows are green on exact SHA `4581747e4fcf0adbea8ef7e34dafa314f7ac8092`:

- Florida Class D LMS Gates #473;
- Website CI #2091;
- Academy 70x Production Gate #1191;
- Application Release Validation #880;
- Application Production Pipeline #899.

Florida Class D LMS Gates #473 passed Gates 1-31, repository contract tests, static quality validation, and the production Next.js build.

## External evidence boundary

Gate 31 intentionally does not create fake provider evidence. Production readiness still requires authentic retained evidence for every subsystem from the applicable provider/control plane plus a real failover exercise. If a required provider cannot be read through an authorized connection, that missing evidence remains a production blocker until the connection or controlled evidence is supplied.

## Production and regulatory boundary

Gate 31 is an HA evidence-integrity control. It is not FDACS approval.

Public regulated enrollment, real learner access, production scheduling/live instruction/examination, LIAS production execution, certificate release, production Class D database promotion, and regulated runtime activation remain disabled until actual Class DS authorization and all final production conditions pass.
