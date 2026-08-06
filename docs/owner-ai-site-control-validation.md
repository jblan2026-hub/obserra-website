# Owner AI Website Control Validation

The owner AI website control feature is not complete until all gates below are green.

1. Owner authentication is required.
2. Non-owner requests fail closed.
3. AI output is constrained to allowlisted structured operations.
4. Arbitrary paths, deletions, secrets, deployments, and direct publication are prohibited.
5. The owner reviews the generated plan before any repository write.
6. Approved changes are written only to an `owner-preview/*` branch.
7. A draft pull request is created against `main`.
8. Vercel creates a preview deployment from the preview branch.
9. Production remains unchanged until the pull request is approved and merged.
10. Lint, tests, production build, route smoke checks, and Vercel preview verification must pass before merge.
11. Course releases require valid descriptions, lessons, knowledge checks, final assessment questions, hours, price, owner approval, and verified certificate settings.
12. Any failed gate blocks production promotion and requires correction and a new preview.
