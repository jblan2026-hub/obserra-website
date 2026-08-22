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
