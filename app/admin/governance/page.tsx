import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authorizeOwner } from "../../../lib/owner-authorization";
import { getAuditableDocuments, getGovernanceControls, getGovernanceSummary } from "../../../lib/governance-evidence";
import { vulnerabilityIntelligenceHealth } from "../../../lib/vulnerability-intelligence";
import GovernanceExportActions from "./GovernanceExportActions";
import VulnerabilityIntelligencePanel from "./VulnerabilityIntelligencePanel";
import "./governance.css";

export const metadata: Metadata = {
  title: "Governance Center | Obserra Control Center",
  description: "Protected governance, security, privacy, audit evidence, release documentation, framework crosswalks, vulnerability intelligence, and governed exports.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GovernanceCenterPage() {
  const owner = await authorizeOwner();
  if (owner.reason === "authentication-required") redirect("/sign-in?redirect_url=/admin/governance");
  if (!owner.allowed) redirect("/portal");

  const summary = getGovernanceSummary();
  const controls = getGovernanceControls();
  const documents = getAuditableDocuments();
  const scanner = vulnerabilityIntelligenceHealth();
  const frameworkRows = Object.entries(summary.byFramework);

  return (
    <main className="governance-page">
      <header className="governance-nav">
        <Link href="/" className="governance-brand">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>CONTROL CENTER · GOVERNANCE</span>
        </Link>
        <nav><Link href="/admin/commercial-operations">Operations</Link><Link href="/admin/governance">Governance</Link><Link href="/trust">Trust</Link><Link href="/portal">Portal</Link></nav>
      </header>

      <section className="governance-hero">
        <div>
          <p className="governance-eyebrow">OWNER-ONLY CONTROL CENTER</p>
          <h1>Governance, security, privacy, release evidence, and vulnerability intelligence in one auditable workspace.</h1>
          <p>Every framework mapping links to implementation evidence and validation commands. Exports require recent identity reverification and create durable audit records.</p>
        </div>
        <aside><span>CONTROL OWNER</span><strong>{owner.userId}</strong><p>Access is fail-closed through OBSERRA_OWNER_USER_IDS.</p></aside>
      </section>

      <section className="governance-kpis">
        <article><span>TOTAL CONTROLS</span><strong>{summary.totalControls}</strong><p>Across four governance frameworks</p></article>
        <article><span>IMPLEMENTED</span><strong>{summary.implementedControls}</strong><p>{summary.coveragePercent}% evidence coverage</p></article>
        <article><span>AUDITABLE DOCUMENTS</span><strong>{summary.auditableDocuments}</strong><p>Security, privacy, release, and operations</p></article>
        <article><span>VALIDATION COMMANDS</span><strong>{summary.validationCommands}</strong><p>Release-blocking test references</p></article>
      </section>

      <section className="governance-section">
        <div className="governance-heading"><div><p className="governance-eyebrow">FRAMEWORK COVERAGE</p><h2>Individual controls mapped to source evidence and tests.</h2></div><p>Mappings support audit preparation and control testing; they are not independent certifications or legal conclusions.</p></div>
        <div className="framework-grid">
          {frameworkRows.map(([framework, values]) => <article key={framework}><span>{framework}</span><strong>{values.implemented}/{values.total}</strong><p>{values.partial} partial · {values.planned} planned</p></article>)}
        </div>
        <div className="control-table-wrap">
          <table className="control-table">
            <thead><tr><th>Framework</th><th>Control</th><th>Capability</th><th>Evidence</th><th>Tests</th><th>Status</th></tr></thead>
            <tbody>{controls.map((control) => <tr key={`${control.framework}-${control.controlId}`}><td>{control.framework}</td><td><strong>{control.controlId}</strong></td><td>{control.capability}</td><td>{control.evidence.slice(0, 3).map((item) => <code key={item}>{item}</code>)}</td><td>{control.tests.map((item) => <code key={item}>{item}</code>)}</td><td><span className={`status-${control.status}`}>{control.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="governance-section">
        <div className="governance-heading"><div><p className="governance-eyebrow">AUDITABLE DOCUMENTATION</p><h2>Build, security, privacy, release, architecture, testing, and operational evidence.</h2></div><p>Documents remain source-controlled, versioned, searchable, and included in governed export packages.</p></div>
        <div className="document-grid">{documents.map((document) => <article key={document.id}><span>{document.category} · {document.evidenceType}</span><h3>{document.title}</h3><p>{document.description}</p><code>{document.source}</code><strong>{document.exportable ? "Included in exports" : "Internal only"}</strong></article>)}</div>
      </section>

      <VulnerabilityIntelligencePanel />

      <section className="governance-section">
        <div className="governance-heading"><div><p className="governance-eyebrow">SCANNER READINESS</p><h2>Verified vulnerability inputs and bounded AI recommendations.</h2></div></div>
        <div className="framework-grid">
          <article><span>SCANNER ORCHESTRATOR</span><strong>{scanner.scannerConfigured ? "Configured" : "Action required"}</strong><p>OBSERRA_SECURITY_SCANNER_URL and token</p></article>
          <article><span>AI RECOMMENDATIONS</span><strong>{scanner.aiConfigured ? "Configured" : "Deterministic fallback"}</strong><p>No invented findings</p></article>
          <article><span>RELEASE THRESHOLD</span><strong>{scanner.releaseBlockingThreshold}</strong><p>Risk score out of 100</p></article>
          <article><span>VERIFIED INPUTS</span><strong>{scanner.verifiedFindingsOnly ? "Required" : "Disabled"}</strong><p>Scanner evidence is authoritative</p></article>
        </div>
      </section>

      <GovernanceExportActions />
    </main>
  );
}
