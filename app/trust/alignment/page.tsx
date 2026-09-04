import type { Metadata } from "next";
import Link from "next/link";
import {
  alignmentAuthorities,
  alignmentDisclaimer,
} from "../../../lib/control-alignment";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "../trust.css";

export const metadata: Metadata = {
  title: `Control and Regulatory Alignment | ${LEGAL_ENTITY_NAME} Trust Center`,
  description:
    `Review ${LEGAL_ENTITY_NAME} design alignment references for cybersecurity, information security, assurance, privacy, and payment security.`,
  alternates: { canonical: "/trust/alignment" },
};

export default function ControlAlignmentPage() {
  return (
    <main className="trust-page">
      <div className="trust-wrap">
        <header className="trust-hero">
          <div>
            <p className="trust-eyebrow">CONTROL AND REGULATORY ALIGNMENT</p>
            <h1>One governed alignment model across security, privacy, assurance, and payment protection.</h1>
            <p className="trust-lead">
              {LEGAL_ENTITY_NAME} uses a common control alignment registry across its public website, Academy, applications, services, and enterprise governance work. Applicability remains dependent on the actual service, data, jurisdiction, contract, payment architecture, and deployment scope.
            </p>
            <div className="trust-hero-actions">
              <Link href="/trust">Back to Trust Center</Link>
              <Link href="/contact?interest=architecture-briefing">Request an architecture briefing</Link>
            </div>
          </div>
          <aside className="trust-status-panel" aria-label="Alignment scope">
            <span>GOVERNED ALIGNMENT SET</span>
            <strong>{alignmentAuthorities.length} primary authorities</strong>
            <dl>
              <div><dt>Cybersecurity</dt><dd>NIST and CISA</dd></div>
              <div><dt>Information security</dt><dd>ISO/IEC 27001</dd></div>
              <div><dt>Assurance</dt><dd>SOC 2 TSC</dd></div>
              <div><dt>Privacy</dt><dd>GDPR and CCPA</dd></div>
              <div><dt>Payments</dt><dd>PCI DSS</dd></div>
            </dl>
          </aside>
        </header>

        <section className="trust-frameworks" aria-label="Control alignment authorities">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">AUTHORITATIVE REFERENCES</p>
            <h2>Alignment is mapped to the authority and the applicable operating context.</h2>
            <p>{alignmentDisclaimer}</p>
          </div>
          <div className="trust-framework-grid">
            {alignmentAuthorities.map((authority) => (
              <article key={authority.id}>
                <strong>{authority.shortName}</strong>
                <span>{authority.scope}</span>
                <span>Authority: {authority.authority}</span>
                <span>Tracked areas: {authority.websiteUse.join(", ")}</span>
                <a href={authority.sourceUrl} target="_blank" rel="noopener noreferrer">Review authoritative source</a>
              </article>
            ))}
          </div>
        </section>

        <section className="trust-architecture">
          <div className="trust-section-heading">
            <p className="trust-eyebrow">CONTROL TRACEABILITY</p>
            <h2>Alignment is intended to remain evidence based and reusable across overlapping requirements.</h2>
            <p>
              A safeguard may support more than one framework or regulatory requirement, but each mapping must retain its own applicability rationale, scope, evidence, validation status, owner, limitations, and remediation state. A label or crosswalk does not substitute for implementation or operating evidence.
            </p>
          </div>
          <div className="trust-architecture-grid">
            <article><div><strong>Applicability</strong><span>Determine whether the requirement applies to the service, processing activity, jurisdiction, contract, or payment boundary.</span></div></article>
            <article><div><strong>Implementation</strong><span>Identify the actual safeguard, owner, system boundary, procedure, or operating process.</span></div></article>
            <article><div><strong>Evidence</strong><span>Retain evidence that is scoped, current, reviewable, and tied to the control being asserted.</span></div></article>
            <article><div><strong>Validation</strong><span>Separate documented design from implemented, operating, tested, and effective states.</span></div></article>
            <article><div><strong>Remediation</strong><span>Track deficiencies, exceptions, owners, due dates, residual risk, and verification of corrective action.</span></div></article>
            <article><div><strong>Executive reporting</strong><span>Roll control records into decision ready summaries without converting alignment into an unsupported compliance claim.</span></div></article>
          </div>
        </section>
      </div>
    </main>
  );
}
