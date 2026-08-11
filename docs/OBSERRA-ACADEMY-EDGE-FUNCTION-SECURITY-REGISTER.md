# Obserra Academy Edge Function Security Register

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Supabase project: `Obserra Academy`

Project reference: `nwxnyqlyzyufgoadtqxs`

Recorded: 2026-08-11

Last updated: 2026-08-11

Status: Emergency Edge Function containment complete. Redesign and credential rotation remain pending.

## Governing rule

Every Edge Function must have an explicit business owner, approved caller population, authentication method, authorization scope, data classification, logging rule, and retirement decision.

Functions related to the retired local Windows worker farm, obsolete Academy production pipelines, legacy command center publication, or unapproved owner work automation must not remain callable merely because their source code exists.

## Preserved pre-containment inventory

| Function | Pre-containment version | Pre-containment hash | Previous authentication | Containment decision |
| --- | ---: | --- | --- | --- |
| `academy-public-catalog` | 1 | `c3d792978d56b05c0cb303f1c00f05368c8b0f3344e99b7baac9d631138ddf0e` | Public, no platform JWT, service role used internally | Retained only as service-role private catalog. |
| `academy-owner-control` | 1 | `4dbcab30928c6a2d66fec9f12e172aa841301178f122d91ef683c47360a51076` | Custom Clerk JWT and owner identity verification | Made inert during containment. Owner controls require a new isolated design. |
| `academy-checkpoint-gateway` | 4 | `dbe515ee77cd77829e0629efde0b1b14362768b570494af0a8f4549241e0aa3f` | Custom GitHub OIDC tied to a separate public production-studio repository | Made inert. |
| `academy-local-worker-control` | 14 | `d28b65931fb1a1eaba60a25489704e6f3417e1052d7f06c86ea11a3a89eb3bb2` | Static bearer-token hash embedded in source | Made inert. |
| `academy-local-worker-diagnostics` | 3 | `f6f4c12f4cec90a38dc64c92e38c727bcf6597c8d47f663f5fdad85ed3ff63b6` | Static bearer-token hash embedded in source | Made inert. |
| `academy-command-center-publish` | 1 | `72aa4a1163d9b75b0b8e8bafc6c4661b9ce6b3c83e1d5c68956e80a6e88cf11c` | Public health route plus static bearer-token hash | Made inert. LearnWorlds and explicit owner acceptance are the approved publication path. |
| `application-worker-control` | 4 | `4c23c63515ba2942a2b33647c73cf5b25cb04a0fb43ff44fcb19dfa0332a15a1` | Static bearer-token hash embedded in source | Made inert pending a separate secure platform design. |
| `academy-worker-operations` | 5 | `b82ac4386ddd05b8c98e1442046aa2c12e99f38f0347c69d4df2d30127c0c0b5` | Static bearer-token hash embedded in source | Made inert. |
| `owner-work-control` | 2 | `70c7b25d5d0e0ae1e8d6dbdc406ac0fecb8e04f3cbe2b8bd28a25f368e0ffc7b` | Static bearer-token hash embedded in source | Made inert pending owner-only redesign. |
| `obserrian-control` | 1 | `3de3dded09e792f0444d81cd6dc43fa442b9988b6c27c3c67a2f3486140e9022` | Custom Clerk owner JWT or the same static local bearer token | Made inert. Persistent memory and action data require an isolated owner-only design. |
| `obserra-production-control` | 1 | `7bf4a66524d0526908b8a4de24e139495047dd55c3c06e1b34d59f861eeaf5ab` | Public health route plus static bearer-token hash | Made inert. |
| `academy-production-control` | 1 | `fa2b9b89c0fd3ddfd9fa1b379872240ac97ddf2ac326af99fb797bde123765b5` | Static bearer-token hash embedded in source | Made inert. |
| `academy-owner-release-control` | 2 | `990c97d67850c935058e36c1b7b4d4342f4f9b8fb9030359ed89ddaf0f8a6bbe` | Public health route plus static bearer-token hash | Made inert. |

## Static token finding

The same SHA-256 token digest was embedded across multiple legacy functions:

```text
49fd34b00dd348760f632382d4a284d0c5036bae5a71e1d2beaa7603090236c7
```

The original token value is not recorded here and was not returned by the review. Reuse of one static authorization secret across multiple high-privilege service-role functions created excessive blast radius and prevented independent rotation and revocation.

The token is retired. No current function contains or accepts this digest. The original credential must still be revoked or rotated wherever it may exist outside Supabase function source.

## Inert function standard

Every retired function was redeployed with:

1. Supabase platform JWT verification enabled.
2. No Supabase client creation.
3. No service-role key use.
4. No database access.
5. No cross-origin access.
6. No public health or status information.
7. Private, no-store response headers.
8. A generic 404 response for every method.
9. The previous version and hash preserved in this register for audit and recovery.

## Current function inventory

All thirteen active function records now have platform JWT verification enabled.

| Function | Current version | Current hash | Current behavior |
| --- | ---: | --- | --- |
| `academy-public-catalog` | 2 | `7a7c8d2dcf118a72cde0513ee86435a21cb9e5701e5de5b25a60cbbf255112ae` | Functional, private server-to-server catalog. Requires service-role JWT. |
| `academy-owner-control` | 2 | `45052b56120697e19508a3098e9d858b14454d1309b06d416f57e7c374a7567b` | Inert 404. |
| `academy-checkpoint-gateway` | 5 | `8c5785c2e9867862a9c7e40db269e82749967892e60ed230d88f4f963e6f27de` | Inert 404. |
| `academy-local-worker-control` | 15 | `68b76997a9569a56bd6db682eb390c072e89215280c5e9d47fa13474fd5bc77f` | Inert 404. |
| `academy-local-worker-diagnostics` | 4 | `9a348f7097a4f7df3e86abb022c26fd76562ca8df5c0e165512a75c55e26c650` | Inert 404. |
| `academy-command-center-publish` | 2 | `fe4106503db386ac0ea2af6d8302191faca1280f935160fe1462423b754a7994` | Inert 404. |
| `application-worker-control` | 5 | `dd4d9e3e8936862e9977bb55d717f18dab2c9fc88e967b9968653d48294cb718` | Inert 404. |
| `academy-worker-operations` | 6 | `871d2da4a784f6098781603004b3924431f2dac5c0d7d5aca7a6b741136240a7` | Inert 404. |
| `owner-work-control` | 3 | `9900c9e77b3bb15a6f7d979798a2e7d56b959171d8fdbe64d4ef656645e25923` | Inert 404. |
| `obserrian-control` | 2 | `9b88c9667fc606dcada628413027d2e0b8fc5410d583d5bd458dee3f318c36f1` | Inert 404. |
| `obserra-production-control` | 2 | `3a84c44574d2c7b3f83eff148d2e30a62595c27e9d92c0120629936522b95af0` | Inert 404. |
| `academy-production-control` | 2 | `8a76a6690bc91dde5aec26e4d6f2219b3f31a2757e96225024bd44280e3eb82a` | Inert 404. |
| `academy-owner-release-control` | 3 | `812a121a0802cbf50f9f6e4bd86d07ab86c2a49772edc63e6c1f8fbd00ec80af` | Inert 404. |

Current summary:

```text
Active function records: 13
Platform JWT verification enabled: 13
Functional functions: 1
Functional service-role-only functions: 1
Inert retired functions: 12
Functions using the legacy static token digest: 0
Functions using service-role database access: academy-public-catalog only
```

## Application impact

The old owner-control, worker, diagnostics, persistent-memory, application-worker, production-control, checkpoint, and release-control function paths are unavailable by design.

Any application or script still depending on those endpoints will fail closed and must not be restored by reintroducing the shared static token. A replacement requires a separately approved architecture with independent credentials, exact caller identity, least privilege, short-lived tokens, rate limiting, complete audit logging, and an explicit business requirement.

## Deployment failure and correction

The first inert deployment attempt for `academy-checkpoint-gateway` failed because Supabase inherited the old absolute import-map path, which no longer existed for the new version.

Correction:

1. Added a minimal `deno.json` to the deployment payload.
2. Set `import_map_path` to `deno.json`.
3. Redeployed successfully as version 5 with platform JWT verification enabled.

Prevention rule:

When replacing a function that previously used an import map, explicitly provide a valid replacement import map even when the new inert function imports no packages.

## Truth boundary

The current Supabase inventory proves that all thirteen function records have platform JWT verification enabled and that twelve legacy functions were replaced by inert code.

This does not complete service-role key rotation, database-password rotation, JWT-signing-key review, log forensics, GitHub privacy remediation, or secure redesign of owner-only controls. No retired function may be reactivated from its preserved source without a new security review and explicit owner approval.
