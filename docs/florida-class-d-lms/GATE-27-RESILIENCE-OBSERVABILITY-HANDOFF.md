# Gate 27 Production Resilience and Observability Handoff

Snapshot: 2026-08-13

## Status

Gate 27 is implemented in source on top of the exact Gate 26 five-green checkpoint `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`. CI acceptance of Gate 27 remains pending until the dedicated Gates 1-27 workflow passes on the final Gate 27 source head.

Production remains fail closed.

## Purpose

Gate 27 separates four operational concepts that must never be conflated:

1. **Liveness**: the application process is responding.
2. **Technical readiness**: non-license technical dependencies and controlled runtime conditions are ready.
3. **High availability**: all Gate 26 HA evidence-state checks currently pass.
4. **Production activation authorization**: the full Gate 26 production release authorization is satisfied.

None of these states is FDACS approval.

## Public health surfaces

Gate 27 adds minimal non-cacheable health endpoints:

- `/api/florida-class-d/health/live`
- `/api/florida-class-d/health/ready`

The liveness endpoint returns only the service identifier and `live` state. It does not return configuration, dependency, license, release, user, infrastructure, or authorization detail.

The readiness endpoint returns only the service identifier and `ready` or `not_ready`. It returns HTTP 503 with a bounded retry hint when technical readiness or HA is not satisfied. It does not expose blocker details publicly.

Liveness is not readiness. Readiness is not production activation authorization.

## Protected operational view

Authorized `school_admin` and `compliance_admin` staff receive a detailed non-cacheable resilience snapshot through:

- `/api/florida-class-d/admin/resilience`
- `/florida-security-training/admin/resilience`

The protected snapshot combines the Gate 22 production runtime-readiness report and Gate 26 production-activation report, identifies HA check pass/fail state, separates readiness from activation, and suppresses secret values.

## High availability relationship

Gate 27 does not replace Gate 26 HA requirements. It operationalizes their visibility.

HA remains mandatory for:

- edge/DNS;
- application runtime;
- identity/authentication;
- regulated database/persistence;
- live instructional media;
- completion-document storage;
- commerce/payment dependency;
- observability and alerting;
- backup/restore;
- end-to-end failover.

Gate 26 remains the source of the controlled HA thresholds: RTO 60 minutes or less, RPO 15 minutes or less, and end-to-end failover evidence no older than 90 days at activation.

## Security and privacy boundary

- Public health responses are intentionally minimal.
- Detailed health state requires server-side staff authorization.
- Detailed responses are private and non-cacheable.
- Secret values are not returned.
- Health endpoints do not expose license numbers, provider credentials, database project identifiers, learner data, exam content, or regulated evidence details.
- A healthy or ready response does not enable a regulated feature flag.
- A health response does not create missing attendance, instructional-time, text-screen, examination, LIAS, or completion evidence.

## Primary artifacts

- `lib/florida-class-d-resilience.ts`
- `app/api/florida-class-d/health/live/route.ts`
- `app/api/florida-class-d/health/ready/route.ts`
- `app/api/florida-class-d/admin/resilience/route.ts`
- `app/florida-security-training/admin/resilience/page.tsx`
- `scripts/florida-class-d-resilience-observability-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`

## Baseline and rollback

Gate 27 starts from validated source checkpoint `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`, where all five primary workflows were green and Florida Class D LMS Gates #422 passed Gates 1-26 and the production build.

Gate 27 makes no production database migration and performs no regulated production activation. Source rollback is available through normal Git history.

## Next governed actions

1. Make Gate 27 mandatory in the dedicated regulated workflow.
2. Run Gates 1-27, repository tests, lint, and the production build on the exact Gate 27 head.
3. Record the exact workflow results in `ACTION-LEDGER.md` and the restart handoff set.
4. Continue authentic production HA/observability evidence preparation, including external dependency monitoring and failover evidence.
5. Keep production regulated functions fail closed until actual licensing and every final production authorization condition passes.
