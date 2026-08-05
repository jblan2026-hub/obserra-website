"use client";

import Image from "next/image";
import { useState } from "react";
import "./eios.css";

const productViews = [
  { id: "overview", eyebrow: "Executive command view", title: "See the full operating picture in one decision surface.", copy: "A governed command layer for enterprise posture, material risk, accountable execution, and verified outcomes.", image: "/eios/eios-overview-marketing.png", alt: "EIOS executive command visual" },
  { id: "situation", eyebrow: "AI situation room", title: "Move from signal to authorized action", copy: "Coordinate complex identity, cyber, and operational decisions through evidence, policy controls, approvals, and audit-ready execution.", image: "/eios/eios-situation-room-marketing.png", alt: "EIOS decision intelligence visual" },
  { id: "assets", eyebrow: "Asset intelligence", title: "Understand business impact before acting", copy: "Connect posture, dependencies, lineage, and business context so leadership can prioritize what matters first.", image: "/eios/eios-asset-intelligence-marketing.png", alt: "EIOS asset intelligence visual" },
  { id: "reports", eyebrow: "Evidence and outcomes", title: "Defend the decision with evidence", copy: "Generate executive and audit-ready records that show what happened, why it was approved, and what outcome was verified.", image: "/eios/eios-report-center-marketing.png", alt: "EIOS evidence and report center visual" },
];

const outcomes = [
  ["01", "Connect", "Bring relevant enterprise systems, relationships, and evidence into one governed context."],
  ["02", "Decide", "Frame material risk, business impact, options, and accountable decision authority."],
  ["03", "Execute", "Carry authorized actions through policy-controlled workflows across existing enterprise systems."],
  ["04", "Prove", "Independently verify the outcome and preserve the evidence trail leaders and auditors need."],
];

const capabilities = [
  ["Enterprise command", "Executive health, decision priorities, risk signals, and outcome visibility in one leadership experience."],
  ["Enterprise digital twin", "A connected view of business, technology, security, operations, finance, regulation, and human dependencies."],
  ["Predictive intelligence", "Evidence grounded trend, risk, and opportunity intelligence that communicates confidence and uncertainty."],
  ["Scenario laboratory", "Controlled scenario and counterfactual exploration for material enterprise decisions and planning."],
  ["Decision intelligence", "Explainable options, tradeoffs, recommendations, approvals, decision history, and measurable outcomes."],
  ["AI-native and continuously learning", "Governed AI support, approved model and agent controls, and outcome-aware learning that preserves evidence rather than rewriting history."],
  ["Secure by design and by default", "Zero Trust boundaries, tenant-aware authorization, least privilege, approval controls, secure configuration, auditability, and evidence integrity designed into the platform."],
  ["Enterprise scale and resilience", "Modular services, versioned contracts, event-ready integration, asynchronous processing, observability, and deployment patterns designed to scale without architectural rewrites."],
  ["Business-unit command centers", "Role-aware decision experiences for executive leadership, CIO, CISO, HR, GRC, Finance, PMO, operations, and authorized business teams—using the same governed enterprise context."],
  ["Efficiency and value intelligence", "Surface duplicated effort, unresolved ownership, avoidable risk, bottlenecks, and measurable improvement opportunities while distinguishing measured, modeled, and customer-entered value."],
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
  const [selectedCapabilityIndex, setSelectedCapabilityIndex] = useState<number | null>(null);
  const selectedCapability = selectedCapabilityIndex === null ? null : capabilities[selectedCapabilityIndex];

  const exploreCapability = (index: number) => {
    setSelectedCapabilityIndex(index);
    setSelected(productViews[index % productViews.length]);
  };

  return (
    <main
      className="eios-page"
      onCopy={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header className="eios-nav">
        <a className="eios-brand" href="/">
          <Image
            src="/brand/obserra-logo.png"
            width={250}
            height={48}
            alt="Obserra Executive Protection and Intelligence LLC"
          />
          <span>
            <b>EIOS</b>
          </span>
        </a>
        <nav aria-label="EIOS page navigation">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/apps">Applications</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="#connect" className="eios-nav-cta">Engage with EIOS</a>
        </nav>
      </header>

      <section className="eios-hero" id="experience">
        <div className="eios-orbit orbit-one" />
        <div className="eios-orbit orbit-two" />
        <div className="eios-hero-copy">
          <p className="eios-eyebrow">PROPERTY OF OBSERRA · ENTERPRISE INTELLIGENCE OPERATING SYSTEM</p>
          <h1>
            From fragmented context
            <br />
            to <em>commercially accountable execution.</em>
          </h1>
          <p className="eios-lede">
            EIOS is the enterprise intelligence and execution system from OBSERRA EXECUTIVE
            PROTECTION &amp; INTELLIGENCE LLC. It helps leadership teams connect systems,
            quantify risk and business impact, authorize action, and verify outcome integrity
            without replacing core enterprise platforms.
          </p>
          <div className="eios-actions">
            <a href="#showcase" className="eios-button">Review EIOS product views</a>
            <a href="#connect" className="eios-text-link">Request enterprise briefing</a>
          </div>
          <p className="eios-restriction">
            EIOS visuals and product artifacts are proprietary. Public views are controlled
            representations and do not expose customer data, credentials, or live production
            architecture.
          </p>
        </div>
        <div className="eios-hero-art">
          <ProductFrame view={selected} prominent />
        </div>
      </section>

      <section className="eios-proof">
        <p>THE EIOS ADVANTAGE</p>
        <div>
          <span>Connect fragmented context</span>
          <span>Govern authorized action</span>
          <span>Verify outcomes independently</span>
          <span>Measure risk and business value</span>
        </div>
      </section>

      <section className="eios-outcomes" id="outcomes">
        <div className="section-intro">
          <p className="eios-eyebrow">THE EIOS DECISION PATH</p>
          <h2>
            Less dashboard noise.
            <br />
            More decisions with measurable commercial impact.
          </h2>
        </div>
        <div className="outcome-grid">
          {outcomes.map(([number, title, copy]) => (
            <article key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="eios-capabilities" id="capabilities">
        <div className="section-intro">
          <p className="eios-eyebrow">FULL ENTERPRISE CAPABILITY SCOPE</p>
          <h2>
            One operating system.
            <br />
            Every critical decision domain.
          </h2>
          <p>
            EIOS is designed as an AI-native, secure-by-default enterprise intelligence
            platform, not a collection of isolated dashboards. It brings governed learning,
            resilient scale, and accountable execution to each organization&apos;s operating model
            and priorities.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map(([title, copy], index) => (
            <button
              key={title}
              type="button"
              className={selectedCapabilityIndex === index ? "capability-card active" : "capability-card"}
              onClick={() => exploreCapability(index)}
              aria-expanded={selectedCapabilityIndex === index}
              aria-controls="capability-detail"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <em>
                Explore capability <b>→</b>
              </em>
            </button>
          ))}
        </div>

        {selectedCapability && (
          <div className="capability-detail" id="capability-detail" aria-live="polite">
            <div>
              <p className="eios-eyebrow">
                EIOS CAPABILITY {String(selectedCapabilityIndex! + 1).padStart(2, "0")}
              </p>
              <h3>{selectedCapability[0]}</h3>
              <p>{selectedCapability[1]}</p>
            </div>
            <div className="capability-detail-actions">
              <button
                type="button"
                className="eios-button"
                onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Open related product view
              </button>
              <a
                className="eios-outline-button"
                href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`EIOS ${selectedCapability[0]} inquiry`)}`}
              >
                Discuss this capability
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="eios-showcase" id="showcase">
        <div className="section-intro">
          <p className="eios-eyebrow">PRODUCT SHOWCASE</p>
          <h2>
            Enterprise intelligence
            <br />
            that leadership can act on.
          </h2>
          <p>
            Review controlled EIOS product views designed to communicate decision flow,
            accountability, and business impact without exposing customer environments or
            protected implementation details.
          </p>
        </div>
        <div className="showcase-layout">
          <div className="view-selector" role="tablist" aria-label="EIOS product views">
            {productViews.map((view) => (
              <button
                key={view.id}
                role="tab"
                aria-selected={selected.id === view.id}
                className={selected.id === view.id ? "active" : ""}
                onClick={() => setSelected(view)}
              >
                <small>{view.eyebrow}</small>
                <strong>{view.title}</strong>
                <span>Open product view</span>
              </button>
            ))}
          </div>
          <ProductFrame view={selected} />
        </div>
      </section>

      <section className="eios-boundary">
        <div>
          <p className="eios-eyebrow">ENTERPRISE READY. DISCIPLINED BY DESIGN.</p>
          <h2>The product story without the proprietary blueprint.</h2>
        </div>
        <p>
          The public EIOS experience communicates capability, outcomes, and design principles.
          It does not expose platform code, architecture, customer data, live connectors,
          operational credentials, or internal workflows.
        </p>
      </section>

      <section className="eios-connect" id="connect">
        <p className="eios-eyebrow">ENGAGE WITH EIOS</p>
        <h2>Turn enterprise complexity into accountable commercial momentum.</h2>
        <p>
          Start with an enterprise EIOS briefing to align decision priorities, control
          boundaries, integration scope, deployment pathway, and measurable business outcomes
          with your operating model.
        </p>
        <div className="eios-engagements">
          <a href="mailto:info@obserrallc.com?subject=EIOS%20Enterprise%20Scoping%20Session" className="eios-button">
            Book enterprise scoping session
          </a>
          <a href="mailto:info@obserrallc.com?subject=EIOS%20Executive%20Briefing" className="eios-outline-button">
            Request executive briefing
          </a>
        </div>
        <small>
          Briefings and scoping sessions are commercial planning engagements for enterprise
          adoption and do not expose protected implementation assets.
        </small>
      </section>

      <footer className="eios-footer">
        <Image
          src="/brand/obserra-logo.png"
          width={176}
          height={34}
          alt="Obserra Executive Protection and Intelligence LLC"
        />
        <p>
          Copyright Obserra Executive Protection &amp; Intelligence LLC. EIOS and related visual
          and product materials are proprietary to Obserra. Unauthorized reproduction,
          distribution, or use is prohibited.
        </p>
      </footer>
    </main>
  );
}

function ProductFrame({ view, prominent = false }: { view: typeof productViews[number]; prominent?: boolean }) {
  return (
    <figure className={`product-frame ${prominent ? "prominent" : ""}`}>
      <div className="frame-top">
        <span>OBSERRA EIOS</span>
        <span>CONTROLLED PRODUCT VIEW</span>
      </div>
      <div className="product-image">
        <Image
          src={view.image}
          alt={view.alt}
          fill
          sizes={prominent ? "(max-width: 900px) 90vw, 54vw" : "(max-width: 900px) 90vw, 63vw"}
          priority={view.id === "overview"}
        />
        <div className="property-watermark">PROPERTY OF OBSERRA</div>
      </div>
      <figcaption>
        <p>{view.eyebrow}</p>
        <strong>{view.title}</strong>
        <span>{view.copy}</span>
      </figcaption>
    </figure>
  );
}
