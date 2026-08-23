import type { Metadata } from "next";
import Link from "next/link";
import products from "./marketplace-products.json";
import "./marketplace.css";

type Product = {
  product_id: string;
  product_name: string;
  family: string;
  version: string;
  mission: string;
  deliverable: string;
  billing_model: string;
  monthly_usd: string;
  annual_usd: string;
  one_time_usd: string;
};

const catalog = products as Product[];
const families = [...new Set(catalog.map((product) => product.family))].sort();

export const metadata: Metadata = {
  title: "Obserra EPI AI Skills Marketplace | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  description: "Browse governed Obserra EPI AI skills, agent teams, workflows, assurance, connectors, certifications, and industry editions.",
  alternates: { canonical: "/ai-marketplace" },
};

function price(product: Product) {
  if (product.billing_model === "one-time") return `$${product.one_time_usd} one-time`;
  return `$${product.monthly_usd}/month · $${product.annual_usd}/year`;
}

export default function AiMarketplacePage() {
  return (
    <main className="ai-marketplace">
      <header className="ai-marketplace__nav">
        <Link href="/" aria-label="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC home">OBSERRA EPI</Link>
        <nav aria-label="AI Skills Marketplace navigation">
          <Link href="/">Home</Link>
          <Link href="/apps">Applications</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link>
        </nav>
      </header>
      <section className="ai-marketplace__hero">
        <p>OBSERRA EPI AI SKILLS MARKETPLACE</p>
        <h1>Governed AI capabilities, packaged for real operational work.</h1>
        <div>
          <span>{catalog.length} versioned products</span>
          <span>{families.length} product families</span>
          <span>Integrity and entitlement controlled</span>
        </div>
        <p className="ai-marketplace__notice">Prices and product scope are published below. Secure purchase and protected delivery activate only when the live payment, durable ledger, identity, and entitlement checks are operational.</p>
      </section>
      <section className="ai-marketplace__families" aria-label="Marketplace product families">
        {families.map((family) => <a key={family} href={`#${family}`}>{family.replace(/-/g, " ")}</a>)}
      </section>
      <section className="ai-marketplace__catalog" aria-label="AI Skills product catalog">
        {families.map((family) => (
          <section id={family} key={family}>
            <header><p>{family.replace(/-/g, " ")}</p><h2>{catalog.filter((product) => product.family === family).length} governed products</h2></header>
            <div className="ai-marketplace__grid">
              {catalog.filter((product) => product.family === family).map((product) => (
                <article key={product.product_id}>
                  <span>v{product.version}</span>
                  <h3>{product.product_name.replace("OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC — ", "")}</h3>
                  <p>{product.mission}</p>
                  <small><b>Deliverable:</b> {product.deliverable}</small>
                  <footer><strong>{price(product)}</strong><Link href={`/contact?interest=ai-marketplace&product=${encodeURIComponent(product.product_id)}`}>Request purchase access →</Link></footer>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
