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
5. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-COURSE-OUTLINE-READY-FOR-IMPORT.md`
6. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-ASSESSMENT-IMPORT-FIX-v2.0.1.md`
7. Pull request `#55`

Use this exact continuation instruction:

```text
Read docs/OBSERRA-ACADEMY-RESTART-HERE.md, docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md, docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT.md, docs/LEARNWORLDS-COMMERCIAL-PIPELINE-AUDIT-ADDENDUM-CANARY-PURCHASE-EMPTY-COURSE.md, docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-COURSE-OUTLINE-READY-FOR-IMPORT.md, and docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-ASSESSMENT-IMPORT-FIX-v2.0.1.md on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Continue from the first incomplete action. Preserve every failure and update the handoff after every action.
```

## Executive truth

The commercial plumbing works in LearnWorlds Sandbox. The complete instructional package exists as versioned files, but the course has not yet been loaded into LearnWorlds.

```text
LearnWorlds Sandbox checkout: passed
Sandbox purchase: passed
Invoice generation: passed
Learner enrollment: passed
Course shell opens: passed
Five governed SCORM packages built: passed
Final-assessment source built: passed
Five LearnWorlds sections named: passed
SCORM activities loaded in LearnWorlds: not proven
Final-assessment section created: not proven
Original exam workbook upload: failed
Corrected exam workbook v2.0.1 built: passed
Corrected exam workbook imported: not proven
Assessment configuration: blocked
Certificate: blocked
Production-ready course: no
```

No response may describe Cybersecurity Foundations as published, usable, commercially ready, or complete until the LearnWorlds activities, assessment, completion rules, certificate, branding, and owner acceptance are proven.

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

LearnWorlds is the authoritative LMS and Academy checkout platform. The retired local worker farm and custom Windows controller are not the approved commercial production path.

## LearnWorlds account and canary

```text
School: Obserra EPI Academy
School ID: 6a7a693d353feb69c94c7654
School URL: https://obserraepillc.learnworlds.com
API URL: https://obserraepillc.learnworlds.com/admin/api/
Preferred custom domain: https://academy.obserrallc.com
Business email: info@obserrallc.com

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

Owner-supplied screenshots prove:

1. Correct LearnWorlds Sandbox checkout.
2. Correct business email at checkout.
3. Correct canary product.
4. Explicit Sandbox card fields.
5. Successful purchase confirmation.
6. Invoice `INV-00001` showing $149 list price, $50 discount, and $99 total.
7. Learner access to the course shell.
8. The original player contained no content.
9. The Course outline now contains five correctly named Draft sections:
   - Security and Business Risk
   - Identity, Access, and Authentication
   - Threat Recognition and Safe Response
   - Incident Reporting and Evidence Preservation
   - Secure Habits and Continuous Improvement
10. No activity was visible inside those sections in the latest screenshot.
11. The sixth section, `Final Assessment and Completion`, was not visible.
12. The owner reported that the exam spreadsheet did not upload.

## Current import package

Use this package, not the superseded v2.0.0 package:

```text
Obserra-Cybersecurity-Foundations-LearnWorlds-Import-v2.0.1.zip
```

Primary assessment workbook:

```text
learnworlds-upload/exam_Cybersecurity_Foundations_Final_Assessment-v2.0.1.xlsx
```

Fallback data-only workbook:

```text
admin/LearnWorlds-Questions-Data-Only-v2.0.1.xlsx
```

The corrected workbook has three tabs, 25 questions, exact published column headings, letter-based groups, `TMC` types, 1-based correct answers, and no formulas, macros, tables, merged cells, external links, or auto-filters.

## Exact next action

1. Add a sixth Draft section named `Final Assessment and Completion`.
2. Under that section select `Add activity`.
3. Create an `Exam` named `Cybersecurity Foundations Final Assessment`.
4. Select `Save and Edit`.
5. Inside the Exam editor select `Add/Import` -> `Import Questions` -> `From XLS`.
6. Upload `exam_Cybersecurity_Foundations_Final_Assessment-v2.0.1.xlsx`.
7. Confirm that 25 questions are visible.
8. Set passing score to 80 percent and keep attempts controlled.
9. If LearnWorlds rejects the corrected workbook, download the current template from that exact import dialog and copy the 25 data rows from `LearnWorlds-Questions-Data-Only-v2.0.1.xlsx` into its unchanged `Questions` tab.
10. Load and launch-test the five numbered SCORM ZIPs, one per matching module section.
11. Keep the course private and in Sandbox.

## Current defects and preserved failures

1. The course is not yet proven to contain any visible LearnWorlds activities.
2. The final assessment is not yet imported or configured.
3. The public LearnWorlds sales page contains placeholder and unsupported template content.
4. The purchase-success footer previously contained `Driving Data` branding.
5. Course images and thumbnails require acceptance.
6. Website and LearnWorlds pricing previously conflicted.
7. A legacy direct Stripe checkout displayed ZenBusiness branding, a personal email, and a $149 charge.
8. The legacy website Stripe route must not remain a canary purchase path after controlled cutover.
9. Custom-domain and HTTPS acceptance are not yet proven.
10. Direct ChatGPT Vercel project authority remains unavailable, but GitHub-to-Vercel deployment works.
11. A purchasable empty course shell existed before instructional content was loaded.
12. The original assessment workbook did not upload and is superseded by v2.0.1.

## Non-negotiable production blockers

Do not merge or cut over production until:

- all five SCORM activities are loaded and launch successfully
- the final Exam contains exactly 25 verified questions
- the passing score is 80 percent
- completion rules work
- the certificate is issued correctly
- no placeholder or legacy branding remains
- website and LearnWorlds pricing match
- the legacy Stripe canary route is blocked or retired with entitlement preservation
- a Sandbox learner completes the full real course
- owner approval is documented

## Vercel connector status

```text
Obserra team visible: yes
Team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
Projects returned by ChatGPT Vercel connector: 0
Direct get_project(obserra-website-live): 404 Not Found
Direct ChatGPT Vercel project authority: not established
```

This does not block repository implementation, pull-request CI, or existing Git-to-Vercel deployments.