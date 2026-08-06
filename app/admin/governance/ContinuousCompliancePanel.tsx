"use client";

import { useEffect, useRef, useState } from "react";

type Snapshot = {
  compiledAt: string;
  sourceRevision: string;
  status: "compliant" | "partially-compliant" | "non-compliant" | "not-assessed";
  score: number;
  releaseReady: boolean;
  digest: string;
  summary: { totalControls: number; implementedControls: number; partialControls: number; plannedControls: number; missingEvidence: number; missingTests: number; releaseBlockingFindings: number; openCriticalFindings: number; openHighFindings: number };
  frameworks: Record<string, { total: number; implemented: number; partial: number; planned: number; score: number; status: string }>;
  evidence: { documentCount: number; evidenceReferenceCount: number; validationCommandCount: number; completenessPercent: number };
  vulnerability: { state: string; releaseBlockingFindings: number; openCriticalFindings: number; openHighFindings: number };
};

type Payload = { snapshot?: Snapshot; error?: string; health?: { defaultRefreshSeconds?: number; durableSnapshots?: boolean } };

export default function ContinuousCompliancePanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState("Starting continuous compliance compiler...");
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const etag = useRef<string | null>(null);

  async function refresh(persist = false) {
    if (persist) setBusy(true);
    try {
      const response = await fetch("/api/owner/governance/compliance-status", {
        method: persist ? "POST" : "GET",
        cache: "no-store",
        headers: !persist && etag.current ? { "If-None-Match": etag.current } : undefined,
      });
      if (response.status === 304) {
        setStatus(`No compliance drift detected. Last compiled ${snapshot?.compiledAt ? new Date(snapshot.compiledAt).toLocaleTimeString() : "recently"}.`);
        return;
      }
      const payload = (await response.json()) as Payload;
      if (!response.ok || !payload.snapshot) throw new Error(payload.error || "Compliance compiler unavailable");
      setSnapshot(payload.snapshot);
      etag.current = payload.snapshot.digest;
      setStatus(`${persist ? "Auditable snapshot persisted" : "Live status updated"} at ${new Date(payload.snapshot.compiledAt).toLocaleTimeString()}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Compliance compiler unavailable");
    } finally {
      if (persist) setBusy(false);
    }
  }

  useEffect(() => {
    void refresh(false);
    if (paused) return;
    const timer = window.setInterval(() => void refresh(false), 30_000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="governance-section compliance-compiler-section">
      <div className="governance-heading">
        <div><p className="governance-eyebrow">CONTINUOUS AI COMPLIANCE COMPILER</p><h2>Live control status, evidence drift, release posture, and risk-linked compliance.</h2></div>
        <p>The compiler recalculates every 30 seconds from verified controls, evidence, tests, release configuration, and scanner summaries. It does not claim certification.</p>
      </div>

      <div className="governance-kpis">
        <article><span>COMPLIANCE SCORE</span><strong>{snapshot?.score ?? "—"}%</strong><p>{snapshot?.status ?? "not assessed"}</p></article>
        <article><span>EVIDENCE COMPLETE</span><strong>{snapshot?.evidence.completenessPercent ?? "—"}%</strong><p>{snapshot?.summary.missingEvidence ?? 0} missing evidence links</p></article>
        <article><span>RELEASE POSTURE</span><strong>{snapshot?.releaseReady ? "READY" : "BLOCKED"}</strong><p>{snapshot?.summary.releaseBlockingFindings ?? 0} security blockers</p></article>
        <article><span>CONTROL COVERAGE</span><strong>{snapshot?.summary.implementedControls ?? 0}/{snapshot?.summary.totalControls ?? 0}</strong><p>{snapshot?.summary.plannedControls ?? 0} planned controls</p></article>
      </div>

      <div className="framework-grid compliance-framework-grid">
        {snapshot ? Object.entries(snapshot.frameworks).map(([framework, values]) => <article key={framework}><span>{framework}</span><strong>{values.score}%</strong><p>{values.implemented}/{values.total} implemented · {values.status}</p></article>) : null}
      </div>

      <div className="compliance-compiler-meta">
        <div><span>Source revision</span><code>{snapshot?.sourceRevision ?? "awaiting compilation"}</code></div>
        <div><span>Snapshot digest</span><code>{snapshot?.digest ?? "awaiting compilation"}</code></div>
        <div><span>Scanner state</span><strong>{snapshot?.vulnerability.state ?? "unknown"}</strong></div>
        <div><span>Critical / High</span><strong>{(snapshot?.summary.openCriticalFindings ?? 0) + (snapshot?.summary.openHighFindings ?? 0)}</strong></div>
      </div>

      <div className="scanner-actions">
        <button type="button" onClick={() => void refresh(false)} disabled={busy}>Refresh now</button>
        <button type="button" onClick={() => void refresh(true)} disabled={busy}>Persist audit snapshot</button>
        <button type="button" onClick={() => setPaused((value) => !value)} disabled={busy}>{paused ? "Resume live updates" : "Pause live updates"}</button>
      </div>
      <p className="governance-export-status" aria-live="polite">{status}</p>
    </section>
  );
}
