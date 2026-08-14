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
2. Live canonical request evidence tied to that project and an accepted READY deployment.
3. Governed removal of static canonical aliases from `vercel.json` after project-level ownership is verified.
4. CI and CodeQL validation of the source change.
5. Updated machine-readable and generated human-readable CMMC production evidence with a new SHA-256 digest.
