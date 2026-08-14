# Obserra Academy LearnWorlds Commercial Pipeline

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Status:** Canary mapped; CI and sandbox acceptance pending  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
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
6. Cybersecurity Foundations canary course created in LearnWorlds.
7. Public, checkout, cart, course, store product, and package identifiers supplied.
8. No LearnWorlds, Stripe, or Clerk secrets are stored in this repository.

## Governing architecture

The Obserra website remains the public discovery, marketing, and search engine optimization surface. LearnWorlds becomes the authoritative Academy commerce and learner-delivery system.

```text
Obserra website course page
→ governed Academy checkout route
→ LearnWorlds direct checkout
→ LearnWorlds learner identity and enrollment
→ course delivery
→ assessment
→ certificate
→ LearnWorlds reporting
```

The existing website-managed Stripe path is retained behind a deployment feature flag until the LearnWorlds sandbox canary passes. This prevents an irreversible cutover before payment, access, assessment, and certificate behavior are proven.

## Governed canary mapping

```text
Obserra course ID:
cybersecurity-foundations

LearnWorlds course ID:
cybersecurity-foundations-for-new-professionals

LearnWorlds store product ID:
cybersecurity_foundations_for_new_professionals

LearnWorlds package ID:
package_6a7b2d3710387

Public URL:
https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals

Direct checkout URL:
https://obserraepillc.learnworlds.com/payment?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387

Cart URL:
https://obserraepillc.learnworlds.com/cart?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387

Mapping status:
sandbox
```

The website enrollment route targets the governed direct checkout URL. The adapter rejects unapproved hosts, incorrect paths, mismatched course IDs, non-course product types, mismatched package IDs, duplicate course mappings, duplicate store product IDs, and duplicate package IDs.

## Implemented on this branch

1. Added `config/learnworlds-products.json` for non-secret school and course-product mappings.
2. Added a fail-closed LearnWorlds configuration adapter in `lib/learnworlds.ts`.
3. Updated the existing Academy checkout route to support LearnWorlds without requiring website Stripe secrets.
4. Preserved the legacy website Stripe path until owner-approved cutover.
5. Added an owner-only LearnWorlds readiness endpoint at `/api/admin/learnworlds/status`.
6. Added LearnWorlds deployment variables to `.env.example`.
7. Added LearnWorlds routing and secret-boundary regression tests.
8. Added a configuration validator and included it in the Academy release gate.
9. Added direct-checkout identity binding and URL host allowlisting.
10. Added exact canary mapping tests.
11. Added implementation and failure audit documentation.

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

## Current required actions

1. Complete the current pull-request CI cycle.
2. Enter the LearnWorlds environment values directly in the Vercel project secret store.
3. Verify the custom domain inside LearnWorlds and confirm valid HTTPS.
4. Deploy the branch to a preview environment with LearnWorlds sandbox mode enabled.
5. Run the full sandbox acceptance test.

## Canary acceptance gate

1. The product mapping passes validation.
2. The branch passes lint, tests, LearnWorlds validation, existing Academy gates, and production build.
3. The deployment status endpoint reports `readyForSandboxCanary=true`.
4. The Obserra website enrollment action redirects to the mapped LearnWorlds direct checkout.
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
