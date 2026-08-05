import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCommerceBody, ProductCommerceHero } from "./ProductCommerceSections";
import { findAppBySlug, marketplaceApps } from "../appsData";
import "../apps.css";
import "./product-commerce.css";

type Props = { params: Promise<{ slug: string }> };

const liveApplicationUrls: Record<string, string> = {
  "obserra-eios": "https://app.obserrallc.com",
};

export function generateStaticParams() {
  return marketplaceApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) return { title: "Application not found" };

  return {
    title: `${entry.name} | Obserra Enterprise Marketplace`,
    description: entry.value,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [entry.name, entry.category, "enterprise software", "secure SaaS", "Obserra marketplace"],
    openGraph: {
      title: `${entry.name} | Obserra Enterprise Marketplace`,
      description: entry.value,
      url: `https://www.obserrallc.com/apps/${entry.slug}`,
      type: "website",
      images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: entry.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.name} | Obserra Enterprise Marketplace`,
      description: entry.value,
      images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
    },
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
      {
        "@type": "SoftwareApplication",
        name: entry.name,
        applicationCategory: entry.category,
        description: entry.value,
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability:
            entry.status === "Available"
              ? "https://schema.org/InStock"
              : entry.status === "Pilot"
                ? "https://schema.org/PreOrder"
                : "https://schema.org/PreSale",
        },
        url: liveApplicationUrl || `https://www.obserrallc.com/apps/${entry.slug}`,
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
          <Image src="/brand/obserra-logo.png" alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" width={286} height={55} />
          <span>ENTERPRISE MARKETPLACE</span>
        </Link>
        <nav aria-label="Product navigation">
          <Link href="/apps">Marketplace</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/services">Services</Link>
          <Link href="/trust">Trust Center</Link>
          <Link href="/portal">Customer Portal</Link>
          <Link href={`/contact?interest=application-demo&product=${encodeURIComponent(entry.name)}`} className="apps-nav-cta">Request demo</Link>
        </nav>
      </header>

      <ProductCommerceHero entry={entry} liveApplicationUrl={liveApplicationUrl} />
      <ProductCommerceBody entry={entry} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
