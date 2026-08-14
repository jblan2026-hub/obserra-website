# Gate 26 Production Activation Authorization Handoff

Snapshot: 2026-08-13

## Status

Gate 26 is implemented in source and is mandatory in the dedicated Florida Class D workflow. CI acceptance on the final synchronized head remains subject to the complete Gates 1-26 workflow passing.

Production remains fail closed.

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
- identity;
- database;
- live media;
- completion-document storage;
- commerce/payment dependency;
- observability;
- backup/restore;
- end-to-end failover.

Gate 26 currently enforces:

- RTO of 60 minutes or less;
- RPO of 15 minutes or less;
- a successful end-to-end failover exercise no older than 90 days at activation.

Every HA evidence-state marker must be supported by authentic retained evidence. Vendor service claims alone do not satisfy the Obserra production verification requirement.

## Independent regulated feature controls

Gate 26 does not replace per-subsystem switches. The regulated feature inventory includes live instruction, media, scheduling, make-up, recorded make-up, exam, exam administration, completion review, LIAS workflow, completion documents, quality, and pre-enrollment.

A production subsystem requires both Gate 26 authorization and its independent feature control where implemented.

Current explicit Gate 26 integrations include:

- live instruction;
- production scheduling;
- regulated learner enrollment API;
- student final-examination API.

Additional production-impacting integrations must preserve the dedicated Gate 23 synthetic acceptance path.

## UAT separation

Gate 23 remains the controlled non-production acceptance path. Non-production acceptance is limited to explicitly designated development, sandbox, staging, or UAT environments and synthetic identities. UAT evidence is not production evidence.

The Gate 26 source module also defines an explicit non-production execution authorization model for future controlled test tooling. Production learner/live/exam routes remain production-only unless separately implemented and validated for synthetic acceptance use.

## CI enforcement

Mandatory verifier:

`scripts/florida-class-d-production-activation-gate.mjs`

Mandatory workflow step:

`Run Gate 26 production activation source verification`

Dedicated workflow job name:

`Gates 1-26 and website compatibility`

The verifier confirms exact release binding, production prerequisites, full regulated feature inventory, HA evidence inputs, recovery objectives, failover-test recency, protected staff visibility, and source-level Gate 26 integration.

## Audit history

- `0e56b2a5dbea4974565c90ff71e0fa8f01c27be2`: introduced the Gate 26 production-activation module.
- `a1b345282f5a3e98c1cf9559188b001f0f35bd5f`: bound live instruction to Gate 26.
- `96f53288d1fc5c7f614d11d671cc2dc5f2903c41`: bound production scheduling to Gate 26.
- `a046d450d1d2f5bf00510c5f6816febc893347ff`: added the protected Gate 26 staff console.
- `97922d7a3adb7dd64e1179e754ec8f507fe5a3e1`: bound regulated enrollment API execution to Gate 26.
- `f0600bcd2ba66cfbbf6673256b1d7e1e747a4f62`: bound student final-examination API execution to Gate 26.
- `fc48865b8383c80ea1ccfa399ab63d6dbef42286`: expanded Gate 22 to the full known regulated feature inventory.
- `d91486d54b4e0b8223708386b9913109e774a703`: added the Gate 26 source verifier.
- `92d2d66ce9bdafd7be7c00c5ed92fa845c11d5b5`: made Gate 26 mandatory in the dedicated workflow.
- `f7757d9e76d7ddb6fce1c70c4dd3b60061e2771f`: added mandatory HA, RTO/RPO, failover recency, and explicit non-production execution separation.
- `5e702fe1c27a4149cc1eb8a2383a8a56108dde42`: extended the Gate 26 verifier to enforce the HA requirements.
- Florida Class D LMS Gates #415 on `5e702fe1...` failed before Gate 26 ran because the consolidated historical Gate 3 handoff phrase had been lost. The failure remains audit evidence and does not constitute Gate 26 acceptance.
- `cbe7085e99747ad91c74124c35d13aa90f70df2e`: restored the exact five-green Gates 1-25 handoff contract while preserving the Gate 26/HA addendum.
- `2cb92385bc62bef986289706bd48b1dd9fd1de38`: synchronized `LATEST-HANDOFF.md`.
- `9d390ac11095b3aa3caf04af0c4959fe97425915`: synchronized `CURRENT-STATUS-2026-08-13.md` and corrected current Vercel governance state.

## Production and regulatory boundary

Gate 26 is an Obserra production engineering control. It is not FDACS approval.

Public regulated enrollment, real learner access, production scheduling, live instruction, production examination, LIAS execution, completion/certificate release, observer production access, production database promotion, and runtime activation remain disabled until actual Class DS authorization and all applicable final production gates pass.

Official FDACS-16103 remains LIAS-generated and must not be synthesized by Obserra. Forty instructional hours alone do not earn a completion certificate.

## Next governed actions

1. Obtain a complete green Gates 1-26 workflow on the synchronized exact head.
2. Record final run identifiers in the restart handoff set.
3. Continue Gate 26 integration for remaining production-impacting subsystems without weakening Gate 23 synthetic acceptance.
4. Produce authentic HA, failover, backup/restore, observability, and recovery evidence for every production dependency.
5. Reconcile the authoritative existing Vercel project directly without project movement or DNS change.
6. Freeze the final production candidate and execute a new candidate-bound 18-of-18 Gate 23 synthetic UAT acceptance.
7. Keep production fail closed until actual licensing and all final production authorization conditions pass.
