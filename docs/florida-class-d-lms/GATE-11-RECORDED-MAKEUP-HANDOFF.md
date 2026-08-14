# Florida Class D Gate 11 Handoff — Protected Recorded Make-Up Delivery

## Scope

This handoff governs the controlled recorded make-up delivery increment for the Florida Class D LMS operated by **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**. It remains separate from the commercial Obserra Academy Course 1-N / LearnWorlds production workstream.

Public state remains `COMING SOON · LMS IN PROGRESS`. The owner reports an active Class DI instructor license and a pending Class DS school/training facility application. Production recorded make-up delivery remains fail closed until the Class DS and production activation gates are satisfied.

## Regulatory boundary

Florida Statutes section 493.6132 requires a Class D online course to be conducted live and permits a licensed school or training facility to deliver part of missed live instruction using recordings only for an applicant who was absent during a portion of a live online class, as limited by department rule. Gate 11 therefore treats recorded content only as controlled absence recovery. It does not allow recorded delivery to replace the live five-day Class D course.

The current adopted Rule 5N-1.140 is effective November 28, 2024. This source implementation is designed for submission and inspection readiness but does not itself constitute FDACS approval.

## Implemented Gate 11 controls

- dedicated durable recorded-playback session records tied to one make-up assignment and learner enrollment;
- one active recorded-playback device/session per learner;
- protected browser-instance and authenticated Clerk-session binding;
- server-authoritative playback heartbeat transaction;
- server credit limited to elapsed wall time and observed normal-speed playback progression;
- forward seeking and accelerated playback cannot manufacture credited instructional time;
- hidden-tab playback does not receive credit;
- playback credit stops when a presence challenge becomes due;
- presence challenge interval set below two hours at 110 minutes;
- challenge expiry and limited retry handling;
- failed or expired presence verification invalidates the playback session for instructor review;
- protected recorded-media origin remains server configured and is not stored in public source;
- completed playback creates an auditable `recorded-playback:<session-id>` evidence reference;
- completed playback moves the make-up assignment to `ready_for_review` only;
- recorded playback never self-certifies instructional credit;
- Gate 10 atomic instructor certification remains the only path that can convert reviewed make-up evidence into credited instructional time;
- existing student-to-instructor question workflow remains available beside the recorded player;
- original live attendance remains unchanged.

## Primary source artifacts

- `supabase/migrations/20260813053000_fdacs_class_d_recorded_makeup_playback.sql`
- `lib/florida-class-d-recorded-makeup.ts`
- `app/api/florida-class-d/recorded-makeup/route.ts`
- `app/florida-security-training/makeup/RecordedMakeupPlayer.tsx`
- `app/florida-security-training/makeup/MakeupPortal.tsx`
- `scripts/florida-class-d-recorded-makeup-gate.mjs`

## Production configuration

Recorded make-up delivery requires all existing Class D make-up controls plus:

- `OBSERRA_FDACS_CLASS_D_RECORDED_MAKEUP_ENABLED=enabled`
- `OBSERRA_FDACS_RECORDED_MEDIA_ORIGIN=<protected HTTPS media origin>`

The protected media origin must not contain public directory browsing or unauthenticated course listings. Final production media delivery should use a private origin or equivalent access-controlled object delivery architecture.

## Evidence flow

1. Authorized staff creates a `recorded_makeup` assignment tied to the missed day/module and a controlled asset reference.
2. The authenticated learner starts the assignment from the Class D make-up portal.
3. The server binds the playback session to learner identity, Clerk session, and browser instance.
4. The player reports position and visibility every 30 seconds.
5. The database credits only time supported by elapsed wall time and normal playback progression.
6. Presence verification interrupts credit no later than the controlled challenge interval.
7. On sufficient verified watch time and no unresolved challenge, the learner submits playback evidence for review.
8. The assignment becomes `ready_for_review` with evidence timestamps and an auditable playback reference.
9. A Class DI instructor or authorized school/compliance administrator reviews the evidence.
10. Gate 10 atomic certification may then convert the approved evidence into separate make-up attendance and instructional-time credit.

## Fail-closed boundary

Gate 11 does not activate public payment, general regulated course access, final examination, certificate issuance, LIAS reporting, or production cohort enrollment. Recorded make-up cannot activate unless the Class D make-up gate, active DS runtime configuration, protected DI/DS configuration, and the Gate 11 recorded-media feature gate are all satisfied.

## Next controlled sequence

1. Add administrator playback-evidence inspection with learner timeline, challenge history, time anomalies, and Q&A status.
2. Add secure media-origin signing/proxy integration appropriate to the selected production storage provider.
3. Add end-of-playback review automation that pre-populates Gate 10 certification inputs without automatically certifying credit.
4. Continue to the protected 170-question final examination engine, randomized delivery, scoring, retest/remediation workflow, and exam-security controls.
5. Keep public launch disabled until the Class DS authorization, production database migrations, runtime secrets, security validation, and end-to-end owner acceptance are complete.
