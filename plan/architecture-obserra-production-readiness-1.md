---
goal: Authoritative production roadmap for the Obserra website, Academy, Florida Class D LMS, live media, interactive visualization, identity, data, payments, security, capacity, and release controls
version: 1.0
date_created: 2026-08-19
last_updated: 2026-08-19
owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
status: 'In progress'
tags: [architecture, production, lms, security, identity, payments, performance, high-availability, video, audio, playback, design, branding, graphics, 3d, visualization, ci-cd]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

This file is the authoritative production execution plan for the current Obserra website and Florida Class D LMS work. All implementation, remediation, validation, deployment, and owner acceptance work must map to a task in this plan. The current active delivery vehicle is pull request 134 on branch `hotfix/owner-lms-test-access-20260817`. The production objective is a secure, highly available, optimized platform with real provider integrations, no mock or placeholder execution paths, and verified support for up to 200 concurrent authenticated students with explicit capacity headroom.

The platform must remain fail closed for regulated learner credit, attendance, completion, certificate issuance, and LIAS reporting until required external authorization is satisfied. Existing learner entitlements must remain intact.

## 1. Requirements & Constraints

- **REQ-001**: The platform must use real configured providers for production authentication, database, storage, realtime, payments, live video, deployment, and monitoring. Production code must not silently fall back to mocks, fake data, local-only participant simulations, or placeholder success states.
- **REQ-002**: The production target is 200 concurrent authenticated student sessions. Capacity validation must include at least 10 percent headroom, so infrastructure and provider quotas must support a minimum validated concurrency of 220 sessions or seats where the provider enforces seat limits.
- **REQ-003**: The Florida Class D owner validation workspace must require the exact authenticated owner principal and Supabase AAL2. Authorization must bind the JWT `session_id` to an active `auth.sessions` record.
- **REQ-004**: Live media must use real Daily rooms and tokens. Instructor and participant joins, camera, microphone, captions, screen sharing, room cleanup, token expiry, and browser permission handling must be exercised against the configured Daily account.
- **REQ-005**: Courseware upload, inventory, signed viewing, presentation, deletion, notes, messages, sessions, and participant state must use the live Supabase database, Storage, and Realtime services with RLS.
- **REQ-006**: Payments must use server-created Stripe Checkout Sessions with governed server-side pricing, webhook signature verification, idempotency, durable state transitions, and no client-controlled amount.
- **REQ-007**: Academy new sales must remain licensing-pending until external authorization is satisfied. The payment subsystem may be production ready while the regulated sales gate remains closed.
- **REQ-008**: User-facing pages must meet WCAG 2.2 AA behavior for keyboard navigation, focus visibility, names and labels, semantic landmarks, error status, reduced motion, and non-color-only state communication.
- **REQ-009**: Advanced design, branding, graphics, presentation, motion, 3D, sound, and playback must preserve the approved Obserra dark navy, black, and gold executive identity and must use repository-approved brand assets such as `public/brand/obserra-mark.svg`. Do not invent alternate Obserra logo variants.
- **REQ-010**: Interactive 3D and visualization are progressive enhancement. A GPU, WebGL, model, or animation failure must never block authentication, course access, live classroom entry, compliance notices, payment controls, or LMS navigation.
- **REQ-011**: Audio and video playback must never autoplay audible media without user activation. Captions or transcripts must be available where instructional content requires them. Playback state must be keyboard operable.
- **REQ-012**: Every production mutation path must validate authentication, authorization, origin, content type, input schema, expected state transition, and provider response shape at the server boundary.
- **SEC-001**: Security must be secure by design and secure by default. Apply least privilege, defense in depth, strong identity, AAL2 for owner controls, RLS, private privileged database functions, secret isolation, same-origin mutation admission, rate limiting where appropriate, auditability, and fail-closed provider error handling.
- **SEC-002**: No `service_role`, private Stripe secret, Daily API key, signing secret, or equivalent privileged credential may be exposed in browser bundles or `NEXT_PUBLIC_` variables.
- **SEC-003**: Supabase `SECURITY DEFINER` functions used by LMS authorization must remain in unexposed private schemas. Exposed tables must have RLS enabled and policies must enforce owner or learner scope explicitly.
- **SEC-004**: Security testing must include SAST, dependency vulnerability review, authorization negative tests, CSRF and same-origin tests, input validation, secret scanning, RLS policy tests, rate and abuse tests, and authorized dynamic testing of the preview deployment.
- **PER-001**: Load tests must verify 200 concurrent student workflows using `load/florida-class-d-200-students.k6.js` and must validate authentication, course discovery, courseware access, state reads, protected mutations, and representative API calls rather than a single health endpoint.
- **PER-002**: At 200 concurrent students, non-media application requests must maintain less than 1 percent unexpected error rate. Capacity gates must publish p50, p95, p99 latency, throughput, provider error rate, database saturation indicators, and deployment function errors.
- **PER-003**: Interactive visualization assets must be lazy loaded. Initial 3D asset payload should target less than 5 MB per scene after optimization, with a hard release gate at 10 MB unless a measured exception is documented in this plan.
- **PER-004**: 3D geometry must be web optimized. Individual web scenes should target fewer than 100,000 visible triangles unless profiling demonstrates stable target-device frame time. GLB or glTF is the canonical web model format.
- **HA-001**: The application must remain stateless at the Vercel function layer. Durable user, commerce, courseware, live-session, and authorization state belongs in governed backing services, not process memory.
- **HA-002**: High availability validation must include Vercel deployment health, Supabase service availability, database connection behavior, Daily provider error handling, Stripe webhook retry and idempotency behavior, rollback readiness, and recovery from transient provider failures.
- **HA-003**: Production cutover must bind the exact tested Git commit and deployment identity to the canonical domain, smoke test it, and restore captured canonical deployment IDs if attachment or smoke verification fails.
- **DBA-001**: Database changes must be forward migrations. Applied production migration history must not be rewritten.
- **DBA-002**: Database indexes must support owner, learner, session, asset, message, participant, payment, and entitlement access patterns without sequential scans on expected hot paths at target concurrency.
- **VIS-001**: Interactive visualization must include accessible textual and tabular equivalents for any information communicated only visually.
- **VIS-002**: WebGL loss, low-power device mode, `prefers-reduced-motion`, and unsupported browser paths must have tested non-3D fallbacks.
- **VIS-003**: 3D experiences must use deterministic model manifests and integrity-checked local or approved hosted assets. Remote arbitrary model URLs are not permitted.
- **BRD-001**: Branding work must preserve approved Obserra assets and executive visual hierarchy across website, Academy, owner LMS, reports, presentation surfaces, loading states, and visualization scenes.
- **MKT-001**: Marketing copy must not overstate regulatory approval, certification, licensing, security posture, availability, performance, or learner credit. Claims must be traceable to implemented and validated behavior.
- **CI-001**: Pull requests are not release ready unless required GitHub checks complete successfully or an explicitly documented owner-approved exception exists. `action_required`, failure, cancelled, skipped-required, or stale checks are not green.
- **CI-002**: Evidence generation must remain deterministic and governed through repository workflows. Generated legal, CMMC, FDACS, and release evidence must not be hand edited to make checks pass.
- **CON-001**: PR 134 remains draft until authenticated owner live AAL2, Daily, and courseware interaction testing is complete and release control is approved.
- **PAT-001**: Use test-first behavior changes. Each nontrivial fix must have a failing or disproving test or verification before implementation where practical, followed by green verification.
- **PAT-002**: Build common capabilities once and reuse them. Authentication, authorization, provider validation, mutation admission, error translation, telemetry, and capacity instrumentation must not be duplicated across routes.

## 2. Implementation Steps

### Implementation Phase 1: Re-establish a clean release baseline

- GOAL-001: Make the current branch reproducible and all repository gates actionable before expanding functionality.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Treat PR 134 and this plan file as the current authoritative branch and execution source. Record the exact head SHA before each release-validation cycle. | | |
| TASK-002 | Resolve all GitHub Actions runs that are `action_required` or failed on the current head. Do not bypass `Website CI`, `Academy 70x Production Gate`, `Florida Class D LMS Gates`, `CMMC Evidence Governance`, or `CodeQL Advanced`. | | |
| TASK-003 | Re-run deterministic legal identity, CMMC, FDACS, disposition, and handoff evidence generation only through governed workflow paths and commit generated changes. | | |
| TASK-004 | Re-run focused owner LMS tests, full Academy release validation, TypeScript, lint, Node tests, build, CMMC gates, Florida Class D gates, and CodeQL against the same head SHA. | | |
| TASK-005 | Keep PR 134 draft until the final owner live interaction gate. | | |

### Implementation Phase 2: Identity, sign-in, session integrity, and authorization

- GOAL-002: Make sign-in and authorization production correct under owner AAL2 and student concurrency.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Validate `lib/auth/runtime-config.ts`, owner identity pages, and owner validation routes against the current authentication architecture. Ensure no stale Clerk and Supabase authority overlap creates ambiguous authorization. | | |
| TASK-007 | Verify the live `owner_lms_private.obserra_owner_lms_authorized()` migration is applied, the public helper is absent, unauthorized context returns false, and all LMS and Storage policies call the private helper. | ✅ | 2026-08-19 |
| TASK-008 | Add or retain negative tests for unauthenticated, wrong user, non-owner, AAL1, stale session, wrong `session_id`, and upstream identity outage paths. | | |
| TASK-009 | Load test authenticated session issuance and protected reads at 200 concurrent users without weakening AAL2 owner gates or learner authorization boundaries. | | |
| TASK-010 | Verify sign-in, MFA, sign-out, session expiration, refresh, and failure states in a real preview browser against production-equivalent auth configuration. | | |

### Implementation Phase 3: Database, RLS, Storage, Realtime, and data integrity

- GOAL-003: Make live data paths correct, indexed, least privilege, and efficient for 200 concurrent students.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Audit `supabase/identity/migrations/20260819010000_owner_lms_functional_workspace.sql` and `20260819020000_owner_lms_private_authorization.sql` for table constraints, foreign keys, indexes, RLS, private privileged functions, and Storage policy coverage. | | |
| TASK-012 | Measure hot queries for sessions, participants, course assets, notes, messages, entitlements, and payment state. Add indexes only when the measured access path and query plan justify them. | | |
| TASK-013 | Verify Storage upload, replace, signed read, delete, MIME limits, file-size limits, owner-folder isolation, and unauthorized object access against the live project. | | |
| TASK-014 | Verify Realtime subscriptions for participant, session, and message state under concurrent connection load and confirm reconnect behavior without duplicate application events. | | |
| TASK-015 | Run Supabase security and performance advisors after schema changes and resolve release-blocking findings. | | |

### Implementation Phase 4: Live video, advanced audio, playback, and presentation

- GOAL-004: Make classroom media and instructional playback production grade, accessible, and observable.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Validate `app/api/florida-class-d/owner-validation/daily/route.ts` and the Daily provider library against real room creation, private room policy, instructor and participant tokens, expiry, cleanup, and provider failures. | | |
| TASK-017 | Verify instructor camera, microphone, captions, display capture, fullscreen, hand raising, chat, reactions, participant state, and three owner-controlled learner joins against real Daily rooms. | | |
| TASK-018 | Remove or fail closed any participant UI path that visually simulates a remote learner without a real authenticated Daily participant connection. | | |
| TASK-019 | Validate courseware playback for PDF, PPTX, image, MP4, and WebM assets using live signed objects. Add robust loading, error, resume, keyboard, captions or transcript support where applicable. | | |
| TASK-020 | Implement audio controls that require explicit user activation, expose mute and volume state accessibly, respect browser autoplay rules, and never hide an audio failure behind a success state. | | |
| TASK-021 | Add media telemetry for join failures, permission denials, reconnects, device failures, token expiry, playback errors, and room cleanup failures without logging sensitive tokens. | | |
| TASK-022 | Validate Daily account concurrency and room quotas for at least 220 seats before enabling a 200-student production class. If account quota is below the requirement, the release gate must fail instead of degrading to a mock path. | | |

### Implementation Phase 5: Capacity, high availability, load balancing, and performance optimization

- GOAL-005: Demonstrate production behavior at 200 concurrent students with headroom and no single-process state dependency.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-023 | Expand `load/florida-class-d-200-students.k6.js` into a complete student journey covering auth-ready access, course discovery, courseware reads, session reads, representative mutations, and controlled think time. | | |
| TASK-024 | Update `scripts/florida-class-d-capacity-gate.mjs` so the gate evaluates p50, p95, p99, unexpected error rate, request throughput, and known provider failure categories for the 200-user profile. | | |
| TASK-025 | Verify Vercel functions are stateless and horizontally scalable. Remove process-local state used for durable authorization, student progress, entitlements, payments, courseware, attendance, or live session truth. | | |
| TASK-026 | Verify Supabase connection and query behavior under the 200-user profile. Correct N plus 1 access, excessive payloads, sequential scans, unnecessary realtime broadcasts, and unbounded queries. | | |
| TASK-027 | Validate provider retries only for bounded transient failures. Ensure idempotent operations are retryable and non-idempotent operations cannot duplicate payment, entitlement, upload, or session state. | | |
| TASK-028 | Validate canonical domain cutover and rollback under partial alias attachment, smoke failure, and transient Vercel API failure using `.github/workflows/production-vercel-public-cutover.yml`. | | |
| TASK-029 | Run a sustained soak test after the burst test to expose connection leaks, realtime subscription leaks, token refresh failures, room cleanup leaks, memory growth, and function error accumulation. | | |

### Implementation Phase 6: Payments and commerce integrity

- GOAL-006: Make Stripe integration production correct while preserving the licensing hold.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | Audit `app/api/academy/checkout/route.ts` for same-origin admission, governed price resolution, durable reservation, idempotency, server-controlled amount, metadata, success and cancel URLs, and provider error handling. | | |
| TASK-031 | Audit Stripe webhook handling for signature verification, event replay, duplicate delivery, out-of-order delivery, idempotent entitlement transitions, refund or cancellation paths, and livemode enforcement. | | |
| TASK-032 | Exercise a real provider test purchase end to end in preview with production-equivalent configuration. Do not bypass the Academy licensing-pending gate for regulated new sales. | | |
| TASK-033 | Add payment and entitlement load tests that verify duplicate submits cannot create duplicate commercial state under concurrency. | | |

### Implementation Phase 7: Advanced security, authorized penetration testing, and abuse resistance

- GOAL-007: Close exploitable application, identity, data, payment, and deployment weaknesses before release.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-034 | Run repository SAST and CodeQL on the exact release SHA. Resolve high-confidence authorization, injection, secret, SSRF, path, crypto, and unsafe deserialization findings. | | |
| TASK-035 | Run dependency vulnerability and license review for production dependencies and any new visualization packages before merge. | | |
| TASK-036 | Perform authorized dynamic testing of the protected preview for auth bypass, AAL downgrade, IDOR, CSRF, origin bypass, upload abuse, signed URL leakage, RLS bypass, cache leakage, header weaknesses, and payment manipulation. | | |
| TASK-037 | Validate security headers and route-specific permissions for camera, microphone, display capture, Daily framing, CSP, HSTS, frame ancestry, referrer policy, and MIME sniffing. | | |
| TASK-038 | Validate rate and abuse controls for sign-in, owner-validation APIs, checkout creation, file upload, signed URL generation, messaging, and expensive provider operations. | | |
| TASK-039 | Verify logs and telemetry redact passwords, auth tokens, JWTs, Daily tokens, Stripe secrets, signed storage URLs, payment data, and regulated PII. | | |

### Implementation Phase 8: User frontend, accessibility, responsive behavior, and interaction quality

- GOAL-008: Make student and owner experiences complete, fast, accessible, and unambiguous.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | Audit `OwnerValidationLmsConsole.tsx`, `OwnerLearnerWorkspace.tsx`, Academy pages, live classroom, sign-in and MFA pages for semantic structure, focus order, keyboard operation, visible errors, loading state, and accessible status messages. | | |
| TASK-041 | Ensure disabled regulated controls remain understandable and keyboard discoverable where explanation is required, using `aria-disabled` rather than inaccessible visual-only lock styling. | | |
| TASK-042 | Test responsive behavior at phone, tablet, laptop, desktop, and ultrawide breakpoints. Eliminate horizontal overflow, clipped dialogs, inaccessible media controls, and unusable 3D canvases. | | |
| TASK-043 | Split or lazy load client code only where profiling shows a meaningful reduction in main-thread or bundle cost. Preserve server rendering for content that does not require client state. | | |
| TASK-044 | Validate browser navigation, back-forward cache, pagehide cleanup, fullscreen exit, device permission denial, and route transitions without leaked media streams or stale busy state. | | |

### Implementation Phase 9: Advanced visual design, branding, graphics, and marketing integrity

- GOAL-009: Deliver a premium Obserra visual system without compromising performance, accessibility, or regulatory truth.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-045 | Apply one consistent design system across website, Academy, owner LMS, live classroom, payment surfaces, reports, and visualization using the existing Obserra navy, black, and gold brand and approved repository assets. | | |
| TASK-046 | Improve visual hierarchy, spacing, typography, depth, state feedback, motion, and executive polish while removing generic card, gradient, icon, and animation patterns that do not add information. | | |
| TASK-047 | Produce optimized branded graphics from approved assets. Prefer SVG for marks and UI graphics, AVIF or WebP for raster imagery, and properly compressed GLB for 3D. | | |
| TASK-048 | Add motion only where it communicates hierarchy, state change, navigation, or focus. Respect `prefers-reduced-motion` and maintain stable layout to prevent CLS. | | |
| TASK-049 | Audit marketing and public certification language against implemented release state. Remove or qualify claims that imply licensing, certification, approval, learner credit, or production capacity before evidence exists. | | |

### Implementation Phase 10: Interactive visualization, 3D modeling, and presentation track

- GOAL-010: Add advanced, performant, accessible interactive visualization as a first-class production track without placing the LMS critical path behind WebGL.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-050 | Create `app/components/visualization/InteractiveVisualizationShell.tsx` as the progressive-enhancement boundary. It must render semantic non-3D content first and load the 3D client only after capability detection. | | |
| TASK-051 | Create `app/components/visualization/VisualizationCanvas.tsx` for the WebGL scene and `VisualizationFallback.tsx` for non-WebGL, reduced-motion, low-power, load-failure, and accessibility fallback behavior. | | |
| TASK-052 | Create `app/components/visualization/VisualizationControls.tsx` with keyboard-operable orbit, reset, pause animation, fullscreen, information, and accessibility controls. | | |
| TASK-053 | Create `lib/visualization/model-manifest.ts` to whitelist local production GLB assets, expected byte size, checksum, logical scene, LOD metadata, and accessible description. Arbitrary runtime model URLs are forbidden. | | |
| TASK-054 | Create `lib/visualization/performance-budget.ts` to enforce per-scene asset, geometry, texture, device-pixel-ratio, and frame-time budgets. | | |
| TASK-055 | Add web-optimized branded 3D assets under `public/brand/3d/`. Models must derive from approved Obserra brand assets, use GLB, remove unused nodes and materials, compress geometry and textures, and pass integrity checks before inclusion. | | |
| TASK-056 | Add `app/components/visualization/visualization.css` for stable sizing, high-contrast controls, reduced-motion behavior, focus styling, and graceful fallback layout. | | |
| TASK-057 | Use React Three Fiber for React-integrated production scenes only after dependency, security, bundle, and compatibility review. Required packages must be pinned and included in dependency scanning before merge. | | |
| TASK-058 | Add contextual interactive visualization to public or executive presentation surfaces first. Do not place a heavy 3D scene in the live-class critical path until performance testing confirms no measurable degradation to media or LMS operation. | | |
| TASK-059 | For LMS visualization, use 3D only for instructional spatial content that materially improves learning. Every 3D instructional state must have an equivalent accessible explanation or static view. | | |
| TASK-060 | Add automated tests for WebGL unavailable, model load failure, reduced motion, keyboard controls, fallback content, route transitions, and asset budget enforcement. | | |
| TASK-061 | Profile target-device GPU and CPU frame time. Release criteria are stable interaction without long tasks that interfere with Daily media, keyboard input, or route navigation. | | |

### Implementation Phase 11: CI, deployment, observability, and release automation

- GOAL-011: Make every release reproducible, evidence backed, observable, and reversible.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-062 | Add visualization and asset-budget tests to `Website CI` once the visualization track lands. | | |
| TASK-063 | Keep Academy and Florida Class D release gates independent enough to identify the failing domain while preserving an aggregate release decision. | | |
| TASK-064 | Ensure preview and production deployments report the exact Git SHA and canonical Vercel project identity used by release validation. | | |
| TASK-065 | Add or verify structured telemetry for auth failures, provider latency, database latency, RLS denials, signed URL errors, payment transitions, Daily room operations, media failures, and capacity-test results. | | |
| TASK-066 | Define production alerts for elevated 5xx rate, auth failure anomalies, provider outage, database saturation, webhook failure, Daily room creation failure, and failed production cutover. | | |
| TASK-067 | Retain deterministic rollback, smoke tests, and release evidence for each production cutover. | | |

### Implementation Phase 12: Final owner UAT and production promotion

- GOAL-012: Complete the human-only release gate on the exact deployable SHA, then promote without changing code underneath the test.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-068 | On the exact preview deployment SHA, complete owner sign-in and Supabase AAL2. Verify unauthorized browser sessions cannot enter the owner LMS. | | |
| TASK-069 | Create a real Daily owner test session. Join instructor and learner surfaces, test camera, microphone, captions, screen share, participant state, disconnect, reconnect, and cleanup. | | |
| TASK-070 | Upload and present real courseware, open signed views, delete assets, create notes and messages, and verify Realtime state against the live Supabase project. | | |
| TASK-071 | Confirm all regulated credit, attendance, completion, certificate, and LIAS paths remain fail closed in the owner test workspace. | | |
| TASK-072 | Confirm all required CI, security, evidence, capacity, Vercel, database, payment, media, accessibility, and visualization gates are green for the same head SHA. | | |
| TASK-073 | Mark PR 134 ready only after the owner live gate is complete. Merge through the governed workflow, perform exact-SHA production cutover, run production smoke tests, and verify canonical domain identity. | | |

## 3. Alternatives

- **ALT-001**: Implement visual polish and 3D first. Rejected because release correctness, identity, RLS, provider integrity, and capacity are higher critical-path risks.
- **ALT-002**: Use simulated Daily participants for load and owner demonstration. Rejected for production validation because the requirement is real provider behavior. Synthetic load may supplement but cannot replace real provider quota and interaction verification.
- **ALT-003**: Store durable session or learner state in Vercel process memory to reduce database calls. Rejected because it breaks horizontal scaling, recovery, and correctness across serverless instances.
- **ALT-004**: Put privileged Supabase LMS authorization in `public` for easier RPC access. Rejected because privileged functions must remain private and unexposed.
- **ALT-005**: Ship heavy 3D scenes on initial page load. Rejected because visualization is progressive enhancement and cannot degrade LMS, live media, accessibility, or Core Web Vitals.
- **ALT-006**: Enable regulated Academy sales before licensing is externally authorized. Rejected. Commerce infrastructure can be validated while the sales gate remains closed.

## 4. Dependencies

- **DEP-001**: GitHub repository `jblan2026-hub/obserra-website`, PR 134, and required GitHub Actions permissions.
- **DEP-002**: Canonical Vercel production project and domain configuration used by the governed cutover workflow.
- **DEP-003**: Supabase Identity project, Auth, Postgres, Storage, Realtime, applied migrations, and production credentials.
- **DEP-004**: Daily production account, API key, room/token capability, and verified concurrency quota of at least 220 seats for a 200-student class target.
- **DEP-005**: Stripe production or controlled provider test configuration, governed Price records, webhook endpoint, webhook signing secret, and durable commerce storage.
- **DEP-006**: Current Next.js, React, TypeScript, and existing dependency lock state. Any new 3D dependency requires dependency impact and vulnerability review before merge.
- **DEP-007**: Approved Obserra brand assets, including `public/brand/obserra-mark.svg` and any derived production-ready 3D model assets.

## 5. Files

- **FILE-001**: `.github/workflows/website-ci.yml` and Florida Class D, Academy, CMMC, evidence, and production cutover workflows.
- **FILE-002**: `app/florida-security-training/owner-validation/lms/OwnerValidationLmsConsole.tsx` and `owner-lms.css`.
- **FILE-003**: `app/florida-security-training/owner-validation/lms/learner/[surface]/OwnerLearnerWorkspace.tsx`.
- **FILE-004**: `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`.
- **FILE-005**: `app/api/florida-class-d/owner-validation/daily/route.ts` and `courseware/route.ts`.
- **FILE-006**: `app/api/academy/checkout/route.ts` and existing Stripe webhook implementation.
- **FILE-007**: `lib/auth/runtime-config.ts`, Florida Class D identity, validation, session, mutation-boundary, and live-policy libraries.
- **FILE-008**: `supabase/identity/migrations/20260819010000_owner_lms_functional_workspace.sql` and `20260819020000_owner_lms_private_authorization.sql`.
- **FILE-009**: `load/florida-class-d-200-students.k6.js` and `scripts/florida-class-d-capacity-gate.mjs`.
- **FILE-010**: `next.config.ts` and deployment configuration affecting CSP, permissions, performance, and provider framing.
- **FILE-011**: `public/brand/obserra-mark.svg` and future `public/brand/3d/*.glb` approved visualization assets.
- **FILE-012**: Future `app/components/visualization/InteractiveVisualizationShell.tsx`, `VisualizationCanvas.tsx`, `VisualizationFallback.tsx`, `VisualizationControls.tsx`, and `visualization.css`.
- **FILE-013**: Future `lib/visualization/model-manifest.ts` and `lib/visualization/performance-budget.ts`.
- **FILE-014**: This file, `plan/architecture-obserra-production-readiness-1.md`, is the authoritative plan and must be updated when implementation state or release criteria change.

## 6. Testing

- **TEST-001**: Run all focused owner LMS authorization and owner access tests, including `test/owner-lms-private-authorization.test.mjs` and `test/florida-class-d-owner-test-access.test.mjs`.
- **TEST-002**: Run full repository lint, TypeScript, Node test, and Next.js build gates.
- **TEST-003**: Run `verify:florida-class-d`, Academy release gates, legal identity evidence checks, CMMC evidence governance, FDACS evidence validation, and CodeQL against one exact SHA.
- **TEST-004**: Run the 200-student k6 profile and capacity contract tests, record percentiles, throughput, errors, and provider failures, and require the gate to pass before release.
- **TEST-005**: Run authorized live browser tests for sign-in, MFA, owner LMS, courseware, Daily media, checkout control, responsive behavior, and accessibility.
- **TEST-006**: Run negative security tests for auth bypass, AAL downgrade, IDOR, CSRF, upload abuse, signed URL leakage, RLS bypass, rate abuse, and payment manipulation.
- **TEST-007**: Run database post-migration verification and Supabase advisors after schema changes.
- **TEST-008**: Run visualization tests for no-WebGL, model failure, reduced motion, keyboard operation, fallback content, model integrity, payload budget, and route navigation.
- **TEST-009**: Run production cutover smoke and rollback validation on the exact deployment SHA before declaring the canonical domain healthy.

## 7. Risks & Assumptions

- **RISK-001**: Daily account quota may be lower than the 220-seat validation requirement. Mitigation: query or validate the configured provider account before release and fail the capacity gate if insufficient.
- **RISK-002**: Supabase Realtime and database hot paths may become the bottleneck before Vercel. Mitigation: measure connection count, query plans, payload size, subscription fanout, and indexes during load tests.
- **RISK-003**: 3D and high-resolution graphics can degrade main-thread, GPU, memory, and network performance. Mitigation: progressive loading, GLB compression, LOD, asset budgets, reduced-motion behavior, and non-3D fallback.
- **RISK-004**: CI status `action_required` may reflect approval policy rather than code failure. Mitigation: treat it as not green until the required action is explicitly resolved and checks execute against the current SHA.
- **RISK-005**: External provider outages can make healthy application code appear broken. Mitigation: classify provider failures explicitly, retry only safe transient operations, preserve idempotency, and fail closed on authorization or regulated state.
- **RISK-006**: Public marketing language can outrun regulatory status. Mitigation: gate claims by implemented evidence and preserve licensing-pending language until authorization exists.
- **ASSUMPTION-001**: The production target means 200 simultaneous authenticated students, including live-class participation where a course uses live video.
- **ASSUMPTION-002**: Vercel remains the application hosting and traffic distribution layer, Supabase remains the governed database/auth/storage/realtime platform for this LMS work, Daily remains the live video provider, and Stripe remains the payment provider unless an explicit architecture decision changes them.

## 8. Related Specifications / Further Reading

- PR 134: `https://github.com/jblan2026-hub/obserra-website/pull/134`
- `docs/florida-class-d-lms/`
- `docs/compliance/`
- `public/brand/obserra-mark.svg`
- Skills applied as engineering controls for this plan: `create-implementation-plan`, `project-management`, `3d-web-experience`, `test-driven-development`, `code-security`, `supabase`, `stripe-best-practices`, `nextjs`, `nodejs-best-practices`, `react-best-practices`, `frontend-design`, `high-end-visual-design`, `accessibility-testing`, `performance`, `performance-tuning-expert`, `configuring-load-balancers`, `dependency-scanning`, `threat-modeling`, `playwright-best-practices`, `review-and-ship`, and `doubt-driven-development`.
