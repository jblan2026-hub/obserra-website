import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  marketplaceV12CollectionDirectory,
  marketplaceV12Product,
  marketplaceV12Search,
  marketplaceV12Summary,
  type MarketplaceV12Card,
} from "../../lib/marketplace-v12-catalog";
import { marketplaceV12WorkspaceCandidates } from "../../lib/marketplace-v12-workspaces";
import MarketplaceCapabilityUniverse from "./MarketplaceCapabilityUniverse";
import MarketplaceCommandDeck from "./MarketplaceCommandDeck";
import MarketplaceEditorialCatalog, { type EditorialCatalogCard } from "./MarketplaceEditorialCatalogStyled";
import MarketplaceSalesDock from "./MarketplaceSalesDock";
import "./MarketplaceEditorialCatalog.css";
import "./marketplace.css";
import "./MarketplaceRefresh.css";

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
  const page = cursor ? Math.floor(Number(cursor) / 24) + 1 : 1;
  const suffix = query ? " — " + query : page === 1 ? "" : " — Page " + page;
  const canonical = query
    ? "/ai-marketplace?q=" + encodeURIComponent(query) + (cursor ? "&cursor=" + cursor : "")
    : cursor ? "/ai-marketplace?cursor=" + cursor : "/ai-marketplace";
  return {
    title: "AI Marketplace" + suffix + " | Obserra EPI",
    description: "Explore governed Obserra EPI AI skills, agent teams, workflow packs, connectors, guardrails, assurance, governance, and industry editions built for controlled real-world execution.",
    alternates: { canonical },
    openGraph: {
      title: "Obserra EPI AI Marketplace" + suffix,
      description: "Put governed AI capability to work with package-backed products built for controlled execution.",
      url: canonical,
      type: "website",
    },
  };
}

export default async function AiMarketplacePage({ searchParams }: PageProps) {
  const summary = marketplaceV12Summary();
  const params = await searchParams;
  const cursor = cursorValue(params.cursor);
  const query = queryValue(params.q);
  const initial = marketplaceV12Search({ cursor, q: query || undefined, limit: 24 });
  const universeRecords = marketplaceV12WorkspaceCandidates(query || undefined);
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
    description: "Explore governed, package-backed AI capabilities built for controlled real-world execution.",
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
      <Link className="ai-marketplace__brand-lockup" href="/" aria-label="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC home">
        <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" />
      </Link>
      <nav aria-label="AI Marketplace navigation">
        <Link href="#marketplace-catalog">Marketplace</Link>
        <Link href="/ai-marketplace/compare">Compare</Link>
        <Link href="/ai-marketplace/configure">Build a solution</Link>
        <Link href="/ai-marketplace/hangar">My products</Link>
        <Link href="/ai-marketplace/skill-libraries">Skill libraries</Link>
        <Link href="/apps">Applications</Link>
        <Link href="/academy">Academy</Link>
        <Link className="ai-marketplace__nav-cta" href="/contact?interest=ai-marketplace">Enterprise licensing</Link>
      </nav>
    </header>

    <MarketplaceCommandDeck totalCards={summary.total_cards} collectionCount={featuredPackages.length} familyCount={familyEntries.length} />

    <MarketplaceSalesDock products={dockRecords} />

    <section id="marketplace-catalog" className="ai-marketplace__catalog-anchor" aria-label="Marketplace catalog">
      <div className="ai-marketplace__catalog-intro">
        <p>FULL GOVERNED CATALOG</p>
        <h2>Find the exact capability for the work in front of you.</h2>
        <span>Search, compare, configure, and open stable product routes across the complete Obserra EPI marketplace.</span>
      </div>
      <nav className="ai-marketplace__crawl-pagination" aria-label="Marketplace result pages">
        <Link href="/ai-marketplace" aria-current={!cursor && !query ? "page" : undefined}>First results page</Link>
        {cursor ? <Link href={"/ai-marketplace?" + (query ? "q=" + encodeURIComponent(query) + "&" : "") + "cursor=" + Math.max(0, Number(cursor) - 24)}>Previous results</Link> : null}
        {initial.nextCursor ? <Link href={"/ai-marketplace?" + (query ? "q=" + encodeURIComponent(query) + "&" : "") + "cursor=" + initial.nextCursor}>Next results</Link> : null}
      </nav>
      <MarketplaceEditorialCatalog initialCatalog={catalog} initialTotal={initial.total} initialNextCursor={initial.nextCursor} initialQuery={query} familyEntries={familyEntries} featuredPackages={featuredPackages} />
    </section>

    <MarketplaceCapabilityUniverse records={universeRecords} totalCards={summary.total_cards} familyCount={familyEntries.length} />

    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </main>;
}
