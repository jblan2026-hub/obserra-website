# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 20:27 ET

This is the current restart pointer for the regulated Florida Class D LMS and Class DS filing workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Authoritative repository state

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/florida-class-d-lms-foundation`

Pull request: `PR #56`

PR state at reconciliation: **open, mergeable, unmerged**.

The exact validated handoff checkpoint is `af4247978c3b1b3aaac45ce7e15f321512cbf71c`.

All five primary workflows are green on that exact SHA:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

The branch subsequently advanced by one documentation-only commit to `e57be5e50c7ecfb0da9052f47bb41267aaf2087c`. Direct GitHub comparison confirms that the only file changed between `af4247978c3b1b3aaac45ce7e15f321512cbf71c` and `e57be5e50c7ecfb0da9052f47bb41267aaf2087c` was `docs/florida-class-d-lms/CURRENT-STATUS-2026-08-13.md`. No regulated LMS runtime code changed in that interval.

## Controlled filing-artifact baseline

The current private controlled filing set is the live-evidence-only revision:

- LMS Guide DOCX: v0.15 Live Evidence Only Submission Draft.
- LMS Guide PDF: v0.15 Live Evidence Only Submission Draft, 43 pages.
- Submission Readiness Register: v1.5 Live Evidence Only, 6 pages.
- FDACS-16003 Prefill Data Sheet: v1.3.
- Florida Class DS Prefiling Compliance Audit: v1.5.
- Corporate Entity, Ownership, and Class DS School Location Baseline: v1.5.
- Controlled Pre-Filing Packet: v0.15 Live Evidence Only, NOT FOR SUBMISSION until open filing controls close.

Controlled packet ZIP SHA-256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA-256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA-256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

Do not substitute or edit controlled filing binaries without issuing a new controlled revision, rerunning render/preflight/integrity validation, and updating the hashes.

## Gates 23 through 25

Gate 23 is implemented and includes protected non-production acceptance records, exact release-SHA binding, synthetic-identity confirmation, all 18 required acceptance domains, protected staff operation, evidence-required passing checks, and fail-closed database finalization. A real UAT acceptance run previously finalized 18 of 18 required domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. Because source advanced afterward, the final frozen production candidate requires a new 18-of-18 Gate 23 run bound to the exact candidate SHA actually deployed to the authorized non-production environment.

Gate 24 is implemented end to end. Instructional text-screen timing is server authoritative using the 60-seconds-per-50-words rule prorated by word count. Timing is tied to the authenticated learner and active device lease, visible-tab heartbeats feed server-observed time, acknowledgment is blocked until the authoritative minimum is met, and documented instructor discussion is required before controlled closure.

Gate 25 remains mandatory and fail closed. Regulated server modules require explicit protected `OBSERRA_SUPABASE_URL` HTTPS runtime configuration and protected server-side credentials. The mandatory runtime-isolation audit remains part of the dedicated Class D workflow and prohibits hardcoded regulated Supabase project URLs and secret-class `NEXT_PUBLIC_*` configuration.

Historical implementation SHAs in gate-specific handoffs remain audit evidence of when those controls were first accepted. They are not the current restart head. The current validated five-green checkpoint is `af4247978c3b1b3aaac45ce7e15f321512cbf71c`.

## No mockups, placeholders, or simulated evidence

All continued LMS work must be real production-grade implementation intended for student and staff operation. No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, fake acceptance result, fake student workflow, source-rendered interface illustration, or non-operational success state may be treated as implementation or filing evidence.

Evidence screenshots must come from the implemented LMS in an accurately identified development, staging, UAT, or authorized production environment. The v0.15 controlled packet contains only retained authentic non-production implementation captures as recorded by the controlled status.

## Completion and certificate boundary

Forty instructional hours alone do not complete the course and do not earn a completion certificate. Successful completion requires the controlled five-day / 2,400-minute record, all required curriculum areas and checks, a passing 170-question final examination at 128/170 or better, cleared completion blockers, and authorized school/compliance completion approval.

Only after successful completion may the learner-specific supplemental Obserra completion record be generated. The official FDACS-16103 remains LIAS-generated and must not be synthesized locally.

## Filing status and remaining controls

Owner-confirmed filing facts currently include:

- Applicant entity remains the LLC, not an unincorporated sole proprietorship.
- Class DS category: **Tuition/Fee Charging**.
- Designated school filing and training email: **info@obserrallc.com**.
- Proposed school is online only with live online instruction conducted from the controlled Florida physical training location.
- Owner reports no HOA or private-covenant restriction applicable to the proposed home-based school operation.

Remaining filing controls include resolution of the current FDACS fictitious-name supporting-document expectation, Orange County Business Tax Receipt completion and section 559.955 evidence, filing-day verification of the current official form/instructions/fees/address, protected Class DI information handling, training start-date control, and final compliance/counsel/owner review.

## Vercel and deployment governance

The existing intended Vercel project remains `obserra-website-live`, with public hostname `https://obserra-website-live.vercel.app/` and canonical company website host `www.obserrallc.com`.

The owner reports the current intended Vercel team technical slug is `obserra`. Direct Vercel control-plane verification is not available in the present connector context, so the authoritative project/team/deployment binding remains an open operational verification item.

Do not create another Vercel project, move the existing project, or change DNS as a workaround.

## Production and regulatory boundary

Production remains **fail closed**.

Public regulated enrollment, regulated learner access, production scheduling, live Class D instruction, production examination access, LIAS production execution, completion/certificate release, and production Class D database promotion remain disabled until actual Class DS authorization and the final production gates pass.

No CI result, source commit, UAT result, screenshot, filing draft, corporate filing, Class A record, Vercel authorization, or deployment status is FDACS approval.

## Mandatory audit continuity rule

Every material LMS, FDACS, Vercel, UAT, CI, database, media, identity, examination, LIAS, filing, or production-readiness action must update the controlled handoff record before the work session is considered complete. The update must preserve the exact SHA or external object acted on, evidence/result, runtime or documentation impact, security/regulatory impact, production-boundary effect, remaining blockers, and next governed action.

`CURRENT-STATUS-2026-08-13.md`, this file, the applicable gate handoff, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` must not be allowed to drift from one another. Historical baselines must remain labeled as historical rather than being presented as the current restart pointer.

## Next governed sequence

1. Synchronize the remaining stale handoff and DS submission-control documents to this reconciled state.
2. Continue production-grade LMS implementation only, with no mockups or placeholders.
3. Close the remaining Class DS filing controls and issue a new controlled filing revision only when actual evidence changes.
4. Reconcile the authoritative existing Vercel project without moving it or changing DNS.
5. Freeze the final production candidate SHA.
6. Deploy that exact candidate to the authorized non-production environment and rerun all 18 Gate 23 domains with synthetic identities.
7. Complete production database, runtime, media, exam-bank, LIAS, security, rollback, and owner-approval gates.
8. Do not activate regulated production functions until the Class DS license is actually issued and the final production gates pass.
