# ZenBusiness public website and separate application

The public export starts from the exact deployed website commit `f104bbc1284328dde61441411e28034720303b64`. It renders the existing public source, catalogs, service details, industry pages, trust policies, credentials, and publications into ZenBusiness HTML widgets. `asset-map.json` records the actual image URLs uploaded to ZenBusiness site `2d547f80`.

The Next.js application remains the source of truth for checkout, identity, applications, marketplace delivery, Academy, regulated training, and the secure inquiry form. The export includes no server code, credentials, customer records, or payment processing. Forms and purchases begin on application pages so existing same-origin and authorization checks remain intact.

## Regenerate the public pages

Use the repository's Node 24 runtime and installed TypeScript, React, React DOM, and PostCSS dependencies:

```sh
OBSERRA_EXPORT_TOOLING="$PWD/node_modules" OBSERRA_PLATFORM_ORIGIN=https://platform.obserrallc.com node scripts/export-zenbusiness-public.cjs
```

The exporter creates 57 public widgets plus a manifest and standalone previews. Import each widget into its corresponding native ZenBusiness page, set its original URL from the manifest, and preserve its title and description. Install `shared-head.html` in the website's global Head HTML and `body-end-guide.html` in Body End HTML, retaining any unrelated existing custom code. These files provide the final shared asset and mobile-template overrides, link corrections for renamed native pages, and the original rule-based Obserrian advisor. The static adapter also keeps mobile navigation, expandable details, credential scrolling, and official Credly verification. The secure contact form remains at the separate application origin, with direct email available on the public contact page.

All 57 pages and all 33 source images were saved and published in ZenBusiness on 2026-10-01. The imported homepage is `Obserra EPI Home`; the older Home and Contact pages are recoverable drafts, and the unused demo Store is hidden from navigation. The homepage, advisor replies, mobile menu, expandable services, credential scrolling, leadership navigation, and visitor contact links were checked in ZenBusiness preview. The domain was reconnected to ZenBusiness on the same date: root A is `35.172.94.1` and www CNAME is `s.multiscreensite.com`. Public HTTPS is still blocked by an invalid/self-signed certificate, and application acceptance remains pending. ZenBusiness publication and its Connected badge do not establish a working public HTTPS site.

## Application configuration and cutover

`OBSERRA_APPLICATION_ORIGIN` defaults to `https://www.obserrallc.com` so preparing this migration does not change the current runtime. It accepts only that existing host or the approved `https://platform.obserrallc.com` host. The user's latest instruction is to stop using Vercel. Deploy this migration branch on a compatible non-Vercel application host, configure the platform hostname there, and set the application origin explicitly before live application acceptance. The public website remains hosted through ZenBusiness.

Update authorized identity callback URLs, payment webhook destinations, and external provider return URLs for the separate host. Configure `OBSERRA_FDACS_PUBLIC_ORIGIN` to exactly match `OBSERRA_APPLICATION_ORIGIN`. Keep the frozen release, accepted UAT, live identity, licensing, database, media, high availability, and activation authorization checks. A new regulated release still requires its existing acceptance process; the hosting change does not waive it.

Live application acceptance must cover sign-in/sign-out and callback completion, a Stripe test-mode purchase with verified delivery, Academy course access and progress, certificate access controls, and the applicable training authorization checks. Do not conduct a real customer payment or activate regulated training as a smoke test.

ZenBusiness's Re-connect action reset unrelated CNAME records while switching website DNS. The six original records for accounts, clerk, clk._domainkey, clk2._domainkey, clkmail, and app were restored and verified with their saved values. Email MX/SPF/DKIM and nameservers remain present. Do not run Re-connect again without another DNS snapshot, and do not point the platform at the obsolete `app.obserrallc.com` project. The public-domain switch happened while the existing application was already unavailable; the migration is incomplete until public HTTPS and separate application acceptance pass.

## Current blocker

On 2026-10-01, the former production application returned HTTP 402 `DEPLOYMENT_DISABLED` / Payment Required. Vercel deployment metadata still reported READY, which did not establish a working runtime. The user has instructed us to stop using Vercel; a compatible replacement application host must be made ready before live application acceptance. The local migration branch has not been uploaded: automatic approval review rejected the GitHub push because explicit approval for the repository destination was missing.

ZenBusiness's editor exposes no Site SSL/Generate certificate control in this account. The site was republished after DNS reconnection; www still showed a certificate verification error. ZenBusiness DNS allows only one A record per hostname, so adding Duda's documented second A record was rejected and did not change DNS. ZenBusiness must provision or repair the certificate and domain binding for root and www. Keep HTTPS verification enabled.
