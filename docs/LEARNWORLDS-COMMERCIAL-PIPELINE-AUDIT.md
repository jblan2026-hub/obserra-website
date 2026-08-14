# LearnWorlds Commercial Pipeline Audit Record

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Business email:** `info@obserrallc.com`  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Production cutover:** Not authorized  
**Audit conclusion:** LearnWorlds Sandbox commerce and enrollment work, but the canary course is an empty shell and is not a deliverable.

## 1. Recorded account and platform facts

```text
LearnWorlds school: Obserra EPI Academy
School ID: 6a7a693d353feb69c94c7654
Primary URL: https://obserraepillc.learnworlds.com
Author dashboard: https://obserraepillc.learnworlds.com/author/dashboard
API URL: https://obserraepillc.learnworlds.com/admin/api/
Preferred custom domain: https://academy.obserrallc.com
Business email: info@obserrallc.com
```

The owner confirmed a LearnWorlds premium subscription, Stripe connection, API credentials, an access token, Preview environment variables, and a custom-domain CNAME. Secret values were not placed in GitHub or chat.

## 2. Governed canary identifiers

```text
Obserra course ID: cybersecurity-foundations
LearnWorlds course ID: cybersecurity-foundations-for-new-professionals
Store product ID: cybersecurity_foundations_for_new_professionals
Package ID: package_6a7b2d3710387
Public URL: https://obserraepillc.learnworlds.com/course/cybersecurity-foundations-for-new-professionals
Checkout URL: https://obserraepillc.learnworlds.com/payment?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387
Cart URL: https://obserraepillc.learnworlds.com/cart?product_id=cybersecurity-foundations-for-new-professionals&type=course&packageId=package_6a7b2d3710387
Repository state: sandbox
```

## 3. Actions completed

1. Created `feature/learnworlds-commercial-pipeline` from `main`.
2. Opened draft pull request `#55`.
3. Added governed LearnWorlds school, API, email, course, product, package, public-page, checkout, and cart mappings.
4. Added fail-closed LearnWorlds routing before the old website Stripe requirement.
5. Preserved the existing website Stripe implementation as temporary rollback only.
6. Added allowed-host, API-path, course-ID, product-ID, package-ID, status, uniqueness, and secret-boundary validation.
7. Added the owner-only LearnWorlds readiness endpoint.
8. Added deployment environment templates with no committed secret values.
9. Added LearnWorlds routing and configuration tests.
10. Added LearnWorlds validation to the Academy release gate.
11. Corrected stale release-gate pricing assertions without changing canonical course prices.
12. Governed `info@obserrallc.com` as the Academy business identity and rejected `@icloud.com` in LearnWorlds configuration.
13. Recorded the official Obserra logo as the required brand source.
14. Verified the corrected LearnWorlds checkout visually.
15. Completed a LearnWorlds Sandbox purchase.
16. Verified LearnWorlds invoice generation.
17. Verified learner enrollment into the canary shell.
18. Verified that the LearnWorlds course player opens.
19. Verified that the course player contains no instructional content.
20. Rechecked Vercel ChatGPT project access after the owner attempted authorization changes.
21. Added `docs/OBSERRA-ACADEMY-RESTART-HERE.md` for future-session continuity.
22. Updated the authoritative continuous handoff with the real current state.

## 4. Current acceptance results

| Control | Result |
|---|---|
| Governed LearnWorlds checkout reached | Passed |
| Correct canary product | Passed |
| Business email at corrected checkout | Passed |
| LearnWorlds Sandbox payment mode | Passed |
| Sandbox purchase | Passed |
| Invoice | Passed |
| Learner entitlement | Passed for shell |
| Course player opens | Passed for shell |
| Actual course content | Failed |
| Assessment | Blocked |
| Certificate | Blocked |
| Public sales-page accuracy | Failed |
| End-to-end Obserra branding | Failed |
| Website-to-LearnWorlds price parity | Failed |
| Single authoritative checkout route | Failed |
| Custom-domain HTTPS | Not proven |
| Production release | Blocked |

## 5. Purchase and invoice evidence

The corrected LearnWorlds checkout showed:

```text
Business email: info@obserrallc.com
Course: Cybersecurity Foundations for New Professionals
List price: $149
Discount: $50
Sandbox order total: $99
Payment fields: explicitly labeled SANDBOX
```

The purchase-success screen displayed `Thank you for your purchase!` and a `Start learning` action.

Invoice evidence showed:

```text
Invoice number: INV-00001
Status: Paid
Date: 11 Aug 2026
Course: Cybersecurity Foundations for New Professionals
Unit price: $149
Discount: $50
Total: $99
Business email: info@obserrallc.com
```

This proves Sandbox commerce. It does not prove a usable course.

## 6. Critical failure: the course was never built

The LearnWorlds player displayed:

```text
No contents yet for this course!
```

The owner confirmed that the course was never made. The current LearnWorlds object is a purchasable and enrollable shell only.

Missing deliverables include:

- sections and lessons
- instructional content
- video or narrated media
- captions and transcripts
- scenarios and exercises
- module knowledge checks
- final assessment
- learner workbook and job aids
- source register
- accessibility evidence
- completion rules
- certificate path

### Impact

A purchaser can buy and enter an empty product. Live publication would be commercially misleading and unacceptable.

### Required correction

Build the complete governed Cybersecurity Foundations course and repeat the full Sandbox journey through certificate issuance.

### Prevention rule

A LearnWorlds product must fail publication when it has zero required learning activities or lacks the governed completion contract.

## 7. Public LearnWorlds sales-page defects

The current public page contains template and unsupported content, including:

- stock names and photographs
- placeholder description text
- unsupported `1,500+ learners`
- unsupported assignment, hour, and video counts
- generic template copy unrelated to the actual Obserra course

### Impact

The page makes claims not supported by course evidence and presents unrelated individuals as if they are part of the course.

### Required correction

Remove all stock people, placeholder text, and unsupported statistics. Replace them with approved Obserra course content and verified facts only.

### Prevention rule

No public claim, metric, instructor identity, duration, activity count, video count, or learner count may appear without factual evidence.

## 8. Branding defects

Observed results:

1. Obserra assets appear in the checkout topbar.
2. Logo placement appears duplicated or poorly sized.
3. The purchase-success footer still displays `Driving Data` branding and unrelated data-science certification copy.
4. Course thumbnails are blank.
5. The complete learner account, notification, certificate, and course-player journey has not passed an Obserra visual acceptance gate.

### Required correction

Apply the official Obserra identity consistently to the topbar, footer, favicon, thumbnail, checkout, success page, learner account, emails, course player, and certificate.

## 9. Website pricing mismatch

The website currently displays `$149` as the course investment. LearnWorlds currently applies:

```text
$149 list price
$99 launch offer
$50 discount
```

The owner directed that the website align with LearnWorlds checkout prices.

### Required correction

The website must display the same authoritative commercial terms or LearnWorlds must be changed to match the website. Current recommended presentation:

```text
List price: $149
Launch offer: $99
Savings: $50
```

### Prevention rule

Automated parity tests must compare the website display, governed mapping, and LearnWorlds product terms before publication.

## 10. Legacy direct Stripe checkout defect

A separate checkout screen was observed with:

- `ZenBusiness` branding
- personal email `jblan006@icloud.com`
- `$149` charge
- Stripe Link and a saved live payment method

This is not the approved LearnWorlds Sandbox checkout. It may be a stale browser tab, old deployment, old CTA, or the website-managed Stripe route.

### Impact

Customers could see conflicting prices, brands, emails, invoices, and enrollment systems.

### Required correction

Trace every Academy CTA and checkout route. For the mapped canary, route all enrollment actions to LearnWorlds. Disable the website-managed Stripe path only after rollback, entitlement, and payment-record impact analysis.

### Safety rule

Do not click Pay on the direct Stripe screen during the LearnWorlds acceptance test.

## 11. Vercel authorization findings

The owner attempted to grant Vercel access and supplied screenshots of a resource named `api.openai.com/obserra-website-live`.

That screen is a Vercel Connect token resource, not the ChatGPT Vercel MCP project-authorization control. Earlier guidance incorrectly conflated the two and was corrected in the handoff.

Latest direct connector retest:

```text
Obserra team visible: yes
Team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
Projects returned: 0
Direct get_project for obserra-website-live: 404 Not Found
Direct ChatGPT Vercel project authority: not established
```

### Operational decision

Do not spend more owner time on the unrelated Vercel Connect resource. Continue through GitHub, pull-request CI, and existing Git-to-Vercel deployments. Direct Vercel connector access is useful but not required for the course build.

## 12. Required canary course contract

Cybersecurity Foundations must include, at minimum:

1. Five complete modules totaling approximately 2.5 hours.
2. Original Obserra instructional content.
3. Approved source grounding and source register.
4. Practical scenarios and applied exercises.
5. Module knowledge checks.
6. Governed 25-question final assessment.
7. 80 percent passing threshold.
8. Learner workbook and job aids.
9. Captions, transcripts, image descriptions, and keyboard-compatible activities.
10. Branded course thumbnail and visual assets.
11. Completion rules and certificate issuance.
12. Clear non-certification and non-compliance-evidence language.
13. Version, owner approval, rights record, and audit evidence.

## 13. Immediate work order

1. Build the complete Cybersecurity Foundations course package.
2. Produce the LearnWorlds section and activity structure.
3. Produce the final assessment import package.
4. Produce workbook, job aids, source register, and branded assets.
5. Remove all LearnWorlds template content.
6. Complete end-to-end Obserra branding.
7. Align website price and offer presentation.
8. Route all canary CTAs to LearnWorlds.
9. Trace and disable the legacy direct Stripe route after impact analysis.
10. Repeat Sandbox purchase, enrollment, content completion, assessment, and certificate testing.
11. Scale the remaining catalog only after the canary passes.

## 14. Production blockers

Production remains prohibited until:

- the real course is loaded
- all placeholders and unsupported claims are removed
- branding is consistent
- website and LearnWorlds pricing match
- one authoritative checkout route exists
- custom-domain HTTPS is proven
- the learner completes the actual course
- assessment passes
- certificate is issued correctly
- owner approval is recorded

## 15. Restart reference

Future sessions must begin with:

- `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
- `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
- this audit record

No future session may infer that a successful purchase means a completed course.