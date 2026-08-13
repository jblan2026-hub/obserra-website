"use client";

import { useMemo, useState } from "react";

const domains = [
  "identity_enrollment",
  "live_media",
  "attendance_time",
  "presence_challenges",
  "observer_access",
  "makeup",
  "recorded_makeup",
  "exam",
  "retest",
  "completion",
  "completion_documents",
  "lias_workflow",
  "inspection_packet",
  "quality_capa",
  "retention",
  "security_headers",
  "mobile_desktop",
  "accessibility",
] as const;

type Run = {
  id: string;
  environment_type: "development" | "sandbox" | "staging" | "uat";
  release_commit_sha: string;
  test_identity_reference: string;
  synthetic_identity_confirmed: boolean;
  status: "in_progress" | "passed" | "failed" | "aborted";
  started_at: string;
  completed_at?: string | null;
  summary?: string | null;
};

type CheckStatus = "not_run" | "passed" | "failed" | "blocked";

type Check = {
  id: string;
  run_id: string;
  domain: (typeof domains)[number];
  status: CheckStatus;
  evidence_reference?: string | null;
  operator_note?: string | null;
  verified_at: string;
};

async function post(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/acceptance", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Acceptance request failed.");
  return payload;
}

async function loadChecks(runId: string) {
  const response = await fetch(`/api/florida-class-d/admin/acceptance?runId=${encodeURIComponent(runId)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { checks?: Check[]; error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to load acceptance checks.");
  return payload.checks || [];
}

export default function AcceptanceConsole({ initialRuns }: { initialRuns: Run[] }) {
  const [runs, setRuns] = useState(initialRuns);
  const [selectedRunId, setSelectedRunId] = useState(initialRuns.find((run) => run.status === "in_progress")?.id || initialRuns[0]?.id || "");
  const [checks, setChecks] = useState<Check[]>([]);
  const [environmentType, setEnvironmentType] = useState<Run["environment_type"]>("uat");
  const [releaseCommitSha, setReleaseCommitSha] = useState("");
  const [testIdentityReference, setTestIdentityReference] = useState("");
  const [domain, setDomain] = useState<(typeof domains)[number]>(domains[0]);
  const [status, setStatus] = useState<CheckStatus>("not_run");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [operatorNote, setOperatorNote] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedRun = useMemo(() => runs.find((run) => run.id === selectedRunId), [runs, selectedRunId]);
  const checkMap = useMemo(() => new Map(checks.map((check) => [check.domain, check])), [checks]);
  const passedCount = domains.filter((entry) => checkMap.get(entry)?.status === "passed").length;

  async function refreshChecks(runId = selectedRunId) {
    if (!runId) return;
    setChecks(await loadChecks(runId));
  }

  async function createRun() {
    setBusy(true);
    setMessage("");
    try {
      const payload = await post({
        action: "create_run",
        environmentType,
        releaseCommitSha,
        testIdentityReference,
      }) as { run?: Run };
      if (!payload.run) throw new Error("Acceptance run was not returned.");
      setRuns((current) => [payload.run!, ...current]);
      setSelectedRunId(payload.run.id);
      setChecks([]);
      setMessage("Acceptance run created. Record evidence for all 18 domains before finalization.");
      setReleaseCommitSha("");
      setTestIdentityReference("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Acceptance run creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function recordCheck() {
    if (!selectedRunId) return;
    setBusy(true);
    setMessage("");
    try {
      await post({
        action: "record_check",
        runId: selectedRunId,
        domain,
        status,
        evidenceReference,
        operatorNote,
      });
      await refreshChecks(selectedRunId);
      setEvidenceReference("");
      setOperatorNote("");
      setMessage(`Evidence recorded for ${domain}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Acceptance evidence recording failed.");
    } finally {
      setBusy(false);
    }
  }

  async function finalizeRun() {
    if (!selectedRunId) return;
    setBusy(true);
    setMessage("");
    try {
      await post({ action: "finalize_run", runId: selectedRunId, summary });
      setRuns((current) => current.map((run) => run.id === selectedRunId ? { ...run, status: "passed", completed_at: new Date().toISOString(), summary } : run));
      setMessage("Acceptance run finalized as passed after all 18 domains were verified by the database rule.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Acceptance finalization failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="fdacs-live__panel">
        <h2>Create controlled acceptance run</h2>
        <div className="fdacs-completion-admin__grid">
          <label>Environment
            <select value={environmentType} onChange={(event) => setEnvironmentType(event.target.value as Run["environment_type"])} disabled={busy}>
              <option value="development">Development</option>
              <option value="sandbox">Sandbox</option>
              <option value="staging">Staging</option>
              <option value="uat">UAT</option>
            </select>
          </label>
          <label>Release commit SHA
            <input value={releaseCommitSha} onChange={(event) => setReleaseCommitSha(event.target.value.trim().toLowerCase())} placeholder="40 character commit SHA" disabled={busy} />
          </label>
          <label>Synthetic test identity reference
            <input value={testIdentityReference} onChange={(event) => setTestIdentityReference(event.target.value)} placeholder="Synthetic identity reference" disabled={busy} />
          </label>
        </div>
        <button type="button" onClick={createRun} disabled={busy || releaseCommitSha.length !== 40 || testIdentityReference.trim().length < 3}>Create acceptance run</button>
      </section>

      <section className="fdacs-live__panel">
        <h2>Record domain evidence</h2>
        <label>Acceptance run
          <select value={selectedRunId} onChange={async (event) => { const value = event.target.value; setSelectedRunId(value); setChecks([]); if (value) setChecks(await loadChecks(value)); }} disabled={busy}>
            <option value="">Select a run</option>
            {runs.map((run) => <option key={run.id} value={run.id}>{run.environment_type.toUpperCase()} · {run.release_commit_sha.slice(0, 12)} · {run.status}</option>)}
          </select>
        </label>
        {selectedRun ? <p>Selected run status: <strong>{selectedRun.status}</strong>. Passed domains: <strong>{passedCount}/18</strong>.</p> : null}
        <div className="fdacs-completion-admin__grid">
          <label>Domain
            <select value={domain} onChange={(event) => setDomain(event.target.value as (typeof domains)[number])} disabled={busy || selectedRun?.status !== "in_progress"}>
              {domains.map((entry) => <option key={entry} value={entry}>{entry.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label>Status
            <select value={status} onChange={(event) => setStatus(event.target.value as CheckStatus)} disabled={busy || selectedRun?.status !== "in_progress"}>
              <option value="not_run">Not run</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <label>Evidence reference
            <input value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} placeholder="Required when status is passed" disabled={busy || selectedRun?.status !== "in_progress"} />
          </label>
          <label>Operator note
            <textarea value={operatorNote} onChange={(event) => setOperatorNote(event.target.value)} disabled={busy || selectedRun?.status !== "in_progress"} />
          </label>
        </div>
        <button type="button" onClick={recordCheck} disabled={busy || !selectedRunId || selectedRun?.status !== "in_progress" || (status === "passed" && evidenceReference.trim().length < 3)}>Record evidence</button>
        <div className="fdacs-completion-admin__grid">
          {domains.map((entry) => {
            const check = checkMap.get(entry);
            return <article key={entry} className="fdacs-completion-admin__card"><strong>{entry.replaceAll("_", " ")}</strong><p>{check?.status || "not recorded"}</p>{check?.evidence_reference ? <small>{check.evidence_reference}</small> : null}</article>;
          })}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Finalize acceptance</h2>
        <p>Finalization is database controlled and fails unless every required domain is recorded as passed.</p>
        <label>Acceptance summary
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} disabled={busy || selectedRun?.status !== "in_progress"} />
        </label>
        <button type="button" onClick={finalizeRun} disabled={busy || !selectedRunId || selectedRun?.status !== "in_progress" || passedCount !== 18}>Finalize passed run</button>
      </section>

      {message ? <section className="fdacs-live__panel" role="status"><p>{message}</p></section> : null}
    </>
  );
}
