import type { Metadata } from "next";
import Image from "next/image";
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
import "./premium-home.css";

export const metadata: Metadata = {
  title: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Secure Technology`,
  description:
    `${LEGAL_ENTITY_NAME} helps high-consequence organizations connect cybersecurity, protective intelligence, governance, secure technology, and executive decision support.`,
  alternates: { canonical: "/" },
};

const capabilities = [
  ["01", "Executive Advisory", "Turn cyber, governance, resilience, and transformation complexity into board-ready decisions and executable priorities.", "/services", "Explore advisory"],
  ["02", "Protection and Intelligence", "Identify exposure earlier, understand what matters, and protect leaders and operations with disciplined intelligence support.", "/protection-intelligence", "Explore protection"],
  ["03", EIOS_BRAND_NAME, "Connect enterprise context, risk, evidence, decisions, and governed action in one executive intelligence environment.", "/eios", "Explore EIOS"],
  ["04", ACADEMY_BRAND_NAME, "Build practical capability for executives, practitioners, teams, and regulated training environments through governed learning experiences.", "/academy", "Explore Academy"],
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="saas-home enterprise-page-main">
        <section className="saas-hero">
          <div className="saas-hero__copy">
            <p className="saas-eyebrow">EXECUTIVE INTELLIGENCE FOR HIGH-CONSEQUENCE ORGANIZATIONS</p>
            <h1>See risk earlier. Decide faster. Act with proof.</h1>
            <p className="saas-hero__lede">
              {LEGAL_ENTITY_NAME} connects cybersecurity, protective intelligence, governance,
              secure technology, and executive judgment into one disciplined operating picture—so
              leaders can move from fragmented signals to accountable action with greater clarity.
            </p>
            <div className="saas-hero__actions">
              <ButtonLink href="/eios">Explore {EIOS_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/contact?interest=enterprise-consultation" variant="secondary">Talk with an executive advisor</ButtonLink>
            </div>
            <Link href="/ai-marketplace" className="saas-hero__marketplace-link">
              <span>AI SKILLS MARKETPLACE</span>
              <strong>Shop AI Skills Marketplace</strong>
              <b aria-hidden="true">↗</b>
            </Link>
            <div className="saas-hero__proof" aria-label={`${LEGAL_ENTITY_NAME} operating assurances`}>
              <span>Veteran owned</span>
              <span>Executive led</span>
              <span>Evidence backed</span>
              <span>Built for consequential work</span>
            </div>
          </div>

          <div className="saas-hero__visual-shell" aria-label="Executive intelligence signal model">
            <div className="saas-hero__constellation" aria-hidden="true">
              <span className="signal-core"><i>O</i></span>
              <span className="signal-ring signal-ring--one" />
              <span className="signal-ring signal-ring--two" />
              <span className="signal-ring signal-ring--three" />
              <span className="signal-node signal-node--one" />
              <span className="signal-node signal-node--two" />
              <span className="signal-node signal-node--three" />
              <span className="signal-node signal-node--four" />
              <span className="signal-axis signal-axis--x" />
              <span className="signal-axis signal-axis--y" />
            </div>
            <div className="saas-hero__signal" aria-label="Obserra operating model">
              <span><small>01</small><strong>Observe</strong><em>Context and exposure</em></span>
              <span><small>02</small><strong>Decide</strong><em>Evidence and authority</em></span>
              <span><small>03</small><strong>Execute</strong><em>Controlled action</em></span>
              <span><small>04</small><strong>Verify</strong><em>Outcome and evidence</em></span>
            </div>
            <div className="saas-hero__disclosure">
              <strong>Decision architecture</strong>
              <span>A conceptual signal model for the Obserra operating philosophy. No customer data, credentials, or protected production architecture is displayed.</span>
            </div>
          </div>
        </section>

        <section className="saas-direct-sales" aria-labelledby="direct-sales-heading">
          <div className="saas-direct-sales__intro">
            <span>ONE COMPANY. MULTIPLE WAYS TO ENGAGE.</span>
            <h2 id="direct-sales-heading">From executive advisory to software to workforce capability.</h2>
            <p>
              Engage {LEGAL_ENTITY_NAME} at the level the mission requires. Advisory, applications, intelligence,
              and learning can stand alone or work together around the same evidence-driven operating philosophy.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/apps">Explore {APPLICATIONS_BRAND_NAME}</ButtonLink>
              <ButtonLink href="/academy" variant="secondary">Browse {ACADEMY_BRAND_NAME}</ButtonLink>
            </div>
          </div>
          <div className="saas-direct-sales__grid">
            <Link href="/apps" className="mission-direct-sales__card">
              <span>{APPLICATIONS_BRAND_NAME.toUpperCase()}</span>
              <h3>Put governed intelligence to work.</h3>
              <p>Explore secure applications designed to help leaders and operating teams turn complex requirements into controlled execution.</p>
              <strong>Explore Applications <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/academy" className="mission-direct-sales__card">
              <span>{ACADEMY_BRAND_NAME.toUpperCase()}</span>
              <h3>Build capability that transfers to the mission.</h3>
              <p>Develop practical cybersecurity, intelligence, protection, governance, and technology skills through structured professional learning.</p>
              <strong>Browse Academy <span aria-hidden="true">→</span></strong>
            </Link>
          </div>
        </section>

        <nav className="saas-product-nav" aria-label={`Primary destinations from ${LEGAL_ENTITY_NAME}`}>
          <Link href="/apps"><strong>{APPLICATIONS_BRAND_NAME}</strong><span>Secure software for executive and operational workflows.</span></Link>
          <Link href="/academy"><strong>{ACADEMY_BRAND_NAME}</strong><span>Professional learning built around applied capability.</span></Link>
          <Link href="/florida-security-training"><strong>Florida Class D Training</strong><span>Dedicated regulated training and student readiness.</span></Link>
          <Link href="/eios"><strong>{EIOS_BRAND_NAME}</strong><span>Enterprise intelligence, decisions, governed action, and proof.</span></Link>
          <Link href="/trust"><strong>Trust Center</strong><span>Security, privacy, governance, and procurement assurance.</span></Link>
        </nav>

        <EnterpriseProofBand />

        <section className="saas-section saas-capabilities">
          <div className="saas-section__intro">
            <div>
              <p className="saas-eyebrow">OPERATE WITH A CLEARER PICTURE</p>
              <h2>One enterprise partner across intelligence, technology, protection, and learning.</h2>
            </div>
            <p>
              Start with the decision or exposure in front of you. {LEGAL_ENTITY_NAME} brings together the right mix of executive
              judgment, evidence, technology, and implementation support without forcing every problem into the same solution.
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
              <p className="saas-eyebrow">ENTERPRISE INTELLIGENCE OPERATING SYSTEM</p>
              <h2>Turn fragmented enterprise signals into executive advantage.</h2>
              <p>
                {EIOS_BRAND_NAME} is designed to connect enterprise context, controls, evidence, risk,
                intelligence, decisions, and implementation so leaders can see what matters, govern what happens next,
                and verify whether the intended outcome was actually achieved.
              </p>
              <div className="saas-platform__list">
                <div><b>01</b><span>See enterprise health, risk, and decision priorities in context</span></div>
                <div><b>02</b><span>Connect controls, evidence, dependencies, and business impact</span></div>
                <div><b>03</b><span>Model scenarios and surface emerging intelligence</span></div>
                <div><b>04</b><span>Move from authorized action to independently verified outcomes</span></div>
              </div>
              <div className="saas-actions">
                <ButtonLink href="/eios">See EIOS in action</ButtonLink>
                <ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request an EIOS briefing</ButtonLink>
              </div>
            </div>
            <Link href="/eios" className="saas-platform__visual" aria-label={`Explore ${EIOS_BRAND_NAME}`}>
              <Image
                src="/brand/visuals/obserra-eios.png"
                alt={`${EIOS_BRAND_NAME} product experience`}
                width={1344}
                height={768}
                sizes="(max-width: 1040px) 92vw, 52vw"
              />
              <span>Controlled EIOS product view</span>
            </Link>
          </div>
        </section>

        <div className="saas-assurance" aria-label="Enterprise delivery principles">
          <div><strong>Executive judgment</strong><span>Senior leadership at the point where risk becomes a business decision.</span></div>
          <div><strong>Evidence traceability</strong><span>Make decisions from context that can be explained, challenged, and defended.</span></div>
          <div><strong>Secure delivery</strong><span>Treat identity, access, information handling, and release boundaries as product requirements.</span></div>
          <div><strong>Measurable execution</strong><span>Carry ownership through implementation and verify what actually changed.</span></div>
        </div>

        <section className="saas-section saas-learning">
          <div className="saas-learning__copy">
            <p className="saas-eyebrow">OBSERRA ACADEMY</p>
            <h2>Build professionals who can perform when the decision matters.</h2>
            <p>
              {ACADEMY_BRAND_NAME} combines professional learning with controlled enrollment, protected access,
              assessment, completion records, and enterprise learning options. The focus is practical capability—helping
              people apply cybersecurity, intelligence, protection, governance, and technology concepts in real operating environments.
              Regulated programs follow separate eligibility and authorization gates.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/academy">Explore Academy</ButtonLink>
              <ButtonLink href="/academy/enterprise" variant="secondary">Plan enterprise learning</ButtonLink>
            </div>
          </div>
          <div className="saas-learning__routes">
            <Link href="/academy"><span><strong>{ACADEMY_BRAND_NAME}</strong><span>Professional courses for individual and enterprise learners.</span></span><b>Explore →</b></Link>
            <Link href="/florida-security-training"><span><strong>Florida Class D Training</strong><span>Dedicated regulated training with offering-specific controls.</span></span><b>Explore →</b></Link>
            <Link href="/apps"><span><strong>{APPLICATIONS_BRAND_NAME}</strong><span>Put secure software and governed workflows into operation.</span></span><b>Explore →</b></Link>
          </div>
        </section>

        <section className="saas-section saas-proof">
          <div className="saas-proof__copy">
            <p className="saas-eyebrow">EXPERIENCE THAT SURVIVES SCRUTINY</p>
            <h2>Built for leaders who cannot afford shallow answers.</h2>
            <p>
              {LEGAL_ENTITY_NAME} combines Fortune 500 cybersecurity leadership, military intelligence and operational
              experience, governance discipline, and secure technology engineering. The value is not more noise—it is a stronger
              decision process, clearer accountability, and execution that can be defended.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/about">Meet the leadership</ButtonLink>
              <ButtonLink href="/trust" variant="secondary">Review enterprise assurance</ButtonLink>
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
            <p className="saas-eyebrow">WHEN THE DECISION MATTERS</p>
            <h2>Bring {LEGAL_ENTITY_NAME} in before uncertainty becomes consequence.</h2>
            <p>
              Start with the decision, exposure, or transformation you need to solve. We will align the right combination
              of advisory, intelligence, secure technology, applications, or learning around the outcome that matters.
            </p>
            <div className="saas-actions">
              <ButtonLink href="/contact?interest=enterprise-consultation">Start an executive conversation</ButtonLink>
              <ButtonLink href="/services" variant="secondary">Explore services</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
