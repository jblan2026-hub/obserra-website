import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink, KpiCard, StatusBadge } from "./components/ui/ObserraUI";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "./components/enterprise/EnterpriseChrome";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import "./executive-mission-control.css";
import "./executive-mission-control-polish.css";
import "./homepage-direct-sales.css";
import "./premium-saas-home.css";

export const metadata: Metadata = {
  title: `${LEGAL_ENTITY_NAME} | Cybersecurity, Intelligence and Secure Technology`,
  description:
    `${LEGAL_ENTITY_NAME} provides executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning for regulated and high-consequence organizations.`,
  alternates: { canonical: "/" },
};

const pathways = [
  ["01", "Executive Advisory", "Board-ready cyber, risk, governance, resilience, and transformation leadership for decisions with material consequence.", "/services", "Explore advisory"],
  ["02", "Protection and Intelligence", "Protective intelligence, executive exposure, travel risk, and discreet operational support for leaders and high-consequence missions.", "/protection-intelligence", "Explore protection"],
  ["03", "EIOS and Secure Technology", "Enterprise intelligence, governed workflows, evidence, and executive decision support in one operating environment.", "/eios", "Explore EIOS"],
  ["04", "Obserra Academy", "Professional learning for executives, practitioners, teams, and regulated training use cases with controls matched to each offering.", "/academy", "Explore learning"],
];

const domains = [
  ["CYBER", "Cyber Risk", "Translate technical exposure into business consequence, investment priority, and accountable action."],
  ["AI", "AI Governance", "Establish policy, inventory, approval, control, evidence, and oversight for enterprise artificial intelligence use."],
  ["EXECUTIVE", "Executive Protection", "Connect digital exposure, travel conditions, physical threats, and protective planning."],
  ["RISK", "Organizational Risk", "Correlate operational, regulatory, financial, technology, and people risk across the enterprise."],
  ["BOARD", "Board Intelligence", "Produce concise, defensible reporting focused on material risk, ownership, movement, and decisions."],
  ["RESILIENCE", "Operational Resilience", "Improve readiness, response, continuity, recovery, and executive coordination under pressure."],
];

export default function HomePage() {
  return (
    <>
      <EnterpriseHeader section="Executive intelligence" />
      <main className="mission-home enterprise-page-main">
        <section className="mission-hero" aria-labelledby="home-hero-title">
          <div className="mission-hero__visual" aria-hidden="true">
            <Image src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" fill priority sizes="100vw" />
          </div>

          <div className="mission-hero__copy">
            <p className="obs-eyebrow">EXECUTIVE INTELLIGENCE · CYBERSECURITY · PROTECTIVE INTELLIGENCE</p>
            <h1 id="home-hero-title">Higher-confidence decisions for organizations operating under consequence.</h1>
            <p>{LEGAL_ENTITY_NAME} unifies executive judgment, cyber risk, protective intelligence, governance, secure technology, and professional learning so leaders can move from fragmented signals to clear, accountable action.</p>
            <div className="mission-hero__actions">
              <ButtonLink href="/contact?interest=enterprise-consultation">Request executive briefing</ButtonLink>
              <ButtonLink href="/eios" variant="secondary">Explore Obserra EIOS</ButtonLink>
            </div>
            <div className="mission-assurance" aria-label={`${LEGAL_ENTITY_NAME} operating assurances`}>
              <span>Veteran owned</span><span>Executive led</span><span>Evidence disciplined</span><span>Procurement ready</span>
            </div>
          </div>

          <div className="mission-console-shell">
            <aside className="mission-console" aria-label="Illustrative Executive Mission Control preview">
              <div className="mission-console__top">
                <div><span>EXECUTIVE MISSION CONTROL</span><strong>Enterprise posture overview</strong></div>
                <StatusBadge tone="neutral">Illustrative preview</StatusBadge>
              </div>
              <p className="mission-console__disclosure">Representative interface and values only. This preview is not a live customer environment.</p>
              <div className="mission-kpis">
                <KpiCard label="Enterprise Health" value="87" trend="Improving" status="Strong" statusTone="success"><div className="mission-spark" /></KpiCard>
                <KpiCard label="Cyber Risk" value="28" trend="6 points lower" status="Managed" statusTone="success"><div className="mission-spark" /></KpiCard>
                <KpiCard label="AI Governance" value="74" trend="Controls expanding" status="Attention" statusTone="warning"><div className="mission-spark" /></KpiCard>
                <KpiCard label="Executive Exposure" value="Low" trend="No critical change" status="Monitored" statusTone="neutral"><div className="mission-spark" /></KpiCard>
              </div>
            </aside>
          </div>
        </section>

        <EnterpriseProofBand />

        <section className="mission-section mission-section--tight" aria-labelledby="mission-pathways-heading">
          <div className="mission-heading">
            <div><p className="obs-eyebrow">ONE OPERATING MODEL</p><h2 id="mission-pathways-heading">Advice, intelligence, technology, and learning without the handoff gaps.</h2></div>
            <p>Start with the capability you need now. Expand into a connected operating model when the mission requires broader context, governance, evidence, or implementation support.</p>
          </div>
          <div className="mission-paths">
            {pathways.map(([number, title, copy, href, action]) => (
              <Link href={href} className="mission-path" key={title}>
                <div><span>{number}</span><h3>{title}</h3><p>{copy}</p></div><strong>{action} →</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="mission-section mission-platform" aria-labelledby="eios-platform-heading">
          <div className="mission-platform__copy">
            <p className="obs-eyebrow">FLAGSHIP PLATFORM</p>
            <h2 id="eios-platform-heading">Executive intelligence, governance, and execution in one operating environment.</h2>
            <p>Obserra EIOS is designed to connect enterprise context, controls, evidence, risk, intelligence, decisions, and implementation. Leaders get a consistent view of what matters, why it matters, who owns it, and what action should happen next.</p>
            <div className="mission-platform__list">
              <span>Executive Mission Control and enterprise health</span>
              <span>Organizational risk and control intelligence</span>
              <span>Global digital twin and emerging intelligence</span>
              <span>Board reporting, recommendations, and implementation roadmaps</span>
            </div>
            <div className="mission-hero__actions"><ButtonLink href="/eios">Explore the platform</ButtonLink><ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request an EIOS briefing</ButtonLink></div>
          </div>
          <Link href="/eios" className="mission-platform__visual" aria-label="Explore the Obserra EIOS platform">
            <Image src="/eios/eios-overview-marketing.png" width={1200} height={675} alt="Obserra EIOS executive dashboard showing enterprise intelligence" sizes="(max-width: 1100px) 100vw, 55vw" />
          </Link>
        </section>

        <section className="mission-section" aria-labelledby="risk-domain-heading">
          <div className="mission-heading">
            <div><p className="obs-eyebrow">ENTERPRISE RISK DOMAINS</p><h2 id="risk-domain-heading">See the decision in context, not another isolated control or report.</h2></div>
            <p>{LEGAL_ENTITY_NAME} correlates risk across functions so executives can evaluate consequence, confidence, urgency, ownership, and expected value in one context.</p>
          </div>
          <div className="mission-domains">
            {domains.map(([label, title, copy]) => <article className="mission-domain" key={title}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="mission-section mission-proof" aria-label="Obserra executive experience and operating model">
          <article>
            <p className="obs-eyebrow">WHY OBSERRA</p>
            <h3>Executive judgment backed by technical depth, intelligence discipline, governance, and operational experience.</h3>
            <p>{LEGAL_ENTITY_NAME} is built for organizations that need more than a narrow assessment. Senior leadership, evidence-backed recommendations, secure technology, and implementation discipline are combined so advice can survive scrutiny and produce measurable outcomes.</p>
            <div className="mission-hero__actions"><ButtonLink href="/about">Review executive credentials</ButtonLink><ButtonLink href="/trust" variant="secondary">Visit the Trust Center</ButtonLink></div>
          </article>
          <article>
            <div className="mission-proof__stats">
              <div><strong>2×</strong><span>Fortune 500 Chief Information Security Officer experience</span></div>
              <div><strong>21</strong><span>Years of U.S. Army service</span></div>
              <div><strong>3</strong><span>Top Global CISO recognitions</span></div>
              <div><strong>60</strong><span>Reviewed nonregulated course baseline</span></div>
            </div>
          </article>
        </section>

        <section className="mission-direct-sales" aria-labelledby="direct-sales-heading">
          <div className="mission-direct-sales__heading">
            <div><p className="obs-eyebrow">DIRECT FROM OBSERRA</p><h2 id="direct-sales-heading">Buy software and learning without entering the platform.</h2></div>
            <p>Applications and Academy remain direct website destinations with their own purchase, identity, entitlement, and approval controls.</p>
          </div>
          <div className="mission-direct-sales__grid">
            <Link href="/apps" className="mission-direct-sales__card">
              <span>APPLICATIONS MARKETPLACE</span>
              <h3>Secure applications for executive operations.</h3>
              <p>Review product capabilities and commercial options directly from the public marketplace.</p>
              <strong>Shop Applications <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/academy" className="mission-direct-sales__card">
              <span>OBSERRA ACADEMY</span>
              <h3>Professional learning with governed access.</h3>
              <p>Browse available learning pathways. Regulated programs use separate eligibility, identity, delivery, assessment, and completion controls.</p>
              <strong>Browse Academy <span aria-hidden="true">→</span></strong>
            </Link>
          </div>
        </section>

        <section className="mission-section">
          <div className="mission-academy">
            <div><p className="obs-eyebrow">OBSERRA ACADEMY</p><h2>Build capability for the decisions that matter now.</h2><p>Review professional course and enterprise learning options, then confirm the enrollment, delivery, assessment, and completion controls that apply to the selected offering.</p><div className="mission-hero__actions"><ButtonLink href="/academy">Explore Academy courses</ButtonLink><ButtonLink href="/academy/enterprise" variant="secondary">Plan enterprise learning</ButtonLink></div></div>
            <div className="mission-academy__steps"><span><b>1</b>Define the audience and required capability</span><span><b>2</b>Select an available course or learning path</span><span><b>3</b>Confirm enrollment and delivery requirements</span><span><b>4</b>Measure learning against the published standard</span></div>
          </div>
        </section>

        <section className="mission-final">
          <p className="obs-eyebrow">START WITH THE DECISION IN FRONT OF YOU</p>
          <h2>Bring Obserra into the mission before risk becomes consequence.</h2>
          <p>Engage for executive advisory, protective intelligence, EIOS, secure technology, or professional learning through one controlled enterprise conversation.</p>
          <div className="mission-hero__actions"><ButtonLink href="/contact?interest=enterprise-consultation">Request executive consultation</ButtonLink><ButtonLink href="/trust" variant="secondary">Review the Trust Center</ButtonLink></div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
