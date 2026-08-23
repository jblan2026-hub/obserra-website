import Link from "next/link";
import type { MarketplacePedestalDetail } from "../../lib/marketplace-v12-product-pedestal";
import styles from "./MarketplaceProductFacts.module.css";

function plain(value: string | null) {
  return value ? value.replace(/[-_]/g, " ") : "Not recorded";
}

export default function MarketplaceProductFacts({ detail }: { detail: MarketplacePedestalDetail }) {
  const collectionPath = detail.collection ? `/ai-marketplace/collections/${encodeURIComponent(detail.collection.slug)}` : null;
  return (
    <section className={styles.context} aria-labelledby="catalog-context-title">
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <ol>
          <li><Link href="/ai-marketplace">AI Marketplace</Link></li>
          {detail.collection && collectionPath ? <li><Link href={collectionPath}>{detail.collection.name}</Link></li> : null}
          <li aria-current="page">{detail.name}</li>
        </ol>
      </nav>

      <div className={styles.heading}>
        <div>
          <p>Catalog identity and inclusion</p>
          <h2 id="catalog-context-title">Source-backed product context</h2>
        </div>
        <code>{detail.productId}</code>
      </div>

      <dl className={styles.facts}>
        <div><dt>Family</dt><dd>{detail.family}</dd></div>
        <div><dt>Type</dt><dd>{plain(detail.productType)}</dd></div>
        <div><dt>Category</dt><dd>{detail.category ?? "Not recorded"}</dd></div>
        <div><dt>Domain</dt><dd>{detail.domain ?? "Not recorded"}</dd></div>
        <div><dt>Capability</dt><dd>{detail.capability ?? "Not recorded"}</dd></div>
        <div><dt>Proficiency</dt><dd>{detail.proficiency ?? "Not recorded"}</dd></div>
        <div><dt>Capability ID</dt><dd>{detail.capabilityId ?? "Not recorded"}</dd></div>
        <div><dt>Price binding</dt><dd>{plain(detail.stripe.priceBindingState)}</dd></div>
        <div><dt>Bound Price keys</dt><dd>{detail.stripe.priceLookupKeyCount}</dd></div>
        <div><dt>Entitlement webhook required</dt><dd>{detail.stripe.webhookRequiredForEntitlement ? "Yes" : "Not recorded as required"}</dd></div>
      </dl>

      {detail.tags.length > 0 ? <ul className={styles.tags} aria-label="Catalog tags">{detail.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}

      {detail.collection && collectionPath ? (
        <aside className={styles.inclusion}>
          <div>
            <span>Declared collection inclusion</span>
            <strong>{detail.collection.name}</strong>
            <p>This membership comes from the product&apos;s catalog collection ID. It does not grant collection ownership or access.</p>
          </div>
          <Link href={collectionPath}>Inspect collection and inclusions{detail.collection.includedProductCount === null ? "" : ` · ${detail.collection.includedProductCount.toLocaleString()}`}</Link>
        </aside>
      ) : null}

      <nav className={styles.actions} aria-label="Product selection routes">
        <Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Select for comparison</Link>
        <Link href={`/ai-marketplace/configure?items=${encodeURIComponent(detail.slug)}${detail.mission ? `&mission=${encodeURIComponent(detail.slug)}` : ""}`}>Select for configuration</Link>
        <Link href={`/ai-marketplace?q=${encodeURIComponent(detail.category ?? detail.family)}`}>Explore matching catalog records</Link>
      </nav>
    </section>
  );
}
