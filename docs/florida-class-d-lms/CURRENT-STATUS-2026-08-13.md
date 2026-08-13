# Florida Class D LMS Current Status

Snapshot: 2026-08-13

This controlled status supplements the existing handoff set for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. This file is the current restart pointer when older handoff documents contain earlier checkpoints.

## Source/build

Validated branch head before this status update: `6c4275e751af785e0ad7f4397f35fc106515145d`.

Green on that head: Florida Class D LMS Gates #399, Website CI #1939, Academy 70x Production Gate #1117, Application Release Validation #806, and Application Production Pipeline #824.

The GitHub/Vercel history still contains a legacy `Vercel – obserra-website-live` cancellation. The repository-wide production source of truth requires one authoritative public Vercel project and production branch to be designated and directly verified before production promotion. Do not treat repository CI as proof of the exact public deployment.

## Security and UAT

Gates 1-25 remain implemented and fail closed. The regulated completion-document bucket is source controlled, private, PDF-only, limited to 10 MiB, and the server runtime requires the exact protected bucket binding.

UAT verification confirms the completion-document bucket exists with the intended private/PDF-only/10 MiB contract. Storage RLS is enabled and no bucket-specific browser-role object policy exists for the regulated completion-document bucket, consistent with the intended server-side service-role-only access path.

A real UAT Gate 23 run previously finalized 18/18 required domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. Because source advanced afterward, the final frozen production candidate requires a new 18/18 UAT run bound to the exact release SHA actually deployed to the authorized nonproduction environment.

## Class DS filing artifacts

The current private controlled filing set is the live-evidence-only revision:

- `Obserra Class DS Online LMS Training Delivery and Compliance Guide v0.15 Live Evidence Only Submission Draft`, 43 pages.
- `Florida Class DS School Submission Readiness Register v1.5 Live Evidence Only`, 6 pages.
- `FDACS-16003 Prefill Data Sheet v1.3`.
- `Florida Class DS Prefiling Compliance Audit v1.5`.
- `Corporate Entity, Ownership, and Class DS School Location Baseline v1.5`.
- `Controlled Pre-Filing Packet v0.15 Live Evidence Only`, explicitly NOT FOR SUBMISSION until open filing controls close.

The v0.15 guide and v1.5 readiness register completed render-and-inspect QA. Their PDFs open successfully, are not encrypted, are not image-only, contain no XFA, and returned no warnings from the controlled PDF preflight checks.

The filing packet contains 23 controlled files. Archive integrity validation passed. The packet contains only two retained implementation screenshots, both actual nonproduction captures. Simulated, source-rendered, demonstration, mock, and placeholder interface screenshots are excluded as filing evidence. Architecture/process diagrams in the guide are explanatory diagrams and are not represented as live user-interface evidence.

The protected exam answer-key blueprint is excluded from the shared packet. A post-build archive exclusion check confirms no exam-key, answer-key, or blueprint file is present.

The controlled packet ZIP SHA-256 is `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.

## Filing attachment revision control

The exact curriculum and 170-question final examination selected as filing candidates are frozen by filename and SHA-256 digest in the private packet and its `SHA256SUMS.txt`:

- Curriculum SHA-256: `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.
- Final examination SHA-256: `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

Do not substitute or edit those binaries after filing review begins without issuing a new controlled revision and revalidating the packet.

The current FDACS-16003 form, Rev. 05/2023 as last verified, lists the curriculum, final examination, and proof-of-fictitious-name filing as required supporting documentation for Class DS applicants, including Internet-Based/Correspondence instruction. The fictitious-name documentation item remains open for filing-day resolution and must not be marked not-applicable solely because the LLC legal name is being used.

## Owner-confirmed filing facts

The applicant is a Florida single-member limited liability company. The sole member is also the manager. The Class DS filing must preserve the LLC as the applicant entity and must not misclassify the business as an unincorporated sole proprietorship. The exact owner/manager name and title are maintained in the controlled filing copy.

The owner confirms the proposed Class DS school is online-only. The physical Florida school/training location is the residential location from which the live online Class D instruction will actually be conducted. The Class DS school mailing address is the same as that physical training location. Exact street-address and phone details are maintained privately and are not reproduced here.

The Class DS application is pending submission. A separate Class A agency record exists but does not replace the Class DS school-license requirement.

## Home-based school location control

Florida Statute 559.955 is part of the current location-compliance baseline. A qualifying home-based business may operate in an area zoned for residential use and may not be prohibited, restricted, regulated, or licensed differently from other businesses except as the statute permits. Applicable business taxes under Chapter 205 remain applicable. The statute also preserves private condominium, cooperative, and homeowners-association declarations and covenants.

Accordingly, local land-use review is not treated as a generic discretionary zoning blocker merely because the Class DS school location is residential. The remaining local operating control is to complete the applicable Orange County Business Tax Receipt process and maintain evidence of compliance with the home-based-business criteria in section 559.955, plus any applicable private declaration or covenant.

This local home-based-business protection does not replace or reduce the separate Chapter 493 and FDACS requirements. The Class DS application must identify the street address where training is conducted; online Class D training must be live and conducted from a physical location in Florida; and required online training/security records must be maintained and producible from the school or training facility's Florida place of business.

## Unresolved filing controls before signature/submission

The remaining filing controls are:

1. Owner selection of the FDACS-16003 Class DS category: Tuition/Fee Charging, Community College/Vocational, or Non Tuition/Non Fee Charging. Do not infer the category.
2. Confirm the final designated school filing/training email.
3. Resolve the current FDACS proof-of-fictitious-name supporting-document expectation for an applicant filing under its exact legal LLC name.
4. Complete the applicable Orange County Business Tax Receipt process and preserve section 559.955 compliance evidence.
5. Confirm whether any applicable private HOA, declaration, or covenant restricts the home-based operation.
6. On filing day, re-download the current official FDACS-16003, verify revision, fee schedule, mailing address, and supporting-document instructions, then complete, sign, and date it.
7. Insert or verify confidential Class DI information only in the protected filing copy or official process as required.
8. Set the training start date only when the licensing and launch schedule is approved.
9. Complete final compliance, counsel, and owner review before submission.

A Class DS license number is not a pre-filing field and must not be invented before issuance.

## Operational launch controls after filing work

The following remain separate production-launch controls and must not be confused with whether the Class DS application packet can be submitted: reconcile the authoritative Vercel production project, freeze the final release-candidate SHA, deploy it to the authorized nonproduction environment, rerun the protected Gate 23 acceptance for that exact SHA with all 18 domains passed, preserve authentic candidate-bound evidence, complete production database/runtime/LIAS/exam-bank/security/rollback validation, obtain the actual Class DS license, and record owner release approval.

## Production boundary

Public regulated enrollment, learner access, production scheduling, live instruction, examination access, completion issuance, LIAS execution, certificate release, and production database promotion remain disabled. Production requires actual Class DS authorization plus final security, database, runtime, LIAS, exam-bank, acceptance, deployment, operations, and owner approval.

No CI result, screenshot, draft, UAT record, Class A record, pending Class DS application, corporate filing record, or home-based-business statute is FDACS approval.

## Restart sequence

1. Read this file together with the Gate 23, Gate 24, Gate 25, DS submission guide control, and repository production-readiness source-of-truth documents.
2. Treat private filing package v0.15 and readiness register v1.5 as the current live-evidence-only workpaper set. Do not revert to v0.10-v0.14 artifacts.
3. Preserve the LLC entity classification, sole-member/manager filing facts, owner-confirmed physical Florida training location, section 559.955 analysis, exact filing hashes, and live-evidence-only rule.
4. Resolve the remaining filing controls before signature/submission.
5. Separately reconcile authoritative deployment ownership, freeze the production candidate, and run the final candidate-bound 18/18 UAT acceptance before launch approval.
6. Preserve authentic evidence and final release hashes.
7. Do not activate production regulated functions until the Class DS license is actually issued and final production approval gates pass.