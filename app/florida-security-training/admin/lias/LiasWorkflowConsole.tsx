"use client";

import { useState } from "react";
import type { FloridaClassDLiasQueueItem } from "../../../../lib/florida-class-d-lias";

type Props = { initialQueue: FloridaClassDLiasQueueItem[] };

type Fields = Record<string, { submissionReference?: string; certificateReference?: string; exceptionNote?: string }>;

export default function LiasWorkflowConsole({ initialQueue }: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [fields, setFields] = useState<Fields>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [renderedAt] = useState(() => Date.now());

  async function refresh() {
    const response = await fetch("/api/florida-class-d/admin/lias", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to refresh LIAS queue.");
    setQueue(Array.isArray(payload.queue) ? payload.queue : []);
  }

  function patchField(id: string, patch: Fields[string]) {
    setFields((current) => ({ ...current, [id]: { ...(current[id] || {}), ...patch } }));
  }

  async function post(action: string, item: FloridaClassDLiasQueueItem) {
    setBusy(item.id);
    setError(null);
    setNotice(null);
    try {
      const current = fields[item.id] || {};
      const response = await fetch("/api/florida-class-d/admin/lias", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action, queueId: item.id, ...current }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "LIAS workflow action failed.");
      setNotice(action === "mark_submitted" ? "LIAS submission recorded." : action === "confirm_certificate" ? "FDACS-16103 confirmation recorded." : "LIAS exception recorded.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "LIAS workflow action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadCertificate(item: FloridaClassDLiasQueueItem, file: File | null) {
    if (!file) return;
    setBusy(item.id);
    setError(null);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("completionRecordId", item.completion_record_id);
      form.set("externalReference", item.certificate_reference || "");
      form.set("file", file);
      const response = await fetch("/api/florida-class-d/admin/completion-documents", { method: "POST", body: form, cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "FDACS-16103 upload failed.");
      setNotice("Official FDACS-16103 stored and released to the student's protected completion-document portal.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "FDACS-16103 upload failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>FDACS / LIAS Completion Workflow</h1></div>
        <div className="fdacs-live__status"><strong>MANUAL LIAS CONTROL</strong><small>Reporting · certificate · student delivery</small></div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {notice ? <div className="fdacs-live__alert">{notice}</div> : null}

      <section className="fdacs-live__panel">
        <h2>Successful completion reporting queue</h2>
        <p>Obserra prepares and tracks the reporting workflow. Authorized staff still complete the official LIAS transaction. The official FDACS-16103 is accepted into the LMS only after LIAS confirmation.</p>
        <div className="fdacs-completion-admin__grid">
          {queue.map((item) => {
            const current = fields[item.id] || {};
            const due = new Date(`${item.reporting_due_on}T23:59:59`);
            const overdue = item.status === "prepared" && Number.isFinite(due.getTime()) && due.getTime() < renderedAt;
            return (
              <article key={item.id} className="fdacs-completion-admin__card">
                <div className="fdacs-completion-admin__card-head">
                  <strong>{item.enrollment_id}</strong>
                  <span>{overdue ? "DUE / REVIEW" : item.status.toUpperCase()}</span>
                </div>
                <dl>
                  <div><dt>Prepared</dt><dd>{new Date(item.prepared_at).toLocaleString()}</dd></div>
                  <div><dt>Reporting due</dt><dd>{item.reporting_due_on}</dd></div>
                  <div><dt>Submission reference</dt><dd>{item.submission_reference || "Pending"}</dd></div>
                  <div><dt>FDACS-16103 reference</dt><dd>{item.certificate_reference || "Pending"}</dd></div>
                </dl>

                {(item.status === "prepared" || item.status === "exception") ? (
                  <>
                    <input value={current.submissionReference || ""} onChange={(event) => patchField(item.id, { submissionReference: event.target.value })} placeholder="LIAS submission reference" maxLength={500} />
                    <button type="button" disabled={busy === item.id} onClick={() => void post("mark_submitted", item)}>Record LIAS submission</button>
                  </>
                ) : null}

                {item.status === "submitted" ? (
                  <>
                    <input value={current.certificateReference || ""} onChange={(event) => patchField(item.id, { certificateReference: event.target.value })} placeholder="FDACS-16103 / LIAS certificate reference" maxLength={500} />
                    <button type="button" disabled={busy === item.id} onClick={() => void post("confirm_certificate", item)}>Confirm FDACS-16103</button>
                  </>
                ) : null}

                {item.status === "confirmed" ? (
                  <label>
                    <strong>Upload LIAS-generated FDACS-16103 PDF</strong>
                    <input type="file" accept="application/pdf,.pdf" disabled={busy === item.id} onChange={(event) => void uploadCertificate(item, event.target.files?.[0] || null)} />
                  </label>
                ) : null}

                {item.status !== "confirmed" && item.status !== "cancelled" ? (
                  <>
                    <textarea value={current.exceptionNote || ""} onChange={(event) => patchField(item.id, { exceptionNote: event.target.value })} placeholder="Document LIAS exception or reporting problem" maxLength={4000} />
                    <button type="button" disabled={busy === item.id} onClick={() => void post("open_exception", item)}>Open exception</button>
                  </>
                ) : null}

                <a href={`/api/florida-class-d/admin/lias?enrollmentId=${encodeURIComponent(item.enrollment_id)}`} target="_blank" rel="noreferrer">Open inspection-ready JSON record</a>
              </article>
            );
          })}
          {queue.length === 0 ? <p>No successful-completion records are waiting for LIAS processing.</p> : null}
        </div>
      </section>
    </main>
  );
}
