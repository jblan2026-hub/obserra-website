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
  "obserra-sap-uac": "https://obserra-sap-3c98pt0op-obserra.vercel.app",
  "obserra-offboarding-orchestrator": "https://obserra-offboarding-7vcx1bq9m-obserra.vercel.app",
  "obserra-asset-intelligence": "https://obserra-asset-intel-oumjgaik0-obserra.vercel.app",
  "obserra-cyber-risk-register": "https://obserra-cyber-risk-lm0g1nht4-obserra.vercel.app",
  "obserra-identity-certification": "https://obserra-identity-cert-oumyo87fc-obserra.vercel.app",
  "obserra-vulnerability-prioritizer": "https://obserra-vulnerability-aop5neh0v-obserra.vercel.app",
  "obserra-incident-command": "https://obserra-incident-kdk49sh0o-obserra.vercel.app",
  "obserra-cloud-security-posture": "https://obserra-cloud-posture-4l4u6fbjk-obserra.vercel.app",
  "obserra-data-protection": "https://obserra-data-protection-a2azfhygo-obserra.vercel.app",
  "obserra-technology-lifecycle": "https://obserra-tech-lifecycle-43ynzbbwx-obserra.vercel.app",
  "obserra-business-continuity": "https://obserra-bgkajqcp6-obserra.vercel.app",
  "obserra-third-party-risk": "https://obserra-tprm-13fjfrcdy-obserra.vercel.app",
  "obserra-ai-governance": "https://obserra-ai-governance-drowgelrk-obserra.vercel.app",
  "obserra-security-control-evidence": "https://obserra-sec-evidence-jd4sqimkt-obserra.vercel.app",
  "obserra-executive-exposure": "https://obserra-exec-exposure-l8ptqfnpq-obserra.vercel.app",
  "obserra-it-pmo": "https://obserra-it-6qyp48efd-obserra.vercel.app",
  "obserra-executive-intelligence": "https://obserra-exec-intel-luuf9gjl1-obserra.vercel.app",
  "obserra-eios-console": "https://obserra-eios-console-puxc0g8gd-obserra.vercel.app",
};

export function generateStaticParams() {
  return marketplaceApps.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) {
    return {
      title: "Application not found",
      robots: { index: false, follow: false, nocache: true },
    };
  }

  return {
    title: `${entry.name} | Obserra EPI Applications`,
    description: entry.value,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = findAppBySlug(slug);
  if (!entry) notFound();
  const liveApplicationUrl = liveApplicationUrls[entry.slug];

  return (
    <main className="app-detail-page">
      <header className="apps-nav">
        <Link href="/" className="apps-brand" aria-label="Obserra home">
          <Image
            src="/brand/obserra-logo.png"
            alt="Obserra Executive Protection and Intelligence LLC"
            width={286}
            height={55}
          />
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
        <span
          className={`status-pill ${
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
        <h2>Subscription, deployment, and lifecycle management</h2>
        <p>{entry.pricing}</p>
        <p>
          Purchase through the website, manage billing in Stripe, launch SaaS applications,
          or download approved deployment packages. Access is revalidated against subscription
          status and automatically denied when a subscription is unpaid, canceled, incomplete,
          or expired.
        </p>
        <div className="apps-actions">
          {liveApplicationUrl ? (
            <a
              className="apps-button"
              href={liveApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe &amp; Launch
            </a>
          ) : entry.status !== "Coming Soon" ? (
            <Link className="apps-button" href={`/apps/${entry.slug}/subscribe`}>
              Choose subscription
            </Link>
          ) : (
            <Link
              className="apps-button"
              href={`/contact?interest=application-preview&app=${entry.slug}`}
            >
              Request preview
            </Link>
          )}
          {liveApplicationUrl ? (
            <a
              className="apps-outline"
              href={liveApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open live application
            </a>
          ) : (
            <a className="apps-outline" href={`/api/apps/access?app=${entry.slug}`}>
              Launch SaaS
            </a>
          )}
          <a className="apps-outline" href={`/api/apps/download?app=${entry.slug}`}>
            Download release
          </a>
          <a className="apps-outline" href={`/api/apps/billing-portal?app=${entry.slug}`}>
            Manage subscription
          </a>
        </div>
      </section>
    </main>
  );
}
