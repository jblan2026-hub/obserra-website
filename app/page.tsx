import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "./components/ui/ObserraUI";
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
  ["01", "Executive Advisory", "Cyber risk, governance, resilience, transformation, and board-level decision support.", "/services"],
  ["02", "Protection & Intelligence", "Protective intelligence, executive exposure, travel risk, and high-consequence support.", "/protection-intelligence"],
  ["03", EIOS_BRAND_NAME, "Enterprise context, risk, evidence, decisions, and governed action in one executive environment.", "/eios"],
  ["04", ACADEMY_BRAND_NAME, "Professional learning and regulated training designed for practical performance.", "/academy"],
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
          {capabilities.map(([number, title, copy, href]) => (
            <Link href={href} key={title} className="saas-priority-card">
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
              <b>Explore →</b>
            </Link>
          ))}
        </section>

        <section className="saas-compact-grid">
          <article className="saas-compact-card saas-compact-card--feature">
            <p className="saas-eyebrow">{EIOS_BRAND_NAME}</p>
            <h2>Connect enterprise risk to executive action.</h2>
            <p>
              Bring controls, evidence, risk, dependencies, and decision priorities into one governed operating picture.
            </p>
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
            <p>
              Professional learning with controlled enrollment, assessment, and completion records.
              Regulated programs follow separate eligibility and authorization gates.
            </p>
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
