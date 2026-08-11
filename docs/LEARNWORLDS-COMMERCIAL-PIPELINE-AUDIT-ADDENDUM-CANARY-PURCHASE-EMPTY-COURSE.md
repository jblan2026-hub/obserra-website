# LearnWorlds Commercial Pipeline Audit Addendum: Sandbox Purchase Passed, Course Missing

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** NOT AUTHORIZED

## Purpose

This addendum records the latest authoritative evidence after the LearnWorlds Sandbox transaction, invoice, learner-access test, website-price comparison, course-player inspection, and Vercel connector retest.

## Verified Sandbox transaction evidence

Owner-supplied screenshots prove:

1. LearnWorlds checkout displayed Obserra branding.
2. Checkout displayed the business-controlled email `info@obserrallc.com`.
3. Checkout identified `Cybersecurity Foundations for New Professionals`.
4. Checkout displayed list price `$149`, special-offer price `$99`, and discount `-$50`.
5. Payment fields were explicitly labeled `SANDBOX`.
6. The purchase completed successfully.
7. The success screen offered `Start learning`.
8. Invoice `INV-00001` was generated and marked `Paid`.
9. The invoice displayed:
   - issuer: Obserra Executive Protection & Intelligence LLC
   - client email: `info@obserrallc.com`
   - unit price: `$149`
   - discount: `$50`
   - total: `$99`
10. The learner entitlement was created and the course player opened.

## Critical result

The LearnWorlds course player displayed:

```text
No contents yet for this course!
```

The owner confirmed that a course was never actually built. The current LearnWorlds object is a commercial shell only.

## Current acceptance status

```text
Website-to-LearnWorlds route: passed
Correct LearnWorlds product mapping: passed
Correct business email at LearnWorlds checkout: passed
LearnWorlds Sandbox payment state: passed
Sandbox purchase: passed
Invoice generation: passed
Learner enrollment: passed
Course-shell access: passed
Actual instructional course loaded: failed
Final assessment: blocked
Certificate issuance: blocked
Production-ready course: failed
```

## Failure 11: Purchasable shell existed without instructional content

**Evidence:** The learner opened the course and LearnWorlds displayed `No contents yet for this course!`.

**Impact:** Checkout and enrollment could create the appearance of a completed commercial product even though no usable training existed.

**Root cause:** The commercial shell, product, package, price, and enrollment path were created before the instructional course was built and validated.

**Correction:** Build and load the complete governed Cybersecurity Foundations course before live publication.

**Prevention:** A course may not be marked sellable or published unless the content inventory, duration, activities, assessment, accessibility, certificate, and owner-approval gates all pass.

## Failure 12: Public LearnWorlds page contains template and unsupported claims

**Evidence:** The owner-supplied public-course screenshot displayed stock people and names, placeholder copy, and unsupported statistics including learner, assignment, hour, and video counts.

**Impact:** Public visitors could receive misleading or irrelevant information, and the page does not represent the actual Obserra course.

**Correction:** Remove all stock profiles, photos, placeholder descriptions, unsupported statistics, and unrelated template sections. Replace them only with approved and factually supported Obserra content.

**Prevention:** Public pages require a factual-content gate that rejects placeholders, template names, unverified metrics, and unsupported claims.

## Failure 13: Legacy Driving Data branding remains in the learner journey

**Evidence:** The purchase-success page footer still displayed `Driving Data` branding and template copy. Other screenshots showed duplicate or poorly positioned Obserra logo elements.

**Impact:** The learner journey is commercially inconsistent and not production-ready.

**Correction:** Apply the official Obserra identity across header, footer, favicon, course image, checkout, confirmation, learner account, email, invoice where supported, and certificate.

**Prevention:** A visual acceptance gate must cover every learner-facing surface before live publication.

## Failure 14: Website and LearnWorlds pricing are not aligned

**Evidence:** The Obserra website displayed `$149` as the purchase price, while LearnWorlds proved a `$149` list price with a `$99` special-offer total and `$50` discount.

**Impact:** Learners could see different prices between the marketing site and checkout, creating trust, support, and consumer-protection risk.

**Correction:** Use one governed offer across the website and LearnWorlds. Current recommended presentation:

```text
List price: $149
Launch offer: $99
Savings: $50
Checkout destination: governed LearnWorlds checkout
```

**Prevention:** Add automated price-parity tests that compare the website presentation and governed LearnWorlds product mapping before deployment.

## Failure 15: Legacy website Stripe route remains commercially unsafe

**Evidence:** A separate Stripe checkout displayed ZenBusiness branding, the personal email `jblan006@icloud.com`, and a `$149` charge.

**Impact:** The website can direct a buyer into a separate and inconsistently branded payment flow that conflicts with the approved LearnWorlds architecture.

**Correction:** Trace every Academy purchase CTA and API route. Route the mapped course to LearnWorlds only. Disable or retire the legacy website Stripe route after preserving valid historical payments and entitlements and completing impact analysis.

**Prevention:** Add a checkout-destination regression test and prohibit unmapped Academy products from using a legacy direct Stripe path after LearnWorlds cutover.

## Failure 16: Vercel connector still lacks project authority

**Owner statement:** The owner reported that the Vercel project should now be accessible under the Obserra team.

**Retest performed:**

```text
Team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
list_projects(team ID): 0 projects
list_projects(team slug obserra): 0 projects
get_project(obserra-website-live): 404 Not Found
```

**Impact:** Direct project inspection and deployment management through the ChatGPT Vercel connector remain unavailable.

**Correction:** None required for the current work. Continue through GitHub, pull-request CI, and the existing Git-to-Vercel deployment integration.

**Prevention:** Do not claim Vercel project authority until both project listing and direct project retrieval succeed through the connector.

## Governing course contract

The Cybersecurity Foundations canary must contain at minimum:

1. Five complete modules.
2. Approximately 2.5 governed instructional hours.
3. Substantive instruction in every lesson.
4. Approved video, narrated-slide, or equivalent media.
5. Captions and transcripts.
6. Practical scenarios and exercises.
7. Module knowledge checks.
8. A 25-question final assessment.
9. An 80 percent passing threshold.
10. Learner workbook and job aids.
11. Source and reference register.
12. Accessibility review.
13. Certificate-completion rule.
14. Owner quality approval.

## Required next actions

1. Preserve all current Sandbox purchase, invoice, and enrollment evidence.
2. Build the actual Cybersecurity Foundations content package.
3. Remove all public-page template content.
4. Load the complete course into LearnWorlds.
5. Configure assessment, completion, certificate, reporting, and accessibility controls.
6. Complete Obserra branding across the full journey.
7. Align website and LearnWorlds pricing.
8. Eliminate the unsafe legacy Stripe Academy route after impact analysis.
9. Repeat the full Sandbox journey through certificate issuance.
10. Obtain explicit owner approval before production cutover.

## Production boundary

Do not activate live payment mode, mark the canary `published`, merge the production cutover, or scale the remaining catalog until the actual course and all acceptance gates pass.
