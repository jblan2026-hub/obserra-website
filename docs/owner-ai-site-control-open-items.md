# Open Validation Items

The following items must be completed before production merge:

1. Configure `AI_GATEWAY_API_KEY` in the Vercel preview environment.
2. Configure `OBSERRA_OWNER_AI_MODEL` using an approved current Vercel AI Gateway model identifier.
3. Configure a least-privilege `OBSERRA_GITHUB_PUBLISH_TOKEN` with repository contents and pull request permissions only.
4. Sign in through the allowlisted owner Clerk account.
5. Submit a real course or catalog change instruction.
6. Review the generated structured change plan.
7. Create an owner preview branch and draft pull request from the control center.
8. Confirm the resulting Vercel preview is READY.
9. Validate the changed page, product card, course description, lessons, quizzes, instructional hours, price, and certificate disclosure.
10. Run production smoke tests against the preview URL.
11. Resolve all errors and repeat the preview cycle.
12. Merge only after every gate is green.
13. Verify the production deployment and public routes after merge.
