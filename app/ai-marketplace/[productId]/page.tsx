import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { findAiMarketplaceProduct } from "../../../lib/ai-marketplace-catalog";
import { marketplaceV12Product, marketplaceV12PublicPath } from "../../../lib/marketplace-v12-catalog";
import MarketplaceCheckout from "../MarketplaceCheckout";
import type { MarketplacePublicCheckoutOption } from "../MarketplaceV12Checkout";
import { marketplaceV12ProductCommerce } from "../../../lib/marketplace-v12-runtime";
import { marketplaceV12PedestalDetail } from "../../../lib/marketplace-v12-product-pedestal";
import { marketplacePublicProductDetail } from "../../../lib/marketplace-public-product";
import { marketplaceV12PurchaseOptions } from "../../../lib/marketplace-v12-bindings";
import MarketplaceDimensionalPedestal from "../MarketplaceDimensionalPedestal";
import MarketplaceProductSalesHero from "../MarketplaceProductSalesHero";
import "../marketplace.css";

type PageProps = { params: Promise<{ productId: string }> };
type MarketplaceBuyerProductDetail = Omit<ReturnType<typeof marketplacePublicProductDetail>, "publisher" | "productType" | "tags" | "positionSeed" | "objectArchetype">;
export const dynamic = "force-dynamic";

function productTitle(name: string) {
  return name.replace("OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC — ", "");
}

function buyerText(value: string | null | undefined, fallback: string) {
  const copy = value?.trim();
  if (!copy || /\b(?:artifact|checksum|file ?name|manifest|sha(?:256)?|hash|verification|verified|validation|catalog record|execution evidence)\b/i.test(copy) || /\.(?:json|ya?ml|zip|tar|gz|md|txt|csv)\b/i.test(copy)) return fallback;
  return copy;
}

function buyerDetail(detail: ReturnType<typeof marketplacePublicProductDetail>): MarketplaceBuyerProductDetail {
  return {
    productId: detail.productId,
    slug: detail.slug,
    name: detail.name,
    description: detail.description,
    mission: detail.mission,
    family: detail.family,
    category: detail.category,
    domain: detail.domain,
    capability: detail.capability,
    proficiency: detail.proficiency,
    deliverable: detail.deliverable,
    pricing: detail.pricing,
    collection: detail.collection,
    relationships: detail.relationships,
  };
}

function price(product: NonNullable<ReturnType<typeof findAiMarketplaceProduct>>) {
  if (product.billing_model === "one-time") return "$" + product.one_time_usd + " one-time";
  if (product.billing_model === "hybrid") return "$" + product.one_time_usd + " one-time · or $" + product.monthly_usd + "/month";
  return "$" + product.monthly_usd + "/month · $" + product.annual_usd + "/year";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const productId = (await params).productId;
  const catalogProduct = marketplaceV12Product(productId);
  if (catalogProduct) {
    const description = buyerText(catalogProduct.description, `${catalogProduct.name} is a practical capability designed to help move work from a clear starting point to a usable outcome.`);
    return {
    title: catalogProduct.name + " | Obserra EPI AI Marketplace",
    description,
    alternates: { canonical: marketplaceV12PublicPath(catalogProduct) },
    robots: { index: true, follow: true },
    openGraph: { title: catalogProduct.name, description, url: marketplaceV12PublicPath(catalogProduct), type: "website" },
  };
  }
  const product = findAiMarketplaceProduct(productId);
  return product ? { title: productTitle(product.product_name) + " | Obserra EPI AI Marketplace", description: buyerText(product.mission, `${productTitle(product.product_name)} is a practical AI capability for real-world work.`), alternates: { canonical: "/ai-marketplace/" + product.product_id } } : {};
}

export default async function MarketplaceProductPage({ params }: PageProps) {
  const productId = (await params).productId;
  const catalogProduct = marketplaceV12Product(productId);
  const product = catalogProduct ? null : findAiMarketplaceProduct(productId);
  if (!product && !catalogProduct) notFound();

  if (catalogProduct) {
    if (catalogProduct.product_type === "collection" || catalogProduct.product_type === "bundle") permanentRedirect(marketplaceV12PublicPath(catalogProduct));
    const commerce = await marketplaceV12ProductCommerce(catalogProduct);
    const detail = marketplaceV12PedestalDetail(catalogProduct);
    const publicDetail = marketplacePublicProductDetail(detail);
    const salesDetail = buyerDetail(publicDetail);
    const purchaseOptions: MarketplacePublicCheckoutOption[] = marketplaceV12PurchaseOptions(catalogProduct).map((option) => ({ option: option.option, amountMinor: option.amountMinor }));
    const canonicalPath = marketplaceV12PublicPath(catalogProduct);
    const canonicalUrl = "https://www.obserrallc.com" + canonicalPath;
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "AI Marketplace", item: "https://www.obserrallc.com/ai-marketplace" },
      ...(detail.collection ? [{ "@type": "ListItem", position: 2, name: detail.collection.name, item: "https://www.obserrallc.com/ai-marketplace/collections/" + detail.collection.slug }] : []),
      { "@type": "ListItem", position: detail.collection ? 3 : 2, name: detail.name, item: canonicalUrl },
    ];
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": canonicalUrl + "#product",
        url: canonicalUrl,
        name: detail.name,
        description: buyerText(detail.description, `${detail.name} is a practical capability designed to help move work from a clear starting point to a usable outcome.`),
        brand: { "@type": "Brand", name: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" },
        manufacturer: { "@type": "Organization", name: detail.publisher, url: "https://www.obserrallc.com" },
        category: detail.category ?? detail.family,
        ...(detail.proficiency ? { audience: { "@type": "Audience", audienceType: detail.proficiency } } : {}),
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
    ];

    return <main className="ai-marketplace ai-marketplace--detail">
      <header className="ai-marketplace__nav">
        <Link href="/ai-marketplace">OBSERRA EPI</Link>
        <nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/skill-libraries">Skills</Link><Link href="/academy">Academy</Link><Link href="/contact?interest=ai-marketplace">Talk to an expert</Link></nav>
      </header>
      <MarketplaceProductSalesHero detail={salesDetail} options={purchaseOptions} checkoutEnabled={commerce.checkoutEnabled} />
      <MarketplaceDimensionalPedestal detail={salesDetail} checkoutEnabled={commerce.checkoutEnabled} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </main>;
  }

  if (!product) notFound();
  return <main className="ai-marketplace ai-marketplace--detail">
    <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/skill-libraries">Skill libraries</Link><Link href="/academy">Academy</Link><Link href="/contact?interest=ai-marketplace">Talk to an expert</Link></nav></header>
    <section className="ai-marketplace__detail-hero">
      <Link className="ai-marketplace__back" href="/ai-marketplace">← All marketplace capabilities</Link>
      <p className="ai-marketplace__eyebrow">{product.family.replace(/-/g, " ")}</p>
      <h1>{productTitle(product.product_name)}</h1>
      <p>{buyerText(product.mission, `${productTitle(product.product_name)} is a practical AI capability for real-world work.`)}</p>
      <div className="ai-marketplace__detail-grid"><div><span>What you receive</span><strong>{buyerText(product.deliverable, "A ready-to-use capability with clear setup and usage guidance.")}</strong></div><div><span>Purchase options</span><strong>{price(product)}</strong></div><div><span>Availability</span><strong>Contact us if online checkout is not available.</strong></div></div>
      <MarketplaceCheckout product={product} />
      <Link className="ai-marketplace__contact-cta" href={"/contact?interest=ai-marketplace&product=" + encodeURIComponent(product.product_id)}>Talk to an expert</Link>
    </section>
  </main>;
}
