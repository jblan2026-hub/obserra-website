import type { Metadata } from "next";
import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { listFloridaClassDAcceptanceRuns } from "../../../../lib/florida-class-d-acceptance";
import AcceptanceConsole from "./AcceptanceConsole";
import "../../live-classroom.css";

export const metadata: Metadata = {
  title: "Florida Class D Acceptance Evidence | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FloridaClassDAcceptancePage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const runs = await listFloridaClassDAcceptanceRuns();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Non-Production Acceptance Evidence</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>GATE 23</strong>
          <small>Real acceptance records only</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Acceptance standard</h2>
        <p>
          Every acceptance run is tied to a real non-production release commit and a synthetic test identity.
          All 18 required domains must pass before the run can be finalized. A missing, failed, blocked, or not-run domain prevents acceptance.
        </p>
        <p>
          This console records actual protected acceptance evidence. It does not represent production activation, FDACS approval, or LIAS submission.
        </p>
      </section>

      <AcceptanceConsole initialRuns={runs} />

      <section className="fdacs-live__panel">
        <h2>Recorded acceptance runs</h2>
        <div className="fdacs-completion-admin__grid">
          {runs.map((run) => (
            <article key={run.id} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head">
                <strong>{run.environment_type.toUpperCase()}</strong>
                <span>{run.status.toUpperCase()}</span>
              </div>
              <dl>
                <div><dt>Release commit</dt><dd>{run.release_commit_sha}</dd></div>
                <div><dt>Test identity reference</dt><dd>{run.test_identity_reference}</dd></div>
                <div><dt>Synthetic identity confirmed</dt><dd>{run.synthetic_identity_confirmed ? "Yes" : "No"}</dd></div>
                <div><dt>Started</dt><dd>{new Date(run.started_at).toLocaleString()}</dd></div>
                <div><dt>Completed</dt><dd>{run.completed_at ? new Date(run.completed_at).toLocaleString() : "Not finalized"}</dd></div>
              </dl>
              {run.summary ? <p>{run.summary}</p> : null}
            </article>
          ))}
          {runs.length === 0 ? <p>No acceptance runs have been recorded.</p> : null}
        </div>
      </section>
    </main>
  );
}
