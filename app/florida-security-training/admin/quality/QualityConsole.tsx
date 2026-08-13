"use client";

import { useMemo, useState } from "react";
import type { FloridaClassDQualityCase, FloridaClassDRetentionReview } from "../../../../lib/florida-class-d-quality";

type Props = {
  initialCases: FloridaClassDQualityCase[];
  initialRetentionReviews: FloridaClassDRetentionReview[];
};

type QualityStatus = FloridaClassDQualityCase["status"];

export default function QualityConsole({ initialCases, initialRetentionReviews }: Props) {
  const [cases, setCases] = useState(initialCases);
  const [retentionReviews, setRetentionReviews] = useState(initialRetentionReviews);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    caseType: "quality_finding",
    severity: "medium",
    enrollmentId: "",
    title: "",
    description: "",
  });

  const openCount = useMemo(() => cases.filter((item) => item.status !== "closed" && item.status !== "voided").length, [cases]);
  const criticalCount = useMemo(() => cases.filter((item) => item.severity === "critical" && item.status !== "closed" && item.status !== "voided").length, [cases]);
  const reviewDueCount = useMemo(() => retentionReviews.filter((item) => item.status === "review_due" || item.status === "eligible_for_disposition" || item.status === "disposition_blocked").length, [retentionReviews]);

  async function refresh() {
    const response = await fetch("/api/florida-class-d/admin/quality", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to refresh quality records.");
    setCases(Array.isArray(payload.cases) ? payload.cases : []);
    setRetentionReviews(Array.isArray(payload.retentionReviews) ? payload.retentionReviews : []);
  }

  async function post(body: Record<string, unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/florida-class-d/admin/quality", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Quality-management action failed.");
      setNotice(success);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quality-management action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function openCase() {
    await post({ action: "open_case", ...form }, "Quality case opened and added to the controlled history.");
    setForm((current) => ({ ...current, title: "", description: "" }));
  }

  async function progressCase(caseId: string, status: QualityStatus) {
    const correctiveAction = status === "closed" ? window.prompt("Corrective action verified before closure:") || "" : null;
    if (status === "closed" && correctiveAction.trim().length < 3) {
      setError("A documented corrective action is required before closure.");
      return;
    }
    const eventNote = window.prompt("Case note (optional):") || "";
    await post({ action: "progress_case", caseId, status, correctiveAction, eventNote }, `Quality case moved to ${status}.`);
  }

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Quality, CAPA &amp; Record Retention</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>CONTROLLED SCHOOL OPERATIONS</strong>
          <small>Exceptions · corrective action · retention review</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {notice ? <div className="fdacs-live__alert">{notice}</div> : null}

      <section className="fdacs-live__panel">
        <h2>Quality dashboard</h2>
        <div className="fdacs-completion-admin__grid">
          <article className="fdacs-completion-admin__card"><strong>{openCount}</strong><span>Open quality cases</span></article>
          <article className="fdacs-completion-admin__card"><strong>{criticalCount}</strong><span>Open critical cases</span></article>
          <article className="fdacs-completion-admin__card"><strong>{reviewDueCount}</strong><span>Retention reviews requiring attention</span></article>
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Open a controlled quality case</h2>
        <div className="fdacs-completion-admin__grid">
          <label>Case type
            <select value={form.caseType} onChange={(event) => setForm((current) => ({ ...current, caseType: event.target.value }))}>
              <option value="incident">Incident</option><option value="complaint">Complaint</option><option value="attendance_exception">Attendance exception</option><option value="exam_exception">Exam exception</option><option value="lias_exception">LIAS exception</option><option value="security_event">Security event</option><option value="quality_finding">Quality finding</option>
            </select>
          </label>
          <label>Severity
            <select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
          </label>
          <label>Enrollment ID, if applicable<input value={form.enrollmentId} onChange={(event) => setForm((current) => ({ ...current, enrollmentId: event.target.value }))} /></label>
          <label>Title<input value={form.title} maxLength={250} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Description<textarea value={form.description} maxLength={8000} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
          <button type="button" disabled={busy || form.title.trim().length < 3 || form.description.trim().length < 3} onClick={() => void openCase()}>Open quality case</button>
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Quality cases</h2>
        <div className="fdacs-completion-admin__grid">
          {cases.map((item) => (
            <article key={item.id} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head"><strong>{item.title}</strong><span>{item.severity.toUpperCase()} · {item.status.toUpperCase()}</span></div>
              <p>{item.description}</p>
              <dl>
                <div><dt>Type</dt><dd>{item.case_type}</dd></div>
                <div><dt>Opened</dt><dd>{new Date(item.opened_at).toLocaleString()}</dd></div>
                <div><dt>Enrollment</dt><dd>{item.enrollment_id || "Not linked"}</dd></div>
                <div><dt>Due</dt><dd>{item.due_at ? new Date(item.due_at).toLocaleString() : "Not set"}</dd></div>
              </dl>
              {item.status !== "closed" && item.status !== "voided" ? (
                <div className="fdacs-live__actions">
                  <button type="button" disabled={busy} onClick={() => void progressCase(item.id, "investigating")}>Investigate</button>
                  <button type="button" disabled={busy} onClick={() => void progressCase(item.id, "action_required")}>Require action</button>
                  <button type="button" disabled={busy} onClick={() => void progressCase(item.id, "verification")}>Verify</button>
                  <button type="button" disabled={busy} onClick={() => void progressCase(item.id, "closed")}>Close after verification</button>
                </div>
              ) : null}
            </article>
          ))}
          {cases.length === 0 ? <p>No quality cases have been recorded.</p> : null}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Retention reviews</h2>
        <p>Regulatory minimum and the school's longer operational retention policy remain separate. Legal holds block disposition.</p>
        <div className="fdacs-completion-admin__grid">
          {retentionReviews.map((item) => (
            <article key={item.id} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head"><strong>{item.enrollment_id}</strong><span>{item.status.toUpperCase()}</span></div>
              <dl>
                <div><dt>Minimum retain until</dt><dd>{item.minimum_retain_until}</dd></div>
                <div><dt>Operational retain until</dt><dd>{item.operational_retain_until}</dd></div>
                <div><dt>Next review</dt><dd>{item.next_review_on}</dd></div>
                <div><dt>Legal hold</dt><dd>{item.legal_hold_active ? "ACTIVE" : "No"}</dd></div>
              </dl>
            </article>
          ))}
          {retentionReviews.length === 0 ? <p>No retention-review records are currently available.</p> : null}
        </div>
      </section>
    </main>
  );
}
