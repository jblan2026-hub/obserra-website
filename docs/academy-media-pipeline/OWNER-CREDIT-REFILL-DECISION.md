# Owner Decision: HeyGen and Pollo Credit Refills

Owner: Dr. Jody Blanchard

Recorded: 2026-08-11

Status: Permanent production decision

## Decision

The owner confirmed that HeyGen and Pollo AI credits may be manually refilled when needed. Credit availability is therefore not a reason to reduce production quality, shorten required media, remove accessibility assets, skip platform variants, or delay an otherwise approved media job.

## Operating rules

1. Production remains quality first.
2. The owner will manually refill subscription credits when needed.
3. Automatic credit reload is not authorized by this decision.
4. Separate paid API credits are not authorized by this decision.
5. The annual web subscriptions remain the primary generation route.
6. HeyGen remains the authoritative presenter layer.
7. Pollo AI remains the cinematic visual and campaign layer.
8. Required captions, transcripts, rights evidence, disclosure, accessibility review, technical validation, and owner approval remain mandatory.
9. No lower quality model, avatar, voice, resolution, or production mode may be selected solely to conserve credits.
10. Failed generations still require evidence and bounded repair. Refill authorization is not permission for uncontrolled retries.

## Throughput effect

The baseline production cadence remains five courses per month during the canary and stabilization phase. After the Cybersecurity Foundations canary and the first three course batch pass all acceptance gates, the pipeline may scale toward ten courses per month when owner review capacity and platform performance support it.

Credit balance does not block planning. Owner review, factual quality, media quality, rights, accessibility, learner experience, and commercial acceptance remain the real promotion gates.

## Current implementation

The governed media configuration now records:

```json
{
  "productionMode": "quality-first-owner-managed-refill",
  "ownerManagedRefillAuthorized": true,
  "creditAvailabilityBlocksPlanning": false,
  "qualityMayNotBeReducedToSaveCredits": true,
  "automaticRefillAuthorized": false,
  "apiCreditPurchasesAuthorized": false
}
```

## Prevention rule

Do not redesign the production plan around assumed monthly credit scarcity. Do not enable automatic refill or separately billed API use without explicit owner approval. Use manual refills to preserve approved quality while retaining spend visibility and owner control.
