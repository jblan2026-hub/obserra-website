import type { Metadata } from "next";
import Image from "next/image";
import "./home.css";

export const metadata: Metadata = {
  title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
  description:
    "Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory, protective intelligence, secure applications, and professional training.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
    description:
      "Executive advisory, protective intelligence, secure applications, and professional training for high consequence decisions.",
    url: "https://www.obserrallc.com",
    type: "website",
    images: [
      {
        url: "/brand/visuals/obserra-eios-intelligence-hero.png",
        width: 1672,
        height: 941,
        alt: "Obserra enterprise intelligence",
      },
    ],
  },
};

const capabilities = [
  {
    number: "01",
    title: "Cybersecurity Advisory",
    copy: "Executive cyber strategy, risk assessments, governance, incident readiness, security transformation, and board communication.",
    href: "/services",
    link: "Explore advisory services",
  },
  {
    number: "02",
    title: "Protection and Intelligence",
    copy: "Executive protection planning, protective intelligence, travel risk, digital exposure reviews, and discreet risk support.",
    href: "/protection-intelligence",
    link: "Explore protection services",
  },
  {
    number: "03",
    title: "Applications and EIOS",
    copy: "Secure enterprise applications and governed intelligence experiences that convert complex information into accountable action.",
    href: "/apps",
    link: "View application offerings",
  },
  {
    number: "04",
    title: "Obserra Academy",
    copy: "Practical, self paced professional training across cybersecurity, intelligence, protection, and secure technology.",
    href: "/academy",
    link: "Browse professional training",
  },
];

const applications = [
  {
    name: "Obserra EIOS",
    category: "Enterprise Intelligence",
    status: "Available",
    copy: "A governed command layer that unifies enterprise context, decision workflows, evidence, and verified outcomes.",
    href: "/apps/obserra-eios",
  },
  {
    name: "AI Governance Suite",
    category: "AI Governance",
    status: "Available",
    copy: "Policy aligned oversight for enterprise AI use, model inventory, approvals, controls, and defensible governance records.",
    href: "/apps/obserra-ai-governance-suite",
  },
  {
    name: "Cyber Risk Register",
    category: "Cyber Risk",
    status: "Available",
    copy: "Dynamic, evidence backed cyber risk intelligence with control linkage, confidence scoring, and board ready reporting.",
    href: "/apps/obserra-cyber-risk-register",
  },
  {
    name: "Security Control Evidence Manager",
    category: "Assurance and Compliance",
    status: "Available",
    copy: "Automated evidence collection, validation, framework mapping, and audit ready exports across security programs.",
    href: "/apps/obserra-security-control-evidence-manager",
  },
  {
    name: "Vulnerability Prioritizer",
    category: "Cybersecurity Operations",
    status: "Available",
    copy: "Business context driven vulnerability prioritization based on exploitability, asset importance, and operational impact.",
    href: "/apps/obserra-vulnerability-prioritizer",
  },
  {
    name: "Executive Exposure Monitor",
    category: "Protective Intelligence",
    status: "Pilot",
    copy: "Digital and physical exposure intelligence for executives, travel, events, and emerging threat conditions.",
    href: "/apps/obserra-executive-exposure-monitor",
  },
];

const outcomes = [
  ["Clearer decisions", "Translate complex risk into a concise decision path with ownership, priorities, and next actions."],
  ["Reduced exposure", "Focus effort on the people, systems, operations, and business outcomes that matter most."],
  ["Executive confidence", "Give leadership and boards evidence based insight without unnecessary technical noise."],
];

export default function HomePage() {
  return (
    <main className="obserra-home">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Obserra home">
          <Image
            src="/brand/obserra-logo.png"
            width={286}
            height={55}
            priority
            alt="Obserra Executive Protection and Intelligence LLC"
          />
        </a>
        <nav aria-label="Primary navigation">
          <a href="/services">Services</a>
          <a href="/protection-intelligence">Protection</a>
          <a href="/apps">Applications</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a className="nav-cta" href="/contact">Contact Obserra</a>
        </nav>
      </header>

      <section className="hero">
        <Image
          className="hero-image"
          src="/brand/visuals/obserra-eios-intelligence-hero.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">VETERAN OWNED. EXECUTIVE LED. SECURE BY DESIGN.</p>
          <h1>Turn enterprise risk into confident, accountable action.</h1>
          <p className="hero-summary">
            Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory,
            protective intelligence, secure applications, and professional training.
          </p>
          <div className="actions">
            <a className="button primary" href="/contact">Start a confidential conversation</a>
            <a className="button secondary" href="#applications">Explore applications</a>
          </div>
        </div>
        <aside className="hero-panel" aria-label="Obserra value proposition">
          <p className="panel-label">ONE TRUSTED PARTNER</p>
          <h2>Expert judgment, intelligence, and technology in one operating model.</h2>
          <p>
            Obserra helps organizations move from uncertainty to a defensible course of action without sacrificing governance, confidentiality, or trust.
          </p>
          <ul>
            <li>Executive and board ready guidance</li>
            <li>Commercially focused engagements</li>
            <li>Secure applications designed around business outcomes</li>
          </ul>
        </aside>
      </section>

      <section className="standards" aria-label="Obserra operating standards">
        <article><span>01</span><strong>Executive ready</strong><p>Clear guidance for leaders, boards, and high consequence operations.</p></article>
        <article><span>02</span><strong>Secure by design</strong><p>Confidentiality, accountability, and disciplined governance from the beginning.</p></article>
        <article><span>03</span><strong>Built for action</strong><p>Practical solutions tied to measurable risk and business outcomes.</p></article>
      </section>

      <section className="section-heading" id="capabilities">
        <p className="eyebrow">WHAT OBSERRA DOES</p>
        <h2>Integrated expertise for risks leaders cannot treat in isolation.</h2>
        <p>
          Engage Obserra for a focused need or combine advisory, intelligence, applications, and training into a coordinated program.
        </p>
      </section>

      <section className="capability-grid">
        {capabilities.map((capability) => (
          <article key={capability.title}>
            <span className="card-number">{capability.number}</span>
            <h3>{capability.title}</h3>
            <p>{capability.copy}</p>
            <a href={capability.href}>{capability.link}</a>
          </article>
        ))}
      </section>

      <section className="applications" id="applications">
        <div className="section-heading compact">
          <p className="eyebrow">OBSERRA APPLICATIONS</p>
          <h2>Purpose built software for enterprise risk, governance, and intelligence.</h2>
          <p>
            Obserra applications complement existing enterprise systems with decision intelligence, workflow governance, evidence, and executive visibility.
          </p>
        </div>
        <div className="application-grid">
          {applications.map((application) => (
            <article key={application.name}>
              <div className="app-meta">
                <span>{application.category}</span>
                <strong className={application.status === "Pilot" ? "pilot" : "available"}>{application.status}</strong>
              </div>
              <h3>{application.name}</h3>
              <p>{application.copy}</p>
              <a href={application.href}>View application</a>
            </article>
          ))}
        </div>
        <div className="applications-cta">
          <a className="button primary" href="/apps">View the complete application marketplace</a>
          <a className="button secondary" href="/contact">Discuss an enterprise deployment</a>
        </div>
      </section>

      <section className="eios-feature">
        <div className="eios-copy">
          <p className="eyebrow">FLAGSHIP PLATFORM</p>
          <h2>Obserra EIOS connects intelligence, governance, and execution.</h2>
          <p>
            EIOS brings risk context, evidence, policy, approvals, and accountable execution into one governed decision environment. Leaders can see what matters, choose a defensible response, and verify the outcome.
          </p>
          <a className="button primary" href="/eios">Explore Obserra EIOS</a>
        </div>
        <div className="eios-visual">
          <Image
            src="/eios/eios-overview-marketing.png"
            alt="Obserra EIOS executive intelligence dashboard"
            width={1200}
            height={675}
            sizes="(max-width: 900px) 100vw, 52vw"
          />
        </div>
      </section>

      <section className="outcomes">
        <div className="section-heading compact">
          <p className="eyebrow">THE OBSERRA DIFFERENCE</p>
          <h2>Senior expertise focused on the outcome.</h2>
        </div>
        <div className="outcome-grid">
          {outcomes.map(([title, copy], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">START A CONVERSATION</p>
        <h2>Bring clarity to the risk in front of you.</h2>
        <p>
          Tell us what is at stake. Obserra will help define the right engagement, application, decision path, and next action.
        </p>
        <div className="actions">
          <a className="button primary" href="/contact">Contact Obserra</a>
          <a className="button secondary" href="/services">Review services</a>
        </div>
      </section>

      <footer className="site-footer">
        <Image src="/brand/obserra-logo.png" width={190} height={37} alt="Obserra Executive Protection and Intelligence LLC" />
        <p>Copyright Obserra Executive Protection &amp; Intelligence LLC. All rights reserved.</p>
      </footer>
    </main>
  );
}
