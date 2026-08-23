import type { Metadata } from "next";
import Link from "next/link";
import products from "./marketplace-products.json";
import MarketplaceExperience, { type MarketplaceProduct } from "./MarketplaceExperience";
import "./marketplace.css";

const catalog = products as MarketplaceProduct[];
const families = [...new Set(catalog.map((product) => product.family))].sort();

export const metadata: Metadata = {
  title: "Obserra EPI AI Skills Marketplace | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  description: "Browse governed Obserra EPI AI skills, agent teams, workflows, assurance, connectors, certifications, and industry editions.",
  alternates: { canonical: "/ai-marketplace" },
};

export default function AiMarketplacePage() {
  return (
    <main className="ai-marketplace">
      <header className="ai-marketplace__nav">
        <Link href="/" aria-label="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC home">OBSERRA EPI</Link>
        <nav aria-label="AI Skills Marketplace navigation">
          <Link href="/">Home</Link>
          <Link href="/ai-marketplace/skill-libraries">Skill libraries</Link>
          <Link href="/apps">Applications</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/contact?interest=ai-marketplace">Enterprise licensing</Link>
        </nav>
      </header>
      <section className="ai-marketplace__hero">
        <p>OBSERRA EPI AI CAPABILITY MARKETPLACE</p>
        <h1>AI capability, made operational.</h1>
        <p className="ai-marketplace__hero-lede">A spatial marketplace for governed agent teams, workflows, connectors, assurance, industry editions, and advanced skill libraries.</p>
        <div>
          <span>{catalog.length} versioned products</span>
          <span>{families.length} product families</span>
          <span>Integrity and entitlement controlled</span>
        </div>
        <p className="ai-marketplace__notice">Every offer has a version, commercial model, and protected fulfillment boundary. Purchase and delivery are intentionally fail-closed until the live payment, identity, ledger, and entitlement checks prove ready.</p>
        <Link href="/ai-marketplace/skill-libraries" style={{ display: "inline-flex", marginTop: 22, padding: "13px 17px", borderRadius: 10, background: "#f4ba55", color: "#071d2f", fontWeight: 900, textDecoration: "none" }}>Browse Beginner, Intermediate, Expert &amp; Advanced skill packages →</Link>
      </section>
      <MarketplaceExperience catalog={catalog} families={families} />
    </main>
  );
}
