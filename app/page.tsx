import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "./HomeHeader";
import "./home.css";

export const metadata: Metadata = {
  title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
  description:
    "Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory, protective intelligence, secure applications, and professional training.",
  alternates: { canonical: "/" },
};

const capabilities = [
  ["01", "Cybersecurity Advisory", "Executive cyber strategy, risk assessments, governance, incident readiness, security transformation, and board communication.", "/services", "Explore advisory services"],
  ["02", "Protection and Intelligence", "Executive protection planning, protective intelligence, travel risk, digital exposure reviews, and discreet risk support.", "/protection-intelligence", "Explore protection services"],
  ["03", "Applications and EIOS", "Secure enterprise applications and governed intelligence experiences that convert complex information into accountable action.", "/apps", "View application offerings"],
  ["04", "Obserra Academy", "Practical, self-paced professional training across cybersecurity, intelligence, protection, and secure technology.", "/academy", "Browse professional training"],
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
        <Image className="hero-image" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">VETERAN OWNED. EXECUTIVE LED. SECURE BY DESIGN.</p>
          <h1>Turn enterprise risk into confident, accountable action.</h1>
          <p className="hero-summary">Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory, protective intelligence, secure applications, and professional training.</p>
          <div className="actions">
            <Link className="button primary" href="/contact">Start a confidential conversation</Link>
            <Link className="button secondary" href="#applications">Explore applications</Link>
          </div>
        </div>
        <aside className="hero-panel">
          <Image src="/brand/obserra-logo.png" width={230} height={44} alt="Obserra" />
          <p className="panel-label">ONE TRUSTED PARTNER</p>
          <h2>Expert judgment, intelligence, and technology in one operating model.</h2>
          <ul>
            <li>Executive and board-ready guidance</li>
            <li>Commercially focused engagements</li>
            <li>Secure applications designed around business outcomes</li>
          </ul>
        </aside>
      </section>

      <section className="standards">
        <article><span>01</span><strong>Executive ready</strong><p>Clear guidance for leaders, boards, and high-consequence operations.</p></article>
        <article><span>02</span><strong>Secure by design</strong><p>Confidentiality, accountability, and disciplined governance from the beginning.</p></article>
        <article><span>03</span><strong>Built for action</strong><p>Practical solutions tied to measurable risk and business outcomes.</p></article>
      </section>

      <section className="section-heading" id="capabilities">
        <p className="eyebrow">WHAT OBSERRA DOES</p>
        <h2>Integrated expertise for risks leaders cannot treat in isolation.</h2>
        <p>Engage Obserra for a focused need or combine advisory, intelligence, applications, and training into a coordinated program.</p>
      </section>

      <section className="capability-grid">
        {capabilities.map(([number, title, copy, href, label]) => (
          <article key={title}>
            <span className="card-number">{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <Link href={href}>{label} →</Link>
          </article>
        ))}
      </section>

      <section className="applications" id="applications">
        <div className="section-heading compact">
          <p className="eyebrow">OBSERRA APPLICATIONS</p>
          <h2>Purpose-built software for enterprise risk, governance, and intelligence.</h2>
          <p>Obserra applications complement existing enterprise systems with decision intelligence, workflow governance, evidence, and executive visibility.</p>
        </div>
        <div className="application-grid">
          {applications.map(([name, category, status, copy, href]) => (
            <article key={name}>
              <div className="app-meta"><span>{category}</span><strong className={status === "Pilot" ? "pilot" : "available"}>{status}</strong></div>
              <h3>{name}</h3>
              <p>{copy}</p>
              <Link href={href}>View application →</Link>
            </article>
          ))}
        </div>
        <div className="applications-cta">
          <Link className="button primary" href="/apps">View all applications</Link>
          <Link className="button secondary" href="/contact">Discuss a deployment</Link>
        </div>
      </section>

      <section className="eios-feature">
        <div className="eios-copy">
          <p className="eyebrow">FLAGSHIP PLATFORM</p>
          <h2>Obserra EIOS connects intelligence, governance, and execution.</h2>
          <p>EIOS brings risk context, evidence, policy, approvals, and accountable execution into one governed decision environment.</p>
          <Link className="button primary" href="/eios">Explore Obserra EIOS</Link>
        </div>
        <Link className="eios-visual" href="/eios" aria-label="Explore Obserra EIOS">
          <Image src="/eios/eios-overview-marketing.png" alt="Obserra EIOS executive intelligence dashboard" width={1200} height={675} sizes="(max-width: 900px) 100vw, 52vw" />
        </Link>
      </section>

      <section className="final-cta">
        <Image src="/brand/obserra-logo.png" width={230} height={44} alt="Obserra" />
        <p className="eyebrow">START A CONVERSATION</p>
        <h2>Bring clarity to the risk in front of you.</h2>
        <p>Tell us what is at stake. Obserra will help define the right engagement, application, decision path, and next action.</p>
        <div className="actions">
          <Link className="button primary" href="/contact">Contact Obserra</Link>
          <Link className="button secondary" href="/services">Review services</Link>
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" width={190} height={37} alt="Obserra Executive Protection and Intelligence LLC" /></Link>
        <p>Copyright Obserra Executive Protection &amp; Intelligence LLC. All rights reserved.</p>
      </footer>
    </main>
  );
}
