# Production Error Incident

Date: 2026-08-05

## Summary

The production website returned HTTP 500 responses because Clerk middleware rejected the configured publishable key as invalid. Vercel runtime logs recorded the failure on the root route and identified the middleware handler as the source.

## Impact

Public requests to the root route intermittently failed with HTTP 500 while the invalid Clerk configuration was active.

## Root cause

The production deployment contained a Clerk publishable key that did not pass Clerk validation. The prior middleware readiness check only tested whether the two Clerk variables were nonempty. It did not validate key format or confirm that the publishable and secret keys belonged to the same Clerk environment.

## Remediation

1. Validate Clerk publishable and secret key format before initializing Clerk middleware.
2. Require matching test or live environments for the two keys.
3. Fall back to a public site configuration gate when identity configuration is invalid.
4. Prevent ClerkProvider from initializing when the configuration is invalid.
5. Expose an identity configuration status response header during fail-safe operation.
6. Correct the contact page React lint failure caused by setting state directly inside an effect.

## Acceptance criteria

1. Public routes return successful responses when Clerk configuration is invalid.
2. Protected and identity routes redirect to the Academy not-ready state until valid credentials are present.
3. Valid matching Clerk credentials restore normal authentication middleware.
4. Production runtime logs contain no new publishable-key HTTP 500 errors after deployment.
5. The Vercel lint deployment check passes.
