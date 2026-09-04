import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findProductIntelligence,
  productIntelligence,
  relatedProductIntelligence,
} from "../../../lib/product-intelligence";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

const siteUrl = "https://www.obserrallc.com";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return productIntelligence.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductIntelligence(slug);
  if (!product) return {};

  const title = `${product.name} | ${LEGAL_ENTITY_NAME} SaaS`;
  const description = product.marketing?.shortDescription || product.description;
  const canonical = `${siteUrl}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: product.marketing?.keywords,
    openGraph: {
      title: product.marketing?.headline || title,
      description,
      url: canonical,
      siteName: LEGAL_ENTITY_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.marketing?.headline || title,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProductIntelligence(slug);
  if (!product) notFound();

  const related = relatedProductIntelligence(product);
  const headline = product.marketing?.headline || product.name;
  const summary = product.marketing?.longDescription || product.description;
  const primaryCta = product.marketing?.primaryCta || "Start subscription";
  const secondaryCta = product.marketing?.secondaryCta || "Request enterprise briefing";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: product.category,
    softwareVersion: product.version,
    description: product.description,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      description: product.pricing,
      availability: product.status === "Available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${siteUrl}/products/${product.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: LEGAL_ENTITY_NAME,
      url: siteUrl,
    },
  };

  return (
    <main className="min-h-screen bg-[#04111f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b border-cyan-200/10 bg-[radial-gradient(circle_at_top_right,rgba(43,164,214,0.18),transparent_36%),linear-gradient(180deg,#071b2f_0%,#04111f_100%)] px-6 py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <span>{product.category}</span>
              <span className="text-white/35">•</span>
              <span>Version {product.version}</span>
              <span className="text-white/35">•</span>
              <span>{product.status}</span>
            </div>
            <h1 className="max-w-5xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">{headline}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">{summary}</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link className="rounded-md border border-[#d6af00] bg-[#ffd400] px-6 py-3 text-center font-semibold text-[#071a2b] shadow-[0_10px_24px_rgba(131,102,0,.24)] transition hover:bg-[#ffe55c]" href={`/apps/${product.slug}/subscribe`}>
                {primaryCta}
              </Link>
              <Link className="rounded-md border border-cyan-200/30 px-6 py-3 text-center font-semibold text-cyan-100 transition hover:bg-cyan-200/10" href={`/contact?product=${encodeURIComponent(product.slug)}`}>
                {secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-cyan-200/15 bg-slate-950/45 p-7 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Commercial profile</p>
            <dl className="mt-6 space-y-5">
              <div><dt className="text-sm text-slate-400">Pricing</dt><dd className="mt-1 text-lg font-semibold">{product.pricing}</dd></div>
              <div><dt className="text-sm text-slate-400">Deployment</dt><dd className="mt-1">{product.deployment.join(", ")}</dd></div>
              <div><dt className="text-sm text-slate-400">Access model</dt><dd className="mt-1">{product.subscriptionRequired ? "Subscription and entitlement controlled" : "Commercial access"}</dd></div>
              <div><dt className="text-sm text-slate-400">Release</dt><dd className="mt-1">{product.publishedAt ? new Date(product.publishedAt).toLocaleDateString("en-US") : "Approved release catalog"}</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3 lg:px-12">
        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-7 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Business capabilities</p>
          <h2 className="mt-3 text-3xl font-semibold">What the platform delivers</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(product.features.length ? product.features : ["Subscription-controlled access", "Secure customer delivery", `Published release ${product.version}`]).map((feature) => (
              <div key={feature} className="rounded-lg border border-white/10 bg-slate-950/45 p-5 text-slate-200">{feature}</div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Buyer fit</p>
          <h2 className="mt-3 text-2xl font-semibold">Designed for</h2>
          <ul className="mt-6 space-y-3 text-slate-300">
            {(product.marketing?.audiences?.length ? product.marketing.audiences : ["Enterprise leaders", "Security and risk teams", "Governance stakeholders"]).map((audience) => <li key={audience}>• {audience}</li>)}
          </ul>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Integrations</p>
          <h2 className="mt-3 text-2xl font-semibold">Enterprise connectivity</h2>
          <p className="mt-5 leading-7 text-slate-300">{product.integrations.length ? product.integrations.join(", ") : "Integration-ready through governed APIs and enterprise deployment services."}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Industry alignment</p>
          <h2 className="mt-3 text-2xl font-semibold">Supported environments</h2>
          <p className="mt-5 leading-7 text-slate-300">{product.supportedIndustries?.length ? product.supportedIndustries.join(", ") : "Configurable for regulated and complex enterprise environments."}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Framework intelligence</p>
          <h2 className="mt-3 text-2xl font-semibold">Control traceability</h2>
          <p className="mt-5 leading-7 text-slate-300">{product.supportedFrameworks?.length ? product.supportedFrameworks.join(", ") : "Framework mappings can be configured by product and customer environment."}</p>
        </article>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Related {LEGAL_ENTITY_NAME} capabilities</p>
            <h2 className="mt-3 text-3xl font-semibold">Extend the operating environment</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((entry) => (
                <Link key={entry.slug} href={`/products/${entry.slug}`} className="rounded-xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.06]">
                  <span className="text-xs uppercase tracking-[0.18em] text-cyan-200">{entry.category}</span>
                  <h3 className="mt-3 text-xl font-semibold">{entry.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{entry.marketing?.shortDescription || entry.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
