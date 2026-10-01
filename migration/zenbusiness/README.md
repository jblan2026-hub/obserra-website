# ZenBusiness public website and separate application

The public export starts from the exact deployed website commit `f104bbc1284328dde61441411e28034720303b64`. It renders the existing public source, catalogs, service details, industry pages, trust policies, credentials, and publications into ZenBusiness HTML widgets. `asset-map.json` records the actual image URLs uploaded to ZenBusiness site `2d547f80`.

The Next.js application remains the source of truth for checkout, identity, applications, marketplace delivery, Academy, regulated training, and the secure inquiry form. The export includes no server code, credentials, customer records, or payment processing. Forms and purchases begin on application pages so existing same-origin and authorization checks remain intact.

## Regenerate the public pages

Use the repository's Node 24 runtime and installed TypeScript, React, React DOM, and PostCSS dependencies:

```sh
OBSERRA_EXPORT_TOOLING="$PWD/node_modules" OBSERRA_PLATFORM_ORIGIN=https://platform.obserrallc.com node scripts/export-zenbusiness-public.cjs
```

The exporter creates 57 public widgets plus a manifest and standalone previews. Import each widget into its corresponding native ZenBusiness page, set its original URL from the manifest, and preserve its title and description. Install `shared-head.html` in the website's global Head HTML and `body-end-guide.html` in Body End HTML, retaining any unrelated existing custom code. These files provide the final shared asset and mobile-template overrides, link corrections for renamed native pages, and the original rule-based Obserrian advisor. The static adapter also keeps mobile navigation, expandable details, credential scrolling, and official Credly verification. The secure contact form remains at the separate application origin, with direct email available on the public contact page.

All 57 pages and all 33 source images were saved and published in ZenBusiness on 2026-10-01. The imported homepage is `Obserra EPI Home`; the older Home and Contact pages are recoverable drafts, and the unused demo Store is hidden from navigation. The homepage, advisor replies, mobile menu, expandable services, credential scrolling, leadership navigation, and visitor contact links were checked in ZenBusiness preview. The domain was reconnected to ZenBusiness on the same date: root A is `35.172.94.1` and www CNAME is `s.multiscreensite.com`.

ZenBusiness web services generated the custom-domain SSL certificate at 5:17 PM EDT after the approved support request. Both `https://obserrallc.com/` and `https://www.obserrallc.com/` then loaded the actual published site over HTTPS. All 57 public routes were checked for their migrated content and heading. The advisor's prompt and typed-question responses, expandable service details, Credly embeds, and contact-interest link were also checked on the live site. The public website is live; separate application acceptance remains pending. Its links target the intended platform host, which has not yet been deployed or accepted.

## Application configuration and cutover

`OBSERRA_APPLICATION_ORIGIN` defaults to `https://www.obserrallc.com` so preparing this migration does not change the current runtime. It accepts only that existing host or the approved `https://platform.obserrallc.com` host. The user's latest instruction is to stop using Vercel. Deploy this migration branch on a compatible non-Vercel application host, configure the platform hostname there, and set the application origin explicitly before live application acceptance. The public website remains hosted through ZenBusiness.

Update authorized identity callback URLs, payment webhook destinations, and external provider return URLs for the separate host. Configure `OBSERRA_FDACS_PUBLIC_ORIGIN` to exactly match `OBSERRA_APPLICATION_ORIGIN`. Keep the frozen release, accepted UAT, live identity, licensing, database, media, high availability, and activation authorization checks. A new regulated release still requires its existing acceptance process; the hosting change does not waive it.

Live application acceptance must cover sign-in/sign-out and callback completion, a Stripe test-mode purchase with verified delivery, Academy course access and progress, certificate access controls, and the applicable training authorization checks. Do not conduct a real customer payment or activate regulated training as a smoke test.

ZenBusiness's Re-connect action reset unrelated CNAME records while switching website DNS. The six original records for accounts, clerk, clk._domainkey, clk2._domainkey, clkmail, and app were restored and verified with their saved values. Email MX/SPF/DKIM and nameservers were preserved during that cutover. Do not run Re-connect again without another DNS snapshot, and do not point the platform at the obsolete `app.obserrallc.com` project. The public-domain switch happened while the existing application was already unavailable; the migration is incomplete until separate application acceptance passes.

## Current blocker

The user has instructed us to stop using Vercel. A compatible replacement application host must be made ready before live application acceptance. The user approved uploading `migration/zenbusiness-public-platform` to `jblan2026-hub/obserra-website`, and the branch was uploaded through the connected GitHub app. The uploaded file hashes and complete repository tree were verified against the prepared local branch. Main was not changed.

A standalone build with `OBSERRA_HOSTING_PROVIDER=azure-app-service` and the intended application origin passed, and its local server started without Vercel environment bindings. Its liveness endpoint responded successfully. This was a preview configuration and packaging check; protected features correctly required identity configuration, and live provider credentials, webhooks, host capacity, regulated acceptance, and customer workflows remain unverified. The existing Azure deployment workflow provisions infrastructure with two production instances and must not be run as a cost-neutral migration without checking the existing host and approved budget.
