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
    title: "EIOS",
    eyebrow: "Enterprise intelligence operating system",
    copy: "A governed enterprise intelligence experience that gives leaders stronger visibility, better decisions, and accountable outcomes.",
    cta: "Explore EIOS",
    href: "/eios",
    tone: "signal",
  },
  {
    number: "02",
    title: "Cybersecurity",
    eyebrow: "Strategy, governance, and resilience",
    copy: "Executive cybersecurity strategy, cyber-risk visibility, incident readiness, governance, and board-ready advisory services.",
    cta: "Explore cybersecurity",
    href: "#cyber",
    tone: "blue",
  },
  {
    number: "03",
    title: "Protection and Intelligence",
    eyebrow: "Protective intelligence and risk advisory",
    copy: "Executive protection, travel risk, digital exposure reviews, protective intelligence, and discreet risk support for people and organizations.",
    cta: "Explore protection",
    href: "#protection",
    tone: "gold",
  },
  {
    number: "04",
    title: "Obserra Academy",
    eyebrow: "Paid professional training",
    copy: "Interactive learning across cybersecurity, protection, intelligence, and Obserra Technologies with a 25 question assessment and an Obserra Certificate of Training after successful completion.",
    cta: "View all courses",
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
          <a href="/eios">EIOS</a>
          <a href="/apps">Applications</a>
          <a href="#technologies">Technologies</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/academy" className="home-nav-login">Academy courses</a>
          <a href="#connect" className="home-nav-cta">Talk with Obserra</a>
        </nav>
      </header>

      <section className="home-hero">
        <Image className="home-hero-background" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className="home-grid" />
        <div className="hero-copy">
          <p className="home-eyebrow">VETERAN OWNED · PROPERTY OF OBSERRA</p>
          <h1>When exposure is enterprise-critical,<br /><em>buy clarity that drives action.</em></h1>
          <p>Obserra Executive Protection &amp; Intelligence LLC delivers commercial-grade intelligence, cybersecurity leadership, protective intelligence, secure technology, and practical training so decision-makers can reduce risk faster and execute with measurable confidence.</p>
          <div className="home-actions">
            <a className="home-button" href="#connect">Request executive consultation</a>
            <a className="home-link" href="/eios">Review EIOS commercial briefing</a>
          </div>
        </div>
        <aside className="hero-proof">
          <p>BUILT FOR DECISIONS THAT CANNOT WAIT</p>
          <div><strong>Enterprise intelligence</strong><span>See the context, risk, and decision path with greater clarity.</span></div>
            <div><strong>Secure technology</strong><span>Build custom AI-native applications around measurable business outcomes.</span></div>
          <div><strong>Cyber resilience</strong><span>Strengthen governance, readiness, and executive confidence.</span></div>
          <div><strong>Protective intelligence</strong><span>Reduce exposure across people, travel, digital presence, and operations.</span></div>
            <div><strong>Professional training</strong><span>Develop capability through paid, interactive, certificate-based learning.</span></div>
        </aside>
      </section>

      <section className="trust-rail" aria-label="Obserra engagement standards">
        <article><span>01</span><p>COMMERCIAL READY</p><strong>Engagement models built for executive sponsors, operating teams, and procurement stakeholders.</strong></article>
        <article><span>02</span><p>SECURE BY DESIGN</p><strong>Confidentiality, accountability, and governance discipline integrated from day one.</strong></article>
        <article><span>03</span><p>OUTCOME DRIVEN</p><strong>Advisory, technology, protection, and training aligned to measurable business and risk outcomes.</strong></article>
      </section>

      <section className="home-intro" id="divisions">
        <p className="home-eyebrow">THE OBSERRA ADVANTAGE</p>
        <h2>One enterprise partner across risk, intelligence, protection, technology, and workforce capability.</h2>
        <p>Obserra is built for organizations that need commercial-grade delivery, executive accountability, and practical execution that translates strategy into observable operational and financial value.</p>
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
          <h2>Make cyber risk a leadership advantage.</h2>
          <p>From executive cyber leadership and cyber risk assessments to governance, policy design, incident readiness, and board communication, Obserra helps organizations turn security complexity into clear executive action.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Cybersecurity%20Inquiry">Discuss your cyber priorities</a>
        </div>
        <div className="service-signals"><span>Cyber risk strategy</span><span>Executive and board briefings</span><span>Incident readiness</span><span>Governance and policy</span><span>Digital exposure reviews</span><span>Security transformation</span></div>
      </section>

      <section className="engagement-panel" id="protection">
        <div>
          <p className="home-eyebrow">PROTECTION AND INTELLIGENCE</p>
          <h2>Protect people, operations, and reputation before risk becomes disruption.</h2>
          <p>Obserra provides executive protection planning, protective intelligence, travel risk support, digital exposure reviews, threat informed advisory, and discreet risk support for leaders and organizations. Every engagement begins with the decisions, people, and assets that matter most.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Protection%20and%20Intelligence%20Inquiry">Request a protection consultation</a>
        </div>
        <div className="engagement-steps">
          <article><span>01</span><h3>Assess what is at stake</h3><p>Clarify the exposure, priority, decision owner, and desired outcome.</p></article>
          <article><span>02</span><h3>Design the right response</h3><p>Bring intelligence, planning, and disciplined security expertise into one clear plan.</p></article>
          <article><span>03</span><h3>Build lasting confidence</h3><p>Give leaders and teams practical readiness, tools, and training they can use.</p></article>
        </div>
      </section>

      <section className="home-service technology-service" id="technologies">
        <div>
          <p className="home-eyebrow">OBSERRA TECHNOLOGIES AND AI NATIVE APPLICATIONS</p>
          <h2>Put intelligent technology to work on the business problems holding you back.</h2>
          <p>Obserra designs custom AI-native applications, intelligent workflows, dashboards, and decision experiences around your highest-value problem—not a generic template. Each solution can connect to EIOS as an intelligence and governance layer while respecting data boundaries, confidentiality, identity, and security requirements.</p>
          <p className="technology-emphasis">From one critical workflow to a connected operating experience, we turn complex challenges into governed solutions people will want to use.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Technology%20Build%20Inquiry">Discuss your technology build</a>
        </div>
        <div className="service-signals"><a href="/eios#capabilities">AI-native application design <b>→</b></a><a href="/eios#outcomes">EIOS-integrated workflows <b>→</b></a><a href="/eios#capabilities">Secure data and identity patterns <b>→</b></a><a href="/eios#showcase">Custom portals and dashboards <b>→</b></a><a href="/eios#outcomes">Enterprise automation <b>→</b></a><a href="/eios#showcase">Decision intelligence <b>→</b></a></div>
      </section>

      <section className="holographic-showcase">
        <div className="holo-visual" aria-label="Interactive Obserra EIOS decision model">
          <div className="holo-ring ring-one" /><div className="holo-ring ring-two" /><div className="holo-ring ring-three" /><div className="holo-beam" />
          <a className="holo-core" href="/eios" aria-label="Explore Obserra EIOS"><span>OBSERRA</span><strong>EIOS</strong><small>GOVERNED INTELLIGENCE</small></a>
          <a className="holo-node node-one" href="/eios#capabilities">RISK<br /><b>CONTEXT</b></a>
          <a className="holo-node node-two" href="/eios#capabilities">EVIDENCE<br /><b>TRACEABILITY</b></a>
          <a className="holo-node node-three" href="/eios#outcomes">ACTION<br /><b>ACCOUNTABILITY</b></a>
          <a className="holo-node node-four" href="/eios#outcomes">DECISION<br /><b>GOVERNANCE</b></a>
          <a className="holo-node node-five" href="/eios#outcomes">OUTCOME<br /><b>VERIFIED</b></a>
          <p className="holo-instruction">Select a signal to explore the governed decision loop.</p>
        </div>
        <div className="holo-copy"><p className="home-eyebrow">THE EIOS VISUAL EXPERIENCE</p><h2>Turn complex intelligence into an executive level view.</h2><p>EIOS gives leaders a refined visual way to explore enterprise context, risk, evidence, policy, approvals, and accountable action. It is designed to make important conversations clearer, not to overwhelm people with another dashboard.</p><div className="holo-proof"><a href="/eios#showcase">Executive visual briefings <b>→</b></a><a href="/eios#capabilities">Interactive intelligence views <b>→</b></a><a href="/eios#outcomes">Governed decision pathways <b>→</b></a></div><a className="home-button" href="/eios">Explore EIOS</a></div>
      </section>

      <section className="eios-story" aria-labelledby="eios-story-title">
        <video className="eios-story-video" autoPlay muted loop playsInline preload="metadata" poster="/brand/visuals/obserra-eios-intelligence-hero.png" aria-label="Original EIOS intelligence visual reel">
          <source src="/brand/media/eios-intelligence-story.mp4" type="video/mp4" />
        </video>
        <div className="eios-story-scrim" />
        <div className="eios-story-copy">
          <p className="home-eyebrow">THE EIOS INTELLIGENCE STORY</p>
          <h2 id="eios-story-title">See the signal. Align the decision. Prove the outcome.</h2>
          <p>EIOS is designed to connect enterprise context, evidence, risk, policy, and accountable action into a disciplined decision path—not another disconnected view of the business.</p>
          <ol className="eios-story-path">
            <li><span>01</span><strong>Connect the context</strong><small>Bring the facts, relationships, and evidence into view.</small></li>
            <li><span>02</span><strong>Govern the response</strong><small>Compare options through policy, approval, and accountability.</small></li>
            <li><span>03</span><strong>Verify the outcome</strong><small>Preserve a defensible record of what happened and why.</small></li>
          </ol>
          <div className="eios-story-actions"><a className="home-button" href="/eios">Explore the EIOS experience</a><span>Original Obserra visual reel · Controlled product narrative</span></div>
        </div>
      </section>

      <section className="academy-home" id="academy">
        <div className="academy-heading"><p className="home-eyebrow">OBSERRA ACADEMY</p><h2>Training that gives people a stronger next move.</h2><p>Choose a paid, self-paced course designed around realistic decisions, not passive slides. Every course includes interactive lessons, real-world context, learning checks, a 25-question final assessment, and an Obserra Certificate of Training for learners who meet the completion standard.</p><a className="home-button" href="/academy">Browse the Academy</a></div>
        <div className="track-grid">{courseTracks.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><a href="/academy">See courses</a></article>)}</div>
        <small>Courses are proprietary Obserra training. Completion certificates record successful training completion and do not grant licensure, accredited academic credit, or third party certification.</small>
      </section>

      <section className="organic-reach" aria-labelledby="organic-reach-title"><div><p className="home-eyebrow">FREE GROWTH AND AD DISTRIBUTION LINKS</p><h2 id="organic-reach-title">Activate free demand generation channels that can drive qualified leads.</h2><p>Use these free links to publish tracked posts and messages with built-in UTM attribution. Teams can measure traffic and lead origin by source, medium, and campaign without paying for tooling.</p></div><div className="organic-reach-links"><a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dlinkedin%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Launch LinkedIn post (tracked) <b>↗</b></a><a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dfacebook%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Launch Facebook post (tracked) <b>↗</b></a><a href="https://x.com/intent/post?text=Explore%20Obserra%20enterprise%20intelligence%2C%20cybersecurity%2C%20and%20professional%20training.&url=https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Dx%26utm_medium%3Dorganic_social%26utm_campaign%3Dfree_growth_distribution" target="_blank" rel="noreferrer">Launch X post (tracked) <b>↗</b></a><a href="mailto:?subject=Obserra%20Enterprise%20Intelligence&body=Explore%20Obserra%20enterprise%20intelligence%20and%20cybersecurity%20services%3A%20https%3A%2F%2Fwww.obserrallc.com%2F%3Futm_source%3Demail%26utm_medium%3Dreferral%26utm_campaign%3Dfree_growth_distribution">Send tracked referral email <b>→</b></a><a href="mailto:info@obserrallc.com?subject=Free%20Lead%20Generation%20and%20Advertising%20Strategy%20Session">Request free growth strategy session <b>→</b></a></div></section>

      <section className="home-connect" id="connect">
        <p className="home-eyebrow">START YOUR COMMERCIAL ENGAGEMENT</p><h2>Bring decision-grade expertise<br />into critical priorities.</h2><p>Whether your objective is cyber resilience, executive protection, enterprise intelligence, or workforce enablement, Obserra will help you scope a commercially sound path from first conversation to accountable execution.</p>
        <div><a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Consultation">Schedule executive consultation</a><a className="home-outline" href="/academy">Explore paid Academy programs</a></div>
      </section>

      <footer className="home-footer"><Image src="/brand/obserra-logo.png" width={180} height={35} alt="Obserra Executive Protection and Intelligence LLC" /><p>Copyright Obserra Executive Protection &amp; Intelligence LLC. Property of Obserra. EIOS, Academy materials, visual assets, and related product content are proprietary and may not be reproduced, distributed, recorded, or used without prior written approval.</p></footer>
    </main>
  );
}
