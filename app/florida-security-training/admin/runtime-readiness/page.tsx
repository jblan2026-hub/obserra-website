import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { getFloridaClassDRuntimeReadiness } from "../../../../lib/florida-class-d-runtime-readiness";

export const dynamic = "force-dynamic";

export default async function FloridaClassDRuntimeReadinessPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const report = getFloridaClassDRuntimeReadiness();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Production Runtime Readiness</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>{report.readyForControlledActivationReview ? "READY FOR REVIEW" : "FAIL CLOSED"}</strong>
          <small>Gate 22 · secret values are never displayed</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Configuration checks</h2>
        <p>This protected view reports configuration presence only. It does not return credential values or activate regulated functions.</p>
        <div className="fdacs-completion-admin__grid">
          {report.items.map((item) => (
            <article key={item.key} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head">
                <strong>{item.label}</strong>
                <span>{item.ready ? "READY" : "BLOCKED"}</span>
              </div>
              <p>{item.detail}</p>
              <small>{item.category.toUpperCase()} · {item.sensitive ? "Sensitive value suppressed" : "No secret value involved"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Completion boundary</h2>
        <p>Forty instructional hours alone do not earn a completion certificate. The passing final examination and controlled completion approval remain required before supplemental completion documents are generated.</p>
      </section>
    </main>
  );
}
