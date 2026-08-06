# Owner AI Site Control Architecture

Owner instruction flows through a constrained AI planner. The planner may only propose allowlisted changes to Academy release manifests, the SaaS store catalog, or product marketing catalog. The owner reviews the exact structured operations before publication.

Approved plans are applied through a server-side GitHub service using least-privilege credentials. The service creates a unique `owner-preview/*` branch, writes only approved records, and opens a draft pull request against `main`. Vercel automatically builds the branch as a preview deployment.

Production is never changed directly by the AI planner or owner control API. Promotion requires owner review of the Vercel preview, successful validation gates, and pull request merge. After merge, the production deployment must be verified again.
