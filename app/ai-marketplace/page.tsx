import type { Metadata } from "next";
import Link from "next/link";
import { marketplaceV12SalesDock, marketplaceV12Search, marketplaceV12Summary } from "../../lib/marketplace-v12-catalog";
import MarketplaceExperience, { type MarketplaceCard } from "./MarketplaceExperience";
import MarketplaceSalesDock from "./MarketplaceSalesDock";
import type { MarketplaceV12Card } from "../../lib/marketplace-v12-catalog";
import "./marketplace.css";

type PageProps = { searchParams: Promise<{ cursor?: string | string[]; q?: string | string[] }> };
function cursorValue(value: string | string[] | undefined) { const cursor = Array.isArray(value) ? value[0] : value; return cursor && /^\d{1,6}$/.test(cursor) ? cursor : undefined; }
function queryValue(value: string | string[] | undefined) { const query = Array.isArray(value) ? value[0] : value; return query?.trim().slice(0, 120) ?? ""; }
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> { const params = await searchParams, cursor = cursorValue(params.cursor), query = queryValue(params.q), page = cursor ? Math.floor(Number(cursor) / 24) + 1 : 1; const suffix = query ? ` — ${query}` : page === 1 ? "" : ` — Page ${page}`; const canonical = query ? `/ai-marketplace?q=${encodeURIComponent(query)}${cursor ? `&cursor=${cursor}` : ""}` : cursor ? `/ai-marketplace?cursor=${cursor}` : "/ai-marketplace"; const title = `AI Marketplace Catalog${suffix} | Obserra EPI`; return { title, description: "Browse artifact-verified Obserra EPI AI capabilities, skill packages, agent teams, workflows, connectors, assurance, and industry editions.", alternates: { canonical }, openGraph: { title, description: "Artifact-verified AI capabilities with protected fulfillment boundaries.", url: canonical, type: "website" } }; }

export default async function AiMarketplacePage({ searchParams }: PageProps) {
  const summary = marketplaceV12Summary();
  const params = await searchParams, cursor = cursorValue(params.cursor), query = queryValue(params.q);
  const initial = marketplaceV12Search({ cursor, q: query || undefined, limit: 24 });
  const catalog = initial.results as MarketplaceCard[];
  const familyEntries = Object.entries(summary.family_counts).sort(([a], [b]) => a.localeCompare(b));
  const salesDock = marketplaceV12SalesDock();
  const dockRecords = [...salesDock.packages, ...catalog] as MarketplaceV12Card[];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.obserrallc.com/ai-marketplace#catalog",
    url: "https://www.obserrallc.com/ai-marketplace",
    name: "Obserra EPI AI Marketplace",
    description: "Artifact-verified AI capability catalog with protected fulfillment boundaries.",
    isPartOf: { "@id": "https://www.obserrallc.com/#website" },
    mainEntity: { "@type": "ItemList", numberOfItems: initial.total, itemListElement: catalog.map((card, index) => ({ "@type": "ListItem", position: Number(cursor ?? 0) + index + 1, name: card.name, url: `https://www.obserrallc.com/ai-marketplace/${card.slug}` })) },
  };

  return (
    <main className="ai-marketplace">
      <header className="ai-marketplace__nav">
        <Link href="/" aria-label="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC home">OBSERRA EPI</Link>
        <nav aria-label="AI Marketplace navigation"><Link href="/">Home</Link><Link href="/ai-marketplace/compare">Compare</Link><Link href="/ai-marketplace/configure">Configure</Link><Link href="/ai-marketplace/hangar">Customer Hangar</Link><Link href="/ai-marketplace/skill-libraries">Skill libraries</Link><Link href="/apps">Applications</Link><Link href="/academy">Academy</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link></nav>
      </header>
      <section className="ai-marketplace__hero" aria-labelledby="marketplace-heading">
        <p>OBSERRA EPI AI CAPABILITY MARKETPLACE · CATALOG v1.2.0</p><h1 id="marketplace-heading">AI capability, made operational.</h1>
        <p className="ai-marketplace__hero-lede">Explore the published catalog through a data-driven spatial map or the fully equivalent accessible catalog below.</p>
        <div><span>{summary.total_cards.toLocaleString()} catalog records</span><span>{familyEntries.length} product families</span><span>Artifact-verified, not yet published</span></div>
        <p className="ai-marketplace__notice">Catalog records describe verified artifacts. Protected fulfillment, payment, entitlement, and installation remain unavailable until their required controls are configured and verified.</p>
      </section>
      <MarketplaceSalesDock products={dockRecords} />
      <nav className="ai-marketplace__crawl-pagination" aria-label="Catalog page navigation"><Link href="/ai-marketplace" aria-current={!cursor && !query ? "page" : undefined}>First catalog page</Link>{cursor && <Link href={`/ai-marketplace?${query ? `q=${encodeURIComponent(query)}&` : ""}cursor=${Math.max(0, Number(cursor) - 24)}`}>Previous catalog page</Link>}{initial.nextCursor && <Link href={`/ai-marketplace?${query ? `q=${encodeURIComponent(query)}&` : ""}cursor=${initial.nextCursor}`}>Next catalog page</Link>}</nav>
      <MarketplaceExperience initialCatalog={catalog} initialTotal={initial.total} initialNextCursor={initial.nextCursor} initialQuery={query} familyEntries={familyEntries} revision={summary.revision} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
