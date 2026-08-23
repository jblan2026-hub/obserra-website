import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aiMarketplaceCatalog, findAiMarketplaceProduct } from "../../../lib/ai-marketplace-catalog";
import "../marketplace.css";

type PageProps = { params: Promise<{ productId: string }> };

function title(productName: string) {
  return productName.replace("OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC — ", "");
}

function price(product: NonNullable<ReturnType<typeof findAiMarketplaceProduct>>) {
  if (product.billing_model === "one-time") return `$${product.one_time_usd} one-time`;
  if (product.billing_model === "hybrid") return `$${product.one_time_usd} one-time · or $${product.monthly_usd}/month`;
  return `$${product.monthly_usd}/month · $${product.annual_usd}/year`;
}

export function generateStaticParams() {
  return aiMarketplaceCatalog().map((product) => ({ productId: product.product_id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = findAiMarketplaceProduct((await params).productId);
  if (!product) return {};
  return { title: `${title(product.product_name)} | Obserra EPI AI Marketplace`, description: product.mission, alternates: { canonical: `/ai-marketplace/${product.product_id}` } };
}

export default async function MarketplaceProductPage({ params }: PageProps) {
  const product = findAiMarketplaceProduct((await params).productId);
  if (!product) notFound();
  return <main className="ai-marketplace ai-marketplace--detail">
    <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/skill-libraries">Skill libraries</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav></header>
    <section className="ai-marketplace__detail-hero">
      <Link className="ai-marketplace__back" href="/ai-marketplace">← All marketplace capabilities</Link>
      <p className="ai-marketplace__eyebrow">{product.family.replace(/-/g, " ")} · v{product.version}</p>
      <h1>{title(product.product_name)}</h1>
      <p>{product.mission}</p>
      <div className="ai-marketplace__detail-grid"><div><span>Delivery</span><strong>{product.deliverable}</strong></div><div><span>Commercial model</span><strong>{price(product)}</strong></div><div><span>Availability</span><strong>Protected checkout is enabled only after live payment, identity, ledger, and entitlement verification.</strong></div></div>
      <Link className="ai-marketplace__contact-cta" href={`/contact?interest=ai-marketplace&product=${encodeURIComponent(product.product_id)}`}>Discuss enterprise licensing</Link>
    </section>
  </main>;
}
