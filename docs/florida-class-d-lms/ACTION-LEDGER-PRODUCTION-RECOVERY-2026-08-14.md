# Production Recovery Action Ledger

Date: 2026-08-14 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

This file is an append-only audit record for the website and Academy/LMS production recovery. It supplements, and does not rewrite, prior Gate 29 through Gate 34 records.

## Actions and evidence

1. PR #58, Gate 34 production identity/routing/CMMC hardening, validated at `827de1699be5b3560825a27287233c49058ef936`, merged as `14b7476fbd1b2b110424e7aace34cd7ad9368206`. Vercel deployment `dpl_7YZMe6j6HLsWNScrpH67pr8CoifH` became READY and received canonical aliases. Public application requests returned HTTP 500, so production acceptance was not claimed.

2. PR #59 removed Clerk environment mutation and changed Gate 34 to prohibit runtime mutation. Validated head `b8a3463c8ce78f580d37478369836abb158170cf`, merged as `be5b2cfe81d773bb399bd52114b53e791146bb74`. Vercel deployment `dpl_2UoSi2aD8fgR8eGmZN9Bo6EA6sDj` became READY. Public HTTP 500 persisted.

3. PR #71 introduced a conditional Clerk boundary. Canonical routing and regulated Class D mutation controls execute before identity. Clerk middleware is invoked only after configuration readiness; protected routes still require `auth()`, and Clerk failures fall back fail closed. Exact validated head `50f6e08da01817724190157fff515c1b9b349fec`: Florida Gates #560, Website CI #2326, CodeQL #24 all passed. Merge `b190f6d4b3addd9b67b4c7bbb1bf09372b10c7f1` produced Vercel deployment `dpl_GkXcmvRGezTqCpPGU1eZ7LiXV2E6`, which was canceled by the project Ignored Build Step because the rule did not recognize root-level `proxy.ts` changes.

4. PR #72 closed the deployment-parity defects. `lib/proxy-release-fingerprint.ts` and `test/vercel-deployment-integrity.test.mjs` bind proxy changes to a Vercel-recognized `lib/` sentinel. `.vercelignore` stopped excluding `package-lock.json`. Exact head `31056038178ae538c23b9bc247d0e96daa874c58`: Florida Gates #561, Website CI #2328, CodeQL #26 passed. Merge `50a0bc2b6633aa093feb77ffa8e1b1454549310a` produced READY deployment `dpl_GzztQsu5BkkiyxuTXL8Nf37qsZMQ`; Vercel build logs confirmed the build was no longer skipped and the audited lockfile remained in the production build context.

5. Live diagnostic on the PR #72 deployment showed `robots.txt` returned successfully through the conditional proxy with identity configuration required, isolating the remaining HTTP 500 to application identity-provider rendering. Commerce health also showed identity degraded and Stripe payment/webhook configuration unavailable. No secret values were retrieved, logged, committed, or requested in chat.

6. PR #73 introduced explicit `OBSERRA_IDENTITY_RUNTIME_ENABLED` activation with secure default false. Public rendering no longer mounts Clerk unless explicitly enabled after provider verification. Protected/auth routes remain fail closed. Exact head `d6ffd3b31a6d4eb69e39fbe856d1248528d5e071`: Florida Gates #562, Website CI #2330, CodeQL #28 passed. Verified merge/current production SHA `2261e2bd11bce0986976a2b366ece8949f129f0c`. Vercel deployment `dpl_Hv9fdpMbFUrbGCqh3zzuN9ct2Ayp` became READY and owns `www.obserrallc.com` and `obserrallc.com`.

7. Post-recovery acceptance: public root returned successfully; Academy returned successfully with the reviewed 60-course nonregulated catalog; safe GET checkout returned 405 with `Allow: POST`; commerce health returned 503/no-store with payment provider unavailable, webhook verification unavailable, and identity degraded; no error/fatal runtime logs were found for the current deployment in the checked recovery window.

8. Supabase production state remained fail closed for regulated training: 60 published/purchasable nonregulated controls, zero Class D-like course controls, and zero production `fdacs_class_d_*` objects.

9. GitHub security hardening completed within connector authority: CodeQL Advanced enabled and passing, GitHub placeholder security policy replaced by Obserra coordinated vulnerability disclosure policy, and GitHub Actions dependency-update cadence tightened to weekly while retaining subsystem-grouped Dependabot configuration.

10. GitHub control-plane gap remains: direct API inspection reports `main` unprotected, required status-check enforcement off, and no rulesets. Dependabot alerts API reported disabled; secret-scanning alert state is inaccessible to the current integration. GitHub issue #60 records the administrator-only remediation and closure evidence requirements.

11. Florida Class D production and CUI processing remained unauthorized throughout recovery. No Class D production schema promotion, real regulated enrollment, instruction, examination, LIAS execution, official completion release, or regulated activation was performed.
