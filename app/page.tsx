import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "./components/ui/ObserraUI";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "./components/enterprise/EnterpriseChrome";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import "./saas-home.css";

export const metadata: Metadata = {
  title: "Enterprise Intelligence, Cybersecurity and AI Governance",
  description:
    "Obserra helps executive teams govern cyber risk, AI, intelligence, resilience, and secure technology through executive advisory, EIOS software, applications, and professional training.",
  alternates: { canonical: "/" },
  keywords: [
    "enterprise intelligence",
    "cybersecurity consulting",
    "AI governance consulting",
    "executive cyber risk",
    "protective intelligence",
    "enterprise risk intelligence",
    "Obserra EIOS",
  ],
};

const capabilities = [
  ["01", "Executive Advisory", "Board-level cyber, risk, governance, resilience, and transformation leadership for material enterprise decisions.", "/services", "Explore advisory"],
  ["02", "Protection and Intelligence", "Protective intelligence, executive exposure, travel risk, and discreet support for leaders and high-consequence operations.", "/protection-intelligence", "Explore protection"],
  ["03", "EIOS and Secure Technology", "Connect enterprise risk, evidence, controls, intelligence, and decisions in one governed operating environment.", "/eios", "Explore EIOS"],
  ["04", "Obserra Academy", "Professional cybersecurity, intelligence, protection, and AI governance learning with controlled enrollment and completion.", "/academy", "Explore Academy"],
];

export default function HomePage() {
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.obserrallc.com/#home",
        url: "https://www.obserrallc.com",
        name: `${LEGAL_ENTITY_NAME} | Enterprise Intelligence, Cybersecurity and AI Governance`,
        description:
          "Executive intelligence, cybersecurity, AI governance, protective intelligence, secure technology, applications, and professional training.",
        about: { "@id": "https://www.obserrallc.com/#organization" },
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
      },
      {
        "@type": "Service",
        name: "Obserra Enterprise Intelligence and Cybersecurity Services",
        provider: { "@id": "https://www.obserrallc.com/#organization" },
        areaServed: "US",
        serviceType: [
          "Executive cybersecurity advisory",
          "AI governance",
          "Protective intelligence",
          "Enterprise risk intelligence",
          "Cybersecurity and resilience consulting",
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Enterprise intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero">
          <div className="saas-hero__copy">
            <h1>See the enterprise clearly. Act with confidence.</h1>
            <p>
              Obserra brings executive judgment, cyber risk, AI governance, intelligence, secure technology,
              and execution into one operating model for organizations where the cost of a bad decision is material.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/eios">Explore Obserra EIOS</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Talk to Obserra</ButtonLink>
            </div>
            <div className="saas-hero__proof" aria-label="Obserra operating assurances">
              <span>Executive-led</span>
              <span>Secure by design</span>
              <span>Evidence-driven</span>
              <span>Built for regulated environments</span>
            </div>
          </div>

          <div className="saas-hero__command-shell" aria-label="Obserra enterprise intelligence model">
            <div className="saas-hero__command">
              <div className="saas-hero__command-head">
                <span>OBSERRA EIOS · EXECUTIVE INTELLIGENCE</span>
                <strong>Turn fragmented enterprise signals into governed action.</strong>
                <p>
                  Connect risk, evidence, controls, intelligence, ownership, decisions, and implementation
                  without replacing the systems your organization already depends on.
                </p>
              </div>
              <div className="saas-hero__command-grid">
                <div><b>Enterprise context</b><span>Connect business units, assets, people, vendors, controls, obligations, and material risks.</span></div>
                <div><b>Decision intelligence</b><span>Rank actions by impact, confidence, cost, risk reduction, dependency, and time to value.</span></div>
                <div><b>Governed execution</b><span>Move from recommendation to accountable roadmap, approval, implementation, and evidence.</span></div>
                <div><b>Continuous optimization</b><span>Reassess posture as enterprise conditions, threats, controls, and priorities change.</span></div>
              </div>
              <div className="saas-hero__command-flow" aria-label="Illustrative preview of Obserra EIOS operating flow">
                <span>Signals</span><span>→</span><span>Context</span><span>→</span><span>Decision</span><span>→</span><span>Action</span><span>→</span><span>Verified outcome</span>
              </div>
              <p className="saas-hero__disclosure"><strong>Illustrative preview</strong> · Representative operating model only; this is not a live customer environment.</p>
            </div>
          </div>
        </section>

        <section className="saas-direct-sales" aria-labelledby="direct-sales-heading">
          <div className="saas-direct-sales__intro">
            <span>BUY AND ENGAGE DIRECTLY</span>
            <h2 id="direct-sales-heading">Start with the capability you need now.</h2>
            <p>
              Purchase Obserra applications and approved Academy courses directly, or engage executive services for scoped enterprise work.
              Each destination keeps its own commercial, access, approval, and release controls.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/apps">Shop Applications</ButtonLink>
              <ButtonLink href="/academy" variant="secondary">Browse Academy</ButtonLink>
            </div>
          </div>
          <div className="saas-direct-sales__grid">
            <Link href="/apps" className="mission-direct-sales__card">
              <span>OBSERRA APPLICATIONS</span>
              <h3>Purpose-built software for high-consequence work.</h3>
              <p>Review product capabilities, release status, and commercial options across the Obserra application portfolio.</p>
              <strong>Shop Applications <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/academy" className="mission-direct-sales__card">
              <span>OBSERRA ACADEMY</span>
              <h3>Practical learning for cyber, intelligence, protection, and AI leaders.</h3>
              <p>Browse reviewed courses and enterprise learning options. Purchases open only when a course is explicitly activated for sale.</p>
              <strong>Browse Academy <span aria-hidden="true">→</span></strong>
            </Link>
          </div>
        </section>

        <nav className="saas-product-nav" aria-label="Primary Obserra destinations">
          <Link href="/eios"><strong>EIOS</strong><span>Enterprise intelligence, governance, risk, and decision execution.</span></Link>
          <Link href="/services"><strong>Services</strong><span>Executive advisory, cybersecurity, AI governance, protection, and resilience.</span></Link>
          <Link href="/apps"><strong>Applications</strong><span>Secure software for executive and operational use.</span></Link>
          <Link href="/academy"><strong>Academy</strong><span>Professional and enterprise learning with controlled access.</span></Link>
          <Link href="/trust"><strong>Trust</strong><span>Security, privacy, governance, accessibility, and procurement assurance.</span></Link>
        </nav>

        <EnterpriseProofBand />

        <section className="saas-section">
          <div className="saas-section__intro">
            <h2>One partner across intelligence, cyber risk, protection, technology, and learning.</h2>
            <p>
              Engage one capability or connect them. Obserra is designed to help leadership teams see material risk,
              make defensible decisions, assign ownership, and verify that action produced the intended result.
            </p>
          </div>
          <div className="saas-capability-list">
            {capabilities.map(([number, title, copy, href, action]) => (
              <Link href={href} className="saas-capability-row" key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <b>{action} →</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="saas-platform">
          <div className="saas-platform__inner">
            <div className="saas-platform__copy">
              <h2>EIOS is the operating layer for enterprise intelligence and accountable action.</h2>
              <p>
                Obserra EIOS is designed to correlate enterprise context across risk, cybersecurity, AI, legal,
                audit, finance, resilience, identity, vendors, controls, and intelligence so leaders can move from signal to decision to verified execution.
              </p>
              <div className="saas-platform__list">
                <div><b>01</b><span>Executive Mission Control and enterprise health</span></div>
                <div><b>02</b><span>Organizational risk, control, and evidence intelligence</span></div>
                <div><b>03</b><span>Enterprise knowledge graph, digital twin, and external intelligence</span></div>
                <div><b>04</b><span>Recommendations, approvals, implementation roadmaps, and board reporting</span></div>
              </div>
              <div className="saas-actions">
                <ButtonLink href="/eios">Explore EIOS</ButtonLink>
                <ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request an EIOS briefing</ButtonLink>
              </div>
            </div>
            <div className="saas-hero__command-shell" aria-label="EIOS design principles">
              <div className="saas-hero__command">
                <div className="saas-hero__command-head">
                  <span>DESIGNED FOR EXECUTIVE CONTROL</span>
                  <strong>Intelligence is only useful when it changes what the organization does.</strong>
                  <p>EIOS is designed around traceability from evidence and context through approval, action, measurement, and outcome.</p>
                </div>
                <div className="saas-hero__command-grid">
                  <div><b>Prioritize</b><span>Surface the few enterprise issues that materially change risk or value.</span></div>
                  <div><b>Explain</b><span>Show the evidence, affected business context, confidence, and tradeoffs behind a recommendation.</span></div>
                  <div><b>Coordinate</b><span>Assign owners, dependencies, milestones, controls, and acceptance criteria.</span></div>
                  <div><b>Verify</b><span>Measure realized risk reduction, maturity, business impact, and residual exposure.</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="saas-assurance" aria-label="Enterprise delivery principles">
          <div><strong>Executive judgment</strong><span>Senior leadership at the point of material enterprise decisions.</span></div>
          <div><strong>Evidence traceability</strong><span>Controls, findings, recommendations, and outcomes designed to survive scrutiny.</span></div>
          <div><strong>Secure delivery</strong><span>Identity, access, information handling, and release boundaries treated as product requirements.</span></div>
          <div><strong>Measurable execution</strong><span>Ownership, implementation, and verification carried through to outcome.</span></div>
        </div>

        <section className="saas-section saas-learning">
          <div className="saas-learning__copy">
            <h2>Obserra Academy develops capability for the decisions professionals actually face.</h2>
            <p>
              Professional learning combines controlled enrollment, protected access, applied scenarios, course-aware AI support,
              assessments, and completion records. Regulated programs follow separate eligibility and authorization gates.
              Identity, attendance, reporting, and completion controls remain offering-specific.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/academy">Browse Academy</ButtonLink>
              <ButtonLink href="/academy/enterprise" variant="secondary">Plan enterprise learning</ButtonLink>
            </div>
          </div>
          <div className="saas-learning__routes">
            <Link href="/academy"><span><strong>Professional Academy</strong><span>Cybersecurity, intelligence, protection, AI governance, and leadership learning.</span></span><b>Browse →</b></Link>
            <Link href="/florida-security-training"><span><strong>Florida Class D LMS</strong><span>Purpose-built regulated training environment with authorization controls.</span></span><b>Review →</b></Link>
            <Link href="/apps"><span><strong>Applications</strong><span>Commercial software with product-specific purchase and access controls.</span></span><b>Shop →</b></Link>
          </div>
        </section>

        <section className="saas-section saas-proof">
          <div className="saas-proof__copy">
            <h2>Built from operating experience, not generic consulting theory.</h2>
            <p>
              Obserra combines Fortune 500 CISO leadership, military intelligence and operational experience,
              governance discipline, doctoral research, and secure technology engineering for work where consequence, accountability, and trust matter.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/about">Review leadership credentials</ButtonLink>
              <ButtonLink href="/trust" variant="secondary">Visit the Trust Center</ButtonLink>
            </div>
          </div>
          <div className="saas-proof__stats">
            <div><strong>2×</strong><span>Fortune 500 Chief Information Security Officer experience</span></div>
            <div><strong>21</strong><span>Years of U.S. Army service</span></div>
            <div><strong>3</strong><span>Top Global CISO recognitions</span></div>
            <div><strong>60</strong><span>Reviewed nonregulated course baseline</span></div>
          </div>
        </section>

        <section className="saas-final">
          <div>
            <h2>Bring Obserra into the decision while there is still time to shape the outcome.</h2>
            <p>
              Engage for executive advisory, EIOS, cybersecurity, protective intelligence, secure applications,
              or professional learning through one enterprise conversation.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/contact?interest=enterprise-consultation">Talk to Obserra</ButtonLink>
              <ButtonLink href="/trust" variant="secondary">Review enterprise assurance</ButtonLink>
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
