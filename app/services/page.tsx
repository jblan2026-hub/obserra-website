import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Brain, Briefcase, Users, Binary, Landmark, BookOpen, Building2, LockKeyhole, Network, Scale, Crosshair, FileCheck2 } from "lucide-react";
import "../apps/apps.css";
import "./services.css";
import { serviceCatalog } from "./serviceCatalog";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: "Enterprise Services | Cybersecurity, Protection, Intelligence, Risk and AI Governance",
  description:
    "Executive advisory and scoped delivery across cybersecurity, protection, intelligence, enterprise risk, AI governance, identity, resilience, and secure technology.",
  alternates: { canonical: "/services" },
  keywords: [
    "enterprise cybersecurity services",
    "executive protection services",
    "fractional ciso",
    "protective intelligence",
    "AI governance consulting",
    "incident response advisory",
    "digital forensics consulting",
  ],
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Enterprise Services`,
    description: "Executive-ready advisory and delivery across cybersecurity, protection, intelligence, AI governance, risk, resilience, and professional training.",
    url: "https://www.obserrallc.com/services",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} enterprise services` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} Enterprise Services`,
    description: "Cybersecurity, executive protection, intelligence, risk, AI governance, resilience, and training for high-consequence organizations.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

const iconByKey = {
  ShieldCheck,
  Brain,
  LockKeyhole,
  Briefcase,
  Binary,
  Landmark,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
  Network,
  Scale,
  Crosshair,
  FileCheck2,
};

const engagementModels = [
  ["Executive advisory", "Focused access to senior leadership for strategy, risk decisions, governance, and board-level communication."],
  ["Program design", "Structured operating models, policies, controls, playbooks, roadmaps, and implementation sequencing."],
  ["Embedded leadership", "Fractional or interim executive capacity for security, risk, protection, governance, and transformation priorities."],
  ["Assessment and assurance", "Evidence-based posture review, gap analysis, control evaluation, and prioritized recommendations."],
];

const industries = [
  ["Healthcare and medical devices", "Cybersecurity, product security, FDA readiness, privacy, resilience, and executive risk governance."],
  ["Financial services and insurance", "Identity, resilience, regulatory risk, fraud exposure, executive protection, and board assurance."],
  ["Manufacturing and critical infrastructure", "OT/ICS risk, supply-chain exposure, incident readiness, physical security, and enterprise continuity."],
  ["Technology and cloud", "Secure product strategy, AI governance, software supply chain, identity, privacy, and customer trust."],
  ["Government and defense", "NIST-aligned governance, CMMC readiness, protective intelligence, evidence discipline, and mission assurance."],
  ["Corporate and professional services", "Executive security, enterprise risk, governance, privacy, resilience, and workforce enablement."],
];

const caseStudyFramework = [
  ["Situation", "Document the operating context, material risk, business constraint, and leadership decision without exposing confidential customer information."],
  ["Intervention", "Describe the scoped advisory, assessment, operating model, control design, or implementation support delivered."],
  ["Evidence", "Present measurable outputs such as governance artifacts, risk reduction actions, control validation, readiness milestones, or capability improvements."],
  ["Executive value", "Explain how the work improved decision quality, accountability, resilience, assurance, or organizational readiness."],
];

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${LEGAL_ENTITY_NAME} Enterprise Services`,
        itemListElement: serviceCatalog.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.obserrallc.com/services/${service.id}`,
          name: service.title,
        })),
      },
      {
        "@type": "Service",
        serviceType: "Enterprise cybersecurity, protection, intelligence, risk, AI governance, and advisory services",
        provider: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
        },
        areaServed: "Global",
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Enterprise services" />
      <main className="apps-page services-page enterprise-page-main">
      <section className="apps-hero services-hero">
        <div>
          <p className="apps-eyebrow">ENTERPRISE SERVICES</p>
          <h1>Executive expertise for cyber, protection, intelligence, governance, and enterprise risk.</h1>
          <p>
            OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC helps leadership teams assess complex exposure,
            design defensible operating models, strengthen resilience, and execute high-consequence priorities.
            Engagements are scoped around the decision, business outcome, information boundary, accountable owners, and acceptance evidence.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="/contact?interest=enterprise-services">Request executive consultation</a>
            <a className="apps-outline" href="#service-lines">Explore service lines</a>
            <a className="apps-outline" href="/trust">Review enterprise assurance</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Veteran-led executive advisory and protective intelligence</p>
          <p><Brain size={16} /> Fortune 500 Chief Information Security Officer and enterprise-risk leadership</p>
          <p><Building2 size={16} /> Structured delivery for regulated and high-consequence operating environments</p>
          <p><FileCheck2 size={16} /> Evidence, traceability, and executive-ready reporting</p>
        </aside>
      </section>

      <EnterpriseProofBand />

      <section className="services-command-bar" aria-label="Enterprise services operating model">
        <article><strong>01</strong><span>Assess the operating context and material exposure.</span></article>
        <article><strong>02</strong><span>Prioritize decisions by business impact, urgency, and evidence.</span></article>
        <article><strong>03</strong><span>Design the operating model, controls, and implementation roadmap.</span></article>
        <article><strong>04</strong><span>Measure execution, assurance, and realized risk reduction.</span></article>
      </section>

      <section className="apps-results services-results" id="service-lines">
        <div className="services-section-heading">
          <p className="apps-eyebrow">SERVICE PORTFOLIO</p>
          <h2>Specialized service lines connected through one executive operating model.</h2>
          <p>Each engagement has a dedicated detail page covering business outcomes, delivery approach, evidence, and next steps.</p>
        </div>
        <div className="apps-grid">
          {serviceCatalog.map((service) => {
            const Icon = iconByKey[service.icon];
            return (
              <article key={service.id}>
                <header>
                  <span className="status-pill status-available">Enterprise service</span>
                  <small>{service.category}</small>
                </header>
                <div className="service-icon-wrap"><Icon size={18} /></div>
                <h2>{service.title}</h2>
                <p>{service.summary}</p>
                <ul className="service-card-outcomes">
                  {service.outcomes.slice(0, 2).map((outcome) => <li key={outcome}>{outcome}</li>)}
                </ul>
                <footer>
                  <Link href={`/services/${service.id}`}>
                    Review engagement <ArrowRight size={15} />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-engagements">
        <div className="services-section-heading">
          <p className="apps-eyebrow">ENGAGEMENT MODELS</p>
          <h2>Choose the operating model that matches the decision, urgency, and level of ownership required.</h2>
        </div>
        <div className="services-engagement-grid">
          {engagementModels.map(([title, description], index) => (
            <article key={title}><b>{String(index + 1).padStart(2, "0")}</b><strong>{title}</strong><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="services-industries">
        <div className="services-section-heading">
          <p className="apps-eyebrow">INDUSTRY SOLUTIONS</p>
          <h2>Risk and delivery context tailored to regulated, technology-dependent, and high-consequence sectors.</h2>
          <p>Industry positioning reflects operating requirements and risk patterns; it does not imply a customer relationship or unsupported engagement history.</p>
        </div>
        <div className="services-industry-grid">
          {industries.map(([title, description]) => (
            <article key={title}><strong>{title}</strong><p>{description}</p><Link href="/industries">Review industry context →</Link></article>
          ))}
        </div>
      </section>

      <section className="services-case-study">
        <div className="services-section-heading">
          <p className="apps-eyebrow">CASE-STUDY FRAMEWORK</p>
          <h2>Customer work is documented through a controlled, confidentiality-aware evidence model.</h2>
          <p>No customer relationship, outcome, scale, or performance metric is represented without permission and supporting evidence.</p>
        </div>
        <div className="services-case-grid">
          {caseStudyFramework.map(([title, description]) => (
            <article key={title}><strong>{title}</strong><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="services-consultation">
        <div>
          <p className="apps-eyebrow">EXECUTIVE CONSULTATION</p>
          <h2>Start with the decision, exposure, deadline, and business outcome that matter most.</h2>
          <p>{LEGAL_ENTITY_NAME} will use the initial inquiry to determine the appropriate service line, engagement model, information requirements, and next commercial step. Pricing is provided only after scope and delivery requirements are understood.</p>
        </div>
        <div className="services-consultation-actions">
          <a className="apps-button" href="/contact?interest=enterprise-services">Open consultation workflow</a>
          <a className="apps-outline" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`${LEGAL_ENTITY_NAME} Enterprise Services Inquiry`)}`}>Email enterprise services</a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
