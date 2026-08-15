import type { Metadata } from "next";
import Link from "next/link";
import { alignmentAuthorities, alignmentDisclaimer } from "../../lib/control-alignment";
import { trustPolicies } from "./policies";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./trust.css";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: "Enterprise Trust Center | Security, Privacy and Procurement Evidence",
  description:
    `Review ${LEGAL_ENTITY_NAME} published security and privacy information, responsible AI principles, framework alignment, procurement pathways, credentials, and current assurance boundaries.`,
  alternates: { canonical: "/trust" },
  keywords: [
    `${LEGAL_ENTITY_NAME} trust center`,
    "enterprise security review",
    "responsible AI governance",
    "NIST aligned security",
    "vendor security review",
    "procurement assurance",
    "privacy policy",
    "responsible disclosure",
  ],
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Enterprise Trust Center`,
    description:
      "Security architecture, privacy, responsible AI, framework alignment, verified credentials, procurement support, and buyer assurance.",
    url: "https://www.obserrallc.com/trust",
    type: "website",
    images: [
      {
        url: "/brand/visuals/obserra-cybersecurity.png",
        width: 1344,
        height: 768,
        alt: `${LEGAL_ENTITY_NAME} Enterprise Trust Center`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} Enterprise Trust Center`,
    description:
      "Security, privacy, responsible AI, framework alignment, procurement pathways, and buyer assurance.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

const prioritySlugs = new Set([
  "trust-brief",
  "security-and-responsible-disclosure",
  "security-incident-reporting",
  "privacy-policy",
  "responsible-ai-policy",
  "subprocessor-disclosure",
  "data-retention-and-deletion",
  "data-handling-statement",
]);

const architecture = [
  ["Identity and least privilege", "Role-based access, strong authentication, separation of duties, and governed administrative permissions."],
  ["Encryption and data protection", "Protection of data in transit and at rest, data minimization, retention controls, and secure handling boundaries."],
  ["Secure software lifecycle", "Threat-informed design, secure coding, dependency governance, testing, release controls, and vulnerability remediation."],
  ["Auditability and evidence", "Traceable activity, decision records, control evidence, reporting, and accountability for material actions."],
  ["Monitoring and resilience", "Operational monitoring, incident response, continuity planning, recovery discipline, and lessons-learned improvement."],
  ["Responsible AI controls", "Human oversight, permissions, explainability, model governance, data-use constraints, rollback, and kill-switch concepts where applicable."],
];

const legalEntityMailName = encodeURIComponent(LEGAL_ENTITY_NAME);

const procurementPaths = [
  ["Security questionnaire", "Request support for a customer or third-party security assessment.", `mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Security%20Questionnaire%20Request`],
  ["Vendor assurance package", "Request available security, privacy, legal, and operational assurance materials.", `mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Vendor%20Assurance%20Package`],
  ["Architecture briefing", "Schedule a review of deployment, integration, security, governance, and data-handling architecture.", "/contact?interest=architecture-briefing"],
  ["NDA and procurement coordination", "Coordinate confidentiality, procurement, contracting, and enterprise evaluation requirements.", `mailto:info@obserrallc.com?subject=${legalEntityMailName}%20NDA%20and%20Procurement%20Coordination`],
];

const verifiedCredentials = [
  ["Professional certifications", "Verified credentials in cybersecurity, information security, risk, privacy, and executive leadership are available through official credential providers.", "/about"],
  ["AI governance credentials", "EC-Council AI governance credentials covering adoption, defense, and governance are linked to official verification records.", "/about"],
  ["Florida professional licenses", "Active Florida security, investigation, firearms, and instructor licenses are presented with official state verification paths.", "/about"],
  ["Trust and policy documentation", "Published security, privacy, responsible AI, data handling, retention, licensing, and incident reporting policies are maintained in this Trust Center.", "/trust/trust-brief"],
];

export default function TrustCenterPage() {
  const priorityPolicies = trustPolicies.filter((policy) => prioritySlugs.has(policy.slug));
  const additionalPolicies = trustPolicies.filter((policy) => !prioritySlugs.has(policy.slug));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${LEGAL_ENTITY_NAME} Enterprise Trust Center`,
    url: "https://www.obserrallc.com/trust",
    description:
      `Enterprise security, privacy, responsible AI, procurement, framework alignment, verified credentials, and buyer assurance information for ${LEGAL_ENTITY_NAME}.`,
    isPartOf: {
      "@type": "WebSite",
      name: LEGAL_ENTITY_NAME,
      url: "https://www.obserrallc.com",
    },
  };

  return (
    <>
      <EnterpriseHeader section="Trust and assurance" />
      <main className="trust-page enterprise-page-main">
      <div className="trust-wrap">
        <header className="trust-hero">
          <div>
            <p className="trust-eyebrow">{LEGAL_ENTITY_NAME} ENTERPRISE TRUST CENTER</p>
            <h1>Clear assurance boundaries for security, privacy, procurement, and responsible technology.</h1>
            <p className="trust-lead">
              Review {LEGAL_ENTITY_NAME} published security and privacy information, responsible AI principles, framework mapping, procurement pathways, credentials, and current status boundaries for services, software, and professional learning.
            </p>
            <div className="trust-hero-actions">
              <a href={`mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Enterprise%20Trust%20Review`}>Start a trust review</a>
              <Link href="/contact?interest=architecture-briefing">Request an architecture briefing</Link>
            </div>
          </div>
          <aside className="trust-status-panel" aria-label="Trust Center status summary">
            <span>TRUST CENTER STATUS</span>
            <strong>Public disclosures available</strong>
            <dl>
              <div><dt>Cybersecurity Maturity Model Certification (CMMC) Level 2</dt><dd>Not assessed</dd></div>
              <div><dt>Human determinations</dt><dd>Pending</dd></div>
              <div><dt>Controlled unclassified information (CUI) authorization</dt><dd>Not granted</dd></div>
              <div><dt>Florida Department of Agriculture and Consumer Services (FDACS) authorization</dt><dd>Not granted</dd></div>
            </dl>
          </aside>
        </header>

        <EnterpriseProofBand />

        <section className="trust-assurance" aria-label={`${LEGAL_ENTITY_NAME} assurance principles`}>
          <article><strong>Security engineering</strong><span>Design objectives include least privilege, governed access, auditability, resilience, secure release controls, and accountable delivery.</span></article>
          <article><strong>Privacy and minimization</strong><span>Published policy limits information use to legitimate service, security, billing, support, and legal purposes, subject to the applicable service boundary.</span></article>
          <article><strong>Responsible AI</strong><span>Published principles call for risk-based governance, human oversight, data-use constraints, permissions, accountability, and review.</span></article>
          <article><strong>Truthful assurance</strong><span>Alignment and engineering evidence are not certification, independent attestation, regulatory approval, or authorization to process CUI.</span></article>
        </section>

        <section className="trust-frameworks">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">FRAMEWORK INTELLIGENCE</p>
            <h2>Published alignment metadata from one governed source.</h2>
            <p>{alignmentDisclaimer}</p>
            <p><Link href="/trust/alignment">Review detailed alignment scope, authorities, domains, and source references.</Link></p>
          </div>
          <div className="trust-framework-grid">
            {alignmentAuthorities.map((authority) => (
              <article key={authority.id}>
                <strong>{authority.shortName}</strong>
                <span>{authority.scope}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="trust-architecture">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">SECURITY ARCHITECTURE</p>
            <h2>Security objectives used to guide software, advisory delivery, intelligence, and learning systems.</h2>
          </div>
          <div className="trust-architecture-grid">
            {architecture.map(([title, description], index) => (
              <article key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{title}</strong><span>{description}</span></div></article>
            ))}
          </div>
        </section>

        <section className="trust-priority">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">ENTERPRISE REVIEW</p>
            <h2>Start with the policies most often requested during security, legal, privacy, and procurement review.</h2>
          </div>
          <div className="trust-grid trust-grid-priority">
            {priorityPolicies.map((policy) => (
              <Link key={policy.slug} href={`/trust/${policy.slug}`} className="trust-card">
                <h3>{policy.title}</h3>
                <p>{policy.description}</p>
                <span>Review policy</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="trust-verification">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">VERIFIED TRUST SIGNALS</p>
            <h2>Professional credentials, licenses, and published policies with official verification paths.</h2>
          </div>
          <div className="trust-verification-grid">
            {verifiedCredentials.map(([title, description, href]) => (
              <Link href={href} key={title}><strong>{title}</strong><span>{description}</span><b>Review verification</b></Link>
            ))}
          </div>
        </section>

        <section className="trust-procurement">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">ENTERPRISE PROCUREMENT</p>
            <h2>Move security, legal, architecture, and procurement review forward through a defined request path.</h2>
          </div>
          <div className="trust-procurement-grid">
            {procurementPaths.map(([title, description, href]) => (
              <a href={href} key={title}><strong>{title}</strong><span>{description}</span><b>Start request</b></a>
            ))}
          </div>
        </section>

        <section className="trust-additional">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">LEGAL AND COMMERCIAL TERMS</p>
            <h2>Additional policies for services, software, subscriptions, Academy purchases, and public website use.</h2>
          </div>
          <div className="trust-grid">
            {additionalPolicies.map((policy) => (
              <Link key={policy.slug} href={`/trust/${policy.slug}`} className="trust-card">
                <h3>{policy.title}</h3>
                <p>{policy.description}</p>
                <span>Review policy</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="trust-contact">
          <div>
            <p className="trust-eyebrow">SECURITY AND PROCUREMENT CONTACT</p>
            <h2>Need a security review, procurement response, licensing confirmation, privacy response, or incident escalation?</h2>
            <p>Send the request type, affected service, organization, deadline, and relevant reference information. Do not include unnecessary sensitive data in ordinary email.</p>
          </div>
          <div className="trust-contact-actions">
            <a href={`mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Security%20or%20Procurement%20Review`}>Start a trust review</a>
            <Link href="/contact?interest=enterprise-consultation">Contact {LEGAL_ENTITY_NAME}</Link>
          </div>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
