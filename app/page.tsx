import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "./HomeHeader";
import "./home.css";

export const metadata: Metadata = {
  title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
  description:
    "Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory, protective intelligence, enterprise applications, and professional training.",
  alternates: { canonical: "/" },
};

const capabilities = [
  ["01", "Cybersecurity Advisory", "Executive cyber strategy, risk assessments, governance, incident readiness, security transformation, and board communication.", "/services", "Explore advisory services"],
  ["02", "Protection and Intelligence", "Executive protection planning, protective intelligence, travel risk, digital exposure reviews, and discreet risk support.", "/protection-intelligence", "Explore protection services"],
  ["03", "Applications and EIOS", "Secure enterprise applications and governed intelligence experiences that convert complex information into accountable action.", "/apps", "View application offerings"],
  ["04", "Obserra Academy", "Practical, self-paced professional training across cybersecurity, intelligence, protection, and secure technology.", "/academy", "Browse and purchase courses"],
];

const applications = [
  ["Obserra EIOS", "Enterprise Intelligence", "Available", "A governed command layer that unifies enterprise context, decision workflows, evidence, and verified outcomes.", "/apps/obserra-eios"],
  ["AI Governance Suite", "AI Governance", "Available", "Policy-aligned oversight for enterprise AI use, model inventory, approvals, controls, and defensible governance records.", "/apps/obserra-ai-governance-suite"],
  ["Cyber Risk Register", "Cyber Risk", "Available", "Dynamic, evidence-backed cyber risk intelligence with control linkage, confidence scoring, and board-ready reporting.", "/apps/obserra-cyber-risk-register"],
  ["Security Control Evidence Manager", "Assurance and Compliance", "Available", "Evidence collection, validation, framework mapping, and audit-ready exports across security programs.", "/apps/obserra-security-control-evidence-manager"],
  ["Vulnerability Prioritizer", "Cybersecurity Operations", "Available", "Business-context vulnerability prioritization based on exploitability, asset importance, and operational impact.", "/apps/obserra-vulnerability-prioritizer"],
  ["Executive Exposure Monitor", "Protective Intelligence", "Pilot", "Digital and physical exposure intelligence for executives, travel, events, and emerging threat conditions.", "/apps/obserra-executive-exposure-monitor"],
];

export default function HomePage() {
  return (
    <main className="obserra-home">
      <HomeHeader />

      <section className="hero">
        <Image className="hero-image" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="Obserra enterprise intelligence platform visualization" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">VETERAN OWNED. EXECUTIVE LED. SECURE BY DESIGN.</p>
          <h1>Turn enterprise risk into confident, accountable action.</h1>
          <p className="hero-summary">Obserra combines senior advisory, protective intelligence, enterprise applications, and professional training to help organizations act decisively in high-consequence environments.</p>
          <div className="actions">
            <Link className="button primary" href="/contact?interest=enterprise-consultation">Schedule an enterprise consultation</Link>
            <Link className="button secondary" href="/academy">Purchase professional training</Link>
          </div>
          <div className="trust-strip" aria-label="Obserra commercial assurances">
            <span>Secure engagement</span><span>Executive-ready deliverables</span><span>Accountable outcomes</span>
          </div>
        </div>
        <aside className="hero-panel">
          <Image src="/brand/obserra-logo.png" width={230} height={44} alt="Obserra" />
          <p className="panel-label">ONE TRUSTED PARTNER</p>
          <h2>Expert judgment, intelligence, and technology in one operating model.</h2>
          <ul>
            <li>Executive and board-ready guidance</li>
            <li>Commercial solutions aligned to business outcomes</li>
            <li>Secure applications and professional training</li>
          </ul>
          <Link className="panel-link" href="/contact?interest=capability-review">Discuss your requirements →</Link>
        </aside>
      </section>

      <section className="standards">
        <article><span>01</span><strong>Executive ready</strong><p>Clear guidance for leaders, boards, and high-consequence operations.</p></article>
        <article><span>02</span><strong>Secure by design</strong><p>Confidentiality, accountability, and disciplined governance from the beginning.</p></article>
        <article><span>03</span><strong>Built for action</strong><p>Practical solutions tied to measurable risk and business outcomes.</p></article>
      </section>

      <section className="section-heading" id="capabilities">
        <p className="eyebrow">WHAT OBSERRA DELIVERS</p>
        <h2>Integrated expertise for risks leaders cannot treat in isolation.</h2>
        <p>Select a focused service, purchase professional training, or combine advisory, intelligence, applications, and workforce development into one coordinated program.</p>
      </section>

      <section className="capability-grid">
        {capabilities.map(([number, title, copy, href, label]) => (
          <Link className="commercial-card" href={href} key={title}>
            <article>
              <span className="card-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <strong>{label} →</strong>
            </article>
          </Link>
        ))}
      </section>

      <section className="applications" id="applications">
        <div className="section-heading compact">
          <p className="eyebrow">OBSERRA APPLICATIONS</p>
          <h2>Purpose-built software for enterprise risk, governance, and intelligence.</h2>
          <p>Explore each solution, review its enterprise use case, and request a tailored deployment conversation directly from the product page.</p>
        </div>
        <div className="application-grid">
          {applications.map(([name, category, status, copy, href]) => (
            <Link className="commercial-card" href={href} key={name}>
              <article>
                <div className="app-meta"><span>{category}</span><strong className={status === "Pilot" ? "pilot" : "available"}>{status}</strong></div>
                <h3>{name}</h3>
                <p>{copy}</p>
                <strong>View solution and request access →</strong>
              </article>
            </Link>
          ))}
        </div>
        <div className="applications-cta">
          <Link className="button primary" href="/apps">Compare all applications</Link>
          <Link className="button secondary" href="/contact?interest=application-demo">Request an enterprise demo</Link>
        </div>
      </section>

      <section className="academy-conversion">
        <div>
          <p className="eyebrow">OBSERRA ACADEMY</p>
          <h2>Purchase practical training and begin learning immediately after verified payment.</h2>
          <p>Secure checkout, account-based course access, saved progress, final assessment, and a branded Obserra Certificate of Training after successful completion.</p>
          <div className="actions">
            <Link className="button primary" href="/academy">Browse and purchase courses</Link>
            <Link className="button secondary" href="/contact?interest=enterprise-training">Request team training</Link>
          </div>
        </div>
        <div className="purchase-journey">
          <span><b>1</b>Choose a course</span>
          <span><b>2</b>Sign in and pay securely</span>
          <span><b>3</b>Receive course access</span>
          <span><b>4</b>Complete training and earn a certificate</span>
        </div>
      </section>

      <section className="eios-feature">
        <div className="eios-copy">
          <p className="eyebrow">FLAGSHIP PLATFORM</p>
          <h2>Obserra EIOS connects intelligence, governance, and execution.</h2>
          <p>EIOS brings risk context, evidence, policy, approvals, and accountable execution into one governed decision environment.</p>
          <div className="actions">
            <Link className="button primary" href="/eios">Explore Obserra EIOS</Link>
            <Link className="button secondary" href="/contact?interest=eios-demo">Request an EIOS briefing</Link>
          </div>
        </div>
        <Link className="eios-visual" href="/eios" aria-label="Explore Obserra EIOS">
          <Image src="/eios/eios-overview-marketing.png" alt="Obserra EIOS executive intelligence dashboard" width={1200} height={675} sizes="(max-width: 900px) 100vw, 52vw" />
        </Link>
      </section>

      <section className="final-cta">
        <Image src="/brand/obserra-logo.png" width={230} height={44} alt="Obserra" />
        <p className="eyebrow">TAKE THE NEXT STEP</p>
        <h2>Choose the Obserra solution that moves your organization forward.</h2>
        <p>Purchase a course, evaluate an application, or begin a confidential enterprise engagement.</p>
        <div className="actions">
          <Link className="button primary" href="/academy">Purchase training</Link>
          <Link className="button secondary" href="/contact?interest=enterprise-consultation">Contact Obserra</Link>
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" width={190} height={37} alt="Obserra Executive Protection and Intelligence LLC" /></Link>
        <div><p>Obserra Executive Protection &amp; Intelligence LLC</p><nav aria-label="Footer links"><Link href="/trust">Trust Center</Link><Link href="/trust/privacy-policy">Privacy</Link><Link href="/trust/terms-of-use">Terms</Link><Link href="/trust/refund-and-cancellation-policy">Refunds</Link></nav></div>
      </footer>
    </main>
  );
}
