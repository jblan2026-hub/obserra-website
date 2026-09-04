import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import ObserrianDoctrineFeature from "../components/publications/ObserrianDoctrineFeature";
import "./speaking.css";
import "./speaker-executive.css";

export const metadata: Metadata = {
  title: "Dr. Jody Blanchard | Executive Keynotes & Board Briefings",
  description: "Invite Dr. Jody Blanchard to speak on cybersecurity, AI, enterprise risk, protective intelligence, and leadership. Available for keynotes, board briefings, panels, podcasts, and private sessions.",
  alternates: { canonical: "/speaking" },
};

const topics = [
  ["Executive Cybersecurity Leadership", "What boards and executives should ask, own, and measure, and how security spending supports resilience."],
  ["AI Governance and Responsible Innovation", "How to move faster with AI without giving up human judgment, security, or accountability."],
  ["Executive Protection and Protective Intelligence", "How cyber, physical, travel, and reputational threats connect around leaders and critical operations."],
  ["Board Ready Risk Communication", "How to explain complex risk in plain language, frame the tradeoffs, and leave the room with clear owners and next steps."],
  ["Organizational Leadership and Transformation", "How to keep people aligned and accountable when roles, systems, and expectations are changing."],
  ["Veteran Leadership and Mission Focus", "What mission focus, preparation, and team discipline can teach leaders in any organization."],
] as const;

const engagements = [
  { title: "CNBC Technology Executive Council TEC Talk", copy: "Completed December 12, 2024, on upskilling the workforce in the age of artificial intelligence.", label: "COMPLETED ENGAGEMENT", image: "/leadership/technology-talks-no-employer.png", alt: "Dr. Jody Blanchard at the CNBC Technology Executive Council TEC Talk on December 12, 2024" },
  { title: "Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty", copy: "Completed ISE East Summit & Awards fireside discussion on measurable security value.", label: "COMPLETED ENGAGEMENT", image: "/leadership/fireside-chat-neutral.png", alt: "Dr. Jody Blanchard at the ISE East Summit and Awards cybersecurity return on investment fireside chat" },
  { title: "HMG Strategy Global Leadership Institute Awards, 2025", copy: "Named a 2025 winner for executive leadership in cybersecurity and enterprise risk governance.", label: "EXECUTIVE RECOGNITION", image: "/leadership/global-leadership-award-2025.png", alt: "Dr. Jody Blanchard HMG Strategy Global Leadership Institute Awards 2025 winner recognition" },
] as const;

const formats = [
  ["Keynotes", "Executive and conference audiences"],
  ["Board briefings", "Private leadership and governance sessions"],
  ["Panels & podcasts", "Expert discussion and media formats"],
  ["Workshops", "Interactive executive and team sessions"],
] as const;

export default function SpeakingPage() {
  return (
    <>
      <EnterpriseHeader section="Executive speaker" />
      <main className="speaker-page speaker-executive-page enterprise-page-main">
        <section className="speaker-executive-hero">
          <div className="speaker-executive-portrait"><Image src="/leadership/dr-jody-blanchard-speaking.png" width={273} height={422} quality={95} priority sizes="(max-width: 900px) 76vw, 320px" alt="Dr. Jody Blanchard, executive keynote speaker" /></div>
          <div className="speaker-executive-copy">
            <p className="speaker-kicker">EXECUTIVE SPEAKER AND BOARD ADVISOR</p>
            <h1>Dr. Jody Blanchard</h1>
            <p className="speaker-executive-role">Straight talk on cybersecurity, AI, risk, and leadership.</p>
            <p className="speaker-executive-lede">Dr. Blanchard is a two-time Fortune 500 CISO and retired U.S. Army intelligence officer. He holds a Ph.D. in Organizational Leadership and writes about leadership, risk, and institutional trust.</p>
            <p className="speaker-executive-lede">Every talk is built for the audience, not taken off the shelf. The goal is simple: make a difficult issue easier to understand and act on.</p>
            <div className="speaker-actions"><Link href="/contact?interest=speaking" className="speaker-button">Ask about availability</Link><Link href="/about" className="speaker-outline">Read Dr. Blanchard&apos;s bio</Link></div>
          </div>
        </section>

        <section className="speaker-executive-formats" aria-label="Speaking formats">{formats.map(([title, copy]) => <article key={title}><strong>{title}</strong><span>{copy}</span></article>)}</section>

        <section className="speaker-proof-section" aria-labelledby="speaker-topics-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">SIGNATURE TOPICS</p><h2 id="speaker-topics-heading">Talks that help leaders make better decisions.</h2></div><p>Each session is shaped around the audience, the organization, and the decisions in front of them.</p></div>
          <div className="speaker-proof-rail speaker-topic-rail">{topics.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="speaker-proof-section" aria-labelledby="speaker-engagements-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">SELECTED ENGAGEMENTS AND RECOGNITION</p><h2 id="speaker-engagements-heading">Experience that gives the conversation weight.</h2></div><p>Dr. Blanchard brings lessons from the field, the boardroom, and years of leading through change.</p></div>
          <div className="speaker-proof-rail speaker-media-rail">
            <article className="speaker-media-card speaker-media-feature"><Image src="/leadership/ceh-hall-of-fame-2025.png" width={680} height={848} alt="Dr. Jody Blanchard CEH Hall of Fame 2025 magazine cover" sizes="(max-width: 700px) 74vw, 300px" /><span>CEH HALL OF FAME, TOP 100</span><h3>CEH Hall of Fame 2025 magazine cover</h3><p>EC-Council recognition for outstanding performance and contribution to ethical hacking.</p><Link href="/about#ceh-hall-of-fame-title">Review verified recognition</Link></article>
            {engagements.map((item) => <article key={item.title} className="speaker-media-card"><Image src={item.image} width={720} height={480} alt={item.alt} sizes="(max-width: 700px) 76vw, 320px" /><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
          </div>
        </section>

        <section className="speaker-proof-section speaker-books-section" aria-labelledby="speaker-books-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">PUBLISHED AUTHOR</p><h2 id="speaker-books-heading">Keep the conversation going.</h2></div><p>Dr. Blanchard&apos;s books give readers practical ideas they can revisit and use after the session.</p></div>
          <div className="speaker-books-grid">
            <ObserrianDoctrineFeature context="speaking" />
            <article><Image src="/books/cyberbulleys-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" /><div><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noopener noreferrer">View CyberBulleys on Amazon</a></div></article>
            <article><Image src="/books/break-the-system-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of Break the System" /><div><h3>Break the System</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noopener noreferrer">View Break the System on Amazon</a></div></article>
          </div>
        </section>

        <section className="speaker-executive-booking"><div><p className="speaker-kicker">BOOKING AND MEDIA REQUESTS</p><h2>Give your audience something useful to take back to work.</h2></div><p>Ask about keynotes, board briefings, panels, podcasts, workshops, or private leadership sessions.</p><Link href="/contact?interest=speaking" className="speaker-button">Ask about availability</Link></section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
