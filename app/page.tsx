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
    summary: "Turn cyber, governance, resilience, and transformation complexity into clear executive priorities.",
    description:
      "Obserra EPI helps leadership teams move from fragmented risk signals to clear priorities, accountable ownership, and decisions that can be defended and executed.",
    details: [
      "Executive and board-level decision support",
      "Cyber, governance, resilience, and transformation strategy",
      "Business-focused priorities backed by evidence",
    ],
    href: "/services",
    linkLabel: "Explore Executive Advisory",
  },
  {
    number: "02",
    title: "Protection & Intelligence",
    summary: "Identify exposure earlier and support faster decisions around people, travel, events, and operations.",
    description:
      "Obserra EPI brings protective intelligence and risk context together so organizations can identify relevant exposure earlier and make informed decisions before risk becomes consequence.",
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
    summary: "Connect enterprise context, risk, evidence, decisions, and governed action in one executive environment.",
    description:
      `${EIOS_BRAND_NAME} is designed to give leaders a clearer operating picture by connecting enterprise signals, controls, evidence, risk, dependencies, and decisions in one governed environment.`,
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
    summary: "Build practical professional capability through structured learning for individuals and teams.",
    description:
      `${ACADEMY_BRAND_NAME} extends Obserra EPI capability into the workforce with structured professional learning, enterprise programs, assessment, and completion controls. Regulated programs follow separate eligibility and authorization gates.`,
    details: [
      "Professional cybersecurity, intelligence, governance, and protection learning",
      "Enterprise learning options for teams",
      "Offering-specific controls for regulated programs",
    ],
    href: "/academy",
    linkLabel: "Browse Academy",
  },
];

const companyValue = [
  ["Integrated view", "Connect cyber, intelligence, governance, protection, and business context."],
  ["Decision clarity", "Prioritize what matters and give leadership a defensible path forward."],
  ["Governed execution", "Translate decisions into owners, controls, evidence, and measurable action."],
  ["Enterprise capability", "Combine advisory, software, EIOS, applications, and professional learning."],
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero saas-hero--executive">
          <div className="saas-hero__copy saas-hero__copy--executive">
            <p className="saas-eyebrow">OBSERRA EPI · EXECUTIVE INTELLIGENCE · ENTERPRISE RISK · SECURE TECHNOLOGY</p>
            <h1>Bring intelligence, governance, and execution together.</h1>
            <p className="saas-hero__lede">
              Obserra EPI gives high-consequence organizations one operating partner across executive advisory,
              cybersecurity, protective intelligence, secure applications, enterprise intelligence, and workforce capability—
              helping leaders see risk more clearly, decide with confidence, and move from decision to controlled action.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/services">Explore what Obserra EPI brings</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Start a conversation</ButtonLink>
            </div>
            <div className="saas-hero__utility-row">
              <Link href="/ai-marketplace">Shop AI Skills Marketplace →</Link>
              <span>Advisory</span>
              <span>Intelligence</span>
              <span>Applications</span>
              <span>Learning</span>
            </div>
          </div>
        </section>

        <section className="saas-priority-strip" aria-label="Primary Obserra EPI capabilities">
          {capabilities.map((capability) => (
            <article key={capability.title} className="saas-priority-card">
              <ExecutiveInfoModal {...capability} />
            </article>
          ))}
        </section>

        <section className="saas-compact-grid">
          <article className="saas-compact-card saas-compact-card--feature">
            <p className="saas-eyebrow">{EIOS_BRAND_NAME}</p>
            <h2>Turn fragmented enterprise signals into a clearer operating picture.</h2>
            <p>Connect controls, evidence, risk, dependencies, and decision priorities so leaders can govern what happens next.</p>
            <div className="saas-actions">
              <ButtonLink href="/eios">Explore EIOS</ButtonLink>
              <ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request a briefing</ButtonLink>
            </div>
          </article>

          <article className="saas-compact-card">
            <p className="saas-eyebrow">{APPLICATIONS_BRAND_NAME}</p>
            <h2>Put focused enterprise capabilities to work.</h2>
            <p>Secure software designed around specific operational, governance, and enterprise outcomes.</p>
            <Link href="/apps" className="saas-text-action">Explore Applications →</Link>
          </article>

          <article className="saas-compact-card">
            <p className="saas-eyebrow">{ACADEMY_BRAND_NAME}</p>
            <h2>Extend capability into the workforce.</h2>
            <p>Professional learning for individuals and teams with structured enrollment, assessment, and completion.</p>
            <Link href="/academy" className="saas-text-action">Browse Academy →</Link>
          </article>
        </section>

        <section className="saas-value-bar" aria-label="What Obserra EPI brings">
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
