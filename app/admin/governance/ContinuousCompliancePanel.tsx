"use client";

import { useEffect, useState } from "react";

type Compilation = {
  compilationId: string;
  generatedAt: string;
  expiresAt: string;
  overallState: "compliant" | "partial" | "noncompliant" | "unknown";
  compliancePercent: number;
  controlCount: number;
  compliantControls: number;
  partialControls: number;
  noncompliantControls: number;
  unknownControls: number;
  evidenceReferences: number;
  validationCommands: number;
  auditableDocuments: number;
  driftDetected: boolean;
  blockingGaps: string[];
  aiSummary: { mode: string; narrative: string; recommendations: string[] };
};

export default function ContinuousCompliancePanel() {
  const [data, setData] = useState<Compilation | null>(null);
  const [status, setStatus] = useState("Compiling compliance evidence...");
  const [lastSuccessfulRefresh, setLastSuccessfulRefresh] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function refresh() {
      try {
        const response = await fetch("/api/owner/governance/compliance-status", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Compliance compilation failed");
        if (!active) return;
        setData(payload);
        setLastSuccessfulRefresh(new Date().toISOString());
        setStatus("Live compliance compilation current");
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Compliance compilation unavailable");
      }
    }

    void refresh();
    timer = setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const stale = data ? Date.now() > new Date(data.expiresAt).getTime() : true;

  return (
    <section className="governance-section">
      <div className="governance-heading">
        <div>
          <p className="governance-eyebrow">CONTINUOUS AI COMPLIANCE COMPILER</p>
          <h2>Live evidence compilation and compliance drift status.</h2>
        </div>
        <p>{status} · refreshes every 30 seconds · AI cannot override deterministic control status.</p>
      </div>

      <div className="framework-grid">
        <article><span>OVERALL STATUS</span><strong>{data?.overallState ?? "Compiling"}</strong><p>{stale ? "Evidence snapshot stale or unavailable" : "Evidence snapshot current"}</p></article>
        <article><span>COMPLIANCE</span><strong>{data ? `${data.compliancePercent}%` : "—"}</strong><p>{data?.compliantControls ?? 0} of {data?.controlCount ?? 0} controls evidence-complete</p></article>
        <article><span>DRIFT</span><strong>{data?.driftDetected ? "Detected" : data ? "None" : "Unknown"}</strong><p>{data?.blockingGaps.length ?? 0} blocking evidence gaps</p></article>
        <article><span>LAST COMPILED</span><strong>{data ? new Date(data.generatedAt).toLocaleTimeString() : "—"}</strong><p>{lastSuccessfulRefresh ? `Last refresh ${new Date(lastSuccessfulRefresh).toLocaleTimeString()}` : "Awaiting first successful refresh"}</p></article>
      </div>

      {data && (
        <div className="document-grid">
          <article><span>VERIFIED AI SUMMARY</span><h3>{data.aiSummary.narrative}</h3><p>Mode: {data.aiSummary.mode}</p><strong>Recommendations are advisory only</strong></article>
          <article><span>CONTROL DISTRIBUTION</span><h3>{data.compliantControls} compliant · {data.partialControls} partial</h3><p>{data.noncompliantControls} noncompliant · {data.unknownControls} unknown</p><strong>{data.validationCommands} validation commands</strong></article>
          <article><span>EVIDENCE INVENTORY</span><h3>{data.evidenceReferences} linked references</h3><p>{data.auditableDocuments} auditable documents compiled</p><strong>Compilation ID: {data.compilationId}</strong></article>
        </div>
      )}

      {data?.blockingGaps.length ? (
        <div className="control-table-wrap">
          <table className="control-table">
            <thead><tr><th>Blocking compliance gaps</th></tr></thead>
            <tbody>{data.blockingGaps.slice(0, 20).map((gap) => <tr key={gap}><td>{gap}</td></tr>)}</tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
