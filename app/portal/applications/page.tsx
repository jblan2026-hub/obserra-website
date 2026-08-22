import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { marketplaceApps } from "../../apps/appsData";
import { resolveAppEntitlement } from "../../../lib/app-entitlements";

export const metadata: Metadata = {
  title: "My Applications | Obserra Customer Portal",
  description: "Launch, download, purchase, license, and manage entitled Obserra applications.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const panelClass =
  "rounded-[18px] border border-[#7ec7ec3d] bg-[linear-gradient(145deg,rgba(12,48,76,.94),rgba(5,25,43,.95))] shadow-[0_22px_50px_rgba(0,0,0,.28)]";
const secondaryActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#7ec7ec4d] px-4 py-3 text-center text-xs font-black text-[#e8f6ff] no-underline transition hover:border-[#f4ba55] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const primaryActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#f4ba55] bg-[#f4ba55] px-4 py-3 text-center text-xs font-black text-[#08223a] no-underline transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default async function CustomerApplicationsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/applications");

  const sellableApps = marketplaceApps.filter((app) => app.status !== "Coming Soon");
  const records = await Promise.all(
    sellableApps.map(async (app) => ({ app, entitlement: await resolveAppEntitlement(userId, app.slug, orgId) })),
  );
  const activeCount = records.filter((record) => record.entitlement.allowed).length;

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_82%_8%,rgba(36,120,181,.24),transparent_30%),linear-gradient(135deg,#020b15,#06182a_58%,#092a45)] font-sans text-[#eef8ff]">
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-[#7ec7ec33] bg-[#020b15eb] px-[max(5vw,24px)] py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <Link href="/portal" className="flex items-center gap-3 text-[11px] font-black tracking-[.14em] text-white no-underline">
          <Image className="h-auto w-[min(250px,68vw)]" src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span className="hidden xl:inline">APPLICATION FULFILLMENT</span>
        </Link>
        <nav className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:items-center md:gap-4">
          {[
            ["Dashboard", "/portal"],
            ["Marketplace", "/apps"],
            ["Trust", "/trust"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#7ec7ec33] bg-[#08243c] px-3 text-center text-xs font-extrabold text-[#dceffa] no-underline md:border-0 md:bg-transparent md:px-0">
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="mx-auto max-w-[1500px] px-[max(5vw,24px)] pb-9 pt-12 md:pt-[72px]">
        <p className="mb-3 text-[11px] font-black tracking-[.15em] text-[#f4ba55]">AUTHENTICATED DELIVERY CENTER</p>
        <h1 className="m-0 max-w-[1100px] text-[clamp(40px,6vw,78px)] font-black leading-[.98] tracking-[-.05em]">Your applications, subscriptions, license keys, and deployment actions.</h1>
        <p className="max-w-[960px] text-[17px] leading-7 text-[#c9e1ef]">Every launch, key request, and download is revalidated against the signed-webhook Applications ledger. Active and trialing subscriptions are permitted; delinquent, canceled, incomplete, expired, disputed, or refunded subscriptions are denied automatically.</p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <article className={`${panelClass} p-[18px]`}><span className="block text-[10px] font-black tracking-[.12em] text-[#90bfd8]">ACTIVE ENTITLEMENTS</span><strong className="mt-2 block text-2xl">{activeCount}</strong></article>
          <article className={`${panelClass} p-[18px]`}><span className="block text-[10px] font-black tracking-[.12em] text-[#90bfd8]">SELLABLE APPLICATIONS</span><strong className="mt-2 block text-2xl">{records.length}</strong></article>
          <article className={`${panelClass} p-[18px]`}><span className="block text-[10px] font-black tracking-[.12em] text-[#90bfd8]">ACCESS POLICY</span><strong className="mt-2 block text-2xl">Fail closed</strong></article>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1700px] gap-[18px] px-[max(5vw,24px)] pb-[70px] pt-6 lg:grid-cols-2 2xl:grid-cols-3" aria-label="Application entitlements">
        {records.map(({ app, entitlement }) => (
          <article className={`${panelClass} flex min-h-[410px] flex-col p-5 md:p-[26px]`} key={app.slug}>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0"><small className="font-black tracking-[.11em] text-[#f4ba55]">{app.category}</small><h2 className="mb-0 mt-2 break-words text-[clamp(22px,2vw,28px)] leading-tight">{app.name}</h2></div>
              <span className={`h-max w-max rounded-full border px-[10px] py-[7px] text-[10px] font-black uppercase ${entitlement.allowed ? "border-[#47c18b59] bg-[#47c18b29] text-[#8bf0bd]" : "border-[#f4ba5547] bg-[#f4ba551a] text-[#ffe0a2]"}`}>{entitlement.status}</span>
            </div>
            <p className="text-[15px] leading-[1.7] text-[#c8e0ee]">{app.value}</p>
            <dl className="grid gap-[10px] sm:grid-cols-2">
              <div className="min-w-0 rounded-[10px] bg-[#0314238f] p-3"><dt className="text-[10px] font-black tracking-[.1em] text-[#86b8d2]">PLAN</dt><dd className="mt-[5px] break-words text-[13px]">{entitlement.plan || "Not assigned"}</dd></div>
              <div className="min-w-0 rounded-[10px] bg-[#0314238f] p-3"><dt className="text-[10px] font-black tracking-[.1em] text-[#86b8d2]">DEPLOYMENT</dt><dd className="mt-[5px] break-words text-[13px]">{entitlement.deploymentModel || app.deployment.join(", ")}</dd></div>
            </dl>
            <div className="mt-auto grid gap-[10px] pt-5 sm:grid-cols-2">
              {entitlement.allowed ? (
                <>
                  <a className={primaryActionClass} href={`/api/apps/access?app=${app.slug}`}>Launch SaaS</a>
                  <a className={secondaryActionClass} href={`/api/apps/license?app=${app.slug}`} target="_blank" rel="noreferrer">Get application key</a>
                  <a className={secondaryActionClass} href={`/api/apps/download?app=${app.slug}`}>Download release</a>
                  <form action="/api/apps/billing-portal" method="post"><input type="hidden" name="app" value={app.slug}/><button className={`${secondaryActionClass} w-full`} type="submit">Manage billing</button></form>
                </>
              ) : (
                <>
                  <Link className={primaryActionClass} href={`/apps/${app.slug}/subscribe`}>Purchase subscription</Link>
                  <Link className={secondaryActionClass} href={`/apps/${app.slug}`}>View product</Link>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className={`${panelClass} mx-[max(5vw,24px)] mb-[70px] flex flex-col items-start justify-between gap-7 p-6 md:p-[30px] lg:flex-row lg:items-center`}>
        <div><p className="mb-3 text-[11px] font-black tracking-[.15em] text-[#f4ba55]">DEPLOYMENT SUPPORT</p><h2 className="m-0 max-w-[900px] text-[clamp(28px,4vw,46px)] leading-tight tracking-[-.04em]">Private cloud, hybrid, and on-premises fulfillment requires controlled implementation approval.</h2><p className="max-w-[900px] leading-[1.65] text-[#c8e0ee]">Use the support pathway for tenant provisioning, implementation scheduling, deployment package release, or entitlement reconciliation.</p></div>
        <Link className={`${primaryActionClass} w-full shrink-0 lg:w-auto`} href="/contact?interest=application-deployment">Request deployment support</Link>
      </section>
    </main>
  );
}
