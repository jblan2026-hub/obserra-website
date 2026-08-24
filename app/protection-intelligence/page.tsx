import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Plane, ScanSearch, ArrowRight, Eye, NotebookPen, MapPinned, LockKeyhole } from "lucide-react";
import "../apps/apps.css";
import "../services/services.css";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

const offers = [
  {
    title: "Executive Exposure Risk Assessment",
    summary: "Identify the digital, travel, public, and operational exposure that can create real risk for executives, families, events, and the organization around them.",
    outcome: "A prioritized exposure picture with specific mitigation actions and leadership decisions.",
    duration: "2 to 4 weeks",
    icon: Eye,
  },
  {
    title: "Protective Intelligence Program Design",
    summary: "Build the intake, triage, escalation, briefing, and governance model required to turn fragmented threat information into defensible protective decisions.",
    outcome: "A repeatable intelligence operating model with clear thresholds, ownership, and escalation paths.",
    duration: "4 to 6 weeks",
    icon: NotebookPen,
  },
  {
    title: "Executive Travel Risk Planning",
    summary: "Prepare leaders and security teams for travel, events, and movement through destination intelligence, exposure analysis, decision thresholds, and response planning.",
    outcome: "Decision-ready travel intelligence, pre-travel controls, and response playbooks aligned to the mission.",
    duration: "2 to 5 weeks",
    icon: MapPinned,
  },
  {
    title: "Ongoing Threat Intelligence Advisory",
    summary: "Give leadership a trusted interpretation layer for evolving threats, executive exposure, geopolitical shifts, and protective posture decisions.",
    outcome: "Recurring executive intelligence that translates changing conditions into concrete action.",
    duration: "Monthly advisory",
    icon: ScanSearch,
  },
];

export const metadata: Metadata = {
  title: `Protection and Intelligence | ${LEGAL_ENTITY_NAME}`,
  description:
    "Executive protection intelligence, executive exposure assessment, travel risk planning, and threat advisory for organizations operating in high-consequence environments.",
  alternates: { canonical: "/protection-intelligence" },
  keywords: [
    "protective intelligence",
    "executive exposure assessment",
    "travel risk planning",
    "executive protection advisory",
    "threat intelligence advisory",
  ],
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Protection and Intelligence`,
    description:
      "Protective intelligence, executive exposure, travel risk, and decision support for leaders and organizations where security consequences are material.",
    url: "https://www.obserrallc.com/protection-intelligence",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} protection and intelligence` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} Protection and Intelligence`,
    description: "Protective intelligence, executive exposure, travel risk, and security decision support.",
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
        description: "Protective intelligence, executive exposure assessments, travel risk planning, and threat advisory.",
        provider: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: "https://www.obserrallc.com" },
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
    <>
      <EnterpriseHeader section="Protection and intelligence" />
      <main className="apps-page services-page enterprise-page-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="apps-hero services-hero">
          <div>
            <p className="apps-eyebrow">PROTECTION · INTELLIGENCE · EXECUTIVE RISK</p>
            <h1>See the exposure earlier. Give leadership time to act.</h1>
            <p>
              {LEGAL_ENTITY_NAME} helps organizations understand the threats, vulnerabilities, travel conditions,
              public exposure, and operational dependencies that can put executives and high-consequence activity at risk.
              We turn fragmented signals into decision-ready protective intelligence, clear escalation thresholds, and practical action.
            </p>
            <div className="apps-actions">
              <Link className="apps-button" href="/contact?interest=protection-intelligence">Request a confidential briefing</Link>
              <Link className="apps-outline" href="#protection-offers">Explore protection services</Link>
            </div>
            <p className="services-hero-trust-link"><Link href="/trust">Review information-handling and enterprise assurance →</Link></p>
          </div>
          <aside>
            <p><LockKeyhole size={16} /> Confidential handling for sensitive executive and organizational information</p>
            <p><ScanSearch size={16} /> Evidence-led threat triage with explicit escalation thresholds</p>
            <p><Plane size={16} /> Travel and event intelligence built around the actual decision</p>
            <p><ShieldCheck size={16} /> Senior security judgment connected to accountable protective action</p>
          </aside>
        </section>

        <EnterpriseProofBand>
          <div><span>01</span><strong>Discover exposure</strong><small>Find the people, places, digital signals, and dependencies that materially change risk.</small></div>
          <div><span>02</span><strong>Interpret the threat</strong><small>Separate noise from conditions that warrant a leadership or protective decision.</small></div>
          <div><span>03</span><strong>Control the response</strong><small>Set thresholds, ownership, communications, travel controls, and contingency actions.</small></div>
          <div><span>04</span><strong>Reassess continuously</strong><small>Update posture as threat, itinerary, exposure, or organizational conditions change.</small></div>
        </EnterpriseProofBand>

        <section className="apps-results services-results" id="protection-offers">
          <div className="services-section-heading">
            <p className="apps-eyebrow">PROTECTION AND INTELLIGENCE SERVICES</p>
            <h2>Start with the exposure that matters now.</h2>
            <p>Each engagement is scoped around a concrete protection problem, a decision owner, a defined operating window, and evidence leadership can use.</p>
          </div>
          <div className="apps-grid">
            {offers.map((offer) => {
              const Icon = offer.icon;
              return (
                <article key={offer.title}>
                  <header>
                    <span className="status-pill status-pilot">Scoped engagement</span>
                    <small>{offer.duration}</small>
                  </header>
                  <div className="service-icon-wrap" aria-hidden="true"><Icon size={20} /></div>
                  <h2>{offer.title}</h2>
                  <p>{offer.summary}</p>
                  <ul className="service-card-outcomes"><li>{offer.outcome}</li></ul>
                  <footer>
                    <Link href={`/contact?interest=protection-intelligence&service=${encodeURIComponent(offer.title)}`}>
                      Scope this engagement <ArrowRight size={15} />
                    </Link>
                  </footer>
                </article>
              );
            })}
          </div>
        </section>

        <section className="services-consultation">
          <div>
            <p className="apps-eyebrow">WHEN THE SITUATION IS SENSITIVE</p>
            <h2>Bring us in before the risk becomes an incident.</h2>
            <p>Share the decision you are facing, the people or activity at risk, the time horizon, and the information you already have. We will define the right intelligence and protection response without forcing the problem into a generic package.</p>
          </div>
          <div className="services-consultation-actions">
            <Link className="apps-button" href="/contact?interest=protection-intelligence">Start a confidential conversation</Link>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Protection%20and%20Intelligence%20Inquiry">Email protection and intelligence</a>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
