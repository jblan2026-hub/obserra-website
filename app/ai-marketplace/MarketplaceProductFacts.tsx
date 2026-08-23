import Link from "next/link";
import type { MarketplacePublicProductDetail } from "../../lib/marketplace-public-product";
import styles from "./MarketplaceProductFacts.module.css";

function plain(value: string | null) {
  return value ? value.replace(/[-_]/g, " ") : "Not recorded";
}

export default function MarketplaceProductFacts({ detail }: { detail: MarketplacePublicProductDetail }) {
  const collectionPath = detail.collection ? `/ai-marketplace/collections/${encodeURIComponent(detail.collection.slug)}` : null;

  return (
    <section className={styles.context} aria-labelledby="product-overview-title">
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <ol>
          <li><Link href="/ai-marketplace">AI Marketplace</Link></li>
          {detail.collection && collectionPath ? <li><Link href={collectionPath}>{detail.collection.name}</Link></li> : null}
          <li aria-current="page">{detail.name}</li>
        </ol>
      </nav>

      <div className={styles.heading}>
        <div>
          <p>Capability overview</p>
          <h2 id="product-overview-title">Explore this product</h2>
        </div>
      </div>

      <dl className={styles.facts}>
        <div><dt>Category</dt><dd>{detail.category ?? detail.family}</dd></div>
        <div><dt>Capability area</dt><dd>{detail.capability ?? detail.domain ?? "Not recorded"}</dd></div>
        <div><dt>Skill level</dt><dd>{detail.proficiency ?? "All levels"}</dd></div>
        <div><dt>Product format</dt><dd>{plain(detail.productType)}</dd></div>
      </dl>

      {detail.tags.length > 0 ? <ul className={styles.tags} aria-label="Product topics">{detail.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}

      {detail.collection && collectionPath ? (
        <aside className={styles.inclusion}>
          <div>
            <span>Part of a collection</span>
            <strong>{detail.collection.name}</strong>
            <p>Explore the full set of related capabilities in this collection.</p>
          </div>
          <Link href={collectionPath}>View collection</Link>
        </aside>
      ) : null}

      <nav className={styles.actions} aria-label="Product exploration routes">
        <Link href={`/ai-marketplace/compare?items=${encodeURIComponent(detail.slug)}`}>Compare capabilities</Link>
        <Link href={`/ai-marketplace/configure?items=${encodeURIComponent(detail.slug)}${detail.mission ? `&mission=${encodeURIComponent(detail.slug)}` : ""}`}>Plan your solution</Link>
        <Link href={`/ai-marketplace?q=${encodeURIComponent(detail.category ?? detail.family)}`}>Explore similar capabilities</Link>
      </nav>
    </section>
  );
}
