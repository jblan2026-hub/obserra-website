"use client";

import Image from "next/image";
import { useState } from "react";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import ExecutiveInfoModal from "../components/ui/ExecutiveInfoModal";
import "./eios.css";
import "./eios-compact.css";

const productViews = [
  { id: "overview", eyebrow: "Executive command view", title: "See the full operating picture in one decision surface.", copy: "A governed command layer for enterprise posture, material risk, accountable execution, and verified outcomes.", image: "/eios/eios-overview-marketing.png", alt: "EIOS executive command visual" },
  { id: "situation", eyebrow: "AI situation room", title: "Move from signal to authorized action", copy: "Coordinate complex identity, cyber, and operational decisions through evidence, policy controls, approvals, and audit-ready execution.", image: "/eios/eios-situation-room-marketing.png", alt: "EIOS decision intelligence visual" },
  { id: "assets", eyebrow: "Asset intelligence", title: "Understand business impact before acting", copy: "Connect posture, dependencies, lineage, and business context so leadership can prioritize what matters first.", image: "/eios/eios-asset-intelligence-marketing.png", alt: "EIOS asset intelligence visual" },
  { id: "reports", eyebrow: "Evidence and outcomes", title: "Defend the decision with evidence", copy: "Generate executive and audit-ready records that show what happened, why it was approved, and what outcome was verified.", image: "/eios/eios-report-center-marketing.png", alt: "EIOS evidence and report center visual" },
] as const;

const capabilities = [
  {
    title: "Executive Command & Decision Intelligence",
    summary: "One leadership view for material risk, priorities, decisions, approvals, and measurable outcomes.",
    description: "Bring executive posture, risk signals, options, ownership, approvals, and outcome verification into one governed decision process instead of distributing them across disconnected tools.",
    details: ["Executive command views", "Explainable options and tradeoffs", "Decision history and measurable outcomes"],
  },
  {
    title: "Enterprise Digital Twin",
    summary: "Connect business, technology, security, operations, finance, regulation, and human dependencies.",
    description: "Build a governed enterprise context that links assets, identities, business services, operational dependencies, risk, controls, and decision authority so leaders can understand impact before acting.",
    details: ["Connected enterprise context", "Dependency and business-impact mapping", "Scenario and counterfactual analysis"],
  },
  {
    title: "Cyber, Identity, GRC & Resilience",
    summary: "Unify cyber risk, identity, controls, resilience, compliance context, and incident readiness.",
    description: "Give security and governance leaders one accountable view across identity lifecycle, privileged access, cyber posture, controls, compliance readiness, incident context, and resilience priorities.",
    details: ["Identity and privileged-access insight", "Cyber risk and control context", "Resilience and incident decision support"],
  },
  {
    title: "Operations, PMO & Value Intelligence",
    summary: "Expose dependencies, bottlenecks, duplicated effort, delivery risk, and measurable improvement opportunities.",
    description: "Connect operating priorities, portfolio delivery, investment, service health, dependencies, and ownership so executives can see where effort, money, and risk are misaligned.",
    details: ["Portfolio and dependency intelligence", "Operating bottleneck visibility", "Measured versus modeled value context"],
  },
  {
    title: "Evidence, Reports & Enterprise Memory",
    summary: "Preserve the decision trail, source context, verification evidence, and organizational learning.",
    description: "Maintain decision-ready reports, source lineage, audit records, evidence integrity, and outcome-aware organizational memory so the enterprise can defend what happened and improve future decisions.",
    details: ["Audit-ready evidence", "Decision and source traceability", "Outcome-aware enterprise memory"],
  },
  {
    title: "Governed AI & Enterprise Extensions",
    summary: "Use approved AI, models, agents, integrations, and industry solutions inside governed enterprise boundaries.",
    description: "Extend EIOS with approved AI support, model and agent controls, integrations, analytical packs, dashboards, and industry-specific solutions without bypassing authorization, evidence, or accountability.",
    details: ["Governed model and agent controls", "Enterprise integration patterns", "Industry and capability extensions"],
  },
] as const;

const outcomes = [
  ["Connect", "Bring relevant systems, relationships, and evidence into one governed context."],
  ["Decide", "Frame material risk, business impact, options, and accountable authority."],
  ["Execute", "Carry authorized actions through controlled workflows across existing systems."],
  ["Prove", "Verify the outcome and preserve the evidence leaders and auditors need."],
] as const;

export default function EiosShowcase() {
  const [selected, setSelected] = useState<(typeof productViews)[number]>(productViews[0]);

  return (
    <main className="eios-page eios-executive-page" onCopy={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
      <header className="eios-nav">
        <a className="eios-brand" href="/">
          <Image src="/brand/obserra-logo.png" width={250} height={48} alt={LEGAL_ENTITY_NAME} />
          <span><b>EIOS</b></span>
        </a>
        <nav aria-label="EIOS page navigation">
          <a href="/">Home</a><a href="/services">Services</a><a href="/apps">Applications</a><a href="/academy">Academy</a><a href="/about">About</a><a href="#connect" className="eios-nav-cta">Engage with EIOS</a>
        </nav>
      </header>

      <section className="eios-hero" id="experience">
        <div className="eios-hero-copy">
          <p className="eios-eyebrow">{LEGAL_ENTITY_NAME} · ENTERPRISE INTELLIGENCE OPERATING SYSTEM</p>
          <h1>Connect risk. Govern action. <em>Prove outcomes.</em></h1>
          <p className="eios-lede">EIOS gives leadership one governed operating picture across enterprise risk, cybersecurity, intelligence, operations, and accountable execution.</p>
          <div className="eios-actions"><a href="#capabilities" className="eios-button">Explore EIOS capabilities</a><a href="#connect" className="eios-text-link">Request enterprise briefing</a></div>
          <p className="eios-restriction">Public EIOS views are controlled product representations and do not expose customer data, credentials, production architecture, or protected implementation details.</p>
        </div>
        <div className="eios-hero-art"><ProductFrame view={selected} prominent /></div>
      </section>

      <section className="eios-proof" aria-label="EIOS decision path">
        <p>THE EIOS DECISION PATH</p>
        <div>{outcomes.map(([title, copy]) => <span key={title}><strong>{title}</strong><small>{copy}</small></span>)}</div>
      </section>

      <section className="eios-capabilities eios-capabilities--compact" id="capabilities">
        <div className="section-intro"><p className="eios-eyebrow">ENTERPRISE CAPABILITY SCOPE</p><h2>Six capability domains. Details only when you need them.</h2><p>Open a card for the capability detail instead of scrolling through eighteen separate technical tiles.</p></div>
        <div className="eios-executive-capability-grid">
          {capabilities.map((capability, index) => (
            <article className="eios-executive-capability-card" key={capability.title}>
              <ExecutiveInfoModal
                number={String(index + 1).padStart(2, "0")}
                title={capability.title}
                summary={capability.summary}
                description={capability.description}
                details={[...capability.details]}
                href="#showcase"
                linkLabel="Review related product views"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="eios-showcase eios-showcase--compact" id="showcase">
        <div className="section-intro"><p className="eios-eyebrow">CONTROLLED PRODUCT VIEWS</p><h2>See how EIOS presents the decision.</h2><p>Select a view to review the executive command, situation, asset, and evidence experiences without exposing protected implementation details.</p></div>
        <div className="showcase-layout"><div className="view-selector" role="tablist" aria-label="EIOS product views">{productViews.map((view) => <button key={view.id} role="tab" aria-selected={selected.id === view.id} className={selected.id === view.id ? "active" : ""} onClick={() => setSelected(view)}><small>{view.eyebrow}</small><strong>{view.title}</strong><span>Open view</span></button>)}</div><ProductFrame view={selected} /></div>
      </section>

      <section className="eios-connect" id="connect"><p className="eios-eyebrow">ENGAGE WITH EIOS</p><h2>Bring fragmented enterprise context into one accountable decision process.</h2><p>Start with an executive briefing to align priorities, integration scope, decision authority, deployment boundaries, and measurable business outcomes.</p><div className="eios-engagements"><a href="mailto:info@obserrallc.com?subject=EIOS%20Executive%20Briefing" className="eios-button">Request executive briefing</a></div></section>

      <footer className="eios-footer"><Image src="/brand/obserra-logo.png" width={176} height={34} alt={LEGAL_ENTITY_NAME} /><p>Copyright {LEGAL_ENTITY_NAME}. EIOS and related visual and product materials are proprietary to {LEGAL_ENTITY_NAME}.</p></footer>
    </main>
  );
}

function ProductFrame({ view, prominent = false }: { view: (typeof productViews)[number]; prominent?: boolean }) {
  return <figure className={`product-frame ${prominent ? "prominent" : ""}`}><div className="frame-top"><span>OBSERRA EIOS</span><span>CONTROLLED PRODUCT VIEW</span></div><div className="product-image"><Image src={view.image} alt={view.alt} fill sizes={prominent ? "(max-width: 900px) 90vw, 54vw" : "(max-width: 900px) 90vw, 63vw"} priority={view.id === "overview"} /><div className="property-watermark">PROPERTY OF {LEGAL_ENTITY_NAME}</div></div><figcaption><p>{view.eyebrow}</p><strong>{view.title}</strong><span>{view.copy}</span></figcaption></figure>;
}
