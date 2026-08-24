import Link from "next/link";

import type { MarketplacePublicProductDetail } from "../../lib/marketplace-public-product";
import MarketplaceV12Checkout, { type MarketplacePublicCheckoutOption } from "./MarketplaceV12Checkout";
import "./MarketplaceSimpleProduct.css";

type ProductDetail = Omit<MarketplacePublicProductDetail, "publisher" | "productType" | "tags" | "positionSeed" | "objectArchetype">;

function clean(value: string | null | undefined, fallback: string) {
  const copy = value?.trim();
  if (!copy || /\b(?:artifact|checksum|manifest|sha(?:256)?|verification|catalog record|execution evidence)\b/i.test(copy)) return fallback;
  return copy;
}

function optionLabel(option: MarketplacePublicCheckoutOption) {
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(option.amountMinor / 100);
  if (option.option === "recurring:month") return `${price} per month`;
  if (option.option === "recurring:year") return `${price} per year`;
  if (option.option === "team_license:once") return `${price} team license`;
  return `${price} one-time`;
}

export default function MarketplaceSimpleProduct({ detail, options, checkoutEnabled }: { detail: ProductDetail; options: readonly MarketplacePublicCheckoutOption[]; checkoutEnabled: boolean }) {
  const description = clean(detail.mission || detail.description, `${detail.name} helps you complete a specific task and move your work forward.`);
  const included = clean(detail.deliverable, "A ready-to-use capability with simple setup and usage guidance.");
  const salesHref = `/contact?interest=ai-marketplace&product=${encodeURIComponent(detail.productId)}`;
  return <section className="simple-product">
    <nav aria-label="Breadcrumb"><Link href="/ai-marketplace">Marketplace</Link><span>›</span><span>{detail.name}</span></nav>
    <div className="simple-product__layout">
      <div className="simple-product__story">
        <div className="simple-product__tags"><span>{detail.category || detail.family}</span><span>{detail.proficiency || "All levels"}</span></div>
        <h1>{detail.name}</h1>
        <p className="simple-product__lede">{description}</p>
        <section><h2>What you get</h2><p>{included}</p></section>
        <section><h2>Best for</h2><p>{detail.proficiency || "Any experience level"} teams working in {detail.category || detail.family}.</p></section>
        {detail.collection ? <Link className="simple-product__collection" href={`/ai-marketplace/collections/${encodeURIComponent(detail.collection.slug)}`}>Also available in {detail.collection.name} →</Link> : null}
      </div>
      <aside id="purchase-options" className="simple-product__purchase">
        <p>BUY THIS PRODUCT</p><h2>Choose your option</h2>
        {options.length ? <ul>{options.map((option) => <li key={option.option}>{optionLabel(option)}</li>)}</ul> : <p>Contact us for pricing.</p>}
        <MarketplaceV12Checkout productId={detail.productId} options={options} checkoutEnabled={checkoutEnabled} />
        <Link className="simple-product__help" href={salesHref}>Questions? We can help.</Link>
      </aside>
    </div>
  </section>;
}
