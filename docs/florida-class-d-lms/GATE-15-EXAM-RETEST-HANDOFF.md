# Florida Class D Gate 15 Handoff

## Purpose

Gate 15 adds controlled remediation and retest governance after a failed Florida Class D final examination. It preserves every prior attempt and score and requires a documented administrative decision before another attempt can begin.

## Implemented source controls

- Failed examination attempts remain immutable historical records and are never replaced by a later score.
- A retest authorization must reference the specific preserved failed attempt.
- Documented remediation and an administrative authorization note are mandatory.
- Only one open retest authorization may exist per enrollment.
- The next examination attempt after a failure fails closed unless an authorized retest record exists.
- Starting the authorized retest consumes that authorization and links the new attempt to it.
- An unused authorization can be revoked by authorized school/compliance staff with a documented reason.
- Authorization, consumption through the next attempt, and revocation preserve append-only audit history.
- Retest authorization tables and RPCs are not directly accessible to public, anonymous, or authenticated browser roles.

## Regulatory-policy boundary

This source intentionally does not define a fixed waiting period or a fixed maximum number of retest attempts. Those values must not be invented. Any production policy must be verified against the then-current Florida requirements and the school’s approved procedures before activation.

## Security and privacy boundary

The public repository contains the workflow architecture only. It must not contain real learner records, real examination content, answer keys, remediation narratives, protected staff credentials, DS/DI license numbers, or production evidence.

## Production boundary

Gate 15 does not activate examination delivery or retesting. Production remains fail closed until Class DS authorization is active, the approved examination bank and migrations are promoted to the protected datastore, runtime feature flags are deliberately enabled, and final regulatory/security acceptance is complete.

## Next controlled increment

Gate 16 should implement completion review and successful-completion governance: verify 40 instructional hours, passing final examination, unresolved attendance/security exceptions, identity/enrollment status, and required school review before creating a successful-completion record. It should then prepare, but not directly automate, the FDACS/LIAS reporting queue unless a supported FDACS integration method is available.
