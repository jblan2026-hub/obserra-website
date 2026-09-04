import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import { LEGAL_ENTITY_NAME } from "../../lib/legal-identity";
import ObserrianDoctrineFeature from "../components/publications/ObserrianDoctrineFeature";
import "./speaking.css";
import "./speaker-executive.css";

export const metadata: Metadata = {
  title: "Speaking | Dr. Jody Blanchard",
  description: "Book Dr. Jody Blanchard, author of The Obserrian Doctrine, for keynotes, board briefings, panels, podcasts, and executive sessions on cybersecurity, AI governance, enterprise risk, protective intelligence, and leadership.",
  alternates: { canonical: "/speaking" },
};

const topics = [
  ["Executive Cybersecurity Leadership", "Board and executive decision-making, accountability, investment discipline, resilience, and measurable security value."],
  ["AI Governance and Responsible Innovation", "Secure adoption, human oversight, enterprise accountability, risk, and practical business value."],
  ["Executive Protection and Protective Intelligence", "Cyber, physical, travel, reputational, and human risk around leaders and high-consequence operations."],
  ["Board-Ready Risk Communication", "Translate complex technical and operational exposure into clear choices, ownership, and measurable action."],
  ["Organizational Leadership and Transformation", "Build trust, alignment, accountability, and disciplined execution through change."],
  ["Veteran Leadership and Mission Focus", "Apply mission-focused leadership, resilience, accountability, and team-performance principles."],
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
            <p className="speaker-kicker">EXECUTIVE SPEAKER · BOARD BRIEFINGS · KEYNOTES</p>
            <h1>Dr. Jody Blanchard</h1>
            <p className="speaker-executive-role">Cybersecurity · AI governance · enterprise risk · protective intelligence · leadership</p>
            <p className="speaker-executive-lede">A two-time Fortune 500 Chief Information Security Officer, retired U.S. Army intelligence officer, Ph.D. in Organizational Leadership, published author, and enterprise advisor who translates complex risk into practical executive decisions.</p>
            <p className="speaker-executive-lede">Each engagement is tailored to the audience and built to leave leaders with clearer questions, stronger decision principles, and actions they can apply immediately.</p>
            <div className="speaker-actions"><Link href="/contact?interest=speaking" className="speaker-button">Request speaking engagement</Link><Link href="/about" className="speaker-outline">Review executive bio</Link></div>
          </div>
        </section>

        <section className="speaker-executive-formats" aria-label="Speaking formats">{formats.map(([title, copy]) => <article key={title}><strong>{title}</strong><span>{copy}</span></article>)}</section>

        <section className="speaker-proof-section" aria-labelledby="speaker-topics-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">SIGNATURE TOPICS</p><h2 id="speaker-topics-heading">Executive content built around decisions leaders actually face.</h2></div><p>Each topic is tailored to the audience, sector, and format, with a focus on practical executive decisions.</p></div>
          <div className="speaker-proof-rail speaker-topic-rail">{topics.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="speaker-proof-section" aria-labelledby="speaker-engagements-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">COMPLETED ENGAGEMENTS &amp; RECOGNITION</p><h2 id="speaker-engagements-heading">Selected appearances and professional recognition.</h2></div><p>Panels, fireside discussions, and recognized leadership experience inform every engagement.</p></div>
          <div className="speaker-proof-rail speaker-media-rail">
            <article className="speaker-media-card speaker-media-feature"><Image src="/leadership/ceh-hall-of-fame-2025.png" width={680} height={848} alt="Dr. Jody Blanchard CEH Hall of Fame 2025 magazine cover" sizes="(max-width: 700px) 74vw, 300px" /><span>CEH HALL OF FAME · TOP 100</span><h3>CEH Hall of Fame 2025 magazine cover</h3><p>EC-Council recognition for outstanding performance and contribution to ethical hacking.</p><Link href="/about#ceh-hall-of-fame-title">Review verified recognition →</Link></article>
            {engagements.map((item) => <article key={item.title} className="speaker-media-card"><Image src={item.image} width={720} height={480} alt={item.alt} sizes="(max-width: 700px) 76vw, 320px" /><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
          </div>
        </section>

        <section className="speaker-proof-section speaker-books-section" aria-labelledby="speaker-books-heading">
          <div className="speaker-proof-heading"><div><p className="speaker-kicker">PUBLISHED AUTHOR</p><h2 id="speaker-books-heading">Books that extend the conversation beyond the stage.</h2></div><p>Executive writing on cybersecurity leadership, institutional systems, and accountability, with direct purchase actions.</p></div>
          <div className="speaker-books-grid">
            <ObserrianDoctrineFeature context="speaking" />
            <article><Image src="/books/cyberbulleys-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" /><div><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noopener noreferrer">View CyberBulleys on Amazon</a></div></article>
            <article><Image src="/books/break-the-system-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of Break the System" /><div><h3>Break the System</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noopener noreferrer">View Break the System on Amazon</a></div></article>
          </div>
        </section>

        <section className="speaker-executive-booking"><div><p className="speaker-kicker">BOOKING &amp; MEDIA REQUESTS</p><h2>Bring an experienced executive voice to the room.</h2></div><p>Keynotes, board briefings, panels, podcasts, media interviews, workshops, and private leadership sessions are coordinated through {LEGAL_ENTITY_NAME}.</p><Link href="/contact?interest=speaking" className="speaker-button">Start a speaking request</Link></section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
