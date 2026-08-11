# LearnWorlds Continuous Handoff Addendum: Owner Managed HeyGen and Pollo Refills

Date: 2026-08-11

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `#55`

Production cutover: Not authorized

## Owner direction

The owner stated that HeyGen and Pollo AI credits can be refilled manually when needed and directed the production plan not to be constrained by assumed credit scarcity.

## Implementation change

The media-factory configuration was updated to:

```text
Production mode: quality-first-owner-managed-refill
Baseline cadence: 5 courses per month
Accelerated cadence after canary: up to 10 courses per month
Credit availability blocks planning: false
Quality reduction to save credits: prohibited
Automatic refill: not authorized
Separate API credit purchases: not authorized
Manual web-application production: enabled
```

## Governing interpretation

The decision authorizes manual subscription-credit refills. It does not authorize:

1. Automatic billing or automatic reload.
2. Separately billed HeyGen API usage.
3. Separately billed Pollo API usage.
4. Unlimited failed-generation retries.
5. Reduced audit, rights, accessibility, or approval controls.

## Production effect

The pipeline will select the approved production mode based on quality and intended use rather than the lowest credit cost. HeyGen remains the authoritative presenter layer and Pollo remains the cinematic visual and campaign layer.

The canary and first three-course batch still control portfolio promotion. After those gates pass, production may accelerate toward ten courses per month when owner review capacity and platform performance support the increase.

## Files changed

```text
config/academy-media-factory.json
docs/academy-media-pipeline/OWNER-CREDIT-REFILL-DECISION.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-OWNER-MANAGED-MEDIA-REFILLS.md
```

## Current state

```text
HeyGen avatar and voice creation: owner in progress
HeyGen canary rendered: not yet
Pollo canary rendered: not yet
Media-factory configuration: updated
Manual credit refill authority: recorded
Automatic refill: disabled
API credit automation: disabled
Production cutover: blocked pending canary
```

## Prevention rule

Do not create another cost-minimized media architecture while the owner has authorized manual refills. Optimize for approved quality, reuse, accessibility, rights, platform fit, and measurable commercial value. Preserve owner control over every refill and any future API expenditure.
