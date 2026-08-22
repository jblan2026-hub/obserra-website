# Obserra Website — Evidence-Only Continuation Handoff

> **Update rule:** This document records verified repository and public-runtime facts only. A PR, ticket, source change, CI result, or Vercel build is never recorded as a live-production success by itself. Do not put credentials, tokens, customer data, or private skill-library contents in this file.

## Restart here

1. Read this file first.
2. Probe the canonical public endpoints listed below.
3. Compare the returned deployment ID and commit SHA with the intended candidate.
4. Continue only when the next action is authorized by the evidence and rollback state is known.
5. Append a dated entry after every material deployment, alias, payment, LMS, or rollback event.

## Authoritative endpoints

| Surface | URL | Required interpretation |
| --- | --- | --- |
| Canonical website identity | https://www.obserrallc.com/api/health | Only an exact candidate deployment ID/SHA with `routing.authority: "verified"` proves canonical cutover. |
| Marketplace route | https://www.obserrallc.com/marketplace | Must resolve to the actual Applications marketplace; a 404 is not accepted. |
| Applications marketplace | https://www.obserrallc.com/apps | Must not make unverified self-service purchase, launch, download, or availability claims. |
| Academy commerce | https://www.obserrallc.com/api/academy/commerce-health | `200` plus `operational: true` is required before calling payment live. `503` is fail-closed, not payment live. |
| Florida LMS liveness | https://www.obserrallc.com/api/florida-class-d/health/live | Liveness alone does not authorize regulated learner operation. |
| Florida LMS readiness | https://www.obserrallc.com/api/florida-class-d/health/ready | `200` and `status: "ready"` are required before calling regulated learner operations live. |

## Current factual snapshot

- **Snapshot time:** 2026-08-22T17:38:35.106Z
- **Repository:** https://github.com/jblan2026-hub/obserra-website
- **Canonical Vercel project:** `obserra-website-live` / `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`
- **Canonical domains:** `www.obserrallc.com` and `obserrallc.com`
- **Public canonical deployment at last probe:** `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa`
- **Public canonical commit at last probe:** `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`
- **Public marketplace at last probe:** HTTP `404`
- **Public Academy commerce at last probe:** HTTP `503`; `operational: false`, provider unavailable, durable storage unavailable.
- **Public Florida LMS at last probe:** liveness HTTP `200` / `live`; readiness HTTP `503` / `not_ready`.
- **No payment, LMS enrollment, or regulated learner operation is currently claimed as live in this handoff.**

## Candidate and cutover state

- Previously built candidate: `dpl_EChExDRAWYwZiXkrjhkqdHS57CLG`, commit `9ca43a3e45e27126546ed49ed86861919846caf6`, READY and health-verified on its deployment URL.
- That candidate is **not canonical** until the canonical health endpoint reports its exact ID/SHA.
- A direct cutover-trigger commit `f21ade991bcc5473027fd88cf68e9af991b9b9c7` was rejected by Vercel before build because the project requires a verified commit.
  - Vercel deployment: `dpl_Gow62JNvbk8piFKZLiMXT4uPdN5f`
  - State: `CANCELED`
  - Vercel evidence: verified-commits policy error; no build logs.
- Current corrective path: GitHub-signed merge commit from branch `chore/verified-canonical-cutover-trigger-20260822`. It changes only workflow observability/documentation so Vercel receives a verified main-head commit. It is **not** a live result until the public checks below pass.

## Acceptance evidence for the current cutover

All must be observed from the public canonical host:

1. `/api/health` returns HTTP 200 with the newly created signed merge SHA and its exact Vercel deployment ID.
2. `/marketplace` is no longer HTTP 404 and resolves to the Applications marketplace.
3. `/`, `/apps`, `/apps/obserra-eios`, and `/florida-security-training` respond successfully and contain no removed mockup, unsupported launch, self-service payment, or false readiness claims.
4. Academy commerce remains fail-closed unless it independently returns HTTP 200 with `operational: true`.
5. Florida readiness remains readiness-gated unless it independently returns HTTP 200 with `status: "ready"`.
6. If any required canonical test fails after alias movement, the rollback path must restore the captured prior aliases before any success claim.

## Safe continuation constraints

- Do not expose, log, copy, or place Vercel, Stripe, Supabase, Clerk, Azure, or GitHub secret values in the repository or chat.
- Do not upload, publish, commit, or copy the private Obserra skill library.
- Do not present mockups, placeholders, direct self-service app launch links, purchase links, or product availability as production facts without endpoint evidence.
- Do not say “green,” “complete,” or “live” based solely on GitHub, Vercel build status, PR state, or a deployment URL.
- Preserve fail-closed payment and regulated-LMS controls until their public readiness contracts independently pass.

## Update log

### 2026-08-22T17:38:35.106Z — handoff created

- Persisted the current public evidence, verified-commit deployment rejection, and next acceptance criteria in the repository.
- Next action: complete the signed merge, wait for the exact Vercel candidate, then re-probe the canonical public host and append the result here.


## Continuous operational record

**This branch is the current audit record:** `ops/live-handoff`. The same file on `main` is the signed baseline snapshot. Update this branch after every material action, evidence probe, deployment, alias attempt, blocker, rollback decision, or scope change. Never record secret values.

### 2026-08-22T17:44:51.168Z — active cutover chronology

| Time / order | Action or evidence | Result |
| --- | --- | --- |
| Baseline | Probed canonical website identity. | `www.obserrallc.com/api/health` returned `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` at `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`. |
| Baseline | Probed public marketplace. | `/marketplace` returned HTTP `404`. |
| Baseline | Probed public commerce and LMS readiness. | Academy commerce returned HTTP `503`, `operational: false`; Florida liveness returned HTTP `200`; Florida readiness returned HTTP `503`, `not_ready`. |
| Cutover attempt 1 | Added an auditable cutover run name directly on `main`. | Vercel canceled `dpl_Gow62JNvbk8piFKZLiMXT4uPdN5f` before build because its verified-commit policy rejected unverified commit `f21ade991bcc5473027fd88cf68e9af991b9b9c7`. No public alias was changed. |
| Corrective path | Created and validated PR [#202](https://github.com/jblan2026-hub/obserra-website/pull/202). | Production Authority Contract, Website CI, and CodeQL passed. These are source gates only, not live acceptance. |
| Signed merge | Merged PR #202 through GitHub. | Verified merge commit: `278567f6a9c42c2f795a552714984d98f311e4d0`. |
| Candidate proof | Vercel built the signed production candidate. | `dpl_HyUZkePdAL8Rxtn29WC7FxbV5Vxt` is READY, tied to exact signed commit `278567f6a9c42c2f795a552714984d98f311e4d0`, and its `/api/health` returns the same deployment ID/SHA with verified authority. |
| Canonical probe | Probed `www.obserrallc.com/api/health` after the signed candidate became READY. | Still returned old `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa / 1d9ad1f042f527552d1e65763b0bc1f26ba0f829`. No cutover success is claimed. |
| Alias evidence | Inspected the candidate Vercel deployment and project record. | Candidate lists only Vercel-generated aliases; the public canonical aliases are not attached to the candidate. |
| Current task | Continue guarded cutover observation and record every result here. | Pending. Do not call marketplace, payments, or LMS enrollment live until public endpoints independently satisfy the acceptance evidence. |

### Next recorded action

- Continue probing the public canonical health endpoint and inspect the controlled cutover result without exposing credentials.
- On alias movement, immediately record the exact observed deployment/SHA and route probes.
- On failure or timeout, record the exact fail-closed evidence and the smallest authorized corrective action before changing source or infrastructure.


### 2026-08-22T17:45:29.919Z — continuous-update controls enabled

- Created the dedicated `ops/live-handoff` branch so operational updates do not alter production code or produce a production deployment.
- Enabled the repository event watcher for pull-request openings, commit updates, reviews, comments, and merges. It is instructed to update this file with evidence only; it must not record secrets or turn CI/deployment status into a live claim.
- Current in-session work continues to append material actions and public probes here.


### 2026-08-22T17:46:18.850Z — PR #201 synchronized (unmerged)

- **Event:** Pull request [#201](https://github.com/jblan2026-hub/obserra-website/pull/201) received new commits.
- **PR state:** open, mergeable, unmerged.
- **Head commit:** `466a4af86d866efff1608a4add54378771da2934`.
- **Scope reported by the PR:** Applications commerce authority, payment/storage controls, and guarded Azure/Entra/Intune preparation. These are source changes under review; none are recorded as live.
- **Vercel preview evidence:** `dpl_Buf7ZP2UXndPYsXQwDXYrvcsoWF4` for the PR head was `CANCELED` because the branch commit is unverified. This is not a production deployment and does not establish a build, provider, or commerce result.
- **Fresh canonical evidence:** `www.obserrallc.com/api/health` still returned `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`.
- **Fresh commerce/LMS evidence:** Academy commerce remained HTTP `503`, `operational: false`; Florida liveness remained HTTP `200`; Florida readiness remained HTTP `503`, `not_ready`.
- **Safe next action:** Do not merge or describe PR #201 as production-ready without reviewing its exact source, passing applicable gates, producing a verified merge candidate, and proving the public canonical endpoints afterward.


### 2026-08-22T17:46:55.786Z — guarded cutover queue analysis

- **Observed facts:** direct main commit `f21ade991bcc5473027fd88cf68e9af991b9b9c7` produced canceled Vercel deployment `dpl_Gow62JNvbk8piFKZLiMXT4uPdN5f`; signed main commit `278567f6a9c42c2f795a552714984d98f311e4d0` produced READY candidate `dpl_HyUZkePdAL8Rxtn29WC7FxbV5Vxt`; canonical aliases are still old.
- **Inference, not proof:** the production cutover workflow uses a non-canceling concurrency group and waits up to 60 × 10 seconds for an exact READY deployment. The canceled direct-commit run may be holding the group until its bounded timeout, leaving the signed run queued. This explains the current delay without treating it as a success or guessing credential state.
- **Next action:** allow the bounded run to fail closed, then re-probe canonical identity and record whether the signed cutover starts. If it does not, obtain the actual Actions failure evidence before changing alias logic.


### 2026-08-22T17:49:53.804Z — canonical public recheck

- **Canonical identity:** `https://www.obserrallc.com/api/health` returned HTTP `200` from `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` at `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`, with Vercel/project authority reported as verified. This is still the earlier canonical deployment, not signed candidate `dpl_HyUZkePdAL8Rxtn29WC7FxbV5Vxt` / `278567f6a9c42c2f795a552714984d98f311e4d0`.
- **Marketplace:** `/marketplace` rendered the canonical deployment's “PAGE NOT FOUND” response; it has not reached the merged Applications routing behavior.
- **Commerce:** `/api/academy/commerce-health` remained fail-closed: `operational: false`, payment provider unavailable, durable storage unavailable. Payment is not live.
- **Florida LMS:** `/api/florida-class-d/health/ready` remained `status: "not_ready"`. Regulated learner operation is not live.
- **Safe next action:** no source or alias change was made from this probe. Inspect the Vercel production deployment/cutover state and obtain direct failure evidence if the signed candidate remains unassigned.


### 2026-08-22T17:53:53Z — canonical cutover observability corrective action

- **Vercel deployment evidence:** Signed production candidate `dpl_HyUZkePdAL8Rxtn29WC7FxbV5Vxt` remains `READY` for exact verified SHA `278567f6a9c42c2f795a552714984d98f311e4d0`; its alias list contains only `obserra-website-live-obserra.vercel.app` and `obserra-website-live-git-main-obserra.vercel.app`.
- **Project ownership evidence:** The canonical Vercel project returned only those generated domains; neither canonical public alias appears on the candidate or project response. The public canonical host still proves old deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`.
- **Diagnostic discrepancy:** GitHub’s Vercel commit-status context for the signed candidate is `failure`, while Vercel reports the deployment `READY`; error-only Vercel build logs report only “Build Completed,” and Vercel reports no runtime errors for the project in the selected one-hour window. This does not prove a cutover or a cause.
- **Workflow inspection:** The cutover workflow correctly guards candidate identity, fail-closed preflight, alias capture, domain ownership, alias assignment, smoke, duplicate-project quarantine, and rollback, but it did not publish a readable phase outcome. The current GitHub connector cannot enumerate push-triggered Actions runs directly.
- **Corrective source action:** Opened [PR #203](https://github.com/jblan2026-hub/obserra-website/pull/203) from `fix/cutover-evidence-status-20260822` at `d33276938200ebe38b04f9e6d9efad130014748f`.
  - Scope: workflow-only; grants `statuses: write`, identifies each guarded phase, and publishes a non-secret commit-status description after every cutover outcome.
  - The status is diagnostic only. It cannot be used as a live-production claim; the canonical public endpoint remains the acceptance authority.
  - No credentials, private-library content, payment settings, LMS settings, aliases, or public application behavior were changed.
- **Next safe action:** wait for PR #203 source gates. If it is safely merged as a verified main commit, read its safe phase status, then re-probe the canonical public endpoints before any claim.


### 2026-08-22T17:54:34.709Z — PR #203 opened event

- **Event:** Pull request [#203](https://github.com/jblan2026-hub/obserra-website/pull/203) opened.
- **Source state:** open, mergeable, unmerged; head `d33276938200ebe38b04f9e6d9efad130014748f`; one modified workflow file (+55/−1). The source change adds safe cutover-phase reporting only. It has no public runtime effect until a verified merge is deployed and the canonical host proves it.
- **PR Vercel record:** Preview deployment `dpl_HqJK8WkzbVD4yPLUpFUpauc3dAJZ` was `CANCELED`; it is an unverified branch commit and not production evidence.
- **Fresh canonical identity:** `https://www.obserrallc.com/api/health` returned `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`, authority verified, at `2026-08-22T17:54:34.709Z`. It does not match the signed candidate or PR #203.
- **Fresh public routes:** `/marketplace` still rendered the old deployment’s not-found response; Academy commerce remained `operational: false` with payment provider and durable storage unavailable; Florida readiness remained `not_ready`.
- **Blocker:** canonical alias movement remains unproven and therefore not complete. Payments and regulated LMS operation remain fail-closed.
- **Next safe action:** await PR #203 source-gate evidence, merge only if those gates are satisfactory, then read its non-secret cutover phase status and verify the canonical public host’s exact deployment/SHA.


### 2026-08-22T17:56:xxZ — PR #203 gated merge

- **Source gates:** PR #203 head `d33276938200ebe38b04f9e6d9efad130014748f` completed Production Authority Contract (run `32589119989`), CodeQL Advanced (run `32589119981`), and Website CI (run `32589119978`) successfully. These are source controls only; they are not live acceptance.
- **Merge:** PR #203 was merged through GitHub as `6ac0879c2e8cdf1f9cea6a72e4923408aed79910`.
- **Scope retained:** workflow-only safe observability; no secrets, private-library content, canonical aliases, payments, LMS readiness, or public product behavior changed by the merge itself.
- **Next safe action:** wait for a Vercel production candidate carrying exact main SHA `6ac0879c2e8cdf1f9cea6a72e4923408aed79910`; read its non-secret cutover-phase status; then use the canonical public health endpoint to prove or reject cutover.


### 2026-08-22T17:57:11Z — PR #203 merged event and first observable cutover attempt

- **Merged source:** PR #203 merge commit `6ac0879c2e8cdf1f9cea6a72e4923408aed79910` is the current cutover input. Its candidate is Vercel production deployment `dpl_6sTjCaYjahoLaqD155s1wKGsTKoR` at `https://obserra-website-live-pajgjo5iu-obserra.vercel.app`, `READY`, exact SHA-matched, and Vercel reports GitHub commit verification `verified`.
- **Safe cutover result:** Actions run `32589227487`, job `97070274053`, accepted the configured Vercel credential and found the exact candidate. It failed in **Preflight exact canonical deployment health**. Every later mutation step—rollback-alias capture, domain move, alias assignment, canonical smoke, duplicate-project quarantine, and rollback—was skipped. No canonical domain was changed.
- **Candidate endpoint evidence:** Direct candidate probes returned health HTTP `200`, exact deployment/SHA, verified routing authority, `cache-control: no-store`, and the required routing header; commerce HTTP `503` with its fail-closed contract; Florida liveness HTTP `200/live`; Florida readiness HTTP `503/not_ready` with `Retry-After: 60`. These candidate results do not prove canonical cutover and do not establish the specific preflight assertion that failed.
- **Canonical state:** No new canonical public proof was produced; the last canonical probe remains old deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`.
- **Safe next action:** rerun the failed cutover job once against the now-READY candidate. If preflight fails again, add phase-granular preflight diagnostics before any alias mutation; do not bypass or weaken preflight.


### 2026-08-22T17:58:xxZ — persistent preflight failure; no mutation performed

- **Rerun:** The failed cutover job was rerun once through GitHub. The rerun job `97070508579` again accepted the Vercel credential, found the exact READY candidate, and failed only at **Preflight exact canonical deployment health**. Every alias/domain mutation and rollback-related step remained skipped.
- **Conclusion:** This is not a one-time candidate warm-up. The exact failed assertion is not emitted by the current preflight script, so no alias bypass, preflight weakening, or speculative provider change is authorized.
- **Audit correction:** An initial job-status lookup used the GitHub owner rather than the full repository path and returned HTTP `404`. It performed no write or deployment action. The corrected lookup returned the rerun result above.
- **Next safe action:** add safe, phase-granular preflight diagnostics (HTTP code / contract / required-header / checkout-lock / LMS assertion labels only) and rerun from a verified main merge. Do not log request bodies, credentials, or customer information.


### 2026-08-22T18:00:07Z — PR #204 opened for safe preflight trace

- **PR:** [#204](https://github.com/jblan2026-hub/obserra-website/pull/204), head `f96a58e72f55774bd42f04dcd19b6b4ad777b476`, open and unmerged.
- **Scope:** one workflow file, +3/−0. Adds a credential-free `ERR` trace to the candidate preflight block so the exact failed public-contract command and exit code are observable. It does not alter expected HTTP codes, contract fields, header checks, checkout lock, LMS checks, alias ownership, rollback, payments, or public pages.
- **Reason:** The prior exact candidate was READY and direct public-contract probes were healthy, but the guarded preflight failed twice without emitting its specific assertion. Mutation steps did not run.
- **Next safe action:** require source-gate evidence, merge only if satisfactory, then read the safe trace from a verified main-head run. Keep the public canonical host as the sole authority for live cutover.


### 2026-08-22T18:02:xxZ — PR #204 gated merge

- **Source gates:** PR #204 head `f96a58e72f55774bd42f04dcd19b6b4ad777b476` completed Production Authority Contract (run `32589428374`), CodeQL Advanced (run `32589428352`), and Website CI (run `32589428346`) successfully. These source results do not establish public production state.
- **Merge:** PR #204 was merged through GitHub as `48d4d73ed0587277625b2631d8d8075d7a45233b`.
- **Scope retained:** trace-only workflow change; no credential, payment, LMS, domain alias, or public-site behavior was changed by the merge itself.
- **Next safe action:** wait for exact verified Vercel candidate `48d4d73ed0587277625b2631d8d8075d7a45233b`, read the guarded preflight trace, and use canonical public identity—not workflow status—to establish any live cutover result.


### 2026-08-22T18:07:24.842Z — PR #204 merged event: traced candidate-preflight regression; no canonical mutation

- **Event / merged source:** Pull request [#204](https://github.com/jblan2026-hub/obserra-website/pull/204) was merged as `48d4d73ed0587277625b2631d8d8075d7a45233b`. Its exact Vercel candidate was `dpl_68rwmxVUmbtmAEze5WCNEsEEGWUM` at `https://obserra-website-live-alqw45u3u-obserra.vercel.app`.
- **Exact guarded failure:** Cutover run `32589519732`, job `97070979556`, verified the credential and exact candidate, then failed in **Preflight exact canonical deployment health** on the candidate checkout-status assertion that expected HTTP `307`. Rollback-alias capture, ownership move, alias assignment, canonical smoke, duplicate-project quarantine, and recovery were all recorded `skipped`; no canonical alias or domain was touched.
- **Root cause:** Direct deployment hosts are intentionally limited by `lib/direct-deployment-health-routing.ts` to read-only `GET` health endpoints. The candidate preflight incorrectly sent a checkout `POST`; the proxy redirected that request to the canonical domain (HTTP `308`) before the checkout route could return its intentional licensing-pending `307`. This is a release-workflow mismatch, not evidence that payment processing or LMS readiness works.
- **Fresh canonical evidence (2026-08-22T18:07:24.842Z):** `https://www.obserrallc.com/api/health` returned HTTP `200` with verified deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` and SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`, which is not the new merged SHA. Academy commerce returned HTTP `503`, `operational: false`, payment provider and durable storage unavailable. Florida readiness returned HTTP `503`, `not_ready`. The canonical site is therefore not current, payments are not live, and the regulated LMS is not ready.
- **No-op audit corrections:** A first handoff-write attempt failed locally because a shell-style `${...}` expression was interpolated by the client before any connector call; it made no repository, deployment, or provider change. A first job-log request used an incorrect connector field name and was rejected before reaching GitHub; the corrected retrieval produced the guarded failure above.
- **Approved minimal correction:** Retain the direct-host `GET`-only boundary. Remove only the candidate-host checkout `POST` from preflight, add a regression assertion that preflight stays read-only, and retain the canonical-domain checkout-lock `POST` after aliases are assigned and rollback is armed. This does not expose checkout on direct deployment hosts or relax the canonical smoke/rollback condition.
- **Next safe action:** open an isolated workflow/test PR, require its source gates, merge only after they pass, then use fresh canonical public endpoint identity to prove or reject the resulting cutover.


### 2026-08-22T18:09:20.013Z — PR #205 opened: read-only candidate preflight correction

- **PR:** [#205](https://github.com/jblan2026-hub/obserra-website/pull/205), head `abda3dc5b19d83f250122f30cffb8d94c4c654a2`, based on merged main `48d4d73ed0587277625b2631d8d8075d7a45233b`; two files changed.
- **Implemented correction:** The workflow removes the direct-candidate checkout POST from the `503` fail-closed commerce branch and explicitly documents the direct-host read-only policy. Exact candidate health, fail-closed commerce, and Florida liveness/readiness checks remain before any domain movement.
- **Regression coverage:** `test/vercel-canonical-deployment-preflight.test.mjs` now fails if candidate preflight contains `/api/academy/checkout` or `--request POST`; it also requires the canonical smoke to keep the canonical checkout POST, the intentional `307` licensing-pending result, the pending-license header, and alias-success ordering.
- **Safety retained:** The direct deployment route policy remains GET-only. The canonical checkout lock still runs only after alias assignment and with rollback aliases already captured. No payment activation, secret/configuration change, public alias mutation, LMS readiness override, or marketplace package publication occurred.
- **Current live evidence remains unchanged:** canonical health is still `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`; commerce and Florida readiness remain fail-closed HTTP `503`.
- **Next safe action:** wait for source-gate evidence for PR #205. If it passes, merge it and require a fresh canonical endpoint proof for the generated exact Vercel candidate; do not treat the PR or CI as a live outcome.


### 2026-08-22T18:10:22.719Z — PR #201 synchronize event

- **Event:** Pull request [#201](https://github.com/jblan2026-hub/obserra-website/pull/201) synchronized. It remains open and unmerged; GitHub currently titles it `Harden production commerce and prepare governed Azure cutover` and reports an update at `2026-08-22T18:09:40Z`.
- **Evidence boundary:** The PR description contains proposed/claimed source and provider state, but this webhook event provides no exact head SHA, successful deployment, or canonical-runtime proof. Those statements are therefore not accepted here as production evidence.
- **Fresh canonical public evidence:** at `2026-08-22T18:09:57.666Z`, `https://www.obserrallc.com/api/health` returned HTTP `200` with verified deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` and SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`. Academy commerce returned HTTP `503`, `operational: false`, payment provider unavailable, durable storage unavailable. Florida readiness returned HTTP `503`, `not_ready`.
- **Current blocker:** Canonical public identity is still the old deployment; payments and regulated LMS readiness remain fail-closed. This PR event does not change those facts.
- **Next safe action:** continue the separate exact cutover fix in [PR #205](https://github.com/jblan2026-hub/obserra-website/pull/205); for #201, require independent source-gate, provider, and canonical exact-SHA evidence before accepting any claimed cutover or commerce state.


### 2026-08-22T18:11:07.751Z — PR #205 source-gate failure: stale contract assertion

- **Gate results:** Production Authority Contract (run `32589884775`) and CodeQL Advanced (run `32589884833`) completed successfully. Website CI run `32589884815` failed in unit/contract testing; lint, build, and later steps were not run.
- **Exact failing check:** job `97071923908`, test `test/production-vercel-public-cutover-contract.test.mjs:7`, still required the workflow to contain `candidate_checkout_status`. That assertion encoded the unsafe direct-candidate checkout POST which PR #205 intentionally removed after the traced HTTP `308` canonical redirect.
- **Why this is a test-contract defect, not a bypass:** the corrected workflow has a new focused regression test that passed in the same run (`candidate preflight stays read-only while canonical smoke verifies the checkout lock`). The remaining older contract has not yet been updated to the same policy. No source gate is being ignored and PR #205 will not be merged while Website CI fails.
- **No public/runtime change:** this was a feature-branch test failure only. Canonical health remains separately proven old `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`; payments and Florida readiness remain fail-closed.
- **Next safe action:** update the stale workflow-contract test to prohibit a candidate checkout POST and require the canonical post-alias checkout-lock smoke, then rerun the complete source gates.
