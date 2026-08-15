import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifiedCredentials from "./VerifiedCredentials";
import { LEGAL_ENTITY_NAME } from "../../lib/legal-identity";
import "./about.css";
import "./about-extra.css";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: `About ${LEGAL_ENTITY_NAME} | Executive Leadership for High-Consequence Decisions`,
  description: `Meet Dr. Jody Blanchard, founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}, and review the leadership experience behind its cybersecurity, intelligence, governance, protection, and technology work.`,
  alternates: { canonical: "/about" },
  keywords: [`about ${LEGAL_ENTITY_NAME}`, "Dr. Jody Blanchard", "executive cybersecurity advisor", "enterprise risk leadership", "protective intelligence"],
  openGraph: {
    title: `About ${LEGAL_ENTITY_NAME} | Executive Leadership for High-Consequence Decisions`,
    description: `Executive leadership, business judgment, and integrated security expertise behind ${LEGAL_ENTITY_NAME}.`,
    url: "https://www.obserrallc.com/about",
    type: "profile",
    images: [{ url: "/leadership/dr-jody-blanchard-about.png", width: 266, height: 466, alt: "Dr. Jody Blanchard" }],
  },
};

const recognition = [
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2023", "/recognition/top-global-ciso-2023.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2024", "/recognition/top-global-ciso-2024.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2025", "/recognition/top-global-ciso-2025.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2024", "/recognition/a100-2024.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2026", "/recognition/a100-2026.jpg"],
];

const businessReasons = [
  ["Enterprise problems cross organizational boundaries", "Cybersecurity, operational risk, executive exposure, governance, and technology decisions are often managed separately even when the business impact is shared."],
  ["Boards need decision clarity, not additional noise", `${LEGAL_ENTITY_NAME} translates technical, intelligence, regulatory, and operational signals into a defensible executive decision path.`],
  ["Execution must survive scrutiny", "Recommendations are designed around ownership, evidence, governance, measurable outcomes, and the realities of implementation."],
  ["Leadership capacity is often the constraint", `${LEGAL_ENTITY_NAME} provides senior judgment and focused execution when organizations need experienced leadership without adding permanent overhead.`],
];

const expertise = [
  ["Executive cybersecurity leadership", "Enterprise cyber strategy, risk governance, resilience, incident readiness, investment prioritization, and board communication."],
  ["Protective and enterprise intelligence", "Decision-ready intelligence for executives, travel, digital exposure, emerging threats, and high-consequence operations."],
  ["Governance and accountable execution", "Operating models, decision rights, evidence, policy, approvals, and implementation discipline that reduce uncertainty."],
  ["Secure technology and AI", "Secure-by-design applications, AI governance, governed workflows, and executive intelligence experiences tied to business outcomes."],
];

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: "https://www.obserrallc.com/about",
        name: `About ${LEGAL_ENTITY_NAME} | Executive Leadership for High-Consequence Decisions`,
        description: `Leadership profile and organizational background for ${LEGAL_ENTITY_NAME}.`,
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
      },
      {
        "@type": "Person",
        name: "Dr. Jody Blanchard",
        jobTitle: "Founder and Chief Executive Officer",
        worksFor: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: "https://www.obserrallc.com" },
        image: "https://www.obserrallc.com/leadership/dr-jody-blanchard-about.png",
        url: "https://www.obserrallc.com/about",
        hasCredential: [
          { "@type": "EducationalOccupationalCredential", name: "Private Investigator", credentialCategory: "Florida FDACS License", identifier: "C 3600281" },
          { "@type": "EducationalOccupationalCredential", name: "Security Officer", credentialCategory: "Florida FDACS License", identifier: "D 3617216" },
          { "@type": "EducationalOccupationalCredential", name: "Security Officer School Instructor", credentialCategory: "Florida FDACS License", identifier: "DI3600107" },
          { "@type": "EducationalOccupationalCredential", name: "Statewide Firearms License", credentialCategory: "Florida FDACS License", identifier: "G 3604219" },
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Leadership and company" />
      <main className="about-page enterprise-page-main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />

      <section className="about-hero">
        <div className="about-grid" />
        <div className="about-hero-copy">
          <p className="about-kicker">EXECUTIVE LEADERSHIP FOR COMPLEX RISK</p>
          <h1>{LEGAL_ENTITY_NAME} exists because critical business decisions rarely fit inside one function.</h1>
          <p>Cybersecurity, intelligence, executive protection, governance, technology, and operational risk converge at the moment leaders must act. {LEGAL_ENTITY_NAME} gives organizations a senior, integrated decision partner that can connect those disciplines, clarify what matters, and move from uncertainty to accountable execution.</p>
          <div className="about-actions"><Link href="/contact?interest=enterprise-consultation" className="about-button">Start an executive conversation</Link><Link href="/services" className="about-link">Explore how {LEGAL_ENTITY_NAME} helps</Link></div>
        </div>
        <aside className="about-signal"><span>WHY {LEGAL_ENTITY_NAME}</span><strong>Senior judgment.<br />Integrated expertise.<br />Accountable outcomes.</strong><p>Built for organizations facing material risk, fragmented ownership, or decisions that cannot wait for another disconnected assessment.</p></aside>
      </section>

      <EnterpriseProofBand />

      <section className="about-profile">
        <div className="founder-profile-card">
          <div className="profile-visual profile-photo-frame"><Image className="profile-photo" src="/leadership/dr-jody-blanchard-about.png" width={266} height={466} quality={95} sizes="(max-width: 800px) 86vw, 360px" priority alt={`Dr. Jody Blanchard, Founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}`} /></div>
          <div className="profile-photo-label"><span>DR. JODY BLANCHARD</span><strong>FOUNDER &amp; CHIEF EXECUTIVE OFFICER</strong><small>EXECUTIVE CYBERSECURITY · INTELLIGENCE · GOVERNANCE</small></div>
        </div>
        <div>
          <p className="about-kicker">FOUNDER &amp; BUSINESS EXECUTIVE</p>
          <h2>Executive experience designed to create business value, not another layer of advice.</h2>
          <p>Dr. Jody Blanchard is an award-winning business and cybersecurity executive, two-time Fortune 500 Chief Information Security Officer, former military intelligence leader, author, and educator. Across more than 25 years of leadership in complex and regulated environments, he has built, transformed, and governed security and risk programs where business continuity, reputation, regulatory exposure, technology investment, and human safety were directly connected.</p>
          <p>His value to clients is the ability to see the whole decision. He combines enterprise strategy, cybersecurity, intelligence analysis, governance, financial and operational judgment, executive communication, and disciplined execution to identify what is material, define who must act, and build a path that can withstand board, customer, regulator, and operational scrutiny.</p>
          <p>{LEGAL_ENTITY_NAME} was created to give organizations access to that integrated capability. The company connects senior advisory, protective intelligence, secure technology, professional learning, and governed implementation support. Each engagement is designed around an explicit decision, defined authority, controlled information boundaries, accountable delivery, and evidence of accepted work.</p>
          <div className="about-actions"><Link className="about-button" href="/contact?interest=enterprise-consultation">Book an executive consultation</Link><Link className="about-outline" href="/apps">Explore {LEGAL_ENTITY_NAME} applications</Link></div>
        </div>
      </section>

      <section className="expertise"><div><p className="about-kicker">THE BUSINESS CASE FOR {LEGAL_ENTITY_NAME}</p><h2>Organizations need integrated leadership when the risk is shared but accountability is fragmented.</h2></div><div className="expertise-grid">{businessReasons.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section className="expertise"><div><p className="about-kicker">EXECUTIVE CAPABILITIES</p><h2>One leadership model across cybersecurity, intelligence, governance, protection, and secure technology.</h2></div><div className="expertise-grid">{expertise.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section className="credentials"><VerifiedCredentials /></section>

      <section className="recognition">
        <div className="recognition-heading"><p className="about-kicker">RECOGNITION &amp; CREDIBILITY</p><h2>Recognized for cybersecurity leadership and industry impact.</h2><p>Independent recognition reinforces the executive judgment, technical depth, and public leadership brought to {LEGAL_ENTITY_NAME} clients.</p></div>
        <div className="recognition-grid">{recognition.map(([label, award, image], index) => <article key={award}><span>0{index + 1}</span><Image src={image} alt={`${award} recognition badge`} width={420} height={260} sizes="(max-width: 700px) 90vw, 380px" /><p>{label}</p><h3>{award}</h3></article>)}</div>
      </section>

      <section className="books">
        <div className="books-heading"><p className="about-kicker">BOOKS BY DR. JODY BLANCHARD</p><h2>Ideas for leaders responsible for making security work.</h2><p>Executive writing on cybersecurity leadership, institutional systems, and the practical realities of accountability.</p></div>
        <div className="books-grid">
          <article><div className="book-cover actual-cover"><Image src="/books/cyberbulleys-front.png" fill sizes="(max-width: 650px) 220px, 210px" alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" /></div><div><p>CYBERSECURITY LEADERSHIP</p><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><span>By Dr. Jody Blanchard</span><a href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noreferrer">Buy on Amazon</a></div></article>
          <article><div className="book-cover actual-cover"><Image src="/books/break-the-system-front.png" fill sizes="(max-width: 650px) 220px, 210px" alt="Cover of Break the System" /></div><div><p>LEADERSHIP &amp; SYSTEMS</p><h3>Break the System</h3><span>By Dr. Jody Blanchard</span><a href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noreferrer">Buy on Amazon</a></div></article>
        </div>
      </section>

      <section className="speaking" id="speaking">
        <div className="speaking-visual"><Image src="/brand/visuals/obserra-cybersecurity.png" alt={`${LEGAL_ENTITY_NAME} cybersecurity and intelligence network visual`} width={1200} height={680} sizes="(max-width: 700px) 90vw, 560px" /><div className="speaking-visual-label"><p>EXECUTIVE BRIEFING</p><strong>{LEGAL_ENTITY_NAME}</strong><span>CYBERSECURITY · SECURITY · INTELLIGENCE</span></div></div>
        <div><p className="about-kicker">SPEAKING &amp; EXECUTIVE BRIEFINGS</p><h2>Bring an experienced executive voice into the room.</h2><p>Dr. Blanchard provides board briefings, leadership offsites, conference keynotes, panels, podcasts, and private learning sessions focused on practical decisions, accountable leadership, and enterprise outcomes.</p><div className="speaking-topics"><span>Enterprise cyber leadership</span><span>AI governance and responsible innovation</span><span>Protective intelligence and executive risk</span><span>Board-ready risk communication</span><span>Security culture and decision accountability</span><span>Veteran leadership and mission-focused teams</span></div><Link className="about-button" href="/contact?interest=speaking">Request a speaking engagement</Link></div>
      </section>

      <section className="about-cta"><p className="about-kicker">ENGAGE {LEGAL_ENTITY_NAME}</p><h2>Bring integrated executive leadership to the risk, decision, or transformation in front of you.</h2><p>Begin with a confidential consultation, evaluate an application, strengthen the workforce through Obserra Academy, or engage {LEGAL_ENTITY_NAME} for focused cybersecurity, intelligence, governance, protection, and enterprise-risk support.</p><div><Link className="about-button" href="/contact?interest=enterprise-consultation">Talk with {LEGAL_ENTITY_NAME}</Link><Link className="about-outline" href="/academy">View Academy courses</Link></div></section>

      </main>
      <EnterpriseFooter />
    </>
  );
}
