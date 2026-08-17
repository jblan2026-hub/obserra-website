import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import "../commercial-pages.css";

export const metadata: Metadata = {
  title: "Executive Cybersecurity, AI Governance and Intelligence Resources",
  description:
    "Explore Obserra resources for executive cybersecurity, AI governance, protective intelligence, enterprise risk, EIOS, trust, and professional training.",
  alternates: { canonical: "/resources" },
  keywords: [
    "executive cybersecurity resources",
    "AI governance resources",
    "protective intelligence resources",
    "enterprise cyber risk guidance",
    "CISO leadership resources",
    "enterprise intelligence resources",
  ],
  openGraph: {
    title: "Obserra Executive Cybersecurity, AI Governance and Intelligence Resources",
    description:
      "Practical resources for leaders evaluating cyber risk, AI governance, intelligence, secure technology, training, and enterprise assurance.",
    url: "https://www.obserrallc.com/resources",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Executive Resources",
    description:
      "Cybersecurity, AI governance, protective intelligence, enterprise risk, EIOS, and professional training resources.",
  },
};

const resources = [
  ["Executive cybersecurity", "Connect cyber exposure, business impact, accountability, resilience, and investment decisions for senior leadership and boards.", "/services"],
  ["AI governance", "Build practical oversight for enterprise AI adoption, model risk, approvals, human accountability, and defensible governance records.", "/apps/obserra-ai-governance-suite"],
  ["Enterprise intelligence", "See how Obserra EIOS connects context, evidence, decisions, approvals, implementation, and verified outcomes.", "/eios"],
  ["Protective intelligence", "Evaluate executive exposure, travel risk, threat context, escalation criteria, and proportionate protective actions.", "/protection-intelligence"],
  ["Professional learning", "Build capability across cybersecurity, intelligence, protection, AI governance, incident leadership, and secure technology.", "/academy"],
  ["Trust and procurement", `Review ${LEGAL_ENTITY_NAME} security, privacy, data handling, responsible AI, accessibility, and buyer assurance information.`, "/trust"],
];

export default function ResourcesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Obserra Executive Resources",
        url: "https://www.obserrallc.com/resources",
        description:
          "Executive cybersecurity, AI governance, protective intelligence, enterprise risk, EIOS, professional learning, and trust resources.",
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
        about: { "@id": "https://www.obserrallc.com/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.obserrallc.com/resources" },
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Executive resources" />
      <main className="commercial-page enterprise-page-main">
        <div className="commercial-shell">
          <section className="commercial-hero">
            <p className="commercial-eyebrow">EXECUTIVE RESOURCES</p>
            <h1>Practical intelligence for leaders responsible for cyber risk, AI, and enterprise resilience.</h1>
            <p>
              Start with the issue you are trying to solve. These resource pathways connect the relevant Obserra
              expertise, technology, learning, and assurance material without burying the decision in generic content.
            </p>
          </section>

          <section className="commercial-grid" aria-label="Obserra resource topics">
            {resources.map(([title, copy, href]) => (
              <article className="commercial-card" key={title}>
                <span>OBSERRA RESOURCE</span>
                <h2>{title}</h2>
                <p>{copy}</p>
                <Link href={href}>Explore {title.toLowerCase()} →</Link>
              </article>
            ))}
          </section>

          <section className="commercial-cta">
            <div>
              <h2>Need an answer specific to your enterprise?</h2>
              <p>Start a confidential conversation about the risk, decision, deadline, or operating constraint in front of you.</p>
            </div>
            <Link href="/contact?interest=enterprise-consultation">Talk to Obserra</Link>
          </section>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
