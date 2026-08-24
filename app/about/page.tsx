import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifiedCredentials from "./VerifiedCredentials";
import ExecutiveDetailModal from "../components/ui/ExecutiveDetailModal";
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
            <Image
              src="/leadership/dr-jody-blanchard-about.png"
              width={266}
              height={466}
              quality={95}
              sizes="(max-width: 800px) 76vw, 320px"
              priority
              alt={`Dr. Jody Blanchard, Founder and Chief Executive Officer of ${LEGAL_ENTITY_NAME}`}
            />
          </div>
          <div className="about-executive-copy">
            <p className="about-kicker">EXECUTIVE BIOGRAPHY</p>
            <h1>Dr. Jody Blanchard</h1>
            <p className="about-executive-role">Founder &amp; Chief Executive Officer · {LEGAL_ENTITY_NAME}</p>
            <p className="about-executive-lede">
              Executive cybersecurity leader, retired U.S. Army intelligence officer, author, educator, and enterprise advisor with experience leading complex security, risk, governance, and transformation work in regulated and high-consequence environments.
            </p>
            <p className="about-executive-lede">
              His work centers on helping boards and executive teams connect cybersecurity, intelligence, governance, operational risk, technology investment, and accountable execution into clearer business decisions.
            </p>
            <div className="about-actions">
              <Link href="/contact?interest=enterprise-consultation" className="about-button">Request executive consultation</Link>
              <Link href="/speaking" className="about-outline">View speaker profile</Link>
            </div>
          </div>
        </section>

        <section className="about-executive-facts" aria-label="Executive profile highlights">
          {executiveProfile.map(([label, value]) => (
            <article key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </section>

        <section className="about-executive-details" aria-labelledby="about-detail-heading">
          <div className="about-executive-heading">
            <p className="about-kicker">VERIFIED PROFILE</p>
            <h2 id="about-detail-heading">Credentials, recognition, public leadership, and publications.</h2>
            <p>Select a section for the complete evidence and imagery without turning the page into an endless scroll.</p>
          </div>

          <div className="about-executive-detail-grid">
            <ExecutiveDetailModal
              eyebrow="VERIFIED EVIDENCE"
              title="Credentials & professional licenses"
              summary="Issuer-backed cybersecurity, risk, privacy, audit, technology, and Florida professional credentials."
              triggerLabel="Open credentials"
            >
              <div className="about-modal-evidence about-modal-credentials"><VerifiedCredentials /></div>
            </ExecutiveDetailModal>

            <ExecutiveDetailModal
              eyebrow="RECOGNITION"
              title="Awards & recognition"
              summary="Industry recognition, award imagery, Hall of Fame evidence, and issuer verification."
              triggerLabel="Open recognition"
            >
              <div className="about-modal-evidence">
                <div className="about-modal-recognition-grid">
                  {recognition.map(([label, award, image]) => (
                    <article key={award}>
                      <Image src={image} alt={`${award} recognition badge`} width={420} height={260} sizes="(max-width: 700px) 80vw, 300px" />
                      <span>{label}</span>
                      <h3>{award}</h3>
                    </article>
                  ))}
                </div>
                <article className="about-modal-ceh" id="ceh-hall-of-fame-title">
                  <Image src="/recognition/ceh-hall-of-fame-2025-badge.jpg" width={223} height={222} alt="Official EC-Council Certified Ethical Hacker Hall of Fame 2025 badge" />
                  <div>
                    <p className="about-kicker">ISSUER-BACKED RECOGNITION</p>
                    <h3>EC-Council Certified Ethical Hacker Hall of Fame 2025</h3>
                    <p>Presented to Jody Blanchard for outstanding performance and contribution to the field of ethical hacking.</p>
                    <dl><div><dt>Certificate</dt><dd>HOF-2025-1500089</dd></div><div><dt>Issue date</dt><dd>July 1, 2025</dd></div></dl>
                    <a href="https://www.eccouncil.org/ceh-hall-of-fame-2025/" target="_blank" rel="noreferrer">Verify on EC-Council</a>
                  </div>
                  <a href="https://www.eccouncil.org/ceh-hall-of-fame-2025/" target="_blank" rel="noreferrer" className="about-modal-certificate">
                    <Image src="/recognition/ceh-hall-of-fame-2025-certificate.jpg" width={1750} height={1383} alt="EC-Council CEH Hall of Fame 2025 certificate presented to Jody Blanchard, certificate HOF-2025-1500089" />
                  </a>
                </article>
              </div>
            </ExecutiveDetailModal>

            <ExecutiveDetailModal
              eyebrow="PUBLIC LEADERSHIP"
              title="Speaking, media & completed engagements"
              summary="Selected panels, fireside discussions, executive recognition, and public leadership appearances."
              triggerLabel="Open media"
              actionHref="/speaking"
              actionLabel="View speaker profile"
            >
              <div className="about-modal-evidence">
                <article className="about-modal-feature">
                  <Image src="/leadership/ceh-hall-of-fame-2025.png" alt="Dr. Jody Blanchard CEH Hall of Fame 2025 magazine cover" width={680} height={848} sizes="(max-width: 700px) 74vw, 360px" />
                  <div><span>CEH HALL OF FAME · TOP 100</span><h3>CEH Hall of Fame 2025 magazine cover</h3><p>EC-Council recognition for outstanding performance and contribution to ethical hacking.</p></div>
                </article>
                <div className="about-modal-media-grid">
                  {leadershipMedia.map((item) => (
                    <article key={item.title}>
                      <Image src={item.image} alt={item.alt} width={720} height={480} sizes="(max-width: 700px) 80vw, 320px" />
                      <span>{item.label}</span><h3>{item.title}</h3><p>{item.summary}</p>
                    </article>
                  ))}
                </div>
              </div>
            </ExecutiveDetailModal>

            <ExecutiveDetailModal
              eyebrow="PUBLISHED AUTHOR"
              title="Books"
              summary="Executive writing on cybersecurity leadership, institutional systems, and accountability."
              triggerLabel="Open books"
            >
              <div className="about-modal-evidence about-modal-books">
                <article>
                  <Image src="/books/cyberbulleys-front.png" width={350} height={520} alt="Cover of CyberBulleys: A CISO's Guide to Doing Cybersecurity" />
                  <div><span>CYBERSECURITY LEADERSHIP</span><h3>CyberBulleys: A CISO&apos;s Guide to Doing Cybersecurity</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/CyberBulleys-CISOs-Guide-Doing-Cybersecurity/dp/B0DT7L55JG" target="_blank" rel="noreferrer">Buy now</a></div>
                </article>
                <article>
                  <Image src="/books/break-the-system-front.png" width={350} height={520} alt="Cover of Break the System" />
                  <div><span>LEADERSHIP &amp; SYSTEMS</span><h3>Break the System</h3><p>By Dr. Jody Blanchard</p><a className="executive-buy-button" href="https://www.amazon.com/Break-System-Jody-Blanchard/dp/B0G2Q1CX8R" target="_blank" rel="noreferrer">Buy now</a></div>
                </article>
              </div>
            </ExecutiveDetailModal>
          </div>
        </section>

        <section className="about-executive-closing">
          <div><p className="about-kicker">EXECUTIVE VALUE</p><h2>Experience that connects the decision, the risk, and the execution.</h2></div>
          <p>{LEGAL_ENTITY_NAME} brings that leadership perspective into cybersecurity, intelligence, governance, protection, secure technology, and enterprise decision support.</p>
          <Link href="/services">Explore Obserra EPI services →</Link>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
