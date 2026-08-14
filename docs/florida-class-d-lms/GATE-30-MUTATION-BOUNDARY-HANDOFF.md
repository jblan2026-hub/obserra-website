# Gate 30 Regulated Mutation Boundary Handoff

Snapshot: 2026-08-13

## Status

Gate 30 is implemented and validated at exact five-green source checkpoint:

`37ea4c345c5181c3f086e64f0f9b3926fbf17245`

Production remains fail closed. Gate 30 does not authorize regulated launch or production database promotion.

## Purpose

Gate 30 prevents any Class D HTTP mutation route from executing regulated state changes unless the shared regulated execution policy authorizes the request. The control is secure by default and applies to current and future Class D write routes under `/api/florida-class-d/**`.

## Boundary model

`lib/florida-class-d-mutation-boundary.ts` classifies POST, PUT, PATCH, and DELETE requests under the regulated Class D API namespace.

- Gate 23 acceptance mutation at `/api/florida-class-d/admin/acceptance` is authorized only by `floridaClassDNonProductionExecutionAuthorized()` and therefore remains synthetic-nonproduction-only.
- Every other regulated mutation requires `floridaClassDRegulatedExecutionAuthorized()`.
- Read-only methods are not converted into write authorization checks.
- Existing route-level Gate 26/shared execution checks remain defense in depth where already implemented.

`proxy.ts` evaluates this boundary before a regulated write request can reach the route handler. Unauthorized writes return HTTP 503 with controlled error codes and no secret disclosure.

## Inventory evidence

`scripts/florida-class-d-regulated-mutation-boundary-gate.mjs` recursively inventories Class D route handlers and discovered 22 mutation-route files at the validated checkpoint.

The gate verifies:

- the global proxy imports and calls the regulated mutation boundary;
- the proxy matcher covers API requests;
- unauthorized regulated writes fail closed;
- Gate 23 acceptance has its separate synthetic-nonproduction-only policy;
- the boundary covers POST, PUT, PATCH, and DELETE;
- the boundary imports the authoritative production/synthetic execution policy;
- all discovered Class D mutation routes are covered automatically;
- route-level checks remain visible as defense-in-depth evidence where present.

The acceptance route itself also contains an explicit route-level `floridaClassDNonProductionExecutionAuthorized()` guard.

## CI evidence

All five primary workflows are green on exact SHA `37ea4c345c5181c3f086e64f0f9b3926fbf17245`:

- Florida Class D LMS Gates #468;
- Website CI #2081;
- Academy 70x Production Gate #1186;
- Application Release Validation #875;
- Application Production Pipeline #894.

Florida Class D LMS Gates #468 passed Gates 1-30, repository contract tests, static quality validation, and the production Next.js build.

## Production and regulatory boundary

Gate 30 is an application execution-safety control. It is not FDACS approval.

Public regulated enrollment, real learner access, production scheduling/live instruction/examination, LIAS production execution, certificate release, production Class D database promotion, and regulated runtime activation remain disabled until actual Class DS authorization and all final production conditions pass.
