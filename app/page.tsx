import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "./HomeHeader";
import { ButtonLink, KpiCard, StatusBadge } from "./components/ui/ObserraUI";
import "./executive-mission-control.css";
import "./executive-mission-control-polish.css";

export const metadata: Metadata = {
  title: "Obserra | Executive Intelligence for High-Consequence Organizations",
  description:
    "Obserra unifies executive advisory, cybersecurity, protective intelligence, enterprise applications, and professional training into one decision-focused operating model.",
  alternates: { canonical: "/" },
};

const pathways = [
  ["01", "Executive Advisory", "Board-ready cyber, risk, governance, resilience, and transformation leadership for material enterprise decisions.", "/services", "Explore advisory"],
  ["02", "Protection and Intelligence", "Protective intelligence, executive exposure, travel risk, and discreet support for leaders and high-consequence operations.", "/protection-intelligence", "Explore protection"],
  ["03", "EIOS and Applications", "Enterprise intelligence, governed workflows, risk context, evidence, and executive decision support in one platform experience.", "/eios", "Explore EIOS"],
  ["04", "Obserra Academy", "Commercial professional training with secure checkout, account-based access, progress tracking, assessment, and certificates.", "/academy", "Browse training"],
];

const domains = [
  ["CYBER", "Cyber Risk", "Translate technical exposure into business consequence, investment priority, and accountable action."],
  ["AI", "AI Governance", "Establish policy, inventory, approval, control, evidence, and oversight for enterprise AI use."],
  ["EXECUTIVE", "Executive Protection", "Connect digital exposure, travel conditions, physical threats, and protective planning."],
  ["RISK", "Organizational Risk", "Correlate operational, regulatory, financial, technology, and people risk across the enterprise."],
  ["BOARD", "Board Intelligence", "Produce concise, defensible reporting focused on material risk, ownership, movement, and decisions."],
  ["RESILIENCE", "Operational Resilience", "Improve readiness, response, continuity, recovery, and executive coordination under pressure."],
];

export default function HomePage() {
  return (
    <main className="mission-home">
      <HomeHeader />

      <section className="mission-hero">
        <div className="mission-hero__visual">
          <Image src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="Obserra Executive Intelligence Operating System visualization" fill priority sizes="100vw" />
        </div>
        <div className="mission-hero__copy">
          <p className="obs-eyebrow">EXECUTIVE INTELLIGENCE OPERATING SYSTEM</p>
          <h1>Enterprise intelligence for organizations that cannot afford to be wrong.</h1>
          <p>Obserra connects executive judgment, cybersecurity, protective intelligence, governance, secure technology, and professional training so leaders can move from fragmented signals to confident, accountable action.</p>
          <div className="mission-hero__actions">
            <ButtonLink href="/contact?interest=enterprise-consultation">Schedule an executive consultation</ButtonLink>
            <ButtonLink href="/eios" variant="secondary">Explore Obserra EIOS</ButtonLink>
          </div>
          <div className="mission-assurance" aria-label="Obserra operating assurances">
            <span>Veteran owned</span><span>Executive led</span><span>Secure by design</span><span>Board ready</span>
          </div>
        </div>

        <aside className="mission-console" aria-label="Executive Mission Control preview">
          <div className="mission-console__top">
            <div><span>EXECUTIVE MISSION CONTROL</span><strong>Enterprise posture overview</strong></div>
            <StatusBadge tone="success">Operational</StatusBadge>
          </div>
          <div className="mission-kpis">
            <KpiCard label="Enterprise Health" value="87" trend="Improving" status="Strong" statusTone="success"><div className="mission-spark" /></KpiCard>
            <KpiCard label="Cyber Risk" value="28" trend="6 points lower" status="Managed" statusTone="success"><div className="mission-spark" /></KpiCard>
            <KpiCard label="AI Governance" value="74" trend="Controls expanding" status="Attention" statusTone="warning"><div className="mission-spark" /></KpiCard>
            <KpiCard label="Executive Exposure" value="Low" trend="No critical change" status="Monitored" statusTone="neutral"><div className="mission-spark" /></KpiCard>
          </div>
        </aside>
      </section>

      <section className="mission-section mission-section--tight">
        <div className="mission-heading">
          <div><p className="obs-eyebrow">CHOOSE YOUR MISSION</p><h2>One enterprise partner across advice, intelligence, technology, and training.</h2></div>
          <p>Start with the capability you need now, then connect it to a broader operating model as the mission expands.</p>
        </div>
        <div className="mission-paths">
          {pathways.map(([number, title, copy, href, action]) => (
            <Link href={href} className="mission-path" key={title}>
              <div><span>{number}</span><h3>{title}</h3><p>{copy}</p></div><strong>{action} →</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="mission-section mission-platform">
        <div className="mission-platform__copy">
          <p className="obs-eyebrow">FLAGSHIP PLATFORM</p>
          <h2>Executive intelligence, governance, and execution in one operating environment.</h2>
          <p>Obserra EIOS is designed to connect enterprise context, controls, evidence, risk, intelligence, decisions, and implementation. It gives leaders a consistent view of what matters, why it matters, who owns it, and what action should happen next.</p>
          <div className="mission-platform__list">
            <span>Executive Mission Control and enterprise health</span>
            <span>Organizational risk and control intelligence</span>
            <span>Global digital twin and emerging intelligence</span>
            <span>Board reporting, recommendations, and implementation roadmaps</span>
          </div>
          <div className="mission-hero__actions"><ButtonLink href="/eios">Explore the platform</ButtonLink><ButtonLink href="/contact?interest=eios-demo" variant="secondary">Request an EIOS briefing</ButtonLink></div>
        </div>
        <Link href="/eios" className="mission-platform__visual" aria-label="Explore the Obserra EIOS platform">
          <Image src="/eios/eios-overview-marketing.png" width={1200} height={675} alt="Obserra EIOS executive dashboard" sizes="(max-width: 1100px) 100vw, 55vw" />
        </Link>
      </section>

      <section className="mission-section">
        <div className="mission-heading">
          <div><p className="obs-eyebrow">ENTERPRISE RISK DOMAINS</p><h2>See the whole decision, not another isolated control or report.</h2></div>
          <p>Obserra correlates risk across functions so executives can evaluate consequence, confidence, urgency, ownership, and expected value in one context.</p>
        </div>
        <div className="mission-domains">
          {domains.map(([label, title, copy]) => <article className="mission-domain" key={title}><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="mission-section mission-proof">
        <article>
          <p className="obs-eyebrow">WHY OBSERRA</p>
          <h3>Executive judgment backed by technical depth, intelligence discipline, governance, and operational experience.</h3>
          <p>Obserra is built for organizations that need more than a narrow assessment. The operating model combines senior leadership, evidence-based recommendations, secure technology, and implementation discipline so advice can survive scrutiny and produce measurable outcomes.</p>
          <div className="mission-hero__actions"><ButtonLink href="/about">Review executive credentials</ButtonLink><ButtonLink href="/trust" variant="secondary">Visit the Trust Center</ButtonLink></div>
        </article>
        <article>
          <div className="mission-proof__stats">
            <div><strong>2×</strong><span>Fortune 500 CISO experience</span></div>
            <div><strong>21</strong><span>Years of U.S. Army service</span></div>
            <div><strong>3</strong><span>Top Global CISO recognitions</span></div>
            <div><strong>60</strong><span>Commercial Academy courses</span></div>
          </div>
        </article>
      </section>

      <section className="mission-section">
        <div className="mission-academy">
          <div><p className="obs-eyebrow">OBSERRA ACADEMY</p><h2>Build workforce capability for the decisions that matter now.</h2><p>Purchase professional training through secure Stripe checkout, receive account-based course access, save progress, complete assessments, and generate an Obserra Certificate of Training after meeting the published standard.</p><div className="mission-hero__actions"><ButtonLink href="/academy">Browse Academy courses</ButtonLink><ButtonLink href="/academy/enterprise" variant="secondary">Explore enterprise training</ButtonLink></div></div>
          <div className="mission-academy__steps"><span><b>1</b>Select the right course or learning path</span><span><b>2</b>Sign in and pay securely</span><span><b>3</b>Receive immediate account-based access</span><span><b>4</b>Complete, assess, and certify</span></div>
        </div>
      </section>

      <section className="mission-final">
        <p className="obs-eyebrow">START WITH THE DECISION IN FRONT OF YOU</p>
        <h2>Bring Obserra into the mission before risk becomes consequence.</h2>
        <p>Engage for executive advisory, protective intelligence, EIOS, secure applications, or professional training through one confidential enterprise conversation.</p>
        <div className="mission-hero__actions"><ButtonLink href="/contact?interest=enterprise-consultation">Talk with Obserra</ButtonLink><ButtonLink href="/apps" variant="secondary">Explore applications</ButtonLink></div>
      </section>

      <footer className="mission-footer">
        <Link href="/" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" width={190} height={37} alt="Obserra Executive Protection and Intelligence LLC" /></Link>
        <nav aria-label="Footer links"><Link href="/about">Company</Link><Link href="/speaking">Speaking</Link><Link href="/trust">Trust Center</Link><Link href="/academy">Academy</Link><Link href="/contact">Contact</Link></nav>
      </footer>
    </main>
  );
}
