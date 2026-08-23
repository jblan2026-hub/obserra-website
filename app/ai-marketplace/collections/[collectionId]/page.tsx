import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketplaceV12CollectionMembers, marketplaceV12Product, marketplaceV12PublicPath } from "../../../../lib/marketplace-v12-catalog";
import { marketplaceV12ProductCommerce } from "../../../../lib/marketplace-v12-runtime";
import { marketplaceV12PedestalDetail } from "../../../../lib/marketplace-v12-product-pedestal";
import MarketplaceDimensionalPedestal from "../../MarketplaceDimensionalPedestal";
import MarketplaceProductFacts from "../../MarketplaceProductFacts";
import styles from "./collection.module.css";
import "../../marketplace.css";

type Props = { params: Promise<{ collectionId: string }>; searchParams: Promise<{ cursor?: string | string[] }> };
function cursorValue(value: string | string[] | undefined) { const cursor = Array.isArray(value) ? value[0] : value; return cursor && /^\d{1,6}$/.test(cursor) ? cursor : undefined; }
function plain(value: string | undefined) { return value ? value.replace(/[-_]/g, " ") : "Not recorded"; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = marketplaceV12Product((await params).collectionId);
  if (!collection || (collection.product_type !== "collection" && collection.product_type !== "bundle")) return {};
  const path = marketplaceV12PublicPath(collection);
  return { title: `${collection.name} | Obserra EPI AI Marketplace`, description: collection.description, alternates: { canonical: path }, robots: { index: true, follow: true }, openGraph: { title: collection.name, description: collection.description, url: path, type: "website" } };
}

export default async function MarketplaceCollectionPage({ params, searchParams }: Props) {
  const collectionId = (await params).collectionId, cursor = cursorValue((await searchParams).cursor);
  const collection = marketplaceV12Product(collectionId);
  if (!collection || (collection.product_type !== "collection" && collection.product_type !== "bundle")) notFound();
  const page = marketplaceV12CollectionMembers(collection.product_id, { cursor, limit: 24 });
  if (!page || "error" in page) notFound();
  const detail = marketplaceV12PedestalDetail(collection), commerce = await marketplaceV12ProductCommerce(collection), path = marketplaceV12PublicPath(collection);
  const offset = Number(cursor ?? 0), comparisonItems = page.results.slice(0, 4).map((entry) => entry.slug).join(","), configurationItems = page.results.slice(0, 8).map((entry) => entry.slug).join(",");
  const structuredData = [{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": `https://www.obserrallc.com${path}#collection`, url: `https://www.obserrallc.com${path}`, name: collection.name, description: collection.description, isPartOf: { "@id": "https://www.obserrallc.com/ai-marketplace#catalog" }, mainEntity: { "@type": "ItemList", numberOfItems: page.total, itemListElement: page.results.map((entry, index) => ({ "@type": "ListItem", position: offset + index + 1, name: entry.name, url: `https://www.obserrallc.com${marketplaceV12PublicPath(entry)}` })) } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AI Marketplace", item: "https://www.obserrallc.com/ai-marketplace" }, { "@type": "ListItem", position: 2, name: collection.name, item: `https://www.obserrallc.com${path}` }] }];
  return <main className="ai-marketplace ai-marketplace--detail">
    <header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Capability universe</Link><Link href="/ai-marketplace/compare">Compare</Link><Link href="/ai-marketplace/configure">Configure</Link><Link href="/ai-marketplace/hangar">Customer Hangar</Link></nav></header>
    <MarketplaceProductFacts detail={detail} />
    <MarketplaceDimensionalPedestal detail={detail} checkoutEnabled={commerce.checkoutEnabled} runtimeReason={commerce.reason} />
    <section className={styles.directory} aria-labelledby="collection-inclusions-title">
      <header><div><p>Verified collection inclusions</p><h2 id="collection-inclusions-title">{page.total.toLocaleString()} catalog-linked records</h2><span>Membership is derived from each record&apos;s collection product ID in catalog revision {page.revision}. No entitlement is implied.</span></div><nav aria-label="Collection selection actions"><Link href={`/ai-marketplace/compare?items=${encodeURIComponent(comparisonItems)}`}>Compare this page&apos;s first {Math.min(4, page.results.length)}</Link><Link href={`/ai-marketplace/configure?items=${encodeURIComponent(configurationItems)}`}>Configure from this page&apos;s first {Math.min(8, page.results.length)}</Link></nav></header>
      <dl className={styles.facets}><div><dt>Families</dt><dd>{Object.entries(page.facets.families).map(([name, count]) => `${name} (${count.toLocaleString()})`).join(" · ")}</dd></div><div><dt>Product types</dt><dd>{Object.entries(page.facets.product_types).map(([name, count]) => `${plain(name)} (${count.toLocaleString()})`).join(" · ")}</dd></div>{Object.keys(page.facets.proficiencies).length > 0 ? <div><dt>Proficiencies</dt><dd>{Object.entries(page.facets.proficiencies).map(([name, count]) => `${name} (${count.toLocaleString()})`).join(" · ")}</dd></div> : null}</dl>
      <ol className={styles.members} start={offset + 1}>{page.results.map((entry) => <li key={entry.product_id}><div><span>{entry.family} · {plain(entry.product_type)}</span><h3><Link href={marketplaceV12PublicPath(entry)}>{entry.name}</Link></h3><p>{entry.description}</p></div><dl><div><dt>Version</dt><dd>{entry.version}</dd></div><div><dt>State</dt><dd>{plain(entry.publication_state)}</dd></div><div><dt>Proficiency</dt><dd>{entry.proficiency ?? "Not recorded"}</dd></div></dl><nav aria-label={`Selection actions for ${entry.name}`}><Link href={`/ai-marketplace/compare?items=${encodeURIComponent(entry.slug)}`}>Compare</Link><Link href={`/ai-marketplace/configure?items=${encodeURIComponent(entry.slug)}${entry.mission ? `&mission=${encodeURIComponent(entry.slug)}` : ""}`}>Configure</Link></nav></li>)}</ol>
      <nav className={styles.pagination} aria-label="Collection inclusion pages">{offset > 0 ? <Link href={`${path}${offset > 24 ? `?cursor=${Math.max(0, offset - 24)}` : ""}`}>Previous inclusions</Link> : <span aria-disabled="true">Previous inclusions</span>}<strong>{offset + 1}–{offset + page.results.length} of {page.total.toLocaleString()}</strong>{page.nextCursor ? <Link href={`${path}?cursor=${page.nextCursor}`}>Next inclusions</Link> : <span aria-disabled="true">Next inclusions</span>}</nav>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </main>;
}
