import type { Metadata } from "next";
import Link from "next/link";
import { trustPolicies } from "./policies";
import "./trust.css";

export const metadata: Metadata = {
  title: "Trust Center | Security, Privacy, Responsible AI, and Buyer Protections",
  description: "Obserra Trust Center for enterprise buyers: security, privacy, responsible AI, subprocessors, retention, licensing, refunds, accessibility, and incident reporting.",
  alternates: { canonical: "/trust" },
  keywords: [
    "Obserra trust center",
    "enterprise security review",
    "responsible AI policy",
    "privacy policy",
    "subprocessor disclosure",
    "data retention",
    "security incident reporting",
  ],
  openGraph: {
    title: "Obserra Trust Center | Enterprise Security and Buyer Assurance",
    description: "Review Obserra security, privacy, responsible AI, data handling, legal, and procurement protections.",
    url: "https://www.obserrallc.com/trust",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Trust Center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Trust Center | Enterprise Assurance",
    description: "Security, privacy, responsible AI, incident reporting, and buyer protections for Obserra services, software, and training.",
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

export default function TrustCenterPage() {
  const priorityPolicies = trustPolicies.filter((policy) => prioritySlugs.has(policy.slug));
  const additionalPolicies = trustPolicies.filter((policy) => !prioritySlugs.has(policy.slug));

  return (
    <main className="trust-page">
      <div className="trust-wrap">
        <p className="trust-eyebrow">OBSERRA TRUST CENTER</p>
        <h1>Security, governance, and buyer assurance for high consequence engagements.</h1>
        <p className="trust-lead">
          This Trust Center gives customers, procurement teams, security reviewers, learners, and partners a direct view of the controls, policies, service boundaries, and reporting paths that support responsible engagement with Obserra.
        </p>

        <section className="trust-assurance" aria-label="Obserra assurance principles">
          <article><strong>Secure by design</strong><span>Security, least privilege, governed access, and accountable delivery are built into the operating model.</span></article>
          <article><strong>Privacy and minimization</strong><span>Information is collected and retained only for legitimate service, security, billing, support, and legal purposes.</span></article>
          <article><strong>Responsible AI</strong><span>AI use is risk based, governed, subject to human oversight, and constrained by data handling requirements.</span></article>
          <article><strong>Transparent reporting</strong><span>Customers and researchers have defined paths for incidents, vulnerabilities, privacy requests, and procurement questions.</span></article>
        </section>

        <section className="trust-priority">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">ENTERPRISE REVIEW</p>
            <h2>Start with the policies most often requested during security and procurement review.</h2>
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
            <h2>Need a security review, procurement response, licensing confirmation, or incident escalation?</h2>
            <p>Send the request type, affected service, organization, deadline, and relevant reference information. Do not include unnecessary sensitive data in ordinary email.</p>
          </div>
          <div className="trust-contact-actions">
            <a href="mailto:info@obserrallc.com?subject=Obserra%20Security%20or%20Procurement%20Review">Start a trust review</a>
            <Link href="/contact?interest=enterprise-consultation">Contact Obserra</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
