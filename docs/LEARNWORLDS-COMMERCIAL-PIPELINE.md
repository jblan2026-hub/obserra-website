# Obserra Academy LearnWorlds Commercial Pipeline

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Status:** Implementation branch active  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**School ID:** `6a7a693d353feb69c94c7654`  
**School name:** `Obserra EPI Academy`  
**Primary school URL:** `https://obserraepillc.learnworlds.com`  
**Author dashboard:** `https://obserraepillc.learnworlds.com/author/dashboard`  
**Custom domain:** `https://academy.obserrallc.com`  

## Confirmed account state

1. LearnWorlds premium subscription confirmed by the owner.
2. Stripe connected in LearnWorlds.
3. LearnWorlds API keys created.
4. LearnWorlds access token created.
5. Academy custom-domain CNAME created.
6. No LearnWorlds, Stripe, or Clerk secrets are stored in this repository.

## Governing architecture

The Obserra website remains the public discovery, marketing, and search engine optimization surface. LearnWorlds becomes the authoritative Academy commerce and learner-delivery system.

```text
Obserra website course page
→ governed checkout route
→ LearnWorlds product page and checkout
→ LearnWorlds learner identity and enrollment
→ course delivery
→ assessment
→ certificate
→ LearnWorlds reporting
```

The existing website-managed Stripe path is retained behind a deployment feature flag until the LearnWorlds sandbox canary passes. This prevents an irreversible cutover before payment, access, assessment, and certificate behavior are proven.

## Implemented on this branch

1. Added `config/learnworlds-products.json` for non-secret school and course-product mappings.
2. Added a fail-closed LearnWorlds configuration adapter in `lib/learnworlds.ts`.
3. Updated the existing Academy checkout route to support LearnWorlds without requiring website Stripe secrets.
4. Preserved the legacy website Stripe path until owner-approved cutover.
5. Added an owner-only LearnWorlds readiness endpoint at `/api/admin/learnworlds/status`.
6. Added LearnWorlds deployment variables to `.env.example`.
7. Added LearnWorlds routing and secret-boundary regression tests.
8. Added a configuration validator and included it in the Academy release gate.

## Required deployment secrets

Enter these only in the Vercel project or another approved secret manager:

```text
LEARNWORLDS_API_URL
LEARNWORLDS_CLIENT_ID
LEARNWORLDS_CLIENT_SECRET
LEARNWORLDS_ACCESS_TOKEN
```

For the sandbox canary, set:

```text
ACADEMY_COMMERCE_PROVIDER=learnworlds
LEARNWORLDS_SANDBOX_MODE=true
```

Do not paste any secret into chat, GitHub, screenshots, documentation, or source files.

## Current blocker

The canary course mapping cannot be completed until the owner supplies the non-secret LearnWorlds Product ID and public product URL for:

```text
cybersecurity-foundations
```

The product should remain Draft or sandbox-controlled until the acceptance test is complete.

## Canary acceptance gate

1. The product mapping passes validation.
2. The branch passes lint, tests, LearnWorlds validation, existing Academy gates, and production build.
3. The deployment status endpoint reports `readyForSandboxCanary=true`.
4. The Obserra website enrollment action redirects to the mapped LearnWorlds product.
5. A LearnWorlds sandbox purchase succeeds.
6. The test learner receives course access.
7. The assessment and certificate operate correctly.
8. The product remains non-public until owner approval.
9. The custom domain resolves with valid HTTPS.
10. Only after all gates pass may `LEARNWORLDS_SANDBOX_MODE` be disabled and the product status be changed to `published`.

## Rollback

Set:

```text
ACADEMY_COMMERCE_PROVIDER=website-stripe
```

This restores the existing website-managed Stripe route without deleting LearnWorlds mappings or learner data.
