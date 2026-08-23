"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type MarketplaceProduct = {
  product_id: string;
  product_name: string;
  family: string;
  version: string;
  mission: string;
  deliverable: string;
  billing_model: "subscription" | "one-time" | "hybrid";
  monthly_usd: string;
  annual_usd: string;
  one_time_usd: string;
};

type CommerceHealth = {
  operational: boolean;
  productBindings?: { totalProducts: number; boundProducts: number; complete: boolean };
};

function displayName(product: MarketplaceProduct) {
  return product.product_name.replace("OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC — ", "");
}

function price(product: MarketplaceProduct) {
  if (product.billing_model === "one-time") return `$${product.one_time_usd} one-time`;
  if (product.billing_model === "hybrid") return `$${product.one_time_usd} one-time · or $${product.monthly_usd}/month`;
  return `$${product.monthly_usd}/month · $${product.annual_usd}/year`;
}

export default function MarketplaceExperience({ catalog, families }: { catalog: MarketplaceProduct[]; families: string[] }) {
  const [family, setFamily] = useState("all");
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<CommerceHealth | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ai-marketplace/commerce-health", { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json() as CommerceHealth }))
      .then(({ body }) => { if (active) setHealth(body); })
      .catch(() => { if (active) setHealth({ operational: false }); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => catalog.filter((product) => {
    const inFamily = family === "all" || product.family === family;
    const haystack = `${product.product_name} ${product.mission} ${product.deliverable}`.toLowerCase();
    return inFamily && haystack.includes(query.trim().toLowerCase());
  }), [catalog, family, query]);

  const bindingText = health?.operational
    ? "Secure checkout available"
    : health?.productBindings
      ? `${health.productBindings.boundProducts}/${health.productBindings.totalProducts} exact payment bindings verified — checkout unavailable`
      : "Checking protected checkout availability";

  return <>
    <section className="ai-marketplace__constellation" aria-labelledby="capability-map-heading">
      <div className="ai-marketplace__constellation-copy">
        <p className="ai-marketplace__eyebrow">Capability constellation</p>
        <h2 id="capability-map-heading">Explore the operating system behind the catalog.</h2>
        <p>Each orbit is a governed product family. The visual layer enhances discovery; the complete catalog, controls, and checkout state remain available in ordinary HTML.</p>
        <div className="ai-marketplace__commerce-status" role="status" aria-live="polite">{bindingText}</div>
      </div>
      <div className="ai-marketplace__orbit-stage" aria-hidden="true">
        <div className="ai-marketplace__orbit ai-marketplace__orbit--one" />
        <div className="ai-marketplace__orbit ai-marketplace__orbit--two" />
        <div className="ai-marketplace__core">{catalog.length}<small>offers</small></div>
        {families.map((item, index) => <span className={`ai-marketplace__node ai-marketplace__node--${index + 1}`} key={item}>{catalog.filter((product) => product.family === item).length}</span>)}
      </div>
    </section>
    <section className="ai-marketplace__discovery" aria-label="Catalog discovery controls">
      <label>
        <span>Search all 64 offerings</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search capability, deliverable, or product" type="search" />
      </label>
      <div className="ai-marketplace__filters" aria-label="Filter by product family">
        <button type="button" aria-pressed={family === "all"} onClick={() => setFamily("all")}>All <span>{catalog.length}</span></button>
        {families.map((item) => <button type="button" aria-pressed={family === item} onClick={() => setFamily(item)} key={item}>{item.replace(/-/g, " ")} <span>{catalog.filter((product) => product.family === item).length}</span></button>)}
      </div>
    </section>
    <section className="ai-marketplace__results" aria-live="polite" aria-label="AI marketplace products">
      <p className="ai-marketplace__result-count">{visible.length} of {catalog.length} governed offerings</p>
      <div className="ai-marketplace__grid">
        {visible.map((product) => <article key={product.product_id} className="ai-marketplace__product-card">
          <div className="ai-marketplace__card-top"><span>{product.family.replace(/-/g, " ")}</span><span>v{product.version}</span></div>
          <h3>{displayName(product)}</h3>
          <p>{product.mission}</p>
          <dl><div><dt>Deliverable</dt><dd>{product.deliverable}</dd></div><div><dt>Commercial model</dt><dd>{price(product)}</dd></div></dl>
          <footer><Link href={`/ai-marketplace/${encodeURIComponent(product.product_id)}`}>View capability <span aria-hidden="true">→</span></Link></footer>
        </article>)}
      </div>
    </section>
  </>;
}
