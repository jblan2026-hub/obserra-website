import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findAppBySlug, marketplaceApps } from "../../appsData";
import "../../commerce.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return marketplaceApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = findAppBySlug(slug);
  if (!app) return { title: "Application not found" };
  return {
    title: `${app.name} release status | Obserra Applications`,
    description: `Review the current commercial and release state for ${app.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function SubscribePage({ params }: Props) {
  const { slug } = await params;
  const app = findAppBySlug(slug);
  if (!app) notFound();

  return (
    <main className="commerce-page">
      <header className="commerce-nav">
        <Link href="/" className="commerce-brand">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>RELEASE STATUS</span>
        </Link>
        <nav><Link href={`/apps/${app.slug}`}>Product evidence</Link><Link href="/apps">Applications</Link><Link href="/trust">Trust</Link><Link href="/contact">Contact</Link></nav>
      </header>

      <section className="commerce-hero">
        <p className="commerce-eyebrow">COMMERCIAL RELEASE GATE</p>
        <h1>{app.name}</h1>
        <p>{app.value}</p>
        <div className="commerce-tags"><span>{app.lifecycle}</span><span>Demo: {app.release.Demo.state}</span><span>Live: {app.release.Live.state}</span></div>
      </section>

      <section className="commerce-coming">
        <h2>No release-bound subscription is available.</h2>
        <p>{app.releaseEvidence.summary}</p>
        <p>Checkout remains unavailable until an approved release, price, entitlement path, support boundary, and exact customer-delivery target are bound to this product.</p>
        <Link href={`/apps/${app.slug}`}>Return to product evidence</Link>
      </section>

      <section className="commerce-workflow">
        <div><p className="commerce-eyebrow">RELEASE SEQUENCE</p><h2>Evidence comes before customer delivery.</h2></div>
        <ol>
          <li><strong>1. Validate</strong><span>Product, security, deployment, and recovery evidence is tied to an exact source version.</span></li>
          <li><strong>2. Approve</strong><span>The intended Demo or Live state and each deployment mode receive explicit approval.</span></li>
          <li><strong>3. Bind</strong><span>An exact endpoint, protected artifact, price, entitlement path, and support boundary are recorded.</span></li>
          <li><strong>4. Expose</strong><span>Only then may launch, download, or subscription actions appear in the Applications catalog.</span></li>
        </ol>
      </section>

      <section className="commerce-support"><h2>Need to review the remaining release gate?</h2><p>Obserra can review evidence and intended deployment without representing the product as customer-ready.</p><Link href={`/contact?interest=application-evidence-review&product=${encodeURIComponent(app.name)}`}>Request an evidence review</Link></section>
    </main>
  );
}
