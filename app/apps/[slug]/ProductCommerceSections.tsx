import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Check, Clock3, Cloud, FileCheck2, Gauge, Layers3, LockKeyhole, PlugZap, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { MarketplaceApp } from "../appsData";

const categoryVisuals: Record<MarketplaceApp["category"], { image: string; eyebrow: string; outcome: string; icon: typeof ShieldCheck }> = {
  Cybersecurity: { image: "/eios/eios-asset-intelligence-marketing.png", eyebrow: "CYBER RISK AND RESILIENCE", outcome: "Prioritize the exposures that matter most and prove measurable risk reduction.", icon: ShieldCheck },
  "Executive Protection": { image: "/brand/visuals/obserra-eios-intelligence-hero.png", eyebrow: "PROTECTIVE INTELLIGENCE", outcome: "Convert fragmented threat signals into timely, defensible protective action.", icon: LockKeyhole },
  Identity: { image: "/eios/eios-overview-marketing.png", eyebrow: "IDENTITY GOVERNANCE", outcome: "Reduce access risk while accelerating certifications, approvals, and lifecycle control.", icon: Users },
  GRC: { image: "/eios/eios-report-center-marketing.png", eyebrow: "GOVERNANCE, RISK AND COMPLIANCE", outcome: "Turn control evidence and risk decisions into an audit-ready operating system.", icon: FileCheck2 },
  "AI Governance": { image: "/eios/eios-situation-room-marketing.png", eyebrow: "RESPONSIBLE AI OVERSIGHT", outcome: "Govern AI adoption with policy, approval, evidence, and executive accountability.", icon: Sparkles },
  Operations: { image: "/eios/eios-situation-room-marketing.png", eyebrow: "ENTERPRISE OPERATIONS", outcome: "Coordinate complex work across teams with shared priorities and accountable execution.", icon: BarChart3 },
  Intelligence: { image: "/eios/eios-overview-marketing.png", eyebrow: "EXECUTIVE INTELLIGENCE", outcome: "Unify enterprise context so leaders can decide faster and act with confidence.", icon: Gauge },
};

export function ProductCommerceHero({ entry, liveApplicationUrl }: { entry: MarketplaceApp; liveApplicationUrl?: string }) {
  const visual = categoryVisuals[entry.category];
  const Icon = visual.icon;
  const primaryHref = liveApplicationUrl || (entry.status === "Coming Soon" ? `/contact?interest=application-preview&app=${entry.slug}` : `/apps/${entry.slug}/subscribe`);
  const primaryLabel = liveApplicationUrl ? "Launch application" : entry.status === "Coming Soon" ? "Join preview list" : entry.status === "Pilot" ? "Request pilot access" : "Start buying process";

  return (
    <section className="commerce-hero">
      <div className="commerce-hero-copy">
        <div className="commerce-breadcrumb"><Link href="/apps">Marketplace</Link><span>/</span><span>{entry.category}</span></div>
        <p className="commerce-kicker"><Icon size={15} /> {visual.eyebrow}</p>
        <div className="commerce-status-row"><span className={`commerce-status ${entry.status.toLowerCase().replaceAll(" ", "-")}`}>{entry.status}</span><span>Enterprise software</span><span>Secure by design</span></div>
        <h1>{entry.name}</h1>
        <p className="commerce-value">{entry.value}</p>
        <p className="commerce-outcome">{visual.outcome}</p>
        <div className="commerce-actions">
          {liveApplicationUrl ? <a className="commerce-primary" href={primaryHref} target="_blank" rel="noopener noreferrer">{primaryLabel}<ArrowRight size={17} /></a> : <Link className="commerce-primary" href={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>}
          <Link className="commerce-secondary" href={`/contact?interest=application-demo&product=${encodeURIComponent(entry.name)}`}>Book executive demo</Link>
          <Link className="commerce-tertiary" href={`/contact?interest=enterprise-quote&product=${encodeURIComponent(entry.name)}`}>Request proposal</Link>
        </div>
        <div className="commerce-proof">
          <span><BadgeCheck size={15} /> Enterprise deployment support</span>
          <span><ShieldCheck size={15} /> NIST aligned security architecture</span>
          <span><Cloud size={15} /> {entry.deployment.join(" · ")}</span>
        </div>
      </div>
      <div className="commerce-visual-shell">
        <div className="commerce-visual"><Image src={visual.image} alt={`${entry.name} product experience`} fill sizes="(max-width: 900px) 100vw, 48vw" priority /></div>
        <div className="commerce-visual-footer"><div><small>BUSINESS OUTCOME</small><strong>{visual.outcome}</strong></div><span><Layers3 size={17} /> Obserra Platform</span></div>
      </div>
    </section>
  );
}

export function ProductCommerceBody({ entry }: { entry: MarketplaceApp }) {
  return (
    <>
      <section className="commerce-metrics" aria-label="Product buying confidence">
        <article><Gauge size={21} /><div><strong>Decision ready</strong><p>Executive views supported by operational evidence and technical detail.</p></div></article>
        <article><PlugZap size={21} /><div><strong>Integration ready</strong><p>{entry.integrations.length} supported integration pathways documented for solution design.</p></div></article>
        <article><Clock3 size={21} /><div><strong>Lifecycle supported</strong><p>Implementation, adoption, support, updates, and renewal planning included.</p></div></article>
        <article><ShieldCheck size={21} /><div><strong>Governed access</strong><p>Identity, licensing, entitlement, tenant, and audit controls by default.</p></div></article>
      </section>

      <section className="commerce-section commerce-outcomes-section">
        <div className="commerce-heading"><p className="commerce-kicker">WHY ENTERPRISE BUYERS CHOOSE IT</p><h2>Built to create measurable operational and executive value.</h2><p>Each capability is positioned around a business outcome, not a feature inventory.</p></div>
        <div className="commerce-outcome-grid">
          {entry.features.map((feature, index) => <article key={feature}><span>0{index + 1}</span><h3>{feature}</h3><p>Operationalize {feature.toLowerCase()} through governed workflows, clear ownership, evidence, and executive visibility.</p></article>)}
        </div>
      </section>

      <section className="commerce-section commerce-buying-grid">
        <div className="commerce-buy-card">
          <p className="commerce-kicker">DEPLOYMENT</p><h2>Choose the operating model that fits your environment.</h2>
          <div className="commerce-chip-grid">{entry.deployment.map((model) => <span key={model}><Cloud size={15} />{model}</span>)}</div>
          <p>Architecture, identity, networking, data residency, support, and integration requirements are finalized during solution design.</p>
        </div>
        <div className="commerce-buy-card">
          <p className="commerce-kicker">COMMERCIAL MODEL</p><h2>{entry.pricing}</h2>
          <ul><li><Check size={15} /> Subscription or enterprise agreement</li><li><Check size={15} /> Implementation and onboarding options</li><li><Check size={15} /> Support and lifecycle coverage</li><li><Check size={15} /> Volume and portfolio licensing available</li></ul>
          <Link href={`/contact?interest=enterprise-quote&product=${encodeURIComponent(entry.name)}`} className="commerce-inline-link">Build an enterprise proposal <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="commerce-section commerce-trust">
        <div className="commerce-heading"><p className="commerce-kicker">SECURITY AND TRUST</p><h2>Enterprise assurance is part of the product, not an afterthought.</h2></div>
        <div className="commerce-trust-grid">
          <article><LockKeyhole size={22} /><h3>Identity and access</h3><p>Enterprise SSO, least privilege, tenant boundaries, entitlement checks, and governed administration.</p></article>
          <article><FileCheck2 size={22} /><h3>Audit and evidence</h3><p>Traceable activity, decision records, control evidence, exportable reporting, and lifecycle history.</p></article>
          <article><ShieldCheck size={22} /><h3>Security alignment</h3><p>NIST CSF 2.0, NIST SP 800-207, NIST SP 800-63, OWASP ASVS, and PCI scoped controls where applicable.</p></article>
          <article><Layers3 size={22} /><h3>Platform integration</h3><p>Shared identity, licensing, connectors, billing, search, storage, audit, and AI services across Obserra products.</p></article>
        </div>
      </section>

      <section className="commerce-section commerce-integrations">
        <div className="commerce-heading"><p className="commerce-kicker">INTEGRATION ECOSYSTEM</p><h2>Connect the systems your organization already depends on.</h2></div>
        <div className="commerce-logo-cloud">{entry.integrations.map((integration) => <span key={integration}><PlugZap size={15} />{integration}</span>)}</div>
      </section>

      <section className="commerce-section commerce-faq">
        <div className="commerce-heading"><p className="commerce-kicker">BUYER QUESTIONS</p><h2>What procurement, security, and executive teams need to know.</h2></div>
        <div>{entry.faq.map((item) => <article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
      </section>

      <section className="commerce-final-cta">
        <div><p className="commerce-kicker">READY TO EVALUATE {entry.name.toUpperCase()}?</p><h2>See the platform in the context of your operating environment.</h2><p>We will tailor the demonstration, deployment model, security review, and commercial proposal to your priorities.</p></div>
        <div className="commerce-actions"><Link className="commerce-primary" href={`/contact?interest=application-demo&product=${encodeURIComponent(entry.name)}`}>Schedule tailored demo <ArrowRight size={17} /></Link><Link className="commerce-secondary" href={`/contact?interest=enterprise-quote&product=${encodeURIComponent(entry.name)}`}>Request enterprise proposal</Link></div>
      </section>
    </>
  );
}
