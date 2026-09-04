import type { Metadata } from "next";
import Link from "next/link";
import { alignmentAuthorities, alignmentDisclaimer } from "../../lib/control-alignment";
import { LEGAL_ENTITY_NAME, PUBLIC_BRAND_NAME } from "@/lib/legal-identity";
import "./trust.css";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";
import ExecutiveInfoModal from "../components/ui/ExecutiveInfoModal";

export const metadata: Metadata = {
  title: "Trust Center | Security, Privacy & Buyer Assurance",
  description: `Review ${PUBLIC_BRAND_NAME} published security and privacy information, responsible AI principles, framework alignment, procurement pathways, credentials, and current assurance boundaries.`,
  alternates: { canonical: "/trust" },
  openGraph: {
    title: `${PUBLIC_BRAND_NAME} Trust Center`,
    description: "Security architecture, privacy, responsible AI, framework alignment, verified credentials, procurement support, and buyer assurance.",
    url: "https://www.obserrallc.com/trust",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${PUBLIC_BRAND_NAME} Trust Center` }],
  },
};

const assuranceAreas = [
  {
    title: "Security Architecture",
    category: "Security",
    image: "/brand/visuals/obserra-cybersecurity.png",
    summary: "Identity, least privilege, encryption, secure software delivery, monitoring, resilience, and accountable evidence.",
    description: "Review the security objectives that guide software, advisory delivery, intelligence, and professional learning systems.",
    details: ["Identity and least privilege", "Encryption and data protection", "Secure software lifecycle and resilience"],
    href: "/trust/security-and-responsible-disclosure",
  },
  {
    title: "Privacy & Data Handling",
    category: "Privacy",
    image: "/brand/visuals/obserra-core.png",
    summary: "Published privacy, retention, deletion, data-handling, and subprocessor boundaries for enterprise review.",
    description: "Understand how information is handled, minimized, retained, deleted, and disclosed across the applicable service boundary.",
    details: ["Privacy policy", "Data retention and deletion", "Subprocessor and handling disclosures"],
    href: "/trust/privacy-policy",
  },
  {
    title: "Responsible AI & Framework Alignment",
    category: "Governance",
    image: "/brand/visuals/obserra-eios-intelligence-hero.png",
    summary: "Human oversight, permissions, explainability, governance, and published framework-alignment metadata.",
    description: `Review responsible AI principles and framework alignment. ${alignmentDisclaimer}`,
    details: ["Human oversight and accountability", "Data-use and permission controls", `${alignmentAuthorities.length} published alignment authorities`],
    href: "/trust/alignment",
  },
  {
    title: "Procurement & Buyer Assurance",
    category: "Assurance",
    image: "/brand/visuals/obserra-eios.png",
    summary: "Security questionnaires, vendor assurance, architecture briefings, NDA coordination, and verified credentials.",
    description: "Move security, legal, privacy, architecture, and procurement review forward through defined request paths and published evidence.",
    details: ["Security questionnaire support", "Vendor assurance package", "Architecture and procurement coordination"],
    href: "/trust/trust-brief",
  },
] as const;

const policyLinks = [
  ["Trust brief", "/trust/trust-brief"],
  ["Privacy policy", "/trust/privacy-policy"],
  ["Responsible AI", "/trust/responsible-ai-policy"],
  ["Security & disclosure", "/trust/security-and-responsible-disclosure"],
  ["Data retention", "/trust/data-retention-and-deletion"],
  ["Subprocessors", "/trust/subprocessor-disclosure"],
] as const;

export default function TrustCenterPage() {
  const legalEntityMailName = encodeURIComponent(LEGAL_ENTITY_NAME);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${PUBLIC_BRAND_NAME} Trust Center`,
    url: "https://www.obserrallc.com/trust",
    description: `Enterprise security, privacy, responsible AI, procurement, framework alignment, verified credentials, and buyer assurance information for ${LEGAL_ENTITY_NAME}.`,
  };

  return (
    <>
      <EnterpriseHeader section="Trust and assurance" />
      <main className="trust-page trust-executive-page enterprise-page-main">
        <div className="trust-wrap">
          <header className="trust-hero">
            <div>
              <p className="trust-eyebrow">{PUBLIC_BRAND_NAME.toUpperCase()} TRUST CENTER</p>
              <h1>Enterprise assurance that is easy to review and easy to verify.</h1>
              <p className="trust-lead">Review security, privacy, responsible AI, framework alignment, procurement support, verified credentials, and current status boundaries from one concise enterprise trust surface.</p>
              <div className="trust-hero-actions">
                <a href={`mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Enterprise%20Trust%20Review`}>Start a trust review</a>
                <Link href="/contact?interest=architecture-briefing">Request architecture briefing</Link>
              </div>
            </div>
            <aside className="trust-status-panel" aria-label="Trust Center status summary">
              <span>CURRENT ASSURANCE BOUNDARY</span>
              <strong>Public disclosures available</strong>
              <dl>
                <div><dt>CMMC Level 2</dt><dd>Not assessed</dd></div>
                <div><dt>Technical objective results</dt><dd>3,048 not tested</dd></div>
                <div><dt>Human determinations</dt><dd>3,048 pending</dd></div>
                <div><dt>CUI authorization</dt><dd>Not granted</dd></div>
              </dl>
            </aside>
          </header>

          <EnterpriseProofBand />

          <section className="services-executive-portfolio trust-executive-portfolio" aria-labelledby="trust-assurance-heading">
            <div className="services-executive-heading">
              <p className="trust-eyebrow">ENTERPRISE ASSURANCE</p>
              <h2 id="trust-assurance-heading">Choose the assurance area you need.</h2>
              <p>Each card summarizes the review area and links directly to the underlying policy or evidence route.</p>
            </div>
            <div className="services-executive-grid">
              {assuranceAreas.map((area) => (
                <article className="services-executive-card" key={area.title}>
                  <ExecutiveInfoModal
                    title={area.title}
                    category={area.category}
                    image={area.image}
                    imageAlt={`${area.title} assurance visual`}
                    summary={area.summary}
                    description={area.description}
                    details={[...area.details]}
                    href={area.href}
                    linkLabel="Open assurance detail"
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="trust-policy-shortcuts" aria-label="Priority trust policies">
            <div><p className="trust-eyebrow">PRIORITY DOCUMENTS</p><h2>Direct policy access.</h2></div>
            <nav aria-label="Priority trust documents">{policyLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
          </section>

          <section className="trust-contact">
            <div><p className="trust-eyebrow">SECURITY &amp; PROCUREMENT CONTACT</p><h2>Need a security review, questionnaire, procurement response, or assurance package?</h2><p>Send the request type, organization, deadline, affected service, and relevant reference information.</p></div>
            <div className="trust-contact-actions"><a href={`mailto:info@obserrallc.com?subject=${legalEntityMailName}%20Security%20or%20Procurement%20Review`}>Start a trust review</a></div>
          </section>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
