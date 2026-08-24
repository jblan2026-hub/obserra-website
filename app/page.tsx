import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "./components/ui/ObserraUI";
import ExecutiveInfoModal from "./components/ui/ExecutiveInfoModal";
import { EnterpriseFooter, EnterpriseHeader } from "./components/enterprise/EnterpriseChrome";
import {
  ACADEMY_BRAND_NAME,
  APPLICATIONS_BRAND_NAME,
  EIOS_BRAND_NAME,
  LEGAL_ENTITY_NAME,
} from "../lib/legal-identity";
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
    summary: "Cyber risk, governance, resilience, transformation, and board-level decision support.",
    description:
      "Senior-level advisory for leaders who need to convert complex technology and risk conditions into clear decisions, accountable ownership, and executable priorities.",
    details: [
      "Board and executive cyber-risk advisory",
      "Governance, resilience, and transformation strategy",
      "Decision support grounded in business impact and evidence",
    ],
    href: "/services",
    linkLabel: "Explore Executive Advisory",
  },
  {
    number: "02",
    title: "Protection & Intelligence",
    summary: "Protective intelligence, executive exposure, travel risk, and high-consequence support.",
    description:
      "Focused intelligence and protection support designed to help organizations identify exposure earlier and make informed decisions around people, travel, events, and operational risk.",
    details: [
      "Executive and organizational exposure assessment",
      "Protective intelligence and travel-risk support",
      "Decision-ready intelligence for high-consequence operations",
    ],
    href: "/protection-intelligence",
    linkLabel: "Explore Protection & Intelligence",
  },
  {
    number: "03",
    title: EIOS_BRAND_NAME,
    summary: "Enterprise context, risk, evidence, decisions, and governed action in one executive environment.",
    description:
      `${EIOS_BRAND_NAME} is designed to connect enterprise signals, controls, evidence, risk, dependencies, and decisions so leaders can move from fragmented information to governed action.`,
    details: [
      "Enterprise health and risk context",
      "Evidence, controls, dependencies, and decision traceability",
      "Governed action with measurable outcomes",
    ],
    href: "/eios",
    linkLabel: "Explore EIOS",
  },
  {
    number: "04",
    title: ACADEMY_BRAND_NAME,
    summary: "Professional learning and regulated training designed for practical performance.",
    description:
      `${ACADEMY_BRAND_NAME} provides structured professional learning for individuals and teams with controlled enrollment, assessment, and completion records. Regulated programs follow separate eligibility and authorization gates.`,
    details: [
      "Professional cybersecurity, intelligence, governance, and protection learning",
      "Enterprise learning options for teams",
      "Offering-specific controls for regulated programs",
    ],
    href: "/academy",
    linkLabel: "Browse Academy",
  },
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero saas-hero--executive">
          <div className="saas-hero__copy saas-hero__copy--executive">
            <p className="saas-eyebrow">EXECUTIVE ADVISORY · ENTERPRISE RISK · PROTECTIVE INTELLIGENCE</p>
            <h1>Clarity for decisions that carry consequence.</h1>
            <p className="saas-hero__lede">
              {LEGAL_ENTITY_NAME} helps senior leaders navigate cyber risk, organizational exposure,
              governance, transformation, and protective intelligence with executive judgment,
              disciplined execution, and evidence that stands up to scrutiny.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/services">Explore capabilities</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Talk with an executive advisor</ButtonLink>
            </div>
            <div className="saas-hero__utility-row">
              <Link href="/ai-marketplace">Shop AI Skills Marketplace →</Link>
              <span>Veteran owned</span>
              <span>Executive led</span>
              <span>Evidence backed</span>
            </div>
          </div>
        </section>

        <section className="saas-priority-strip" aria-label="Primary Obserra capabilities">
          {capabilities.map((capability) => (
            <article key={capability.title} className="saas-priority-card">
              <ExecutiveInfoModal {...capability} />
            </article>
          ))}
        </section>

        <section className="saas-compact-grid">
          <article className="saas-compact-card saas-compact-card--feature">
            <p className="saas-eyebrow">{EIOS_BRAND_NAME}</p>
            <h2>Connect enterprise risk to executive action.</h2>
            <p>Bring controls, evidence, risk, dependencies, and decision priorities into one governed operating picture.</p>
            <div className="saas-actions">
              <ButtonLink href="/eios">Explore EIOS</ButtonLink>
              <ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request a briefing</ButtonLink>
            </div>
          </article>

          <article className="saas-compact-card">
            <p className="saas-eyebrow">{APPLICATIONS_BRAND_NAME}</p>
            <h2>Secure software for focused enterprise outcomes.</h2>
            <p>Secure software with product-specific engagement, deployment, and access controls.</p>
            <Link href="/apps" className="saas-text-action">Explore Applications →</Link>
          </article>

          <article className="saas-compact-card">
            <p className="saas-eyebrow">{ACADEMY_BRAND_NAME}</p>
            <h2>Practical learning for professionals and teams.</h2>
            <p>Professional learning with controlled enrollment, assessment, and completion records.</p>
            <Link href="/academy" className="saas-text-action">Browse Academy →</Link>
          </article>
        </section>

        <section className="saas-credibility-bar">
          <div><strong>2×</strong><span>Fortune 500 CISO experience</span></div>
          <div><strong>21</strong><span>Years of U.S. Army service</span></div>
          <div><strong>3</strong><span>Top Global CISO recognitions</span></div>
          <div><strong>60</strong><span>Reviewed nonregulated course baseline</span></div>
          <div className="saas-credibility-bar__cta">
            <p>Need senior-level support on a consequential decision?</p>
            <ButtonLink href="/contact?interest=enterprise-consultation">Start a conversation</ButtonLink>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
