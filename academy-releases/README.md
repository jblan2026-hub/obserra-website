# Obserra Academy Final Release Inbox

This directory is the governed production intake point for completed Obserra Academy course packages.

## Workflow

1. Create one folder under `academy-releases/pending/<course-id>`.
2. Add a complete `course.release.json` manifest that conforms to `academy-releases/course-release.schema.json`.
3. Include course description, audience, outcomes, total instructional hours, lessons, lesson descriptions, quiz questions, certificate settings, price, and deployment status.
4. Set `ownerApproval.status` to `pending` for owner review.
5. The validation job writes a summarized owner notification record to `academy-releases/owner-notifications.json`.
6. The owner sets the approved price and changes `ownerApproval.status` to `approved`, with approver and approval timestamp.
7. Run `npm run academy:release`.
8. The release compiler validates every manifest and publishes only approved records into `app/academy/generated/studio-catalog.json`.
9. The website reads the generated catalog and automatically populates interactive course cards, course details, lesson metadata, assessment content, hours, price, and certificate information.

## Production rules

A course cannot be published when:

* owner approval is missing;
* price is missing or negative;
* total instructional hours do not reconcile to lesson durations;
* a lesson lacks a title, description, format, or duration;
* fewer than 25 final assessment questions are supplied;
* an assessment question lacks four answer options and one valid answer index;
* certificate verification is disabled;
* the course identifier conflicts with an existing course;
* the release status is not `approved` or `published`.

The production compiler must fail closed. Invalid or unapproved packages remain in the pending folder and do not alter the live catalog.
