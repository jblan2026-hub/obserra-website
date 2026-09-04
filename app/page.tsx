import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "./components/ui/ObserraUI";
import ExecutiveInfoModal from "./components/ui/ExecutiveInfoModal";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "./components/enterprise/EnterpriseChrome";
import {
  ACADEMY_BRAND_NAME,
  APPLICATIONS_BRAND_NAME,
  EIOS_BRAND_NAME,
  LEGAL_ENTITY_NAME,
  PUBLIC_BRAND_NAME,
} from "../lib/legal-identity";
import { marketplaceV12Summary } from "../lib/marketplace-v12-catalog";
import "./saas-home.css";
import "./premium-home.css";
import "./home-executive-visual.css";
import "./home-marketplace-promo.css";

export const metadata: Metadata = {
  title: { absolute: `${PUBLIC_BRAND_NAME} | Executive Intelligence, Cybersecurity & Risk` },
  description:
    `${PUBLIC_BRAND_NAME} advises boards and executive teams on cybersecurity, enterprise risk, protective intelligence, and responsible technology.`,
  alternates: { canonical: "/" },
  keywords: ["executive intelligence", "cybersecurity", "protective intelligence", "AI marketplace", "AI skills", "AI agent packs", "enterprise AI"],
};

const capabilities = [
  {
    title: "Executive Advisory",
    summary: "Practical counsel for boards and executives facing cyber risk, major change, or hard tradeoffs.",
    description: `${PUBLIC_BRAND_NAME} gives executives and boards senior decision support when cybersecurity, operational risk, governance, and transformation priorities converge.`,
    details: ["Executive and board advisory", "Fractional CISO and security leadership", "Enterprise risk, resilience, and transformation strategy"],
    href: "/services",
    linkLabel: "More information",
  },
  {
    title: "Cybersecurity, Risk & Governance",
    summary: "Find the risks that matter, strengthen the right controls, and give leaders evidence they can use.",
    description: `${PUBLIC_BRAND_NAME} helps organizations understand material cyber and governance exposure, establish accountable controls, and turn risk decisions into measurable execution.`,
    details: ["Cybersecurity strategy and operating models", "Risk, compliance, AI governance, and control assurance", "Identity, resilience, incident readiness, and evidence"],
    href: "/services",
    linkLabel: "More information",
  },
  {
    title: "Protection & Intelligence",
    summary: "Spot threats to leaders, travel, operations, and reputation early enough to respond.",
    description: `${PUBLIC_BRAND_NAME} combines protective intelligence and executive protection context so leaders can identify relevant exposure earlier and act with better information.`,
    details: ["Executive exposure and protective intelligence", "Travel, event, and operational risk planning", "Investigative and decision-ready intelligence support"],
    href: "/protection-intelligence",
    linkLabel: "More information",
  },
  {
    title: "EIOS, Applications & Learning",
    summary: "Use EIOS, secure applications, and training to help teams work with new technology responsibly.",
    description: `${PUBLIC_BRAND_NAME} extends advisory and intelligence capability through EIOS, purpose-built applications, governed technology, and structured professional learning. Regulated programs follow separate eligibility and authorization gates.`,
    details: ["EIOS enterprise intelligence and governed action", "Secure enterprise applications and governed AI capabilities", "Professional and enterprise learning through Obserra EPI Academy"],
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
  const marketplaceSummary = marketplaceV12Summary();
  const marketplaceProductCount = marketplaceSummary.total_cards
    - (marketplaceSummary.product_type_counts.collection ?? 0)
    - (marketplaceSummary.product_type_counts.bundle ?? 0);

  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="home-marketplace-promo" aria-labelledby="home-marketplace-promo-title">
          <div className="home-marketplace-promo__copy">
            <p>AI TOOLS FOR ENTERPRISE TEAMS</p>
            <h2 id="home-marketplace-promo-title">Choose AI tools built for serious work.</h2>
            <span>Browse {marketplaceProductCount.toLocaleString()} AI skills, agent packs, workflows, connectors, guardrails, and assurance tools from Obserra EPI. Buy online and receive secure access after payment is confirmed.</span>
          </div>
          <div className="home-marketplace-promo__actions">
            <Link className="home-marketplace-promo__primary" href="/ai-marketplace">Explore the AI Marketplace</Link>
            <Link className="home-marketplace-promo__secondary" href="/ai-marketplace?offering=skills">Browse AI skills</Link>
          </div>
        </section>

        <section className="saas-hero saas-hero--executive executive-brand-hero">
          <div className="executive-brand-hero__grid">
            <div className="saas-hero__copy saas-hero__copy--executive executive-brand-hero__copy">
              <p className="saas-eyebrow">FOR DECISIONS THAT CARRY REAL CONSEQUENCES</p>
              <h1>Clearer decisions when the stakes are high.</h1>
              <p className="saas-hero__lede">{PUBLIC_BRAND_NAME} helps boards and executives make sense of cyber risk, operational threats, and new technology. We bring the right information together, make ownership clear, and help the work move forward.</p>
              <div className="saas-hero__actions">
                <ButtonLink href="/contact?interest=executive-briefing">Start a conversation</ButtonLink>
                <ButtonLink href="/services" variant="secondary">See what we do</ButtonLink>
              </div>
              <div className="saas-hero__utility-row" aria-label={`${PUBLIC_BRAND_NAME} product pathways`}>
                <Link href="/eios">Explore {EIOS_BRAND_NAME}</Link>
                <Link href="/apps">View {APPLICATIONS_BRAND_NAME}</Link>
                <Link href="/ai-marketplace">Shop AI Marketplace</Link>
              </div>
            </div>

            <aside className="executive-brand-visual" aria-label={`${LEGAL_ENTITY_NAME} branded executive visual`}>
              <Image src="/brand/visuals/obserra-core.png" fill sizes="(max-width: 980px) 92vw, 42vw" alt={`${LEGAL_ENTITY_NAME} executive intelligence visual`} priority />
              <div className="executive-brand-visual__identity">
                <Image src="/brand/obserra-logo.png" width={286} height={55} alt={LEGAL_ENTITY_NAME} />
                <strong>{PUBLIC_BRAND_NAME}</strong>
                <span>Cybersecurity, intelligence, protection, and technology for executive teams</span>
              </div>
            </aside>
          </div>
        </section>

        <EnterpriseProofBand />

        <section className="home-capability-ledger" aria-labelledby="home-capabilities-title">
          <div className="home-capability-ledger__heading">
            <div><p>INTEGRATED ENTERPRISE CAPABILITY</p><h2 id="home-capabilities-title">One clear view of the risks that matter.</h2></div>
            <p>Important information often sits in different teams and systems. We help leaders bring it together, decide what comes first, and keep the work moving.</p>
          </div>
          <div className="saas-priority-strip executive-brand-capabilities" aria-label={`${PUBLIC_BRAND_NAME} capabilities`}>
            {capabilities.map((capability) => (
              <article key={capability.title} className="saas-priority-card">
                <ExecutiveInfoModal {...capability} />
              </article>
            ))}
          </div>
        </section>

        <section className="saas-value-bar" aria-label={`Customer value from ${PUBLIC_BRAND_NAME}`}>
          {companyValue.map(([title, copy]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
          <div className="saas-value-bar__cta">
            <p>Have a decision you need to get right?</p>
            <div className="saas-value-bar__actions">
              <ButtonLink href="/contact?interest=executive-briefing">Talk with us</ButtonLink>
              <ButtonLink href="/academy" variant="secondary">Explore {ACADEMY_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/florida-security-training" variant="secondary">Review Florida Class D LMS</ButtonLink>
            </div>
            <small>Reviewed nonregulated course baseline. Regulated programs follow separate eligibility and authorization gates. Applications remain subject to product-specific engagement, deployment, and access controls.</small>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
