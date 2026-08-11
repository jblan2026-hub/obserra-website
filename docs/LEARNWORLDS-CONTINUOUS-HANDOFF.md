# Obserra Academy LearnWorlds Continuous Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Production cutover:** Not authorized  

## Current factual state

1. The LearnWorlds school is `Obserra EPI Academy` with school ID `6a7a693d353feb69c94c7654`.
2. The primary school URL is `https://obserraepillc.learnworlds.com`.
3. The governed API URL is `https://obserraepillc.learnworlds.com/admin/api/`.
4. The owner confirmed a LearnWorlds premium subscription, Stripe connection, API credentials, an access token, and the custom-domain CNAME.
5. The owner confirmed the required Preview environment variables were entered in Vercel. Secret values were not disclosed in chat or committed to the repository.
6. The canonical Academy business and owner email is `info@obserrallc.com`. The consumer address `jblan006@icloud.com` is prohibited from governed Academy configuration.
7. The Cybersecurity Foundations canary is mapped to the owner-supplied LearnWorlds course, store product, package, public page, direct checkout page, and cart page.
8. The owner reached the LearnWorlds course payment screen from the integration flow. This proves that the route and product mapping can reach LearnWorlds checkout.
9. The email displayed on the LearnWorlds payment screen came from the currently signed-in LearnWorlds user session. It is not populated by the Obserra website mapping or by the Vercel owner-email variable.
10. Website CI and the Academy 70x Production Gate passed on the email-governed branch head. The pull request remains draft and unmerged.

## Canonical email correction

The repository now governs:

```text
contactEmail=info@obserrallc.com
OBSERRA_OWNER_EMAIL=info@obserrallc.com
```

The configuration validator and regression tests reject `@icloud.com` addresses in the LearnWorlds integration configuration.

The LearnWorlds account itself must also be corrected because a logged-in user's email is controlled by LearnWorlds user identity, not by the website integration. The LearnWorlds admin should update the school-owner account under `Users -> All Users -> Edit User`, or sign out and use a clean private browser session for the learner purchase test.

## Important sandbox boundary

`LEARNWORLDS_SANDBOX_MODE=true` is an Obserra routing control. It allows a product marked `sandbox` to be routed from the Preview website. It does not independently place the LearnWorlds Stripe payment gateway into test mode.

Do not complete the payment until the LearnWorlds Stripe gateway itself is confirmed in Sandbox or Test mode. A real `$99` checkout may otherwise create a real charge.

## Acceptance sequence

1. Correct the LearnWorlds school-owner/user email to `info@obserrallc.com`, or sign out and use a clean private browser session.
2. Confirm the LearnWorlds Stripe gateway is in Sandbox or Test mode.
3. Redeploy the Preview branch after the environment-variable changes.
4. Open the Preview Academy course page and start enrollment.
5. Confirm the redirect reaches the governed LearnWorlds direct-checkout URL.
6. Complete one sandbox purchase.
7. Confirm the test learner is created or identified under the intended email.
8. Confirm the learner receives enrollment and can open the course.
9. Complete the assessment and verify certificate issuance.
10. Record the evidence before changing the course mapping from `sandbox` to `published`.

## Failures and prevention rules

### Failure: Wrong email displayed at checkout

**Evidence:** The payment screen displayed `jblan006@icloud.com` instead of `info@obserrallc.com`.

**Root cause:** The browser was signed in to LearnWorlds with the iCloud-address user. LearnWorlds prefilled the payment page from that active identity session.

**Correction:** Govern `info@obserrallc.com` in the repository and Vercel owner-email setting, then separately update the LearnWorlds user identity or use a signed-out private session.

**Prevention:** Never assume deployment environment variables overwrite a third-party platform user profile. Identity changes must be applied in the authoritative identity system.

### Failure risk: Obserra sandbox flag mistaken for payment sandbox

**Evidence:** The integration route reached a payment page with a commercial price.

**Risk:** `LEARNWORLDS_SANDBOX_MODE=true` controls routing only and does not prove the LearnWorlds Stripe gateway is in test mode.

**Correction:** Confirm LearnWorlds payment-gateway Sandbox or Test mode before submitting the payment form.

**Prevention:** Commercial acceptance tests require separate evidence for routing mode and payment-provider mode.

## Truth boundary

The LearnWorlds checkout route is reached. The canonical email is governed in code. A sandbox transaction, enrollment, course access, assessment, and certificate have not yet been proven. Production cutover and pull-request merge remain blocked until those acceptance gates pass.
