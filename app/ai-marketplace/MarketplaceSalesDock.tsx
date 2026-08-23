"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MarketplaceV12Card } from "../../lib/marketplace-v12-catalog";
import styles from "./MarketplaceSalesDock.module.css";

type Props = { products: MarketplaceV12Card[] };

function uniqueProducts(products: MarketplaceV12Card[]) {
  return [...new Map(products.map((product) => [product.product_id, product])).values()];
}

function offerText(offer: MarketplaceV12Card["pricing"]["offers"][number]) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency }).format(offer.amount_minor / 100);
  return `${amount}${offer.cadence === "one-time" || !offer.cadence ? " one-time" : ` / ${offer.cadence}`}`;
}

function offerKind(kind: string) {
  if (kind === "recurring") return "Subscription";
  if (kind === "team_license") return "Team license";
  if (kind === "activation") return "Activation";
  return "One-time purchase";
}

export default function MarketplaceSalesDock({ products }: Props) {
  const records = useMemo(() => uniqueProducts(products).slice(0, 18), [products]);
  const [selectedId, setSelectedId] = useState(records[0]?.product_id ?? "");
  const [offerIndex, setOfferIndex] = useState(0);
  const selected = records.find((product) => product.product_id === selectedId) ?? records[0];
  if (!selected) return null;
  const offers = selected.pricing.offers ?? [], currentOffer = offers[Math.min(offerIndex, Math.max(offers.length - 1, 0))];
  const requiresQuote = selected.pricing.model === "quote" || offers.length === 0;
  const destination = requiresQuote
    ? `/contact?interest=ai-marketplace&product=${encodeURIComponent(selected.product_id)}`
    : `/ai-marketplace/${encodeURIComponent(selected.slug)}`;
  const action = requiresQuote ? "Contact sales" : "View purchase options";

  return <section className={styles.dock} aria-labelledby="sales-dock-heading">
    <div className={styles.header}><p>Featured capabilities</p><h2 id="sales-dock-heading">Find the right option for your team.</h2><span>Compare pricing and explore details</span></div>
    <div className={styles.workspace}>
      <nav className={styles.selector} aria-label="Select a capability">
        {records.map((product) => <button type="button" key={product.product_id} aria-current={selected.product_id === product.product_id ? "true" : undefined} onClick={() => { setSelectedId(product.product_id); setOfferIndex(0); }}><span>{product.family}</span><strong>{product.name}</strong><small>{product.product_type.replace(/-/g, " ")}</small></button>)}
      </nav>
      <article className={styles.configuration} aria-live="polite">
        <div className={styles.pedestal} aria-hidden="true"><i /><i /><b>{selected.product_type.split(/[-\s]/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</b></div>
        <div className={styles.copy}><p>{selected.family} · {selected.product_type.replace(/-/g, " ")}</p><h3>{selected.name}</h3><p className={styles.description}>{selected.description}</p>
          {offers.length > 0 ? <fieldset><legend>Choose a pricing option</legend><div className={styles.offers}>{offers.map((offer, index) => <label key={`${offer.kind}-${offer.amount_minor}-${offer.cadence ?? "once"}`}><input type="radio" name={`sales-dock-offer-${selected.product_id}`} checked={Math.min(offerIndex, offers.length - 1) === index} onChange={() => setOfferIndex(index)} /><span><strong>{offerText(offer)}</strong><small>{offerKind(offer.kind)}</small></span></label>)}</div></fieldset> : <p className={styles.noOffer}>Pricing is available by request.</p>}
          <div className={styles.readout}><span>Selected option</span><strong>{currentOffer ? offerText(currentOffer) : "Contact us for pricing"}</strong><small>{currentOffer ? "Checkout availability is confirmed on the product page." : "Our team can help you choose the right plan."}</small></div>
          <Link className={styles.action} href={destination}>{action}<span aria-hidden="true">→</span></Link>
        </div>
      </article>
    </div>
  </section>;
}
