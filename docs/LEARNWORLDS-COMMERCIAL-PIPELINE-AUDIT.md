# LearnWorlds Commercial Pipeline Audit Record

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Status:** Canary mapped, preview configuration entered, sandbox cutover not authorized  

## Recorded owner inputs

1. LearnWorlds school ID: `6a7a693d353feb69c94c7654`.
2. School name: `Obserra EPI Academy`.
3. Primary school URL: `https://obserraepillc.learnworlds.com`.
4. Author dashboard URL: `https://obserraepillc.learnworlds.com/author/dashboard`.
5. LearnWorlds premium subscription confirmed.
6. Stripe connected.
7. LearnWorlds API keys created.
8. LearnWorlds access token created.
9. LearnWorlds API URL: `https://obserraepillc.learnworlds.com/admin/api/`.
10. Custom-domain CNAME created for `academy.obserrallc.com`.
11. Canary Obserra course ID: `cybersecurity-foundations`.
12. LearnWorlds course ID: `cybersecurity-foundations-for-new-professionals`.
13. LearnWorlds store product ID: `cybersecurity_foundations_for_new_professionals`.
14. LearnWorlds package ID: `package_6a7b2d3710387`.
15. Public course URL: `https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals`.
16. Direct checkout URL and cart URL supplied by the owner and recorded in the governed mapping.
17. Required Obserra business email: `info@obserrallc.com`.
18. The personal address `jblan006@icloud.com` is prohibited from business-facing Academy checkout, school contact, support, sales, and invoice presentation.
19. The owner reported that all LearnWorlds Preview environment variables were entered in Vercel.

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
20. Added the LearnWorlds API URL as governed non-secret configuration.
21. Added API hostname and `/admin/api` path validation.
22. Reduced Vercel secret entry to the Client ID, Client Secret, and access token.
23. Corrected stale Academy release-gate price assertions to match the governed catalog and dedicated pricing parity tests.
24. Triggered fresh workflow cycles from corrected branch heads.
25. Recorded the owner-reported completion of Preview environment-variable entry.
26. Reviewed the owner-provided LearnWorlds checkout screenshot and identified the personal-email and legacy-branding defects before any production purchase.

## Failures, corrections, and prevention rules

### Failure 1: Canary Product ID was not mapped

**Evidence:** The original `config/learnworlds-products.json` had an empty `products` array.

**Impact:** LearnWorlds checkout failed closed for every course.

**Correction:** The owner supplied the LearnWorlds course ID, store product ID, package ID, public URL, checkout URL, and cart URL. The canary is now mapped with status `sandbox`.

**Prevention:** The release validator requires the `cybersecurity-foundations` canary, rejects malformed or duplicate identifiers, and verifies every URL against the governed host, path, course ID, product type, and package ID.

### Failure 2: Deployment secrets were not yet proven in the Vercel runtime

**Evidence:** API keys and access token existed in LearnWorlds, but no Vercel project secret-entry proof was initially available.

**Impact:** The owner-only readiness endpoint reports `apiEnvironmentReady=false` until the three secret values are present in the deployed Preview environment.

**Correction:** The owner reported entering the LearnWorlds Client ID, Client Secret, and access token in the Vercel Preview environment. This remains owner-reported until the deployed readiness endpoint proves it.

**Prevention:** Never place these values in chat or source control. Deployment readiness must be verified through the owner-only status endpoint.

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

### Failure 7: Academy release gate asserted obsolete price tiers

**Evidence:** The Academy 70x workflow expected Foundation through CISO Masterclass prices of 149, 249, 349, 499, and 699, while `courseData.ts`, the pricing parity tests, and the approved launch pricing use 99, 149, 199, 249, and 299.

**Impact:** The Academy production gate failed five assertions even though the catalog pricing matched its current governed source and dedicated regression tests.

**Correction:** Updated only the stale price assertions in `scripts/academy-70x-gate.mjs` to match the governed launch tiers. No course price was changed.

**Prevention:** Pricing gates must derive from or remain synchronized with the canonical pricing contract. A release test may not silently preserve superseded price assumptions.

### Failure 8: API URL was treated as an unset secret-like deployment value

**Evidence:** The initial environment template left `LEARNWORLDS_API_URL` empty even though the owner supplied a stable non-secret school API endpoint.

**Impact:** Vercel setup required an unnecessary fourth manual value and readiness could fail despite correct credentials.

**Correction:** Added `https://obserraepillc.learnworlds.com/admin/api/` to governed configuration and the environment template, with host and path validation. Runtime readiness now requires only the three actual secret values.

**Prevention:** Stable non-secret integration endpoints belong in governed configuration; secrets remain only in the deployment secret store.

### Failure 9: Personal email exposed on the business checkout

**Evidence:** The owner-provided LearnWorlds payment-screen screenshot displayed `jblan006@icloud.com` in User details.

**Impact:** A personal address would be associated with the business test purchase and could appear in purchaser, receipt, enrollment, or account records.

**Correction required:** Change the LearnWorlds school-owner or test-user email to `info@obserrallc.com`, verify the new email, sign out, sign back in, and repeat the sandbox checkout. Also set the LearnWorlds school Contact, Support, and Sales email fields to `info@obserrallc.com`.

**Prevention:** Business acceptance testing must use a business-controlled account. Personal email addresses are prohibited from Academy purchaser, school-contact, support, sales, invoice, and test-enrollment records.

### Failure 10: Checkout still shows legacy `Driving Data` branding

**Evidence:** The payment screenshot displays `Driving Data` in the topbar and footer rather than Obserra EPI Academy.

**Impact:** The checkout is not production-ready and could confuse buyers or weaken commercial trust.

**Correction required:** Replace the topbar and footer logos, school logo, favicon, color theme, and payment-page branding with the approved Obserra identity before live checkout.

**Prevention:** A visual acceptance gate must confirm Obserra name, logo, colors, contact email, product title, price, and legal footer on the public course page, cart, checkout, receipt, learner account, and certificate.

## Current blockers

1. The deployed owner-only readiness endpoint has not yet proven the Vercel Preview secret configuration.
2. The LearnWorlds school-owner or test-user email must be changed from `jblan006@icloud.com` to `info@obserrallc.com` and verified.
3. LearnWorlds Contact, Support, and Sales email fields must be set to `info@obserrallc.com`.
4. Legacy `Driving Data` branding must be removed from the checkout topbar, footer, logo, favicon, and theme.
5. The custom domain CNAME has been created but LearnWorlds HTTPS verification has not yet been proven complete.
6. A sandbox checkout, learner enrollment, course access, assessment, and certificate acceptance test has not yet been completed with the corrected business identity.
7. Owner approval for production publication and live checkout has not been given.

## Truth boundary

The branch contains implemented integration code, a governed API endpoint, and a governed sandbox canary mapping. LearnWorlds commerce is not live. No secret is stored in the repository. No production checkout cutover is authorized. The next factual milestone is corrected business identity and branding, deployed readiness proof, and a complete sandbox purchase and learner-access test.