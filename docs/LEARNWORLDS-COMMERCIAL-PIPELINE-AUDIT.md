# LearnWorlds Commercial Pipeline Audit Record

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Status:** Canary mapped, build validation in progress, sandbox cutover not authorized  

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
10. Canary Obserra course ID: `cybersecurity-foundations`.
11. LearnWorlds course ID: `cybersecurity-foundations-for-new-professionals`.
12. LearnWorlds store product ID: `cybersecurity_foundations_for_new_professionals`.
13. LearnWorlds package ID: `package_6a7b2d3710387`.
14. Public course URL: `https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals`.
15. Direct checkout URL and cart URL supplied by the owner and recorded in the governed mapping.

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
12. Opened draft pull request 55 for governed review and continuous integration.
13. Inspected the first pull-request workflow failures and corrected both identified defects.
14. Mapped the Cybersecurity Foundations canary to the supplied LearnWorlds course, store product, package, public, checkout, and cart identifiers.
15. Changed the enrollment target from the public product page to the governed direct checkout URL.
16. Added hostname allowlisting for the primary LearnWorlds school domain and the approved custom Academy domain.
17. Added deterministic checks binding the public, checkout, and cart URLs to the governed LearnWorlds course and package identifiers.
18. Added duplicate course, store product, and package prevention.
19. Added exact canary mapping regression tests.
20. Triggered a fresh workflow cycle from the corrected branch head.

## Failures, corrections, and prevention rules

### Failure 1: Canary Product ID was not mapped

**Evidence:** The original `config/learnworlds-products.json` had an empty `products` array.

**Impact:** LearnWorlds checkout failed closed for every course.

**Correction:** The owner supplied the LearnWorlds course ID, store product ID, package ID, public URL, checkout URL, and cart URL. The canary is now mapped with status `sandbox`.

**Prevention:** The release validator requires the `cybersecurity-foundations` canary, rejects malformed or duplicate identifiers, and verifies every URL against the governed host, path, course ID, product type, and package ID.

### Failure 2: Deployment secrets are not yet in the Vercel runtime

**Evidence:** API keys and access token exist in LearnWorlds, but no Vercel project secret-entry proof is available in this branch.

**Impact:** The owner-only readiness endpoint will report `apiEnvironmentReady=false` until the secrets are entered in the deployment environment.

**Required correction:** Enter the four LearnWorlds values directly in the Vercel secret store. Never place them in chat or source control.

### Failure 3: Container-side repository testing unavailable

**Evidence:** The build container could not resolve `github.com` when attempting to clone the branch.

**Impact:** Local container execution was not available as a validation route.

**Correction:** Repository validation is enforced through committed Node tests, the LearnWorlds validator, existing Academy quality gates, and the pull-request CI path.

**Prevention:** Do not claim a passing build until GitHub or deployment CI reports the exact branch checks as successful.

### Failure 4: Public status wording triggered the secret-marker test

**Evidence:** The first Website CI run failed because `apiStatus` contained the phrase `access-token-created`, which matched the test pattern intended to detect secret-bearing configuration.

**Impact:** Unit tests failed before lint and build execution.

**Correction:** Replaced the public status value with `credentials-created-secrets-not-stored-in-repository` while retaining the account setup fact only in this audit record.

**Prevention:** Public configuration status values must not contain names that resemble secret fields, even when no secret value is present.

### Failure 5: Existing certificate label regression blocked the pull request

**Evidence:** The first Website CI run also failed an existing certificate test requiring the exact label `Course Version`; the component rendered `Course version`.

**Impact:** Unit tests failed independently of the LearnWorlds integration.

**Correction:** Restored the exact governed label `Course Version` in both certificate presentation locations.

**Prevention:** Preserve exact certificate identity labels covered by regression tests. Do not treat capitalization changes as cosmetic when the certificate contract governs them.

### Failure 6: Initial product mapping contract was too weak for direct checkout

**Evidence:** The first adapter stored only an Obserra course ID, one product ID, a public URL, and status. It did not bind the direct checkout and cart URLs to the LearnWorlds course ID and package ID.

**Impact:** A malformed or substituted URL could have redirected enrollment to the wrong product or package.

**Correction:** Added separate LearnWorlds course, store product, and package identifiers; governed public, checkout, and cart URLs; allowed-host enforcement; exact path validation; and query-parameter identity checks.

**Prevention:** All future course mappings must pass the same host, path, product type, course ID, package ID, uniqueness, and sandbox or publication-state controls.

## Current blockers

1. LearnWorlds secret values have not been proven present in the Vercel deployment environment.
2. The current pull-request CI cycle has not yet been proven green.
3. The custom domain CNAME has been created but LearnWorlds HTTPS verification has not yet been proven complete.
4. A sandbox checkout, learner enrollment, course access, assessment, and certificate acceptance test has not yet been completed.
5. Owner approval for production publication and live checkout has not been given.

## Truth boundary

The branch contains implemented integration code and a governed sandbox canary mapping. LearnWorlds commerce is not live. No secret is stored in the repository. No production checkout cutover is authorized. The next factual milestone is successful CI, deployment secret configuration, and a complete sandbox purchase and learner-access test.
