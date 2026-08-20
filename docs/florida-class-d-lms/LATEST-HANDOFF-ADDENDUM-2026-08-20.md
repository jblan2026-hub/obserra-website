# OBSERRA Production Restart Authority Addendum

Effective date: 2026-08-20 ET

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

## Mandatory restart order {#restart-order}

After any context reset, memory loss, new chat, or agent handoff:

1. Read `docs/florida-class-d-lms/LATEST-HANDOFF.md` first.
2. Read this addendum second.
3. Read `plan/architecture-obserra-production-readiness-1.md` third.
4. Query GitHub and Vercel directly before making current-state claims.
5. Evaluate the entire installed skill library and load every genuinely applicable specialist skill before repository or production work.
6. Do not use mocks, fake integrations, placeholders, fabricated production state, or manual edits of governed generated evidence.
7. Continue from the exact continuation point in this document without asking the user to reconstruct prior work.

## Current signed main {#current-main}

Current signed `main`:

`0b6ee5ee07e688e6c53facff7c30d55fd958c809`

Merge title:

`fix(identity): make public routes identity-provider independent`

GitHub reports this merge commit as cryptographically verified.

PR #166 is merged and issue #165 is closed as completed.

PR #166 final head before merge:

`6c92f14bd04de5106b2fe2f960c09f1112b75fc1`

Merge commit:

`0b6ee5ee07e688e6c53facff7c30d55fd958c809`

## Identity behavior implemented {#identity-behavior}

The merged identity routing preserves these invariants:

1. Public-owned routes terminate before Clerk or Supabase readiness checks.
2. Public responses expose `X-Obserra-Identity-Provider: public` and `X-Obserra-Identity-Status: not-required` where proxy identity headers are applied.
3. Supabase-owned routes are provider-exclusive and fail closed if the Supabase runtime is disabled or unready. They do not fall through to Clerk.
4. Public Applications storefront routes `/apps` and `/apps/[slug]` are public first-party website surfaces.
5. Protected Applications operations under `/api/apps` and protected Applications portal surfaces remain Clerk authenticated.
6. Owner role, verified email, AAL2, current-authority, mutation, origin, regulated-training, payment, entitlement, and release controls remain intact.

## TDD proof {#tdd-proof}

Initial strengthened RED head:

`068eeb3fe0a76f9d894693da0113a91e62b739b6`

Website CI run:

`32422187927`

Result:

- 262 tests total
- 260 passed
- exactly 2 failed
- public provider boundary missing
- Supabase ownership incorrectly depended on runtime enablement and could fall toward Clerk

Second RED commit:

`e6221ebf95bd5d0a78fbff1060940523586b66b9`

Florida Class D workflow run:

`32424644792`

Result:

- 263 tests total
- 262 passed
- exactly 1 failed
- `/apps` actual provider was `clerk`
- `/apps` expected provider was `public`

Second GREEN source commit:

`f7689fcc040e3d5ce3e82c6416f0ab29181d30fd`

The final PR head later converged governed evidence and remained behaviorally green at:

`6c92f14bd04de5106b2fe2f960c09f1112b75fc1`

## Final exact-head CI proof {#final-ci-proof}

All required PR checks passed on exact final head `6c92f14bd04de5106b2fe2f960c09f1112b75fc1`:

- Website CI run `32427441228`: SUCCESS
- CMMC Evidence Governance run `32427441293`: SUCCESS
- CodeQL Advanced run `32427441302`: SUCCESS
- Florida Class D LMS Gates run `32427441233`: SUCCESS
- Applications Private Boundary Gate run `32427441270`: SUCCESS

This is the authoritative source-level completion proof for issue #165 and PR #166.

## Governed evidence state {#governed-evidence-state}

Generated legal, CMMC, FDACS, and related governed evidence converged before PR #166 was merged. The final green CMMC and Website CI runs above are the authoritative evidence that the exact PR head was internally consistent.

Do not hand-edit generated evidence. Any future source-tree change that creates evidence drift must use the deterministic repository generators or exact remediation artifacts produced by CI.

## Current continuation point {#current-continuation-point}

PR #166 source work is complete and merged. Continue with post-merge production verification and remaining platform production-readiness blockers.

Required sequence:

1. Verify current `main` remains `0b6ee5ee07e688e6c53facff7c30d55fd958c809` or record the newer exact SHA if it has moved.
2. Verify the canonical Vercel project and deployment serving `www.obserrallc.com` and `obserrallc.com`.
3. Verify `/api/health` reports the expected canonical project, exact intended Git SHA, deployment identity, and routing authority as verified.
4. Verify representative public routes return public identity semantics and do not require Clerk or Supabase readiness.
5. Verify protected Supabase routes remain fail closed.
6. Verify protected Applications operations remain Clerk authenticated and entitlement/payment controls are unchanged.
7. Verify canonical production serves the intended signed merge SHA before claiming production completion.
8. Continue resolving remaining production-readiness items in `plan/architecture-obserra-production-readiness-1.md`, including branch protection and any Vercel authority drift still present.

## Known governance condition {#governance-condition}

At the time PR #166 merged, GitHub still reported `main` as unprotected with required status checks disabled. Treat this as production governance drift until independently remediated and verified.

A green PR or signed merge does not substitute for branch protection, required checks, exact production SHA parity, or direct live verification.

## Completion rule {#completion-rule}

Do not report the identity work as fully production complete until the canonical live domain serves the intended merged SHA and direct production smoke tests prove the expected public and protected identity behavior.
