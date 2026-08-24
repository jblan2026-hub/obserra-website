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
  ["Executive advisory", "Put senior leadership directly against the decisions that carry the most risk, scrutiny, and business consequence."],
  ["Program design", "Turn complex requirements into a practical operating model, roadmap, controls, ownership, and measurable execution."],
  ["Embedded leadership", "Add experienced executive capacity when the organization needs decisive ownership without waiting for a permanent hire."],
  ["Assessment and assurance", "See the real posture, expose material gaps, prioritize action, and give leadership evidence they can defend."],
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
  ["Situation", "Define the business context, material exposure, and decision leadership must make."],
  ["Intervention", "Apply the right advisory, assessment, operating model, control design, or implementation support."],
  ["Evidence", "Show what changed through measurable outputs, verified controls, milestones, and risk-reduction actions."],
  ["Executive value", "Connect the work to stronger decisions, clearer accountability, resilience, assurance, and readiness."],
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
          <h1>Turn high-consequence risk into decisions your organization can execute.</h1>
          <p>
            {LEGAL_ENTITY_NAME} helps leadership teams cut through cyber, protection, intelligence,
            governance, and enterprise-risk complexity. We bring senior judgment, disciplined analysis,
            and implementation focus to the decisions where delay, ambiguity, or weak ownership create real business exposure.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="/contact?interest=enterprise-services">Start an executive conversation</a>
            <a className="apps-outline" href="#service-lines">Explore capabilities</a>
            <a className="apps-outline" href="/trust">Review enterprise assurance</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Veteran-led executive advisory and protective intelligence</p>
          <p><Brain size={16} /> Fortune 500 CISO-level cybersecurity and enterprise-risk leadership</p>
          <p><Building2 size={16} /> Built for regulated and high-consequence operating environments</p>
          <p><FileCheck2 size={16} /> Decisions backed by evidence, ownership, and measurable follow-through</p>
        </aside>
      </section>

      <EnterpriseProofBand />

      <section className="services-command-bar" aria-label="Enterprise services operating model">
        <article><strong>01</strong><span>See the exposure in business context—not as isolated technical noise.</span></article>
        <article><strong>02</strong><span>Prioritize the decisions that matter most by impact, urgency, and evidence.</span></article>
        <article><strong>03</strong><span>Turn decisions into an operating model, controls, owners, and executable roadmap.</span></article>
        <article><strong>04</strong><span>Verify what changed and give leadership defensible evidence of progress.</span></article>
      </section>

      <section className="apps-results services-results" id="service-lines">
        <div className="services-section-heading">
          <p className="apps-eyebrow">SERVICE PORTFOLIO</p>
          <h2>Specialized expertise. One standard for executive accountability.</h2>
          <p>Choose the capability that matches the mission. Each service is structured around business outcomes, accountable ownership, evidence, and a clear path from assessment to action.</p>
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
                    See how we help <ArrowRight size={15} />
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
          <h2>Bring in the level of leadership and ownership the moment requires.</h2>
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
          <h2>Context matters when the operating environment is regulated, connected, and consequential.</h2>
          <p>Our approach adapts to the risk, regulatory pressure, technology dependency, and leadership realities of each sector.</p>
        </div>
        <div className="services-industry-grid">
          {industries.map(([title, description]) => (
            <article key={title}><strong>{title}</strong><p>{description}</p><Link href="/industries">Explore industry context →</Link></article>
          ))}
        </div>
      </section>

      <section className="services-case-study">
        <div className="services-section-heading">
          <p className="apps-eyebrow">PROVE THE VALUE</p>
          <h2>Show the decision, the intervention, the evidence, and the business result.</h2>
          <p>Customer work is represented only when permission and supporting evidence exist. The standard is credibility over inflated claims.</p>
        </div>
        <div className="services-case-grid">
          {caseStudyFramework.map(([title, description]) => (
            <article key={title}><strong>{title}</strong><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="services-consultation">
        <div>
          <p className="apps-eyebrow">START WITH THE DECISION</p>
          <h2>Tell us what has to change, what is at risk, and when leadership needs an answer.</h2>
          <p>We will align the right service line, engagement model, information requirements, and commercial next step around the outcome you need—not force the problem into a generic package.</p>
        </div>
        <div className="services-consultation-actions">
          <a className="apps-button" href="/contact?interest=enterprise-services">Start the conversation</a>
          <a className="apps-outline" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`${LEGAL_ENTITY_NAME} Enterprise Services Inquiry`)}`}>Email enterprise services</a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
