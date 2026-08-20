# OBSERRA Production Restart Authority Addendum

Effective date: 2026-08-20 ET

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Applies to: PR #166, issue #165, identity provider routing, public Applications routing, governed legal/CMMC evidence convergence, CI validation, and production release continuation.

## Mandatory restart order {#restart-order}

After any context reset, memory loss, new chat, or agent handoff:

1. Read `docs/florida-class-d-lms/LATEST-HANDOFF.md` first.
2. Read this addendum second.
3. Read `plan/architecture-obserra-production-readiness-1.md` third.
4. Query GitHub directly before making any claim because PR, main, CI, and deployment state can move after this document is written.
5. Use the full installed skill library as the routing layer. Evaluate the whole library and load every genuinely applicable specialist skill before repository changes. Do not substitute generic web research for an installed skill, repository evidence, or connected-system evidence.
6. Never use mocks, fake integrations, placeholders, fabricated production state, or manual edits of governed generated evidence.
7. Continue automatically from the exact continuation point below. Do not ask the user to reconstruct this work.

## Exact continuation point {#exact-continuation-point}

Primary work item:

- Issue: `#165` — `P1 identity: public routes must not inherit irrelevant provider configuration failure`
- Pull request: `#166` — `fix(identity): make public routes identity-provider independent`
- Branch: `fix/165-public-identity-readiness-20260820`
- Base at PR creation: `225817700d0659cc846785462bfdd6713108f15d`
- PR remains open and draft until all governed evidence and exact-head gates converge.

The source-level identity fix is implemented and proven GREEN. The remaining work is governed evidence convergence and final exact-head CI/review validation.

## Implemented identity behavior {#implemented-identity-behavior}

The proxy/provider routing behavior on PR #166 is intended to preserve these invariants:

1. `public` owned routes terminate before Clerk or Supabase readiness checks.
2. Public responses set `X-Obserra-Identity-Provider: public` and `X-Obserra-Identity-Status: not-required` where proxy identity headers are applied.
3. Supabase owned routes are provider exclusive and fail closed when the Supabase runtime is disabled or unready. They do not fall through to Clerk.
4. Clerk continues to own protected Applications operations and Clerk infrastructure.
5. Public Applications storefront routes `/apps` and `/apps/[slug]` are public first-party website surfaces.
6. Protected Applications operations under `/api/apps` and protected Applications portal surfaces remain Clerk authenticated.
7. Owner role, verified email, AAL2, current-authority, mutation, origin, regulated-training, payment, entitlement, and release controls are not weakened.

## TDD evidence {#tdd-evidence}

### Initial RED

Strengthened RED head:

`068eeb3fe0a76f9d894693da0113a91e62b739b6`

Website CI run:

`32422187927`

Result:

- 262 tests total
- 260 passed
- exactly 2 failed
- public route provider boundary missing
- Supabase ownership incorrectly depended on runtime enablement and could fall toward Clerk

This proved the initial provider-isolation defect before implementation.

### First GREEN

GREEN source head:

`40cfae44816f112767421f7b2cf164596ea81fb3`

The proxy change explicitly isolated `public`, `supabase`, and `clerk` provider paths. The release fingerprint was updated to the exact proxy Git blob.

### Second RED discovered during review

Review of the full Applications routing architecture found a stale ownership contract. PR #156 had already made `/apps` public at the proxy, but `lib/auth/provider-routing.ts` still classified `/apps` as Clerk protected.

Focused RED test commit:

`e6221ebf95bd5d0a78fbff1060940523586b66b9`

Florida Class D workflow run:

`32424644792`

Repository test result:

- 263 tests total
- 262 passed
- exactly 1 failed
- failing test: `Applications storefront routes are public while protected Applications operations remain Clerk-owned`
- `/apps` actual provider: `clerk`
- expected provider: `public`

This formally proved the stale Applications provider-ownership regression.

### Second GREEN

Atomic GREEN commit:

`f7689fcc040e3d5ce3e82c6416f0ab29181d30fd`

This removed public `/apps` from Clerk protected ownership while preserving `/api/apps` and protected Applications portal routes on Clerk. It also corrected the stale provider-ownership regression test.

Exact-head validation on `f7689fcc...`:

- Florida Class D LMS Gates run `32424917506`: SUCCESS
- Applications Private Boundary Gate run `32424917495`: SUCCESS
- CodeQL Advanced run `32424917496`: SUCCESS
- Website CI run `32424917508`: FAILURE only because generated legal evidence drifted
- CMMC Evidence Governance run `32424917490`: FAILURE only because generated CMMC system evidence drifted

The Florida workflow completed repository contract tests, static validation, and production build successfully on the GREEN source. This is the current source-level proof that the implementation is correct.

## Governed evidence convergence {#governed-evidence-convergence}

Do not hand edit generated evidence. Use only remediation artifacts or deterministic repository generators.

### Legal identity evidence

Website CI on GREEN head `f7689fcc...` produced artifact:

`legal-identity-audit-remediation`

Artifact ID:

`9427058406`

The artifact was downloaded and verified locally. Its generated JSON and Markdown matched the SHA-256 entries in its manifest.

The exact generated legal evidence was committed atomically as:

`296110cad832c1a4bfd64c96a50c3b7c89fbe82d`

Files:

- `docs/compliance/LEGAL-IDENTITY-AUDIT.json`
- `docs/compliance/LEGAL-IDENTITY-AUDIT.md`
- `docs/compliance/LEGAL-IDENTITY-AUDIT.sha256`

### CMMC system evidence

Native CMMC Evidence Governance reran against exact head `296110ca...`.

Run:

`32425509945`

It failed only at generated system-evidence drift and produced exact remediation artifact:

`cmmc-system-evidence-remediation`

Artifact ID:

`9427262243`

Artifact file:

`cmmc-system-evidence-remediation.zip`

The ZIP was downloaded and inspected. It contains only:

- `CMMC-SYSTEM-EVIDENCE.json`
- `CMMC-SYSTEM-EVIDENCE.md`
- `CMMC-SYSTEM-EVIDENCE.sha256`

Verified generated content hashes:

- JSON SHA-256: `a75a8b86522ef37003dfe84e009432513048c1ff7c3abeb77d57e1c6a9dfffaf`
- Markdown SHA-256: `6c4f9953d22dfbd02d1ef11e55ea882bb3d65ef4cd474edd345a9a1d2962a9b0`

These hashes match the generated checksum manifest. Additional entries in the checksum manifest reference controlled repository inputs that are intentionally not packaged in the remediation ZIP; their absence from the standalone ZIP is not artifact corruption.

## Current exact continuation action {#current-action}

At restart, perform these steps in this order:

1. Query PR #166 and confirm its current exact head. At the time of this addendum, the last confirmed branch head before the CMMC artifact application is `296110cad832c1a4bfd64c96a50c3b7c89fbe82d`.
2. Confirm the CMMC remediation artifact was generated from that exact head. Its workflow metadata must show head SHA `296110cad832c1a4bfd64c96a50c3b7c89fbe82d`.
3. Apply the three CMMC generated files byte-for-byte from artifact `9427262243` in one atomic commit. Do not manually recreate or edit their content.
4. Rerun native PR gates on the new exact head.
5. If CMMC then produces technical/human disposition, FDACS PII audit, or continuity handoff drift, use only the exact remediation artifact or deterministic generator output produced from the immediately preceding exact head. Apply generated evidence in dependency order.
6. Continue this evidence-convergence loop until Website CI, CMMC Evidence Governance, Florida Class D LMS Gates, Applications Private Boundary Gate, and CodeQL all pass on one exact PR head.
7. Inspect all PR review feedback and run the full code-review/security stack. Address only validated issues.
8. Do not move PR #166 out of draft and do not merge until exact-head gates and review are clean.
9. After merge, do not claim production completion until canonical Vercel authority and `https://www.obserrallc.com/api/health` serve the intended merged SHA and representative public/protected routes pass direct production smoke verification.

## Production and control-plane blockers remain separate {#production-blockers}

Do not confuse PR #166 source completion with production completion.

Known production control-plane requirements remain in the main handoff and roadmap, including:

- branch protection / required status checks are not yet an acceptable production control state
- exact canonical Vercel project/domain authority must be verified live
- source-to-production exact SHA parity is mandatory
- production identity, protected-route, Applications, Academy, Florida LMS, payment/entitlement, CMMC, legal identity, and deployment smoke checks remain release gates

If current GitHub or Vercel state differs from older handoff values, the connected systems are authoritative and the handoff must be updated again.

## Skill routing requirements {#skill-routing-requirements}

For this continuation, evaluate the entire available skill library first and load every genuinely applicable specialist skill. At minimum, likely matching layers include:

- skill auto activation / routing
- PR iteration
- test driven development
- verification before completion
- code review
- Next.js
- Clerk
- Clerk testing
- Supabase
- Supabase security
- authorization testing
- secure coding / code security
- CI/CD
- Git/GitHub workflow
- Vercel production validation
- CMMC/compliance evidence
- Florida Class D / regulated workflow related repository gates where applicable
- documentation maintenance when handoff or roadmap state changes

Do not load unrelated skills simply to maximize count. `All skills` means evaluate the whole library, then use the complete applicable stack.

## Completion definition {#completion-definition}

PR #166 is complete only when:

1. public identity routing behavior is correct
2. Supabase ownership fails closed and cannot fall to Clerk
3. public Applications storefront ownership is correct
4. protected Applications operations remain Clerk protected
5. all governed evidence is current and generator produced
6. all required exact-head GitHub gates are green
7. review feedback is resolved
8. the PR is merged through the governed path
9. live production serves the intended merge SHA through the correct canonical Vercel authority
10. live public and protected smoke tests confirm the expected identity semantics without weakening regulated, entitlement, payment, owner, or authorization controls

Until all ten conditions are satisfied, do not report production completion.
