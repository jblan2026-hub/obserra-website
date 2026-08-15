import type { Metadata } from "next";
import ContactExperience from "./ContactExperience";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./contact.css";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: `Contact | ${LEGAL_ENTITY_NAME}`,
  description:
    `Contact ${LEGAL_ENTITY_NAME} for enterprise cybersecurity advisory, executive protection, intelligence, EIOS product briefings, Academy licensing, and scoped implementation planning.`,
  alternates: { canonical: "/contact" },
  keywords: [`contact ${LEGAL_ENTITY_NAME}`, `${LEGAL_ENTITY_NAME} consultation`, "executive protection consulting", "cybersecurity advisory contact"],
  openGraph: {
    title: `Contact ${LEGAL_ENTITY_NAME} | Confidential Enterprise Consultation`,
    description: "Start a confidential conversation on cybersecurity, protection, intelligence, EIOS, and professional training.",
    url: "https://www.obserrallc.com/contact",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: `Contact ${LEGAL_ENTITY_NAME}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact ${LEGAL_ENTITY_NAME} | Confidential Enterprise Consultation`,
    description: `Engage ${LEGAL_ENTITY_NAME} for executive cybersecurity, protection, and intelligence advisory.`,
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

const engagementTracks = [
  {
    title: "Executive Security Advisory",
    copy: "Cybersecurity leadership, enterprise risk, governance, and executive decision support for senior and board stakeholders.",
    action: "mailto:info@obserrallc.com?subject=Executive%20Security%20Advisory%20Inquiry",
    cta: "Request advisory consultation",
  },
  {
    title: "Enterprise Intelligence Operating System Briefing",
    copy: "Enterprise intelligence operating model walkthrough, adoption pathway, and implementation readiness review.",
    action: "mailto:info@obserrallc.com?subject=EIOS%20Enterprise%20Briefing%20Request",
    cta: "Book EIOS enterprise briefing",
  },
  {
    title: "Academy and Workforce Training",
    copy: "Course evaluation, enterprise cohort planning, and workforce capability discussions tied to cybersecurity, protection, intelligence, and secure technology.",
    action: "mailto:info@obserrallc.com?subject=Academy%20Enterprise%20Training%20Inquiry",
    cta: "Discuss training options",
  },
  {
    title: "University and Institutional Learning",
    copy: "Program evaluation, curriculum fit, cohort delivery, learning evidence, accessibility, and governance discussions for higher education and institutional buyers.",
    action: "mailto:info@obserrallc.com?subject=University%20and%20Institutional%20Learning%20Inquiry",
    cta: "Plan an institutional review",
  },
];

const legalEntityMailName = encodeURIComponent(LEGAL_ENTITY_NAME);

type ContactPageProps = {
  searchParams: Promise<{ interest?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialInterest = Array.isArray(resolvedSearchParams.interest)
    ? resolvedSearchParams.interest[0]
    : resolvedSearchParams.interest;

  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: `Contact ${LEGAL_ENTITY_NAME}`,
        url: "https://www.obserrallc.com/contact",
        mainEntity: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
          email: "info@obserrallc.com",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "info@obserrallc.com",
            availableLanguage: ["English"],
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.obserrallc.com/contact" },
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Enterprise contact" />
      <main className="contact-page enterprise-page-main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      <section className="contact-hero">
        <p className="contact-eyebrow">{LEGAL_ENTITY_NAME}</p>
        <h1>Start a focused conversation on the work you need done.</h1>
        <p>
          Engage {LEGAL_ENTITY_NAME} for cybersecurity leadership, protective intelligence, executive protection advisory,
          enterprise risk guidance, AI governance, and EIOS through a scoped, security-conscious engagement process.
        </p>
        <div className="contact-actions">
          <a className="contact-button" href={`mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Confidential%20Consultation`}>Request executive consultation</a>
          <a className="contact-outline" href="/services">Review enterprise services</a>
        </div>
      </section>

      <EnterpriseProofBand />

      <ContactExperience initialInterest={initialInterest} />

      <section className="contact-grid" aria-label="Contact pathways">
        {engagementTracks.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
            <a href={item.action}>{item.cta}</a>
          </article>
        ))}
      </section>

      <section className="contact-confidence">
        <div>
          <p className="contact-eyebrow">BUYER CONFIDENCE</p>
          <h2>Built for enterprise leaders who cannot afford unclear answers.</h2>
          <p>
            {LEGAL_ENTITY_NAME} engagements are scoped, security-conscious, and outcome-oriented. We align executive context,
            risk posture, and practical execution without disrupting critical operating paths.
          </p>
        </div>
        <ul>
          <li>Veteran-owned organization</li>
          <li>Fortune 500 Chief Information Security Officer leadership background</li>
          <li>Enterprise cybersecurity and risk advisory</li>
          <li>Protective intelligence and executive protection alignment</li>
          <li>Professional and enterprise learning options through Obserra Academy</li>
        </ul>
      </section>

      <section className="contact-confidence">
        <div>
          <p className="contact-eyebrow">ENGAGEMENT GOVERNANCE</p>
          <h2>A controlled path from initial inquiry to scoped work.</h2>
          <p>
            Initial conversations establish the authorized participants, business objective, information boundary, delivery model, and evidence expectations before sensitive material or implementation work is introduced.
          </p>
        </div>
        <ul>
          <li>Scope, ownership, and decision authority confirmed before delivery</li>
          <li>Data minimization and secure-exchange instructions established before file transfer</li>
          <li>Commercial terms, dependencies, and acceptance evidence documented for the engagement</li>
          <li><a href="/trust">Review security, privacy, accessibility, and procurement disclosures</a></li>
        </ul>
      </section>

      </main>
      <EnterpriseFooter />
    </>
  );
}
