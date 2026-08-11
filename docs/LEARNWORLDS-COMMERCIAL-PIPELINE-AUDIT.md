# LearnWorlds Commercial Pipeline Audit Record

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Status:** Build in progress, sandbox cutover not authorized  

## Recorded owner inputs

1. LearnWorlds school ID: `6a7a693d353feb69c94c7654`.
2. School name: `Obserra EPI Academy`.
3. Primary school URL: `https://obserraepillc.learnworlds.com`.
4. Author dashboard URL: `https://obserraepillc.learnworlds.com/author/dashboard`.
5. LearnWorlds premium subscription confirmed.
6. Stripe connected.
7. LearnWorlds API keys created.
8. LearnWorlds access token created.
9. Custom-domain CNAME created for `academy.obserrallc.com`.

## Actions completed

1. Created the implementation branch from `main`.
2. Added a non-secret LearnWorlds school and product-mapping configuration.
3. Added a server-only, fail-closed configuration adapter.
4. Added governed provider selection through `ACADEMY_COMMERCE_PROVIDER`.
5. Updated Academy checkout so LearnWorlds routing occurs before website Stripe secret validation.
6. Preserved the website Stripe path as rollback until the sandbox canary passes.
7. Added an owner-only readiness endpoint.
8. Added deployment secret placeholders without storing values.
9. Added configuration and routing regression tests.
10. Added a configuration validator to the Academy release gate.
11. Recorded domain and API setup status.

## Current failures and blockers

### Blocker 1: Canary Product ID is not mapped

**Evidence:** `config/learnworlds-products.json` has an empty `products` array.

**Impact:** LearnWorlds checkout remains fail-closed for every course. The website cannot redirect a learner to a specific product until a Product ID and public product URL are mapped.

**Required correction:** Create or open the Cybersecurity Foundations course in LearnWorlds and supply its non-secret Product ID and public URL.

**Prevention:** The release validator rejects malformed, duplicate, credential-bearing, or unsupported product mappings. Sandbox products are accepted only when `LEARNWORLDS_SANDBOX_MODE=true`.

### Blocker 2: Deployment secrets are not yet in the Vercel runtime

**Evidence:** API keys and access token exist in LearnWorlds, but no Vercel project connection or secret-entry proof is available in this branch.

**Impact:** The owner-only readiness endpoint will report `apiEnvironmentReady=false` until the secrets are entered in the deployment environment.

**Required correction:** Enter the four LearnWorlds values directly in the Vercel secret store. Never place them in chat or source control.

### Blocker 3: Container-side repository testing unavailable

**Evidence:** The build container could not resolve `github.com` when attempting to clone the branch.

**Impact:** Local container execution was not available as a validation route.

**Correction:** Repository validation is enforced through committed Node tests, the LearnWorlds validator, existing Academy quality gates, and the pull-request CI path.

**Prevention:** Do not claim a passing build until GitHub or deployment CI reports the exact branch checks as successful.

## Truth boundary

The branch contains implemented integration code. LearnWorlds commerce is not live. No secret is stored in the repository. No course is mapped. No production checkout cutover is authorized. The next factual milestone is a mapped sandbox canary followed by successful CI and a test purchase.
