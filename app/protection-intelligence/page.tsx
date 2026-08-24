import type { Metadata } from "next";
import Link from "next/link";
import "../apps/apps.css";
import "../services/services.css";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import ExecutiveInfoModal from "../components/ui/ExecutiveInfoModal";

const offers = [
  {
    title: "Executive Exposure Risk Assessment",
    summary: "See the digital, travel, public, and operational exposure around executives before it becomes a protection problem.",
    description: "A focused assessment of executive, family, event, travel, digital, and operational exposure designed to give leadership a prioritized picture of what matters now.",
    details: ["Prioritized exposure picture", "Specific mitigation actions", "Executive decision points and ownership"],
    duration: "2 to 4 weeks",
  },
  {
    title: "Protective Intelligence Program Design",
    summary: "Turn fragmented threat information into repeatable triage, escalation, briefing, and protective decisions.",
    description: "Design the operating model required to receive, assess, escalate, communicate, and govern protective intelligence without relying on ad hoc judgment.",
    details: ["Threat intake and triage model", "Escalation thresholds and ownership", "Executive briefing and governance structure"],
    duration: "4 to 6 weeks",
  },
  {
    title: "Executive Travel Risk Planning",
    summary: "Give leaders decision-ready destination intelligence, controls, and contingencies before travel or major events.",
    description: "Prepare executives and security teams for travel, events, and movement through destination intelligence, exposure analysis, decision thresholds, and response planning.",
    details: ["Destination and itinerary intelligence", "Pre-travel controls", "Contingency and response playbooks"],
    duration: "2 to 5 weeks",
  },
  {
    title: "Ongoing Threat Intelligence Advisory",
    summary: "Maintain a senior interpretation layer for evolving threats, geopolitical shifts, and executive exposure.",
    description: "Recurring advisory support that turns changing threat conditions into concise executive intelligence and concrete protective decisions.",
    details: ["Recurring executive intelligence", "Material change detection", "Action-oriented leadership briefings"],
    duration: "Monthly advisory",
  },
] as const;

export const metadata: Metadata = {
  title: `Protection and Intelligence | ${LEGAL_ENTITY_NAME}`,
  description: "Executive protection intelligence, executive exposure assessment, travel risk planning, and threat advisory for organizations operating in high-consequence environments.",
  alternates: { canonical: "/protection-intelligence" },
  keywords: ["protective intelligence", "executive exposure assessment", "travel risk planning", "executive protection advisory", "threat intelligence advisory"],
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Protection and Intelligence`,
    description: "Protective intelligence, executive exposure, travel risk, and decision support for leaders and organizations where security consequences are material.",
    url: "https://www.obserrallc.com/protection-intelligence",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-protection-intelligence.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} protection and intelligence` }],
  },
};

export default function ProtectionIntelligencePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Protection and Intelligence",
    description: "Protective intelligence, executive exposure assessments, travel risk planning, and threat advisory.",
    provider: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: "https://www.obserrallc.com" },
    areaServed: "Global",
    url: "https://www.obserrallc.com/protection-intelligence",
  };

  return (
    <>
      <EnterpriseHeader section="Protection and intelligence" />
      <main className="apps-page services-page protection-executive-page enterprise-page-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="apps-hero services-hero protection-hero">
          <div>
            <p className="apps-eyebrow">PROTECTION · INTELLIGENCE · EXECUTIVE RISK</p>
            <h1>Know the exposure early enough to change the outcome.</h1>
            <p>{LEGAL_ENTITY_NAME} gives leaders decision-ready protective intelligence across executive exposure, travel, public activity, digital footprint, and changing threat conditions.</p>
            <div className="apps-actions">
              <Link className="apps-button" href="/contact?interest=protection-intelligence">Request a confidential briefing</Link>
              <a className="apps-outline" href="#protection-offers">Review capabilities</a>
            </div>
          </div>
        </section>

        <section className="services-executive-portfolio" id="protection-offers" aria-labelledby="protection-heading">
          <div className="services-executive-heading">
            <p className="apps-eyebrow">PROTECTION &amp; INTELLIGENCE CAPABILITIES</p>
            <h2 id="protection-heading">Four focused ways to reduce executive exposure.</h2>
            <p>Select a capability for scope, outcomes, and the next step. Details stay available without forcing visitors through a long page.</p>
          </div>
          <div className="services-executive-grid">
            {offers.map((offer, index) => (
              <article className="services-executive-card" key={offer.title}>
                <ExecutiveInfoModal
                  number={String(index + 1).padStart(2, "0")}
                  title={offer.title}
                  summary={`${offer.summary} ${offer.duration}.`}
                  description={offer.description}
                  details={[...offer.details]}
                  href={`/contact?interest=protection-intelligence&service=${encodeURIComponent(offer.title)}`}
                  linkLabel="Discuss this capability"
                />
              </article>
            ))}
          </div>
        </section>

        <section className="services-consultation protection-consultation">
          <div>
            <p className="apps-eyebrow">CONFIDENTIAL EXECUTIVE SUPPORT</p>
            <h2>Bring us in before exposure becomes an incident.</h2>
            <p>Share the decision, time horizon, people or activity at risk, and the information already available. We will define the right intelligence and protection response.</p>
          </div>
          <div className="services-consultation-actions">
            <Link className="apps-button" href="/contact?interest=protection-intelligence">Start a confidential conversation</Link>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
