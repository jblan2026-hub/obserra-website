import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Plane, ScanSearch, ArrowRight, Eye, NotebookPen, MapPinned } from "lucide-react";
import "../apps/apps.css";
import "../services/services.css";

const offers = [
  {
    title: "Executive Exposure Risk Assessment",
    summary: "Assess digital, travel, and public exposure indicators for executive leaders and define prioritized mitigation actions.",
    duration: "2 to 4 weeks",
  },
  {
    title: "Protective Intelligence Program Setup",
    summary: "Establish intelligence intake, triage, escalation criteria, and leadership briefing workflows for high-consequence scenarios.",
    duration: "4 to 6 weeks",
  },
  {
    title: "Executive Travel Risk Planning",
    summary: "Build travel risk models, pre-travel briefing standards, and response playbooks for executive movement and events.",
    duration: "2 to 5 weeks",
  },
  {
    title: "Ongoing Threat Monitoring Advisory",
    summary: "Provide recurring advisory support for threat trend interpretation, decision support, and protective posture adjustments.",
    duration: "Monthly advisory",
  },
];

export const metadata: Metadata = {
  title: "Protection and Intelligence | Obserra",
  description:
    "Commercial pathway for protective intelligence, executive exposure assessments, and travel risk planning with pilot-first delivery.",
  alternates: { canonical: "/protection-intelligence" },
  keywords: [
    "protective intelligence",
    "executive exposure assessment",
    "travel risk planning",
    "executive protection advisory",
    "commercial security services",
  ],
  openGraph: {
    title: "Obserra Protection and Intelligence",
    description:
      "Controlled pilots and design-partner engagements for executive exposure, protective intelligence, and travel risk.",
    url: "https://www.obserrallc.com/protection-intelligence",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra protection and intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Protection and Intelligence",
    description: "Controlled pilots and design-partner engagements for executive exposure, protective intelligence, and travel risk.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function ProtectionIntelligencePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Protection and Intelligence",
        description: "Protective intelligence, executive exposure assessments, and travel risk planning delivered through controlled commercial pilots.",
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com",
        },
        areaServed: "Global",
        url: "https://www.obserrallc.com/protection-intelligence",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Protection and Intelligence", item: "https://www.obserrallc.com/protection-intelligence" },
        ],
      },
    ],
  };

  return (
    <main className="apps-page services-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>PROTECTION AND INTELLIGENCE</span>
        </a>
        <nav aria-label="Protection and intelligence navigation">
          <a href="/services">Services</a>
          <a href="/apps">Applications</a>
          <a href="/academy">Academy</a>
          <a href="/catalog">Catalog</a>
          <a href="/contact" className="apps-nav-cta">Request confidential briefing</a>
        </nav>
      </header>

      <section className="apps-hero services-hero">
        <div>
          <p className="apps-eyebrow">SECOND REVENUE ENGINE: PILOT-FIRST PROTECTION AND INTELLIGENCE</p>
          <h1>Protective intelligence and executive exposure services packaged for fast, controlled deployment.</h1>
          <p>
            Obserra leads with design-partner and controlled pilot engagements before broader commercial rollout.
            This path is built for buyers who need clear executive exposure findings, actionable protective intelligence,
            and travel risk readiness without waiting on a large standing program.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="/contact">Schedule confidential briefing</a>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Executive%20Travel%20Risk%20Assessment">Request travel risk assessment</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Confidential handling and executive-safe workflows</p>
          <p><ScanSearch size={16} /> Evidence-led threat triage and escalation standards</p>
          <p><Plane size={16} /> Travel and event risk decision support</p>
        </aside>
      </section>

      <section className="apps-results services-results">
        <p>Commercial entry offers</p>
        <div className="apps-grid">
          {offers.map((offer) => (
            <article key={offer.title}>
              <header>
                <span className="status-pill status-pilot">Pilot-ready</span>
                <small>{offer.duration}</small>
              </header>
              <h2>{offer.title}</h2>
              <p>{offer.summary}</p>
              <div className="service-icon-wrap" aria-hidden="true">
                {offer.title === "Executive Exposure Risk Assessment" ? <Eye size={22} /> : offer.title === "Protective Intelligence Program Setup" ? <NotebookPen size={22} /> : offer.title === "Executive Travel Risk Planning" ? <MapPinned size={22} /> : <ScanSearch size={22} />}
              </div>
              <footer>
                <a href="/contact">
                  Request scoped proposal <ArrowRight size={15} />
                </a>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
