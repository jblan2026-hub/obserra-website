import type { Metadata } from "next";
import { ArrowRight, ShieldCheck, Brain, Briefcase, Users, Binary, Landmark, BookOpen, Building2, LockKeyhole } from "lucide-react";
import "../apps/apps.css";

export const metadata: Metadata = {
  title: "Services | Obserra Executive Protection, Cybersecurity, Intelligence and Advisory",
  description:
    "Executive protection, protective intelligence, cybersecurity consulting, fractional CISO, AI governance, IAM, GRC, enterprise risk, and technology consulting.",
  alternates: { canonical: "/services" }
};

const services = [
  ["Executive Protection", "Protective planning, executive travel support, and threat-informed risk posture.", ShieldCheck],
  ["Protective Intelligence", "Structured intelligence for decision-critical protective and operational risk concerns.", Brain],
  ["Cybersecurity Consulting", "Strategy, architecture, governance, and resilience advisory for complex enterprises.", LockKeyhole],
  ["Fractional CISO", "Senior security leadership capacity aligned to enterprise priorities and board expectations.", Briefcase],
  ["AI Governance", "Policy, control, and risk frameworks for responsible enterprise AI adoption.", Binary],
  ["Enterprise Risk", "Cross-domain risk quantification and executive mitigation planning.", Landmark],
  ["Identity Access Management", "Identity governance, certification, and privileged access oversight.", Users],
  ["GRC", "Governance, risk, and compliance architecture with defensible control evidence.", Building2],
  ["Digital Risk", "Exposure analysis across public digital footprint, identity, and enterprise ecosystem risk.", ShieldCheck],
  ["Training", "Professional education through Obserra Academy and tailored enterprise enablement.", BookOpen],
  ["Corporate Security", "Enterprise-grade protective programs coordinated with operations and governance.", ShieldCheck],
  ["Technology Consulting", "AI-native application strategy and secure implementation roadmaps.", ArrowRight]
] as const;

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cybersecurity and executive protection services",
    provider: {
      "@type": "Organization",
      name: "Obserra Executive Protection & Intelligence LLC",
      url: "https://www.obserrallc.com"
    },
    areaServed: "Global"
  };

  return (
    <main className="apps-page">
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" />
          <span>SERVICES</span>
        </a>
        <nav aria-label="Services navigation">
          <a href="/apps">Applications</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Service%20Inquiry" className="apps-nav-cta">Request consultation</a>
        </nav>
      </header>

      <section className="apps-hero">
        <div>
          <p className="apps-eyebrow">ENTERPRISE SERVICES</p>
          <h1>Advisory and operational services built for executive-level decisions.</h1>
          <p>
            Obserra aligns security, intelligence, governance, and technology expertise to help organizations
            reduce uncertainty and execute with confidence.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Consultation">Request consultation</a>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Schedule%20Obserra%20Demo">Schedule demo</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Veteran-owned company</p>
          <p><Brain size={16} /> Fortune 500 leadership experience</p>
          <p><Building2 size={16} /> Enterprise delivery model</p>
        </aside>
      </section>

      <section className="apps-results">
        <p>Service portfolio</p>
        <div className="apps-grid">
          {services.map(([title, copy, Icon]) => (
            <article key={title}>
              <header>
                <span className="status-pill status-available">Service</span>
                <small>Advisory</small>
              </header>
              <h2>{title}</h2>
              <p>{copy}</p>
              <footer>
                <a href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`${title} consultation`)}`}>
                  Engage this service <ArrowRight size={15} />
                </a>
              </footer>
              <div style={{ marginTop: "16px", color: "#84d6f5" }}>
                <Icon size={16} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
