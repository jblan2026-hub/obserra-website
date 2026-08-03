import type { Metadata } from "next";
import Image from "next/image";
import "./about.css";
import "./about-extra.css";

export const metadata: Metadata = {
  title: "About Obserra | Executive Leadership, Protection & Intelligence",
  description: "Meet Dr. Jody Blanchard, founder of Obserra Executive Protection & Intelligence LLC, and explore the executive experience behind Obserra protection, intelligence, cybersecurity, technology, and training services.",
};

const recognition = [
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2023", "/recognition/top-global-ciso-2023.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2024", "/recognition/top-global-ciso-2024.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2025", "/recognition/top-global-ciso-2025.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2024", "/recognition/a100-2024.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2026", "/recognition/a100-2026.jpg"],
];

const expertise = [
  ["Cybersecurity leadership", "Enterprise cyber strategy, risk governance, resilience, incident readiness, and executive communication."],
  ["Protective intelligence", "Risk-informed support for executives, travel, digital exposure, people, and high-consequence decisions."],
  ["Enterprise intelligence", "Evidence grounded analysis that helps leaders connect context, risk, action, and accountability."],
  ["Secure technology", "AI-native applications, governed workflows, and decision experiences built around the business need."],
];

const credentials = [
  ["ADG Verified in Defend", "ADG Defend"],
  ["ADG Verified in Adopt", "ADG Adopt"],
  ["ADG Verified in Govern", "ADG Govern"],
  ["CompTIA SecurityX", "SecurityX"],
  ["CompTIA Project+", "Project+"],
  ["Certified Data Privacy Solutions Engineer", "CDPSE"],
  ["Associate Certified Chief Information Security Officer", "CCISO"],
  ["EC Council Certified Incident Handler", "ECIH"],
  ["EC Council Certified Encryption Specialist", "ECES"],
  ["Computer Hacking Forensic Investigator", "CHFI"],
  ["Certified Ethical Hacker", "CEH"],
  ["CompTIA Advanced Security Practitioner", "CASP+"],
  ["Certification in Risk and Information Systems Control", "CRISC"],
  ["Certified Information Systems Auditor", "CISA"],
  ["Certified Information Security Manager", "CISM"],
  ["Systems Security Certified Practitioner", "SSCP"],
  ["Certified Information Systems Security Professional", "CISSP"],
  ["Florida Class C Security Officer License", "Class C"],
  ["Florida Class D Security Officer License", "Class D"],
  ["Florida Class G Statewide Firearm License", "Class G"],
  ["Florida Class DI Security Officer Instructor License", "Class DI"],
  ["Florida Concealed Weapon or Firearm License", "CCWL"],
];

export default function AboutPage() {
  return <main className="about-page">
    <header className="about-nav"><a href="/" className="about-brand"><Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="Obserra Executive Protection and Intelligence LLC" /></a><nav><a href="/">Home</a><a href="/eios">EIOS</a><a href="/academy">Academy</a><a href="#speaking">Speaking</a><a href="mailto:info@obserrallc.com?subject=Obserra%20Consultation" className="about-nav-cta">Talk with Obserra</a></nav></header>

    <section className="about-hero"><div className="about-grid" /><div><p className="about-kicker">OBSERRA LEADERSHIP</p><h1>Experience you can put to work when the decision matters.</h1><p>Obserra Executive Protection &amp; Intelligence LLC is led by Dr. Jody Blanchard, an award-winning cybersecurity and intelligence executive who brings enterprise leadership, protective thinking, and practical operational discipline to complex security challenges.</p><div className="about-actions"><a href="mailto:info@obserrallc.com?subject=Obserra%20Consultation" className="about-button">Start a confidential conversation</a><a href="/academy" className="about-link">Explore Academy</a></div></div><aside className="about-signal"><span>DR. JODY BLANCHARD</span><strong>Founder &amp; CEO</strong><p>Global cybersecurity leader, U.S. Army veteran, intelligence professional, educator, and author</p></aside></section>

    <section className="about-profile"><div className="profile-visual profile-photo-frame"><Image className="profile-photo" src="/leadership/dr-jody-blanchard-executive.webp" width={1200} height={1500} quality={95} sizes="(max-width: 1000px) 86vw, 520px" priority alt="Dr. Jody Blanchard, Founder and CEO of Obserra Executive Protection and Intelligence LLC" /><div className="profile-photo-label"><span>DR. JODY BLANCHARD</span><strong>FOUNDER &amp; CEO</strong><small>CYBER, SECURITY, AND INTELLIGENCE</small></div></div><div><p className="about-kicker">FOUNDER PROFILE</p><h2>A security executive shaped by real decisions and real consequence.</h2><p>Dr. Jody Blanchard brings senior cybersecurity leadership together with a background in military intelligence, protective operations, governance, and education. He helps leaders turn complex risk into a clear, accountable response that can be understood, acted on, and defended.</p><p>His experience spans global enterprise cybersecurity, intelligence, investigations, risk governance, and operational leadership. Supported by doctoral study in organizational leadership, graduate study in information management and cybersecurity, and a criminal justice foundation, Dr. Blanchard brings both strategic range and practical judgment to the work. He is also the author of <em>CyberBulleys: A CISO's Guide to Doing Cybersecurity</em> and <em>Break the System</em>.</p><a className="about-button" href="mailto:info@obserrallc.com?subject=Executive%20Consultation%20with%20Obserra">Discuss an executive engagement</a></div></section>

    <section className="books"><div className="books-heading"><p className="about-kicker">BOOKS BY DR. JODY BLANCHARD</p><h2>Ideas for leaders who need to make security work.</h2><p>Explore Dr. Blanchard&apos;s writing on cybersecurity leadership, risk, and the systems that shape real-world outcomes.</p></div><div className="books-grid"><article><div className="book-cover actual-cover"><Image src="/books/cyberbulleys-front.png" fill sizes="(max-width: 650px) 220px, 210px" alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity by Dr. Jody Blanchard" /></div><div><p>CYBERSECURITY LEADERSHIP</p><h3>CyberBulleys: A CISO's Guide to Doing Cybersecurity</h3><span>By Dr. Jody Blanchard</span><a href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noreferrer">Buy on Amazon</a></div></article><article><div className="book-cover actual-cover"><Image src="/books/break-the-system-front.png" fill sizes="(max-width: 650px) 220px, 210px" alt="Cover of Break the System by Dr. Jody Blanchard" /></div><div><p>LEADERSHIP &amp; SYSTEMS</p><h3>Break the System</h3><span>By Dr. Jody Blanchard</span><a href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noreferrer">Buy on Amazon</a></div></article></div></section>

    <section className="credentials"><div className="credentials-heading"><p className="about-kicker">LICENSES &amp; PROFESSIONAL CREDENTIALS</p><h2>Credentials stated clearly.</h2><p>Each credential is shown with its full name and the acronym you may see in professional settings. Credential identifiers are intentionally not published.</p></div><div className="credentials-grid">{credentials.map(([name, acronym]) => <article key={acronym}><span>{acronym}</span><h3>{name}</h3><p>({acronym})</p></article>)}</div></section>

    <section className="recognition"><div className="recognition-heading"><p className="about-kicker">RECOGNITION &amp; CREDIBILITY</p><h2>Recognized for cybersecurity leadership and industry impact.</h2><p>Obserra carries the credibility of real executive, cyber, security, and intelligence experience into every engagement, training experience, and technology conversation.</p></div><div className="recognition-grid">{recognition.map(([label, award, image], index) => <article key={award}><span>0{index + 1}</span><img src={image} alt={`${award} recognition badge`} /><p>{label}</p><h3>{award}</h3></article>)}</div></section>

    <section className="leadership-media"><div className="leadership-media-heading"><p className="about-kicker">LEADERSHIP IN PRACTICE</p><h2>CEH Hall of Fame recognition. Executive perspective. Public leadership.</h2><p>Dr. Jody Blanchard brings recognized cybersecurity leadership, practical executive insight, and a clear voice to boardrooms, industry conversations, and high-stakes decision environments.</p></div><div className="leadership-media-grid"><article className="hall-of-fame-feature"><img src="/leadership/ceh-hall-of-fame-2025.png" alt="Dr. Jody Blanchard CEH Hall of Fame Top 100 2025 recognition" /><div><span>CEH HALL OF FAME · TOP 100</span><h3>CEH Hall of Fame, 2025</h3><p>A defining independent cybersecurity leadership recognition.</p></div></article><article><img src="/leadership/global-leadership-award-2025.png" alt="Dr. Jody Blanchard global leadership award 2025 recognition" /><h3>Global leadership distinction, 2025</h3></article><article><img src="/leadership/technology-talks-no-employer.png" alt="Dr. Jody Blanchard technology workforce panel appearance" /><h3>Technology leadership panel</h3></article><article><img src="/leadership/fireside-chat-neutral.png" alt="Dr. Jody Blanchard cybersecurity return on investment fireside chat" /><h3>Cybersecurity return on investment fireside chat</h3></article></div></section>

    <section className="interview-feature"><div><p className="about-kicker">OBSERRA INTELLIGENCE IN BRIEF</p><h2>Security, intelligence, and governed execution—made clear.</h2><p>Explore the Obserra visual story: connected enterprise context, practical executive decisions, and accountable outcomes. This material is produced and controlled by Obserra without former-employer branding or third-party player dependencies.</p><a className="about-outline" href="/eios">Explore Obserra EIOS</a></div><div className="interview-frame"><span className="interview-watermark" aria-hidden="true">PROPERTY OF OBSERRA · AUTHORIZED VIEWING</span><video src="/brand/media/eios-intelligence-story.mp4" poster="/brand/visuals/obserra-eios-intelligence-hero.png" title="Obserra intelligence visual story" muted loop autoPlay playsInline preload="metadata" /></div></section>

    <section className="expertise"><div><p className="about-kicker">THE OBSERRA EXPERTISE</p><h2>Cybersecurity, security, and intelligence are strongest when they work together.</h2></div><div className="expertise-grid">{expertise.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="speaking" id="speaking"><div className="speaking-visual"><img src="/brand/visuals/obserra-cybersecurity.png" alt="Obserra cybersecurity and intelligence network visual" /><div className="speaking-visual-label"><p>EXECUTIVE BRIEFING</p><strong>OBSERRA</strong><span>CYBERSECURITY · SECURITY · INTELLIGENCE</span></div></div><div><p className="about-kicker">SPEAKING &amp; EXECUTIVE BRIEFINGS</p><h2>Bring a trusted cyber and intelligence voice into the room.</h2><p>Dr. Jody Blanchard is available for executive briefings, board sessions, leadership offsites, conference keynotes, panels, podcasts, and private learning engagements. Sessions are tailored to the audience and designed to leave people with a practical way to think, decide, and act.</p><div className="speaking-topics"><span>Enterprise cyber leadership</span><span>AI governance and responsible innovation</span><span>Protective intelligence and executive risk</span><span>Board ready cyber risk communication</span><span>Security culture and decision accountability</span><span>Veteran leadership and mission focused teams</span></div><a className="about-button" href="mailto:info@obserrallc.com?subject=Obserra%20Speaking%20Engagement%20Request">Request a speaking engagement</a></div></section>

    <section className="about-cta"><p className="about-kicker">ENGAGE OBSERRA</p><h2>Bring a clearer, more capable response to the work in front of you.</h2><p>Explore EIOS, build a secure technology solution, develop your team through Obserra Academy, or begin a confidential conversation about cybersecurity, protective intelligence, or enterprise risk.</p><div><a className="about-button" href="mailto:info@obserrallc.com?subject=Obserra%20Consultation">Talk with Obserra</a><a className="about-outline" href="/academy">View Academy courses</a></div></section>

    <footer className="about-footer"><Image src="/brand/obserra-logo.png" width={180} height={35} alt="Obserra Executive Protection and Intelligence LLC" /><p>Copyright Obserra Executive Protection &amp; Intelligence LLC. Obserra, EIOS, Academy materials, and related visual and product content are proprietary to Obserra. Unauthorized reproduction, distribution, or use is prohibited.</p></footer>
  </main>;
}
