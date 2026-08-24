"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Offer = { amount_minor: number; cadence?: string; currency: string; kind: string };
export type EditorialCatalogCard = {
  product_id: string;
  slug: string;
  name: string;
  description: string;
  mission?: string;
  family: string;
  category?: string;
  product_type: string;
  proficiency?: string;
  version?: string;
  publication_state?: string;
  pricing: { currency: string; model: string; offers: Offer[] };
  visualization?: { position_seed?: number; scene_cluster?: string; object_archetype?: string };
};

type SearchResult = { total: number; results: EditorialCatalogCard[]; nextCursor: string | null };
type VisualKind = "skill" | "agent" | "workflow" | "connector" | "assurance" | "bundle";

function readable(value: string | undefined) {
  return (value || "General").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function productPath(card: Pick<EditorialCatalogCard, "product_type" | "slug">) {
  const slug = encodeURIComponent(card.slug);
  return card.product_type === "collection" || card.product_type === "bundle"
    ? "/ai-marketplace/collections/" + slug
    : "/ai-marketplace/" + slug;
}

function isPackage(card: EditorialCatalogCard) {
  return card.product_type === "collection" || card.product_type === "bundle";
}

function offeringLabel(card: EditorialCatalogCard) {
  if (isPackage(card)) return "Capability collection";
  if (card.product_type === "ai-skill") return "Individual skill";
  if (card.product_type === "agent-team") return "Agent team";
  if (card.product_type === "workflow-pack") return "Workflow pack";
  return readable(card.product_type);
}

function price(card: EditorialCatalogCard) {
  const offers = card.pricing.offers.filter((offer) => Number.isSafeInteger(offer.amount_minor) && offer.amount_minor >= 0);
  if (!offers.length || card.pricing.model === "quote" || card.pricing.model === "enterprise_quote") return "Contact for pricing";
  const offer = [...offers].sort((left, right) => left.amount_minor - right.amount_minor)[0];
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: offer.currency, maximumFractionDigits: offer.amount_minor % 100 === 0 ? 0 : 2 }).format(offer.amount_minor / 100);
  const cadence = offer.cadence === "month" || offer.cadence === "monthly" ? " / month" : offer.cadence === "year" || offer.cadence === "annual" ? " / year" : " one-time";
  return (offers.length > 1 ? "From " : "") + amount + cadence;
}

function buyerOutcome(card: EditorialCatalogCard) {
  const value = (card.mission || card.description || "").trim();
  if (!value || /\b(?:artifact|checksum|manifest|sha(?:256)?|verification|catalog record)\b/i.test(value)) {
    return card.name + " helps move " + readable(card.category || card.family) + " work toward a controlled, usable outcome.";
  }
  return value;
}

function checksum(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function visualKind(card: EditorialCatalogCard): VisualKind {
  const value = `${card.product_type} ${card.family} ${card.category ?? ""} ${card.visualization?.object_archetype ?? ""}`.toLowerCase();
  if (/collection|bundle|suite|library|repository/.test(value)) return "bundle";
  if (/guard|assurance|governance|audit|security|evidence|risk/.test(value)) return "assurance";
  if (/connector|integration|plugin|bridge|mcp/.test(value)) return "connector";
  if (/workflow|automation|playbook|pipeline/.test(value)) return "workflow";
  if (/agent|team|orchestrat/.test(value)) return "agent";
  return "skill";
}

function visualStyle(card: EditorialCatalogCard): CSSProperties {
  const seed = checksum(card.product_id);
  return {
    "--editorial-hue": String(196 + (seed % 32)),
    "--editorial-x": String(15 + ((seed >>> 7) % 70)),
    "--editorial-y": String(18 + ((seed >>> 15) % 64)),
    "--editorial-angle": String(seed % 360),
  } as CSSProperties;
}

function CatalogVisual({ card }: { card: EditorialCatalogCard }) {
  return <div className="editorial-catalog__visual" aria-hidden="true" style={visualStyle(card)} data-kind={visualKind(card)}>
    <span className="editorial-catalog__visual-grid" />
    <span className="editorial-catalog__visual-aura" />
    <span className="editorial-catalog__visual-orbit editorial-catalog__visual-orbit--outer" />
    <span className="editorial-catalog__visual-orbit editorial-catalog__visual-orbit--inner" />
    <span className="editorial-catalog__visual-pedestal" />
    <span className="editorial-catalog__visual-core" />
    <span className="editorial-catalog__visual-node editorial-catalog__visual-node--a" />
    <span className="editorial-catalog__visual-node editorial-catalog__visual-node--b" />
    <small>{readable(card.visualization?.scene_cluster || card.category || card.family)}</small>
  </div>;
}

function CatalogCard({ card }: { card: EditorialCatalogCard }) {
  const packageCard = isPackage(card);
  const priced = card.pricing.offers.some((offer) => Number.isSafeInteger(offer.amount_minor) && offer.amount_minor >= 0)
    && card.pricing.model !== "quote"
    && card.pricing.model !== "enterprise_quote";
  const verification = card.publication_state === "artifact-verified-unpublished" ? "Package artifact verified" : "Governed listing";
  const primaryAction = packageCard
    ? "Explore this capability system"
    : priced
      ? "Buy now"
      : "Contact sales";
  return <article className="editorial-catalog__card">
    <Link className="editorial-catalog__card-link" href={productPath(card)} aria-label={"Open " + card.name}>
      <CatalogVisual card={card} />
      <div className="editorial-catalog__card-body">
        <div className="editorial-catalog__card-kicker"><span>{offeringLabel(card)}</span><strong>{price(card)}</strong></div>
        <h3>{card.name}</h3>
        <p>{buyerOutcome(card)}</p>
        <div className="editorial-catalog__tags">
          <span>{readable(card.category || card.family)}</span>
          {card.proficiency ? <span>{card.proficiency}</span> : null}
          {packageCard ? <span>{verification}</span> : null}
        </div>
        <footer data-action={priced && !packageCard ? "buy" : "open"}><span>{primaryAction}</span><b aria-hidden="true">→</b></footer>
      </div>
    </Link>
  </article>;
}

export default function MarketplaceEditorialCatalog({
  initialCatalog,
  initialTotal,
  initialNextCursor,
  initialQuery,
  familyEntries,
  featuredPackages,
}: {
  initialCatalog: EditorialCatalogCard[];
  initialTotal: number;
  initialNextCursor: string | null;
  initialQuery: string;
  familyEntries: [string, number][];
  featuredPackages: EditorialCatalogCard[];
}) {
  const initialized = useRef(false);
  const sequence = useRef(0);
  const [family, setFamily] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [cards, setCards] = useState(initialCatalog);
  const [total, setTotal] = useState(initialTotal);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (append = false, cursor = "") => {
    const current = sequence.current + 1;
    sequence.current = current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (query.trim()) params.set("q", query.trim());
      if (family) params.set("family", family);
      if (cursor) params.set("cursor", cursor);
      const response = await fetch("/api/ai-marketplace/search?" + params.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("catalog unavailable");
      const result = await response.json() as SearchResult;
      if (sequence.current !== current) return;
      setCards((existing) => append ? [...existing, ...result.results] : result.results);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
    } catch {
      if (sequence.current === current) setError("The catalog could not refresh. Your current governed results are still shown.");
    } finally {
      if (sequence.current === current) setLoading(false);
    }
  }, [family, query]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const timer = window.setTimeout(() => { void request(); }, 220);
    return () => window.clearTimeout(timer);
  }, [request]);

  const selectedFamily = family ? readable(family) : "All capability categories";
  const packageCards = useMemo(() => featuredPackages.slice(0, 4), [featuredPackages]);

  return <section className="editorial-catalog" aria-labelledby="editorial-catalog-title">
    <header className="editorial-catalog__heading">
      <div><p>OBSERRA EPI CAPABILITY DIRECTORY</p><h2 id="editorial-catalog-title">Choose the capability. Build the outcome.</h2></div>
      <p>Move from a business need to the exact Obserra product built for it. Compare fit, inspect pricing, combine capabilities, and open the stable product route for delivery options.</p>
    </header>

    {packageCards.length ? <section className="editorial-catalog__packages" aria-labelledby="package-spotlight-title">
      <div className="editorial-catalog__section-heading"><p>Curated systems</p><h3 id="package-spotlight-title">Start with a complete capability package</h3></div>
      <div>{packageCards.map((card) => <CatalogCard card={card} key={card.product_id} />)}</div>
    </section> : null}

    <div className="editorial-catalog__toolbar">
      <form role="search" onSubmit={(event) => { event.preventDefault(); void request(); }}>
        <label htmlFor="obserra-marketplace-search">What do you need to accomplish?</label>
        <div><input id="obserra-marketplace-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search outcomes, skills, agents, workflows, connectors, or controls" autoComplete="off" /><button type="submit">Find capabilities</button></div>
      </form>
      <p aria-live="polite">{loading ? "Refreshing catalog…" : total.toLocaleString() + " records in " + selectedFamily}</p>
    </div>

    <nav className="editorial-catalog__filters" aria-label="Marketplace categories">
      <button type="button" aria-pressed={!family} onClick={() => setFamily("")}>All <b>{familyEntries.reduce((count, entry) => count + entry[1], 0).toLocaleString()}</b></button>
      {familyEntries.map(([name, count]) => <button type="button" key={name} aria-pressed={family === name} onClick={() => setFamily(name)}>{readable(name)} <b>{count.toLocaleString()}</b></button>)}
    </nav>

    {error ? <div className="editorial-catalog__recovery" role="alert"><span>{error}</span><button type="button" onClick={() => void request()}>Retry</button></div> : null}

    <div className="editorial-catalog__result-header"><div><p>Marketplace results</p><h3>{selectedFamily}</h3></div><span>{cards.length ? "Showing " + cards.length + " current products" : "No matching products"}</span></div>
    <div className="editorial-catalog__grid" aria-busy={loading}>{cards.map((card) => <CatalogCard card={card} key={card.product_id} />)}</div>
    {!loading && !cards.length ? <div className="editorial-catalog__empty"><h3>No matching capability</h3><p>Clear the category or broaden the outcome you are searching for.</p><button type="button" onClick={() => { setFamily(""); setQuery(""); }}>Show all capabilities</button></div> : null}
    {nextCursor ? <button className="editorial-catalog__more" type="button" disabled={loading} onClick={() => void request(true, nextCursor)}>{loading ? "Loading…" : "Load more products"}</button> : null}
  </section>;
}
