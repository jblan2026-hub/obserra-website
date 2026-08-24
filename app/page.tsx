import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "./components/ui/ObserraUI";
import ExecutiveInfoModal from "./components/ui/ExecutiveInfoModal";
import { EnterpriseFooter, EnterpriseHeader } from "./components/enterprise/EnterpriseChrome";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import "./saas-home.css";
import "./premium-home.css";

export const metadata: Metadata = {
  title: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Secure Technology`,
  description:
    `${LEGAL_ENTITY_NAME} helps high-consequence organizations connect cybersecurity, protective intelligence, governance, secure technology, and executive decision support.`,
  alternates: { canonical: "/" },
};

const capabilities = [
  {
    number: "01",
    title: "Executive Advisory",
    summary: "Board-ready cybersecurity, enterprise risk, governance, resilience, and transformation leadership.",
    description:
      "Obserra EPI gives executives and boards senior decision support when cybersecurity, operational risk, governance, and transformation priorities converge.",
    details: [
      "Executive and board advisory",
      "Fractional CISO and security leadership",
      "Enterprise risk, resilience, and transformation strategy",
    ],
    href: "/services",
    linkLabel: "More information",
  },
  {
    number: "02",
    title: "Cybersecurity, Risk & Governance",
    summary: "Cyber strategy, control assurance, AI governance, identity, resilience, and evidence-backed risk reduction.",
    description:
      "Obserra EPI helps organizations understand material cyber and governance exposure, establish accountable controls, and turn risk decisions into measurable execution.",
    details: [
      "Cybersecurity strategy and operating models",
      "Risk, compliance, AI governance, and control assurance",
      "Identity, resilience, incident readiness, and evidence",
    ],
    href: "/services",
    linkLabel: "More information",
  },
  {
    number: "03",
    title: "Protection & Intelligence",
    summary: "Protective intelligence, executive exposure, travel risk, investigations, and security planning.",
    description:
      "Obserra EPI combines protective intelligence and executive protection context so leaders can identify relevant exposure earlier and act with better information.",
    details: [
      "Executive exposure and protective intelligence",
      "Travel, event, and operational risk planning",
      "Investigative and decision-ready intelligence support",
    ],
    href: "/protection-intelligence",
    linkLabel: "More information",
  },
  {
    number: "04",
    title: "EIOS, Applications & Learning",
    summary: "Enterprise intelligence, secure applications, governed AI capabilities, and professional workforce development.",
    description:
      "Obserra EPI extends advisory and intelligence capability through EIOS, purpose-built applications, governed technology, and structured professional learning. Regulated programs follow separate eligibility and authorization gates.",
    details: [
      "EIOS enterprise intelligence and governed action",
      "Secure enterprise applications and governed AI capabilities",
      "Professional and enterprise learning through Obserra EPI Academy",
    ],
    href: "/eios",
    linkLabel: "More information",
  },
];

const companyValue = [
  ["Earlier visibility", "Identify material threats, control gaps, and decision points before they become larger business consequences."],
  ["Clearer accountability", "Align owners, authority, and next actions so critical work does not stall between functions."],
  ["Defensible decisions", "Support leadership choices with traceable evidence, business context, and governance."],
  ["Measurable follow-through", "Verify what changed, what remains exposed, and where leadership should focus next."],
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero saas-hero--executive">
          <div className="saas-hero__copy saas-hero__copy--executive">
            <p className="saas-eyebrow">EXECUTIVE INTELLIGENCE FOR HIGH-CONSEQUENCE ORGANIZATIONS</p>
            <h1>See risk earlier. Decide faster. Act with proof.</h1>
            <p className="saas-hero__lede">
              Obserra EPI connects executive advisory, cybersecurity, protective intelligence, governance,
              secure technology, and workforce capability so leaders can move from fragmented signals to
              accountable action with greater clarity.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/services">Explore Obserra EPI</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Start a conversation</ButtonLink>
            </div>
            <div className="saas-hero__utility-row">
              <Link href="/ai-marketplace">Shop AI Skills Marketplace →</Link>
              <span>Advisory</span>
              <span>Cybersecurity</span>
              <span>Intelligence</span>
              <span>Technology</span>
            </div>
          </div>
        </section>

        <section className="saas-priority-strip" aria-label="Obserra EPI offerings">
          {capabilities.map((capability) => (
            <article key={capability.title} className="saas-priority-card">
              <ExecutiveInfoModal {...capability} />
            </article>
          ))}
        </section>

        <section className="saas-value-bar" aria-label="Customer value from Obserra EPI">
          {companyValue.map(([title, copy]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
          <div className="saas-value-bar__cta">
            <p>Bring Obserra EPI into the decision before risk becomes consequence.</p>
            <ButtonLink href="/contact?interest=enterprise-consultation">Start a conversation</ButtonLink>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
