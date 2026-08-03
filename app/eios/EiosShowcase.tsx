"use client";

import Image from "next/image";
import { useState } from "react";
import "./eios.css";

const productViews = [
  { id: "overview", eyebrow: "Executive command view", title: "Governed intelligence at a glance", copy: "A concise decision surface for enterprise health, risk posture, accountable workspaces, and governed outcomes.", image: "/eios/eios-overview-marketing.png", alt: "Abstract EIOS executive command visual" },
  { id: "situation", eyebrow: "AI situation room", title: "Evidence before action", copy: "Guide complex identity and risk decisions through a clear sequence of evidence, policy, approval, verification, and auditability.", image: "/eios/eios-situation-room-marketing.png", alt: "Abstract EIOS decision intelligence visual" },
  { id: "assets", eyebrow: "Asset intelligence", title: "A clearer operational picture", copy: "Bring verified posture, correlation, lineage, and limitations into a structured asset intelligence experience.", image: "/eios/eios-asset-intelligence-marketing.png", alt: "Abstract EIOS asset intelligence visual" },
  { id: "reports", eyebrow: "Report center", title: "Decision ready evidence", copy: "Present outputs with source context and clear limitations so leaders can act with confidence.", image: "/eios/eios-report-center-marketing.png", alt: "Abstract EIOS report center visual" },
];

const outcomes = [
  ["01", "Observe", "Bring relevant enterprise context and evidence into view."],
  ["02", "Understand", "Frame risk, material conditions, and decision alternatives."],
  ["03", "Decide", "Apply policy, approvals, and accountable decision authority."],
  ["04", "Verify", "Confirm the outcome and preserve the evidence trail."],
];

const capabilities = [
  ["Enterprise command", "Executive health, decision priorities, risk signals, and outcome visibility in one leadership experience."],
  ["Enterprise digital twin", "A connected view of business, technology, security, operations, finance, regulation, and human dependencies."],
  ["Predictive intelligence", "Evidence grounded trend, risk, and opportunity intelligence that communicates confidence and uncertainty."],
  ["Scenario laboratory", "Controlled scenario and counterfactual exploration for material enterprise decisions and planning."],
  ["Decision intelligence", "Explainable options, tradeoffs, recommendations, approvals, decision history, and measurable outcomes."],
  ["Governed AI", "Specialized AI support that operates through defined policy, authority, and human accountability."],
  ["Identity and access", "Identity lifecycle, privileged access, access risk, verification, and governed enterprise identity insight."],
  ["Asset and technology intelligence", "Connected asset context, security posture, operational health, dependencies, and business impact."],
  ["Cyber risk, GRC, and resilience", "Risk intelligence, control context, compliance readiness, incident insight, and defensible governance."],
  ["CIO, CISO, CFO, and Board centers", "Role aware intelligence for technology, security, financial exposure, strategic priorities, and executive decisions."],
  ["Enterprise operations and PMO", "Portfolio, investment, delivery, dependencies, service intelligence, and KPI visibility for operating teams."],
  ["Reports, evidence, and forensics", "Decision ready reports, source context, traceability, audit records, and governed information handling."],
  ["Enterprise memory and learning", "Outcome aware organizational learning that preserves context and improves future decision quality."],
  ["Marketplace and industry solutions", "A governed extension approach for analytical models, integrations, dashboards, policies, and industry solution packs."],
];

export default function EiosShowcase() {
  const [selected, setSelected] = useState(productViews[0]);
  return <main className="eios-page" onCopy={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
    <header className="eios-nav">
      <a className="eios-brand" href="/"><Image src="/brand/obserra-logo.png" width={250} height={48} alt="Obserra Executive Protection and Intelligence LLC" /><span><b>EIOS</b></span></a>
      <nav aria-label="EIOS page navigation"><a href="#experience">Experience</a><a href="#capabilities">Capabilities</a><a href="#showcase">Product views</a><a href="#connect" className="eios-nav-cta">Engage with EIOS</a></nav>
    </header>

    <section className="eios-hero" id="experience">
      <div className="eios-orbit orbit-one" /><div className="eios-orbit orbit-two" />
      <div className="eios-hero-copy"><p className="eios-eyebrow">PROPERTY OF OBSERRA, ENTERPRISE INTELLIGENCE OPERATING SYSTEM</p><h1>Governed intelligence.<br /><em>Verified enterprise action.</em></h1><p className="eios-lede">EIOS is an enterprise ready operating system that unifies intelligence, risk, governance, and accountable action across the decisions that matter most.</p><div className="eios-actions"><a href="#capabilities" className="eios-button">Explore EIOS capabilities</a><a href="#connect" className="eios-text-link">Engage with Obserra</a></div><p className="eios-restriction">EIOS visual and product materials are proprietary to Obserra. Public views are controlled marketing representations. No customer data, credentials, or live production connections are displayed.</p></div>
      <div className="eios-hero-art"><ProductFrame view={selected} prominent /></div>
    </section>

    <section className="eios-proof"><p>DESIGNED FOR ACCOUNTABLE ENTERPRISE DECISIONS</p><div><span>Evidence grounded</span><span>Policy governed</span><span>Human authorized</span><span>Outcome verified</span></div></section>

    <section className="eios-outcomes" id="outcomes"><div className="section-intro"><p className="eios-eyebrow">THE EIOS DECISION PATH</p><h2>Less dashboard noise.<br />More decision clarity.</h2></div><div className="outcome-grid">{outcomes.map(([number, title, copy]) => <article key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="eios-capabilities" id="capabilities"><div className="section-intro"><p className="eios-eyebrow">FULL ENTERPRISE CAPABILITY SCOPE</p><h2>One operating system.<br />Every critical decision domain.</h2><p>EIOS is designed as a connected enterprise intelligence platform, not a collection of isolated dashboards. Capability engagement and configuration align to each organization's operating model and priorities.</p></div><div className="capability-grid">{capabilities.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><em>Explore capability</em></article>)}</div></section>

    <section className="eios-showcase" id="showcase"><div className="section-intro"><p className="eios-eyebrow">PRODUCT SHOWCASE</p><h2>Enterprise intelligence<br />that makes its case.</h2><p>Explore controlled EIOS demonstration views. Each communicates what leaders need to know without exposing customer environments or proprietary implementation details.</p></div><div className="showcase-layout"><div className="view-selector" role="tablist" aria-label="EIOS product views">{productViews.map((view) => <button key={view.id} role="tab" aria-selected={selected.id === view.id} className={selected.id === view.id ? "active" : ""} onClick={() => setSelected(view)}><small>{view.eyebrow}</small><strong>{view.title}</strong><span>View experience</span></button>)}</div><ProductFrame view={selected} /></div></section>

    <section className="eios-boundary"><div><p className="eios-eyebrow">ENTERPRISE READY. DISCIPLINED BY DESIGN.</p><h2>The product story without the proprietary blueprint.</h2></div><p>The public EIOS experience communicates capability, outcomes, and design principles. It does not expose platform code, architecture, customer data, live connectors, operational credentials, or internal workflows.</p></section>

    <section className="eios-connect" id="connect"><p className="eios-eyebrow">ENGAGE WITH EIOS</p><h2>Bring governed intelligence to your enterprise.</h2><p>EIOS is ready for organizations that want a more connected, accountable way to understand risk, make decisions, and carry action forward. Start with an executive Partner Session to align priorities, explore the full capability scope, and define the right adoption path.</p><div className="eios-engagements"><a href="mailto:info@obserrallc.com?subject=EIOS%20Partner%20Session" className="eios-button">Schedule a Partner Session</a><a href="mailto:info@obserrallc.com?subject=EIOS%20Executive%20Briefing" className="eios-outline-button">Request an executive briefing</a></div><small>Partner Sessions and executive briefings are commercial conversations for enterprise adoption. They do not limit the EIOS platform capability scope.</small></section>

    <footer className="eios-footer"><Image src="/brand/obserra-logo.png" width={176} height={34} alt="Obserra Executive Protection and Intelligence LLC" /><p>Copyright Obserra Executive Protection &amp; Intelligence LLC. EIOS and related visual and product materials are proprietary to Obserra. Unauthorized reproduction, distribution, or use is prohibited.</p></footer>
  </main>;
}

function ProductFrame({ view, prominent = false }: { view: typeof productViews[number]; prominent?: boolean }) {
  return <figure className={`product-frame ${prominent ? "prominent" : ""}`}><div className="frame-top"><span>OBSERRA EIOS</span><span>CONTROLLED PRODUCT VIEW</span></div><div className="product-image"><Image src={view.image} alt={view.alt} fill sizes={prominent ? "(max-width: 900px) 90vw, 54vw" : "(max-width: 900px) 90vw, 63vw"} priority={view.id === "overview"} /><div className="property-watermark">PROPERTY OF OBSERRA</div></div><figcaption><p>{view.eyebrow}</p><strong>{view.title}</strong><span>{view.copy}</span></figcaption></figure>;
}
