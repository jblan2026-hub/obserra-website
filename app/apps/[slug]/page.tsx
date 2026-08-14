import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductInfoSections } from "../AppsMarketplaceClient";
import { findStorefrontAppBySlug, storefrontApps } from "../storefront";
import "../apps.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return storefrontApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findStorefrontAppBySlug(slug);
  if (!entry) return { title: "Application not found" };
  return {
    title: `${entry.name} | Obserra Applications`,
    description: entry.value,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [entry.name, entry.category, "enterprise software", "cybersecurity software", "AI governance software", "Obserra Applications"],
    openGraph: {
      title: `${entry.name} | Obserra Applications`,
      description: entry.value,
      url: `https://www.obserrallc.com/apps/${entry.slug}`,
      type: "website",
      images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: entry.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.name} | Obserra Applications`,
      description: entry.value,
      images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
    },
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = findStorefrontAppBySlug(slug);
  if (!entry) notFound();

  const softwareApplication: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: entry.name,
    applicationCategory: entry.category,
    description: entry.value,
    operatingSystem: "Web",
    url: `https://www.obserrallc.com/apps/${entry.slug}`,
    provider: {
      "@type": "Organization",
      name: "Obserra Executive Protection & Intelligence LLC",
      url: "https://www.obserrallc.com",
    },
  };
  if (entry.status === "Available") {
    softwareApplication.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.obserrallc.com/apps/${entry.slug}/subscribe`,
    };
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      softwareApplication,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Applications", item: "https://www.obserrallc.com/apps" },
          { "@type": "ListItem", position: 3, name: entry.name, item: `https://www.obserrallc.com/apps/${entry.slug}` },
        ],
      },
      {
        "@type": "WebPage",
        name: `${entry.name} | Obserra Applications`,
        url: `https://www.obserrallc.com/apps/${entry.slug}`,
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
        about: { "@id": "https://www.obserrallc.com/#organization" },
      },
    ],
  };

  const statusClass = entry.status === "Available" ? "status-available" : entry.status === "Pilot" ? "status-pilot" : "status-coming";

  return <main className="app-detail-page">
    <header className="apps-nav">
      <Link href="/" className="apps-brand" aria-label="Obserra home">
        <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55}/>
        <span>PRODUCT DETAIL</span>
      </Link>
      <nav aria-label="Product navigation">
        <Link href="/">Home</Link>
        <Link href="/apps">All applications</Link>
        <Link href="/services">Services</Link>
        <Link href="/eios">EIOS</Link>
        <Link href="/academy">Academy</Link>
        <Link href="/portal">Portal</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>

    <section className="app-detail-hero">
      <span className={`status-pill ${statusClass}`}>{entry.status}</span>
      <h1>{entry.name}</h1>
      <p>{entry.value}</p>
      <div className="app-detail-meta">
        <span>{entry.category}</span>
        {entry.deployment.map((model) => <span key={model}>{model}</span>)}
      </div>
    </section>

    <ProductInfoSections entry={entry}/>

    <section className="app-pricing">
      <h2>Subscription, deployment, and lifecycle management</h2>
      <p>{entry.pricing}</p>
      {entry.status === "Coming Soon" ? (
        <>
          <p>Commerce, SaaS launch, customer downloads, and billing actions remain disabled until the exact application release passes security, high-availability, installer, supply-chain, documentation, and operational approval gates.</p>
          <div className="apps-actions">
            <Link className="apps-button" href={`/contact?interest=application-preview&app=${entry.slug}`}>Request governed preview</Link>
            <Link className="apps-outline" href={`/contact?interest=application-release-notice&app=${entry.slug}`}>Join release notification</Link>
          </div>
        </>
      ) : entry.status === "Pilot" ? (
        <>
          <p>Pilot enrollment is controlled through an Obserra deployment assessment. Existing approved pilot customers manage access, releases, and billing through the authenticated customer portal.</p>
          <div className="apps-actions">
            <Link className="apps-button" href={`/contact?interest=controlled-pilot&app=${entry.slug}`}>Request controlled pilot</Link>
            <Link className="apps-outline" href="/portal/applications">Open customer portal</Link>
          </div>
        </>
      ) : (
        <>
          <p>Purchase through the website, manage billing in Stripe, launch SaaS applications through subscription-bound access, or download an approved signed release package. Every action is revalidated against current entitlement and release status.</p>
          <div className="apps-actions">
            <Link className="apps-button" href={`/apps/${entry.slug}/subscribe`}>Choose subscription</Link>
            <a className="apps-outline" href={`/api/apps/access?app=${entry.slug}`}>Launch entitled SaaS</a>
            <a className="apps-outline" href={`/api/apps/download?app=${entry.slug}`}>Download approved release</a>
            <a className="apps-outline" href={`/api/apps/billing-portal?app=${entry.slug}`}>Manage subscription</a>
          </div>
        </>
      )}
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </main>;
}
