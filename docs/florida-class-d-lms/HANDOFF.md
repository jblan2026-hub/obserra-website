# Obserra Florida Class D LMS Handoff

Snapshot: 2026-08-13 20:32 ET

## Authoritative scope

This handoff governs the regulated Florida Class D school and LMS workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It is separate from the commercial Obserra Academy course-production workstream.

Repository: `jblan2026-hub/obserra-website`  
Branch: `feature/florida-class-d-lms-foundation`  
Pull request: `PR #56`  
PR state at reconciliation: **open, mergeable, unmerged**.

## Current validated restart checkpoint

The exact validated handoff checkpoint is:

`af4247978c3b1b3aaac45ce7e15f321512cbf71c`

All five primary workflows are green on that exact SHA:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

The branch later advanced by one documentation-only commit to `e57be5e50c7ecfb0da9052f47bb41267aaf2087c`. Direct comparison showed only `docs/florida-class-d-lms/CURRENT-STATUS-2026-08-13.md` changed between those SHAs. No regulated LMS runtime code changed in that interval.

Historical implementation baselines remain audit evidence. The original accepted Gate 25 implementation baseline is `b45f2a021ec0b600abb8f62a2ffc9f026f294f9d`, validated by Florida Class D LMS Gates run #367. Historical SHAs are not the current restart pointer.

## Controlled Class D architecture

Gates 1 through 25 are implemented in source. The regulated architecture includes:

- Five-day / 40-hour course structure.
- Eighteen required curriculum areas.
- Four 120-minute live instructional sessions per day.
- Tracked non-credit breaks.
- Live instructor media.
- One-device attendance and presence controls.
- Recurring security challenges.
- Learner Q&A and polling.
- Controlled make-up and recorded make-up workflows.
- Separate protected 170-question final examination.
- Passing threshold of 128 correct answers out of 170.
- Remediation and retest governance.
- Successful-completion review.
- LIAS workflow.
- Completion-document handling.
- Inspection evidence and export.
- Quality/CAPA and retention/legal-hold controls.
- Database promotion readiness.
- Protected runtime readiness.
- Gate 23 non-production acceptance evidence.
- Gate 24 server-authoritative instructional text-screen timing.
- Gate 25 regulated runtime isolation.

## Gate 23 through Gate 25 current control state

Gate 23 requires an authorized development, sandbox, staging, or UAT environment, exact release-SHA binding, synthetic identities only, evidence for all 18 required acceptance domains, and fail-closed database finalization. A previous real UAT run finalized 18 of 18 domains for release SHA `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`. Because source advanced, the final production candidate requires a new candidate-bound 18-of-18 run.

Gate 24 enforces server-authoritative instructional text-screen timing using 60 seconds per 50 words, prorated by actual word count. Timing is tied to the authenticated learner and active device lease. Visible-tab heartbeats feed server-observed time. Acknowledgment is unavailable until the minimum is met. Instructor discussion confirmation is required before closure.

Gate 25 enforces regulated runtime isolation. Regulated server modules require explicit protected `OBSERRA_SUPABASE_URL` HTTPS configuration and protected server-side credentials. Hardcoded regulated Supabase project URLs and secret-class `NEXT_PUBLIC_*` configuration are prohibited. Missing or invalid protected runtime configuration fails closed.

## Controlled Class DS filing baseline

The current private controlled filing set is:

- Obserra Class DS Online LMS Training Delivery and Compliance Guide v0.15 Live Evidence Only Submission Draft, DOCX.
- Obserra Class DS Online LMS Training Delivery and Compliance Guide v0.15 Live Evidence Only Submission Draft, PDF, 43 pages.
- Florida Class DS School Submission Readiness Register v1.5 Live Evidence Only, 6 pages.
- FDACS-16003 Prefill Data Sheet v1.3.
- Florida Class DS Prefiling Compliance Audit v1.5.
- Corporate Entity, Ownership, and Class DS School Location Baseline v1.5.
- Controlled Pre-Filing Packet v0.15 Live Evidence Only, NOT FOR SUBMISSION until open filing controls close.

Controlled packet ZIP SHA-256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA-256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA-256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

Do not substitute or edit controlled filing binaries without creating a new controlled revision, rerunning render/preflight/archive validation, and updating all hashes and handoff records.

## No mockups or placeholders

All continued LMS work must be real production-grade functionality intended for operational use by students and authorized staff.

No mockup, placeholder, fabricated screenshot, simulated certificate, simulated LIAS output, fake acceptance result, fake learner workflow, source-rendered interface illustration, client-only compliance timer, simulated acknowledgment, or fake success state may be treated as implementation or filing evidence.

Evidence screenshots must come from implemented screens in the accurately identified environment. Non-production evidence must never be represented as production evidence or FDACS approval.

## Mandatory completion and certificate standard

Forty instructional hours alone do not complete the course and do not earn a completion certificate.

Successful completion requires:

1. Full five-day / 2,400-minute instructional record.
2. All 18 required curriculum areas and required checks.
3. Passing 170-question final examination at 128/170 or better.
4. Cleared completion-blocking issues.
5. Authorized school/compliance completion approval.

Only after successful completion may the learner-specific supplemental Obserra completion record be generated. The official FDACS-16103 remains LIAS-generated and must not be synthesized locally. Successful training does not itself issue a Florida Class D license.

## Filing status

Current owner-confirmed filing facts include:

- Applicant entity is the LLC.
- Class DS category is **Tuition/Fee Charging**.
- Designated filing/training email is **info@obserrallc.com**.
- Proposed school is online only with live online instruction conducted from the controlled Florida physical training location.
- Owner reports no applicable HOA or private-covenant restriction.

Remaining filing controls include the current FDACS fictitious-name supporting-document expectation, Orange County Business Tax Receipt and section 559.955 evidence, filing-day form/fee/address/instruction verification, protected Class DI information handling, training start-date control, and final compliance/counsel/owner review.

## Vercel deployment governance

The existing intended public Vercel project is `obserra-website-live`. The canonical registered company domain is `obserrallc.com`, with `www.obserrallc.com` as the public website host.

The owner reports the intended current Vercel team technical slug is `obserra`. Direct connector verification of the authoritative project/team/deployment binding remains outstanding.

Do not create another Vercel project, move the existing project, or change DNS as a workaround.

## Production boundary

Production regulated functions remain **fail closed**.

Public paid enrollment, regulated learner access, production scheduling, live Class D instruction, production examination access, LIAS production execution, completion/certificate release, observer production access, regulated database promotion, and runtime activation remain disabled until actual Class DS authorization and final production gates pass.

No CI result, source commit, UAT result, screenshot, filing draft, Class A record, corporate record, Vercel state, or deployment state is FDACS approval.

## Mandatory audit continuity rule

Every material LMS, FDACS, Vercel, CI, UAT, database, identity, media, examination, LIAS, completion, filing, security, or production-readiness action must update the controlled handoff set before the work session is considered complete.

At minimum each update must record the exact SHA or external object acted on, what changed, evidence/result, workflow/run identifiers where applicable, security/regulatory impact, production-boundary effect, rollback state, unresolved blockers, and next governed action.

`CURRENT-STATUS-2026-08-13.md`, `LATEST-HANDOFF.md`, this file, the applicable gate handoff, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` must remain synchronized. Historical implementation baselines must remain labeled as historical.

## Next controlled sequence

1. Keep the controlled handoff set synchronized with every action.
2. Continue production-grade LMS implementation only.
3. Close the remaining Class DS filing controls.
4. Reconcile the existing authoritative Vercel project without project movement or DNS change.
5. Freeze the final production candidate SHA.
6. Run the final candidate-bound Gate 23 18-of-18 non-production acceptance using synthetic identities.
7. Complete production database, runtime, media, examination-bank, LIAS, security, rollback, and owner-approval gates.
8. Do not activate regulated production functions until the Class DS license is actually issued and final production approval gates pass.
