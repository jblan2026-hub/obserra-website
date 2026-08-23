import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "./components/ui/ObserraUI";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "./components/enterprise/EnterpriseChrome";
import {
  ACADEMY_BRAND_NAME,
  APPLICATIONS_BRAND_NAME,
  EIOS_BRAND_NAME,
  LEGAL_ENTITY_NAME,
} from "../lib/legal-identity";
import "./saas-home.css";

export const metadata: Metadata = {
  title: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Secure Technology`,
  description:
    `${LEGAL_ENTITY_NAME} provides executive intelligence, cybersecurity, protective intelligence, secure technology, enterprise applications, and professional learning for high-consequence organizations.`,
  alternates: { canonical: "/" },
};

const capabilities = [
  ["01", "Executive Advisory", "Board-ready cyber, risk, governance, resilience, and transformation leadership for material enterprise decisions.", "/services", "Explore advisory"],
  ["02", "Protection and Intelligence", "Protective intelligence, executive exposure, travel risk, and discreet support for leaders and high-consequence operations.", "/protection-intelligence", "Explore protection"],
  ["03", EIOS_BRAND_NAME, "Enterprise intelligence, governed workflows, risk context, evidence, and executive decision support in one operating environment.", "/eios", "Explore EIOS"],
  ["04", ACADEMY_BRAND_NAME, "Professional learning for executives, practitioners, teams, and regulated training use cases with offering-specific controls.", "/academy", "Explore Academy"],
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero">
          <div className="saas-hero__copy">
            <h1>Executive intelligence for consequential decisions.</h1>
            <p>
              {LEGAL_ENTITY_NAME} connects senior judgment, cybersecurity, protective intelligence,
              governance, secure applications, and professional learning so leaders can act from one
              evidence-disciplined operating model.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/ai-marketplace" className="saas-hero__marketplace-cta">Shop AI Skills Marketplace</ButtonLink>
              <ButtonLink href="/eios">Explore {EIOS_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Request executive briefing</ButtonLink>
            </div>
            <div className="saas-hero__proof" aria-label={`${LEGAL_ENTITY_NAME} operating assurances`}>
              <span>Veteran owned</span>
              <span>Executive led</span>
              <span>Evidence disciplined</span>
              <span>Procurement ready</span>
            </div>
          </div>
        </section>

        <section className="saas-direct-sales" aria-labelledby="direct-sales-heading">
          <div className="saas-direct-sales__intro">
            <span>DIRECT FROM {LEGAL_ENTITY_NAME}</span>
            <h2 id="direct-sales-heading">Applications and Academy are direct website destinations.</h2>
            <p>Explore secure applications or governed learning. Each destination maintains its own engagement, approval, access, and release controls.</p>
            <div className="saas-actions">
              <ButtonLink href="/apps">Explore {APPLICATIONS_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/academy" variant="secondary">Browse {ACADEMY_BRAND_NAME}</ButtonLink>
            </div>
          </div>
          <div className="saas-direct-sales__grid">
            <Link href="/apps" className="mission-direct-sales__card">
              <span>{APPLICATIONS_BRAND_NAME.toUpperCase()}</span>
              <h3>Secure software for executive and operational use.</h3>
              <p>Review product capabilities and commercial options directly from the public marketplace.</p>
              <strong>Explore Applications <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/academy" className="mission-direct-sales__card">
              <span>{ACADEMY_BRAND_NAME.toUpperCase()}</span>
              <h3>Professional learning with governed access and completion.</h3>
              <p>Browse the reviewed nonregulated catalog and enterprise learning options. Purchases open only when a course is explicitly activated.</p>
              <strong>Browse Academy <span aria-hidden="true">→</span></strong>
            </Link>
          </div>
        </section>

        <nav className="saas-product-nav" aria-label={`Primary destinations from ${LEGAL_ENTITY_NAME}`}>
          <Link href="/apps"><strong>{APPLICATIONS_BRAND_NAME}</strong><span>Secure software built for executive and operational use.</span></Link>
          <Link href="/academy"><strong>{ACADEMY_BRAND_NAME}</strong><span>Professional learning, enterprise programs, and controlled training.</span></Link>
          <Link href="/florida-security-training"><strong>Florida Class D Training</strong><span>Dedicated regulated-training LMS and student readiness experience.</span></Link>
          <Link href="/eios"><strong>{EIOS_BRAND_NAME}</strong><span>Executive intelligence, governance, risk, and decision support.</span></Link>
          <Link href="/trust"><strong>Trust Center</strong><span>Security, privacy, governance, and procurement assurance.</span></Link>
        </nav>

        <EnterpriseProofBand />

        <section className="saas-section">
          <div className="saas-section__intro">
            <h2>One enterprise partner across intelligence, technology, protection, and learning.</h2>
            <p>
              Start with the mission in front of you. Each capability can operate independently, while
              the operating model from {LEGAL_ENTITY_NAME} connects risk, evidence, ownership, decisions,
              and execution.
            </p>
          </div>
          <div className="saas-capability-list">
            {capabilities.map(([number, title, copy, href, action]) => (
              <Link href={href} className="saas-capability-row" key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <b>{action} →</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="saas-platform">
          <div className="saas-platform__inner">
            <div className="saas-platform__copy">
              <h2>{EIOS_BRAND_NAME} turns fragmented enterprise signals into accountable action.</h2>
              <p>
                The Executive Intelligence Operating System from {LEGAL_ENTITY_NAME} is designed to connect
                enterprise context, controls, evidence, risk, intelligence, decisions, and implementation
                without replacing the systems organizations already depend on.
              </p>
              <div className="saas-platform__list">
                <div><b>01</b><span>Executive Mission Control and enterprise health</span></div>
                <div><b>02</b><span>Organizational risk and control intelligence</span></div>
                <div><b>03</b><span>Global digital twin and emerging intelligence</span></div>
                <div><b>04</b><span>Board reporting, recommendations, and implementation roadmaps</span></div>
              </div>
              <div className="saas-actions">
                <ButtonLink href="/eios">Explore {EIOS_BRAND_NAME}</ButtonLink>
                <ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request an EIOS briefing</ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <div className="saas-assurance" aria-label="Enterprise delivery principles">
          <div><strong>Executive judgment</strong><span>Senior leadership at the point of material enterprise decisions.</span></div>
          <div><strong>Evidence traceability</strong><span>Controls, findings, recommendations, and outcomes designed to survive scrutiny.</span></div>
          <div><strong>Secure delivery</strong><span>Identity, access, information handling, and release boundaries treated as product requirements.</span></div>
          <div><strong>Measurable execution</strong><span>Ownership, implementation, and verification carried through to action.</span></div>
        </div>

        <section className="saas-section saas-learning">
          <div className="saas-learning__copy">
            <h2>Learning built as a product, not a content library.</h2>
            <p>
              {ACADEMY_BRAND_NAME}, a learning product from {LEGAL_ENTITY_NAME}, combines professional learning
              with controlled enrollment, protected access, assessment, completion records, and enterprise learning
              options. Regulated programs follow separate eligibility and authorization gates. Identity, attendance,
              reporting, and completion controls remain offering-specific.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/academy">Browse {ACADEMY_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/academy/enterprise" variant="secondary">Plan enterprise learning</ButtonLink>
            </div>
          </div>
          <div className="saas-learning__routes">
            <Link href="/academy"><span><strong>{ACADEMY_BRAND_NAME}</strong><span>Self-paced and enterprise learning catalog.</span></span><b>Open →</b></Link>
            <Link href="/florida-security-training"><span><strong>Florida Class D LMS</strong><span>Dedicated regulated-training environment with live-instruction controls.</span></span><b>Open →</b></Link>
            <Link href="/apps"><span><strong>{APPLICATIONS_BRAND_NAME}</strong><span>Enterprise software with product-specific engagement, deployment, and access controls.</span></span><b>Open →</b></Link>
          </div>
        </section>

        <section className="saas-section saas-proof">
          <div className="saas-proof__copy">
            <h2>Built around leadership credibility and operational depth.</h2>
            <p>
              {LEGAL_ENTITY_NAME} combines Fortune 500 cybersecurity leadership, military intelligence and operational
              experience, governance discipline, and secure technology engineering. The result is an enterprise
              partner designed for work where consequence, accountability, and trust matter.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/about">Review leadership credentials</ButtonLink>
              <ButtonLink href="/trust" variant="secondary">Visit the Trust Center</ButtonLink>
            </div>
          </div>
          <div className="saas-proof__stats">
            <div><strong>2×</strong><span>Fortune 500 Chief Information Security Officer experience</span></div>
            <div><strong>21</strong><span>Years of U.S. Army service</span></div>
            <div><strong>3</strong><span>Top Global CISO recognitions</span></div>
            <div><strong>60</strong><span>Reviewed nonregulated course baseline</span></div>
          </div>
        </section>

        <section className="saas-final">
          <div>
            <h2>Bring {LEGAL_ENTITY_NAME} into the decision before risk becomes consequence.</h2>
            <p>
              Engage {LEGAL_ENTITY_NAME} for executive advisory, protective intelligence, {EIOS_BRAND_NAME},
              {" "}{APPLICATIONS_BRAND_NAME}, or {ACADEMY_BRAND_NAME} through one controlled enterprise conversation.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/contact?interest=enterprise-consultation">Request executive consultation</ButtonLink>
              <ButtonLink href="/trust" variant="secondary">Review enterprise assurance</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
