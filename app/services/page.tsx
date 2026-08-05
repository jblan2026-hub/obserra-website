import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Brain, Briefcase, Users, Binary, Landmark, BookOpen, Building2, LockKeyhole } from "lucide-react";
import "../apps/apps.css";
import "./services.css";

export const metadata: Metadata = {
  title: "Services | Obserra Executive Protection, Cybersecurity, Intelligence and Advisory",
  description:
    "Executive protection, protective intelligence, cybersecurity consulting, fractional CISO, AI governance, IAM, GRC, enterprise risk, and technology consulting.",
  alternates: { canonical: "/services" },
  keywords: ["executive protection services", "fractional ciso", "cybersecurity consulting", "protective intelligence", "AI governance"],
  openGraph: {
    title: "Obserra Services | Enterprise Security, Intelligence, and Advisory",
    description: "Executive-ready cybersecurity, protective intelligence, enterprise risk, and secure technology consulting.",
    url: "https://www.obserrallc.com/services",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Services | Enterprise Security and Intelligence",
    description: "Advisory and delivery across cybersecurity, protection, intelligence, and AI governance.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

const services = [
  ["Executive Protection", "Executive-facing protective programs with advance planning, travel safeguards, and high-risk event posture control.", ShieldCheck],
  ["Protective Intelligence", "Operational intelligence workflows that identify threat indicators early and support defensible protective decisions.", Brain],
  ["Cybersecurity Consulting", "Board-relevant cyber strategy, control architecture, and resilience planning for complex enterprise environments.", LockKeyhole],
  ["Fractional CISO", "Interim security leadership for governance maturity, risk reduction, executive reporting, and prioritized execution.", Briefcase],
  ["AI Governance", "Policy-aligned AI operating controls covering model risk, approval workflow, evidence, and accountability.", Binary],
  ["Enterprise Risk", "Cross-functional risk intelligence that links business impact, control posture, and leadership action paths.", Landmark],
  ["Identity Access Management", "Identity lifecycle, privileged access governance, and certification controls for enterprise-scale access risk.", Users],
  ["GRC", "Governance, risk, and compliance structures that produce audit-ready evidence and executive-level decision clarity.", Building2],
  ["Digital Risk", "Exposure mapping across identity, surface area, and digital ecosystems with mitigation prioritization.", ShieldCheck],
  ["Training", "Outcome-driven professional training through Obserra Academy and enterprise cohort enablement.", BookOpen],
  ["Corporate Security", "Integrated corporate security design aligned to legal, HR, cyber, and physical operations.", ShieldCheck],
  ["Technology Consulting", "Secure AI-native product strategy, implementation planning, and enterprise integration governance.", ArrowRight]
] as const;

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Cybersecurity and executive protection services",
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com"
        },
        areaServed: "Global"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Services", item: "https://www.obserrallc.com/services" }
        ]
      }
    ]
  };

  return (
    <main className="apps-page services-page">
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>SERVICES</span>
        </a>
        <nav aria-label="Services navigation">
          <a href="/">Home</a>
          <a href="/apps">Applications</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Service%20Inquiry" className="apps-nav-cta">Request consultation</a>
        </nav>
      </header>

      <section className="apps-hero services-hero">
        <div>
          <p className="apps-eyebrow">ENTERPRISE COMMERCIAL SERVICES</p>
          <h1>Commercial-grade security and intelligence services for high-consequence environments.</h1>
          <p>
            OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC aligns cybersecurity, protective intelligence,
            executive protection, and governance expertise to help leadership teams reduce uncertainty,
            accelerate decisions, and deliver measurable risk and resilience outcomes.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Executive%20Consultation">Request executive consultation</a>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Schedule%20Obserra%20Scoping%20Session">Book commercial scoping session</a>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Free%20Lead%20Generation%20and%20Advertising%20Strategy%20Session">Free growth strategy session</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Veteran-owned executive advisory organization</p>
          <p><Brain size={16} /> Fortune 500 CISO leadership experience</p>
          <p><Building2 size={16} /> Structured delivery model for enterprise environments</p>
        </aside>
      </section>

      <section className="apps-results services-results">
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
                  Start this engagement <ArrowRight size={15} />
                </a>
              </footer>
              <div className="service-icon-wrap">
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
