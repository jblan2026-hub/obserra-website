# Owner AI Site Control Release Notes

## Added

* Public Obserra Academy certificate verification service, API, and page.
* Direct certificate links to public verification.
* Governed Academy final release inbox and course release schema.
* Owner notification ledger for pending course releases.
* Constrained owner AI website change planner.
* Owner-only planning and preview APIs.
* Owner AI website control page.
* GitHub preview branch and draft pull request publication path.
* Vercel preview requirement before production promotion.
* Expanded production smoke coverage for certificate verification and owner controls.

## Security posture

* Owner authentication and email allowlist required.
* AI cannot write arbitrary files, delete content, access secrets, deploy directly, or change production.
* All writes are restricted to `owner-preview/*` branches.
* Production remains unchanged until owner review, green validation, and pull request merge.

## Validation status

The Vercel preview build for the complete owner control page is READY. The end-to-end owner-authenticated AI planning and GitHub publication flow still requires configured production secrets and owner execution in preview before production merge.
