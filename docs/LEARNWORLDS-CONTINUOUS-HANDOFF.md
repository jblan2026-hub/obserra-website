# Obserra Academy LearnWorlds Continuous Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Production cutover:** Not authorized  
**Current state:** Commercial checkout and learner access work in LearnWorlds Sandbox, but the actual course has not been built or loaded.

## Restart instruction

A future session must read this file first, then read:

1. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
2. `docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT.md`
3. `docs/LEARNWORLDS-COMMERCIAL-PIPELINE.md`
4. Pull request `#55`

Do not treat the LearnWorlds course shell, purchase record, or learner entitlement as proof that a usable course exists.

## Authoritative current state

### Platform and account

1. The LearnWorlds school is `Obserra EPI Academy`.
2. School ID: `6a7a693d353feb69c94c7654`.
3. Primary school URL: `https://obserraepillc.learnworlds.com`.
4. Governed API URL: `https://obserraepillc.learnworlds.com/admin/api/`.
5. Custom-domain CNAME was created for `academy.obserrallc.com`; final custom-domain and HTTPS acceptance still requires verification.
6. LearnWorlds premium subscription is active according to the owner.
7. Stripe is connected in LearnWorlds.
8. LearnWorlds API credentials and an access token exist. Secret values remain outside GitHub and chat.
9. The canonical Academy business email is `info@obserrallc.com`.
10. The official Obserra logo supplied by the owner is the required brand source.

### Governed canary mapping

```text
Obserra course ID: cybersecurity-foundations
LearnWorlds course ID: cybersecurity-foundations-for-new-professionals
LearnWorlds store product ID: cybersecurity_foundations_for_new_professionals
LearnWorlds package ID: package_6a7b2d3710387
Public URL: https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals
Checkout URL: https://obserraepillc.learnworlds.com/payment?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387
Status in repository mapping: sandbox
```

### Commercial offer currently proven in LearnWorlds

```text
List price: $149
Special-offer price: $99
Discount: $50
Payment mode used for acceptance: LearnWorlds Sandbox
```

Unless the owner changes the commercial decision, the Obserra website must display the same list price, special-offer price, discount context, and checkout destination.

## Verified working

The following results were proven by owner-supplied screenshots:

1. The Obserra website integration reaches the governed LearnWorlds checkout.
2. The corrected LearnWorlds checkout displays Obserra branding.
3. The checkout displays `info@obserrallc.com` for the business-controlled test account.
4. The checkout identifies the correct Cybersecurity Foundations product.
5. LearnWorlds explicitly displayed Sandbox payment fields.
6. A Sandbox purchase completed successfully.
7. A paid Sandbox invoice was generated for the correct business identity and course.
8. The purchase-success screen displayed the course and a `Start learning` action.
9. The learner entitlement was created and the course player opened.
10. Website CI, the Academy production gate, and related branch checks have passed on corrected branch heads. Current branch checks must still be reviewed after each documentation or code change.

## Critical truth: the course does not exist as instructional content

The LearnWorlds course player displays:

```text
No contents yet for this course!
```

The owner confirmed that a course was never actually built. The current LearnWorlds object is only a commercial and enrollment shell. It contains no validated instructional modules, lessons, videos, transcripts, exercises, assessments, learner materials, or certificate-completion path.

Current factual completion status:

```text
Checkout route: working
Sandbox purchase: working
Invoice generation: working
Learner enrollment: working
Course shell access: working
Actual course content loaded: no
Usable instructional course: no
Assessment proven: no
Certificate proven: no
Production-ready product: no
```

No future response may describe Cybersecurity Foundations as complete, published, usable, or commercially ready until the content and completion gates pass.

## Current visual and commercial defects

### LearnWorlds public course page

The public landing page still contains unsupported template material, including:

- placeholder instructor names and photographs
- `Add your short course description here`
- unsupported learner, assignment, hour, and video statistics
- generic template layout elements unrelated to the actual Obserra course

These items must be removed or replaced before public launch.

### LearnWorlds branding

1. The checkout topbar shows Obserra branding, but the logo placement appears duplicated or poorly positioned.
2. The purchase-success page footer still displays `Driving Data` branding and template copy.
3. The course thumbnail is blank.
4. The learner-facing course page and certificate experience have not completed a full Obserra visual acceptance gate.

### Website price and checkout mismatch

The Obserra website currently presents the course at `$149`, while the proved LearnWorlds offer charges `$99` after a `$50` special-offer discount.

The website must be changed to one authoritative presentation. Recommended current presentation:

```text
List price: $149
Current launch offer: $99
Savings: $50
Enrollment destination: governed LearnWorlds checkout
```

### Legacy website Stripe route

A separate legacy Stripe checkout was observed with:

- `ZenBusiness` branding
- the personal iCloud email
- a `$149` charge
- a direct Stripe payment path that is separate from LearnWorlds

That route is not the approved Academy checkout. It must not remain available to customers after LearnWorlds cutover. The website should route Academy purchases only to the governed LearnWorlds product unless the owner explicitly approves a separate, correctly branded commerce architecture.

## Governing architecture

The approved architecture is:

```text
Obserra website
-> course marketing and SEO
-> governed Academy enrollment route
-> LearnWorlds checkout
-> LearnWorlds learner identity and enrollment
-> LearnWorlds course delivery
-> assessment
-> certificate
-> reporting
```

LearnWorlds is the authoritative LMS, checkout, enrollment, learner-progress, and certificate platform for this commercial pivot. The Obserra website is the authoritative marketing and discovery surface.

## Immediate build order

### Step 1: Build the real Cybersecurity Foundations course

Create and load the actual 2.5-hour course before performing any broader catalog rollout. Minimum required deliverables:

1. Five complete instructional modules.
2. Substantive lesson content for every module.
3. Video, narrated-slide, or equivalent media for approved lessons.
4. Captions and transcripts.
5. Practical scenarios and exercises.
6. Module knowledge checks.
7. A 25-question final assessment with an 80 percent passing threshold.
8. Learner workbook and job aids.
9. Source and reference register.
10. Accessibility review.
11. Certificate-completion rule.
12. Owner review and approval.

### Step 2: Remove LearnWorlds template content

Replace all placeholder people, photographs, metrics, descriptions, footer copy, and unsupported claims with approved Obserra content.

### Step 3: Complete branding

Apply the official Obserra logo consistently to:

- school header
- topbar
- footer
- favicon
- course thumbnail
- checkout
- purchase confirmation
- invoice presentation where supported
- learner account
- certificate

### Step 4: Align website commerce

1. Update the public website to show the LearnWorlds-authoritative current offer.
2. Route all Academy enrollment buttons to LearnWorlds.
3. Disable or retire the legacy website Stripe Academy checkout after rollback and entitlement impact analysis.
4. Preserve existing legitimate entitlements and payment records.
5. Add automated price-parity and checkout-destination tests.

### Step 5: Complete the canary acceptance test

The canary passes only when:

1. The real course content is loaded.
2. No template or placeholder content remains.
3. Website and LearnWorlds pricing match.
4. Branding is consistent across the complete journey.
5. A Sandbox learner can buy, enroll, open, and complete the course.
6. The final assessment works.
7. The certificate is issued and displays correct business identity.
8. No real charge occurs during Sandbox validation.
9. Owner approval is recorded.

### Step 6: Scale the catalog

Only after the canary passes should the remaining courses be built in controlled batches. Each batch must use the same content, accessibility, commerce, branding, assessment, certificate, and audit gates.

## Current blockers

1. No actual Cybersecurity Foundations course content is loaded in LearnWorlds.
2. The public LearnWorlds page contains unsupported template content.
3. The purchase-success footer still contains `Driving Data` branding.
4. Course thumbnail and visual presentation are incomplete.
5. Website and LearnWorlds prices are not aligned.
6. A legacy website Stripe Academy path remains a commercial-risk concern.
7. Assessment and certificate behavior have not been proven.
8. Production publication and live-payment cutover are not authorized.

## Production boundary

Do not:

- merge pull request `#55` as a production cutover solely because checkout works
- mark the canary `published`
- disable Sandbox controls
- represent the course as completed
- sell the empty course shell to real customers
- activate the remaining 60-course rollout

until the actual course and full acceptance gates pass.

## Resume command for a future chat

Use this instruction verbatim:

```text
Read the current Obserra Academy handoff at docs/OBSERRA-ACADEMY-RESTART-HERE.md and docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Continue from the first incomplete action. Preserve all failures and update the handoff after every action.
```
