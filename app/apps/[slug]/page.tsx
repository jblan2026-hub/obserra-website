import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACADEMY_BRAND_NAME, APPLICATIONS_BRAND_NAME, CANONICAL_PUBLIC_ORIGIN, EIOS_BRAND_NAME, LEGAL_ENTITY_NAME } from "../../../lib/legal-identity";
import { ProductInfoSections } from "../AppsMarketplaceClient";
import { findAppBySlug, marketplaceApps, marketplaceEngagementLabel } from "../appsData";
import "../apps.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return marketplaceApps.map((entry) => ({ slug: entry.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) return { title: "Application not found" };
  return {
    title: `${entry.name} | ${APPLICATIONS_BRAND_NAME}`, description: entry.value,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [entry.name, entry.category, "enterprise software", "cybersecurity software", "AI governance software", APPLICATIONS_BRAND_NAME],
    openGraph: { title: `${entry.name} | ${APPLICATIONS_BRAND_NAME}`, description: entry.value, url: `${CANONICAL_PUBLIC_ORIGIN}/apps/${entry.slug}`, type: "website", images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: entry.name }] },
    twitter: { card: "summary_large_image", title: `${entry.name} | ${APPLICATIONS_BRAND_NAME}`, description: entry.value, images: ["/brand/visuals/obserra-eios-intelligence-hero.png"] },
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "SoftwareApplication", name: entry.name, applicationCategory: entry.category, description: entry.value, operatingSystem: "Web", url: `${CANONICAL_PUBLIC_ORIGIN}/apps/${entry.slug}`, provider: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: CANONICAL_PUBLIC_ORIGIN } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_PUBLIC_ORIGIN }, { "@type": "ListItem", position: 2, name: APPLICATIONS_BRAND_NAME, item: `${CANONICAL_PUBLIC_ORIGIN}/apps` }, { "@type": "ListItem", position: 3, name: entry.name, item: `${CANONICAL_PUBLIC_ORIGIN}/apps/${entry.slug}` }] },
      { "@type": "WebPage", name: `${entry.name} | ${APPLICATIONS_BRAND_NAME}`, url: `${CANONICAL_PUBLIC_ORIGIN}/apps/${entry.slug}`, isPartOf: { "@id": `${CANONICAL_PUBLIC_ORIGIN}/#website` }, about: { "@id": `${CANONICAL_PUBLIC_ORIGIN}/#organization` } },
    ]
  };

  return <main className="app-detail-page">
    <header className="apps-nav"><Link href="/" className="apps-brand" aria-label={LEGAL_ENTITY_NAME}><Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55}/><span>PRODUCT DETAIL</span></Link><nav aria-label="Product navigation"><Link href="/">Home</Link><Link href="/apps">All {APPLICATIONS_BRAND_NAME}</Link><Link href="/services">Services</Link><Link href="/eios">{EIOS_BRAND_NAME}</Link><Link href="/academy">{ACADEMY_BRAND_NAME}</Link><Link href="/portal">Portal</Link><Link href="/contact">Contact</Link></nav></header>

    <section className="app-detail-hero"><span className={`status-pill ${entry.status === "Available" ? "status-available" : entry.status === "Pilot" ? "status-pilot" : "status-coming"}`}>{marketplaceEngagementLabel[entry.status]}</span><h1>{entry.name}</h1><p>{entry.value}</p><div className="app-detail-meta"><span>{entry.category}</span>{entry.deployment.map((model)=><span key={model}>{model}</span>)}</div></section>

    <ProductInfoSections entry={entry}/>

    <section className="app-pricing">
      <h2>Enterprise deployment and commercial assessment</h2>
      <p>Commercial scope, pricing, deployment boundaries, implementation, and any future access are confirmed through an authorized enterprise assessment before an order, entitlement, launch, or delivery.</p>
      <div className="apps-actions">
        <Link className="apps-button" href={`/contact?interest=application-demo&app=${entry.slug}`}>Request enterprise demo</Link>
        <Link className="apps-outline" href={`/contact?interest=deployment-assessment&app=${entry.slug}`}>Request deployment assessment</Link>
        <Link className="apps-outline" href="/trust">Review security and trust</Link>
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </main>;
}
