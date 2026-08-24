import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  marketplaceV12PublicPath,
  marketplaceV12Search,
  marketplaceV12Summary,
  type MarketplaceV12Card,
} from "../../lib/marketplace-v12-catalog";
import "./marketplace.css";
import "./MarketplaceSimple.css";

type PageProps = { searchParams: Promise<{ cursor?: string | string[]; q?: string | string[]; offering?: string | string[] }> };
type Offering = Readonly<{ slug: string; name: string; description: string; types: readonly string[]; count: number }>;

export const metadata: Metadata = {
  title: "AI Marketplace | Obserra EPI",
  description: "Browse Obserra EPI AI skills, agent packs, workflow packs, connectors, guardrails, industry editions, and capability collections.",
  alternates: { canonical: "/ai-marketplace" },
};

function value(input: string | string[] | undefined, max = 120) {
  return (Array.isArray(input) ? input[0] : input)?.trim().slice(0, max) ?? "";
}

function cursorValue(input: string | string[] | undefined) {
  const cursor = value(input, 6);
  return /^\d{1,6}$/.test(cursor) ? cursor : undefined;
}

function offerings(summary: ReturnType<typeof marketplaceV12Summary>): Offering[] {
  const count = (types: readonly string[]) => types.reduce((total, type) => total + (summary.product_type_counts[type] ?? 0), 0);
  const groups = [
    { slug: "skills", name: "AI Skills", description: "Individual skills for the work you need to complete.", types: ["ai-skill"] },
    { slug: "agent-packs", name: "Agent Packs", description: "Agent teams for research, operations, review, and delivery.", types: ["agent-team"] },
    { slug: "workflow-packs", name: "Workflow Packs", description: "Repeatable workflows for common business tasks.", types: ["workflow-pack"] },
    { slug: "connectors", name: "Connectors", description: "Connect capabilities to the tools your team uses.", types: ["connector"] },
    { slug: "trust-controls", name: "Guardrails & Assurance", description: "Products that help teams use AI with confidence.", types: ["guardrail", "governance", "assurance"] },
    { slug: "industry-editions", name: "Industry Editions", description: "Capability packs made for specific industries.", types: ["industry-edition"] },
    { slug: "collections", name: "Collections", description: "Complete skill libraries and curated product sets.", types: ["collection", "bundle"] },
  ] as const;
  return groups.map((group) => ({ ...group, count: count(group.types) }));
}

function money(card: MarketplaceV12Card) {
  const offers = card.pricing.offers.filter((offer) => Number.isSafeInteger(offer.amount_minor) && offer.amount_minor >= 0);
  if (!offers.length || /quote/.test(card.pricing.model)) return "Ask for pricing";
  const offer = [...offers].sort((left, right) => left.amount_minor - right.amount_minor)[0];
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency, maximumFractionDigits: offer.amount_minor % 100 ? 2 : 0 }).format(offer.amount_minor / 100);
  const cadence = offer.cadence === "month" ? "/month" : offer.cadence === "year" ? "/year" : "one-time";
  return `${offers.length > 1 ? "From " : ""}${amount} ${cadence}`;
}

function outcome(card: MarketplaceV12Card) {
  const copy = (card.mission || card.description || "").trim();
  if (!copy || /\b(?:artifact|checksum|manifest|sha(?:256)?|verification|catalog record)\b/i.test(copy)) return `A practical ${card.category || card.family} product for a clear, useful result.`;
  return copy;
}

function resultHref(card: MarketplaceV12Card) {
  const path = marketplaceV12PublicPath(card);
  return card.pricing.offers.length && !/quote/.test(card.pricing.model) ? `${path}#purchase-options` : path;
}

function listing(selected: Offering, query: string, cursor?: string) {
  if (selected.types.length === 1) return marketplaceV12Search({ type: selected.types[0], q: query || undefined, cursor, limit: 24 });
  const results = selected.types.flatMap((type) => marketplaceV12Search({ type, q: query || undefined, limit: 60 }).results).sort((left, right) => left.name.localeCompare(right.name));
  const start = Number(cursor ?? 0);
  return { total: results.length, results: results.slice(start, start + 24), nextCursor: start + 24 < results.length ? String(start + 24) : null };
}

export default async function AiMarketplacePage({ searchParams }: PageProps) {
  const summary = marketplaceV12Summary();
  const groups = offerings(summary);
  const params = await searchParams;
  const selected = groups.find((group) => group.slug === value(params.offering, 40));
  const query = value(params.q);
  const cursor = cursorValue(params.cursor);
  const products = selected ? listing(selected, query, cursor) : null;

  return <main className="ai-marketplace marketplace-simple">
    <header className="ai-marketplace__nav">
      <Link className="ai-marketplace__brand-lockup" href="/" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" /></Link>
      <nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/ai-marketplace/hangar">My products</Link><Link href="/contact?interest=ai-marketplace">Help choosing</Link></nav>
    </header>

    <section className="marketplace-simple__hero">
      <p>OBSERRA EPI AI MARKETPLACE</p>
      <h1>Choose what you need. See the options. Buy.</h1>
      <span>Start with one product type. Every product page shows what it does, what you get, and the price.</span>
    </section>

    <section className="marketplace-simple__offerings" aria-labelledby="offering-heading">
      <header><p>SHOP BY OFFERING</p><h2 id="offering-heading">What are you looking for?</h2></header>
      <div className="marketplace-simple__offering-grid">
        {groups.map((group) => <Link key={group.slug} href={`/ai-marketplace?offering=${group.slug}`} aria-current={selected?.slug === group.slug ? "page" : undefined}><span>{group.count.toLocaleString()} products</span><h3>{group.name}</h3><p>{group.description}</p><strong>View offerings <b aria-hidden="true">→</b></strong></Link>)}
      </div>
    </section>

    {selected && products ? <section className="marketplace-simple__listing" aria-labelledby="listing-heading">
      <header><div><Link href="/ai-marketplace">← All offerings</Link><p>{selected.name.toUpperCase()}</p><h2 id="listing-heading">{selected.name}</h2></div><span>{products.total.toLocaleString()} products</span></header>
      <form role="search" action="/ai-marketplace"><input type="hidden" name="offering" value={selected.slug} /><label htmlFor="marketplace-search">Search {selected.name}</label><div><input id="marketplace-search" name="q" type="search" defaultValue={query} placeholder="What do you need help with?" /><button type="submit">Search</button></div></form>
      <div className="marketplace-simple__product-list">
        {products.results.map((product) => <article key={product.product_id}><div><span>{product.proficiency || product.category || selected.name}</span><strong>{money(product as MarketplaceV12Card)}</strong></div><h3><Link href={resultHref(product as MarketplaceV12Card)}>{product.name}</Link></h3><p>{outcome(product as MarketplaceV12Card)}</p><Link className="marketplace-simple__buy" href={resultHref(product as MarketplaceV12Card)}>{product.pricing.offers.length ? "Buy now" : "View product"}<b aria-hidden="true">→</b></Link></article>)}
      </div>
      {!products.results.length ? <p className="marketplace-simple__empty">No products match that search. <Link href={`/ai-marketplace?offering=${selected.slug}`}>Clear search</Link></p> : null}
      <nav className="marketplace-simple__pagination" aria-label="Product pages">{cursor ? <Link href={`/ai-marketplace?offering=${selected.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}>First page</Link> : null}{products.nextCursor ? <Link href={`/ai-marketplace?offering=${selected.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}&cursor=${products.nextCursor}`}>More products →</Link> : null}</nav>
    </section> : null}
  </main>;
}
