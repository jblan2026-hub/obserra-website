import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifiedCredentials from "./VerifiedCredentials";
import ObserrianDoctrineFeature from "../components/publications/ObserrianDoctrineFeature";
import { OBSERRIAN_DOCTRINE } from "../../lib/publications";
import { LEGAL_ENTITY_NAME } from "../../lib/legal-identity";
import "./about.css";
import "./about-extra.css";
import "./about-executive.css";
import "./about-visual-repair.css";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: `About Dr. Jody Blanchard | ${LEGAL_ENTITY_NAME}`,
  description: `Learn about Dr. Jody Blanchard, founder and owner of ${LEGAL_ENTITY_NAME}, two-time Fortune 500 CISO, retired U.S. Army intelligence officer, author, and leadership researcher.`,
  alternates: { canonical: "/about" },
  keywords: ["Dr. Jody Blanchard", "The Obserrian Doctrine", "executive stewardship", "executive cybersecurity advisor", "enterprise risk leadership", "protective intelligence", LEGAL_ENTITY_NAME],
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
  { title: "CNBC Technology Executive Council TEC Talk", summary: "Completed December 12, 2024, on upskilling the workforce in the age of artificial intelligence.", label: "Completed executive panel", image: "/leadership/technology-talks-no-employer.png", alt: "Dr. Jody Blanchard at the CNBC Technology Executive Council TEC Talk on December 12, 2024" },
  { title: "Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty", summary: "Completed ISE East Summit and Awards fireside discussion on measurable security value.", label: "Completed fireside discussion", image: "/leadership/fireside-chat-neutral.png", alt: "Dr. Jody Blanchard at the ISE East Summit and Awards cybersecurity return on investment fireside chat" },
  { title: "HMG Strategy Global Leadership Institute Awards, 2025", summary: "Named a 2025 winner for executive leadership in cybersecurity and enterprise risk governance.", label: "Executive recognition", image: "/leadership/global-leadership-award-2025.png", alt: "Dr. Jody Blanchard HMG Strategy Global Leadership Institute Awards 2025 winner recognition" },
] as const;

const executiveProfile = [
  ["Founder and Owner", LEGAL_ENTITY_NAME],
  ["Executive cybersecurity leadership", "Two-time Fortune 500 Chief Information Security Officer"],
  ["Military leadership", "Retired U.S. Army intelligence officer with 21 years of service"],
  ["Education", "Ph.D. in Organizational Leadership"],
] as const;

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", url: "https://www.obserrallc.com/about", name: `About Dr. Jody Blanchard | ${LEGAL_ENTITY_NAME}`, description: `Executive biography and verified professional profile for Dr. Jody Blanchard, founder and owner of ${LEGAL_ENTITY_NAME}.`, isPartOf: { "@id": "https://www.obserrallc.com/#website" } },
      { "@type": "Person", name: "Dr. Jody Blanchard", jobTitle: "Founder and Owner", worksFor: { "@type": "Organization", name: LEGAL_ENTITY_NAME, url: "https://www.obserrallc.com" }, image: "https://www.obserrallc.com/leadership/dr-jody-blanchard-about.png", url: "https://www.obserrallc.com/about", award: "EC-Council Certified Ethical Hacker Hall of Fame 2025", hasCredential: [
        { "@type": "EducationalOccupationalCredential", name: "Private Investigator", credentialCategory: "Florida FDACS License", identifier: "C 3600281" },
        { "@type": "EducationalOccupationalCredential", name: "Security Officer", credentialCategory: "Florida FDACS License", identifier: "D 3617216" },
        { "@type": "EducationalOccupationalCredential", name: "Security Officer School Instructor", credentialCategory: "Florida FDACS License", identifier: "DI3600107" },
        { "@type": "EducationalOccupationalCredential", name: "Statewide Firearms License", credentialCategory: "Florida FDACS License", identifier: "G 3604219" },
      ] },
      { "@type": "Organization", "@id": "https://www.obserrallc.com/#organization", name: LEGAL_ENTITY_NAME, hasCredential: [{ "@type": "EducationalOccupationalCredential", name: "Class A Private Investigative Agency", credentialCategory: "Florida FDACS License", identifier: "A 3600146" }] },
      { "@type": "Book", name: OBSERRIAN_DOCTRINE.fullTitle, description: [OBSERRIAN_DOCTRINE.hook, ...OBSERRIAN_DOCTRINE.overview, OBSERRIAN_DOCTRINE.digitalTwinDescription, OBSERRIAN_DOCTRINE.futureStatement, OBSERRIAN_DOCTRINE.accountabilityStatement].join(" "), isbn: OBSERRIAN_DOCTRINE.isbn, image: `https://www.obserrallc.com${OBSERRIAN_DOCTRINE.coverPath}`, url: OBSERRIAN_DOCTRINE.amazonUrl, author: { "@type": "Person", name: OBSERRIAN_DOCTRINE.author }, identifier: { "@type": "PropertyValue", propertyID: "ASIN", value: OBSERRIAN_DOCTRINE.asin } },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Executive leadership" />
      <main className="about-page about-executive-page enterprise-page-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
        <section className="about-executive-hero">
          <div className="about-executive-portrait"><Image src="/leadership/dr-jody-blanchard-about.png" width={266} height={466} quality={95} sizes="(max-width: 800px) 76vw, 320px" priority alt={`Dr. Jody Blanchard, Founder and Owner of ${LEGAL_ENTITY_NAME}`} /></div>
          <div className="about-executive-copy">
            <p className="about-kicker">ABOUT DR. JODY BLANCHARD</p><h1>Dr. Jody Blanchard</h1>
            <p className="about-executive-role">Founder and Owner, {LEGAL_ENTITY_NAME}</p>
            <p className="about-executive-lede">Dr. Jody Blanchard is a two-time Fortune 500 CISO and a retired U.S. Army intelligence officer with 21 years of service. He is also an author, educator, and researcher in organizational leadership.</p>
            <p className="about-executive-lede">Today, he works with boards and executive teams to clarify risk, make sound decisions, and turn those decisions into action.</p>
            <div className="about-actions"><Link href="/contact?interest=enterprise-consultation" className="about-button">Talk about your priorities</Link><Link href="/speaking" className="about-outline">See speaking topics</Link></div>
          </div>
        </section>
        <section className="about-executive-facts" aria-label="Executive profile highlights">{executiveProfile.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
        <section className="about-proof-section about-proof-credentials" aria-labelledby="credentials-heading"><div className="about-proof-heading"><div><p className="about-kicker">VERIFIED CREDENTIALS AND LICENSES</p><h2 id="credentials-heading">Credentials and licenses you can verify.</h2></div><p>Use the links below to review credentials and Florida licenses with their official issuers.</p></div><VerifiedCredentials /></section>
        <section className="about-proof-section" aria-labelledby="recognition-heading">
          <div className="about-proof-heading"><div><p className="about-kicker">AWARDS AND RECOGNITION</p><h2 id="recognition-heading">Recognition for work in cybersecurity and leadership.</h2></div><p>Selected awards and honors for ethical hacking, cybersecurity leadership, and enterprise risk.</p></div>
          <div className="about-proof-rail about-award-rail">{recognition.map(([label, award, image]) => <article key={award} className="about-proof-card about-award-card"><Image src={image} alt={`${award} recognition badge`} width={420} height={260} sizes="(max-width: 700px) 74vw, 300px" /><span>{label}</span><h3>{award}</h3></article>)}<article className="about-proof-card about-award-card about-award-certificate" id="ceh-hall-of-fame-title"><Image src="/recognition/ceh-hall-of-fame-2025-certificate.jpg" width={1750} height={1383} alt="EC-Council CEH Hall of Fame 2025 certificate presented to Jody Blanchard, certificate HOF-2025-1500089" sizes="(max-width: 700px) 76vw, 330px" /><span>ISSUER-BACKED CERTIFICATE</span><h3>EC-Council Certified Ethical Hacker Hall of Fame 2025</h3><p>Certificate HOF-2025-1500089, issued July 1, 2025</p><a href="https://www.eccouncil.org/ceh-hall-of-fame-2025/" target="_blank" rel="noreferrer">Verify on EC-Council&apos;s official Hall of Fame page</a></article></div>
        </section>
        <section className="about-proof-section about-proof-media" aria-labelledby="leadership-heading">
          <div className="about-proof-heading"><div><p className="about-kicker">LEADERSHIP IN PRACTICE</p><h2 id="leadership-heading">Selected talks, panels, and professional recognition.</h2></div><p>A look at Dr. Blanchard&apos;s public work and the conversations he brings to executive audiences.</p></div>
          <div className="about-proof-rail about-media-rail">
            <article className="about-proof-card about-media-card about-linkedin-card">
              <Image
                className="about-linkedin-image"
                src="/leadership/tampa-ciso-community-speaking-engagement.png"
                width={541}
                height={321}
                sizes="(max-width: 700px) 76vw, 292px"
                unoptimized
                alt="Tampa CISO Community collaboration featuring Rosemary Ravinal, Dr. Jody Blanchard, Alfredo Pena, and Rob Patchett"
              />
              <span>UPCOMING SPEAKING ENGAGEMENT</span>
              <h3>Tampa CISO Community collaboration</h3>
              <p>Dr. Blanchard joins cybersecurity leaders for an upcoming Tampa CISO Community engagement.</p>
              <a href="https://www.linkedin.com/feed/update/urn:li:ugcPost:7500897970922504192" target="_blank" rel="noopener noreferrer">View the speaking announcement on LinkedIn</a>
            </article>
            <article className="about-proof-card about-media-card about-media-feature"><Image src="/leadership/ceh-hall-of-fame-2025.png" alt="Dr. Jody Blanchard CEH Hall of Fame 2025 magazine cover" width={680} height={848} sizes="(max-width: 700px) 74vw, 300px" /><span>CEH HALL OF FAME, TOP 100</span><h3>CEH Hall of Fame 2025 magazine cover</h3><p>EC-Council recognition for outstanding performance and contribution to ethical hacking.</p></article>{leadershipMedia.map((item) => <article key={item.title} className="about-proof-card about-media-card"><Image src={item.image} alt={item.alt} width={720} height={480} sizes="(max-width: 700px) 76vw, 320px" /><span>{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p></article>)}
          </div>
        </section>
        <section className="about-proof-section about-proof-books" aria-labelledby="books-heading">
          <div className="about-proof-heading"><div><p className="about-kicker">PUBLISHED AUTHOR</p><h2 id="books-heading">Books for leaders facing hard decisions.</h2></div><p>Dr. Blanchard writes about cybersecurity, institutional performance, responsible technology, and the responsibilities leaders cannot hand off.</p></div>
          <div className="about-books-grid"><ObserrianDoctrineFeature context="about" /><article className="about-book-card"><Image src="/books/cyberbulleys-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" /><div><span>CYBERSECURITY LEADERSHIP</span><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noopener noreferrer">View CyberBulleys on Amazon</a></div></article><article className="about-book-card"><Image src="/books/break-the-system-front.png" width={350} height={520} sizes="(max-width: 520px) 105px, 150px" alt="Cover of Break the System" /><div><span>LEADERSHIP &amp; SYSTEMS</span><h3>Break the System</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noopener noreferrer">View Break the System on Amazon</a></div></article></div>
        </section>
        <section className="about-executive-closing"><div><p className="about-kicker">EXECUTIVE VALUE</p><h2>Bring a seasoned perspective to the next decision.</h2></div><p>{LEGAL_ENTITY_NAME} works with leaders on cybersecurity, intelligence, protection, governance, and technology.</p><Link href="/contact?interest=enterprise-consultation">Start a conversation</Link></section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
