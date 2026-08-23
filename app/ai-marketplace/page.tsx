import type { Metadata } from "next";
import Link from "next/link";

import {
  marketplaceV12CollectionDirectory,
  marketplaceV12Product,
  marketplaceV12Search,
  marketplaceV12Summary,
  type MarketplaceV12Card,
} from "../../lib/marketplace-v12-catalog";
import MarketplaceEditorialCatalog, { type EditorialCatalogCard } from "./MarketplaceEditorialCatalogStyled";
import MarketplaceSalesDock from "./MarketplaceSalesDock";
import "./marketplace.css";

type PageProps = { searchParams: Promise<{ cursor?: string | string[]; q?: string | string[] }> };

function cursorValue(value: string | string[] | undefined) {
  const cursor = Array.isArray(value) ? value[0] : value;
  return cursor && /^\d{1,6}$/.test(cursor) ? cursor : undefined;
}

function queryValue(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim().slice(0, 120) ?? "";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const cursor = cursorValue(params.cursor);
  const query = queryValue(params.q);
  const page = cursor ? Math.floor(Number(cursor) / 30) + 1 : 1;
  const suffix = query ? " — " + query : page === 1 ? "" : " — Page " + page;
  const canonical = query
    ? "/ai-marketplace?q=" + encodeURIComponent(query) + (cursor ? "&cursor=" + cursor : "")
    : cursor ? "/ai-marketplace?cursor=" + cursor : "/ai-marketplace";
  return {
    title: "AI Marketplace" + suffix + " | Obserra EPI",
    description: "Browse Obserra EPI AI capabilities, package-backed skills, agent teams, workflows, connectors, assurance, and industry editions.",
    alternates: { canonical },
    openGraph: { title: "AI Marketplace" + suffix, description: "Explore package-backed AI capabilities for real work.", url: canonical, type: "website" },
  };
}

export default async function AiMarketplacePage({ searchParams }: PageProps) {
  const summary = marketplaceV12Summary();
  const params = await searchParams;
  const cursor = cursorValue(params.cursor);
  const query = queryValue(params.q);
  const initial = marketplaceV12Search({ cursor, q: query || undefined, limit: 30 });
  const catalog = initial.results as EditorialCatalogCard[];
  const familyEntries = Object.entries(summary.family_counts).sort(([left], [right]) => left.localeCompare(right));
  const featuredLevels = ["Beginner", "Intermediate", "Expert", "Advanced"];
  const levelRecords = featuredLevels.flatMap((level) => marketplaceV12Search({ q: level, limit: 24 }).results
    .filter((product) => product.proficiency?.toLowerCase() === level.toLowerCase() && product.product_type !== "collection" && product.product_type !== "bundle" && product.pricing.model !== "quote" && product.pricing.offers.length > 0)
    .slice(0, 4));
  const workflowAnchor = marketplaceV12Product("access-review-workflow");
  const fallbackRecords = (initial.results as MarketplaceV12Card[]).filter((product) => product.product_type !== "collection" && product.product_type !== "bundle" && product.pricing.model !== "quote" && product.pricing.offers.length > 0);
  const dockRecords = [workflowAnchor, ...levelRecords, ...fallbackRecords].filter((product): product is MarketplaceV12Card => Boolean(product));
  const featuredPackages = marketplaceV12CollectionDirectory()
    .map((entry) => marketplaceV12Product(entry.productId))
    .filter((product): product is MarketplaceV12Card => Boolean(product)) as EditorialCatalogCard[];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.obserrallc.com/ai-marketplace#catalog",
    url: "https://www.obserrallc.com/ai-marketplace",
    name: "Obserra EPI AI Marketplace",
    description: "Explore package-backed AI capabilities for teams and organizations.",
    isPartOf: { "@id": "https://www.obserrallc.com/#website" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initial.total,
      itemListElement: catalog.map((card, index) => ({
        "@type": "ListItem",
        position: Number(cursor ?? 0) + index + 1,
        name: card.name,
        url: "https://www.obserrallc.com" + (card.product_type === "collection" || card.product_type === "bundle" ? "/ai-marketplace/collections/" : "/ai-marketplace/") + encodeURIComponent(card.slug),
      })),
    },
  };

  return <main className="ai-marketplace">
    <header className="ai-marketplace__nav">
      <Link href="/" aria-label="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC home">OBSERRA EPI</Link>
      <nav aria-label="AI Marketplace navigation">
        <Link href="/">Home</Link><Link href="/ai-marketplace/compare">Compare</Link><Link href="/ai-marketplace/configure">Build a bundle</Link><Link href="/ai-marketplace/hangar">My products</Link><Link href="/ai-marketplace/skill-libraries">Skill libraries</Link><Link href="/apps">Applications</Link><Link href="/academy">Academy</Link><Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link>
      </nav>
    </header>
    <section className="ai-marketplace__hero" aria-labelledby="marketplace-heading">
      <p>OBSERRA EPI AI CAPABILITY MARKETPLACE</p>
      <h1 id="marketplace-heading">Package-backed AI capability for real-world work.</h1>
      <p className="ai-marketplace__hero-lede">Choose a verified package, inspect its exact individual skills, then open the product route that describes its governed purchase and delivery state.</p>
      <div><span>{summary.total_cards.toLocaleString()} capabilities</span><span>{featuredPackages.length} skill packages</span><span>{familyEntries.length} categories</span></div>
      <p className="ai-marketplace__notice">Package contents, individual skill routes, and pricing are derived from the canonical marketplace catalog. Online purchase remains unavailable until the guarded commerce evidence is complete.</p>
    </section>
    <MarketplaceSalesDock products={dockRecords} />
    <nav className="ai-marketplace__crawl-pagination" aria-label="Marketplace result pages">
      <Link href="/ai-marketplace" aria-current={!cursor && !query ? "page" : undefined}>First results page</Link>
      {cursor ? <Link href={"/ai-marketplace?" + (query ? "q=" + encodeURIComponent(query) + "&" : "") + "cursor=" + Math.max(0, Number(cursor) - 30)}>Previous results</Link> : null}
      {initial.nextCursor ? <Link href={"/ai-marketplace?" + (query ? "q=" + encodeURIComponent(query) + "&" : "") + "cursor=" + initial.nextCursor}>Next results</Link> : null}
    </nav>
    <MarketplaceEditorialCatalog initialCatalog={catalog} initialTotal={initial.total} initialNextCursor={initial.nextCursor} initialQuery={query} familyEntries={familyEntries} featuredPackages={featuredPackages} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </main>;
}