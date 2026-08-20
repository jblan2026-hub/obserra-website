import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductInfoSections } from "../AppsMarketplaceClient";
import { findAppBySlug, marketplaceApps } from "../appsData";
import "../apps.css";
import "../apps-commercial.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return marketplaceApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) return { title: "Application not found" };
  return {
    title: `${entry.name} | Obserra Applications`,
    description: `${entry.value} Review current Demo, Live, deployment, and release evidence.`,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [entry.name, entry.category, "Obserra Applications", "release evidence"],
    openGraph: {
      title: `${entry.name} | Obserra Applications`,
      description: entry.value,
      url: `https://www.obserrallc.com/apps/${entry.slug}`,
      type: "website",
    },
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: entry.name,
        applicationCategory: entry.category,
        description: entry.value,
        url: `https://www.obserrallc.com/apps/${entry.slug}`,
        provider: {
          "@type": "Organization",
          name: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
          url: "https://www.obserrallc.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Applications", item: "https://www.obserrallc.com/apps" },
          { "@type": "ListItem", position: 3, name: entry.name, item: `https://www.obserrallc.com/apps/${entry.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="app-detail-page">
      <header className="apps-nav">
        <Link href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>PRODUCT EVIDENCE</span>
        </Link>
        <nav aria-label="Product navigation">
          <Link href="/">Home</Link>
          <Link href="/apps">All applications</Link>
          <Link href="/eios">EIOS</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="app-detail-hero app-release-detail-hero">
        <span className="status-pill status-pilot">{entry.lifecycle}</span>
        <h1>{entry.name}</h1>
        <p>{entry.value}</p>
        <div className="app-detail-meta">
          <span>{entry.category}</span>
          <span>Demo: {entry.release.Demo.state}</span>
          <span>Live: {entry.release.Live.state}</span>
        </div>
      </section>

      <ProductInfoSections entry={entry} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
