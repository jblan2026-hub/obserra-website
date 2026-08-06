# Academy Release Pipeline

Approved production courses move through the following controlled sequence:

1. A complete course package is placed under `academy-releases/pending/<course-id>/course.release.json`.
2. The package includes course metadata, description, audience, outcomes, lessons, lesson content, knowledge checks, final assessment questions, instructional hours, certificate settings, and proposed price.
3. The owner control center displays the pending release and notification.
4. The owner may ask the AI control center to revise approved fields using plain language.
5. The AI produces an allowlisted structured change plan and cannot publish directly.
6. The owner reviews and approves the plan.
7. The system creates an `owner-preview/*` GitHub branch and draft pull request.
8. Vercel builds a preview deployment.
9. The owner reviews the interactive course card, course details, lesson structure, quiz content, hours, price, checkout messaging, and certificate disclosure.
10. Lint, tests, production build, smoke checks, and preview checks must be green.
11. The pull request is merged only after owner approval.
12. The production deployment is verified after merge.

Any validation error blocks publication and requires a corrected release package and new preview cycle.
