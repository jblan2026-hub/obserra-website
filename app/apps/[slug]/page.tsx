import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductInfoSections } from "../AppsMarketplaceClient";
import { findAppBySlug, marketplaceApps } from "../appsData";
import "../apps.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return marketplaceApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) {
    return { title: "Application not found" };
  }
  return {
    title: `${entry.name} | Obserra Applications`,
    description: entry.value,
    alternates: { canonical: `/apps/${entry.slug}` },
    keywords: [
      entry.name,
      entry.category,
      "enterprise software",
      "cybersecurity software",
      "AI governance software",
      "Obserra Applications",
    ],
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
  const entry = findAppBySlug(slug);

  if (!entry) {
    notFound();
  }

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
                : "https://schema.org/PreSale"
        },
        url: `https://www.obserrallc.com/apps/${entry.slug}`,
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com"
        }
      },
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
    ]
  };

  return (
    <main className="app-detail-page">
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>PRODUCT DETAIL</span>
        </a>
        <nav aria-label="Product navigation">
          <a href="/">Home</a>
          <a href="/apps">All applications</a>
          <a href="/services">Services</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Product%20Inquiry" className="apps-nav-cta">Contact sales</a>
        </nav>
      </header>

      <section className="app-detail-hero">
        <span className={`status-pill ${
          entry.status === "Available"
            ? "status-available"
            : entry.status === "Pilot"
              ? "status-pilot"
              : "status-coming"
        }`}
        >
          {entry.status}
        </span>
        <h1>{entry.name}</h1>
        <p>{entry.value}</p>
        <div className="app-detail-meta">
          <span>{entry.category}</span>
          {entry.deployment.map((model) => (
            <span key={model}>{model}</span>
          ))}
        </div>
      </section>

      <ProductInfoSections entry={entry} />

      <section className="app-pricing">
        <h2>Pricing</h2>
        <p>{entry.pricing}</p>
        <div className="apps-actions">
          <a className="apps-button" href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Demo">Request Demo</a>
          <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Subscribe%20to%20Obserra%20Product%20Updates">Subscribe</a>
          <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Contact%20Obserra%20Sales">Contact Sales</a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
