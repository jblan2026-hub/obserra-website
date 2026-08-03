import type { Metadata } from "next";
import Image from "next/image";
import "./home.css";

export const metadata: Metadata = {
  title: "Enterprise Intelligence, Protection, Cybersecurity and Training",
  description:
    "Obserra Executive Protection & Intelligence LLC delivers enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and professional training.",
  alternates: { canonical: "/" },
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
  return (
    <main className="obserra-home">
      <header className="home-nav">
        <a href="/" className="home-brand">
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="Obserra Executive Protection and Intelligence LLC" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#divisions">What we do</a>
          <a href="/eios">EIOS</a>
          <a href="#technologies">Technologies</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/sign-in" className="home-nav-login">Learner sign in</a>
          <a href="#connect" className="home-nav-cta">Talk with Obserra</a>
        </nav>
      </header>

      <section className="home-hero">
        <Image className="home-hero-background" src="/brand/visuals/obserra-eios-intelligence-hero.png" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className="home-grid" />
        <div className="hero-copy">
          <p className="home-eyebrow">VETERAN OWNED · PROPERTY OF OBSERRA</p>
          <h1>When the stakes are high,<br /><em>make the next move count.</em></h1>
          <p>Obserra Executive Protection &amp; Intelligence LLC brings enterprise intelligence, cybersecurity leadership, protective intelligence, secure technology, and practical training together—so leaders can turn complex risk into a clear, accountable next move.</p>
          <div className="home-actions">
            <a className="home-button" href="#connect">Start a confidential conversation</a>
            <a className="home-link" href="/eios">Discover EIOS</a>
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
        <article><span>01</span><p>EXECUTIVE READY</p><strong>Clear decisions for leaders, boards, and high-consequence operations.</strong></article>
        <article><span>02</span><p>SECURE BY DESIGN</p><strong>Confidentiality, accountability, and operational discipline from the beginning.</strong></article>
        <article><span>03</span><p>BUILT TO MOVE</p><strong>Advisory, technology, protection, and training that turn strategy into action.</strong></article>
      </section>

      <section className="home-intro" id="divisions">
        <p className="home-eyebrow">THE OBSERRA ADVANTAGE</p>
        <h2>One trusted partner across risk, intelligence, protection, technology, and learning.</h2>
        <p>Obserra is built for executives, organizations, and professionals who need practical expertise, disciplined execution, and solutions that create confident next steps rather than another layer of uncertainty.</p>
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
          <a className="home-button" href="#connect">Discuss your cyber priorities</a>
        </div>
        <div className="service-signals"><span>Cyber risk strategy</span><span>Executive and board briefings</span><span>Incident readiness</span><span>Governance and policy</span><span>Digital exposure reviews</span><span>Security transformation</span></div>
      </section>

      <section className="engagement-panel" id="protection">
        <div>
          <p className="home-eyebrow">PROTECTION AND INTELLIGENCE</p>
          <h2>Protect people, operations, and reputation before risk becomes disruption.</h2>
          <p>Obserra provides executive protection planning, protective intelligence, travel risk support, digital exposure reviews, threat informed advisory, and discreet risk support for leaders and organizations. Every engagement begins with the decisions, people, and assets that matter most.</p>
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Protection%20and%20Intelligence%20Consultation">Discuss your protection priorities</a>
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
          <a className="home-button" href="mailto:info@obserrallc.com?subject=Custom%20AI%20Native%20Application%20Consultation">Build your application</a>
        </div>
        <div className="service-signals"><span>AI-native application design</span><span>EIOS-integrated workflows</span><span>Secure data and identity patterns</span><span>Custom portals and dashboards</span><span>Enterprise automation</span><span>Decision intelligence</span></div>
      </section>

      <section className="holographic-showcase">
        <div className="holo-visual" aria-label="Illustration of Obserra EIOS intelligence view"><div className="holo-ring ring-one" /><div className="holo-ring ring-two" /><div className="holo-ring ring-three" /><div className="holo-core"><span>OBSERRA</span><strong>EIOS</strong><small>GOVERNED INTELLIGENCE</small></div><div className="holo-node node-one">RISK<br /><b>CONTEXT</b></div><div className="holo-node node-two">EVIDENCE<br /><b>TRACEABILITY</b></div><div className="holo-node node-three">ACTION<br /><b>ACCOUNTABILITY</b></div></div>
        <div className="holo-copy"><p className="home-eyebrow">THE EIOS VISUAL EXPERIENCE</p><h2>Turn complex intelligence into an executive level view.</h2><p>EIOS gives leaders a refined visual way to explore enterprise context, risk, evidence, policy, approvals, and accountable action. It is designed to make important conversations clearer, not to overwhelm people with another dashboard.</p><div className="holo-proof"><span>Executive visual briefings</span><span>Interactive intelligence views</span><span>Governed decision pathways</span></div><a className="home-button" href="/eios">Explore EIOS</a></div>
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

      <section className="home-connect" id="connect">
        <p className="home-eyebrow">START WITH THE RIGHT CONVERSATION</p><h2>Bring the right expertise<br />into the room.</h2><p>Whether you are strengthening cyber resilience, protecting leaders and operations, building enterprise intelligence, or developing your team, Obserra is ready to help you turn an important priority into a clear, credible path forward.</p>
        <div><a className="home-button" href="mailto:info@obserrallc.com?subject=Obserra%20Consultation">Schedule a confidential consultation</a><a className="home-outline" href="/academy">Explore Academy courses</a></div>
      </section>

      <footer className="home-footer"><Image src="/brand/obserra-logo.png" width={180} height={35} alt="Obserra Executive Protection and Intelligence LLC" /><p>Copyright Obserra Executive Protection &amp; Intelligence LLC. Property of Obserra. EIOS, Academy materials, visual assets, and related product content are proprietary and may not be reproduced, distributed, recorded, or used without prior written approval.</p></footer>
    </main>
  );
}
