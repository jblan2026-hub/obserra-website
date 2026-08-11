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
11. The owner supplied the official Obserra logo in the conversation. The logo has not yet been committed as a governed LearnWorlds brand asset or applied in the LearnWorlds site builder.
12. The current ChatGPT environment has working GitHub authorization, but no native LearnWorlds app or logged-in LearnWorlds browser session. The current Vercel connector can see the Obserra team but cannot resolve the `obserra-website-live` project, so project-level Vercel authorization must be refreshed before direct deployment management can be claimed.

## Canonical email correction

The repository now governs:

```text
contactEmail=info@obserrallc.com
OBSERRA_OWNER_EMAIL=info@obserrallc.com
```

The configuration validator and regression tests reject `@icloud.com` addresses in the LearnWorlds integration configuration.

The LearnWorlds account itself must also be corrected because a logged-in user's email is controlled by LearnWorlds user identity, not by the website integration. The LearnWorlds admin should update the school-owner account under `Users -> All Users -> Edit User`, or sign out and use a clean private browser session for the learner purchase test.

## Authorized integration model

The approved method for allowing ChatGPT to perform governed LearnWorlds setup is a private, least-privilege API bridge rather than sharing passwords or secrets in chat.

### Existing authorization

1. GitHub is connected and permits repository and pull-request changes.
2. LearnWorlds API credentials and an access token exist and are stored in the Vercel Preview environment according to the owner.
3. No LearnWorlds secret is stored in GitHub, chat, screenshots, or this handoff.

### Required authorization steps

1. Reconnect the Vercel app in ChatGPT and authorize the Obserra team and the `obserra-website-live` project.
2. Build and deploy a private Obserra LearnWorlds Admin Bridge that reads LearnWorlds credentials only from the Vercel secret store.
3. Expose only allowlisted actions through the bridge, including read-only configuration checks, course and product lookup, user and enrollment verification, payment and certification status, and other actions that the current LearnWorlds public API explicitly supports.
4. Connect the bridge to ChatGPT as a private custom app using the Model Context Protocol.
5. Configure ChatGPT app permissions so reads may proceed automatically while every write or important action requires owner approval.
6. Log every bridge action with timestamp, actor, school ID, requested operation, redacted result, and failure evidence.
7. Revoke the temporary LearnWorlds access token after setup and replace it with a narrowly governed production token only if ongoing synchronization is required.

### Prohibited authorization methods

1. Do not paste the LearnWorlds password, Client Secret, access token, Stripe secret, or Vercel token into chat.
2. Do not create an unrestricted permanent administrator credential for ChatGPT.
3. Do not grant automatic approval for destructive, financial, publication, deletion, or user-identity actions.
4. Do not treat a repository environment variable as authority to alter the LearnWorlds owner account or browser session.

### UI-only limitation

The LearnWorlds public API is authorized for supported API entities, but this handoff does not yet contain evidence that the API can modify the school-owner email, topbar, footer, theme, favicon, or all site-builder branding. Until a supported endpoint is proven, those items remain one-time LearnWorlds UI actions performed by the owner or by an authorized human administrator in a logged-in browser session.

## Important sandbox boundary

`LEARNWORLDS_SANDBOX_MODE=true` is an Obserra routing control. It allows a product marked `sandbox` to be routed from the Preview website. It does not independently place the LearnWorlds Stripe payment gateway into test mode.

Do not complete the payment until the LearnWorlds Stripe gateway itself is confirmed in Sandbox or Test mode. A real `$99` checkout may otherwise create a real charge.

## Acceptance sequence

1. Correct the LearnWorlds school-owner/user email to `info@obserrallc.com`, or sign out and use a clean private browser session.
2. Confirm the LearnWorlds Stripe gateway is in Sandbox or Test mode.
3. Reauthorize the Vercel app for the correct Obserra project.
4. Deploy the private LearnWorlds Admin Bridge and connect it as a custom ChatGPT app.
5. Run a read-only school and canary-product verification through the bridge.
6. Redeploy the Preview branch after the environment-variable changes.
7. Open the Preview Academy course page and start enrollment.
8. Confirm the redirect reaches the governed LearnWorlds direct-checkout URL.
9. Complete one sandbox purchase.
10. Confirm the test learner is created or identified under the intended email.
11. Confirm the learner receives enrollment and can open the course.
12. Complete the assessment and verify certificate issuance.
13. Record the evidence before changing the course mapping from `sandbox` to `published`.

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

### Failure: Vercel connector cannot resolve the production project

**Evidence:** The current Vercel connector can identify the Obserra team but returns project-not-found for `obserra-website-live`.

**Impact:** ChatGPT cannot currently inspect, deploy, or manage that Vercel project through the connected Vercel app.

**Correction:** Reconnect Vercel in ChatGPT and grant access to the Obserra team and project.

**Prevention:** Verify project discovery through the connector before claiming project-level deployment authority.

## Truth boundary

The LearnWorlds checkout route is reached. The canonical email is governed in code. GitHub changes can be performed. Direct LearnWorlds UI control and Vercel project control are not currently authorized in this chat. A sandbox transaction, enrollment, course access, assessment, and certificate have not yet been proven. Production cutover and pull-request merge remain blocked until those acceptance gates pass.