"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { MarketplaceV12Card } from "../../lib/marketplace-v12-catalog";
import styles from "./MarketplaceSalesDock.module.css";

type Props = { products: MarketplaceV12Card[] };

function uniqueProducts(products: MarketplaceV12Card[]) {
  return [...new Map(products.map((product) => [product.product_id, product])).values()];
}

function words(value: string | null | undefined) {
  return value?.trim().replace(/[-_]/g, " ") || "General";
}

function offerText(offer: MarketplaceV12Card["pricing"]["offers"][number]) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency }).format(offer.amount_minor / 100);
  return `${amount}${offer.cadence === "one-time" || !offer.cadence ? " one-time" : ` / ${words(offer.cadence)}`}`;
}

function priceSummary(product: MarketplaceV12Card) {
  const offers = product.pricing.offers ?? [];
  if (product.pricing.model === "quote" || offers.length === 0) return { price: "Custom quote", note: "Talk with Obserra" };
  const lowest = [...offers].sort((left, right) => left.amount_minor - right.amount_minor)[0];
  return { price: offerText(lowest), note: offers.length > 1 ? `${offers.length} purchase options` : "Product price" };
}

function destination(product: MarketplaceV12Card) {
  const requiresQuote = product.pricing.model === "quote" || product.pricing.offers.length === 0;
  return {
    href: requiresQuote ? `/contact?interest=ai-marketplace&product=${encodeURIComponent(product.product_id)}` : `/ai-marketplace/${encodeURIComponent(product.slug)}`,
    label: requiresQuote ? "Request a quote" : "View product",
  };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function MarketplaceSalesDock({ products }: Props) {
  const records = useMemo(() => uniqueProducts(products).slice(0, 18), [products]);
  if (records.length === 0) return null;

  return <section className={styles.dock} aria-labelledby="sales-dock-heading">
    <header className={styles.header}>
      <div><p>Shop Obserra AI capabilities</p><h2 id="sales-dock-heading">Choose a capability you can understand before you buy.</h2></div>
      <p>Explore practical AI products by outcome, experience level, category, and price. Open any offering to see what it delivers and choose the right next step.</p>
    </header>
    <div className={styles.productGrid} aria-label="Featured AI products and skills">
      {records.map((product, index) => {
        const price = priceSummary(product);
        const action = destination(product);
        const category = words(product.category || product.family);
        const level = words(product.proficiency);
        const type = words(product.product_type);
        return <article className={styles.productCard} data-accent={index % 5} key={product.product_id}>
          <Link className={styles.cardLink} href={action.href} aria-label={`${action.label}: ${product.name}`}>
            <div className={styles.productVisual} aria-hidden="true"><i/><i/><b>{initials(product.name)}</b><span>{type}</span></div>
            <div className={styles.cardBody}>
              <div className={styles.badges}><span>{level}</span><span>{category}</span></div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <dl>
                <div><dt>Category</dt><dd>{category}</dd></div>
                <div><dt>Level</dt><dd>{level}</dd></div>
                <div className={styles.price}><dt>Price</dt><dd>{price.price}</dd><small>{price.note}</small></div>
              </dl>
              <span className={styles.action}>{action.label}<b aria-hidden="true">→</b></span>
            </div>
          </Link>
        </article>;
      })}
    </div>
    <footer className={styles.footer}><p>Need a broader solution?</p><Link href="/ai-marketplace/configure">Build a capability bundle</Link><Link href="/ai-marketplace/compare">Compare products</Link></footer>
  </section>;
}
