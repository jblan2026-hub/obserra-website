import Link from "next/link";

import type { MarketplacePublicProductDetail } from "../../lib/marketplace-public-product";
import MarketplaceV12Checkout, { type MarketplacePublicCheckoutOption } from "./MarketplaceV12Checkout";
import styles from "./MarketplaceProductSalesHero.module.css";

type Props = Readonly<{
  detail: MarketplacePublicProductDetail;
  options: readonly MarketplacePublicCheckoutOption[];
  checkoutEnabled: boolean;
}>;

function plain(value: string | null | undefined) {
  return value?.trim().replace(/[-_]+/g, " ") || null;
}

function money(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function cadence(value: string | null | undefined) {
  if (!value || value === "one-time" || value === "once") return "one-time";
  if (value === "month") return "per month";
  if (value === "year") return "per year";
  return `per ${plain(value) ?? "billing period"}`;
}

function offerName(kind: string) {
  if (kind === "recurring") return "Subscription";
  if (kind === "team_license") return "Team license";
  if (kind === "activation") return "Activation";
  return "One-time purchase";
}

export default function MarketplaceProductSalesHero({ detail, options, checkoutEnabled }: Props) {
  const category = detail.category ?? detail.family;
  const focus = detail.capability ?? detail.domain ?? category;
  const level = detail.proficiency ?? "All levels";
  const format = plain(detail.productType) ?? "Capability";
  const intendedOutcome = detail.mission ?? detail.description;
  const included = detail.deliverable ?? "Contact our team for a complete product overview.";
  const salesHref = `/contact?interest=ai-marketplace&product=${encodeURIComponent(detail.productId)}`;
  const collectionHref = detail.collection ? `/ai-marketplace/collections/${encodeURIComponent(detail.collection.slug)}` : null;

  return (
    <section className={styles.hero} aria-labelledby="product-sales-title">
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/ai-marketplace">AI Marketplace</Link>
          {detail.collection && collectionHref ? <><span aria-hidden="true">/</span><Link href={collectionHref}>{detail.collection.name}</Link></> : null}
          <span aria-hidden="true">/</span><span aria-current="page">{detail.name}</span>
        </nav>

        <div className={styles.layout}>
          <div className={styles.story}>
            <div className={styles.badges} aria-label="Product fit">
              <span>{category}</span>
              <span>{level}</span>
              <span>{format}</span>
            </div>

            <p className={styles.eyebrow}>Built for practical results</p>
            <h1 id="product-sales-title">{detail.name}</h1>
            <p className={styles.lede}>{intendedOutcome}</p>

            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#purchase-options">See pricing and purchase</a>
              <Link className={styles.secondaryAction} href={salesHref}>Talk to an expert</Link>
            </div>

            <section className={styles.outcomes} aria-labelledby="product-outcomes-title">
              <div className={styles.sectionHeading}>
                <p>Benefits and fit</p>
                <h2 id="product-outcomes-title">Know what you gain before you buy.</h2>
              </div>
              <dl>
                <div><dt>Intended outcome</dt><dd>{intendedOutcome}</dd></div>
                <div><dt>Who it&apos;s for</dt><dd>{level} · {focus}</dd></div>
                <div><dt>What&apos;s included</dt><dd>{included}</dd></div>
              </dl>
            </section>

            {detail.tags.length > 0 ? <ul className={styles.tags} aria-label="Topics covered">{detail.tags.slice(0, 8).map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}

            <nav className={styles.nextSteps} aria-label="Product planning options">
              <Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Compare this capability</Link>
              <Link href={`/ai-marketplace/configure?items=${encodeURIComponent(detail.slug)}${detail.mission ? `&mission=${encodeURIComponent(detail.slug)}` : ""}`}>Plan your solution</Link>
              {detail.collection && collectionHref ? <Link href={collectionHref}>View the full collection</Link> : null}
            </nav>
          </div>

          <aside className={styles.purchase} id="purchase-options" aria-labelledby="purchase-title">
            <div className={styles.purchaseHeading}>
              <p>Purchase options</p>
              <h2 id="purchase-title">Choose how you want to get started.</h2>
              <span>Review your order details before completing your purchase.</span>
            </div>

            {detail.pricing.offers.length > 0 ? <ul className={styles.offerList} aria-label="Available pricing">{detail.pricing.offers.map((offer) => <li key={`${offer.kind}-${offer.amount_minor}-${offer.cadence ?? "once"}`}><span>{offerName(offer.kind)}</span><strong>{money(offer.amount_minor, offer.currency)}</strong><small>{cadence(offer.cadence)}</small></li>)}</ul> : <p className={styles.pricingRequest}>Pricing is available by request.</p>}

            <div className={styles.checkout}>
              <MarketplaceV12Checkout productId={detail.productId} options={options} checkoutEnabled={checkoutEnabled} />
            </div>

            <div className={styles.reassurance}>
              <strong>{checkoutEnabled ? "Ready when you are." : "Need help choosing?"}</strong>
              <p>{checkoutEnabled ? "Select an option and continue when you are ready to review your order." : "Online checkout is not available right now, but our team can help with pricing and purchase options."}</p>
              <Link href={salesHref}>{checkoutEnabled ? "Ask a question" : "Contact sales"}</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
