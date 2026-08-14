import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { getFloridaClassDProductionActivationReport } from "../../../../lib/florida-class-d-production-activation";

export const dynamic = "force-dynamic";

function statusLabel(report: ReturnType<typeof getFloridaClassDProductionActivationReport>) {
  if (report.productionActivationAuthorized) return "PRODUCTION ACTIVATION AUTHORIZED";
  if (report.readyForOwnerActivationDecision) return "READY FOR OWNER ACTIVATION DECISION";
  return "FAIL CLOSED";
}

export default async function FloridaClassDProductionActivationPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const report = getFloridaClassDProductionActivationReport();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Production Activation</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>{statusLabel(report)}</strong>
          <small>Gate 26 · exact-release authorization · secrets suppressed</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Release binding</h2>
        <p>
          Gate 26 requires the frozen release-candidate SHA, the accepted Gate 23 UAT SHA, and the production Vercel deployment SHA
          to match exactly. Licensing alone cannot activate the regulated LMS.
        </p>
        <p>
          <strong>Candidate:</strong> {report.releaseCandidateSha ?? "Not configured"}
        </p>
      </section>

      <section className="fdacs-live__panel">
        <h2>Activation checks</h2>
        <div className="fdacs-completion-admin__grid">
          {report.checks.map((item) => (
            <article key={item.key} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head">
                <strong>{item.label}</strong>
                <span>{item.ready ? "READY" : "BLOCKED"}</span>
              </div>
              <p>{item.detail}</p>
              <small>{item.sensitive ? "Sensitive value suppressed" : "No secret value displayed"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Regulated feature boundary</h2>
        <p>
          Per-feature switches remain independent even after Gate 26 authorization. If a regulated feature flag is enabled before
          Gate 26 authorization, it is classified as an unauthorized enabled feature and the subsystem must remain fail closed.
        </p>
        <p>
          <strong>Enabled feature flags:</strong>{" "}
          {report.regulatedFeatureFlagsEnabled.length ? report.regulatedFeatureFlagsEnabled.join(", ") : "None"}
        </p>
        <p>
          <strong>Unauthorized enabled flags:</strong>{" "}
          {report.unauthorizedEnabledFeatureFlags.length ? report.unauthorizedEnabledFeatureFlags.join(", ") : "None"}
        </p>
      </section>

      <section className="fdacs-live__panel">
        <h2>Regulatory boundary</h2>
        <p>
          A green Gate 26 report is not FDACS approval. Regulated production use remains prohibited until the actual Class DS
          authorization exists and every required production condition represented here is supported by authentic evidence.
        </p>
      </section>
    </main>
  );
}
