import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { availablePlansFor } from "../../commerce";
import { findAppBySlug, marketplaceApps } from "../../appsData";
import { applicationsPersistenceConfigured } from "../../../../lib/applications-commerce";
import { applicationsCommerceConfigured, applicationsStripePriceId } from "../../../../lib/applications-stripe";
import { ensureApplicationsRuntimeSecrets } from "../../../../lib/production-runtime-secrets";
import "../../commerce.css";
import "../../commerce-actions.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateStaticParams() { return marketplaceApps.map((entry) => ({ slug: entry.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = findAppBySlug(slug);
  if (!app) return { title: "Application not found" };
  return { title: `Subscribe to ${app.name}`, description: `Select licensing and deployment options for ${app.name}.`, robots: { index: false, follow: false } };
}

export default async function SubscribePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const app = findAppBySlug(slug);
  if (!app) notFound();
  const plans = availablePlansFor(app);
  const checkout = typeof query.checkout === "string" ? query.checkout : "";
  let commerceReady = false;
  try {
    await ensureApplicationsRuntimeSecrets();
    commerceReady = applicationsPersistenceConfigured() && applicationsCommerceConfigured();
  } catch {
    commerceReady = false;
  }

  return <main className="commerce-page">
    <header className="commerce-nav">
      <Link href="/" className="commerce-brand"><Image src="/brand/obserra-logo.png" alt="Obserra" width={286} height={55}/><span>APPLICATION COMMERCE</span></Link>
      <nav><Link href={`/apps/${app.slug}`}>Product</Link><Link href="/apps">Marketplace</Link><Link href="/portal">Customer portal</Link><Link href="/contact">Sales</Link></nav>
    </header>

    <section className="commerce-hero">
      <p className="commerce-eyebrow">SUBSCRIPTION & DEPLOYMENT</p>
      <h1>{app.name}</h1><p>{app.value}</p>
      <div className="commerce-tags"><span>{app.status}</span><span>{app.category}</span>{app.deployment.map((item)=><span key={item}>{item}</span>)}</div>
      {checkout && <div className="commerce-alert">Checkout status: {checkout.replaceAll("-", " ")}. Contact sales when a production price or deployment review is required.</div>}
    </section>

    {plans.length ? <section className="commerce-plans" aria-label="Subscription plans">
      {plans.map((plan)=><article key={plan.id}>
        <small>{plan.id.toUpperCase()}</small><h2>{plan.name}</h2><p>{plan.description}</p>
        <ul>{plan.includes.map((item)=><li key={item}>{item}</li>)}</ul>
        <div className="commerce-options">
          {plan.billing.map((interval)=>app.deployment.filter((model)=>plan.deployment.includes(model)).map((model)=> {
            const configuredPrice = Boolean(applicationsStripePriceId(app.slug, plan.id, interval));
            if (model !== "SaaS" || !commerceReady || !configuredPrice) return <Link key={`${interval}-${model}`} href={`/contact?interest=enterprise-deployment&app=${app.slug}`}>
              Request {interval === "monthly" ? "monthly" : "annual"} {model} pricing
            </Link>;
            return <form key={`${interval}-${model}`} action="/api/apps/checkout" method="post">
              <input type="hidden" name="app" value={app.slug}/>
              <input type="hidden" name="plan" value={plan.id}/>
              <input type="hidden" name="interval" value={interval}/>
              <input type="hidden" name="deployment" value={model}/>
              <button type="submit">{interval === "monthly" ? "Monthly" : "Annual"} · {model}</button>
            </form>;
          }))}
        </div>
      </article>)}
    </section> : <section className="commerce-coming"><h2>Commercial enrollment is not open yet.</h2><p>This application is marked Coming Soon. Join the release list or request a controlled preview.</p><Link href={`/contact?interest=application-preview&app=${app.slug}`}>Request preview</Link></section>}

    <section className="commerce-workflow">
      <div><p className="commerce-eyebrow">FULFILLMENT WORKFLOW</p><h2>Purchase, provision, deploy, and manage from one governed process.</h2></div>
      <ol><li><strong>1. Subscribe</strong><span>Authenticated Stripe checkout establishes the commercial subscription.</span></li><li><strong>2. Entitle</strong><span>The customer account receives product and plan entitlements.</span></li><li><strong>3. Package</strong><span>A versioned FINAL release bundle is generated for the selected application.</span></li><li><strong>4. Deploy</strong><span>Obserra provisions SaaS access or coordinates private-cloud, hybrid, or on-premises deployment.</span></li><li><strong>5. Operate</strong><span>Renewals, releases, support, and deployment status are managed through the portal.</span></li></ol>
    </section>

    <section className="commerce-support"><h2>Need enterprise procurement or remote deployment?</h2><p>Enterprise deployments require security, integration, data residency, identity, support, and implementation scoping.</p><Link href={`/contact?interest=enterprise-deployment&app=${app.slug}`}>Start deployment assessment</Link></section>
  </main>;
}
