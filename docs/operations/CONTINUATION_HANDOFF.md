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


### 2026-08-22T18:12:29.779Z — PR #205 opened event and immediate source-gate repair

- **Event:** Pull request [#205](https://github.com/jblan2026-hub/obserra-website/pull/205) is open. The opening source head was `abda3dc5b19d83f250122f30cffb8d94c4c654a2`; its initial Website CI failure is recorded separately above and was not merged or waived.
- **Corrective commit:** `20da5ea0541f8befec2c97e2d539e43ba908f7d9` updates `test/production-vercel-public-cutover-contract.test.mjs`. The contract now rejects candidate checkout state, candidate checkout route use, and candidate `POST` requests; it requires the canonical checkout route, intentional `307`, licensing-pending redirect/header, and alias-success ordering in the post-alias smoke.
- **Scope control:** no production workflow behavior was loosened. The candidate health/commerce/Florida preflight remains intact; the canonical locked-checkout smoke and rollback ordering remain required. No secrets, provider settings, payments, LMS readiness, aliases, or public pages were changed.
- **Fresh public evidence (2026-08-22T18:12:29.779Z):** canonical health continues to return verified old deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`; Academy commerce remains HTTP `503` / `operational: false`; Florida readiness remains HTTP `503` / `not_ready`. These facts do not satisfy live payment or LMS acceptance.
- **Next safe action:** require a new complete source-gate run for head `20da5ea0541f8befec2c97e2d539e43ba908f7d9`; if it passes, merge the PR and test the generated canonical candidate only through the guarded cutover and canonical public endpoint proof.


### 2026-08-22T18:13:27.259Z — PR #205 synchronize event

- **Event:** [PR #205](https://github.com/jblan2026-hub/obserra-website/pull/205) synchronized to corrective head `20da5ea0541f8befec2c97e2d539e43ba908f7d9`.
- **Current source-gate state:** CodeQL Advanced run `32590034776` and Production Authority Contract run `32590034779` succeeded. Website CI run `32590034777` is still in progress. The branch Vercel status is not production evidence and is not accepted as a live result.
- **Fresh canonical evidence (2026-08-22T18:13:27.259Z):** `https://www.obserrallc.com/api/health` still returns verified deployment `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / SHA `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`; it does not prove this PR's source is live.
- **Blocker:** Website CI must complete successfully; then a merge-created exact Vercel candidate must pass guarded alias cutover and the canonical host must prove the exact deployment/SHA. Payments and regulated LMS readiness remain separately fail-closed.
- **Next safe action:** inspect the completed Website CI result; if it fails, repair the concrete test/build failure. If it passes, merge PR #205 and continue only with canonical endpoint evidence.


### 2026-08-22T18:15:26.880Z — PR #201 closed/merged event

- **Event:** [PR #201](https://github.com/jblan2026-hub/obserra-website/pull/201) was closed as merged. The observed merged commit is `bff4fadffce4dd0313c5688cf08b2708e678dbba` (`Harden production commerce and prepare governed Azure cutover (#201)`).
- **Evidence boundary:** this merge is source-control evidence only. No deployment identifier for this commit and no canonical public SHA match have been observed, so no commerce, Azure, Entra, Intune, payment, or LMS-live claim is accepted from it.
- **Fresh canonical evidence (2026-08-22T18:15:26.880Z):** `/api/health` still exposes verified old `dpl_EepyEpkiRkhzbyrPKzY9EAFG72Fa` / `1d9ad1f042f527552d1e65763b0bc1f26ba0f829`; Academy commerce and Florida readiness remain fail-closed `503`.
- **Next safe action:** do not evaluate this merge independently; the later main merge below is the release target and must be proven as an exact canonical deployment.


### 2026-08-22T18:15:26.880Z — PR #205 closed/merged event

- **Event:** [PR #205](https://github.com/jblan2026-hub/obserra-website/pull/205) was closed as merged through SHA-protected merge commit `902bd58d00f83becf026e4b85b079a356d7428b7`.
- **Source gate evidence only:** its corrected head completed Website CI (`32590034777`), CodeQL Advanced (`32590034776`), and Production Authority Contract (`32590034779`) successfully. The earlier stale contract failure was repaired before merge; this does not establish runtime state.
- **Release-target decision:** `902bd58d00f83becf026e4b85b079a356d7428b7` is the newest observed merged main commit after #201 and is the only SHA that may be accepted for the next canonical candidate/cutover. The direct-host GET-only boundary and post-alias canonical checkout lock remain in that release path.
- **Blocker / next safe action:** wait for a READY canonical Vercel candidate for exact SHA `902bd58d00f83becf026e4b85b079a356d7428b7`, inspect the guarded cutover phase result, then require `https://www.obserrallc.com/api/health` to return that exact deployment and SHA. Until then, the canonical public site remains old and payments/LMS readiness remain not live.


### 2026-08-22T18:15:50.731Z — Audit correction: canonical cutover confirmed during prior probe

- **Correction to the immediately preceding merge-event entry:** its prepared sentence that canonical health was still the old deployment was stale by the time the fresh probe completed. That statement is superseded; the erroneous statement remains visible for audit.
- **Actual canonical public proof:** `https://www.obserrallc.com/api/health` at `2026-08-22T18:15:11.215Z` returned HTTP `200`, verified routing authority, deployment `dpl_jMgbmP4i4KacdJratNCsaMZJK6xu`, and exact SHA `902bd58d00f83becf026e4b85b079a356d7428b7`. This is the first public proof that the canonical host reached the merged PR #205 release target.
- **What this proves / does not prove:** canonical website cutover identity is confirmed. The same probe still showed Academy commerce `503` / `operational: false` and Florida readiness `503` / `not_ready`; it does not prove payments or regulated LMS operation live.
- **Audit impact:** no source, provider, alias, or customer action occurred during this documentation error; it was a stale-text assembly error only. The next record will contain fresh endpoint checks for marketplace, Applications, canonical checkout lock, Academy, and Florida.


### 2026-08-22T18:22:44Z — PR #206 opened event and fresh canonical evidence

- **Event:** Pull request [#206](https://github.com/jblan2026-hub/obserra-website/pull/206) opened: `Pin Azure deployment to the approved main SHA`.
- **Reported source scope:** immutable reviewed-SHA pinning for the Azure owner bootstrap and promotion checks. The PR body reports source-level test results; those claims are not accepted here as provider or live-runtime evidence. No Azure deployment, DNS, credential, payment, LMS, or customer-entitlement state is inferred from this event.
- **Fresh canonical identity:** at `2026-08-22T18:21:12.870Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, routing authority `verified`, deployment `dpl_jMgbmP4i4KacdJratNCsaMZJK6xu`, and exact release SHA `902bd58d00f83becf026e4b85b079a356d7428b7`. This confirms the canonical website cutover only.
- **Fresh public dependency evidence:** Applications commerce health returned HTTP `307` to Clerk sign-in rather than its public health contract; Academy commerce returned HTTP `503` with `operational: false`, unavailable payment provider, and unavailable durable storage; Florida liveness returned HTTP `200/live`; Florida readiness returned HTTP `503/not_ready` with `Retry-After: 60`. Payments, Applications commerce readiness, and regulated learner operation are not live.
- **Observed root cause for Applications health:** `lib/auth/provider-routing.ts` classifies the entire `/api/apps` prefix as Clerk-protected before the intended public GET health route can execute. The active narrow correction will exempt only exact GET/HEAD `/api/apps/commerce-health`; purchase, download, billing, license, access, and all other Applications API paths remain Clerk-protected.
- **Probe note:** a later page-header batch ended in a transient network disconnect before results were returned. It created no repository, deployment, or provider change; no conclusion is drawn from the unreturned requests.
- **Next safe action:** review PR #206 independently before any merge. Separately implement and test the exact read-only Applications commerce-health exception, add it to future cutover preflight, then require canonical public evidence from the resulting release.


### 2026-08-22T18:24:49Z — PR #206 merged; Applications fix rebased; replay event reconciled

- **Merged source:** PR [#206](https://github.com/jblan2026-hub/obserra-website/pull/206) merged as `0695f63d37836d759ad98c1102133169d2ded4b7` (`Pin Azure deployment to the approved main SHA`). This is source-control evidence only. No exact READY deployment or canonical public SHA match for that merge has been observed, so no Azure, payment, LMS, or public-site runtime result is attributed to it.
- **Active correction branch:** created `fix/public-applications-commerce-health-20260822` from the verified canonical release and fast-forwarded it to exact current main `0695f63d37836d759ad98c1102133169d2ded4b7` before any source change. This prevents the Applications fix from being based on stale main.
- **Canonical evidence boundary:** the latest fresh canonical health proof remains HTTP `200` at `2026-08-22T18:21:12.870Z` for `dpl_jMgbmP4i4KacdJratNCsaMZJK6xu` / `902bd58d00f83becf026e4b85b079a356d7428b7`; it does not prove #206 is live.
- **Replay reconciliation:** received an already-recorded PR #204 opened event with delivery `4f870940-9e53-11f1-8fff-93af88b11cf7`. Its original source and cutover trace are already preserved above; this replay adds no new source, deployment, alias, provider, or public-runtime fact.
- **Next safe action:** make the narrow read-only Applications commerce-health routing and contract correction on the rebased branch, then require source gates and canonical public deployment/SHA proof.


### 2026-08-22T18:33:20Z — PR #207 opened: real Applications commerce-boundary correction

- **Event / source:** Pull request [#207](https://github.com/jblan2026-hub/obserra-website/pull/207) opened with head `4a6518770db22b9f39d489d3c033e21463e7a903`, against main `0695f63d37836d759ad98c1102133169d2ded4b7`. GitHub reports 8 files changed (+117/−13). This is source evidence only and is not described as live.
- **Changed behavior under review:** only exact `GET`/ `HEAD /api/apps/commerce-health` is made public. All other Applications paths and all non-read methods—including checkout, billing, licensing, downloads, and entitlement operations—remain Clerk-protected. The route now emits a stable fail-closed commerce-health contract, and the governed Vercel cutover checks the same contract without widening direct-host access.
- **Fresh canonical identity:** at `2026-08-22T18:33:20.164Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, deployment `dpl_2Ev3WpnK9UJQCgEPw6AngBNrMsV1`, exact SHA `0695f63d37836d759ad98c1102133169d2ded4b7`, and verified canonical project authority. This proves the current website deployment identity only.
- **Fresh real failure evidence:** the initial response from `https://www.obserrallc.com/api/apps/commerce-health` was HTTP `307` with `Location: /sign-in?redirect_url=%2Fapi%2Fapps%2Fcommerce-health` and Clerk reason `session-token-and-uat-missing`; following the redirect reached a sign-in HTML page rather than an Applications commerce contract. The marketplace commerce boundary is therefore not live.
- **Fresh payment evidence:** `https://www.obserrallc.com/api/academy/commerce-health` returned HTTP `503` with `operational: false`, unavailable payment provider, and unavailable durable storage. Academy payment is not live.
- **Next safe action:** require PR #207 source gates, merge only after they pass, wait for the exact merge candidate, and then prove the canonical public Applications commerce URL returns its contract. If it is `503`, record the concrete provider/storage blocker; if it is `200`, require all operational fields before calling it live. No sales or LMS state is inferred from the PR.


### 2026-08-22T18:36:40Z — PR #207 merged and canonical Applications routing correction confirmed

- **Merged source:** Pull request [#207](https://github.com/jblan2026-hub/obserra-website/pull/207) merged as `d938b74e384f5e7584a6411d220be0516692434a`. Its five source gates—Production Authority Contract, Website CI, CodeQL Advanced, Application Release Validation, and Application Production Pipeline—completed successfully. Those gates are source evidence only.
- **Exact production deployment:** Vercel reports target-production deployment `dpl_7qjx4S922iuU6RGKU1RPWFYGKDV8` as `READY`, project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, commit `d938b74e384f5e7584a6411d220be0516692434a`.
- **Canonical public proof:** at `2026-08-22T18:36:40.047Z`, `https://www.obserrallc.com/api/health` returned HTTP `200` with deployment `dpl_7qjx4S922iuU6RGKU1RPWFYGKDV8`, the exact merged SHA, and verified routing/hosting authority. This confirms the fix is deployed to the canonical website.
- **Observed Applications result:** canonical `/api/apps/commerce-health` now returns its real public JSON contract rather than redirecting to sign-in. It is HTTP `503`, `operational: false`, `error: "durable-commerce-unavailable"`, and reports false for Stripe configuration, live mode, provider connection, charges, and identity readiness. The routing defect is fixed; Applications commerce is not live.
- **Other public dependencies:** Academy commerce remains HTTP `503` with unavailable provider/durable storage; Florida Class D readiness remains HTTP `503/not_ready` with `Retry-After: 60`. No payment, customer checkout, entitlement, or regulated learner operation is claimed live.
- **Runtime diagnostics:** Vercel reported no grouped runtime-error clusters for the two commerce health routes during the selected one-hour window. This does not prove dependency configuration; the public contracts above are the authority for current readiness.
- **Tooling note:** the initial attempt to load a non-existent umbrella Vercel skill path failed before any repository or provider action. The applicable deployment, runtime-verification, payment, authentication, routing, and environment-variable skill instructions were then loaded from their actual paths. No secret values were read, logged, or changed.
- **Next safe action:** trace the exact configuration keys required by the Applications durable-commerce and identity modules; inventory production bindings by key name only; upsert only verified non-secret constants if needed; then redeploy and re-probe this canonical endpoint. Provider credentials and durable storage will remain fail-closed until actually configured and proven.


### 2026-08-22T18:46:21Z — Applications durable-store traced; PR #208 audit-event reconciliation

- **PR #208 event:** Draft [PR #208](https://github.com/jblan2026-hub/obserra-website/pull/208) opened and synchronized at head `0b144f2318306335dc8b725c7a155b082ba8c917`. Its only source is a branch-scoped Vercel binding inventory. It is not merged, deployed, or a production-success claim.
- **Read-only inventory execution:** GitHub Actions run `32591651068`, job `97076328162`, completed successfully against the canonical Vercel project without changing a binding, deployment, alias, or secret. The workflow deliberately wrote its names-only result to the job summary. A follow-on attempt to copy production binding names/presence into GitHub logs was rejected before any GitHub write because that metadata would be exposed outside the approved secret boundary. No workaround was attempted.
- **Direct durable-store evidence:** Connected Supabase project `ykmrlcfitsubqajgfnye` (Obserra Applications Release Authority) is `ACTIVE_HEALTHY`. Its migrations include `applications_durable_commerce`; read-only call `public.obserra_applications_commerce_health()` returned `operational: true`, `eventLedger: "append-only"`, schema `applications-commerce-v1`, and `entitlementAuthority: "durable-subscription-snapshot-v1"`. This proves the intended durable commerce authority is healthy; it does not prove Vercel is bound to it.
- **Fresh canonical public proof:** at `2026-08-22T18:46:17.175Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, verified authority, deployment `dpl_7qjx4S922iuU6RGKU1RPWFYGKDV8`, and exact SHA `d938b74e384f5e7584a6411d220be0516692434a`.
- **Fresh product outcomes:** canonical Applications commerce remained HTTP `503` with `durable-commerce-unavailable`, Stripe false, and identity false; Academy commerce remained HTTP `503` / `operational: false`; Florida Class D readiness remained HTTP `503` / `not_ready` with `Retry-After: 60`. No marketplace checkout, Academy payment, or regulated learner operation is live.
- **Next safe action:** apply the known non-secret Applications production URL `https://ykmrlcfitsubqajgfnye.supabase.co` through a narrowly scoped one-shot Vercel convergence job, force a verified main deployment, and re-probe the canonical Applications contract. It will not create, print, copy, or guess service-role, Stripe, webhook, or Clerk credentials.


### 2026-08-22T18:54:02Z — PR #209 opened; Applications production URL convergence executed

- **Event / source:** Draft [PR #209](https://github.com/jblan2026-hub/obserra-website/pull/209) opened at head `7abe39486c0c2d25871ecdc23e9fa0d2082bee8c`. Its sole change is a branch-restricted, one-shot production configuration action. It does not change application source, enable a checkout, or alter Florida LMS controls.
- **Executed configuration action:** GitHub Actions run `32591946015` (**Ops Applications Storage URL Convergence**) completed successfully. It upserted only the known non-secret production Applications durable-store URL. The job discarded the provider response and did not read, print, copy, rotate, or invent a service-role key, Stripe key, webhook secret, or Clerk secret. This is configuration-execution evidence, not runtime acceptance.
- **Source-gate state:** CodeQL Advanced completed successfully; Website CI is still in progress. Source gates and the configuration job do not prove a deployment or public behavior.
- **Fresh canonical identity:** at `2026-08-22T18:53:48.999Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, verified Vercel/project routing authority, deployment `dpl_7qjx4S922iuU6RGKU1RPWFYGKDV8`, and SHA `d938b74e384f5e7584a6411d220be0516692434a`. This is the pre-merge canonical deployment; it cannot prove the newly written binding is used.
- **Fresh product results:** at `2026-08-22T18:53:54Z`, canonical Applications commerce remained HTTP `503` / `operational: false` with `durable-commerce-unavailable`, and all Stripe/provider/identity readiness values false. At `2026-08-22T18:54:00Z`, Academy commerce remained HTTP `503` / `operational: false`, with unavailable payment provider and durable storage. At `2026-08-22T18:54:02Z`, Florida readiness remained HTTP `503` / `not_ready` with `Retry-After: 60`. No marketplace checkout, Academy payment, or regulated learner operation is live.
- **Probe correction:** a generic browser fetch was rejected by its own safe-URL policy before reaching Obserra and produced no site result. The endpoint facts above were subsequently obtained through the authenticated Vercel URL verifier.
- **Next safe action:** wait for the PR’s required source gates, merge only the verified head, then require a new canonical deployment/SHA proof and re-probe Applications commerce. If durable storage then becomes available, isolate the next actual provider/identity blocker; do not bypass or fabricate credentials.



### 2026-08-22T18:55:55Z — PR #209 merged; exact production candidate building

- **Gate and merge:** PR [#209](https://github.com/jblan2026-hub/obserra-website/pull/209) was marked ready after Website CI, CodeQL Advanced, and its branch-restricted URL-convergence job completed successfully. It was merged through GitHub as verified main commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Production candidate:** Vercel created target-production deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` for the exact merge SHA. At observation it was `BUILDING`; this is not a canonical deployment claim and no runtime result is attributed to it.
- **Scope boundary:** this merge contains the narrow, one-shot configuration workflow only. It does not itself grant Stripe credentials, a service-role key, webhook evidence, customer access, Academy payment authorization, or Florida learner readiness.
- **Next safe action:** wait for this exact production candidate to become READY. Then prove canonical `/api/health` returns exactly its deployment/SHA and re-probe the Applications commerce contract before making any availability claim.


### 2026-08-22T18:57:29Z — PR #209 merged event; canonical deploy proved; URL-only repair did not restore Applications commerce

- **Event:** PR [#209](https://github.com/jblan2026-hub/obserra-website/pull/209) closed as merged. The merged main SHA is `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Exact canonical public proof:** at `2026-08-22T18:57:24.012Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, verified Vercel/project routing authority, deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U`, and the exact merge SHA. This proves the canonical site is serving the URL-convergence release.
- **Applications result after exact deployment:** at `2026-08-22T18:57:26Z`, canonical `/api/apps/commerce-health` remained HTTP `503`, `operational: false`, `eventLedger: "unavailable"`, `entitlementAuthority: "unavailable"`, and error `durable-commerce-unavailable`. The known public durable-store URL was insufficient by itself; commerce is not live.
- **Other live probes:** Academy commerce remained HTTP `503` / `operational: false` at `18:57:27Z`; Florida readiness remained HTTP `503` / `not_ready` at `18:57:29Z`. These remain fail-closed and are not called live.
- **Correction boundary:** no Stripe, service-role, webhook, identity, customer, or regulated-LMS configuration was invented or changed in response to the unchanged result.
- **Next safe action:** inspect runtime logs for this exact deployment and trace the Applications health route’s external-configuration validation. Make the next change only after determining the concrete missing/misconfigured boundary, then repeat exact canonical proof.

### 2026-08-22T19:05:32.626Z — Canonical storefront and Applications runtime reconciliation

- **Trigger context:** this entry follows the merged PR #209 production release and subsequent public verification. Stale/replayed PR-webhook deliveries observed afterward did not alter source or deployment state in this action.
- **Canonical release proof:** `GET https://www.obserrallc.com/api/health` returned HTTP 200 at 2026-08-22T19:01:26.200Z with verified Vercel routing for deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` and commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Public Applications result:** `GET https://www.obserrallc.com/api/apps/commerce-health` returned HTTP 503 at 2026-08-22T19:01:31Z, contract `applications-commerce-health-v1`, `error: durable-commerce-unavailable`. Applications checkout, payment, entitlement, and downloadable fulfillment are **not live**.
- **Source evidence on the canonical SHA:** `lib/applications-commerce.ts` validates the fixed Applications project URL and requires a syntactically valid `OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY` before it can issue its Supabase RPC health request. The deployed non-secret URL is therefore insufficient by itself. This configuration branch intentionally returns fail-closed and emits no runtime error log; a targeted Vercel runtime-log query found no matching request-failure lines.
- **Public storefront evidence:** `/apps` and its permanent `/marketplace` alias served the canonical deployment and state that no product is a live self-service launch or purchase path. `/store` and `/catalog` contain purchase/checkout copy, but this does not prove a working purchase because the production commerce health route is 503. No product/payment claim is being made.
- **Visual-test tooling result:** the local Chromium runner is unavailable in this session and the generic web renderer rejected the canonical URL as unsafe before fetch. Neither result is a website failure and neither was substituted for a visual-passage claim. The authenticated canonical fetch confirmed the rendered HTML and exact deployment only.
- **No secret operation occurred:** no credentials were read, printed, copied, rotated, invented, or written; no private skill/package content was accessed for publication.
- **Next safe action:** provision the real, project-scoped Applications service-role credential through the approved deployment-secret path (without disclosure), redeploy, then require canonical `/api/apps/commerce-health` HTTP 200 with all storage/provider/identity checks true before enabling or claiming checkout, entitlement, or downloads. In parallel, align storefront purchase copy with that measured state.

## 2026-08-22T19:11:58.481Z — Production commerce credential convergence stopped before mutation

- Trigger context: continued production repair after the canonical Applications commerce health endpoint remained unavailable.
- Evidence: the attempted guarded workflow write was rejected before creation because it would transfer a production server credential between authorized providers.
- Result: no workflow file was created, no credential was read or disclosed, no provider configuration changed, and no deployment was initiated.
- Current public state remains unproven for commerce: `https://www.obserrallc.com/api/apps/commerce-health` was last observed as HTTP 503 on canonical deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- Blocker: a valid project-scoped Applications server credential must be set in the Vercel production environment, or an explicit authorization must permit its one-way transfer from the approved GitHub secret store to that Vercel project.
- Next safe action: after the credential is set or the exact transfer is authorized, redeploy from `main` and re-run the canonical health endpoint before enabling or claiming checkout, purchase, download, or entitlement functionality.

## 2026-08-22T19:12:28.688Z — Canonical post-stop commerce probe

- Public endpoint: `GET https://www.obserrallc.com/api/apps/commerce-health`.
- Result: HTTP 503; `operational:false`, `eventLedger:"unavailable"`, `entitlementAuthority:"unavailable"`, `stripeConfigured:false`, `providerConnected:false`, `chargesEnabled:false`, `identityReady:false`, error `durable-commerce-unavailable`.
- Interpretation: no public evidence supports live Applications checkout, purchase, download, entitlement, or payment claims.
- Next safe action remains: set the validated project-scoped Applications server credential in the Vercel production environment, or explicitly authorize its one-way transfer from the approved secret store; then redeploy and repeat this canonical probe.

## 2026-08-22T19:12:55.395Z — Canonical routing identity reconfirmed

- `GET https://www.obserrallc.com/api/health` returned HTTP 200 at `2026-08-22T19:12:46.431Z`.
- Canonical endpoint reported verified Vercel authority for project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U`, commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- This proves the public site routing target only; it does not change the immediately preceding canonical commerce HTTP 503 result.


## 2026-08-22T19:22:29.196Z — PR #205 synchronization; first-party CI/CD release path reviewed

- GitHub event recorded: pull request #205 synchronized (unmerged event payload).
- Changed work: reviewed the applicable first-party DevSecOps/CI-CD baseline and the repository's existing Azure production workflow. The existing workflow is source-controlled, manually dispatched, release-SHA bound, gates a staging deployment on health and commerce checks, and includes a failed-gate rollback path.
- Security boundary: no credential was copied, exposed, or transferred; no Azure or Vercel deployment was triggered during this update.
- Public endpoint: `GET https://www.obserrallc.com/api/health` returned HTTP 200 at `2026-08-22T19:22:29.196Z`, with verified Vercel authority for project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U`, commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- Public endpoint: `GET https://www.obserrallc.com/api/apps/commerce-health` returned HTTP 503 at `2026-08-22T19:22:27Z`; it reported `operational:false`, unavailable event ledger and entitlement authority, `stripeConfigured:false`, `providerConnected:false`, `chargesEnabled:false`, and `identityReady:false`.
- Blocker: the canonical public runtime still does not prove a functioning Applications commerce release. The available GitHub connector cannot enumerate the manually-dispatched Azure workflow runs, and no Azure management connector is available in this session; no unsupported deployment claim is made.
- Next safe action: use the existing Azure staging workflow with the exact intended release SHA only after its approved Key Vault/runtime configuration is available, then require its own health and commerce gates before any production cutover or live-commerce claim.


## 2026-08-22T19:24:33.502Z — PR #205 changed-work evidence reconciled

- Pull request: [#205](https://github.com/jblan2026-hub/obserra-website/pull/205) `fix(release): keep candidate preflight read-only` is merged; merge commit `902bd58d00f83becf026e4b85b079a356d7428b7`.
- Changed files: `.github/workflows/production-vercel-public-cutover.yml`, `test/production-vercel-public-cutover-contract.test.mjs`, and `test/vercel-canonical-deployment-preflight.test.mjs`.
- Verified source change: candidate deployment preflight no longer sends a checkout `POST`; it keeps direct candidate validation read-only. The canonical checkout-lock smoke remains ordered after successful alias assignment, and the two regression tests enforce that ordering and non-transactional candidate behavior.
- Scope boundary: this PR does not activate payments, bypass licensing, move aliases, alter secrets, or make Applications commerce operational.
- Workspace verification: the current execution environment has neither the Azure CLI nor GitHub CLI installed. The authorized GitHub connector exposes no workflow-dispatch action, and no Azure management connector is available here. Therefore no Azure staging or production run was initiated.
- Current public evidence remains: canonical health proves Vercel deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / commit `6c2cddd84503c7cb0af3ca976fd8308183379146`; Applications commerce remains HTTP 503 as recorded above.
- Next safe action: dispatch the existing SHA-bound Azure staging workflow through an authorized Azure/GitHub control plane only after its Key Vault-backed runtime configuration is confirmed; require its staged health and commerce gates before cutover.


## 2026-08-22T19:28:21.204Z — Applications authority backend verified; runtime binding isolated

- Authorized read-only Supabase management evidence: project `ykmrlcfitsubqajgfnye` (Applications Release Authority) is `ACTIVE_HEALTHY`.
- Schema-only inspection confirmed dedicated commerce and release-authority tables, including checkout, customer, payment-event, subscription, append-only ledger, promotion, rollback, and staged-package tables. No customer records were read.
- Direct execution of the public commerce-health database routine returned `operational:true`, `eventLedger:"append-only"`, and `entitlementAuthority:"durable-subscription-snapshot-v1"`; its reported counters were zero. This proves the durable Applications backend is present and responding.
- Source evidence: current `lib/applications-commerce.ts` requires a valid server-side Applications Supabase credential before calling that routine. The canonical public endpoint continues to return HTTP 503, so the failure is isolated to the website runtime binding/release path rather than a missing commerce schema.
- CI/CD and identity/automation packages in the uploaded workspace were inspected. They provide release-control instructions and metadata, not an executable Azure control-plane bridge or deploy credential.
- Execution-environment evidence: `az`, `gh`, and `pwsh` are not installed; no Azure management connector or GitHub workflow-dispatch action is exposed. No secret was read, copied, or transferred; no deployment was triggered.
- Next safe action: use an authorized Azure or GitHub Actions control-plane session to dispatch the existing exact-SHA Azure staging workflow after its Key Vault-backed runtime binding is confirmed, then require its public health and commerce gates before production cutover.


## 2026-08-22T19:29:25.385Z — Current Vercel runtime log evidence

- Vercel runtime logs for canonical deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / branch `main` show repeated HTTP 503 responses from `GET /api/apps/commerce-health` between `2026-08-22T18:56Z` and `2026-08-22T19:22Z`.
- The same deployment recorded HTTP 503 from `GET /api/academy/commerce-health` and `GET /api/florida-class-d/health/ready` during that interval.
- This is direct runtime evidence that the canonical production deployment is not operational for Applications commerce, Academy commerce, or Florida Class D readiness. It does not expose or alter any configuration values.
- The direct Applications authority database health result above remains operational, so no database migration or data repair was applied.
- Next safe action remains: bind the required production runtime configuration through the approved Key Vault/Azure staging path, verify all three public health contracts on the staged exact SHA, then promote only if those gates pass.

## 2026-08-22T19:33:08Z — Canonical runtime and rendered-site reconciliation

- **Exact canonical identity:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-22T19:32:56.693Z`, with verified Vercel/project routing for deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` and commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Canonical operational results:** Applications commerce returned HTTP `503` at `19:33:02Z` with `operational:false` and `durable-commerce-unavailable`; Academy commerce returned HTTP `503` / `operational:false` at `19:33:06Z`; Florida Class D readiness returned HTTP `503` / `not_ready` at `19:33:08Z`. None is a live commerce or regulated-LMS result.
- **Rendered public-site check:** the canonical `/`, `/apps`, `/marketplace`, and `/store` routes each returned HTTP `200` with server-rendered content from this same deployment. This verifies a nonempty server response, not client-browser visual acceptance. A local browser runner was unavailable in this session, so no unsupported client-rendering claim was made.
- **Runtime diagnostics:** Vercel's grouped runtime-error query returned no unhandled runtime-error cluster for the selected routes/time range. The observed HTTP `503` responses are controlled fail-closed contracts, not proof of healthy commerce.
- **Binding evidence:** the prior one-shot production repair upserted only the verified non-secret durable-store URL. Current source requires a valid server-side Applications credential before it can call the healthy authority database; the canonical 503 therefore still proves the runtime binding is absent, invalid, or otherwise unusable. No credential, customer record, provider setting, or deployment was read, copied, written, or changed in this action.
- **Execution boundary:** the available Vercel connection can inspect deployments and public responses but exposes no production-environment mutation action. The available GitHub connection exposes no workflow-dispatch action; no Azure management connection or local Vercel/Azure/GitHub CLI credential is available in this runtime.
- **Next safe action:** use the existing exact-SHA, Key-Vault-backed Azure staging release path through an authorized control-plane session; require its staging health, Applications commerce, Academy commerce, and Florida readiness gates before a production cutover or any claim that checkout, entitlement, payments, downloads, Academy enrollment, or regulated learner operation is live.

## 2026-08-22T19:34:00Z — First-party baseline correction: do not treat Azure as an immediate production substitute

- **First-party baseline evidence reviewed:** the uploaded production baseline records that the Azure production workflow has not yet completed an exact-SHA staging deployment and that its required runtime/application contract has not been fully proven. It therefore cannot safely replace the current canonical Vercel site or receive a DNS cutover.
- **Current authority remains Vercel:** canonical `www.obserrallc.com` is proven on deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / commit `6c2cddd84503c7cb0af3ca976fd8308183379146`; the nonempty public site is served there, while commerce and LMS contracts remain fail-closed.
- **Corrected remediation order:** restore the valid current Vercel production runtime binding through an authorized secret-management/control-plane path, redeploy the exact approved main release, and require canonical commerce, Academy, and Florida readiness evidence. Azure remains a separately staged and fully gated future path, not a workaround for missing Vercel configuration.
- **Security boundary:** no private-library contents, secret values, customer data, cloud configuration, or DNS were exposed or changed while reviewing the baseline.
- **Next safe action:** obtain the authorized production configuration action that can set or validate the required Vercel runtime secret binding without disclosure. Then redeploy and repeat the canonical probes; do not enable or claim payment, entitlement, download, Academy enrollment, or regulated learner operation until those exact public contracts pass.


## 2026-08-22T19:54:03.380Z — PR #208 synchronization: canonical binding audit and live gate

- **Changed work:** PR #208 head `e49f4264909d3ea9420b1edd749de244c158f866` updates only `.github/workflows/ops-runtime-binding-inventory.yml`. It replaces a retired read-only Vercel endpoint with the current shared-environment inventory API and emits category-only production-binding diagnostics. No credential value, customer data, deployment, domain mapping, or production runtime setting was changed.
- **CI evidence:** [Ops Runtime Binding Inventory run 32595010535](https://github.com/jblan2026-hub/obserra-website/actions/runs/32595010535) completed `failure`. Its Vercel shared-environment metadata check found `0` linked, `0` existing-but-unlinked, and `7` absent-or-not-production-scoped required Applications aliases. Its project-binding check found eight missing production categories: Applications durable-store authority, commerce-integrity secret, payment-provider secret/webhook/catalog; and Academy payment-provider secret/webhook and durable-store authority.
- **Canonical deployment proof:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-22T19:53:35.862Z`, verified Vercel deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` and commit `6c2cddd84503c7cb0af3ca976fd8308183379146`. This proves web liveness and exact canonical routing only.
- **Canonical operational results:** At the same probe, Applications commerce returned HTTP `503` / `durable-commerce-unavailable`; Academy commerce returned HTTP `503` / `operational:false` and `durableStorage:"unavailable"`; Florida Class D readiness returned HTTP `503` / `not_ready`. Therefore commerce and LMS are not live.
- **Blocker:** The canonical Vercel project is missing the confirmed production runtime binding categories, and the corresponding Applications shared-environment aliases are not available as production-scoped project bindings. This is a configuration/authority blocker, not a website-shell or database-schema claim.
- **Next safe action:** An authorized owner must create or attach the confirmed sensitive values directly in Vercel’s canonical project settings from the approved secret-management source, scoped to Production (and a separately controlled preview/staging target for validation). Do not put values in a pull request, repository file, or GitHub workflow log. Then rerun this inventory; only after it passes should a preview deployment, exact-SHA production redeploy, and the three canonical 200 health gates be attempted.


## 2026-08-22T20:11:39Z — Production runtime binding repair blocked before mutation

- **Trigger context:** continued the canonical production repair after PR #208’s binding inventory identified missing production runtime categories. No source, deployment, alias, provider, or regulated-LMS setting was changed in this action.
- **Fresh canonical proof:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-22T20:11:28.079Z`, verified Vercel/project routing for project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U`, and commit `6c2cddd84503c7cb0af3ca976fd8308183379146`. This proves the canonical website routing target only.
- **Fresh public operational results:** Applications commerce returned HTTP `503` at `2026-08-22T20:11:25Z` with `operational:false` and `durable-commerce-unavailable`; Academy commerce returned HTTP `503` at `2026-08-22T20:11:23Z` with `operational:false`, payment provider unavailable, and durable storage unavailable; Florida Class D readiness returned HTTP `503` at `2026-08-22T20:11:30Z` with `status:"not_ready"`. Commerce, Academy enrollment, and regulated learner operation are not live.
- **Controlled repair result:** a reviewed, main-only workflow was prepared to use the existing Azure OIDC/Key Vault release path to set the eight confirmed sensitive production runtime categories only on the exact canonical Vercel project, redeploy the exact main release, and require public endpoint proof. The security control rejected the workflow before it was committed because it would transfer production credentials from Key Vault to Vercel.
- **No mutation occurred:** no workflow file or pull request was created from that repair path; no credential value was read, printed, copied, committed, or exported; no Vercel environment value, deployment, domain, DNS record, payment setting, customer record, or LMS setting changed.
- **Blocker:** explicit authorization is required for the scoped, one-way Key Vault-to-Vercel credential transfer to canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`. This control is not bypassed.
- **Next safe action:** after explicit authorization, run the reviewed normal PR/merge workflow; retain all values as sensitive, never log them, redeploy the exact `main` SHA, then require canonical Applications and Academy commerce health HTTP `200` / `operational:true` and separately preserve Florida readiness gating. Alternatively, an authorized owner can set the same eight production bindings directly in the canonical Vercel project and request the same public re-probe.


## 2026-08-22T20:22:18.368Z — Canonical render transport confirmed; binding repair still blocked before commit

- **Canonical route proof:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-22T20:22:18.368Z`, with verified routing for Vercel project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U`, and commit `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Public document/asset evidence:** canonical `/`, `/apps`, `/marketplace`, and `/store` each returned HTTP `200` with nonempty server-rendered HTML tagged with that deployment. The primary Next CSS chunk, startup JavaScript chunk, and branded logo image also returned HTTP `200`. This establishes an edge-delivered document and assets, not a browser visual-acceptance claim.
- **Fresh operational evidence:** Applications commerce returned HTTP `503`, `operational:false`, and `durable-commerce-unavailable`; Academy commerce returned HTTP `503`, `operational:false`, payment provider unavailable, and durable storage unavailable; Florida Class D readiness returned HTTP `503`, `status:"not_ready"`. None of those functions is live.
- **Controlled repair result:** a second attempt to create the reviewed, normal-PR workflow for the scoped Key Vault-to-Vercel runtime-binding transfer was rejected by the security control before a repository file, pull request, or deployment was created. The control continued to require an explicit authorization naming the credential payload and destination.
- **No mutation occurred:** no secret value was read, displayed, committed, copied, exported, or sent; no Vercel environment value, deployment, routing alias, payment configuration, customer record, Academy setting, or LMS setting changed.
- **Blocker and next safe action:** obtain explicit authorization for a one-way transfer of the eight existing production Key Vault values to sensitive Production variables only in canonical Vercel project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, with no logging or repository storage. Then use the reviewed PR/merge workflow, redeploy the exact `main` SHA, and require the canonical public contracts to pass before any commerce or LMS live claim.


## 2026-08-22T21:36:27.175Z — PR #210 merged runtime repair; canonical proof pending

- **GitHub event:** PR [#210](https://github.com/jblan2026-hub/obserra-website/pull/210) closed as merged. The verified GitHub merge commit is `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`.
- **Changed work:** the merged change adds governed Vercel production runtime identity/bootstrap code and a guarded release workflow, and corrects modern Applications service-key request authentication. It does not place provider credentials in source control.
- **Source checks:** the applicable pull-request source workflows completed successfully before merge (Website CI, Application Production Pipeline, CodeQL Advanced, Florida Class D LMS Gates, Academy production gate, Applications private-boundary gate, and Application Release Validation). These are source results only.
- **Verified-commit control:** Vercel canceled the unverified branch preview before build. The project Verified Commits policy was preserved; the GitHub-signed merge is verified.
- **Production deployment record:** Vercel reports `dpl_3TKmo9VZGoqVTr1RfeFdzbXzcgoy` as `READY`, target `production`, for exact main SHA `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`. Its deployment URL health contract returned HTTP `200` with that exact deployment ID/SHA and verified routing authority. This is not canonical-domain proof.
- **Fresh canonical identity:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-22T21:36:27.175Z`, but still reported prior deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / SHA `6c2cddd84503c7cb0af3ca976fd8308183379146`.
- **Fresh canonical operational results:** Applications commerce remained HTTP `503` / `operational:false` (`durable-commerce-unavailable`); Academy commerce remained HTTP `503` / `operational:false`, with provider and durable storage unavailable.
- **Blocker:** canonical routing has not yet proved the merged SHA, and neither canonical commerce contract is operational. No payment, entitlement, Academy enrollment, or regulated LMS operation is claimed live.
- **Next safe action:** complete/observe the guarded post-merge bootstrap, then re-probe canonical identity and both commerce contracts. Treat the repair as live only if the canonical domain reports exact deployment/SHA and both commerce contracts independently return HTTP `200` with `operational:true`.

## 2026-08-22T21:36:27.175Z — PR #65 synchronization

- **GitHub event:** Dependabot synchronized open PR [#65](https://github.com/jblan2026-hub/obserra-website/pull/65), `chore(connections): bump eslint from 9.39.5 to 10.8.1`.
- **Source state:** head `2ee096ccd372d36b91dfa828120b162d2ee25030`, base `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`; 2 files changed (+219/−420); unmerged and mergeable at inspection.
- **Production evidence:** no production deployment, canonical endpoint, credential, payment, or LMS setting was changed by this event.
- **Next safe action:** keep PR #65 isolated from the active production-runtime repair; evaluate it through normal dependency and release gates before any merge.


## 2026-08-22T21:39:28Z — PR #66/#67 synchronization; canonical cutover remains fail-closed

- **GitHub events:** Dependabot synchronized open PR [#66](https://github.com/jblan2026-hub/obserra-website/pull/66), `chore(connections): bump lucide-react from 0.543.0 to 1.33.0`, and open PR [#67](https://github.com/jblan2026-hub/obserra-website/pull/67), `chore(connections): bump framer-motion from 12.43.0 to 13.1.0`.
- **Source state:** #66 head `f8de4da45ee4a6c80a75d10518b93d25e3321457` (2 files, +5/−5) and #67 head `730317117101dd1980b7b554173708e910b3cb74` (2 files, +14/−18) are both unmerged against base `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`. Neither event changed production routing, runtime configuration, payments, or LMS state.
- **Release-control evidence:** rerun attempt 2 of canonical cutover workflow [32599875004](https://github.com/jblan2026-hub/obserra-website/actions/runs/32599875004), job `97097249698`, accepted the configured release credential and found production candidate `dpl_3TKmo9VZGoqVTr1RfeFdzbXzcgoy` for exact SHA `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`, then failed at **Preflight exact canonical deployment health**. All alias/domain-mutation and rollback steps were skipped.
- **Canonical status:** the latest recorded canonical proof remains the prior deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / SHA `6c2cddd84503c7cb0af3ca976fd8308183379146`; no canonical cutover or commerce/LMS live result is claimed.
- **Next safe action:** isolate the dependency PRs from the incident. Correct the failing preflight assertion with non-secret condition-level diagnostics, retain verified-commit and fail-closed controls, then rerun the guarded cutover and require canonical exact deployment/SHA plus independent operational commerce/readiness contracts.


## 2026-08-22T22:01:20Z — PR #211 opened: guarded Academy preflight contract repair

- **GitHub event:** PR [#211](https://github.com/jblan2026-hub/obserra-website/pull/211), `fix(cutover): preserve Academy identity contract through hydration failure`, opened at head `bb49987e759118ee1b4c5cdb50a144826337a202` against main `78bb0c25a8857ac6c8f851dd1d4c01b34aa3baab`.
- **Changed work:** the Academy commerce-health route now retains its non-secret identity readiness fields when governed runtime-secret hydration fails, and a regression test covers that fail-closed response. The exact project/SHA/routing checks and the cutover jq gate are not weakened.
- **Source evidence:** focused route tests (17/17), typecheck, diff check, and Academy Gate 35 completed successfully in the repair workspace; Gate 35 reports no production transaction action. These are source checks only.
- **Branch deployment evidence:** the canonical Vercel project's PR deployment status is currently failure for this unmerged branch. That does not change canonical routing or establish a production deployment.
- **Canonical status:** the last direct public probe remains deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / SHA `6c2cddd84503c7cb0af3ca976fd8308183379146`; Applications and Academy commerce and Florida readiness remain fail-closed.
- **Next safe action:** complete applicable PR gates and merge only through the verified-commit path. Then observe the new production candidate and rerun the guarded cutover; no canonical, payment, entitlement, or LMS live claim is permitted without exact public canonical proof.


## 2026-08-22T22:37:33Z — PR #211/#213 merged; corrected canonical cutover candidate ready

- **Merged work:** PR [#211](https://github.com/jblan2026-hub/obserra-website/pull/211) merged as verified commit `e17eb1c76af985aea9a61b5c310e3318da0c7584`, preserving Academy identity evidence during governed-runtime hydration failure. PR [#213](https://github.com/jblan2026-hub/obserra-website/pull/213) then merged as verified commit `7914f426cdc29ebae158e958c66d0d0e50653e41`, replacing the immediate post-alias smoke with bounded verification of both canonical aliases, capture/conditional restoration of prior ownership, and verified rollback aliases. Superseded PR #212 was closed unmerged.
- **Exact production candidate:** Vercel deployment `dpl_hDcmAJhRsoy7NK5stkxwfN4XtpiZ` is `READY`, target `production`, bound to exact verified SHA `7914f426cdc29ebae158e958c66d0d0e50653e41`. Its direct `/api/health` endpoint returned HTTP `200` with the same deployment/SHA and verified routing authority.
- **Canonical public result:** `https://www.obserrallc.com/api/health` still returned HTTP `200` from prior deployment `dpl_3u2DG49g2Ev3s2tV4rHy98gWdu7U` / SHA `6c2cddd84503c7cb0af3ca976fd8308183379146` at the recorded probe. No canonical cutover or live claim is made.
- **Operational result:** Canonical Applications commerce remained HTTP `503` / `durable-commerce-unavailable`; Academy commerce remained HTTP `503` / `operational:false` with durable storage unavailable; Florida Class D readiness remained HTTP `503` / `not_ready`. Payment, Academy enrollment, and regulated LMS operations remain fail-closed.
- **Next safe action:** let the merged guarded cutover operate against `dpl_hDcmAJhRsoy7NK5stkxwfN4XtpiZ`; accept only canonical health proof of exact deployment/SHA. In parallel, repair the independently failing production commerce and LMS runtime dependencies through approved secret-management/control-plane paths; do not enable them on source or CI evidence alone.

### 2026-08-22 19:26 EDT — PR #214 merged; guarded canonical cutover completed and exact public identity proved

- **Event/change:** PR [#214](https://github.com/jblan2026-hub/obserra-website/pull/214) opened at head `899c71d5fc2574e59b9225dfc593cb3dbecd2978` and merged into `main` as verified commit `507d8ef8f0b3ad65c02ad7514586e1786a93523b`. The checkout path now evaluates the validated Academy sales-license lock before production secret hydration; licensed paths retain the existing payment, identity, storage, webhook, and Stripe controls. The canonical smoke reports separate safe failures for status, redirect, and license-header assertions.
- **Validation evidence:** 31/31 focused payment/cutover/authority tests and 20/20 adjacent Academy lock/course tests passed; workflow YAML parsed; all 11 workflow shell blocks passed `bash -n`; diff check passed.
- **Exact deployment:** Vercel deployment `dpl_Abw5pJ8nSmpQeXcr6FQHVjihn7QM` reached `READY`, target `production`, for exact verified SHA `507d8ef8f0b3ad65c02ad7514586e1786a93523b`.
- **Cutover evidence:** GitHub Actions run [32605003294](https://github.com/jblan2026-hub/obserra-website/actions/runs/32605003294), job `97108682555`, completed successfully. Exact-candidate wait, candidate preflight, rollback capture, domain move, alias assignment, canonical smoke, duplicate-project quarantine, and final fail-closed enforcement all passed; rollback was skipped because the cutover succeeded.
- **Canonical public proof:** At `2026-08-22T23:26:16Z`, `https://www.obserrallc.com/api/health` returned HTTP `200`, deployment `dpl_Abw5pJ8nSmpQeXcr6FQHVjihn7QM`, SHA `507d8ef8f0b3ad65c02ad7514586e1786a93523b`, canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. `https://www.obserrallc.com/` returned HTTP `200` and its rendered document identified the same deployment.
- **Operational blockers:** Applications commerce remains HTTP `503` with contract `applications-commerce-health-v1`, `operational:false`, and `durable-commerce-unavailable`. Academy commerce remains HTTP `503`, `operational:false`, with live identity available but payment provider and durable storage unavailable. Florida Class D readiness remains HTTP `503` / `not_ready`. Those capabilities remain fail-closed and are not claimed operational.
- **Next safe action:** preserve the proven canonical deployment while repairing the production runtime-binding workflow from its exact sanitized failure evidence; bind the approved external identity, commerce, storage, and regulated-LMS dependencies without placing values in GitHub, then redeploy and require canonical HTTP `200` operational contracts before enabling payments or LMS operations.

## 2026-08-23T00:19:04Z — PR #215 opened: governed Azure OIDC runtime bootstrap repair

- **GitHub event:** PR [#215](https://github.com/jblan2026-hub/obserra-website/pull/215), `fix(runtime): restore governed Azure OIDC bootstrap`, opened at head `12c33477fe86bd286c4dc0a7c7da8b5db433465a` against main `507d8ef8f0b3ad65c02ad7514586e1786a93523b`; it is open, mergeable, and changes only `.github/workflows/enable-vercel-key-vault-runtime.yml` and `test/vercel-key-vault-runtime-bootstrap.test.mjs` (+14/−2).
- **Changed work:** the workflow continues to prefer repository-managed Azure OIDC identifiers and adds fallback only to the exact non-secret deploy identity and resource-tenant identifiers already recorded in the production architecture. Existing subscription, tenant, RBAC, Key Vault, canonical Vercel project, workload-federation, secret-nondisclosure, and exact-public-release checks remain in place; the test rejects use of the separate workforce tenant.
- **Source evidence:** 10/10 focused Azure/runtime tests passed; workflow YAML parsed successfully; `git diff --check` passed. These checks do not establish a deployment or operational commerce/LMS.
- **Branch deployment evidence:** Vercel canceled the unmerged branch deployment. No production deployment or canonical routing change is attributed to this PR event.
- **Fresh canonical proof:** At `2026-08-23T00:19:04.570Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and still proved canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_Abw5pJ8nSmpQeXcr6FQHVjihn7QM`, exact SHA `507d8ef8f0b3ad65c02ad7514586e1786a93523b`, and verified hosting/routing authority.
- **Fresh operational results:** Applications commerce returned HTTP `503`, `operational:false`, `durable-commerce-unavailable`, and identity not ready. Academy commerce returned HTTP `503`, `operational:false`, with live identity available but payment provider and durable storage unavailable. Florida Class D readiness returned HTTP `503` / `not_ready`. Payment, entitlement, Academy enrollment, and regulated LMS operation are not live.
- **Blocker:** PR #215 has not been merged and its post-merge Azure/Vercel bootstrap has not run. The prior bootstrap failure occurred at Azure login before any Key Vault or Vercel mutation because the required client and tenant identifiers resolved empty.
- **Next safe action:** merge PR #215 only through the verified main path; inspect the resulting Azure authentication, runtime binding, exact deployment, and canonical proof stages. Preserve the current canonical deployment and keep all commerce/LMS capabilities fail-closed unless the exact post-merge deployment is proven on the canonical endpoint and the independent operational contracts return HTTP `200` / `operational:true`.


## 2026-08-23T00:19:43Z — PR #216 opened; duplicate repair consolidated

- **GitHub event:** PR [#216](https://github.com/jblan2026-hub/obserra-website/pull/216), `fix(runtime): recover Azure identity metadata for Key Vault bootstrap`, opened at head `7b9c1d7d1a1ddb5de8b833d116bf1b5d8ded00fe` against main `507d8ef8f0b3ad65c02ad7514586e1786a93523b`; it is open and mergeable and changes only `.github/workflows/enable-vercel-key-vault-runtime.yml` and `test/vercel-key-vault-runtime-bootstrap.test.mjs` (+14/−2).
- **Changed work:** the workflow keeps repository-managed Azure OIDC identifiers as the preferred source and adds fallback only to the exact non-secret deployment-identity and resource-tenant metadata already recorded in the repository architecture. Existing subscription, tenant, RBAC, Key Vault, canonical Vercel project, workload-federation, secret-nondisclosure, exact-deployment, and canonical-public proof gates remain in force. The regression test rejects the separate workforce tenant.
- **Source evidence:** 10/10 focused Azure/runtime tests passed, project typecheck passed, workflow YAML parsed, and `git diff --check` passed. The unmerged Vercel branch deployment was canceled; no production deployment or canonical routing change is attributed to this event.
- **Duplicate control:** PR [#215](https://github.com/jblan2026-hub/obserra-website/pull/215) contained the same two-file patch and was closed unmerged so only one repair can enter the production workflow.
- **Latest canonical proof:** the latest direct proof remains `GET https://www.obserrallc.com/api/health` HTTP `200` at `2026-08-23T00:19:04.570Z`, reporting canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_Abw5pJ8nSmpQeXcr6FQHVjihn7QM`, exact SHA `507d8ef8f0b3ad65c02ad7514586e1786a93523b`, and verified hosting/routing authority.
- **Operational results:** Applications commerce remains HTTP `503` / `operational:false` / `durable-commerce-unavailable`; Academy commerce remains HTTP `503` / `operational:false` with payment provider and durable storage unavailable; Florida Class D readiness remains HTTP `503` / `not_ready`. Payments, enrollment, and regulated LMS operation are not live.
- **Blocker:** PR #216 is not yet merged and the governed post-merge bootstrap has not rerun. The preceding bootstrap stopped at Azure login before any Key Vault or Vercel mutation because its client and tenant metadata resolved empty.
- **Next safe action:** merge only PR #216 through the verified main path, then require Azure authentication, governed runtime binding, exact production deployment identity, and canonical public operational proofs to pass. Preserve the currently proven canonical deployment and keep commerce/LMS fail-closed on any failed gate.


## 2026-08-23T00:44:13Z — PR #215 closed unmerged; PR #216 deployed, runtime bootstrap blocked at immutable OIDC trust

- **GitHub event:** PR [#215](https://github.com/jblan2026-hub/obserra-website/pull/215) closed unmerged. It was the superseded duplicate of the runtime-identity metadata repair; no deployment or canonical routing change is attributed to its closure.
- **Merged repair:** PR [#216](https://github.com/jblan2026-hub/obserra-website/pull/216) merged as verified commit `eb6c94596e8dd7a5c1282ac2aeffcab75f09aace`.
- **Exact production deployment:** Vercel deployment `dpl_Ff5fuy3VwGkKDVKHepesztgMqwEZ` is `READY`, target `production`, and tied to that exact verified SHA.
- **Canonical public proof:** At `2026-08-23T00:44:11.750Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and reported canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, deployment `dpl_Ff5fuy3VwGkKDVKHepesztgMqwEZ`, exact SHA `eb6c94596e8dd7a5c1282ac2aeffcab75f09aace`, and verified hosting/routing authority. The website shell is therefore proven on this exact deployment.
- **Runtime bootstrap evidence:** GitHub Actions run [32607739624](https://github.com/jblan2026-hub/obserra-website/actions/runs/32607739624), job `97115470022`, failed during Azure login with `AADSTS700213`: no federated identity record matched the immutable GitHub OIDC subject `repo:jblan2026-hub@309821056/obserra-website@1321156321:ref:refs/heads/main`. All subsequent Key Vault, Vercel binding, and replacement-build steps were skipped; no runtime-secret or Vercel mutation occurred.
- **Fresh operational results:** Applications commerce returned HTTP `503`, `operational:false`, `durable-commerce-unavailable`, identity not ready, and provider not connected. Academy commerce returned HTTP `503`, `operational:false`, with live identity available but payment provider and durable storage unavailable. Florida Class D liveness returned HTTP `200` / `live`; readiness returned HTTP `503` / `not_ready` at `2026-08-23T00:43:18Z`.
- **Blocker:** the Azure deployment identity still lacks a federated credential matching GitHub's immutable repository-ID subject, and the repository bootstrap/release scripts still expect the older mutable owner/repository subject. Commerce, enrollment, and regulated LMS operations remain fail-closed.
- **Next safe action:** update the governed Azure bootstrap/release contract to the exact immutable subject and idempotently converge the named federated credential while retaining the exact issuer and Azure exchange audience. Apply that control-plane change through an authenticated Azure owner path, rerun the failed bootstrap, and require a new exact canonical deployment plus Applications/Academy HTTP `200` / `operational:true` and Florida HTTP `200` / `ready` before enabling those capabilities.
## 2026-08-23T01:18:47Z — PR #217 merged; immutable GitHub-to-Azure OIDC contract corrected

- **GitHub event:** PR [#217](https://github.com/jblan2026-hub/obserra-website/pull/217), `fix(azure): converge immutable GitHub OIDC subject`, merged as verified main commit `a78591ed9db9ae7000705c501b5933e7a49afc5d` from head `36215fc09d0aef4358d8313c69a494aee080770f`.
- **Changed work:** the Azure identity contract now requires the immutable GitHub subject `repo:jblan2026-hub@309821056/obserra-website@1321156321:ref:refs/heads/main`, issuer `https://token.actions.githubusercontent.com`, and sole audience `api://AzureADTokenExchange`; the named `github-main` federated credential is converged on deployment identity `id-obserra-github-prod`.
- **Source evidence:** Azure IaC run [32609760240](https://github.com/jblan2026-hub/obserra-website/actions/runs/32609760240), Website CI run [32609760346](https://github.com/jblan2026-hub/obserra-website/actions/runs/32609760346), and CodeQL run [32609760265](https://github.com/jblan2026-hub/obserra-website/actions/runs/32609760265) completed successfully.
- **Historical canonical proof:** Vercel deployment `dpl_7AdYMCxdEVT2fHFKswQ6dJkL1VFh` was tied to exact SHA `a78591ed9db9ae7000705c501b5933e7a49afc5d`, and the canonical health endpoint returned HTTP `200` with that exact deployment and SHA. This establishes only the website release, not commerce or LMS operation.
- **Runtime blocker:** the earlier bootstrap run [32607739624](https://github.com/jblan2026-hub/obserra-website/actions/runs/32607739624), job `97115470022`, failed in `azure/login@v2` with `AADSTS700213` because the Azure tenant-side federated identity record did not match the immutable subject. Key Vault, Vercel binding, and replacement-deployment steps were skipped; no Vercel mutation occurred. PR #217's changed paths are outside the bootstrap workflow's push filters, so the workflow did not automatically rerun.
- **Next safe action:** through an authenticated Azure owner path, idempotently update and read back the `github-main` federated credential to the exact issuer, immutable subject, and sole audience above; then manually dispatch `enable-vercel-key-vault-runtime.yml` against current `main`. Do not place secret values in GitHub.

## 2026-08-23T02:02:09Z — PR #218 merged; public identity gate repaired and next boundary isolated

- **GitHub event:** PR [#218](https://github.com/jblan2026-hub/obserra-website/pull/218), `fix(ci): verify public identity boundary`, merged as main commit `d5bb5021f02b68e55abbc904d199785d70170c7e` from head `264cd69b37a4ce31e3403256eefdbf4fd7c15ed5`.
- **Changed work:** the production homepage gate replaced stale authenticated-identity assertions with the actual public-route contract: `x-obserra-identity-provider: public` and `x-obserra-identity-status: not-required`. HSTS, CSP, `nosniff`, and frame-denial assertions remained required.
- **Source and release evidence:** PR Website CI run [32611627474](https://github.com/jblan2026-hub/obserra-website/actions/runs/32611627474), CodeQL run [32611627458](https://github.com/jblan2026-hub/obserra-website/actions/runs/32611627458), and Production Authority run [32611627497](https://github.com/jblan2026-hub/obserra-website/actions/runs/32611627497) completed successfully. Guarded cutover run [32611806277](https://github.com/jblan2026-hub/obserra-website/actions/runs/32611806277) completed successfully.
- **Historical canonical proof:** at `2026-08-23T02:03:46.881Z`, canonical `GET /api/health` returned HTTP `200` with exact deployment `dpl_5miGPowB3KkU5KMj1WhACmqNgVqh`, SHA `d5bb5021f02b68e55abbc904d199785d70170c7e`, canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority.
- **First broken boundary:** production E2E run [32611806301](https://github.com/jblan2026-hub/obserra-website/actions/runs/32611806301), job `97125961014`, passed website liveness and homepage/security checks, then failed the Academy catalog step because it unconditionally required a checkout form. The canonical Academy page instead proved the intentional licensing lock: 60 courses, zero open for purchase, explicit licensing-pending text, no checkout action, and no retired GET mutation.
- **Next safe action:** update only the Academy catalog gate to accept either a governed same-origin POST checkout form for an activated course or the explicit zero-purchase licensing lock; retain every payment, storage, entitlement, legal, and retired-route check.

## 2026-08-23T11:26:23Z — PR #219 merged and proven on the canonical production domain

- **GitHub event:** PR [#219](https://github.com/jblan2026-hub/obserra-website/pull/219), `fix(ci): recognize Academy licensing lock`, merged from exact head `257fb3f076cb770c3a9008aa8f022260541f88a3` as verified main commit `bb0930d24750c76f0f95e118b713d32078febc34`.
- **Changed work:** the Academy catalog gate now accepts only one of two evidence-backed states: a governed POST form to `/api/academy/checkout`, or the explicit licensing-pending page with zero courses open and no checkout action. The retired GET mutation path remains prohibited. No sales, payment, entitlement, secret, storage, or licensing runtime was enabled.
- **Source evidence:** Website CI run [32636441149](https://github.com/jblan2026-hub/obserra-website/actions/runs/32636441149), CodeQL run [32636441116](https://github.com/jblan2026-hub/obserra-website/actions/runs/32636441116), and Production Authority run [32636441195](https://github.com/jblan2026-hub/obserra-website/actions/runs/32636441195) completed successfully. Repository tests passed; workflow YAML parsed and all 8 shell blocks passed syntax validation.
- **Exact deployment and cutover:** Vercel production deployment `dpl_64BSk5YX2u69eBsXPXPLM8FpFrjp` is `READY` for exact verified SHA `bb0930d24750c76f0f95e118b713d32078febc34`. Guarded cutover run [32636522681](https://github.com/jblan2026-hub/obserra-website/actions/runs/32636522681) passed exact-candidate readiness, preflight, domain move, alias assignment, canonical LMS/prelicense lock, duplicate quarantine, and fail-closed enforcement; rollback was skipped because cutover succeeded.
- **Canonical public proof:** at `2026-08-23T11:26:56.754Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and reported exact deployment `dpl_64BSk5YX2u69eBsXPXPLM8FpFrjp`, exact SHA `bb0930d24750c76f0f95e118b713d32078febc34`, canonical project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority.
- **Production E2E proof:** run [32636522690](https://github.com/jblan2026-hub/obserra-website/actions/runs/32636522690), job `97187020659`, passed all 9 steps, including website identity/security, Academy catalog/legal controls, checkout method and same-origin boundaries, fail-closed Academy commerce, Florida liveness/readiness honesty, and canonical redirect.
- **Fresh public results:** at `2026-08-23T11:27:41Z–11:27:48Z`, the canonical Academy page returned HTTP `200` from deployment `dpl_64BSk5YX2u69eBsXPXPLM8FpFrjp`, showed 60 courses and zero open for purchase, displayed the explicit licensing lock, and exposed neither checkout action nor retired GET mutation. Applications commerce returned HTTP `503`, contract `applications-commerce-health-v1`, `operational:false`, and `durable-commerce-unavailable`. Academy commerce returned HTTP `503`, contract `academy-commerce-health-v1`, `operational:false`, payment provider unavailable, and durable storage unavailable. Florida Class D liveness returned HTTP `200` / `live`; readiness returned HTTP `503` / `not_ready`.
- **Blockers:** the website shell and fail-closed release controls are live on the exact deployment. Applications commerce, Academy payment/storage, new Academy enrollment, and regulated Florida LMS readiness are not operational. The first shared production-runtime blocker remains the Azure tenant-side federated credential mismatch described above.
- **Next safe action:** converge and read back the Azure `github-main` federated credential through the authorized owner path, then manually dispatch the governed Key Vault-to-Vercel runtime bootstrap against current main. Require the replacement deployment's exact SHA on the canonical health endpoint and independent HTTP `200` / `operational:true` commerce plus HTTP `200` / `ready` LMS evidence before enabling any governed capability.


### 2026-08-23T11:42:00Z — PR #220 opened: exact Vercel deployment-check evidence

- **Event:** Pull request [#220](https://github.com/jblan2026-hub/obserra-website/pull/220) opened; it is open, mergeable, and unmerged.
- **Exact source:** head `98845b2752e80a3a73628ef84e3b299d04da0d1d` changes only `.github/workflows/production-vercel-public-cutover.yml` and its focused release-control test. The added step queries Check-v2 evidence for the exact selected deployment and emits only check ID/name/status/conclusion/block/require/source metadata. It is diagnostic-only, is not referenced by any cutover condition, and does not mutate Vercel.
- **Source validation:** Production Authority Contract run [`32637249918`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249918) and CodeQL run [`32637249950`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249950) passed. Website CI run [`32637249921`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249921) was still in progress at this record time. These are source gates, not production proof.
- **Preview evidence:** Vercel deployment `dpl_8t4Pd28KMs1xt2bHFi4QwYfBu71G` for the exact PR head was `CANCELED`; Vercel recorded the branch commit as unverified and linked its verified-commit policy. It has no production target and proves no runtime result.
- **Fresh canonical evidence at 2026-08-23T11:42:00Z:** `/api/health` returned HTTP `200` and still proved deployment `dpl_64BSk5YX2u69eBsXPXPLM8FpFrjp` / SHA `bb0930d24750c76f0f95e118b713d32078febc34`. PR #220 is not canonical and is not recorded as live.
- **Fresh guarded-runtime evidence:** Applications commerce returned HTTP `503` with `operational: false`; Academy commerce returned HTTP `503` with `operational: false`; Florida readiness returned HTTP `503` with `status: "not_ready"`. Payment, entitlement, enrollment, and regulated learner operation remain fail-closed.
- **Blocker:** the exact Vercel Check-v2 failure identity is not yet available; the current Vercel GitHub context failure cannot be treated as a build/runtime failure because the exact current canonical deployment, guarded cutover, and production E2E evidence independently pass.
- **Next safe action:** allow Website CI to finish; merge only through a verified GitHub commit if all required source gates pass; then inspect the redacted Check-v2 record on the exact new candidate while retaining exact public preflight, rollback, canonical deployment/SHA verification, and fail-closed commerce/LMS controls.


### 2026-08-23T11:45:31Z — PR #220 merged and canonical exact-candidate proof

- **Merge evidence:** Pull request [#220](https://github.com/jblan2026-hub/obserra-website/pull/220) merged after Website CI run [`32637249921`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249921), Production Authority Contract run [`32637249918`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249918), and CodeQL run [`32637249950`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637249950) passed on exact head `98845b2752e80a3a73628ef84e3b299d04da0d1d`. Signed main SHA: `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`.
- **Exact deployment:** Vercel production deployment `dpl_338DuEe7Wu6T4HxRmADa2KWZzr4U` was selected for that exact main SHA.
- **Guarded cutover:** run [`32637361569`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637361569), job `97189018257`, completed successfully through exact candidate selection, redacted Check-v2 evidence, public preflight, rollback capture, domain movement, exact alias assignment, LMS/prelicense lock verification, duplicate quarantine, and fail-closed enforcement. Rollback was not required.
- **Check-v2 evidence:** run `ckr_e69fb3c4-73c9-4ce3-91f4-5f4869acab5f` identified check `chk_51cd153f-ce0b-4ace-8f45-77555fa0bba5`, named `Clerk DNS Configuration`, as `completed / failed`; it blocks `deployment-alias`, requires `deployment-url`, and reports an integration source. This is a provider deployment-check failure; clean build/runtime and canonical evidence are evaluated separately.
- **Canonical proof at 2026-08-23T11:45:31Z:** `https://www.obserrallc.com/api/health` returned HTTP `200` and proved exact deployment `dpl_338DuEe7Wu6T4HxRmADa2KWZzr4U` / SHA `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d` with verified routing. This is the only live claim in this entry.
- **Fresh guarded-runtime evidence:** Applications commerce remained HTTP `503`, `operational: false`; Academy commerce remained HTTP `503`, `operational: false`; Florida liveness returned HTTP `200`, `live`; Florida readiness remained HTTP `503`, `not_ready`.
- **Blocker:** the Clerk DNS deployment check is the exact source of the Vercel failure context. Its underlying DNS/auth configuration must be proven before correction; the check must not be removed or weakened merely because the canonical website gates passed.
- **Next safe action:** inspect the public Clerk DNS/auth contract and the integration configuration using non-secret evidence; correct only proven drift, then require the next exact deployment, guarded cutover, and canonical deployment/SHA proof.


### 2026-08-23T11:45:31Z — PR #221 opened: production runtime bootstrap convergence

- **Event:** Pull request [#221](https://github.com/jblan2026-hub/obserra-website/pull/221) opened; it is unmerged at exact head `4a7fd64fe3391a0f35a46e311fdfe5578cc49bb8`.
- **Changed work:** the PR converges an existing drifted Vercel-to-Azure workload federated credential and performs exact readback; upserts and exactly verifies the required non-secret production bindings `OBSERRA_APPLICATIONS_SUPABASE_URL`, `OBSERRA_ACADEMY_SUPABASE_URL`, `OBSERRA_ACADEMY_SUPABASE_PROJECT_REF`, and `OBSERRA_IDENTITY_RUNTIME_ENABLED`; and hands only the exact directly preflighted deployment ID to the existing rollback-owning public-cutover workflow. Secret metadata remains non-decrypted and canonical alias mutation remains isolated in the guarded controller.
- **Source validation:** Website CI run [`32637293996`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637293996), CodeQL run [`32637293962`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637293962), and Production Authority Contract run [`32637293998`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637293998) completed successfully. These are source gates, not live proof.
- **Preview evidence:** Vercel deployment `dpl_5EFhXRtUJqM6pbGeYCdEiVMMxonC` for the exact PR head was `CANCELED`; it had no production target, and Vercel recorded the branch commit as unverified under the verified-commit policy.
- **Canonical evidence:** PR #221 is not canonical. At 2026-08-23T11:45:31Z the public host still proved `dpl_338DuEe7Wu6T4HxRmADa2KWZzr4U` / `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`.
- **Runtime blocker:** the current GitHub-to-Azure deployment identity still requires the exact tenant-side `github-main` federated identity record before `azure/login` can succeed. Until then the Key Vault/Vercel convergence steps cannot run; Applications and Academy remain HTTP `503`.
- **Next safe action:** merge only through an authorized, verified GitHub path; converge the exact Azure tenant `github-main` federated identity; then dispatch the runtime bootstrap from current `main`. Require direct Applications and Academy HTTP `200` with `operational: true`, exact deployment-ID cutover, canonical deployment/SHA proof, and retained Florida licensing/readiness gates before enabling any governed operation.

### 2026-08-23T11:50:00Z — PR #221 synchronized onto exact current main

- **Event:** pull request [#221](https://github.com/jblan2026-hub/obserra-website/pull/221) was synchronized. It remains open and unmerged.
- **Exact source identity:** the reconciled head is `63de7ae6e01501afa8a4fe7eeac5438eec5d23ce`; its exact base is current `main` `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`. GitHub reports the PR mergeable.
- **Changed work evidenced by the synchronized source:** the runtime bootstrap idempotently converges the existing Vercel-to-Azure workload federation; exactly verifies four non-secret Production bindings for Applications storage, Academy storage, the Academy project reference, and explicit identity-runtime activation; retains sensitive Key Vault identity metadata as non-decrypted; and dispatches the existing guarded cutover only after direct Applications and Academy commerce preflight, pinned to the exact candidate deployment ID. Alias mutation and rollback remain owned by the guarded cutover workflow. The merged Check-v2 diagnostic remains evidence only and is not release authority.
- **GitHub validation for the exact head:** Production Authority Contract run [`32637574278`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637574278) succeeded; Website CI run [`32637574281`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637574281) succeeded; CodeQL Advanced run [`32637574284`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637574284) succeeded. Ops Applications Storage URL Convergence was skipped.
- **Branch deployment evidence:** Vercel deployment `dpl_86oGTeCZHuRuaqF1UcDGrsMX9WRC` for exact head `63de7ae6e01501afa8a4fe7eeac5438eec5d23ce` is `CANCELED`, has no production target, and reports `githubCommitVerification: unverified` with the verified-commits policy error. This is not a production deployment and is not live.
- **Canonical public proof:** at `2026-08-23T11:50Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and identified exact deployment `dpl_338DuEe7Wu6T4HxRmADa2KWZzr4U`, exact SHA `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`, and the canonical Vercel project as verified. PR #221 has not changed the canonical deployment.
- **Public subsystem results:** at the same probe, Applications commerce returned HTTP `503` with identity/storage/provider readiness unavailable, and Academy commerce returned HTTP `503` with identity available but durable-storage/payment readiness unavailable. The most recent adjacent Florida probe returned liveness HTTP `200` and readiness HTTP `503`. No commerce, entitlement, payment, or LMS readiness is claimed.
- **Blockers:** the GitHub-to-Azure deployment identity still requires the exact tenant-side `github-main` federated identity record before `azure/login` can succeed. PR #221 remains unmerged; its canceled branch deployment cannot establish production readiness, and no production mutation occurred during synchronization.
- **Next safe action:** after explicit authorization for the production-sensitive merge and runtime dispatch, merge only through the verified signed-main path; converge and read back the exact Azure tenant `github-main` federation; dispatch the current-main bootstrap; then require direct Applications and Academy HTTP `200` with `operational: true`, exact deployment-ID cutover success, and canonical public deployment/SHA proof before enabling any governed commerce or LMS operation.

### 2026-08-23T11:55:00Z — PR #222 opened for exact Clerk check reconciliation

- **Event:** pull request [#222](https://github.com/jblan2026-hub/obserra-website/pull/222), `fix(ci): reconcile Clerk check after canonical proof`, was opened. It remains open and unmerged.
- **Exact source identity:** head `54b9a783fc1149467b6523c249d62ccf2132ab02`, base `main` at `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`. GitHub reports the PR mergeable.
- **Changed work evidenced by the source:** the guarded public-cutover workflow keeps the Clerk integration check enabled; after exact canonical deployment/SHA and ownership proof it requires the public `clerk` and `accounts` CNAMEs plus a canonical production sign-in page; it then rerequests only the exact failed and rerequestable Clerk integration check tied to the exact deployment and polls that deployment run to terminal state. The reconciliation is `continue-on-error`, cannot authorize cutover, deletes no check, mutates no project check configuration, and emits no raw provider response.
- **Validation for the exact head:** Production Authority Contract run [`32637861731`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637861731) succeeded; CodeQL Advanced run [`32637861697`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637861697) succeeded; Website CI run [`32637861769`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637861769) succeeded. The affected release-control validation also reports 25/25 tests, valid workflow YAML, shell syntax, and diff checks.
- **Branch deployment evidence:** Vercel deployment `dpl_D8aMEUJjmP8GTCfANtggGbruuu3u` is `CANCELED`, has no production target, identifies exact head `54b9a783fc1149467b6523c249d62ccf2132ab02`, and reports `githubCommitVerification: unverified` with the verified-commits policy error. It is not deployed to the canonical domain and is not live.
- **Canonical public proof:** the most recent public probe at `2026-08-23T11:50Z` returned HTTP `200` from `https://www.obserrallc.com/api/health` and identified exact deployment `dpl_338DuEe7Wu6T4HxRmADa2KWZzr4U`, exact SHA `55a555c7a7f16ed44d06516b2fe8bc82438c2e8d`, and the canonical project as verified. PR #222 has not changed the public deployment.
- **Public subsystem results:** Applications commerce remains HTTP `503`; Academy commerce remains HTTP `503`; the most recent Florida liveness result is HTTP `200` while readiness remains HTTP `503`. Vercel telemetry shows handled fail-closed responses rather than route runtime crashes. No commerce, entitlement, payment, or LMS readiness is claimed.
- **Blockers:** PR #222 remains unmerged and its branch deployment is intentionally canceled. PR #221 is a separate open runtime-bootstrap change that overlaps the guarded cutover workflow and must be reconciled against whichever exact signed-main commit lands first. The proven Azure tenant-side `github-main` federation prerequisite still blocks the runtime bootstrap before any Vercel mutation.
- **Next safe action:** choose one exact verified signed-main merge order, rebase the other PR onto the resulting exact main, and rerun all exact-head checks. After the Azure tenant federation is converged, dispatch the current-main runtime bootstrap; require direct Applications and Academy HTTP `200` with `operational: true`, exact deployment-ID cutover, the Clerk rerequest evidence, and canonical public deployment/SHA proof before enabling governed commerce or LMS operations.

### 2026-08-23T11:58:00Z — PR #222 merged and exact canonical deployment proven

- **Event:** pull request [#222](https://github.com/jblan2026-hub/obserra-website/pull/222), `fix(ci): reconcile Clerk check after canonical proof`, was closed and merged.
- **Exact source identity:** PR head `54b9a783fc1149467b6523c249d62ccf2132ab02` merged to exact signed `main` commit `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`.
- **Validated changed work:** the production cutover retains the Clerk integration check, proves exact canonical deployment/SHA and domain ownership first, verifies the public Clerk/auth CNAME contract plus production sign-in markers, and attempts a rerequest only for one exact failed and rerequestable Clerk integration check. The reconciliation remains non-authoritative and cannot approve cutover.
- **Exact deployment:** Vercel deployment `dpl_B5R5pRWF2DrXjjTcMBvHNBF4j63V` is `READY`, targets `production`, and identifies verified commit `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`.
- **Guarded cutover evidence:** GitHub run [`32637967404`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32637967404), job `97190457399`, completed successfully. Exact-candidate selection, Check-v2 evidence collection, preflight, rollback capture, domain movement, exact alias assignment, LMS/prelicense lock, duplicate quarantine, Clerk reconciliation, outcome publication, and fail-closed enforcement all completed; rollback was skipped because it was not required.
- **Clerk reconciliation result:** the reconciliation step completed but logged `preserved a nonmatching or non-rerequestable check`; GitHub still reports the `Vercel – obserra-website-live` context as failure. The provider check is therefore not claimed cleared. It remains enabled and was not used as release authority.
- **Canonical public proof:** at `2026-08-23T11:57:57Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and identified exact deployment `dpl_B5R5pRWF2DrXjjTcMBvHNBF4j63V`, exact SHA `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`, expected project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. The website is live on this exact release.
- **Canonical identity proof:** `GET https://www.obserrallc.com/sign-in` returned HTTP `200` from exact deployment `dpl_B5R5pRWF2DrXjjTcMBvHNBF4j63V` and contained production Clerk/custom frontend-API markers with no test-environment markers. This proves the public sign-in asset is production-configured; it does not prove a completed authenticated user transaction.
- **Public subsystem results:** Applications commerce returned HTTP `503` with `operational: false`, identity/storage/provider/Stripe readiness unavailable, and `durable-commerce-unavailable`. Academy commerce returned HTTP `503` with `operational: false`, identity available/live, payment unavailable, and durable storage unavailable. Florida LMS liveness returned HTTP `200`; Florida readiness returned HTTP `503` with `not_ready`. Vercel telemetry shows handled fail-closed responses and no Apps/Academy runtime error clusters. No commerce, payment, entitlement, enrollment, or LMS-readiness success is claimed.
- **Blockers:** the Azure tenant-side `github-main` federated identity prerequisite still blocks the runtime bootstrap before Vercel mutation. PR #221 targets the previous main and overlaps the cutover workflow, so it must be reconciled onto exact main `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`. The Clerk integration status remains unresolved even though canonical DNS/sign-in evidence passes.
- **Next safe action:** rebase PR #221 onto exact current main while retaining the PR #222 Clerk reconciliation; rerun exact-head validation; converge and read back the Azure tenant federation; then, after explicit authorization for the production-sensitive merge and runtime dispatch, run the current-main bootstrap. Require direct Applications and Academy HTTP `200` with `operational: true`, exact deployment-ID cutover, canonical deployment/SHA proof, and retained Florida readiness/licensing gates before enabling governed operations.

### 2026-08-23T12:02:40Z — PR #221 rebased onto the PR #222 canonical release

- **Event:** pull request [#221](https://github.com/jblan2026-hub/obserra-website/pull/221) was synchronized to exact head `0774270310b52459563caf83bc7008b46cdb73b7`.

- **Exact source identity:** pull request [#221](https://github.com/jblan2026-hub/obserra-website/pull/221) remains open and mergeable at exact head `0774270310b52459563caf83bc7008b46cdb73b7`, based on exact signed `main` `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`.
- **Reconciliation result:** the runtime-bootstrap changes preserve PR #220 Check-v2 evidence and PR #222 post-canonical Clerk reconciliation. The exact four non-secret Production bindings and readback, exact deployment-ID cutover dispatch, guarded alias ownership/rollback, and fail-closed commerce/LMS controls remain. No production bootstrap, alias mutation, or secret transfer occurred during the rebase.
- **Exact-head validation:** Production Authority Contract run [`32638169563`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32638169563) succeeded; CodeQL Advanced run [`32638169546`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32638169546) succeeded; Website CI run [`32638169578`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32638169578) succeeded. Focused local validation reports 17/17 tests, valid YAML, and 15/15 workflow shell blocks.
- **Branch deployment evidence:** Vercel deployment `dpl_3C9cB92246fkpT1MYRS63oeuxSMW` for exact head `0774270310b52459563caf83bc7008b46cdb73b7` is `CANCELED`, has no production target, and reports `githubCommitVerification: unverified`. It is not live.
- **Canonical public state:** the canonical website remains proven on exact deployment `dpl_B5R5pRWF2DrXjjTcMBvHNBF4j63V` / SHA `6d689357fac094a7dd4c0a74b34c1b0ea40ed114`; `/api/health`, the homepage, and `/sign-in` return HTTP `200` with verified deployment/routing and production identity markers.
- **Public subsystem state:** Applications commerce remains HTTP `503` with durable commerce unavailable; Academy commerce remains HTTP `503` with live identity but payment/storage unavailable; Florida LMS liveness is HTTP `200` and readiness is HTTP `503`. No governed commerce, payment, entitlement, enrollment, or LMS-readiness claim is made.
- **Blockers:** the exact Azure tenant-side `github-main` federated identity record still must be converged before `azure/login` can pass. The Clerk integration check remains enabled and unresolved. PR #221 remains unmerged, and the production-sensitive merge/bootstrap path requires explicit authorization.
- **Next safe action:** after explicit authorization, merge only this exact validated head through the verified signed-main path; converge and read back the Azure tenant federation; dispatch the runtime bootstrap from the resulting exact current main; and require direct Applications and Academy HTTP `200` with `operational: true`, exact deployment-ID cutover, canonical deployment/SHA proof, and retained Florida readiness/licensing gates.

### 2026-08-23T12:07:00Z — PR #221 merged and canonical release proven

- **Event:** pull request [#221](https://github.com/jblan2026-hub/obserra-website/pull/221), `fix(runtime): converge exact production identity bootstrap`, was closed and merged.
- **Exact source identity:** validated head `0774270310b52459563caf83bc7008b46cdb73b7` merged through the signed-main path as exact commit `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Changed work:** current main now contains idempotent Vercel-to-Azure workload federation convergence and exact readback, four required non-secret Vercel Production bindings with exact type/target/value verification, sensitive Key Vault identity metadata kept non-decrypted, direct dual-commerce preflight, and dispatch to the guarded cutover pinned to the exact deployment ID. PR #220 Check-v2 evidence and PR #222 post-canonical Clerk reconciliation are preserved.
- **Pre-merge validation:** Production Authority Contract run `32638169563`, CodeQL Advanced run `32638169546`, and Website CI run `32638169578` all succeeded on the exact head. Focused validation reported 17/17 tests, valid YAML, and 15/15 workflow shell blocks.
- **Exact deployment:** Vercel deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV` is `READY`, targets `production`, and identifies verified commit `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Guarded cutover evidence:** GitHub run [`32638364653`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32638364653), job `97191419069`, completed successfully. Exact candidate selection, deployment-check evidence, preflight, rollback capture, domain movement, exact alias assignment, LMS/prelicense lock, duplicate quarantine, Clerk reconciliation, outcome publication, and fail-closed enforcement completed; rollback was skipped because it was not required.
- **Canonical public proof:** at `2026-08-23T12:06:58.688Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and identified exact deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, expected project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. The canonical website is live on this exact release.
- **Public subsystem results:** Applications commerce returned HTTP `503` with `operational: false`, identity/storage/provider/Stripe readiness unavailable, and `durable-commerce-unavailable`. Academy commerce returned HTTP `503` with `operational: false`, live identity, payment unavailable, and durable storage unavailable. Florida LMS liveness returned HTTP `200`; readiness returned HTTP `503` with `not_ready`. Telemetry shows handled fail-closed responses and no Apps/Academy runtime error clusters. No commerce, payment, entitlement, enrollment, or LMS-readiness success is claimed.
- **Clerk integration evidence:** exact Check-v2 run `ckr_a815862c-12dd-4050-a6b3-4fc48a8440fd`, check `chk_51cd153f-ce0b-4ace-8f45-77555fa0bba5`, completed `failed`, blocks `deployment-alias`, requires `deployment-url`, source `integration`. Reconciliation preserved it as nonmatching or non-rerequestable; the check remains enabled and is not claimed cleared.
- **Blockers:** the production runtime bootstrap was not dispatched. The exact Azure tenant-side `github-main` federated identity record still must be converged before `azure/login` can pass. The runtime bootstrap transfers production-sensitive Key Vault bindings into the approved Vercel Production project and requires explicit authorization before dispatch.
- **Next safe action:** converge and read back the exact Azure tenant federation, then—after explicit authorization for the production-sensitive transfer—dispatch the runtime bootstrap from exact current main `5de3910bc104db9f41de48f816dde5bdf82dd6e2`. Require direct Applications and Academy HTTP `200` with `operational: true`, exact replacement deployment/cutover, canonical deployment/SHA proof, and retained Florida readiness/licensing gates before enabling governed operations.



<!-- ops-checkpoint:2026-08-23-runtime-bootstrap-recovery -->
### 2026-08-23T12:13:58Z — continuation recovered; exact external gate loaded

- **Authoritative record:** reloaded this rolling `ops/live-handoff` record and the signed baseline on `chore/verified-canonical-cutover-trigger-20260822`. The signed baseline is historical; this branch remains the active operational record.
- **Exact merged source:** the release input remains signed `main` commit `5de3910bc104db9f41de48f816dde5bdf82dd6e2`; the existing PR #221 release entry was not duplicated.
- **Tenant-side prerequisite resolved from exact source:** managed identity `id-obserra-github-prod` in `rg-obserra-prod-eastus`, federated credential `github-main`, issuer `https://token.actions.githubusercontent.com`, subject `repo:jblan2026-hub@309821056/obserra-website@1321156321:ref:refs/heads/main`, and sole audience `api://AzureADTokenExchange`.
- **Production Studio linkage:** `jblan2026-hub/obserra-academy-production-studio` was inspected for a separate continuation handoff; none is present under its current `docs` tree. Academy runtime convergence remains governed by the website repository's merged bootstrap and canonical health contract.
- **Mutation state:** no Azure tenant record, Vercel Production environment, deployment, alias, payment, enrollment, or LMS readiness setting was changed during recovery. No sensitive value was read, printed, or transferred.
- **Authorization gate:** production-sensitive Key Vault-to-Vercel bootstrap dispatch remains unexecuted pending explicit owner authorization. This rolling record will be appended automatically after each material probe, mutation, deployment, rollback, or blocker.
- **Next safe action:** have an Azure tenant administrator converge and read back the exact `github-main` record. After explicit production-transfer authorization, dispatch the current-main runtime bootstrap and require direct Applications and Academy HTTP `200` with `operational: true`, exact replacement deployment/cutover, canonical deployment/SHA proof, and retained Florida licensing/readiness gates.


<!-- ops-checkpoint:2026-08-23T12-14-canonical-reprobe -->
### 2026-08-23T12:14:35Z — fresh canonical and subsystem re-probe

- **Canonical identity:** authenticated Vercel fetch of `https://www.obserrallc.com/api/health` returned HTTP `200` and exact deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, expected/observed project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority.
- **Applications commerce:** HTTP `503`, contract `applications-commerce-health-v1`, `operational: false`, identity/storage/provider/Stripe readiness unavailable, error `durable-commerce-unavailable`.
- **Academy commerce:** HTTP `503`, contract `academy-commerce-health-v1`, `operational: false`; identity is available/live while payment and durable storage remain unavailable.
- **Florida LMS:** liveness returned HTTP `200` / `live`; readiness returned HTTP `503` / `not_ready` with `Retry-After: 60`.
- **Interpretation:** the website release remains canonical and verified; Applications, Academy payment, and regulated Florida LMS readiness remain fail-closed. No production mutation or sensitive transfer occurred.
- **Next safe action:** inspect the exact current-main runtime-bootstrap run evidence, then converge/read back the tenant-side `github-main` federated identity before any authorized production bootstrap dispatch.


<!-- ops-checkpoint:2026-08-23T12-15-vercel-target-readback -->
### 2026-08-23T12:15:xxZ — exact Vercel target readback

- **Canonical production target:** Vercel returned deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV` as `READY`, target `production`, project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` / `obserra-website-live`, GitHub ref `main`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, and commit verification `verified`.
- **Non-production noise:** project metadata also reported newer deployment `dpl_FrnRnhAG7uV2AVXeN8TvhQztQhuU` as `CANCELED` with no production target. It is not canonical evidence and did not alter the proven production release.
- **Mutation state:** readback only; no environment binding, deployment, alias, payment, or LMS setting was changed.
- **Remaining gates:** exact tenant-side `github-main` convergence/readback and explicit owner authorization for the production-sensitive Key Vault-to-Vercel bootstrap dispatch.


<!-- ops-checkpoint:2026-08-23-production-studio-handoff-scan -->
### 2026-08-23T12:16:xxZ — Production Studio handoff scan completed

- **Repository checked:** `jblan2026-hub/obserra-academy-production-studio` current `main` plus operational branches `ops/fix-postmerge-ha-evidence`, `ops/10x-cross-project-production-gate`, `ops/20x-enterprise-production-gate`, `ops/40x-enterprise-production-gate`, `ops/40x-postmerge-production-evidence`, and `ops/50x-enterprise-production-gate`.
- **Result:** no separate continuation handoff or checkpoint file exists in the inspected branch roots or `docs` trees. No competing runtime authority was found.
- **Operational authority:** this website `ops/live-handoff` record remains the single rolling record for canonical website, Applications commerce, Academy/Production Studio integration, payment, and Florida LMS runtime evidence.
- **Mutation state:** repository readback only; no Production Studio source, branch, deployment, payment, or LMS setting was changed.


<!-- ops-checkpoint:2026-08-23-owner-authorization-bash-shell-mismatch -->
### 2026-08-23T12:21:32Z — owner authorization received; tenant command failed before mutation

- **Explicit authorization:** the owner explicitly authorized the approved production Key Vault runtime bindings into canonical Vercel Production project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` and the guarded bootstrap from exact main `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Submitted evidence review:** the Azure Cloud Shell screenshot shows a Bash prompt, but the supplied tenant-convergence block used PowerShell assignment, object-conversion, continuation, and condition syntax. Bash rejected those constructs, variables remained empty, and Azure CLI reported missing required arguments.
- **Verification correction:** the submitted `OBSERRA_GITHUB_MAIN_FEDERATION=verified` text is not accepted as tenant proof because the screenshot demonstrates the convergence/readback commands did not execute successfully.
- **Mutation state:** no tenant federated-credential, Vercel environment, deployment, alias, payment, enrollment, or LMS readiness mutation is evidenced from this attempt. No sensitive value was exposed or transferred.
- **Authorization state:** owner authorization remains recorded and does not need to be repeated. The production bootstrap remains blocked only until the exact Bash tenant convergence returns its terminal verified marker.
- **Next safe action:** run the Bash-compatible idempotent `github-main` convergence/readback in the active Cloud Shell. On exact verification, trigger the authorized signed-main bootstrap and automatically append all results here.


<!-- ops-checkpoint:2026-08-23-github-main-federation-verified -->
### 2026-08-23T12:23:45Z — tenant-side `github-main` federation converged and read back

- **Owner evidence:** Azure Cloud Shell PowerShell completed the idempotent federated-credential convergence and exact readback without entering the mismatch `throw` path, then emitted `OBSERRA_GITHUB_MAIN_FEDERATION=verified`.
- **Exact trust contract:** deployment identity `id-obserra-github-prod`, resource group `rg-obserra-prod-eastus`, credential `github-main`, issuer `https://token.actions.githubusercontent.com`, immutable subject `repo:jblan2026-hub@309821056/obserra-website@1321156321:ref:refs/heads/main`, and sole audience `api://AzureADTokenExchange`.
- **Authorization:** the previously recorded explicit owner authorization for approved production Key Vault runtime bindings into Vercel Production project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC` and guarded bootstrap from exact main `5de3910bc104db9f41de48f816dde5bdf82dd6e2` remains active.
- **Independent enforcement:** the GitHub workflow's `azure/login`, subscription/tenant checks, identity client-ID check, Key Vault/RBAC checks, and subsequent exact readbacks remain mandatory; this screenshot does not bypass them.
- **Next safe action:** manually dispatch `enable-vercel-key-vault-runtime.yml` on branch `main` so GitHub issues a fresh OIDC assertion for exact current main. Monitor every job phase, fail closed on any mismatch, and append results automatically.


<!-- ops-checkpoint:2026-08-23-authorized-main-pin-before-dispatch -->
### 2026-08-23T12:24:29Z — authorized main SHA re-pinned before bootstrap dispatch

- **Fresh GitHub source proof:** repository commit enumeration returned `5de3910bc104db9f41de48f816dde5bdf82dd6e2` as the current latest `main` commit. It exactly matches the owner's authorized bootstrap source; no intervening main commit was observed.
- **Workflow target:** `.github/workflows/enable-vercel-key-vault-runtime.yml` on `main`; its manual dispatch must issue the fresh GitHub OIDC assertion required to independently prove the corrected tenant federation.
- **Dispatch boundary:** the connected GitHub tool surface exposes workflow readback/rerun but not a new workflow-dispatch mutation. No trigger commit will be substituted because that would change the explicitly authorized SHA.
- **Next safe action:** owner clicks `Run workflow` for this workflow on branch `main`. Continue immediately with exact run/job/log evidence, Vercel replacement deployment proof, guarded cutover, canonical probes, and automatic handoff updates.


<!-- ops-checkpoint:2026-08-23-bootstrap-dispatch-not-detected -->
### 2026-08-23T12:29:xxZ — authorized bootstrap dispatch not yet evidenced

- **Source lock:** fresh GitHub commit enumeration still returns `5de3910bc104db9f41de48f816dde5bdf82dd6e2` as current `main`, exactly matching the owner-authorized bootstrap source.
- **Deployment readback:** the newest Vercel records are canceled, non-production previews generated by `ops/live-handoff` documentation commits. No new deployment carrying the Key Vault runtime bootstrap action was returned.
- **Canonical production:** `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV` remains `READY` / `production` for exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Commit checks:** combined status remains unchanged: the canonical-cutover evidence status is successful, while the canonical project's existing Vercel/Clerk context remains failed. This does not prove the authorized Key Vault bootstrap ran.
- **Mutation state:** no new production environment binding, redeployment, alias movement, payment activation, enrollment, or LMS readiness mutation is evidenced by this check.
- **Next safe action:** manually dispatch `.github/workflows/enable-vercel-key-vault-runtime.yml` on branch `main`. Its independent Azure OIDC, tenant/subscription, identity, Key Vault/RBAC, Vercel binding, deployment, and direct commerce probes remain mandatory and fail closed.


<!-- ops-checkpoint:2026-08-23-authorized-bootstrap-dispatch-reported -->
### 2026-08-23T12:39:36.974Z — authorized runtime-bootstrap workflow reported dispatched; awaiting independent phase evidence

- **Owner action:** the owner reported completion of the manual dispatch for `.github/workflows/enable-vercel-key-vault-runtime.yml` on the already-authorized `main` SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Immediate observation:** Vercel deployment enumeration has not yet returned a new bootstrap/redeployment record. The existing canonical Production deployment remains `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`; this is expected until the workflow's independent Azure OIDC, tenant/subscription, federated-identity, Key Vault/RBAC, and Production-binding checks complete.
- **No success inference:** no sensitive binding transfer, replacement deployment, alias movement, payment activation, enrollment, or LMS readiness success is recorded from owner dispatch alone.
- **Monitoring contract:** observe and record the first accessible workflow/deployment evidence; fail closed if any required Azure, Key Vault, Vercel, Applications, Academy, or Florida readiness condition fails.


<!-- ops-checkpoint:2026-08-23-runtime-identity-missing-run-6 -->
### 2026-08-23T12:42:39.536Z — runtime-bootstrap run #6 failed closed before Vercel mutation

- **Workflow evidence:** owner-provided GitHub Actions evidence for `Enable Vercel Key Vault runtime identity` run `#6` shows `Authenticate the governed deployment identity` completed successfully.
- **Exact blocker:** `Bind the canonical Vercel production workload to the runtime identity` failed with Azure `ResourceNotFound`: user-assigned managed identity `id-obserra-runtime-prod` was not found in resource group `rg-obserra-prod-eastus`.
- **Fail-closed effect:** the production-binding, replacement-deployment, direct Applications/Academy commerce proof, guarded cutover, and canonical verification steps were skipped. No Vercel Production binding, sensitive transfer, deployment, alias, payment activation, enrollment, or LMS readiness change is evidenced.
- **Separate maintenance warning:** GitHub reported the current `azure/login@v2` action runtime as Node.js 20 being forced to Node.js 24. The warning did not cause this failure; a separate source-only upgrade to Azure Login v3 / Node 24 is required and must not replace the exact authorized recovery run.
- **Next safe action:** tenant administrator converges the missing runtime identity with the exact Key Vault Secrets User role, read backs the identity and role, then reruns only this failed bootstrap job at the same authorized SHA.


<!-- ops-checkpoint:2026-08-23-node24-upgrade-pr-223-opened -->
### 2026-08-23T12:44:08.318Z — Node 24 Azure Login upgrade isolated in PR #223

- **Source-only change:** opened [PR #223](https://github.com/jblan2026-hub/obserra-website/pull/223), `ci: upgrade Azure Login actions to Node 24`, from `fix/azure-login-node24-20260823`.
- **Exact scope:** two one-line substitutions: `azure/login@v2` to released `azure/login@v3.0.1` in `.github/workflows/enable-vercel-key-vault-runtime.yml` and `.github/workflows/azure-production-deploy.yml`. Azure Login v3 declares Node.js 24; all OIDC, RBAC, deployment, and fail-closed checks remain unchanged.
- **Source proof:** the branch is two commits ahead of and zero commits behind exact `main` SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`; comparison reports only the two expected one-line file changes.
- **Release isolation:** PR #223 is not merged and must not supersede the existing authorized recovery run. Runtime identity creation/role readback followed by a rerun of bootstrap run #6 remains the shortest path to Vercel binding and canonical verification.
- **Mutation state:** no Production environment binding, deployment, alias, payment, enrollment, or LMS state changed by opening this source-review PR.


<!-- ops-checkpoint:2026-08-23-node24-pr-223-contract-correction -->
### 2026-08-23T12:45:20.004Z — PR #223 Node 24 contract corrected and re-gated

- **Initial source-gate result:** Azure IaC Validation run `32640228406` failed only because `test/azure-production-plane-contract.test.mjs` still asserted `azure/login@v2` after the intended upgrade.
- **Correction:** the test now requires exact `azure/login@v3.0.1` in both the Azure-production and Vercel-Key-Vault runtime workflows, and explicitly rejects `azure/login@v2` in each. This strengthens the requested Node 24 contract; it does not bypass or remove a guardrail.
- **Scope after correction:** PR #223 now contains three source files: the two intended workflow substitutions and the matching contract-test update. No Azure or Vercel runtime mutation was made.
- **Next evidence:** wait for new PR #223 validation runs. Do not merge the Node 24 source update ahead of the exact-SHA runtime identity recovery.


<!-- ops-checkpoint:2026-08-23-pr-223-opened-gates-runtime -->
### 2026-08-23T12:45:12.030Z — PR #223 opened; source gates and canonical runtime checked

- **Event:** pull request [#223](https://github.com/jblan2026-hub/obserra-website/pull/223), `ci: upgrade Azure Login actions to Node 24`, opened and remains unmerged at exact head `7b1ff6aa1e387790b27005ec38c29b73cafddf71`.
- **Changed work:** exactly two workflow files changed, each replacing `azure/login@v2` with `azure/login@v3.0.1`: `.github/workflows/azure-production-deploy.yml` and `.github/workflows/enable-vercel-key-vault-runtime.yml`. No OIDC inputs, RBAC checks, deployment logic, runtime bindings, aliases, payments, enrollment, or LMS controls changed.
- **Source-gate evidence:** CodeQL Advanced run [`32640228388`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640228388) succeeded. Website CI run [`32640228377`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640228377) and Azure IaC Validation run [`32640228406`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640228406) failed because the existing Azure production-plane contract test still requires the obsolete regular expression `/azure\/login@v2/`; no deployment or Azure mutation step caused either failure.
- **Branch deployment evidence:** Vercel deployment `dpl_9nfDu2gGfscue2w182HthppSscv4` for the exact PR head is `CANCELED`, has no production target, and is not live.
- **Canonical public proof:** `GET https://www.obserrallc.com/api/health` returned HTTP `200` at `2026-08-23T12:45:12.030Z` and still identifies exact canonical deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, expected project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. PR #223 is not canonical.
- **Public subsystem results:** Applications commerce returned HTTP `503`, `operational: false`, `durable-commerce-unavailable`; Academy commerce returned HTTP `503`, `operational: false`, with payment and durable storage unavailable; Florida LMS liveness returned HTTP `200` / `live`; Florida LMS readiness returned HTTP `503` / `not_ready`.
- **Blockers:** PR #223 cannot pass required source gates until the two obsolete Azure Login v2 contract expectations are updated to the exact released v3 action. Separately, the authorized runtime bootstrap remains blocked by the missing Azure user-assigned managed identity `id-obserra-runtime-prod` and its required Key Vault role readback; the PR does not create that identity.
- **Next safe action:** update only the affected contract expectations to `azure/login@v3.0.1`, rerun Website CI and Azure IaC Validation, and do not merge until required gates pass. In parallel operationally, converge and read back `id-obserra-runtime-prod` plus its required Key Vault role, then rerun the authorized bootstrap at the exact authorized main SHA and require direct commerce and canonical deployment/SHA proof before any live claim.


<!-- ops-checkpoint:2026-08-23-pr-223-synchronize-ad9a0011 -->
### 2026-08-23T12:46:55.581Z — PR #223 synchronized; exact v3 contracts pass

- **Event:** pull request [#223](https://github.com/jblan2026-hub/obserra-website/pull/223) received new commits and remains open, mergeable, and unmerged at exact head `ad9a00119229eb06f0fd67ca426b17cb226dd0ed`.
- **Changed work:** the prior two workflow substitutions from `azure/login@v2` to exact `azure/login@v3.0.1` remain. The synchronization also updates `test/azure-production-plane-contract.test.mjs` to require v3.0.1 in both Azure workflows and explicitly reject v2. Current PR scope is three files, +7/−3; OIDC inputs, RBAC enforcement, deployment behavior, runtime bindings, aliases, payment, enrollment, and LMS controls are unchanged.
- **Source-gate evidence:** Website CI run [`32640292246`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640292246), Azure IaC Validation run [`32640292253`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640292253), and CodeQL Advanced run [`32640292252`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640292252) all completed successfully on the exact synchronized head. These source gates do not make the PR live.
- **Branch deployment evidence:** exact-head Vercel deployment `dpl_D2JuoevMNgNsNt3rFeAVkkV6xTwL` is `CANCELED`, has no production target, and is not live.
- **Canonical public proof:** at `2026-08-23T12:46:55.581Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and still identified exact canonical deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, expected project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. PR #223 is not canonical.
- **Public subsystem results:** Applications commerce returned HTTP `503`, `operational: false`, `durable-commerce-unavailable`; Academy commerce returned HTTP `503`, `operational: false`, with payment and durable storage unavailable; Florida LMS liveness returned HTTP `200` / `live`; Florida LMS readiness returned HTTP `503` / `not_ready`.
- **Blocker:** the Node 24 action upgrade is source-valid, but it does not create the missing Azure user-assigned managed identity `id-obserra-runtime-prod` or prove its required Key Vault role. The already-authorized runtime bootstrap remains blocked at that Azure infrastructure boundary.
- **Next safe action:** keep PR #223 unmerged until the chosen signed-main release path explicitly proceeds; independently converge and read back `id-obserra-runtime-prod` and its required Key Vault role, rerun the authorized bootstrap against exact authorized main, and require replacement-deployment plus canonical commerce/SHA proof before any live claim.


<!-- ops-checkpoint:2026-08-23-node24-pr-223-source-gates-passed -->
### 2026-08-23T12:47:59.787Z — PR #223 Node 24 upgrade source gates passed

- **Fresh source evidence:** PR #223 head `ad9a00119229eb06f0fd67ca426b17cb226dd0ed` completed Azure IaC Validation run `32640292253`, CodeQL Advanced run `32640292252`, and Website CI run `32640292246` successfully.
- **Vercel context interpretation:** its Vercel project preview context remains failed because the branch commit is unverified/canceled; it is not a production deployment and not a Node 24 runtime regression.
- **Merge discipline:** the passing source-only PR remains unmerged so `main` stays at the owner-authorized recovery SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2` until runtime identity recovery and its exact bootstrap rerun are independently proven.
- **Mutation state:** no production identity, Key Vault role, Vercel binding, deployment, canonical alias, payment, enrollment, or LMS state changed by these PR checks.


<!-- ops-checkpoint:2026-08-23-runtime-identity-recovery-validated -->
### 2026-08-23T12:49:09.300Z — runtime identity recovery contract independently validated

- **Root cause confirmed:** bootstrap run #6 authenticated the GitHub deployment identity and failed only because governed runtime identity `id-obserra-runtime-prod` is absent from `rg-obserra-prod-eastus`.
- **Authorized recovery contract:** in Azure Cloud Shell PowerShell, create that user-assigned identity only if it remains absent; verify the governed subscription/tenant and Key Vault RBAC prerequisite; grant the exact `Key Vault Secrets User` role definition `4633458b-17de-408a-b874-0445c86b69e6` only at canonical vault `kv-obserra-prod-38d660` scope if it remains absent; then read both back.
- **Data boundary:** this recovery creates no secret, reads no Key Vault secret value, and performs no Vercel mutation. The workflow can resume only after the non-secret identity/role verification marker is emitted.
- **Exact continuation:** choose `Re-run failed jobs` for Actions bootstrap run #6. That retains authorized `main` SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`; do not substitute the unmerged Node 24 PR.


<!-- ops-checkpoint:2026-08-23-pr-223-guarded-runtime-convergence-source -->
### 2026-08-23T12:58:51.585Z — PR #223 now carries the guarded runtime-identity convergence controller

- **Owner-directed execution:** the owner directed the team to perform the recovery directly. PR [#223](https://github.com/jblan2026-hub/obserra-website/pull/223) is open, mergeable, and unmerged at exact head `707e8f63934cb8818636e1ff4b2c4dad049d1513`, based on current authorized `main` `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Node maintenance:** both affected Azure workflows now use released `azure/login@v3.0.1`; the matching contract continues to reject `azure/login@v2`.
- **Narrow recovery behavior:** before any Vercel mutation, the runtime-bootstrap workflow may create only governed user-assigned identity `id-obserra-runtime-prod` and only after Azure returns a not-found result. It then waits for a tenant-matched client/principal ID, grants only role definition `4633458b-17de-408a-b874-0445c86b69e6` at canonical Key Vault `kv-obserra-prod-38d660` scope if absent, and requires readback. All non-not-found and authorization errors remain fail-closed.
- **Data and deployment boundary:** the source does not read or emit a Key Vault secret. No production Azure identity, Key Vault role, Vercel production binding, replacement deployment, alias, payment, enrollment, or LMS readiness mutation has occurred from the PR source update.
- **Current deployment observation:** no bootstrap-labelled Vercel deployment was returned during this source-only checkpoint.
- **Next safe action:** require fresh PR source gates on this exact head; if they pass, merge the owner-authorized guarded change to `main`. Its existing path trigger will then issue a new GitHub OIDC assertion and execute the real Azure/Vercel bootstrap, retaining every deployment and direct-commerce/canonical proof gate.


<!-- ops-checkpoint:2026-08-23-pr-223-synchronize-707e8f63 -->
### 2026-08-23T13:00:12.231Z — PR #223 synchronized; governed runtime-identity convergence added

- **Event:** pull request [#223](https://github.com/jblan2026-hub/obserra-website/pull/223) received new commits, was retitled `fix(runtime): converge Key Vault identity and upgrade Azure Login`, and remains open, mergeable, and unmerged at exact head `707e8f63934cb8818636e1ff4b2c4dad049d1513`.
- **Changed work:** three files, +128/−15. Both Azure workflows retain the exact `azure/login@v3.0.1` upgrade. The runtime-bootstrap workflow now creates `id-obserra-runtime-prod` only after Azure returns a true not-found result, requires tenant-matched nonempty client/principal IDs, assigns only the exact Key Vault Secrets User role at the canonical vault when missing, tolerates only an already-existing assignment, and requires bounded identity/role readback. Contract tests require these controls and explicitly prohibit Key Vault secret show, set, list, or download commands.
- **Source-gate evidence:** Website CI run [`32640931726`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931726), Azure IaC Validation run [`32640931658`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931658), and CodeQL Advanced run [`32640931697`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931697) all completed successfully on the exact head. These are source controls only.
- **Branch deployment evidence:** exact-head Vercel deployment `dpl_3wz7HThpEAUmrJ2pDos4GrREJqSf` is `CANCELED`, has no production target, and is not live.
- **Canonical public proof:** at `2026-08-23T13:00:12.231Z`, `GET https://www.obserrallc.com/api/health` returned HTTP `200` and still identified exact deployment `dpl_AJPPKARXHGqo3QACFwpdmng3KQXV`, exact SHA `5de3910bc104db9f41de48f816dde5bdf82dd6e2`, expected project `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and verified hosting/routing authority. PR #223 is not canonical.
- **Public subsystem results:** Applications commerce returned HTTP `503`, `operational: false`, `durable-commerce-unavailable`; Academy commerce returned HTTP `503`, `operational: false`, with payment and durable storage unavailable; Florida LMS liveness returned HTTP `200` / `live`; Florida LMS readiness returned HTTP `503` / `not_ready`.
- **Mutation and authorization state:** the synchronized branch has not executed the new Azure convergence. No Azure identity, role assignment, Vercel Production binding, deployment, alias, payment, enrollment, or LMS state changed. Existing bootstrap authorization remains pinned to exact current main `5de3910bc104db9f41de48f816dde5bdf82dd6e2`; PR #223 would produce a different main SHA if merged.
- **Next safe action:** merge exact PR #223 only through an explicitly authorized signed-main path, re-pin the production bootstrap authorization to the resulting exact main SHA, dispatch the guarded bootstrap, and require independent Azure identity/role readback, replacement-deployment evidence, direct Applications and Academy HTTP `200` with `operational: true`, and canonical exact deployment/SHA proof before any live claim.


<!-- ops-checkpoint:2026-08-23-pr-223-guarded-recovery-gates-passed -->
### 2026-08-23T13:00:51.738Z — guarded recovery source gates passed; merge authorization exercised

- **Exact source:** PR [#223](https://github.com/jblan2026-hub/obserra-website/pull/223) is open, mergeable, and unmerged at `707e8f63934cb8818636e1ff4b2c4dad049d1513`, still based on authorized `main` `5de3910bc104db9f41de48f816dde5bdf82dd6e2`.
- **Fresh required checks:** Website CI run [`32640931726`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931726), Azure IaC Validation run [`32640931658`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931658), and CodeQL Advanced run [`32640931697`](https://github.com/jblan2026-hub/obserra-website/actions/runs/32640931697) each completed successfully on that exact head. The unrelated Ops Applications Storage URL Convergence run was skipped.
- **Review result:** source verification confirms one not-found-gated identity-create path, one exact Key Vault role-assignment path with ServicePrincipal type and canonical vault scope, mandatory identity/role readbacks, released Node 24 Azure Login v3.0.1, and no Azure Key Vault secret command.
- **Rolling record automation:** an event-driven handoff writer now watches PR #223 commit/check/review/merge activity and is constrained to append evidence-only entries on `ops/live-handoff`; it has no authority to mutate production resources.
- **Merge action:** the owner-directed guarded release is being merged using this exact head SHA. The workflow path trigger, rather than a manual substitution, will issue the fresh GitHub OIDC assertion and execute the real Azure/Vercel bootstrap. No live success is inferred before those runtime gates return evidence.
