import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { marketplaceApps } from "../../apps/appsData";
import { resolveAppEntitlement } from "../../../lib/app-entitlements";
import "./applications.css";

export const metadata: Metadata = {
  title: "My Applications | Obserra Customer Portal",
  description: "Launch, download, purchase, license, and manage entitled Obserra applications.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CustomerApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/applications");

  const sellableApps = marketplaceApps.filter((app) => app.status !== "Coming Soon");
  const records = await Promise.all(
    sellableApps.map(async (app) => ({ app, entitlement: await resolveAppEntitlement(userId, app.slug) })),
  );
  const activeCount = records.filter((record) => record.entitlement.allowed).length;

  return (
    <main className="fulfillment-page">
      <header className="fulfillment-nav">
        <Link href="/portal" className="fulfillment-brand">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>APPLICATION FULFILLMENT</span>
        </Link>
        <nav><Link href="/portal">Dashboard</Link><Link href="/apps">Marketplace</Link><Link href="/trust">Trust</Link></nav>
      </header>

      <section className="fulfillment-hero">
        <p className="fulfillment-eyebrow">AUTHENTICATED DELIVERY CENTER</p>
        <h1>Your applications, subscriptions, license keys, and deployment actions.</h1>
        <p>Every launch, key request, and download is revalidated against Stripe. Active and trialing subscriptions are permitted; delinquent, canceled, incomplete, expired, or paused subscriptions are denied automatically.</p>
        <div className="fulfillment-kpis">
          <article><span>ACTIVE ENTITLEMENTS</span><strong>{activeCount}</strong></article>
          <article><span>SELLABLE APPLICATIONS</span><strong>{records.length}</strong></article>
          <article><span>ACCESS POLICY</span><strong>Fail closed</strong></article>
        </div>
      </section>

      <section className="fulfillment-grid" aria-label="Application entitlements">
        {records.map(({ app, entitlement }) => (
          <article className="fulfillment-card" key={app.slug}>
            <div className="fulfillment-card-head">
              <div><small>{app.category}</small><h2>{app.name}</h2></div>
              <span className={entitlement.allowed ? "entitlement-active" : "entitlement-inactive"}>{entitlement.status}</span>
            </div>
            <p>{app.value}</p>
            <dl>
              <div><dt>Plan</dt><dd>{entitlement.plan || "Not assigned"}</dd></div>
              <div><dt>Deployment</dt><dd>{entitlement.deploymentModel || app.deployment.join(", ")}</dd></div>
            </dl>
            <div className="fulfillment-actions">
              {entitlement.allowed ? (
                <>
                  <a className="primary-action" href={`/api/apps/access?app=${app.slug}`}>Launch SaaS</a>
                  <a href={`/api/apps/license?app=${app.slug}`} target="_blank" rel="noreferrer">Get application key</a>
                  <a href={`/api/apps/download?app=${app.slug}`}>Download release</a>
                  <a href="/api/apps/billing-portal">Manage billing</a>
                </>
              ) : (
                <>
                  <Link className="primary-action" href={`/apps/${app.slug}/subscribe`}>Purchase subscription</Link>
                  <Link href={`/apps/${app.slug}`}>View product</Link>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="fulfillment-support">
        <div><p className="fulfillment-eyebrow">DEPLOYMENT SUPPORT</p><h2>Private cloud, hybrid, and on-premises fulfillment requires controlled implementation approval.</h2><p>Use the support pathway for tenant provisioning, implementation scheduling, deployment package release, or entitlement reconciliation.</p></div>
        <Link href="/contact?interest=application-deployment">Request deployment support</Link>
      </section>
    </main>
  );
}
