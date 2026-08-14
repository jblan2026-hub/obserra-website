# Vercel Canonical Domain Ownership Gap

Snapshot: 2026-08-14 ET

Owner: **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**

Repository: `jblan2026-hub/obserra-website`

Tracked remediation: GitHub issue #76

## Finding

Direct Vercel project and deployment inspection established that both canonical Obserra domains are assigned to three separate Git-linked Vercel projects that deploy the same GitHub repository:

1. Intended production authority: `obserra-website-live`, project ID `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`.
2. Duplicate claimant: `obserra-website-lcn2`, project ID `prj_FfAnssVJU8pcJydGNJHmCliP6Yme`.
3. Duplicate claimant: `obserra-integrated-services`, project ID `prj_v6Hb7FkpkUoLKlHkjzKJ5HVgYDaL`.

Each project reports both:

- `www.obserrallc.com`
- `obserrallc.com`

The same recovered application source SHA `2261e2bd11bce0986976a2b366ece8949f129f0c` was deployed by the three Git-linked projects. A live request to `www.obserrallc.com` contained Vercel deployment marker `dpl_FYdopKa9RE5XMGMJecQ11AGMe3vb`. Direct Vercel inspection identifies that deployment as belonging to `obserra-website-lcn2`, not the intended `obserra-website-live` project.

This means canonical routing is currently functional but **not exclusively governed by the intended production project**. Identical source SHA across the duplicate projects does not close the configuration-control defect because a future project-specific setting, environment variable, deployment result, or provider configuration can cause the projects to diverge.

## Legacy project review

The following older drop-based public/Academy projects were checked and do not currently report the canonical custom domains on their reviewed production deployments:

- `obserra-public-v21`
- `obserra-academy-secure`
- `obserra_public_website_deploy_v23`
- `obserra_public_website_deploy_v24`

The old `obserra-website` and `obserra-public` projects do not have a current READY production deployment in the reviewed state.

## Required controlled correction

Vercel project-domain configuration must establish one authoritative owner:

- Keep both canonical custom domains on `obserra-website-live` only.
- Remove both custom domains from `obserra-website-lcn2`.
- Remove both custom domains from `obserra-integrated-services`.
- Do not delete the apex domain from the Vercel account as part of duplicate-project cleanup.
- Verify a live canonical request resolves to a READY deployment whose Vercel project ID is `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`.

The current ChatGPT Vercel connector exposes project/deployment inspection but does not expose the project-domain removal/reassignment action, so this specific control-plane change requires an authorized Vercel administrator path.

## Source follow-up

`vercel.json` declared the canonical domains through its `alias` property. Vercel documentation states that custom aliases can be configured there but now prefers Project Settings.

The administrator completed the requested duplicate-project detach action, but direct inspection immediately afterward still listed both domains on all three projects. Because all three projects consume the same repository configuration, the static alias declaration was the remaining propagation mechanism. Gate 35 therefore removes the `alias` declaration through a governed pull request and updates Gate 34 evidence validation to forbid static canonical alias propagation. This prevents another repo-linked Vercel project from recreating the conflict on a future deployment.

After the source release is deployed, directly verify project-domain state. If either duplicate still retains a canonical domain, repeat the detach from that duplicate project only. Preserve both domains on `obserra-website-live` and do not change DNS or delete domains/projects.

## Post-PR #80 reconciliation

PR #80 removed the source alias declaration and merged at verified SHA `d35917f417d24489ffd5877b989f36dbb3bbb613` after Florida Gates #570, Website CI #2344, and CodeQL #42 passed. The resulting intended deployment is `dpl_DxojVNKBd9hJtcjXth3QptKei4Lw`; the current lcn2 and integrated-services deployments are `dpl_obbgqpKWWNfDGDwys4ozGzkmbvWq` and `dpl_7hGZTYhpz6YESxQi2ZGpkgSjgavb`. All three are READY and the two current duplicate deployments have no canonical aliases.

The authorized administrator then supplied Vercel control-plane screenshots showing both canonical domains on `obserra-website-live`, no production domain on `obserra-website-lcn2`, and no production deployment on `obserra-integrated-services`. Their supplemental SHA-256 values are `59c77fd73b9a7666a817c04ff2feba6b6bfd26745043378d4a1279774f23af42`, `6a04bbfed63a6f439ba9ede634dcf85a7bf0b4ec1e4394d4bb76762e8cc3ceb6`, and `1d992d25527b4f29c1dd029a0a784abbe1d94b226375623f4ef68e9240af646b`, respectively. The apex screenshot contains Vercel's DNS modernization recommendation and states the legacy Vercel record continues to work; DNS is deliberately unchanged.

Deployment-level evidence still blocks closure. Older lcn2 deployment `dpl_AYZXGVZurpGcKXLSzvKrudM7rt5w` retains both canonical aliases, live canonical HTML contains that deployment marker, and the apex redirect contains `_vercel_share`. The routing-evidence release therefore adds the nonsecret Vercel project ID, deployment ID, and Git commit SHA to the no-store health contract. It reports `verified` only when the serving project is `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, and the production operational gate requires that result.

The intended PR #80 deployment also reports `Checks Failed` in the operator Vercel view (supplemental screenshot SHA-256 `4630169cea566661c1593b22fdcdbc19903dc50746c84e4ac6a043579e9caa1b`). Direct GitHub combined status corroborates `Vercel – obserra-website-live: failure` while lcn2 is `success`. Intended build logs contain no build error and show successful compilation, TypeScript, 159-page generation, output deployment, and build-cache upload; no runtime requests are recorded on the intended deployment. The exact provider-side postdeployment check is not exposed by the connected read interface and must not be disabled or reclassified without its result. If the routing-evidence release repeats this state, inspect and correct the named check through the authorized Vercel project view before accepting the deployment.

## Post-PR #82 deployment-check finding

PR #82 merged as GitHub-verified SHA `2dde838ee176e6f450abeca2daad96ab377ed931`. Exact intended deployment `dpl_5wuL2pUUGcpgk6z7HgvZyVrQLbpd` reached READY but remained Staged. Vercel Deployment Details now exposes the causal results: Clerk DNS incomplete for `obserrallc.com`, one nonmatching Clerk/Vercel alias status, skipped TypeCheck because the package script was absent, the required canonical operational job rejecting the old promoted revision's identity headers, and custom-domain assignment blocked by those failed checks.

Project settings confirm `www.obserrallc.com` is valid on `obserra-website-live` and the apex redirects to it. The canonical health contract now reports the intended Vercel project but still serves prior deployment `dpl_FdYBScoDxVX3bDFkk2dTwyvxtBPa` at commit `0e72459a8940f23976038d85d6394409000f48c5`. Gate 38 fixes the source-controlled TypeCheck and promotion-order deadlock. It deliberately leaves the third-party Clerk DNS dependency open and requires exact-SHA post-promotion evidence before closure.

## NIST SP 800-171 Rev. 3 / CMMC mapping

Primary mappings:

- `03.04.01` configuration baseline governance.
- `03.04.02` configuration settings.
- `03.04.03` configuration change control.
- `03.04.05` access restrictions for change.
- `03.12.03` continuous monitoring.
- `03.13.01` boundary protection.
- `03.13.06` communications by exception / controlled boundary behavior as applicable.
- `03.16.01` security engineering principles.
- `03.16.03` external system services.

Current CMMC Level 2 Rev. 2 crosswalk remains separately maintained in the production evidence register.

## Closure evidence

Do not close GitHub issue #76 or mark canonical routing evidence implemented solely because all three projects currently deploy the same source SHA.

Closure requires:

1. Direct Vercel project-domain evidence showing only `obserra-website-live` owns the two canonical domains.
2. Live canonical `/api/health` evidence reporting intended project ID `prj_lxTKKDa9sbhht7FaigiaF1PONMiC`, an accepted READY deployment ID, the exact Git commit SHA, and routing authority `verified`.
3. Governed removal of static canonical aliases from `vercel.json` after project-level ownership is verified.
4. CI and CodeQL validation of the source change.
5. Updated machine-readable and generated human-readable CMMC production evidence with a new SHA-256 digest.
