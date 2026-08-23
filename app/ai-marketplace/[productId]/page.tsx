import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findAiMarketplaceProduct } from "../../../lib/ai-marketplace-catalog";
import { marketplaceV12Product } from "../../../lib/marketplace-v12-catalog";
import MarketplaceCheckout from "../MarketplaceCheckout";
import { marketplaceV12ProductCommerce } from "../../../lib/marketplace-v12-runtime";
import { marketplaceV12PedestalDetail } from "../../../lib/marketplace-v12-product-pedestal";
import MarketplaceDimensionalPedestal from "../MarketplaceDimensionalPedestal";
import "../marketplace.css";

type PageProps = { params: Promise<{ productId: string }> };
export const dynamic = "force-dynamic";

function title(productName: string) {
  return productName.replace("OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC — ", "");
}

function price(product: NonNullable<ReturnType<typeof findAiMarketplaceProduct>>) {
  if (product.billing_model === "one-time") return `$${product.one_time_usd} one-time`;
  if (product.billing_model === "hybrid") return `$${product.one_time_usd} one-time · or $${product.monthly_usd}/month`;
  return `$${product.monthly_usd}/month · $${product.annual_usd}/year`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const productId = (await params).productId;
  const catalogProduct = marketplaceV12Product(productId);
  if (catalogProduct) return { title: `${catalogProduct.name} | Obserra EPI AI Marketplace`, description: catalogProduct.description, alternates: { canonical: `/ai-marketplace/${catalogProduct.slug}` }, robots: { index: true, follow: true } };
  const product = findAiMarketplaceProduct(productId);
  return product ? { title: `${title(product.product_name)} | Obserra EPI AI Marketplace`, description: product.mission, alternates: { canonical: `/ai-marketplace/${product.product_id}` } } : {};
}

export default async function MarketplaceProductPage({ params }: PageProps) {
  const productId = (await params).productId;
  const catalogProduct = marketplaceV12Product(productId);
  const product = catalogProduct ? null : findAiMarketplaceProduct(productId);
  if (!product && !catalogProduct) notFound();
  if (catalogProduct) {
    const commerce = await marketplaceV12ProductCommerce(catalogProduct);
    const detail = marketplaceV12PedestalDetail(catalogProduct);
    const structuredData = { "@context": "https://schema.org", "@type": "Product", "@id": `https://www.obserrallc.com/ai-marketplace/${detail.slug}#product`, name: detail.name, description: detail.description, sku: detail.productId, brand: { "@type": "Brand", name: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" }, manufacturer: { "@type": "Organization", name: detail.publisher }, category: detail.category ?? detail.family };
    return <main className="ai-marketplace ai-marketplace--detail">
      <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Compare</Link><Link href={`/ai-marketplace/configure?mission=${encodeURIComponent(detail.mission ? detail.slug : "")}&items=${encodeURIComponent(detail.slug)}`}>Configure</Link><Link href="/ai-marketplace/hangar">Customer Hangar</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav></header>
      <MarketplaceDimensionalPedestal detail={detail} checkoutEnabled={commerce.checkoutEnabled} runtimeReason={commerce.reason} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>;
  }
  if (!product) notFound();
  return <main className="ai-marketplace ai-marketplace--detail">
    <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/skill-libraries">Skill libraries</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav></header>
    <section className="ai-marketplace__detail-hero">
      <Link className="ai-marketplace__back" href="/ai-marketplace">← All marketplace capabilities</Link>
      <p className="ai-marketplace__eyebrow">{product.family.replace(/-/g, " ")} · v{product.version}</p>
      <h1>{title(product.product_name)}</h1>
      <p>{product.mission}</p>
      <div className="ai-marketplace__detail-grid"><div><span>Delivery</span><strong>{product.deliverable}</strong></div><div><span>Commercial model</span><strong>{price(product)}</strong></div><div><span>Availability</span><strong>Protected checkout is enabled only after live payment, identity, ledger, and entitlement verification.</strong></div></div>
      <MarketplaceCheckout product={product} />
      <Link className="ai-marketplace__contact-cta" href={`/contact?interest=ai-marketplace&product=${encodeURIComponent(product.product_id)}`}>Discuss enterprise licensing</Link>
    </section>
  </main>;
}
