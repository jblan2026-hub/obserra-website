import type { Metadata } from "next";
import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { listFloridaClassDLiasWorkflowQueue } from "../../../../lib/florida-class-d-lias";
import "../../live-classroom.css";

export const metadata: Metadata = {
  title: "Florida Class D Completion Packets | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FloridaClassDCompletionPacketsPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const queue = await listFloridaClassDLiasWorkflowQueue();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Completion &amp; Inspection Packets</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>PROTECTED STAFF VIEW</strong>
          <small>Completion · exam · attendance · LIAS · documents</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Inspection-ready learner records</h2>
        <p>
          Each packet combines completion evidence, attendance and instructional time,
          module status, exam history, LIAS workflow state, completion-document metadata,
          and audit history. Examination questions and answers, identity-document images,
          payment-card data, and authentication secrets are intentionally excluded.
        </p>

        <div className="fdacs-completion-admin__grid">
          {queue.map((item) => (
            <article key={item.id} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head">
                <strong>{item.enrollment_id}</strong>
                <span>{item.status.toUpperCase()}</span>
              </div>
              <dl>
                <div><dt>Prepared</dt><dd>{new Date(item.prepared_at).toLocaleString()}</dd></div>
                <div><dt>Reporting due</dt><dd>{item.reporting_due_on}</dd></div>
                <div><dt>Submitted</dt><dd>{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "Pending"}</dd></div>
                <div><dt>Confirmed</dt><dd>{item.confirmed_at ? new Date(item.confirmed_at).toLocaleString() : "Pending"}</dd></div>
              </dl>
              <div className="fdacs-live__actions">
                <a href={`/api/florida-class-d/admin/completion-packet?enrollmentId=${encodeURIComponent(item.enrollment_id)}&format=html`} target="_blank" rel="noreferrer">Open printable packet</a>
                <a href={`/api/florida-class-d/admin/completion-packet?enrollmentId=${encodeURIComponent(item.enrollment_id)}&format=json`} target="_blank" rel="noreferrer">Download JSON evidence</a>
              </div>
            </article>
          ))}
          {queue.length === 0 ? <p>No successful-completion records are currently available for packet export.</p> : null}
        </div>
      </section>
    </main>
  );
}
