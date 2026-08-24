import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifiedCredentials from "./VerifiedCredentials";
import { LEGAL_ENTITY_NAME } from "../../lib/legal-identity";
import "./about.css";
import "./about-extra.css";
import "./about-executive.css";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: `About Dr. Jody Blanchard | ${LEGAL_ENTITY_NAME}`,
  description: `Executive biography, credentials, recognition, publications, and public leadership for Dr. Jody Blanchard, founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}.`,
  alternates: { canonical: "/about" },
  keywords: ["Dr. Jody Blanchard", "executive cybersecurity advisor", "enterprise risk leadership", "protective intelligence", LEGAL_ENTITY_NAME],
  openGraph: {
    title: `Dr. Jody Blanchard | Executive Biography`,
    description: `Executive leadership, cybersecurity, intelligence, governance, and public leadership behind ${LEGAL_ENTITY_NAME}.`,
    url: "https://www.obserrallc.com/about",
    type: "profile",
    images: [{ url: "/leadership/dr-jody-blanchard-about.png", width: 266, height: 466, alt: "Dr. Jody Blanchard" }],
  },
};

const recognition = [
  ["EC-COUNCIL RECOGNITION", "Certified Ethical Hacker Hall of Fame, 2025", "/recognition/ceh-hall-of-fame-2025-badge.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2023", "/recognition/top-global-ciso-2023.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2024", "/recognition/top-global-ciso-2024.jpg"],
  ["GLOBAL CYBER LEADERSHIP", "Top Global CISO in the World, 2025", "/recognition/top-global-ciso-2025.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2024", "/recognition/a100-2024.jpg"],
  ["EXECUTIVE COMMUNITY", "A100 Accelerated Winner, 2026", "/recognition/a100-2026.jpg"],
] as const;

const leadershipMedia = [
  {
    title: "CNBC Technology Executive Council TEC Talk",
    summary: "Completed December 12, 2024, on upskilling the workforce in the age of artificial intelligence.",
    label: "Completed executive panel",
    image: "/leadership/technology-talks-no-employer.png",
    alt: "Dr. Jody Blanchard at the CNBC Technology Executive Council TEC Talk on December 12, 2024",
  },
  {
    title: "Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty",
    summary: "Completed ISE East Summit and Awards fireside discussion on measurable security value.",
    label: "Completed fireside discussion",
    image: "/leadership/fireside-chat-neutral.png",
    alt: "Dr. Jody Blanchard at the ISE East Summit and Awards cybersecurity return on investment fireside chat",
  },
  {
    title: "HMG Strategy Global Leadership Institute Awards, 2025",
    summary: "Named a 2025 winner for executive leadership in cybersecurity and enterprise risk governance.",
    label: "Executive recognition",
    image: "/leadership/global-leadership-award-2025.png",
    alt: "Dr. Jody Blanchard HMG Strategy Global Leadership Institute Awards 2025 winner recognition",
  },
] as const;

const executiveProfile = [
  ["Founder and Chief Executive Officer", LEGAL_ENTITY_NAME],
  ["Executive cybersecurity leadership", "Two-time Fortune 500 Chief Information Security Officer"],
  ["Military leadership", "Retired U.S. Army intelligence officer with 21 years of service"],
  ["Education", "Ph.D. in Organizational Leadership"],
] as const;

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: "https://www.obserrallc.com/about",
        name: `About Dr. Jody Blanchard | ${LEGAL_ENTITY_NAME}`,
        description: `Executive biography and verified professional profile for Dr. Jody Blanchard, founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}.`,
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
      },
      {
        "@type": "Person",
        name: "Dr. Jody Blanchard",
        jobTitle: "Founder and Chief Executive Officer",
        worksFor: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: "https://www.obserrallc.com" },
        image: "https://www.obserrallc.com/leadership/dr-jody-blanchard-about.png",
        url: "https://www.obserrallc.com/about",
        award: "EC-Council Certified Ethical Hacker Hall of Fame 2025",
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
      <EnterpriseHeader section="Executive leadership" />
      <main className="about-page about-executive-page enterprise-page-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />

        <section className="about-executive-hero">
          <div className="about-executive-portrait">
            <Image src="/leadership/dr-jody-blanchard-about.png" width={266} height={466} quality={95} sizes="(max-width: 800px) 76vw, 320px" priority alt={`Dr. Jody Blanchard, Founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}`} />
          </div>
          <div className="about-executive-copy">
            <p className="about-kicker">EXECUTIVE BIOGRAPHY</p>
            <h1>Dr. Jody Blanchard</h1>
            <p className="about-executive-role">Founder &amp; Chief Executive Officer · {LEGAL_ENTITY_NAME}</p>
            <p className="about-executive-lede">Executive cybersecurity leader, retired U.S. Army intelligence officer, author, educator, and enterprise advisor with experience leading complex security, intelligence, governance, protection, and transformation work in regulated and high-consequence environments.</p>
            <p className="about-executive-lede">He helps boards and executive teams connect risk, business priorities, operational reality, and accountable execution so decisions are clearer, ownership is explicit, and follow-through can be measured.</p>
            <div className="about-actions"><Link href="/contact?interest=enterprise-consultation" className="about-button">Request executive consultation</Link><Link href="/speaking" className="about-outline">View speaker profile</Link></div>
          </div>
        </section>

        <section className="about-executive-facts" aria-label="Executive profile highlights">
          {executiveProfile.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
        </section>

        <section className="about-proof-section about-proof-credentials" aria-labelledby="credentials-heading">
          <div className="about-proof-heading">
            <div><p className="about-kicker">VERIFIED CREDENTIALS &amp; LICENSES</p><h2 id="credentials-heading">The professional evidence stays visible.</h2></div>
            <p>Issuer-backed cybersecurity, risk, privacy, audit, technology, EC-Council, and Florida professional credentials remain on the page and link to their verification sources.</p>
          </div>
          <VerifiedCredentials />
        </section>

        <section className="about-proof-section" aria-labelledby="recognition-heading">
          <div className="about-proof-heading">
            <div><p className="about-kicker">AWARDS &amp; RECOGNITION</p><h2 id="recognition-heading">Recognized executive leadership and cybersecurity impact.</h2></div>
            <p>Every existing award image remains visible. Scroll the rail horizontally to review the complete recognition set without extending the page vertically.</p>
          </div>
          <div className="about-proof-rail about-award-rail">
            {recognition.map(([label, award, image]) => (
              <article key={award} className="about-proof-card about-award-card">
                <Image src={image} alt={`${award} recognition badge`} width={420} height={260} sizes="(max-width: 700px) 74vw, 300px" />
                <span>{label}</span><h3>{award}</h3>
              </article>
            ))}
            <article className="about-proof-card about-award-card about-award-certificate" id="ceh-hall-of-fame-title">
              <Image src="/recognition/ceh-hall-of-fame-2025-certificate.jpg" width={1750} height={1383} alt="EC-Council CEH Hall of Fame 2025 certificate presented to Jody Blanchard, certificate HOF-2025-1500089" sizes="(max-width: 700px) 76vw, 330px" />
              <span>ISSUER-BACKED CERTIFICATE</span><h3>EC-Council Certified Ethical Hacker Hall of Fame 2025</h3>
              <a href="https://www.eccouncil.org/ceh-hall-of-fame-2025/" target="_blank" rel="noreferrer">Verify with EC-Council</a>
            </article>
          </div>
        </section>

        <section className="about-proof-section about-proof-media" aria-labelledby="leadership-heading">
          <div className="about-proof-heading">
            <div><p className="about-kicker">PUBLIC LEADERSHIP &amp; MEDIA</p><h2 id="leadership-heading">Selected appearances and leadership evidence.</h2></div>
            <p>Completed panels, fireside discussions, executive recognition, and Hall of Fame imagery remain visible as part of the executive profile.</p>
          </div>
          <div className="about-proof-rail about-media-rail">
            <article className="about-proof-card about-media-card about-media-feature">
              <Image src="/leadership/ceh-hall-of-fame-2025.png" alt="Dr. Jody Blanchard CEH Hall of Fame 2025 magazine cover" width={680} height={848} sizes="(max-width: 700px) 74vw, 300px" />
              <span>CEH HALL OF FAME · TOP 100</span><h3>CEH Hall of Fame 2025 magazine cover</h3><p>EC-Council recognition for outstanding performance and contribution to ethical hacking.</p>
            </article>
            {leadershipMedia.map((item) => (
              <article key={item.title} className="about-proof-card about-media-card">
                <Image src={item.image} alt={item.alt} width={720} height={480} sizes="(max-width: 700px) 76vw, 320px" />
                <span>{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-proof-section about-proof-books" aria-labelledby="books-heading">
          <div className="about-proof-heading">
            <div><p className="about-kicker">PUBLISHED AUTHOR</p><h2 id="books-heading">Books by Dr. Jody Blanchard.</h2></div>
            <p>Executive writing on cybersecurity leadership, institutional systems, and accountability. Purchase links remain prominent and clearly separated from non-commerce actions.</p>
          </div>
          <div className="about-books-grid">
            <article className="about-book-card">
              <Image src="/books/cyberbulleys-front.png" width={350} height={520} alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" />
              <div><span>CYBERSECURITY LEADERSHIP</span><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noreferrer">Buy now</a></div>
            </article>
            <article className="about-book-card">
              <Image src="/books/break-the-system-front.png" width={350} height={520} alt="Cover of Break the System" />
              <div><span>LEADERSHIP &amp; SYSTEMS</span><h3>Break the System</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noreferrer">Buy now</a></div>
            </article>
          </div>
        </section>

        <section className="about-executive-closing"><div><p className="about-kicker">EXECUTIVE VALUE</p><h2>Experience that connects the decision, the risk, and the execution.</h2></div><p>{LEGAL_ENTITY_NAME} brings that leadership perspective into cybersecurity, intelligence, governance, protection, secure technology, and enterprise decision support.</p><Link href="/services">Explore Obserra EPI services →</Link></section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
