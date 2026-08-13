# Florida Class D LMS Current Status

Snapshot: 2026-08-13

This controlled status supplements the existing handoff set for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. This file is the current restart pointer when older handoff documents contain earlier checkpoints.

## Source/build

Validated branch head before this status update: `4512fd610ca6509e30ae3d9b0389d2bec8e0e5be`.

Green on that head: Florida Class D LMS Gates #398, Website CI #1937, Academy 70x Production Gate #1116, Application Release Validation #805, and Application Production Pipeline #823.

The GitHub/Vercel history still contains a legacy `Vercel – obserra-website-live` cancellation. The repository-wide production source of truth requires one authoritative public Vercel project and production branch to be designated and directly verified before production promotion. Do not treat repository CI as proof of the exact public deployment.

## Security and UAT

Gates 1-25 remain implemented and fail closed. The regulated completion-document bucket is source controlled, private, PDF-only, limited to 10 MiB, and the server runtime requires the exact protected bucket binding.

UAT verification confirms the completion-document bucket exists with the intended private/PDF-only/10 MiB contract. Storage RLS is enabled and no bucket-specific browser-role object policy exists for the regulated completion-document bucket, consistent with the intended server-side service-role-only access path.

A real UAT Gate 23 run previously finalized 18/18 required domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. Because source advanced afterward, the final frozen production candidate requires a new 18/18 UAT run bound to the exact release SHA actually deployed to the authorized nonproduction environment.

## Class DS filing artifacts

The private controlled filing set is entity synchronized to the filed Articles corporate baseline. Current private artifacts are:

- `Obserra Class DS Online LMS Training Delivery and Compliance Guide v0.11 Entity-Synchronized Draft`, 57 pages.
- `Florida Class DS School Submission Readiness Register v1.1`, 5 pages.
- `Florida Class DS Prefiling Compliance Audit v1.1`.
- `Controlled Pre-Filing Packet v0.11`, explicitly NOT FOR MAILING until open filing controls close.

The corporate legal name, entity record, principal/mailing office, manager, filing dates, proposed online training location, school contact facts, and ownership facts are maintained in the private filing package. Residential address details, license identifiers, and other protected values are not duplicated in this public repository.

Only actual retained implementation captures are treated as evidence. Source-rendered interface illustrations remain explicitly non-evidentiary. The external packet excludes the protected exam answer-key blueprint.

## Filing attachment revision control

The exact curriculum and 170-question final examination selected as current filing candidates are frozen by filename and SHA-256 digest in the private packet and its `SHA256SUMS.txt`. Do not substitute or edit those binaries after filing review begins without issuing a new controlled revision and revalidating the packet.

The current FDACS-16003 form, Rev. 05/2023 as last verified, lists the curriculum, final examination, and proof of fictitious-name filing as required supporting documentation for Class DS applicants, including Internet-Based/Correspondence instruction. The fictitious-name documentation item remains open for filing-day resolution and must not be marked not-applicable solely because the LLC legal name is being used.

## Owner-confirmed filing facts

The applicant is a Florida single-member limited liability company. The sole member is also the manager. The Class DS filing must preserve the LLC as the applicant entity and must not misclassify the business as an unincorporated sole proprietorship. The exact owner/manager name and title are maintained in the controlled filing copy.

The owner confirms the proposed Class DS school is online-only. The physical Florida school/training location is a residential location from which the live online Class D instruction will actually be conducted. The exact address and phone are maintained privately and are not reproduced here.

The Class DS application is pending submission. A separate Class A agency record exists but does not replace the Class DS school-license requirement.

## Home-based school location control

Florida Statute 559.955 is part of the current location-compliance baseline. A qualifying home-based business may operate in an area zoned for residential use and may not be prohibited, restricted, regulated, or licensed differently from other businesses except as the statute permits. Applicable business taxes under Chapter 205 remain applicable. The statute also preserves private condominium, cooperative, and homeowners-association declarations and covenants.

Accordingly, local land-use review is not treated as a generic discretionary zoning blocker merely because the Class DS school location is residential. The remaining local operating control is to complete the applicable Orange County business-tax-receipt process and maintain compliance with the home-based-business criteria in section 559.955, plus any applicable private declaration or covenant.

This local home-based-business protection does not replace or reduce the separate Chapter 493 and FDACS requirements. The Class DS application must identify the street address where training is conducted; online Class D training must be live and conducted from a physical location in Florida; and required online training/security records must be maintained and producible from the school or training facility's Florida place of business.

## Unresolved filing items before signature/submission

The remaining pre-filing controls are: complete the applicable local business-tax-receipt process; confirm any applicable private HOA/covenant restriction does not prohibit the home-based operation; resolve the FDACS-16003 fictitious-name proof requirement; confirm the final school-designated filing email; verify the current FDACS-16003 revision and fee schedule on filing day; complete/sign/date the current official form; insert/verify confidential DI information only in the protected filing copy; preserve exact curriculum/exam digests; collect the remaining authentic UAT captures; reconcile the authoritative Vercel production project; freeze the final release candidate; run candidate-bound 18/18 UAT acceptance; and complete final compliance/counsel/owner review.

A Class DS license number is not a pre-filing field and must not be invented before issuance.

## Production boundary

Public regulated enrollment, learner access, production scheduling, live instruction, examination access, completion issuance, LIAS execution, certificate release, and production database promotion remain disabled. Production requires actual Class DS authorization plus final security, database, runtime, LIAS, exam-bank, acceptance, deployment, operations, and owner approval.

No CI result, screenshot, draft, UAT record, Class A record, pending Class DS application, corporate filing record, or home-based-business statute is FDACS approval.

## Restart sequence

1. Read this file together with the Gate 23, Gate 24, Gate 25, DS submission guide control, and repository production-readiness source-of-truth documents.
2. Treat the private v0.11/v1.1 filing package as the current filing workpaper set; do not submit it until open filing controls close.
3. Preserve the LLC entity classification, sole-member/manager filing facts, owner-confirmed physical Florida training location, and section 559.955 home-based-business analysis in the controlled filing package.
4. Complete local BTR/covenant verification, resolve filing-day form/document requirements, and reconcile authoritative deployment ownership before freezing the candidate.
5. Deploy the frozen candidate to the authorized nonproduction environment and rerun the real 18/18 Gate 23 acceptance against that exact SHA.
6. Preserve authentic evidence and final filing hashes.
7. Do not activate production regulated functions until the Class DS license is actually issued and final production approval gates pass.