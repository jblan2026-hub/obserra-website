"use client";

import { useCallback, useEffect, useState } from "react";

type Readiness = {
  enrollmentId: string;
  identityVerified: boolean;
  moduleChecksComplete: boolean;
  completedModuleCount: number;
  verifiedInstructionalMinutes: number;
  instructionalHoursSatisfied: boolean;
  fiveTrainingDaysSatisfied: boolean;
  trainingDaysSatisfied: number;
  examPassed: boolean;
  openSecurityIssues: number;
  openExamAttempts: number;
  openRemediationItems: number;
  existingCompletionId: string | null;
  ready: boolean;
};

type QueueItem = {
  id: string;
  completion_record_id: string;
  enrollment_id: string;
  status: string;
  prepared_at: string;
  submission_reference?: string | null;
};

type Payload = {
  candidates?: Readiness[];
  liasQueue?: QueueItem[];
  error?: string;
};

async function loadData() {
  const response = await fetch("/api/florida-class-d/admin/completion", { cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as Payload;
  if (!response.ok) throw new Error(payload.error || "Unable to load completion review records.");
  return payload;
}

export default function CompletionReviewConsole() {
  const [payload, setPayload] = useState<Payload>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPayload(await loadData());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load completion review records.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function approve(enrollmentId: string) {
    const reviewNote = (notes[enrollmentId] || "").trim();
    if (reviewNote.length < 3) {
      setError("Enter a documented completion review note before approval.");
      return;
    }
    if (!window.confirm("Approve successful course completion and prepare this record for the manual FDACS/LIAS reporting queue?")) return;
    setBusy(enrollmentId);
    setError(null);
    try {
      const response = await fetch("/api/florida-class-d/admin/completion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "approve_completion", enrollmentId, reviewNote }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Completion approval failed.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Completion approval failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Successful Completion Review</h1></div>
        <div className="fdacs-live__status"><strong>COMPLIANCE CONTROL</strong><small>40 hours · 5 days · 18 checks · passing exam</small></div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      <section className="fdacs-live__panel">
        <h2>Completion candidates</h2>
        <p>Successful completion is not created automatically. Every candidate must satisfy the regulated evidence gates and receive compliance-administrator approval.</p>
        <div className="fdacs-completion-admin__grid">
          {(payload.candidates || []).map((candidate) => (
            <article key={candidate.enrollmentId} className="fdacs-completion-admin__card">
              <div className="fdacs-completion-admin__card-head">
                <strong>{candidate.enrollmentId}</strong>
                <span>{candidate.ready ? "READY" : "NOT READY"}</span>
              </div>
              <dl>
                <div><dt>Identity</dt><dd>{candidate.identityVerified ? "Verified" : "Blocked"}</dd></div>
                <div><dt>Instruction</dt><dd>{candidate.verifiedInstructionalMinutes} / 2400 min</dd></div>
                <div><dt>Training days</dt><dd>{candidate.trainingDaysSatisfied} / 5</dd></div>
                <div><dt>Module checks</dt><dd>{candidate.completedModuleCount} / 18</dd></div>
                <div><dt>Exam</dt><dd>{candidate.examPassed ? "Passed" : "Blocked"}</dd></div>
                <div><dt>Security issues</dt><dd>{candidate.openSecurityIssues}</dd></div>
                <div><dt>Open exam attempts</dt><dd>{candidate.openExamAttempts}</dd></div>
                <div><dt>Open remediation</dt><dd>{candidate.openRemediationItems}</dd></div>
              </dl>
              <textarea
                value={notes[candidate.enrollmentId] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [candidate.enrollmentId]: event.target.value }))}
                placeholder="Document the completion review and evidence confirmation."
                maxLength={4000}
              />
              <button type="button" disabled={!candidate.ready || busy === candidate.enrollmentId} onClick={() => void approve(candidate.enrollmentId)}>
                {busy === candidate.enrollmentId ? "Approving…" : "Approve completion & prepare LIAS queue"}
              </button>
            </article>
          ))}
          {(payload.candidates || []).length === 0 ? <p>No passed-exam candidates are currently awaiting review.</p> : null}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>FDACS / LIAS preparation queue</h2>
        <p>This queue prepares inspection-ready records for authorized school staff. It does not automate or scrape the FDACS LIAS portal.</p>
        <div className="fdacs-completion-admin__queue">
          {(payload.liasQueue || []).map((item) => (
            <div key={item.id}>
              <strong>{item.enrollment_id}</strong>
              <span>{item.status}</span>
              <small>{new Date(item.prepared_at).toLocaleString()}</small>
            </div>
          ))}
          {(payload.liasQueue || []).length === 0 ? <p>No completion records are waiting in the reporting queue.</p> : null}
        </div>
      </section>
    </main>
  );
}
