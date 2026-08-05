import type { Metadata } from "next";
import Image from "next/image";
import "./home.css";

export const metadata: Metadata = {
  title: "Enterprise Intelligence, Protection, Cybersecurity and Training",
  description:
    "Obserra Executive Protection & Intelligence LLC delivers enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and professional training.",
  alternates: { canonical: "/" },
  keywords: ["enterprise intelligence", "cybersecurity consulting", "executive protection", "protective intelligence", "professional training"],
  openGraph: {
    title: "Obserra | Enterprise Intelligence, Protection, Cybersecurity and Training",
    description: "Enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and paid professional training.",
    url: "https://www.obserrallc.com",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra | Enterprise Intelligence, Protection, Cybersecurity and Training",
    description: "Enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and professional training.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

const divisions = [
  {
    number: "01",
    title: "Services",
    eyebrow: "Executive Cyber and Risk Advisory",
    copy: "Board-ready cybersecurity, intelligence, and risk engagements with clear scope, measurable outcomes, and executive accountability.",
    cta: "Explore Services",
    href: "/services",
    tone: "signal",
  },
  {
    number: "02",
    title: "Protection and Intelligence",
    eyebrow: "Executive Exposure and Travel Risk",
    copy: "Protect leaders, travel, reputation, and operations through protective intelligence and focused risk reduction plans.",
    cta: "Explore Protection Path",
    href: "/protection-intelligence",
    tone: "blue",
  },
  {
    number: "03",
    title: "Applications",
    eyebrow: "Standalone Applications and EIOS",
    copy: "Enterprise applications and EIOS command experiences that turn risk data into decisions and trackable outcomes.",
    cta: "Explore Applications",
    href: "/apps",
    tone: "gold",
  },
  {
    number: "04",
    title: "Obserra Training Academy",
    eyebrow: "Paid Professional Training",
    copy: "Paid, practical training across cyber, protection, intelligence, and secure technology with certificate-backed completion.",
    cta: "View Training Academy",
    href: "/academy",
    tone: "academy",
  },
];

const courseTracks = [
  ["Cybersecurity", "Security foundations, phishing defense, incident response, NIST, CMMC awareness, executive governance, and AI security."],
  ["Protection", "Executive protection, protective intelligence, travel risk, and operational preparedness."],
  ["Intelligence", "Intelligence analysis, executive briefing, open source intelligence, and digital exposure awareness."],
  ["Obserra Technologies", "EIOS foundations, secure AI integration, and custom AI-native application strategy for modern enterprise leaders."],
];

export default function HomePage() {
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.obserrallc.com/#webpage",
        url: "https://www.obserrallc.com",
        name: "Obserra | Enterprise Intelligence, Protection, Cybersecurity and Training",
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
        about: { "@id": "https://www.obserrallc.com/#organization" },
        description: "Enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and professional training.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.obserrallc.com",
          },
        ],
      },
    ],
  };

  return (
    <main className="obserra-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <header className="home-nav">
        <a href="/" className="home-brand">
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="Obserra Executive Protection and Intelligence LLC" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#divisions">What we do</a>
          <a href="/services">Services</a>
          <a href="/protection-intelligence">Protection and Intelligence</a>
          <a href="/apps">Applications</a>
          <a href="/academy">Training Academy</a>
          <a href="/catalog">Catalog</a>
          <a href="/trust">Trust</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/academy" className="home-nav-login">Training Academy courses</a>
          <a href="#connect" className="home-nav-cta">Talk with Obserra</a>
        </nav>
      </header>

      <section className="home-hero">
        <Image className="home-hero-background" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className="home-grid" />
        <div className="hero-copy">
          <p className="home-eyebrow">VETERAN OWNED · PROPERTY OF OBSERRA</p>
          <h1>When enterprise risk threatens revenue, operations, and brand,<br /><em>bring in experts who reduce exposure and speed confident decisions.</em></h1>
          <p>Obserra Executive Protection &amp; Intelligence LLC helps leadership teams reduce exposure, strengthen cyber resilience, and execute critical decisions with confidence through expert advisory, protective intelligence, secure technology, and workforce training.</p>
          <div className="home-actions">
            <a className="home-button" href="#connect">Schedule executive consultation</a>
            <a className="home-link" href="/services">View services and engagement options</a>
          </div>
        </div>
        <aside className="hero-proof">
          <p>WHY TEAMS HIRE OBSERRA</p>
          <div><strong>Executive-Level Expertise</strong><span>Practical guidance shaped by real leadership experience in high-consequence environments.</span></div>
          <div><strong>Faster Risk Decisions</strong><span>Get from uncertainty to accountable action with evidence-backed decision pathways.</span></div>
          <div><strong>Measurable Outcomes</strong><span>Every engagement is scoped for business impact, not generic advisory noise.</span></div>
          <div><strong>Integrated Capability</strong><span>One partner across cyber, protection, intelligence, secure technology, and training.</span></div>
        </aside>
      </section>

      <section className="trust-rail" aria-label="Obserra engagement standards">
        <article><span>01</span><p>COMMERCIAL READY</p><strong>Engagement models built for executive sponsors, operating teams, and procurement stakeholders.</strong></article>
        <article><span>02</span><p>SECURE BY DESIGN</p><strong>Confidentiality, accountability, and governance discipline integrated from day one.</strong></article>
        <article><span>03</span><p>OUTCOME DRIVEN</p><strong>Advisory, technology, protection, and training aligned to measurable business and risk outcomes.</strong></article>
      </section>

      <section className="home-intro" id="divisions">
        <p className="home-eyebrow">THE OBSERRA ADVANTAGE</p>
        <h2>One partner for leadership teams that cannot afford slow, unclear, or fragmented risk response.</h2>
        <p>Obserra combines cyber, intelligence, protection, and secure technology expertise so your team can move from assessment to action without losing momentum.</p>
      </section>

      <section className="division-grid">
        {divisions.map((division) => (
          <article className={`division-card ${division.tone}`} key={division.title}>
            <span>{division.number}</span><p>{division.eyebrow}</p><h3>{division.title}</h3><div className="division-rule" />
            <strong>{division.copy}</strong><a href={division.href}>{division.cta}</a>
          </article>
        ))}
      </section>

      <section className="home-service" id="cyber">
        <div>
          <p className="home-eyebrow">CYBERSECURITY AND RISK ADVISORY</p>
          <h2>Turn Cyber Risk Into a Leadership Advantage.</h2>
          <p>From executive cyber leadership and risk assessments to governance, policy design, incident readiness, and board communication, Obserra helps organizations turn security complexity into clear executive action.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Cybersecurity%20Inquiry">Discuss Cyber Priorities</a>
        </div>
        <div className="service-signals"><span>Cyber Risk Strategy</span><span>Executive and Board Briefings</span><span>Incident Readiness</span><span>Governance and Policy</span><span>Digital Exposure Reviews</span><span>Security Transformation</span></div>
      </section>

      <section className="engagement-panel" id="protection">
        <div>
          <p className="home-eyebrow">PROTECTION AND INTELLIGENCE</p>
          <h2>Protect People, Operations, and Reputation Before Risk Becomes Disruption.</h2>
          <p>Obserra provides executive protection planning, protective intelligence, travel risk support, digital exposure reviews, threat informed advisory, and discreet risk support for leaders and organizations. Every engagement begins with the decisions, people, and assets that matter most.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Protection%20and%20Intelligence%20Inquiry">Request Protection Consultation</a>
        </div>
        <div className="engagement-steps">
          <article><span>01</span><h3>Assess What Is at Stake</h3><p>Clarify exposure, decision ownership, and measurable outcomes.</p></article>
          <article><span>02</span><h3>Design the Right Response</h3><p>Integrate intelligence, planning, and disciplined security execution.</p></article>
          <article><span>03</span><h3>Build Lasting Confidence</h3><p>Equip leaders and teams with repeatable readiness and controls.</p></article>
        </div>
      </section>

      <section className="home-service technology-service" id="technologies">
        <div>
          <p className="home-eyebrow">OBSERRA TECHNOLOGIES AND AI NATIVE APPLICATIONS</p>
          <h2>Put Intelligent Technology to Work on High-Value Business Priorities.</h2>
          <p>Obserra designs AI-native applications, intelligent workflows, dashboards, and decision experiences around your most material use case. Solutions can connect to EIOS as an intelligence and governance layer while preserving security boundaries, confidentiality, identity controls, and enterprise standards.</p>
          <p className="technology-emphasis">From one critical workflow to a connected operating model, we turn complexity into governed solutions teams will actually adopt.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Technology%20Build%20Inquiry">Discuss Technology Build</a>
        </div>
        <div className="service-signals"><a href="/eios#capabilities">AI-Native Application Design <b>→</b></a><a href="/eios#outcomes">EIOS-Integrated Workflows <b>→</b></a><a href="/eios#capabilities">Secure Data and Identity Patterns <b>→</b></a><a href="/eios#showcase">Custom Portals and Dashboards <b>→</b></a><a href="/eios#outcomes">Enterprise Automation <b>→</b></a><a href="/eios#showcase">Decision Intelligence <b>→</b></a></div>
      </section>

      <section className="command-showcase">
        <div className="command-visual" aria-label="Obserra EIOS command dashboard preview">
          <header className="command-header">
            <span>OBSERRA EIOS COMMAND SURFACE</span>
            <small>CONTROLLED COMMERCIAL PREVIEW</small>
          </header>
          <div className="command-main-image">
            <Image src="/eios/eios-overview-marketing.png" alt="Obserra EIOS executive dashboard" width={1200} height={675} sizes="(max-width: 1000px) 100vw, 56vw" priority />
          </div>
          <div className="command-metrics">
            <article><span>Decision latency</span><strong>-31%</strong><small>faster executive triage cycles</small></article>
            <article><span>Evidence integrity</span><strong>99.2%</strong><small>audit-ready trace consistency</small></article>
            <article><span>Response orchestration</span><strong>4.7x</strong><small>cross-domain workflow throughput</small></article>
          </div>
        </div>
        <div className="command-copy">
          <p className="home-eyebrow">THE EIOS COMMAND EXPERIENCE</p>
          <h2>An Enterprise Dashboard Leaders Can Actually Operate From.</h2>
          <p>EIOS replaces fragmented reporting with governed command views that align risk context, evidence, approvals, and accountable execution. The result is less noise, faster decisions, and stronger commercial confidence.</p>
          <div className="command-links"><a href="/eios#showcase">Executive Dashboard Walkthroughs <b>→</b></a><a href="/eios#capabilities">Cross-Domain Intelligence Modules <b>→</b></a><a href="/eios#outcomes">Governed Outcome Pathways <b>→</b></a></div>
          <a className="home-button" href="/eios">Explore EIOS</a>
        </div>
      </section>

      <section className="eios-story" aria-labelledby="eios-story-title">
        <video className="eios-story-video" autoPlay muted loop playsInline preload="metadata" poster="/brand/visuals/obserra-eios-intelligence-hero.png" aria-label="Original EIOS intelligence visual reel">
          <source src="/brand/media/eios-intelligence-story.mp4" type="video/mp4" />
        </video>
        <div className="eios-story-scrim" />
        <div className="eios-story-copy">
          <p className="home-eyebrow">THE EIOS INTELLIGENCE STORY</p>
          <h2 id="eios-story-title">See the Signal. Align the Decision. Prove the Outcome.</h2>
          <p>EIOS is designed to connect enterprise context, evidence, risk, policy, and accountable action into a disciplined decision path—not another disconnected view of the business.</p>
          <ol className="eios-story-path">
            <li><span>01</span><strong>Connect the Context</strong><small>Bring facts, relationships, and evidence into view.</small></li>
            <li><span>02</span><strong>Govern the Response</strong><small>Compare options through policy, approvals, and accountability.</small></li>
            <li><span>03</span><strong>Verify the Outcome</strong><small>Preserve a defensible record of what happened and why.</small></li>
          </ol>
          <div className="eios-story-actions"><a className="home-button" href="/eios">Explore the EIOS Experience</a><span>Original Obserra visual reel · Controlled product narrative</span></div>
        </div>
      </section>

      <section className="academy-home" id="academy">
        <div className="academy-heading"><p className="home-eyebrow">OBSERRA TRAINING ACADEMY</p><h2>Training That Gives Teams a Stronger Next Move.</h2><p>Choose a paid, self-paced course designed around realistic decisions, not passive slides. Every course includes interactive lessons, real-world context, learning checks, a 25-question final assessment, and an Obserra Certificate of Training for learners who meet the completion standard.</p><a className="home-button" href="/academy">Browse Training Academy</a></div>
        <div className="track-grid">{courseTracks.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><a href="/academy">See Training Academy courses</a></article>)}</div>
        <small>Courses are proprietary Obserra training. Completion certificates record successful training completion and do not grant licensure, accredited academic credit, or third party certification.</small>
      </section>

      <section className="organic-reach" aria-labelledby="organic-reach-title"><div><p className="home-eyebrow">SHARE WITH DECISION-MAKERS</p><h2 id="organic-reach-title">Send this page to the leaders who own cyber, protection, and enterprise risk decisions.</h2><p>Use these share links to quickly route Obserra services, applications, and training options to executive buyers and stakeholders.</p></div><div className="organic-reach-links"><a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dlinkedin%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Share on LinkedIn <b>↗</b></a><a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dfacebook%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Share on Facebook <b>↗</b></a><a href="https://x.com/intent/post?text=Explore%20Obserra%20enterprise%20intelligence%2C%20cybersecurity%2C%20and%20professional%20training.&url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dx%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Share on X <b>↗</b></a><a href="mailto:?subject=Obserra%20Enterprise%20Intelligence&body=Explore%20Obserra%20enterprise%20intelligence%20and%20cybersecurity%20services%3A%20https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Demail%26utm_medium%3Dreferral%26utm_campaign%3Dfree_growth_distribution">Share by email <b>→</b></a><a href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Executive%20Consultation">Request executive consultation <b>→</b></a></div></section>

      <section className="home-connect" id="connect">
        <p className="home-eyebrow">START YOUR ENGAGEMENT</p><h2>Get senior expertise on the table<br />before risk gets more expensive.</h2><p>If your team is facing cyber, protection, intelligence, or readiness pressure, Obserra can scope an immediate path to action with clear ownership and outcomes.</p>
        <div><a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Consultation">Book executive consultation</a><a className="home-outline" href="/services">Review service engagements</a></div>
      </section>

      <footer className="home-footer"><Image src="/brand/obserra-logo.png" width={180} height={35} alt="Obserra Executive Protection and Intelligence LLC" /><p>Copyright Obserra Executive Protection &amp; Intelligence LLC. Property of Obserra. EIOS, Academy materials, visual assets, and related product content are proprietary and may not be reproduced, distributed, recorded, or used without prior written approval.</p></footer>
    </main>
  );
}
