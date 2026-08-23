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
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> { const params = await searchParams, cursor = cursorValue(params.cursor), query = queryValue(params.q), page = cursor ? Math.floor(Number(cursor) / 24) + 1 : 1; const suffix = query ? ` — ${query}` : page === 1 ? "" : ` — Page ${page}`; const canonical = query ? `/ai-marketplace?q=${encodeURIComponent(query)}${cursor ? `&cursor=${cursor}` : ""}` : cursor ? `/ai-marketplace?cursor=${cursor}` : "/ai-marketplace"; const title = `AI Marketplace${suffix} | Obserra EPI`; return { title, description: "Browse Obserra EPI AI capabilities, skill packages, agent teams, workflows, connectors, assurance, and industry editions.", alternates: { canonical }, openGraph: { title, description: "Explore AI capabilities for your team and organization.", url: canonical, type: "website" } }; }

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
    description: "Explore AI capabilities for teams and organizations.",
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
        <p>OBSERRA EPI AI CAPABILITY MARKETPLACE</p><h1 id="marketplace-heading">AI capability for real-world work.</h1>
        <p className="ai-marketplace__hero-lede">Explore capabilities by category, level, and price to find the right fit for your team.</p>
        <div><span>{summary.total_cards.toLocaleString()} capabilities</span><span>{familyEntries.length} product families</span><span>Pricing shown where available</span></div>
        <p className="ai-marketplace__notice">Online purchase availability varies by capability. If checkout is unavailable, contact our team for help with purchase options.</p>
      </section>
      <MarketplaceSalesDock products={dockRecords} />
      <nav className="ai-marketplace__crawl-pagination" aria-label="Catalog page navigation"><Link href="/ai-marketplace" aria-current={!cursor && !query ? "page" : undefined}>First catalog page</Link>{cursor && <Link href={`/ai-marketplace?${query ? `q=${encodeURIComponent(query)}&` : ""}cursor=${Math.max(0, Number(cursor) - 24)}`}>Previous catalog page</Link>}{initial.nextCursor && <Link href={`/ai-marketplace?${query ? `q=${encodeURIComponent(query)}&` : ""}cursor=${initial.nextCursor}`}>Next catalog page</Link>}</nav>
      <MarketplaceExperience initialCatalog={catalog} initialTotal={initial.total} initialNextCursor={initial.nextCursor} initialQuery={query} familyEntries={familyEntries} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
