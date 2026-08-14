import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { getFloridaClassDResilienceSnapshot } from "../../../../lib/florida-class-d-resilience";

export const dynamic = "force-dynamic";

function label(state: string) {
  return state.replaceAll("_", " ").toUpperCase();
}

export default async function FloridaClassDResiliencePage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const snapshot = getFloridaClassDResilienceSnapshot();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Resilience &amp; Observability</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>{label(snapshot.overallState)}</strong>
          <small>Gate 27 · liveness, readiness, HA, activation separation</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Operational state</h2>
        <div className="fdacs-completion-admin__grid">
          <article className="fdacs-completion-admin__card">
            <div className="fdacs-completion-admin__card-head"><strong>Liveness</strong><span>{label(snapshot.liveness.state)}</span></div>
            <p>Application process is responding. Liveness alone does not establish dependency readiness or launch authorization.</p>
          </article>
          <article className="fdacs-completion-admin__card">
            <div className="fdacs-completion-admin__card-head"><strong>Technical readiness</strong><span>{label(snapshot.readiness.state)}</span></div>
            <p>{snapshot.readiness.blockingCount} non-license technical readiness blocker(s) remain.</p>
          </article>
          <article className="fdacs-completion-admin__card">
            <div className="fdacs-completion-admin__card-head"><strong>High availability</strong><span>{label(snapshot.highAvailability.state)}</span></div>
            <p>{snapshot.highAvailability.passingCheckCount} of {snapshot.highAvailability.requiredCheckCount} HA checks pass.</p>
          </article>
          <article className="fdacs-completion-admin__card">
            <div className="fdacs-completion-admin__card-head"><strong>Production activation</strong><span>{label(snapshot.productionActivation.state)}</span></div>
            <p>{snapshot.productionActivation.blockingCount} Gate 26 activation blocker(s) remain.</p>
          </article>
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>HA blockers</h2>
        {snapshot.highAvailability.failingCheckKeys.length === 0 ? (
          <p>All configured Gate 26 high-availability checks are currently satisfied.</p>
        ) : (
          <ul>
            {snapshot.highAvailability.failingCheckKeys.map((key) => <li key={key}>{key}</li>)}
          </ul>
        )}
      </section>

      <section className="fdacs-live__panel">
        <h2>Operational interpretation</h2>
        <p>
          Liveness, technical readiness, high availability, production activation authorization, and FDACS approval are separate states.
          A healthy application process is not sufficient to open regulated enrollment, instruction, examination, LIAS, or certificate workflows.
        </p>
        <p>
          The detailed report suppresses secret values. Production remains fail closed until Gate 26 and all applicable regulatory conditions pass.
        </p>
      </section>
    </main>
  );
}
