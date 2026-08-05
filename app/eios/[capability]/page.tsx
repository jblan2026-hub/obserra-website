import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eiosCapabilities, getEiosCapability } from "../capabilities";
import "../product-center.css";

export function generateStaticParams() {
  return eiosCapabilities.map((entry) => ({ capability: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ capability: string }> }): Promise<Metadata> {
  const { capability } = await params;
  const entry = getEiosCapability(capability);
  if (!entry) return {};
  return {
    title: `${entry.title} | Obserra EIOS`,
    description: entry.summary,
    alternates: { canonical: `/eios/${entry.slug}` },
    openGraph: {
      title: `${entry.title} | Obserra EIOS`,
      description: entry.summary,
      url: `https://www.obserrallc.com/eios/${entry.slug}`,
      type: "website",
      images: [{ url: entry.image, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.title} | Obserra EIOS`,
      description: entry.summary,
      images: [entry.image],
    },
  };
}

export default async function EiosCapabilityPage({ params }: { params: Promise<{ capability: string }> }) {
  const { capability } = await params;
  const entry = getEiosCapability(capability);
  if (!entry) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `Obserra EIOS ${entry.title}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `https://www.obserrallc.com/eios/${entry.slug}`,
        description: entry.summary,
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "EIOS", item: "https://www.obserrallc.com/eios" },
          { "@type": "ListItem", position: 3, name: entry.title, item: `https://www.obserrallc.com/eios/${entry.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="eios-product-page">
      <header className="eios-product-nav">
        <Link href="/" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" alt="Obserra" width={245} height={48} /></Link>
        <nav aria-label="EIOS product navigation">
          <Link href="/eios">EIOS overview</Link>
          <Link href="/apps">Applications</Link>
          <Link href="/trust">Trust Center</Link>
          <Link href={`/contact?interest=eios-demo&capability=${encodeURIComponent(entry.title)}`} className="eios-product-cta">Request demo</Link>
        </nav>
      </header>

      <section className="eios-product-hero">
        <div className="eios-product-copy">
          <p>{entry.eyebrow}</p>
          <h1>{entry.title}</h1>
          <p className="eios-product-summary">{entry.summary}</p>
          <div className="eios-product-actions">
            <Link href={`/contact?interest=eios-demo&capability=${encodeURIComponent(entry.title)}`}>Request tailored demo</Link>
            <Link href="/eios">Explore full EIOS platform</Link>
          </div>
        </div>
        <figure>
          <Image src={entry.image} alt={`${entry.title} product visualization`} fill priority sizes="(max-width: 900px) 100vw, 52vw" />
        </figure>
      </section>

      <section className="eios-product-section">
        <div className="eios-product-heading">
          <p>BUSINESS OUTCOMES</p>
          <h2>Designed to improve executive decisions and measurable enterprise results.</h2>
        </div>
        <div className="eios-outcome-grid">
          {entry.outcomes.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}
        </div>
      </section>

      <section className="eios-detail-grid">
        <article>
          <p>CORE CAPABILITIES</p>
          <h2>What the capability delivers</h2>
          <ul>{entry.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p>GOVERNANCE AND TRUST</p>
          <h2>How accountability is maintained</h2>
          <ul>{entry.governance.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p>DEPLOYMENT</p>
          <h2>How organizations can operate it</h2>
          <ul>{entry.deployment.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      <section className="eios-product-center">
        <div className="eios-product-heading">
          <p>EIOS PRODUCT CENTER</p>
          <h2>Explore the connected capabilities that form the Executive Intelligence Operating System.</h2>
        </div>
        <div className="eios-product-links">
          {eiosCapabilities.filter((item) => item.slug !== entry.slug).map((item) => (
            <Link href={`/eios/${item.slug}`} key={item.slug}>
              <span>{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <small>Explore capability →</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="eios-product-final">
        <p>ENTERPRISE BRIEFING</p>
        <h2>See how {entry.title} fits your operating model, risk profile, and deployment requirements.</h2>
        <div className="eios-product-actions">
          <Link href={`/contact?interest=eios-demo&capability=${encodeURIComponent(entry.title)}`}>Schedule an EIOS briefing</Link>
          <Link href="/trust">Review security and trust</Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
