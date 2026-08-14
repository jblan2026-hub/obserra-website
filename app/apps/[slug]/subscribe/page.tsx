import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { availablePlansFor } from "../../commerce";
import { findStorefrontAppBySlug, storefrontApps } from "../../storefront";
import "../../commerce.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return storefrontApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = findStorefrontAppBySlug(slug);
  if (!app) return { title: "Application not found" };
  return {
    title: app.status === "Available" ? `Subscribe to ${app.name}` : `${app.name} commercial enrollment`,
    description: app.status === "Available"
      ? `Select licensing and deployment options for ${app.name}.`
      : `Review the controlled commercial release status for ${app.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function SubscribePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const app = findStorefrontAppBySlug(slug);
  if (!app) notFound();
  const plans = availablePlansFor(app);
  const checkout = typeof query.checkout === "string" ? query.checkout : "";

  return <main className="commerce-page">
    <header className="commerce-nav">
      <Link href="/" className="commerce-brand">
        <Image src="/brand/obserra-logo.png" alt="Obserra" width={286} height={55}/>
        <span>APPLICATION COMMERCE</span>
      </Link>
      <nav>
        <Link href={`/apps/${app.slug}`}>Product</Link>
        <Link href="/apps">Marketplace</Link>
        <Link href="/portal">Customer portal</Link>
        <Link href="/contact">Sales</Link>
      </nav>
    </header>

    <section className="commerce-hero">
      <p className="commerce-eyebrow">SUBSCRIPTION &amp; DEPLOYMENT</p>
      <h1>{app.name}</h1>
      <p>{app.value}</p>
      <div className="commerce-tags">
        <span>{app.status}</span>
        <span>{app.category}</span>
        {app.deployment.map((item) => <span key={item}>{item}</span>)}
      </div>
      {checkout && <div className="commerce-alert">Checkout status: {checkout.replaceAll("-", " ")}. Contact sales when a production price or deployment review is required.</div>}
    </section>

    {plans.length ? <section className="commerce-plans" aria-label="Subscription plans">
      {plans.map((plan) => <article key={plan.id}>
        <small>{plan.id.toUpperCase()}</small>
        <h2>{plan.name}</h2>
        <p>{plan.description}</p>
        <ul>{plan.includes.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="commerce-options">
          {plan.billing.map((interval) => app.deployment.filter((model) => plan.deployment.includes(model)).map((model) =>
            <a key={`${interval}-${model}`} href={`/api/apps/checkout?app=${app.slug}&plan=${plan.id}&interval=${interval}&deployment=${encodeURIComponent(model)}`}>
              {interval === "monthly" ? "Monthly" : "Annual"} · {model}
            </a>
          ))}
        </div>
      </article>)}
    </section> : app.status === "Coming Soon" ? (
      <section className="commerce-coming">
        <h2>Commercial enrollment is not open.</h2>
        <p>This application remains in governed pre-production hardening. Checkout, SaaS launch, downloads, and billing activation stay disabled until the approved production release is published.</p>
        <Link href={`/contact?interest=application-preview&app=${app.slug}`}>Request governed preview</Link>
      </section>
    ) : (
      <section className="commerce-coming">
        <h2>Pilot enrollment is controlled.</h2>
        <p>This application is available only through an approved pilot engagement with security, deployment, identity, integration, and support scope confirmed before access is provisioned.</p>
        <Link href={`/contact?interest=controlled-pilot&app=${app.slug}`}>Request controlled pilot</Link>
      </section>
    )}

    <section className="commerce-workflow">
      <div>
        <p className="commerce-eyebrow">FULFILLMENT WORKFLOW</p>
        <h2>Purchase, provision, deploy, and manage from one governed process.</h2>
      </div>
      <ol>
        <li><strong>1. Approve</strong><span>The product release, deployment model, pricing, and customer eligibility pass their required gates.</span></li>
        <li><strong>2. Subscribe</strong><span>Authenticated Stripe checkout establishes the commercial subscription only for an approved Available product.</span></li>
        <li><strong>3. Entitle</strong><span>The customer account receives product, plan, tenant, and deployment entitlements.</span></li>
        <li><strong>4. Deliver</strong><span>Obserra provisions an approved SaaS endpoint or releases a signed customer deployment package.</span></li>
        <li><strong>5. Operate</strong><span>Renewals, releases, support, launch status, and deployment evidence are managed through the portal.</span></li>
      </ol>
    </section>

    <section className="commerce-support">
      <h2>Need enterprise procurement or remote deployment?</h2>
      <p>Enterprise deployments require security, integration, data residency, identity, support, implementation, and recovery scoping.</p>
      <Link href={`/contact?interest=enterprise-deployment&app=${app.slug}`}>Start deployment assessment</Link>
    </section>
  </main>;
}
