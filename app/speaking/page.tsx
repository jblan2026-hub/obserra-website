import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./speaking.css";

export const metadata: Metadata = {
  title: "Speaking | Dr. Jody Blanchard",
  description: "Book Dr. Jody Blanchard for keynotes, board briefings, panels, podcasts, and executive sessions on cybersecurity, artificial intelligence governance, enterprise risk, protection, and leadership.",
  alternates: { canonical: "/speaking" },
};

const topics = [
  ["Executive Cybersecurity Leadership", "Board and executive decision making, accountability, investment discipline, and resilience."],
  ["Artificial Intelligence Governance and Responsible Innovation", "Secure adoption, human oversight, business value, and enterprise artificial intelligence accountability."],
  ["Executive Protection and Protective Intelligence", "Cyber, physical, travel, reputational, and human risk around leaders and operations."],
  ["Board Ready Risk Communication", "Translating complex risk into clear choices, ownership, and measurable action."],
  ["Organizational Leadership and Transformation", "Building trust, alignment, and disciplined execution in high consequence environments."],
  ["Veteran Leadership and Mission Focus", "Applying mission command, resilience, accountability, and team performance principles."],
];

const highlights = [
  ["2x", "Fortune 500 Chief Information Security Officer"], ["21", "Years U.S. Army service"], ["Ph.D.", "Organizational Leadership"],
  ["2", "Published books"], ["20+", "Credentials and licenses"], ["Global", "Leadership recognition"],
];

export default function SpeakingPage() {
  return <main className="speaker-page">
    <header className="speaker-nav">
      <Link href="/"><Image src="/brand/obserra-logo.png" width={280} height={54} priority alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" /></Link>
      <nav><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/academy">Academy</Link><Link href="/contact?interest=speaking" className="speaker-nav-cta">Book Dr. Blanchard</Link></nav>
    </header>

    <section className="speaker-hero">
      <div className="speaker-portrait">
        <Image src="/leadership/dr-jody-blanchard-executive.webp" width={1200} height={1500} priority sizes="(max-width: 900px) 88vw, 410px" alt="Dr. Jody Blanchard, executive keynote speaker" />
        <div><span>DR. JODY BLANCHARD, PH.D.</span><strong>EXECUTIVE SPEAKER AND ADVISOR</strong></div>
      </div>
      <div><p className="speaker-kicker">BOOK DR. JODY BLANCHARD</p><h1>Executive insight for leaders responsible for complex decisions.</h1><p>Dr. Jody Blanchard brings the perspective of a two-time Fortune 500 Chief Information Security Officer, retired U.S. Army leader, doctoral researcher, published author, and enterprise advisor to keynotes, board sessions, leadership events, panels, podcasts, and private executive briefings.</p><p>Every engagement is tailored to the audience and designed to leave leaders with a clearer way to think, decide, communicate, and act.</p><div className="speaker-actions"><Link href="/contact?interest=speaking" className="speaker-button">Request a speaking engagement</Link><a href="#topics" className="speaker-outline">Explore speaking topics</a></div></div>
    </section>

    <section className="speaker-metrics">{highlights.map(([value,label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</section>

    <section className="speaker-intro"><div><p className="speaker-kicker">EXECUTIVE SPEAKER PROFILE</p><h2>Credible experience. Business relevant content. Practical outcomes.</h2></div><div><p>Dr. Blanchard speaks to the realities leaders face when cybersecurity, artificial intelligence, governance, enterprise risk, executive protection, workforce readiness, and organizational performance collide.</p><p>Audiences leave with sharper questions, clearer decision principles, and a stronger understanding of how leadership systems shape security, resilience, trust, and enterprise value.</p></div></section>

    <section className="speaker-topics" id="topics"><p className="speaker-kicker">SIGNATURE TOPICS</p><h2>Built for boards, executives, technology leaders, security teams, and mission focused organizations.</h2><div className="speaker-topic-grid">{topics.map(([title,copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="speaker-gallery"><p className="speaker-kicker">SPEAKING AND LEADERSHIP IN PRACTICE</p><h2>Authentic executive presence.</h2><div className="speaker-gallery-grid">
      <article><Image src="/leadership/technology-talks-no-employer.png" width={720} height={480} alt="Technology leadership panel" /><h3>Technology leadership panel</h3><p>Workforce transformation, governance, and strategic technology execution.</p></article>
      <article><Image src="/leadership/fireside-chat-neutral.png" width={720} height={480} alt="Cybersecurity value fireside conversation" /><h3>Cybersecurity value discussion</h3><p>Measurable security value, risk ownership, and executive accountability.</p></article>
      <article><Image src="/leadership/global-leadership-award-2025.png" width={720} height={480} alt="Global leadership recognition" /><h3>Global leadership recognition</h3><p>Recognized executive leadership in cybersecurity and enterprise risk governance.</p></article>
    </div></section>

    <section className="speaker-books"><div><p className="speaker-kicker">PUBLISHED AUTHOR</p><h2>Books that extend the conversation beyond the stage.</h2></div><div className="speaker-book-grid">
      <article><Image src="/books/cyberbulleys-front.png" width={350} height={520} alt="CyberBulleys book cover" /><div><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><a href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noreferrer">View on Amazon</a></div></article>
      <article><Image src="/books/break-the-system-front.png" width={350} height={520} alt="Break the System book cover" /><div><h3>Break the System</h3><a href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noreferrer">View on Amazon</a></div></article>
    </div></section>

    <section className="speaker-recognition"><div><p className="speaker-kicker">RECOGNITION</p><h2>Recognized executive leadership and cybersecurity impact.</h2></div><div className="speaker-recognition-card"><Image src="/leadership/ceh-hall-of-fame-2025.png" width={680} height={420} alt="CEH Hall of Fame Top 100 2025 recognition" /><div><span>CEH HALL OF FAME · TOP 100</span><h3>A credible executive voice supported by recognized industry leadership.</h3><p>Global cybersecurity recognition, executive awards, doctoral research, advisory service, and more than two decades of operational leadership.</p></div></div></section>

    <section className="speaker-booking"><p className="speaker-kicker">BOOKING AND MEDIA REQUESTS</p><h2>Bring an experienced executive voice to your next event.</h2><p>Use one inquiry path for keynotes, board briefings, panels, podcasts, media interviews, workshops, and private leadership sessions.</p><div className="speaker-actions"><Link href="/contact?interest=speaking" className="speaker-button">Start a speaking request</Link><Link href="/about" className="speaker-outline">Review executive credentials</Link></div></section>

    <footer className="speaker-footer"><Image src="/brand/obserra-logo.png" width={190} height={38} alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" /><p>Speaking and media engagements are coordinated through OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC.</p></footer>
  </main>;
}
