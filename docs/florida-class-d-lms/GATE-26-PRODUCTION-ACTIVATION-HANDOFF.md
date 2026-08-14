# Gate 26 Production Activation Authorization Handoff

Snapshot: 2026-08-13 21:02 ET

## Status

Gate 26 is implemented in source, mandatory in the dedicated Florida Class D workflow, and CI-accepted on exact validated source SHA:

`1b6a35bdb289faaa15e5fdc1eb814cd607e65425`

Florida Class D LMS Gates #422 passed Gates 1-26, the Gate 26 verifier, repository tests, lint/static quality validation, and the production Next.js build on that exact SHA.

The other four primary workflows are also green on the same exact SHA:

- Website CI #1989.
- Academy 70x Production Gate #1140.
- Application Release Validation #829.
- Application Production Pipeline #848.

Production remains fail closed. Gate 26 CI acceptance is not FDACS approval and does not itself authorize launch.

## Purpose

Gate 26 establishes a single production release authorization boundary for the regulated Florida Class D LMS. It prevents an individual feature flag, license value, deployment, or infrastructure change from independently making the regulated production system live.

## Exact release binding

Production authorization requires all three Git SHAs to be valid 40-character commit SHAs and to match exactly:

1. `OBSERRA_FDACS_RELEASE_CANDIDATE_SHA`
2. `OBSERRA_FDACS_UAT_ACCEPTED_RELEASE_SHA`
3. `VERCEL_GIT_COMMIT_SHA`

The accepted Gate 23 UAT evidence must therefore be bound to the exact frozen candidate that is deployed to production.

## Required production conditions

Gate 26 requires, at minimum:

- production Vercel runtime;
- canonical public origin `https://www.obserrallc.com`;
- live Clerk production identity configuration;
- protected Supabase HTTPS runtime and server-side service credential;
- Daily production media provider and protected credential;
- actual active Class DS state and privately configured issued Class DS number;
- private authorized Class DI license number;
- controlled private completion-document bucket;
- verified production database promotion and post-migration checks;
- authorized examination-bank boundary;
- verified LIAS operating procedure;
- approved production security acceptance;
- verified rollback capability;
- mandatory high availability and recovery evidence;
- owner release approval for the exact candidate;
- explicit final production activation authorization.

License issuance alone cannot authorize activation.

## High availability requirement

HA is mandatory for the complete production service chain:

- edge/DNS;
- application runtime;
- identity/authentication;
- regulated database/persistence;
- live media;
- completion-document storage;
- commerce/payment dependency;
- observability and alerting;
- backup/restore;
- end-to-end failover.

Gate 26 currently enforces:

- RTO of **60 minutes or less**;
- RPO of **15 minutes or less**;
- a successful end-to-end failover exercise **no older than 90 days** at activation.

Every HA evidence-state marker must be supported by authentic retained evidence. Vendor service claims alone do not satisfy the Obserra production verification requirement.

## Independent regulated feature controls

Gate 26 does not replace per-subsystem switches. The regulated feature inventory includes live instruction, media, scheduling, make-up, recorded make-up, exam, exam administration, completion review, LIAS workflow, completion documents, quality, and pre-enrollment.

A production subsystem requires Gate 26 authorization plus its applicable independent feature control where implemented.

Current explicit Gate 26 or shared regulated-execution integrations that are enforced by the Gate 26 CI verifier:

- live instruction;
- production scheduling;
- regulated learner enrollment API;
- student final-examination API;
- LIAS administration;
- official completion-document ingestion.

Attempts to add broader Gate 26 wiring to certain make-up, completion-approval, quality, and proxy boundaries were rejected before changing GitHub. Those attempts are recorded in `ACTION-LEDGER.md` and must not be represented as implemented.

## UAT separation

Gate 23 remains the controlled non-production acceptance path. Non-production acceptance is limited to explicitly designated development, sandbox, staging, or UAT environments and synthetic identities. UAT evidence is not production evidence.

The Gate 26 module defines an explicit non-production execution authorization model requiring authorized non-production environment designation, non-production acceptance authorization, synthetic-identity-only mode, and explicit non-production execution authorization. This does not authorize production and must not be represented as production operation.

## CI enforcement

Mandatory verifier:

`scripts/florida-class-d-production-activation-gate.mjs`

Mandatory workflow step:

`Run Gate 26 production activation source verification`

Dedicated workflow job:

`Gates 1-26 and website compatibility`

The verifier confirms exact release binding, production prerequisites, complete regulated feature inventory, HA evidence inputs, recovery objectives, failover-test recency, protected staff visibility, dedicated Gate 26 handoff, and the source integrations listed above.

## Audit authority

Detailed Gate 26 action history is maintained append-only in `ACTION-LEDGER.md`.

Important milestones include:

- `0e56b2a5dbea4974565c90ff71e0fa8f01c27be2`: introduced Gate 26.
- `f7757d9e76d7ddb6fce1c70c4dd3b60061e2771f`: added mandatory HA, RTO/RPO, failover recency, and explicit non-production execution separation.
- `ff6d1d5a99fd6a0f5d3f5dda1ec1e7b38f4e1d23`: bound LIAS administration to shared regulated execution authorization.
- `e9d908b5c1f2c173a5ba3839faab459c0c4ca90e`: bound official completion-document ingestion to shared regulated execution authorization.
- `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`: exact current five-green source checkpoint, including Gate 26 CI acceptance.

Historical failed runs #403 and #415 remain preserved in the action ledger and must not be relabeled successful.

## Production and regulatory boundary

Gate 26 is an Obserra production engineering control. It is not FDACS approval.

Public regulated enrollment, real learner access, production scheduling, live instruction, production examination, LIAS execution, completion/certificate release, observer production access, production database promotion, and runtime activation remain disabled until actual Class DS authorization and all applicable final production gates pass.

Official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra. Forty instructional hours alone do not earn a completion certificate.

## Next governed actions

1. Preserve `1b6a35bdb289faaa15e5fdc1eb814cd607e65425` as the current exact validated Gate 26 five-green source checkpoint.
2. Continue production resilience and observability engineering as the next controlled milestone.
3. Produce authentic HA, failover, backup/restore, observability, and recovery evidence for every production dependency.
4. Reconcile the authoritative existing Vercel project directly without project movement or DNS change.
5. Freeze the final production candidate and execute a new exact-candidate-bound 18-of-18 Gate 23 synthetic UAT acceptance.
6. Complete remaining production database, identity, media, exam-bank, LIAS, commerce, observability, security, rollback, HA, and owner-approval gates.
7. Keep production fail closed until actual licensing and every final production authorization condition passes.
