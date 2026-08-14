# Gate 38 Exact-Release Owner Real-Identity UAT Handoff

Snapshot: 2026-08-14

## Status

Application source and the isolated database control plane are implemented and technically verified. GitHub exact-head checks, the Vercel Preview deployment, and live external provider authorization remain pending. Human review remains `pending`; the CMMC assessment finding remains `not_assessed`.

Florida Class D production authorization remains **false**. This gate does not claim FDACS licensure, FDACS online-method acceptance, CMMC certification, CUI authorization, course completion, LIAS issuance, or permission to award training credit.

## Purpose

Gate 38 provides one controlled way for the owner to exercise the real student journey before regulated launch. It uses production implementation and live hosted providers on an exact-release Vercel Preview, while the database enforces a temporary, capacity-one, non-credit boundary.

This is not a mockup or synthetic identity test. The owner enters real data only in the protected frontend and Stripe-hosted Identity flow. Identity-document images, selfie images, and biometric templates are not copied into the LMS database.

## Enforced UAT boundary

- deployment environment: Vercel Preview only;
- execution profile: `owner_uat_noncredit`;
- capacity: one owner enrollment;
- maximum authorization window: 14 days;
- exact 40-character Git release SHA required;
- SHA-256 authorization-evidence digest required;
- database production authorization must remain false;
- live Stripe Identity verification required;
- real Daily provider authorization required before media testing;
- owner allowlist and Clerk protected-route authentication required;
- a real assigned Class DI instructor, distinct from the student, must attest identity and attendance before instructional access;
- only that assigned `instructor` principal may start the UAT lesson, use its controls, or receive its Daily room-owner token;
- the Class DI qualification and license evidence must be validated, encrypted in memory with AES-256-GCM, and registered through an atomic service-role-only RPC with a bounded active-license expiration;
- training-credit eligibility is false;
- completion-record and LIAS-queue inserts are rejected;
- student self-attestation as instructor or attendance verifier is rejected.

The Clerk DNS check may remain a documented provider-domain blocker, but it is not bypassed in code and does not weaken authentication. Gate 38 uses a verified Preview URL and remains fail closed when identity configuration is incomplete.

## Source controls

- `lib/florida-class-d-owner-uat.ts` computes the fail-closed, nonsecret UAT readiness record.
- `lib/florida-class-d-provider-readiness.ts` performs read-only boundary checks for the exact Supabase project, live Stripe Identity authorization, and Daily authorization.
- `lib/florida-class-d-instructor-provisioning.ts` validates PDF/image signatures, encrypts real DI evidence before database transmission, and exposes only nonsecret record identifiers and hashes.
- `/florida-security-training/admin/instructor-file` provides the authenticated, explicitly attested administrator action that registers the DI evidence and activates the distinct Clerk instructor role.
- `/florida-security-training/admin/runtime-readiness` runs the protected read-only Supabase, live Stripe Identity, Daily, and active-DI provider preflight without creating a room, token, verification session, or student row.
- `/florida-security-training/admin/schedule` prepares the capacity-one cohort directly from the exact release, authorization-evidence digest, and bounded expiry before publishing the 20 assigned live sessions; administrators do not invent a cohort identifier.
- `/florida-security-training/admin/enrollments` exposes the final fail-closed non-credit activation action only after live provider identity and the distinct assigned-DI attestation are present.
- `/florida-security-training/enroll` collects the minimum real student enrollment fields and required acknowledgments behind Clerk authentication.
- `/florida-security-training/access` lists the activated learner's assigned live-session links with the stored facility time zone.
- Stripe-hosted Identity owns identity-document and selfie collection; the LMS records only provider references, outcomes, timestamps, and attestations.
- `supabase/migrations/20260814210337_fdacs_class_d_owner_real_identity_uat.sql` enforces the UAT profile, release binding, expiry, non-credit status, completion/LIAS guards, and distinct-instructor controls.
- `supabase/migrations/20260814213309_fdacs_class_d_owner_uat_instruction_safety.sql` adds the service-only exact-release schedule path, requires the verified-active Class DI assigned to the cohort, records no Class DS school-license claim for non-credit UAT, and requires that instructor for identity/attendance attestations.
- `supabase/migrations/20260814215217_fdacs_class_d_owner_uat_live_execution_and_instructor_provisioning.sql` restricts UAT live start to the assigned DI, requires matching unexpired evidence, makes encrypted qualification/license registration atomic and retry-safe, and exposes only nonsecret readiness counts.
- `scripts/florida-class-d-owner-uat-gate.mjs` and the FDACS database audit gate prevent source drift.
- `package.json` contains a real `typecheck` script so Vercel no longer skips the required check.

## Live Supabase receipt

- project: `OBSERRA FDACS Student Records Production`;
- project reference: `ggkxgjhsbgbifiqrhavr`;
- region: `us-east-1`;
- provider migration versions: `20260814211645`, `20260814213942`, and `20260814223854`;
- provider migration names: `fdacs_class_d_owner_real_identity_uat`, `fdacs_class_d_owner_uat_instruction_safety`, and `fdacs_class_d_owner_uat_live_execution_and_instructor_provisioning`;
- source migration SHA-256 values: `05b07bff96871a6557f6efcc533d6cb2597fa7224339b79643630c2e4fb715ab`, `d32cfbd39b666de554c1a41aab2c41a806e6cf7ebf6b356c88ea1d7843d51b14`, and `42ed2ea6658ef55d39dc6bb209043560978ac786a1c8bd37d6b2046cc6052262`;
- provider FDACS migration count: 38;
- production runtime authorized: false;
- live UAT cohort, enrollment, live-session, identity-session, instructor-file, and protected-artifact counts after testing: 0/0/0/0/0/0.

Post-apply observations:

- 64 FDACS tables; 64 forced-RLS; 64 explicit restrictive browser-deny policies;
- zero non-FDACS tables;
- zero `anon` or `authenticated` table privileges;
- zero `anon` or `authenticated` execute privileges across 114 FDACS routines;
- all security-definer routines have a controlled search path;
- zero Supabase security-advisor findings;
- zero unindexed-foreign-key findings;
- five independent hash-chain verifiers valid with zero failures;
- 103 informational performance notices: 102 unused-index notices on an empty pre-production workload and one Auth allocation notice.

Transactional negative tests rejected an expiry greater than 14 days, rejected production authorization while mandatory activation gates were false, rejected a schedule bound to the wrong release, rejected a schedule without a verified-active Class DI record, rejected live start by the wrong actor, rejected live start without matching DI evidence, and rejected verified-active provisioning without an expiration date. Structurally valid test objects existed only inside rollback transactions; no UAT cohort, enrollment, live session, instructor file, or protected artifact remained.

## CMMC Level 2 alignment

Gate 38 supplies engineering evidence for the existing CMMC Level 2 Rev. 2 / NIST SP 800-171 mappings, principally:

- `3.1.1`, `3.1.2`, and `3.1.5`: owner allowlist, assigned-instructor authorization, lesson-resource scope checks, service-role-only database functions, and least-privilege provider boundaries;
- `3.3.1`, `3.3.2`, and `3.3.8`: correlated audit events, tamper-evident hash chains, immutable execution-profile evidence, and protected audit records;
- `3.4.1` and `3.4.3`: exact migration lineage, deterministic manifest digest, exact-release binding, and controlled change records;
- `3.5.1` and `3.5.2`: Clerk user identity plus live hosted identity proofing, without storing document images in the LMS;
- `3.12.1`, `3.12.3`, and `3.12.4`: machine/human audit outputs, continuous technical checks, claim boundaries, and pending human disposition;
- `3.13.1`, `3.13.8`, `3.13.11`, and `3.14.6`: fail-closed external service boundaries, encrypted evidence transmission/storage, read-only provider readiness, and operational monitoring.

These mappings describe control intent and collected technical evidence. They do not convert any CMMC objective to an assessor finding. Formal assessment results remain `not_assessed`, and human approval remains `pending`.

## Provider and deployment dependencies

The following actions require action-time owner confirmation because they authorize external data sharing or protected credential placement:

1. link the existing isolated Supabase project to the intended Vercel Preview scope or place its protected server credential there, together with a generated 32-byte record-encryption key and external key reference;
2. link/import the existing Stripe account, enable live Identity, and register a dedicated Preview webhook;
3. place an existing Daily API credential in the Preview scope;
4. authorize the exact-release, expiring UAT environment variables and create the capacity-one cohort for the final deployed commit.

Secrets and real learner PII must not be posted in chat, GitHub, public logs, or audit documents.

## Required final verification

1. Publish the exact FDACS-only commit and open a pull request.
2. Require the exact PR head to pass Florida Class D LMS, Website CI, CodeQL, and Vercel checks.
3. Deploy the same Git SHA to the intended Vercel Preview project.
4. Complete the protected read-only Supabase, live Stripe Identity, Daily, and active-DI provider-readiness checks.
5. Use the protected instructor-provisioning page to register authentic, unexpired DI evidence for a distinct Clerk account; preserve only the returned IDs/hashes in the audit trail.
6. Use the protected scheduler to create the exact-release, capacity-one cohort with a maximum 14-day expiry, assign that DI account, and retain the generated instructor/student session links.
7. Have the owner use the protected frontend and Stripe-hosted Identity flow.
8. Have the assigned Class DI instructor complete the required live identity attestation, then use the protected enrollment screen to activate the non-credit owner enrollment.
9. Use the learner's assigned-session list and have the assigned instructor complete the daily identity/attendance attestations before instructional time is credited.
10. Verify video, attendance, database records, audit chains, and the non-credit completion/LIAS rejection boundary.
11. Preserve the resulting evidence while leaving production activation and human approval pending.

## Audit records

- `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT-SOURCE.json`
- `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json`
- `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.md`
- `docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256`
- `docs/florida-class-d-lms/ACTION-LEDGER-GATE-35-ADDENDUM.md`

## Claim boundary

Gate 38 proves the implemented source controls, the applied isolated-database schema, the service-only encrypted instructor-provisioning boundary, and the listed post-apply negative tests. It does not yet prove external key custody, configured external providers, authentic instructor evidence, a successful real owner workflow, Vercel Preview readiness, FDACS acceptance, a licensed production school/instructor relationship, backup restoration, HA failover, protected export finalization, or CMMC certification.
