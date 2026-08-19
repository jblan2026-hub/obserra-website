# Obserra Website and Florida Class D LMS Engineering Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Repository:** `jblan2026-hub/obserra-website`  
**Pull request:** `#134`  
**Branch:** `hotfix/owner-lms-test-access-20260817`  
**Base branch:** `main`  
**Implementation state captured through:** `b36f152b1849b52f7637119521313b7f45a237c7`  
**Status:** Active development, draft PR, not production promoted  
**Authoritative roadmap:** [`plan/architecture-obserra-production-readiness-1.md`](../plan/architecture-obserra-production-readiness-1.md)

This file is the canonical restart handoff for the current Obserra website, Academy, Florida Class D LMS, connector-control-plane, AI advisor, scaling, security, and repository sanitation work. Read this file first when resuming. Use the roadmap for the full production work queue.

## Resume Contract {#resume-contract}

Resume work on PR `#134` and branch `hotfix/owner-lms-test-access-20260817`. Do not restart from `main`, create a replacement architecture, or treat historical validation claims in the PR body as current evidence. Re-read the exact current PR head, current GitHub checks, Vercel deployment state, and Supabase migration state before changing source.

The system is still in development. Do not represent regulated learner activation, attendance credit, course completion, certificate issuance, LIAS reporting, connector production activation, AI advisor production readiness, or 200-student production capacity as complete until the corresponding live gates in this handoff and the roadmap are satisfied.

## Repository Authority {#repository-authority}

The authoritative source of implementation truth is the GitHub repository and exact branch above. The authoritative production roadmap is `plan/architecture-obserra-production-readiness-1.md`. This handoff is the authoritative restart snapshot.

The following stale documents were intentionally removed because they contained mutually inconsistent historical production state, branch names, owner-site boundaries, Vercel visibility claims, and identity status:

- `docs/PRODUCTION-READINESS-SOURCE-OF-TRUTH.md`
- `docs/OWNER_PRODUCTION_READINESS_REGISTER.md`
- `docs/PRODUCTION-IDENTITY-READINESS.md`

Do not recreate competing "current truth" documents. Current implementation state belongs here. Durable requirements and work sequencing belong in the roadmap. Generated legal, CMMC, and FDACS evidence remains governed by the existing evidence workflows and files under `docs/compliance/` and `docs/florida-class-d-lms/`.

## Current Pull Request State {#current-pr-state}

PR `#134`, titled `fix(fdacs): enable direct AAL2 owner LMS testing`, is open, draft, and mergeable. At the implementation snapshot `b36f152b1849b52f7637119521313b7f45a237c7`, the PR contained 216 commits and 82 changed files relative to base `e65a12c36279a23e6b5afd2d318398bf2ee23f91`.

The PR body contains older validation claims and an older validation SHA. Treat those claims as historical until the PR body is refreshed from exact-head evidence.

## Exact-Head CI State {#ci-state}

GitHub Actions results for implementation snapshot `b36f152b1849b52f7637119521313b7f45a237c7`:

| Gate | Result | Meaning |
|---|---|---|
| CodeQL Advanced | SUCCESS | Current cleanup head passed CodeQL. |
| Florida Class D LMS Gates | SUCCESS | Current cleanup head passed the regulated Florida LMS source gates, including Gate 36 capacity contract. |
| Academy 70x Production Gate | SUCCESS | Current cleanup head passed the Academy production gate. |
| Website CI | FAILURE | Failure occurred at governed legal-identity evidence drift before unit tests, lint, and build executed in that workflow. This is not evidence of a source compile failure. |
| CMMC Evidence Governance | FAILURE | Failure occurred at generated CMMC system-evidence drift. Governing objective and source-watch configuration steps passed before the drift gate. |

Website CI run: `32242443011`. Its remediation artifact is named `legal-identity-audit-remediation` and was generated from the exact snapshot SHA.  
CMMC run: `32242442998`. Its remediation artifact is named `cmmc-system-evidence-remediation` and was generated from the exact snapshot SHA.

Do not hand-edit generated evidence. Regenerate or apply remediation through the repository's governed evidence workflow, then re-run all exact-head gates.

## Vercel State {#vercel-state}

Team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`.

Project `prj_FfAnssVJU8pcJydGNJHmCliP6Yme`, deployment name `obserra-website-lcn2`, has an exact-head READY preview for snapshot `b36f152b1849b52f7637119521313b7f45a237c7`:

- Deployment ID: `dpl_5nJE1QmYyNpkvCKhvzoHMyFWsmNk`
- Preview hostname: `obserra-website-lcn2-q6swg554b-obserra.vercel.app`
- State: `READY`
- Target: preview / non-production

Project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment name `obserra-website-live`, has a deployment for the same snapshot SHA that is `CANCELED`:

- Deployment ID: `dpl_4F4gj6UN5apLCbsBbWaardGv5fMc`
- State: `CANCELED`

There is a release-control inconsistency that must be resolved before promotion: `.github/workflows/production-vercel-public-cutover.yml` currently names `prj_FfAnssVJU8pcJydGNJHmCliP6Yme` as `CANONICAL_PROJECT_ID` and `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` as `AUXILIARY_PROJECT_ID`, while `scripts/vercel-ignore-build.sh` labels `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` as the production project and `prj_FfAnssVJU8pcJydGNJHmCliP6Yme` as the integration project. Reconcile this naming and behavioral contract before production cutover. Do not infer production authority from project names alone.

The public canonical domains must not be promoted until one authoritative project identity is established, rollback alias capture is verified, exact-SHA smoke tests pass, and the owner release gate is complete.

## Supabase State {#supabase-state}

Identity project: `ftkjhmtfyfkartfsnkjb`.

Live migration history currently includes:

- `obserra_identity_authority`
- `identity_provider_subject_fk_index`
- `owner_lms_workspace_foundation`
- `owner_lms_participant_monitoring`
- `owner_lms_webrtc_media_mode`
- `owner_lms_private_authorization`

The live private LMS authorization remediation is applied. The privileged owner LMS authorization helper belongs in the private schema and the public helper is not the intended authorization surface.

`supabase/identity/migrations/20260819030000_connector_control_plane.sql` exists in source but is not present in the live migration list. Treat the connector control plane as source-implemented but not live-activated. Apply only as a reviewed forward migration after current exact-head source and evidence gates are green.

## Connector Control Plane {#connector-control-plane}

Source implementation is present under `lib/connectors/`:

- `contracts.ts`
- `database.ts`
- `repository.ts`
- `secret-envelope.ts`
- `url-policy.ts`
- `resilience.ts`
- `http-adapter.ts`

The design provides tenant and owner scoping, fail-closed activation, durable health state, failure queues, typed Supabase access, URL allowlisting, SSRF-oriented URL policy, bounded request bodies and headers, explicit timeouts, retry with jitter, `Retry-After` awareness, durable circuit state, correlation IDs, idempotency requirements for consequential mutations, provider failure classification, and content-free operational telemetry.

Current secret encryption uses a server-only AES-256-GCM envelope with authenticated context binding and an environment-supplied key ring through `OBSERRA_CONNECTOR_ENCRYPTION_KEY_ID`, `OBSERRA_CONNECTOR_ENCRYPTION_KEY`, and optional historical keys. This is not yet the requested enterprise Key Vault-backed key-provider architecture. The next connector hardening slice must introduce a key-provider abstraction and production KMS/Key Vault implementation while preserving the existing envelope and rotation contract as a local/bootstrap fallback.

Do not create provider-specific bypasses around this control plane. OAuth, API-key, and service-account integrations should converge on tenant-scoped credentials, normalized health, provenance, replay protection, rate awareness, retries, circuit breakers, webhook or polling policies, failure queues, audit correlation, and risk-graph normalization.

## AI Advisor State {#ai-advisor-state}

The Florida Class D live classroom contains an AI Advisor implementation:

- API route: `app/api/florida-class-d/live/advisor/route.ts`
- Server implementation: `lib/florida-class-d-ai-advisor.ts`
- UI: `app/florida-security-training/live/[liveSessionId]/AiAdvisorPanel.tsx`
- Styling: `app/florida-security-training/live/[liveSessionId]/AiAdvisorPanel.module.css`
- Classroom mount: `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`
- Contract test: `test/florida-class-d-ai-advisor-contract.test.mjs`

The reasoning path defaults to `gpt-5.1` with medium reasoning effort. Voice defaults to `gpt-4o-mini-tts`, voice `marin`, MP3 output, explicit AI-generated voice disclosure, and a calm professional instructor style. Current course screen content is bounded and explicitly treated as untrusted instructional data. The advisor cannot award attendance, instructional credit, completion, certification, licensing status, or modify student records. It is instructed not to provide graded exam, live poll, presence-challenge, or certification answers.

The advisor currently uses `OPENAI_API_KEY` directly and shares the connector resilience primitive, but it does not yet retrieve its credential and connector configuration through the tenant-scoped connector repository and HTTP adapter. That adapter convergence is a required next step. Do not treat the AI advisor as fully integrated into the connector control plane until this is complete.

Production provider configuration and live authenticated end-to-end AI voice/reasoning testing remain required. The model must never become an authorization, attendance, grading, certification, or regulatory decision boundary.

## Florida Class D LMS and Live Media {#florida-class-d-lms}

The owner validation LMS uses real provider-oriented code paths and retains fail-closed non-credit invariants. Key source areas include:

- `app/florida-security-training/owner-validation/lms/`
- `app/api/florida-class-d/owner-validation/daily/route.ts`
- `app/api/florida-class-d/owner-validation/courseware/route.ts`
- `lib/florida-class-d-owner-test-session.ts`
- `lib/florida-class-d-production-owner-identity.ts`
- `lib/florida-class-d-production-owner-validation.ts`
- owner LMS Supabase migrations under `supabase/identity/migrations/`

The owner workspace requires the intended production owner identity boundary and AAL2. Daily room and participant issuance are real provider paths and do not silently degrade to fake participants. Courseware uses protected Supabase storage/database paths.

The final owner UAT remains human-only and must exercise exact-release owner sign-in, AAL2, real Daily instructor and learner joins, camera, microphone, captions, screen share, reconnect, courseware upload/view/presentation/delete, notes/messages/realtime behavior, and confirmation that credit/completion/certificate/LIAS paths remain fail closed.

## 200-Student Capacity and HA State {#capacity-ha}

The regulated capacity contract is present in `scripts/florida-class-d-capacity-gate.mjs` and `load/florida-class-d-200-students.k6.js`.

Governed capacity assumptions:

- Target concurrent authenticated students: `200`
- Daily participant limit per room: `75`
- Reserved instructor seats per room: `1`
- Learner seats per room: `74`
- Minimum parallel rooms: `3`
- Available learner seats: `222`
- Attendance heartbeat cadence: `60 seconds`
- Heartbeat phase window: `55 seconds`
- State refresh interval: `15 seconds`
- Load threshold: unexpected HTTP failure rate below `1%`
- Load latency thresholds: p95 below `2000 ms`, p99 below `4000 ms`

The capacity gate enforces deterministic phase staggering so 200 clients do not synchronize heartbeat or state-read bursts. The database heartbeat path remains indexed and bounded. The k6 harness requires real learner sessions and blocks accidental production load unless explicitly enabled.

Passing Gate 36 is structural and source-level capacity evidence, not proof of live provider capacity. Before release, run the authenticated 200-user load profile in an approved non-production or explicitly authorized environment, verify Daily account quota for at least the required room concurrency, measure Supabase database/realtime saturation, Vercel function errors, provider error classes, p50/p95/p99, throughput, and perform a sustained soak test for leaks and reconnect behavior.

The Vercel application layer must remain stateless for durable identity, authorization, progress, attendance, payments, entitlements, courseware, connector state, and live-session truth. Horizontal scale is handled at the hosting layer; durable truth remains in governed backing services.

## Authentication and Sign-In {#authentication}

The repository contains both Clerk and Supabase authentication responsibilities. Clerk remains in active use across public sign-in, portal, Academy, application access, and related routes. Supabase auth is used in the regulated Florida owner-validation path. Do not remove either dependency without a complete authority and route impact analysis.

The owner LMS authorization path must continue to enforce exact owner identity, AAL2, active session binding, and server-side authorization. Browser-controlled role, tenant, owner, or organization claims are not authority.

Production sign-in, MFA, refresh, session expiry, logout, account-recovery, wrong-user, stale-session, and upstream-provider failure behavior still require live preview validation on the exact release SHA.

## Payments and Commerce {#payments}

Stripe remains an active dependency and runtime path for website and Academy commerce. Server-side checkout, price authority, webhook verification, idempotency, entitlement transitions, and failure handling must remain server controlled.

Florida Class D regulated new sales remain licensing-pending. Existing entitlements must not be destroyed by the hold. Payment infrastructure can be tested while regulatory sales activation remains disabled.

Do not remove Stripe or consolidate commerce code until repository-wide usage, webhook, entitlement, billing, portal, refund, dispute, and application-commerce dependencies have been fully traced.

## Dependency and Repository Sanitation {#repo-sanitation}

The repository is being cleaned using dependency, license, secret, code, documentation, test, and release-impact gates rather than filename heuristics.

Direct dependency usage has been verified for the critical runtime set:

- `@clerk/nextjs` is used by sign-in, identity, portal, Academy, and application routes.
- `@supabase/ssr` is used by Supabase server/client/proxy authentication helpers.
- `@supabase/supabase-js` is used by application libraries and Supabase functions.
- `stripe` is used by commerce, Academy, identity verification, webhook, billing, and entitlement paths.
- `framer-motion` is used by the application marketplace UI.
- `lucide-react` is used broadly across public and Florida training UI.
- `@vercel/analytics` is used by the root layout and user-facing application flows.

No direct runtime dependency above is currently approved for removal. `package.json` and `package-lock.json` remain aligned at the top-level dependency set. A complete transitive vulnerability, license, and SBOM pass is still required before dependency deletion or upgrade decisions.

The cleanup must preserve governed scripts, migrations, evidence generators, CI workflows, and tests that are release or audit dependencies. Remove only artifacts proven unused or replaceable, then re-run exact-head gates.

## UI, UX, Accessibility, Media, and Visual Track {#experience-track}

The production roadmap includes responsive Obserra visual identity, advanced dashboard behavior, purposeful motion, fast tenant switching, evidence drill-through, strong empty/error/loading states, accessible tables and graphs, iPhone/iPad touch behavior, desktop power-user workflows, reduced-motion support, and WCAG-focused keyboard/focus/screen-reader behavior.

The LMS AI advisor uses a dedicated UI component instead of injecting its state into the full classroom rendering tree. Continue this isolation pattern for performance. Do not add animation or 3D to the live classroom critical path unless profiling shows no material effect on Daily media, input latency, or navigation.

The 3D and interactive-visualization track remains a roadmap item. It must be progressive enhancement with accessible non-WebGL fallbacks, asset budgets, local/approved GLB manifests, keyboard controls, reduced-motion behavior, and no dependency on 3D for sign-in, learning access, regulated notices, payment controls, or live-class operation.

## Security Control State {#security-state}

Current security design includes server-only privileged modules, same-origin mutation admission, runtime response validation, private Supabase authorization helpers, RLS, no client-controlled payment amount, Daily private rooms/tokens, explicit fail-closed provider behavior, SSRF-oriented connector URL restrictions, request timeouts, replay/idempotency controls, and CodeQL on the exact head.

Continue authorized negative testing for unauthenticated access, AAL downgrade, IDOR, CSRF, origin bypass, upload abuse, signed URL leakage, RLS bypass, rate abuse, payment manipulation, header/CSP weaknesses, connector SSRF, webhook replay, and AI prompt injection. Do not log tokens, credentials, signed URLs, payment secrets, sensitive PII, or model-system instructions.

## Engineering Control System {#skill-controls}

The build should continue using the installed expert skills as active engineering controls, selecting the most specific advanced skill for each component rather than repeatedly defaulting to one general skill. Relevant control families include:

- repository cleanup, dependency scanning, dependency impact analysis, license analysis, secret scanning, and SBOM
- secure code, threat modeling, authorization testing, input validation, prompt-injection defense, dynamic testing, CodeQL, and review
- Next.js, React, Node.js, TypeScript, frontend architecture, advanced UI/UX, responsive design, accessibility, motion, branding, graphics, performance, and web performance
- Supabase, PostgreSQL design, migration safety, RLS, query optimization, data integrity, realtime, and storage
- connector/API integration, OAuth, webhook verification, retry/backoff, circuit breaking, telemetry, observability, health state, rate-limit handling, replay protection, and provenance
- Stripe/payment security, commerce integrity, idempotency, webhooks, billing, and entitlements
- live video, audio, playback, TTS, LLM reasoning, AI advisor safety, media processing, and progressive 3D visualization
- load testing, performance tuning, capacity planning, Vercel scaling, deployment, CI/CD, rollback, release validation, and CodeRabbit/code review

Use repository evidence first. Consult current vendor documentation only when the repository and installed skill guidance are insufficient for a version-sensitive implementation detail.

## Immediate Resume Sequence {#resume-sequence}

Resume in this order unless new evidence changes priority:

1. Refresh PR metadata and exact current head after this handoff commit.
2. Regenerate legal-identity and CMMC system evidence through governed workflow paths. Re-run Website CI and CMMC until evidence and source checks execute green on one exact head.
3. Reconcile the contradictory Vercel project-role mapping between the cutover workflow and `scripts/vercel-ignore-build.sh`. Establish one canonical production project and one auxiliary/integration project by evidence, not by naming.
4. Re-run all five current PR gates plus any application-release gate on the exact same head. Do not use stale green runs.
5. Finish connector hardening: key-provider abstraction, Key Vault/KMS-backed production key source, source migration review, migration application to Supabase, post-migration verification, advisors, tenant isolation, health/failure queue verification, webhook/replay/idempotency patterns, and source normalization.
6. Move the LMS AI advisor from direct `OPENAI_API_KEY` access to the tenant-scoped connector credential and HTTP execution path. Preserve assessment, credit, prompt-injection, logging, and fail-closed boundaries.
7. Continue repo sanitation only after dependency/use evidence. Run transitive vulnerability scan, license inventory, SBOM, secret scan, and dead-code/doc/test review. Re-run full gates after each removal batch.
8. Execute authenticated 200-student k6 validation and soak testing with provider quota verification and measured Vercel/Supabase/Daily behavior. Do not infer live capacity from Gate 36 alone.
9. Complete advanced sign-in, responsive UI/UX, accessibility, media/playback, error-state, performance, observability, action-button, and governed connector experience validation.
10. Complete owner live UAT on the exact release SHA, including AAL2, Daily, courseware, realtime, AI advisor reasoning/voice, and negative regulated-credit assertions.
11. Refresh PR body with current exact-head evidence. Keep draft until owner UAT and release-control decision are complete.
12. Promote only through the governed exact-SHA Vercel cutover and rollback workflow, then perform production smoke, transaction, identity, runtime-log, and canonical-domain verification.

## Do Not Regress {#do-not-regress}

Do not reintroduce public privileged LMS authorization functions. Do not expose `service_role`, Stripe, Daily, OpenAI, connector, KMS, signing, or database secrets to the browser. Do not simulate remote learners as production participants. Do not weaken AAL2 or owner authorization to make UAT easier. Do not make the AI advisor authoritative for grading, attendance, licensing, completion, or certification. Do not enable regulated new sales before external authorization. Do not store durable truth in Vercel process memory. Do not bypass evidence drift gates by hand-editing generated evidence. Do not remove dependencies, migrations, tests, or workflows until their use and release impact are proven. Do not mark the PR ready or production complete from preview status alone.

## Restart Verification Checklist {#restart-checklist}

At the start of the next session, verify all of the following before implementation continues:

1. PR `#134` is still the active delivery vehicle or an explicit replacement has been approved.
2. Branch head and base SHA are refreshed from GitHub.
3. Current CI results are fetched for that exact head.
4. Vercel deployments for both known project IDs are checked against that exact SHA.
5. Supabase migration list is fetched and compared with source migrations.
6. `plan/architecture-obserra-production-readiness-1.md` is read as the production roadmap.
7. This file is read as the current restart handoff.
8. No new duplicate "source of truth" status document has been introduced.
9. Current dependency and lockfile state is captured before package changes.
10. Any live provider or database write is preceded by a reviewed, test-backed, reversible change set.
