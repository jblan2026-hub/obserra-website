"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MarketplaceOffer = {
  amount_minor: number;
  cadence?: string;
  currency: string;
  kind: string;
};

export type MarketplaceCard = {
  product_id: string;
  slug: string;
  name: string;
  description: string;
  mission?: string;
  family: string;
  category?: string;
  product_type: string;
  proficiency?: string;
  pricing: {
    currency: string;
    model: string;
    offers: MarketplaceOffer[];
  };
};

type SearchResult = {
  total: number;
  results: MarketplaceCard[];
  nextCursor: string | null;
};

function readable(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function productPath(card: Pick<MarketplaceCard, "product_type" | "slug">) {
  const segment = encodeURIComponent(card.slug);
  return card.product_type === "collection" || card.product_type === "bundle"
    ? `/ai-marketplace/collections/${segment}`
    : `/ai-marketplace/${segment}`;
}

function price(card: MarketplaceCard) {
  const offers = card.pricing.offers.filter(
    (offer) => Number.isSafeInteger(offer.amount_minor) && offer.amount_minor >= 0 && Boolean(offer.currency),
  );

  if (card.pricing.model === "quote" || offers.length === 0) return "Contact for pricing";

  const offer = [...offers].sort((left, right) => left.amount_minor - right.amount_minor)[0];
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: offer.currency,
    maximumFractionDigits: offer.amount_minor % 100 === 0 ? 0 : 2,
  }).format(offer.amount_minor / 100);
  const cadence = offer.cadence?.toLocaleLowerCase();
  const cadenceLabel = !cadence || cadence === "one-time"
    ? " one-time"
    : cadence === "monthly"
      ? " / month"
      : cadence === "annual" || cadence === "yearly"
        ? " / year"
        : ` / ${readable(cadence).toLocaleLowerCase()}`;

  return `${offers.length > 1 ? "From " : ""}${amount}${cadenceLabel}`;
}

function CatalogCard({ card }: { card: MarketplaceCard }) {
  const href = productPath(card);
  const category = card.category || card.family;
  const level = card.proficiency;
  const outcome = card.mission || card.description;

  return (
    <article className="ai-marketplace__product-card">
      <div className="ai-marketplace__card-top">
        <span>{readable(category)}</span>
        {level && <span>{readable(level)}</span>}
      </div>
      <h3><Link href={href}>{card.name}</Link></h3>
      <p>{outcome}</p>
      <div className="ai-marketplace__card-meta" aria-label={`${card.name} details`}>
        <span>{readable(card.product_type)}</span>
        <strong>{price(card)}</strong>
      </div>
      <footer>
        <Link href={href} aria-label={`View ${card.name}`}>
          {card.product_type === "collection" || card.product_type === "bundle" ? "Open package" : "View skill"}
          <span aria-hidden="true"> →</span>
        </Link>
      </footer>
    </article>
  );
}

export default function MarketplaceExperience({
  initialCatalog,
  initialTotal,
  initialNextCursor,
  initialQuery = "",
  familyEntries,
}: {
  initialCatalog: MarketplaceCard[];
  initialTotal: number;
  initialNextCursor: string | null;
  initialQuery?: string;
  familyEntries: [string, number][];
}) {
  const initialized = useRef(false);
  const requestSequence = useRef(0);
  const [family, setFamily] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [cards, setCards] = useState(initialCatalog);
  const [total, setTotal] = useState(initialTotal);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (append = false, cursor = "") => {
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "24" });
      if (query.trim()) params.set("q", query.trim());
      if (family) params.set("family", family);
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/ai-marketplace/search?${params}`);
      if (!response.ok) throw new Error("Marketplace unavailable");

      const result = await response.json() as SearchResult;
      if (sequence !== requestSequence.current) return;
      setCards((current) => append ? [...current, ...result.results] : result.results);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
    } catch {
      if (sequence === requestSequence.current) {
        setError("Marketplace results are temporarily unavailable. Please try again.");
      }
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [family, query]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const timer = window.setTimeout(() => void request(), 220);
    return () => window.clearTimeout(timer);
  }, [request]);

  const catalogTotal = useMemo(
    () => familyEntries.reduce((count, [, familyCount]) => count + familyCount, 0),
    [familyEntries],
  );
  const categoryName = family ? readable(family) : "All categories";
  const resultSummary = useMemo(() => {
    const queryText = query.trim() ? ` matching “${query.trim()}”` : "";
    return `${total.toLocaleString()} ${total === 1 ? "result" : "results"}${queryText} in ${categoryName}`;
  }, [categoryName, query, total]);

  return (
    <section className="ai-marketplace__browser" aria-labelledby="marketplace-browser-heading">
      <header className="ai-marketplace__browser-intro">
        <p className="ai-marketplace__eyebrow">Find your capability</p>
        <h2 id="marketplace-browser-heading">Browse every skill and package.</h2>
        <p>Choose a category or search by the outcome you need. Every result opens its own page with level, pricing, and purchase availability.</p>
      </header>

      <div className="ai-marketplace__browser-layout">
        <aside className="ai-marketplace__category-panel" aria-labelledby="marketplace-categories-heading">
          <div className="ai-marketplace__category-heading">
            <h3 id="marketplace-categories-heading">Categories</h3>
            {family && <button type="button" onClick={() => setFamily("")}>Clear</button>}
          </div>
          <nav className="ai-marketplace__category-list" aria-label="Filter skills by category">
            <button type="button" aria-pressed={!family} onClick={() => setFamily("")}>
              <span>All categories</span><strong>{catalogTotal.toLocaleString()}</strong>
            </button>
            {familyEntries.map(([item, count]) => (
              <button type="button" aria-pressed={family === item} onClick={() => setFamily(item)} key={item}>
                <span>{readable(item)}</span><strong>{count.toLocaleString()}</strong>
              </button>
            ))}
          </nav>
        </aside>

        <div className="ai-marketplace__catalog">
          <form className="ai-marketplace__search" role="search" onSubmit={(event) => { event.preventDefault(); void request(); }}>
            <label htmlFor="marketplace-search">Search skills and packages</label>
            <div>
              <input
                id="marketplace-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try automation, leadership, security…"
                type="search"
                autoComplete="off"
              />
              {query && <button type="button" className="ai-marketplace__search-clear" onClick={() => setQuery("")} aria-label="Clear marketplace search">Clear</button>}
              <button type="submit" className="ai-marketplace__search-submit">Search</button>
            </div>
          </form>

          <div className="ai-marketplace__mobile-filters" aria-label="Popular category filters">
            <button type="button" aria-pressed={!family} onClick={() => setFamily("")}>All</button>
            {familyEntries.slice(0, 8).map(([item]) => (
              <button type="button" aria-pressed={family === item} onClick={() => setFamily(item)} key={item}>{readable(item)}</button>
            ))}
          </div>

          <div className="ai-marketplace__results-head">
            <div><h3>Available capabilities</h3><p>{categoryName}</p></div>
            <p className="ai-marketplace__result-count" role="status" aria-live="polite">
              {loading ? "Updating results…" : resultSummary}
            </p>
          </div>

          {error && (
            <div className="ai-marketplace__recovery" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => void request()}>Try again</button>
            </div>
          )}

          <div className="ai-marketplace__grid" aria-busy={loading}>
            {cards.map((card) => <CatalogCard key={card.product_id} card={card} />)}
          </div>
          {!loading && cards.length === 0 && (
            <div className="ai-marketplace__empty">
              <h3>No matching capabilities</h3>
              <p>Try a broader search or choose another category.</p>
              <button type="button" onClick={() => { setQuery(""); setFamily(""); }}>Show all capabilities</button>
            </div>
          )}
          {nextCursor && (
            <button className="ai-marketplace__more" type="button" onClick={() => void request(true, nextCursor)} disabled={loading}>
              {loading ? "Loading…" : "Show more capabilities"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
