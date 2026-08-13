# Florida Class D LMS Current Status

Snapshot: 2026-08-13

This controlled status supplements the existing handoff set for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Source/build

Current branch head before this status update: `b89885c246d1c0bab14cddc9307c63a7c5e2ccc2`.

Green on that head: Florida Class D LMS Gates #396, Website CI #1929, Academy 70x Production Gate #1114, Application Release Validation #803, and Application Production Pipeline #817.

The GitHub combined status also contains a historical `Vercel – obserra-website-live` failure marked `Canceled from the Vercel Dashboard`; the repository-wide production source of truth already requires one authoritative public Vercel project and production branch to be designated and directly verified before promotion.

## Security and UAT

Gates 1-25 remain implemented and fail closed. The regulated completion-document bucket is source controlled, private, PDF-only, limited to 10 MiB, and the server runtime requires the exact protected bucket binding.

UAT verification confirms the completion-document bucket exists with the intended private/PDF-only/10 MiB contract. Storage RLS is enabled and no bucket-specific browser-role object policy exists for the regulated completion-document bucket, consistent with the intended server-side service-role-only access path.

A real UAT Gate 23 run previously finalized 18/18 required domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. Because source advanced afterward, the final frozen production candidate requires a new 18/18 UAT run bound to the exact final candidate SHA.

## Class DS filing artifacts

The controlled LMS guide has been revised outside the public repository to `v0.10 Evidence-Synchronized Submission Draft`, 56 pages. A five-page `Florida Class DS School Submission Readiness Register v1.0` and a pre-filing consistency audit were also produced.

The revised guide separates illustrative source-rendered interface views from authentic implementation evidence. Only actual retained screenshots are treated as evidence. Missing live captures remain open and must not be synthesized.

The external pre-filing packet excludes the protected exam answer-key blueprint.

## Owner-confirmed filing facts

The owner confirms that the proposed Class DS school is online-only and that its Florida physical location is the same street address as its mailing address. The exact address and phone are maintained in the controlled filing package and are not reproduced in this public repository.

The Class DS application is pending submission. A separate Class A agency record exists but does not replace the Class DS school-license requirement.

For the Class DS filing, the confirmed Florida street address is intended to be the physical location from which the live online Class D instruction is conducted. Online-only delivery does not remove the statutory physical-location requirement. Final licensing review must also preserve applicable license/notice posting requirements for the licensed physical location.

## Unresolved filing items before signature/mailing

The exact frozen curriculum revision, exact frozen 170-question exam revision, fictitious-name proof if applicable, current official FDACS-16003 completion/signature, confidential DI information insertion/verification, remaining authentic live UAT captures, final candidate SHA, candidate-bound 18/18 UAT acceptance, final deployment-project reconciliation, and final compliance/counsel/owner review remain required.

A Class DS license number is not a pre-filing field and must not be invented before issuance.

## Production boundary

Public regulated enrollment, learner access, production scheduling, live instruction, examination access, completion issuance, LIAS execution, certificate release, and production database promotion remain disabled. Production requires actual Class DS authorization plus final security, database, runtime, LIAS, exam-bank, acceptance, operations, and owner approval.

No CI result, screenshot, draft, UAT record, Class A record, or pending Class DS application is FDACS approval.