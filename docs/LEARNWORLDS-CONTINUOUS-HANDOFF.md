# Obserra Academy LearnWorlds Continuous Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Production cutover:** Not authorized  

## Authoritative current state

1. The LearnWorlds school is `Obserra EPI Academy` with school ID `6a7a693d353feb69c94c7654`.
2. The primary school URL is `https://obserraepillc.learnworlds.com`.
3. The governed API URL is `https://obserraepillc.learnworlds.com/admin/api/`.
4. The owner confirmed a LearnWorlds premium subscription, Stripe connection, API credentials, an access token, and the custom-domain CNAME.
5. The owner confirmed that the required LearnWorlds Preview environment variables were entered in Vercel. Secret values were not disclosed in chat or committed to GitHub.
6. The canonical Academy business and owner email is `info@obserrallc.com`. The consumer address `jblan006@icloud.com` is prohibited from governed Academy configuration and business-facing Academy records.
7. The Cybersecurity Foundations canary is mapped to the owner-supplied LearnWorlds course, store product, package, public page, direct checkout page, and cart page.
8. The owner reached the correct LearnWorlds course payment page from the integration flow. This proves that the Preview route and governed product mapping can reach LearnWorlds checkout.
9. The email displayed on the LearnWorlds payment page came from the currently signed-in LearnWorlds user session. It is not populated by the Obserra website mapping or by a Vercel owner-email variable.
10. The LearnWorlds checkout still displays legacy `Driving Data` branding. Production publication is blocked until the topbar, footer, logos, favicon, colors, contact identity, and legal presentation are corrected.
11. Website CI, the Academy 70x Production Gate, and the Application Production Pipeline passed on prior corrected branch heads. Pull request 55 remains draft and unmerged pending the complete sandbox acceptance test.
12. The owner supplied the official Obserra logo in the conversation. It remains the required source brand asset. It has not yet been applied in the LearnWorlds visual builder.

## Repository implementation completed

The branch currently contains:

1. A non-secret LearnWorlds school, API, business-email, and product-mapping configuration.
2. A fail-closed server-side LearnWorlds configuration adapter.
3. Governed direct-checkout routing from the Obserra website to LearnWorlds.
4. Validation of approved hosts, API path, product path, course identity, store-product identity, package identity, business email, and uniqueness.
5. A website-managed Stripe rollback path retained until owner-approved cutover.
6. An owner-only readiness endpoint.
7. Deployment environment templates that keep secrets outside source control.
8. LearnWorlds routing, API, mapping, email, and secret-boundary tests.
9. LearnWorlds configuration validation in the Academy release gate.
10. Continuous implementation and failure-audit documentation.

## Canonical business identity

The repository governs:

```text
contactEmail=info@obserrallc.com
OBSERRA_OWNER_EMAIL=info@obserrallc.com
```

The configuration validator and regression tests reject `@icloud.com` addresses in the LearnWorlds integration configuration.

The LearnWorlds account itself must be corrected separately because LearnWorlds is the authoritative identity system for the signed-in owner and learner account. The owner must update the school-owner or test-user account under `Users -> All Users -> Edit User`, or use a signed-out private browser session for a distinct learner test.

## Authorized integration model

The approved authorization method is a private, least-privilege API bridge rather than sharing passwords or secret values in chat.

```text
ChatGPT
-> private Obserra LearnWorlds Admin Bridge
-> LearnWorlds API
-> Obserra EPI Academy
```

### Existing authorization

1. GitHub is connected and permits repository, branch, pull-request, and CI work.
2. LearnWorlds credentials exist and are reportedly stored in the Vercel Preview environment.
3. The Vercel ChatGPT app is installed and advertises read and write capabilities.
4. The Vercel ChatGPT app currently follows the global permission mode `Allow low-risk actions`. This is acceptable. `Never ask` is not required and should not be enabled.
5. No LearnWorlds, Stripe, Vercel, or GitHub secret is stored in the repository, chat, screenshots, or this handoff.

## Latest Vercel authorization evidence

The owner displayed the Vercel app capability screen in ChatGPT. A direct connector verification was then performed.

### Proven results

```text
Vercel app installed: yes
Vercel app advertises writes: yes
ChatGPT app permission: Use my default
Global app permission: Allow low-risk actions
Obserra team discovered: yes
Obserra team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
Projects returned for Obserra team: 0
Direct lookup of obserra-website-live: 404 Not Found
```

### Finding

The screenshot proves that the Vercel app exists and has tool capabilities. It does not prove that the OAuth installation is authorized for any Vercel project. The connector can see the Obserra team but still cannot list or retrieve `obserra-website-live`.

### Required correction

In the Vercel dashboard, under the Obserra team:

```text
Team Settings
-> Integrations or Installed Apps
-> Vercel MCP or ChatGPT connection
-> Configure or Manage Access
-> Project access
-> Select obserra-website-live, or All Projects
-> Save
```

Then disconnect and reconnect the Vercel app in ChatGPT so the new project scope is issued to the connector.

The ChatGPT app permission may remain at `Allow low-risk actions` or `Any changes`. Do not enable unrestricted `Never ask` authority.

## Private LearnWorlds Admin Bridge requirements

After Vercel project discovery succeeds, the bridge will be deployed with these controls:

1. Read LearnWorlds credentials only from the Vercel secret store.
2. Lock all requests to school ID `6a7a693d353feb69c94c7654`.
3. Lock business identity to `info@obserrallc.com`.
4. Restrict outbound requests to the governed LearnWorlds host and `/admin/api` path.
5. Expose only named allowlisted operations.
6. Permit read operations without destructive authority.
7. Require owner approval for every write or important action.
8. Block deletion, live publication, financial changes, user-identity changes, and production cutover by default.
9. Redact credentials and personal data from logs and responses.
10. Record every action, result, and failure in an append-only audit ledger and this continuous handoff.
11. Support immediate token revocation.

Initial read-only bridge operations:

```text
get_school_status
get_course
list_courses
get_product_mapping
get_user
verify_enrollment
verify_payment
verify_completion
verify_certificate
```

Write operations will be added individually only after the relevant LearnWorlds API operation is proven and owner approval controls are in place.

## UI-only limitations

No evidence currently proves that the LearnWorlds public API can modify all of these items:

```text
school-owner email
topbar logo
footer logo
theme
favicon
payment-page visual layout
legacy Driving Data branding
```

Until a supported API endpoint is proven, these remain one-time LearnWorlds dashboard actions performed by the owner or another authorized human administrator in a logged-in browser session.

## Important sandbox boundary

`LEARNWORLDS_SANDBOX_MODE=true` is an Obserra routing control. It allows a product marked `sandbox` to be routed from the Preview website. It does not independently place the LearnWorlds Stripe gateway into test mode.

Do not complete the payment until the LearnWorlds payment gateway itself is confirmed in Sandbox or Test mode. A real `$99` checkout may otherwise create a real charge.

## Acceptance sequence

1. Grant the Vercel connector project access to `obserra-website-live` and retest project discovery.
2. Correct the LearnWorlds school-owner or test-user email to `info@obserrallc.com`.
3. Set LearnWorlds Contact, Support, and Sales email fields to `info@obserrallc.com`.
4. Replace all `Driving Data` branding with the official Obserra identity.
5. Confirm LearnWorlds Stripe Sandbox or Test mode.
6. Verify the custom domain and HTTPS.
7. Deploy the private LearnWorlds Admin Bridge and connect it as a private ChatGPT custom app.
8. Run a read-only school, course, and product verification through the bridge.
9. Redeploy the Preview branch with the confirmed environment values.
10. Open the Preview Academy course page and start enrollment.
11. Confirm the redirect reaches the governed LearnWorlds direct-checkout URL.
12. Complete one sandbox purchase.
13. Confirm the test learner exists under the intended business-controlled email.
14. Confirm the learner receives enrollment and can open the course.
15. Complete the assessment and verify certificate issuance.
16. Record the complete evidence before changing the course mapping from `sandbox` to `published`.

## Failure and prevention summary

### Wrong email displayed at checkout

**Evidence:** `jblan006@icloud.com` appeared instead of `info@obserrallc.com`.

**Root cause:** The active LearnWorlds browser session belonged to the personal-email user.

**Prevention:** Third-party user identity must be corrected in the authoritative identity system. Deployment variables do not overwrite a signed-in LearnWorlds profile.

### Legacy branding displayed at checkout

**Evidence:** The checkout page displayed `Driving Data` in the topbar and footer.

**Prevention:** Production publication requires a visual acceptance gate covering school name, logo, favicon, colors, business email, product identity, price, footer, receipt, learner account, and certificate.

### Obserra sandbox flag mistaken for payment sandbox

**Evidence:** The route reached a priced payment page.

**Prevention:** Commercial acceptance requires separate proof of route sandbox state and payment-provider test state.

### Vercel app installed without project visibility

**Evidence:** The connector sees the Obserra team but returns zero projects and a 404 for `obserra-website-live`.

**Root cause:** The app capability installation is present, but project-level OAuth scope is absent or incomplete.

**Prevention:** Always verify `list_projects` and `get_project` through the connector before claiming Vercel project authority.

## Truth boundary

The LearnWorlds checkout route is reached. The canonical email and canary mapping are governed in code. GitHub changes and CI inspection can be performed. The Vercel connector still lacks project access, and direct LearnWorlds UI control is not available in this chat. A sandbox transaction, enrollment, course access, assessment, and certificate have not yet been proven. Production cutover and pull-request merge remain blocked until those acceptance gates pass.
