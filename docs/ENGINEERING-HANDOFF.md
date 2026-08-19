# Obserra Website and Florida Class D LMS Engineering Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Repository:** `jblan2026-hub/obserra-website`  
**Pull request:** `#134`  
**Branch:** `hotfix/owner-lms-test-access-20260817`  
**Base branch:** `main`  
**Application baseline before this handoff update:** `7d7f47b50665b4a8d09106109de87b1c87607204`  
**Base SHA:** `e65a12c36279a23e6b5afd2d318398bf2ee23f91`  
**Status:** Active development, draft PR, not production promoted  
**Authoritative roadmap:** [`plan/architecture-obserra-production-readiness-1.md`](../plan/architecture-obserra-production-readiness-1.md)

This file is the canonical restart handoff for the current Obserra website, Academy, Florida Class D LMS, connector control plane, AI advisor, identity, commerce, scaling, security, mutation testing, repository sanitation, Vercel release control, Supabase state, and final owner acceptance work. Read this file first when resuming. The handoff commit itself advances the branch beyond the application baseline above, so always fetch the latest branch head before making changes.

## Resume Contract {#resume-contract}

Resume PR `#134` and branch `hotfix/owner-lms-test-access-20260817`. Do not restart from `main`, create a parallel architecture, or treat historical validation claims in the PR body as current evidence. Refresh the exact PR head, GitHub checks, Vercel deployments, Supabase migrations, and current dependency lock state before implementation resumes.

The platform is still under active development. Do not represent regulated learner activation, attendance credit, course completion, certificate issuance, LIAS reporting, connector production activation, AI advisor production readiness, or 200-student production capacity as complete until the live release gates below are satisfied.

## Repository Authority {#repository-authority}

Implementation truth comes from the exact GitHub branch. Durable sequencing and production requirements live in `plan/architecture-obserra-production-readiness-1.md`. Current restart state lives only in this file.

The following conflicting historical status documents were removed and must not be recreated as competing current truth:

- `docs/PRODUCTION-READINESS-SOURCE-OF-TRUTH.md`
- `docs/OWNER_PRODUCTION_READINESS_REGISTER.md`
- `docs/PRODUCTION-IDENTITY-READINESS.md`

Generated legal, CMMC, FDACS, release, and audit evidence remains governed by the existing generation workflows and controlled files under `docs/compliance/` and `docs/florida-class-d-lms/`.

## Current Pull Request State {#current-pr-state}

At application baseline `7d7f47b50665b4a8d09106109de87b1c87607204`, PR `#134` was open, draft, mergeable, 237 commits deep, and contained 86 changed files relative to `main` base `e65a12c36279a23e6b5afd2d318398bf2ee23f91`.

The PR body still contains an older validation SHA and older green-check claims. Treat those as historical. Before final review, replace the PR body validation section with exact-head evidence from one fully green release candidate.

## Exact-Head CI State {#ci-state}

GitHub Actions results for application baseline `7d7f47b50665b4a8d09106109de87b1c87607204`:

| Gate | Result | Exact interpretation |
|---|---|---|
| CodeQL Advanced | SUCCESS | Current baseline passed CodeQL. |
| Florida Class D LMS Gates | SUCCESS | Current baseline passed the regulated LMS gate suite, including the 200-student source capacity contract. |
| Academy 70x Production Gate | SUCCESS | Current baseline passed the Academy production gate. |
| Website CI | FAILURE | Failure occurred at governed legal-identity evidence drift. Unit tests, lint, build, and later website steps were skipped in that workflow. |
| CMMC Evidence Governance | FAILURE | Governing catalogs and source-watch checks passed. The run stopped at generated CMMC system-evidence drift. |
| Vercel Auxiliary Project Policy | FAILURE | The workflow stopped at `Require configured Vercel credential`; reconciliation steps did not execute. |

Current run IDs for this baseline:

- Website CI: `32286858358`
- CMMC Evidence Governance: `32286858165`
- CodeQL Advanced: `32286858329`
- Florida Class D LMS Gates: `32286858263`
- Academy 70x Production Gate: `32286858392`
- Vercel Auxiliary Project Policy: `32286858181`

Do not hand-edit generated evidence merely to clear drift. Use governed generation or remediation outputs and then re-run all required checks on one exact head. The auxiliary Vercel workflow also needs an approved credential path that is available to the governed workflow context.

## Vercel State {#vercel-state}

Vercel team ID: `team_xpUE1GefY2JHuFFCqbAdnZAj`.

For exact application baseline `7d7f47b50665b4a8d09106109de87b1c87607204`:

### Canonical candidate project

Project ID: `prj_FfAnssVJU8pcJydGNJHmCliP6Yme`  
Deployment name: `obserra-website-lcn2`  
Deployment ID: `dpl_Bjq2e5sg5RqrBJPQDFDLphn4J2jf`  
Preview hostname: `obserra-website-lcn2-hfofqall7-obserra.vercel.app`  
State: `READY`  
Target: preview / non-production

### Auxiliary duplicate project

Project ID: `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`  
Deployment name: `obserra-website-live`  
Deployment ID: `dpl_DPbKQmNxMBjh7VK73jMhmqLMZNEE`  
State: `CANCELED`

The branch now contains explicit auxiliary-project reconciliation work, including `.github/workflows/vercel-auxiliary-project-policy.yml`. That workflow currently fails before reconciliation because its required Vercel credential is not configured or not available in the PR workflow context.

Do not infer production authority from project names. Production promotion requires one authoritative project, explicit domain ownership, captured rollback aliases, exact-SHA deployment identity, smoke tests, and post-cutover verification.

## Supabase State {#supabase-state}

Identity project: `ftkjhmtfyfkartfsnkjb`.

Live migration history currently contains:

- `obserra_identity_authority`
- `identity_provider_subject_fk_index`
- `owner_lms_workspace_foundation`
- `owner_lms_participant_monitoring`
- `owner_lms_webrtc_media_mode`
- `owner_lms_private_authorization`

The private owner LMS authorization remediation is live. The privileged owner authorization helper belongs in the private schema and the public helper is not the intended authorization surface.

`supabase/identity/migrations/20260819030000_connector_control_plane.sql` exists in source but is still absent from the live migration list. Treat the connector persistence layer as source implemented but not live activated. Apply it only as a reviewed forward migration after exact-head source, security, and evidence gates are green. After application, run Supabase security and performance advisors and verify tenant isolation, RLS, RPC exposure, failure queues, health state, and secret access boundaries.

## Connector Control Plane {#connector-control-plane}

Current connector implementation under `lib/connectors/` includes:

- `contracts.ts`
- `database.ts`
- `repository.ts`
- `secret-envelope.ts`
- `url-policy.ts`
- `resilience.ts`
- `http-adapter.ts`
- `key-provider.ts`

The control plane provides tenant and owner scoping, typed Supabase persistence, fail-closed activation, durable health state, failure queues, URL allowlisting, SSRF-oriented URL validation, explicit request timeouts, bounded payload/header handling, retry with jitter, `Retry-After` awareness, durable circuit state, correlation IDs, idempotency requirements for consequential mutations, provider failure classification, and content-free operational telemetry.

### Encryption and Key Vault

The connector secret envelope uses AES-256-GCM with authenticated context binding. The current branch also includes a production Azure Key Vault key-provider implementation. In Vercel production, the environment-backed provider is explicitly forbidden. The Azure provider validates the vault origin, Azure tenant/client IDs, explicit API version, immutable secret-version bindings, key IDs, bounded secret material, token caching, key caching, retry behavior, and configuration failure paths.

Production activation still requires real Azure tenant, client, federated identity or approved assertion path, Key Vault URL, immutable key-map configuration, permissions, rotation rehearsal, key-revocation behavior, and exact-head integration verification. Source implementation is not evidence that the production vault is configured.

Provider-specific integrations must not bypass this control plane. OAuth, API-key, service-account, webhook, and polling integrations should converge on tenant-scoped identity, normalized health, provenance, replay protection, idempotency, rate awareness, retries, circuit breakers, failure queues, audit correlation, and risk-graph normalization.

## AI Advisor State {#ai-advisor-state}

The Florida Class D live classroom contains a real AI advisor implementation:

- API route: `app/api/florida-class-d/live/advisor/route.ts`
- Server implementation: `lib/florida-class-d-ai-advisor.ts`
- UI: `app/florida-security-training/live/[liveSessionId]/AiAdvisorPanel.tsx`
- Styling: `app/florida-security-training/live/[liveSessionId]/AiAdvisorPanel.module.css`
- Classroom mount: `app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx`
- Contract test: `test/florida-class-d-ai-advisor-contract.test.mjs`

Current defaults are `gpt-5.1` with medium reasoning and `gpt-4o-mini-tts` with voice `marin`. The TTS response is MP3 and the learner UI discloses that the voice is AI generated.

The advisor is bounded as an instructional assistant. It may teach and clarify but must not authorize, certify, grade, award attendance, award instructional credit, issue certificates, make licensing determinations, modify student records, override the instructor, or supply graded final-exam, live-poll, presence-challenge, or certification answers. Live lesson content is delimited as untrusted instructional data so content cannot redefine authority, request secrets, or override system rules.

Current gap: `lib/florida-class-d-ai-advisor.ts` still reads `OPENAI_API_KEY` directly and calls OpenAI through the shared resilience primitive. It has not yet been moved to the tenant-scoped connector repository, encrypted connector credential, normalized health, and shared HTTP-adapter execution path. That convergence remains required before the advisor is considered fully integrated into the connector control plane.

Production provider configuration, real authenticated reasoning/voice testing, latency measurement, cost telemetry, rate-limit behavior, error recovery, audio playback accessibility, and content-retention review remain required.

## Florida Class D LMS and Live Media {#florida-class-d-lms}

The owner validation workspace and learner classroom use real provider-oriented code paths and retain fail-closed regulatory invariants.

Key areas include:

- `app/florida-security-training/owner-validation/lms/`
- `app/api/florida-class-d/owner-validation/daily/route.ts`
- `app/api/florida-class-d/owner-validation/courseware/route.ts`
- `lib/florida-class-d-owner-test-session.ts`
- `lib/florida-class-d-production-owner-identity.ts`
- `lib/florida-class-d-production-owner-validation.ts`
- Daily provider libraries
- owner LMS Supabase migrations

The owner workspace requires the intended owner identity, AAL2, active session binding, and server-side authorization. Daily rooms/tokens are real provider paths. Protected courseware uses Supabase database and Storage paths.

Final owner UAT remains human-only and must exercise exact-release owner sign-in, AAL2, instructor and learner Daily joins, camera, microphone, captions, screen share, reconnect, courseware upload/view/presentation/delete, notes/messages/realtime behavior, AI advisor reasoning and voice, and confirmation that attendance credit, completion, certificate, and LIAS actions remain fail closed where external authorization is still required.

## 200-Student Capacity and High Availability {#capacity-ha}

The regulated source contract and executable load harness are present in:

- `scripts/florida-class-d-capacity-gate.mjs`
- `load/florida-class-d-200-students.k6.js`

Governed assumptions:

- Target authenticated students: `200`
- Daily participant limit per room: `75`
- Reserved instructor seats per room: `1`
- Learner seats per room: `74`
- Minimum parallel rooms: `3`
- Total learner-seat capacity: `222`
- Attendance heartbeat cadence: `60 seconds`
- Heartbeat phase window: `55 seconds`
- State refresh cadence: `15 seconds`
- Load failure threshold: unexpected HTTP failures below `1%`
- Load latency threshold: p95 below `2000 ms`, p99 below `4000 ms`

The capacity gate enforces deterministic phase staggering to avoid synchronized heartbeat and polling bursts. Database heartbeat paths remain indexed and bounded. The k6 harness requires real authenticated learner sessions and blocks accidental production load unless explicitly enabled.

Gate 36 is source-level capacity evidence, not live-capacity proof. Before release, execute the authenticated 200-user profile and a sustained soak in an approved environment. Verify Daily account quota, room fan-out, Vercel function behavior, Supabase database/realtime saturation, provider errors, p50/p95/p99 latency, throughput, reconnection behavior, memory/resource trends, and failure recovery.

The Vercel layer must remain stateless for durable identity, authorization, attendance, progress, commerce, courseware, connector state, and live-session truth.

## Authentication and Sign-In {#authentication}

The repository has two intentional identity responsibilities. Clerk remains active across public sign-in, portal, Academy, application access, and related routes. Supabase auth is used in the regulated Florida owner-validation path. Do not remove either dependency without a route-by-route authority analysis.

The owner LMS path must preserve exact owner identity, AAL2, active session binding, and server-side authorization. Browser-controlled role, tenant, owner, or organization claims are not authority.

Before release, test sign-in, MFA, refresh, session expiration, logout, recovery, wrong-user access, stale session, revoked session, wrong organization, AAL downgrade, and provider-outage behavior on the exact preview SHA.

## Payments and Commerce {#payments}

Stripe remains an active runtime dependency for website and Academy commerce. Server-side checkout, price authority, webhook signature validation, idempotency, durable fulfillment, entitlement transitions, refunds, disputes, billing portal behavior, and error containment must remain server controlled.

Florida Class D regulated new sales remain licensing-pending until external authorization is satisfied. Existing learner entitlements must remain intact while the new-sale gate is closed.

Do not remove or consolidate Stripe code until repository-wide checkout, webhook, entitlement, claim, portal, refund, dispute, and application-commerce dependencies have been traced and validated.

## Dependency and Repository Sanitation {#repo-sanitation}

Repository cleanup is governed by actual usage and regenerability, not filename patterns.

The following runtime dependencies remain actively used and are not approved for removal:

- `@clerk/nextjs`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `stripe`
- `framer-motion`
- `lucide-react`
- `@vercel/analytics`
- Next.js / React runtime packages

`package.json` and `package-lock.json` must remain synchronized. Cleanup must preserve migrations, release workflows, evidence generators, test gates, compliance artifacts, and any file referenced by deployment or recovery procedures.

Remaining cleanup controls:

1. transitive vulnerability scan;
2. license inventory and incompatibility review;
3. SBOM generation and release retention;
4. secret scan across tracked content and history where appropriate;
5. dead-code and unused-export analysis;
6. stale-document consolidation;
7. redundant-test analysis;
8. build/test/workflow reference analysis before package or file deletion.

## Mutation Testing and Test Effectiveness {#mutation-testing}

Mutation testing is now a required advanced quality gate for security-critical and high-blast-radius TypeScript/JavaScript logic.

The required tool path is:

1. Build a code graph with Trailmark and run pre-analysis for entrypoints, privilege boundaries, blast radius, and taint context.
2. Run Stryker against selected production TypeScript/JavaScript modules. Start with connector security primitives, authorization/mutation admission, payment state transitions, regulated attendance/completion logic, and AI advisor guardrails rather than mutating the entire repository in one expensive pass.
3. Run Necessist where the repository test framework is supported to identify test statements whose removal does not change outcomes.
4. Triage every survived mutant. Do not assume all survivors need unit tests and do not dismiss them as noise.
5. Classify survivors and weak-test findings into equivalent/harmless findings, dead code, missing unit or negative tests, property-based test candidates, and fuzzing targets.
6. Give highest priority to findings that affect authorization, RLS assumptions, SSRF/URL policy, key-provider configuration, encryption/decryption, idempotency, webhook replay, payment fulfillment, regulated learner credit, assessment integrity, and other privilege boundaries.
7. Write a Genotoxic report with all survivors classified. No unclassified survivor is acceptable for a release-candidate mutation report.

The JavaScript/TypeScript mutation framework is Stryker. Genotoxic requires actual mutation-framework execution and Trailmark graph analysis. Manual mutation review is not a substitute if tool installation or execution fails. Necessist is recommended where supported because it identifies weak assertions and unnecessary test statements that mutation testing alone may miss.

Mutation testing should be introduced as a development/release quality job with bounded scope first. It should not block every small documentation commit, but the release candidate must have current mutation evidence for the designated critical modules. Mutation score alone is not sufficient; survived-mutant risk classification is the release artifact.

## UI, UX, Accessibility, Media, and Visualization {#experience-track}

The target experience remains a premium Obserra dark navy, black, and gold system with advanced responsive behavior, strong loading/empty/error states, purposeful motion, accessible tables and graphs, touch-first iPhone/iPad behavior, desktop power-user workflows, reduced-motion support, and WCAG-focused keyboard/focus/screen-reader behavior.

The AI advisor remains isolated as its own component so state changes do not force the complete live-classroom tree to rerender. Continue that isolation pattern for performance.

3D and interactive visualization remain progressive enhancement. WebGL, model, GPU, or animation failure must never block sign-in, learning access, regulated notices, payments, or live-class operation. Provide accessible non-WebGL equivalents, deterministic asset manifests, bounded asset sizes, keyboard interaction, and reduced-motion behavior.

Video/audio work must preserve user-controlled playback, captions/transcripts where required, device permission clarity, graceful reconnect, reduced motion, and no audible autoplay without user activation.

## Security and Penetration Testing {#security-state}

Current controls include server-only privileged modules, same-origin mutation admission, runtime response validation, private Supabase authorization helpers, RLS, server-controlled payment amounts, Daily private rooms/tokens, fail-closed provider handling, SSRF-oriented connector restrictions, bounded retries/timeouts, replay/idempotency controls, prompt-injection boundaries, CodeQL, and the production Key Vault provider path.

Continue authorized negative testing for:

- unauthenticated and wrong-user access;
- AAL downgrade and stale/revoked sessions;
- IDOR and tenant crossing;
- CSRF and origin bypass;
- upload abuse and signed-URL leakage;
- RLS/RPC bypass;
- rate abuse and synchronized-request bursts;
- payment amount/state manipulation;
- webhook signature and replay attacks;
- connector SSRF, redirect abuse, DNS/IP edge cases, and credential leakage;
- AI prompt injection, assessment bypass, hidden-instruction leakage, and authority escalation;
- security headers, CSP, permissions policy, and browser isolation boundaries.

Do not log credentials, signed URLs, payment secrets, service-role tokens, Key Vault secret material, sensitive learner PII, or model system/developer instructions.

## Engineering Control System {#skill-controls}

Continue using the installed expert skills as active engineering controls. Prefer the most specific advanced skill for the component under work instead of repeatedly defaulting to one general skill.

Control families include repository cleanup, dependency scanning, license analysis, secret scanning, SBOM, mutation testing, Genotoxic triage, CodeQL, secure code, threat modeling, authorization testing, input validation, prompt-injection defense, dynamic testing, Next.js, React, Node.js, TypeScript, advanced UI/UX, accessibility, motion, branding, graphics, performance, Supabase/PostgreSQL, migrations, RLS, connector/API integration, OAuth, webhooks, resilience, observability, Stripe, billing, live video, TTS, LLM reasoning, media processing, 3D visualization, load testing, capacity planning, Vercel scaling, deployment, CI/CD, rollback, and review.

Use repository evidence first. Consult current vendor documentation only when the repository and installed skill guidance are insufficient for a version-sensitive implementation detail.

## Immediate Resume Sequence {#resume-sequence}

Resume in this order unless new evidence changes priority:

1. Fetch the latest PR head, current checks, Vercel deployments, and Supabase migrations. The handoff commit advances the branch beyond the application baseline recorded above.
2. Clear legal-identity and CMMC evidence drift through governed generation, then obtain Website CI and CMMC green on the same exact head as the functional gates.
3. Supply or redesign the approved Vercel credential path for `.github/workflows/vercel-auxiliary-project-policy.yml`, then complete auxiliary-domain separation and verify the canonical project owns production domains.
4. Re-run CodeQL, Florida Class D LMS Gates, Academy 70x, Website CI, CMMC, auxiliary Vercel policy, and applicable application-release validation on one exact candidate SHA.
5. Finish connector production activation: review the connector migration, apply it to Supabase as a forward migration, verify RLS/RPC/tenant boundaries, run Supabase advisors, and verify failure queues and health state.
6. Configure and validate the Azure Key Vault production identity, permissions, immutable key mappings, rotation, rollback, and loss/revocation behavior.
7. Move the AI advisor from direct `OPENAI_API_KEY` access to the tenant-scoped connector credential and shared HTTP adapter. Preserve assessment, credit, prompt-injection, logging, and fail-closed boundaries.
8. Introduce the bounded Stryker + Trailmark + Genotoxic mutation-testing workflow for critical modules. Run Necessist where supported, classify survivors, and add targeted tests or fuzz harnesses before release-candidate signoff.
9. Continue repository sanitation only after dependency/use evidence. Complete vulnerability, license, SBOM, secret, dead-code, stale-doc, and redundant-test passes.
10. Execute authenticated 200-student k6 validation and soak testing with measured Vercel, Supabase, Daily, and AI-provider behavior.
11. Complete advanced sign-in, responsive UI/UX, accessibility, video/audio/playback, error-state, performance, observability, action-button, and visualization validation.
12. Complete owner live UAT on the exact release SHA, including AAL2, Daily, courseware, realtime, AI advisor reasoning/voice, and negative regulated-credit assertions.
13. Refresh the PR body with exact-head evidence and current limitations. Keep the PR draft until owner UAT and release control are complete.
14. Promote only through the governed exact-SHA cutover and rollback workflow. Perform post-cutover identity, transaction, runtime-log, domain, security-header, and regulated-route smoke validation.

## Do Not Regress {#do-not-regress}

Do not reintroduce public privileged LMS authorization functions. Do not expose `service_role`, Stripe, Daily, OpenAI, connector, Key Vault, signing, or database secrets to the browser. Do not simulate remote learners as production participants. Do not weaken AAL2 or owner authorization for convenience. Do not make the AI advisor authoritative for grading, attendance, licensing, completion, or certification. Do not enable regulated new sales before external authorization. Do not store durable truth in Vercel process memory. Do not bypass evidence drift gates by hand-editing generated evidence. Do not remove dependencies, migrations, tests, or workflows until use and release impact are proven. Do not substitute manual mutation review when Stryker/Trailmark tooling is required. Do not mark the PR ready or production complete from preview readiness alone.

## Restart Verification Checklist {#restart-checklist}

At the start of the next session:

1. Verify PR `#134` is still the active delivery vehicle.
2. Fetch current branch head and base SHA.
3. Fetch current CI results for that exact head.
4. Check both Vercel project IDs against that exact SHA.
5. Check whether the auxiliary Vercel policy has a valid credential path and completed reconciliation.
6. Fetch Supabase migration history and compare it with source migrations.
7. Read `plan/architecture-obserra-production-readiness-1.md`.
8. Read this file as the current restart handoff.
9. Confirm no competing current-state document has been introduced.
10. Capture current `package.json` and lockfile state before package changes.
11. Check mutation-testing configuration/results if Stryker/Genotoxic has been introduced since this handoff.
12. Require reviewed, test-backed, reversible change sets before live provider or database writes.