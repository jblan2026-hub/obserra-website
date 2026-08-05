import type { Metadata } from "next";
import Image from "next/image";
import "./home.css";

export const metadata: Metadata = {
  title: "Obserra | Executive Cybersecurity, Intelligence and Protection",
  description:
    "Obserra Executive Protection & Intelligence LLC helps leaders reduce cyber, operational, travel, and executive risk through senior advisory, protective intelligence, secure technology, and professional training.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Obserra | Executive Cybersecurity, Intelligence and Protection",
    description:
      "Senior advisory, protective intelligence, secure technology, and professional training for high consequence decisions.",
    url: "https://www.obserrallc.com",
    type: "website",
    images: [{
      url: "/brand/visuals/obserra-eios-intelligence-hero.png",
      width: 1672,
      height: 941,
      alt: "Obserra enterprise intelligence",
    }],
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
    title: "EIOS and Applications",
    copy: "Secure AI native applications and governed intelligence experiences that turn complex information into accountable action.",
    href: "/eios",
    link: "Discover EIOS",
  },
  {
    number: "04",
    title: "Obserra Academy",
    copy: "Practical, self paced professional training across cybersecurity, intelligence, protection, and secure technology.",
    href: "/academy",
    link: "Browse courses",
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
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="Obserra Executive Protection and Intelligence LLC" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="/services">Services</a>
          <a href="/protection-intelligence">Protection</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a className="nav-cta" href="/contact">Contact Obserra</a>
        </nav>
      </header>

      <section className="hero">
        <Image className="hero-image" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">VETERAN OWNED. EXECUTIVE LED. SECURE BY DESIGN.</p>
          <h1>Make high consequence decisions with greater clarity and confidence.</h1>
          <p className="hero-summary">
            Obserra helps leaders reduce cyber, operational, travel, and executive risk through senior advisory,
            protective intelligence, secure technology, and professional training.
          </p>
          <div className="actions">
            <a className="button primary" href="/contact">Start a confidential conversation</a>
            <a className="button secondary" href="#capabilities">Explore capabilities</a>
          </div>
        </div>
        <aside className="hero-panel" aria-label="Obserra value proposition">
          <p className="panel-label">ONE TRUSTED PARTNER</p>
          <h2>From risk signal to accountable action.</h2>
          <p>
            Obserra brings executive judgment, intelligence, security, and technology together so organizations can move faster without sacrificing governance or trust.
          </p>
          <ul>
            <li>Executive and board ready guidance</li>
            <li>Confidential and outcome focused engagements</li>
            <li>Integrated cyber, protection, intelligence, and technology expertise</li>
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
        <h2>Integrated expertise for the risks leaders cannot treat in isolation.</h2>
        <p>
          Choose the capability you need now, or combine services into a coordinated engagement built around your organization, decision, and desired outcome.
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

      <section className="eios-feature">
        <div className="eios-copy">
          <p className="eyebrow">OBSERRA EIOS</p>
          <h2>Enterprise intelligence built around decisions, not dashboards.</h2>
          <p>
            EIOS connects risk context, evidence, policy, approvals, and accountable execution in one governed decision environment. It is designed to help leaders see what matters, choose a defensible response, and verify the outcome.
          </p>
          <a className="button primary" href="/eios">Explore the EIOS platform</a>
        </div>
        <div className="eios-visual">
          <Image src="/eios/eios-overview-marketing.png" alt="Obserra EIOS executive intelligence dashboard" width={1200} height={675} sizes="(max-width: 900px) 100vw, 52vw" />
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
          Tell us what is at stake. Obserra will help define the right engagement, decision path, and next action.
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
