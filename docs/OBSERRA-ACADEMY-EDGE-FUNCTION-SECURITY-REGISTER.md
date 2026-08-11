# Obserra Academy Edge Function Security Register

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Supabase project: `Obserra Academy`

Project reference: `nwxnyqlyzyufgoadtqxs`

Recorded: 2026-08-11

Status: Active security remediation register

## Governing rule

Every Edge Function must have an explicit business owner, approved caller population, authentication method, authorization scope, data classification, logging rule, and retirement decision.

Functions related to the retired local Windows worker farm, obsolete Academy production pipelines, legacy command center publication, or unapproved owner work automation must not remain callable merely because their source code exists.

## Preserved pre-containment inventory

| Function | Pre-containment version | Pre-containment hash | Previous authentication | Current decision |
| --- | ---: | --- | --- | --- |
| `academy-public-catalog` | 1 | `c3d792978d56b05c0cb303f1c00f05368c8b0f3344e99b7baac9d631138ddf0e` | Public, no platform JWT, service role used internally | Retain only as service role private catalog. Version 2 deployed. |
| `academy-owner-control` | 1 | `4dbcab30928c6a2d66fec9f12e172aa841301178f122d91ef683c47360a51076` | Custom Clerk JWT and owner identity verification | Temporarily retain. Complete focused custom authentication review. |
| `academy-checkpoint-gateway` | 4 | `dbe515ee77cd77829e0629efde0b1b14362768b570494af0a8f4549241e0aa3f` | Custom GitHub OIDC tied to a separate public production-studio repository | Retire and make inert. The governed commercial path no longer depends on it. |
| `academy-local-worker-control` | 14 | `d28b65931fb1a1eaba60a25489704e6f3417e1052d7f06c86ea11a3a89eb3bb2` | Static bearer-token hash embedded in function source | Retire and make inert. Local worker farm is not the approved production path. |
| `academy-local-worker-diagnostics` | 3 | `f6f4c12f4cec90a38dc64c92e38c727bcf65931fb1a1eaba60a25489704e6f3` | Static bearer-token hash embedded in function source | Retire and make inert. |
| `academy-command-center-publish` | 1 | `72aa4a1163d9b75b0b8e8bafc6c4661b9ce6b3c83e1d5c68956e80a6e88cf11c` | Public health route plus static bearer-token hash | Retire and make inert. LearnWorlds and explicit owner acceptance are the approved publication path. |
| `application-worker-control` | 4 | `4c23c63515ba2942a2b33647c73cf5b25cb04a0fb43ff44fcb19dfa0332a15a1` | Static bearer-token hash embedded in function source | Retire and make inert pending a separate secure platform design. |
| `academy-worker-operations` | 5 | `b82ac4386ddd05b8c98e1442046aa2c12e99f38f0347c69d4df2d30127c0c0b5` | Static bearer-token hash embedded in function source | Retire and make inert. |
| `owner-work-control` | 2 | `70c7b25d5d0e0ae1e8d6dbdc406ac0fecb8e04f3cbe2b8bd28a25f368e0ffc7b` | Static bearer-token hash embedded in function source | Retire and make inert pending owner-only redesign. |
| `obserrian-control` | 1 | `3de3dded09e792f0444d81cd6dc43fa442b9988b6c27c3c67a2f3486140e9022` | Custom Clerk owner JWT or the same static local bearer token | Retire and make inert pending an isolated owner-only redesign. Persistent memory and actions are sensitive. |
| `obserra-production-control` | 1 | `7bf4a66524d0526908b8a4de24e139495047dd55c3c06e1b34d59f861eeaf5ab` | Public health route plus static bearer-token hash | Retire and make inert. |
| `academy-production-control` | 1 | `fa2b9b89c0fd3ddfd9fa1b379872240ac97ddf2ac326af99fb797bde123765b5` | Static bearer-token hash embedded in function source | Retire and make inert. |
| `academy-owner-release-control` | 2 | `990c97d67850c935058e36c1b7b4d4342f4f9b8fb9030359ed89ddaf0f8a6bbe` | Public health route plus static bearer-token hash | Retire and make inert. |

## Static token finding

The same SHA-256 token digest was embedded across multiple legacy functions:

```text
49fd34b00dd348760f632382d4a284d0c5036bae5a71e1d2beaa7603090236c7
```

The original token value is not recorded here and was not returned by the review. Reuse of one static authorization secret across multiple high-privilege service-role functions created excessive blast radius and prevented independent rotation and revocation.

The token must be considered retired. No new function may use this digest or the corresponding token.

## Inert function standard

A retired function is redeployed with:

1. Supabase platform JWT verification enabled.
2. No Supabase client creation.
3. No service role key use.
4. No database access.
5. No cross origin access.
6. No public health or status information.
7. Private, no-store response headers.
8. A generic 404 response for every method.
9. Preserved previous version and hash in this register for audit and recovery.

## Functions retained during containment

### `academy-public-catalog`

Retained only as a private server-to-server function. It requires a platform validated service role JWT and defaults missing control records to unpublished and not purchasable.

### `academy-owner-control`

Temporarily retained because the website owner control path may depend on it. It uses custom Clerk JWT verification and compares the verified identity to the protected owner identity record.

Required follow-up review:

1. Restrict issuer to the configured Clerk issuer rather than an arbitrary safe HTTPS issuer.
2. Remove wildcard `*.vercel.app` origin acceptance and use an exact preview allowlist if previews remain required.
3. Confirm the owner bootstrap code is expired or rotated.
4. Confirm owner identity binding and recovery procedure.
5. Add rate limiting and audit alerts.
6. Confirm every owner mutation remains revision bound and fail closed.
7. Consider placing the function behind the private owner site and a separate Supabase project or private backend.

## Truth boundary

This register preserves the security classification and old function identities. It does not prove that a retired function has been made inert until the current Supabase function inventory confirms a new inert version with platform JWT verification enabled.
