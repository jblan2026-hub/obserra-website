import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductInfoSections } from "../AppsMarketplaceClient";
import { findAppBySlug, marketplaceApps } from "../appsData";
import "../apps.css";

type Props = { params: Promise<{ slug: string }> };

const liveApplicationUrls: Record<string, string> = {
  "obserra-eios": "https://app.obserrallc.com",
};

export function generateStaticParams() { return marketplaceApps.map((entry) => ({ slug: entry.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) return { title: "Application not found" };
  return {
    title: `${entry.name} | Obserra Applications`, description: entry.value,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [entry.name, entry.category, "enterprise software", "cybersecurity software", "AI governance software", "Obserra Applications"],
    openGraph: { title: `${entry.name} | Obserra Applications`, description: entry.value, url: `https://www.obserrallc.com/apps/${entry.slug}`, type: "website", images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: entry.name }] },
    twitter: { card: "summary_large_image", title: `${entry.name} | Obserra Applications`, description: entry.value, images: ["/brand/visuals/obserra-eios-intelligence-hero.png"] },
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) notFound();
  const liveApplicationUrl = liveApplicationUrls[entry.slug];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "SoftwareApplication", name: entry.name, applicationCategory: entry.category, description: entry.value, operatingSystem: "Web", offers: { "@type": "Offer", priceCurrency: "USD", availability: entry.status === "Available" ? "https://schema.org/InStock" : entry.status === "Pilot" ? "https://schema.org/PreOrder" : "https://schema.org/PreSale" }, url: liveApplicationUrl || `https://www.obserrallc.com/apps/${entry.slug}`, provider: { "@type": "Organization", name: "Obserra Executive Protection & Intelligence LLC", url: "https://www.obserrallc.com" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" }, { "@type": "ListItem", position: 2, name: "Applications", item: "https://www.obserrallc.com/apps" }, { "@type": "ListItem", position: 3, name: entry.name, item: `https://www.obserrallc.com/apps/${entry.slug}` }] },
      { "@type": "WebPage", name: `${entry.name} | Obserra Applications`, url: `https://www.obserrallc.com/apps/${entry.slug}`, isPartOf: { "@id": "https://www.obserrallc.com/#website" }, about: { "@id": "https://www.obserrallc.com/#organization" } },
    ]
  };

  return <main className="app-detail-page">
    <header className="apps-nav"><Link href="/" className="apps-brand" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55}/><span>PRODUCT DETAIL</span></Link><nav aria-label="Product navigation"><Link href="/">Home</Link><Link href="/apps">All applications</Link><Link href="/services">Services</Link><Link href="/eios">EIOS</Link><Link href="/academy">Academy</Link><Link href="/portal">Portal</Link><Link href="/contact">Contact</Link></nav></header>

    <section className="app-detail-hero"><span className={`status-pill ${entry.status === "Available" ? "status-available" : entry.status === "Pilot" ? "status-pilot" : "status-coming"}`}>{entry.status}</span><h1>{entry.name}</h1><p>{entry.value}</p><div className="app-detail-meta"><span>{entry.category}</span>{entry.deployment.map((model)=><span key={model}>{model}</span>)}</div></section>

    <ProductInfoSections entry={entry}/>

    <section className="app-pricing"><h2>Subscription, deployment, and lifecycle management</h2><p>{entry.pricing}</p><p>Purchase through the website, manage billing in Stripe, launch SaaS applications, or download approved deployment packages. Access is revalidated against subscription status and automatically denied when a subscription is unpaid, canceled, incomplete, or expired.</p><div className="apps-actions">
      {liveApplicationUrl ? <a className="apps-button" href={liveApplicationUrl} target="_blank" rel="noopener noreferrer">Subscribe &amp; Launch</a> : entry.status !== "Coming Soon" ? <Link className="apps-button" href={`/apps/${entry.slug}/subscribe`}>Choose subscription</Link> : <Link className="apps-button" href={`/contact?interest=application-preview&app=${entry.slug}`}>Request preview</Link>}
      {liveApplicationUrl ? <a className="apps-outline" href={liveApplicationUrl} target="_blank" rel="noopener noreferrer">Open live application</a> : <a className="apps-outline" href={`/api/apps/access?app=${entry.slug}`}>Launch SaaS</a>}
      <a className="apps-outline" href={`/api/apps/download?app=${entry.slug}`}>Download release</a>
      <a className="apps-outline" href={`/api/apps/billing-portal?app=${entry.slug}`}>Manage subscription</a>
    </div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </main>;
}
