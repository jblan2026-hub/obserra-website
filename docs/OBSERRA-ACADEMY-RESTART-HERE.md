# Obserra Academy: Restart Here

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Business email:** `info@obserrallc.com`  
**Repository:** `jblan2026-hub/obserra-website`  
**Working branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Production cutover:** Not authorized

## Mandatory restart instruction

Every future session must read these files before making recommendations or changes:

1. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
2. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
3. `docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT.md`
4. `docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT-ADDENDUM-CANARY-PURCHASE-EMPTY-COURSE.md`
5. `docs/LEARNWORLDS-COMMERCIAL-PIPELINE.md`
6. Pull request `#55`

Use this exact continuation instruction:

```text
Read docs/OBSERRA-ACADEMY-RESTART-HERE.md, docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md, docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT.md, and docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT-ADDENDUM-CANARY-PURCHASE-EMPTY-COURSE.md on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Continue from the first incomplete action. Preserve all failures and update the handoff after every action.
```

## Executive truth

The commercial plumbing works in LearnWorlds Sandbox, but the course product does not yet exist.

```text
LearnWorlds Sandbox checkout: passed
Sandbox purchase: passed
Invoice generation: passed
Learner enrollment: passed
Course shell opens: passed
Actual course content loaded: failed
Assessment: blocked
Certificate: blocked
Production-ready course: no
```

The LearnWorlds course player displayed:

```text
No contents yet for this course!
```

The owner confirmed that the course was never built. No response may describe Cybersecurity Foundations as complete, published, usable, or commercially ready until the actual content and completion gates pass.

## Approved architecture

```text
Obserra website
-> marketing, search, catalog, and sales discovery
-> governed LearnWorlds checkout
-> LearnWorlds learner identity and enrollment
-> LearnWorlds course delivery
-> assessment
-> certificate
-> reporting
```

LearnWorlds is the authoritative LMS and Academy checkout platform. The old local worker farm and custom Windows controller are not the approved commercial production path.

## LearnWorlds account

```text
School: Obserra EPI Academy
School ID: 6a7a693d353feb69c94c7654
School URL: https://obserraepillc.learnworlds.com
API URL: https://obserraepillc.learnworlds.com/admin/api/
Preferred custom domain: https://academy.obserrallc.com
Business email: info@obserrallc.com
```

## Canary mapping

```text
Obserra course ID: cybersecurity-foundations
LearnWorlds course ID: cybersecurity-foundations-for-new-professionals
Store product ID: cybersecurity_foundations_for_new_professionals
Package ID: package_6a7b2d3710387
Status: sandbox
List price: $149
Sandbox launch offer: $99
Discount: $50
```

## Proven evidence

Owner-supplied screenshots proved:

1. Correct LearnWorlds Sandbox checkout.
2. Correct business email at checkout.
3. Correct canary product.
4. Explicit Sandbox card fields.
5. Successful purchase confirmation.
6. Invoice `INV-00001` showing the course, business identity, $149 list price, $50 discount, and $99 total.
7. Learner access to the course shell.
8. Empty course player with no contents.

## Current defects

1. No instructional course content exists in LearnWorlds.
2. Public LearnWorlds sales page still contains stock people, placeholder copy, and unsupported metrics.
3. Purchase-success footer still contains `Driving Data` branding and unrelated copy.
4. Course images and thumbnails are blank.
5. Website displays `$149` only while LearnWorlds uses a `$99` special offer.
6. A legacy direct Stripe checkout was observed with `ZenBusiness` branding, personal email, and a `$149` charge.
7. The old Stripe route must be traced and disabled for the mapped course before production cutover.
8. Assessment and certificate behavior cannot be tested until a real course is loaded.
9. Custom-domain and HTTPS acceptance are not yet proven.
10. Vercel ChatGPT connector access still returns zero projects and a 404 for `obserra-website-live`.

## Immediate build order

1. Build the complete five-module, approximately 2.5-hour Cybersecurity Foundations course.
2. Produce module activities, scenarios, knowledge checks, transcripts, workbook, source register, and accessibility evidence.
3. Produce and configure the governed 25-question final assessment with an 80 percent passing threshold.
4. Configure the Obserra certificate and completion rules.
5. Remove all LearnWorlds placeholder content and unsupported claims.
6. Complete Obserra branding across checkout, success, footer, learner account, course, email, invoice where supported, and certificate.
7. Align website pricing to `$149` list and `$99` launch offer.
8. Route every canary CTA to LearnWorlds and disable the legacy website Stripe route after impact analysis.
9. Repeat the full Sandbox test through course completion and certificate issuance.
10. Scale the remaining catalog only after the canary passes.

## Non-negotiable production blockers

Do not merge or cut over production until:

- the complete course is loaded
- no placeholder content remains
- branding is consistent
- website and LearnWorlds pricing match
- the legacy Stripe path is disabled for the course
- learner completes the real course
- final assessment works
- certificate is issued correctly
- owner approval is documented

## Vercel connector status

Latest retest on 2026-08-11:

```text
Obserra team visible: yes
Team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
Projects returned by team ID: 0
Projects returned by team slug: 0
Direct get_project(obserra-website-live): 404 Not Found
Direct ChatGPT Vercel project authority: not established
```

This does not block GitHub-based implementation or existing Git-to-Vercel deployments. Do not spend more owner time on the unrelated Vercel Connect token-resource screen.
