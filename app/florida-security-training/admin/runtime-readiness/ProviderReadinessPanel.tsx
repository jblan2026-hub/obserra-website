"use client";

import { useCallback, useEffect, useState } from "react";

type ProviderCheck = {
  provider: "supabase" | "stripe_identity" | "daily" | "fdacs_instructor";
  ready: boolean;
  detail: string;
};

type ProviderReport = {
  generatedAt?: string;
  ready?: boolean;
  checks?: ProviderCheck[];
  testMode?: string;
  productionActivationAuthorized?: boolean;
  fdacsApprovalClaimed?: boolean;
  secretsExposed?: boolean;
  error?: string;
};

async function readProviderReport() {
  const response = await fetch("/api/florida-class-d/admin/provider-readiness", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => ({})) as ProviderReport;
  if (!Array.isArray(payload.checks)) {
    throw new Error(payload.error || "Protected provider readiness is unavailable.");
  }
  return payload;
}

export default function ProviderReadinessPanel() {
  const [report, setReport] = useState<ProviderReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      setReport(await readProviderReport());
      setError(null);
    } catch (readinessError) {
      setError(readinessError instanceof Error ? readinessError.message : "Protected provider readiness is unavailable.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  return (
    <section className="fdacs-live__panel">
      <div className="fdacs-live__panel-head">
        <h2>Live provider preflight</h2>
        <span>{report?.ready ? "READY" : "BLOCKED"}</span>
      </div>
      <p>This read-only check authenticates the isolated FDACS database, live Stripe Identity, Daily, and bounded verified-active Class DI coverage. It creates no room, token, identity session, or student row.</p>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      <div className="fdacs-completion-admin__grid">
        {(report?.checks ?? []).map((check) => (
          <article key={check.provider} className="fdacs-completion-admin__card">
            <div className="fdacs-completion-admin__card-head">
              <strong>{check.provider.replaceAll("_", " ")}</strong>
              <span>{check.ready ? "READY" : "BLOCKED"}</span>
            </div>
            <p>{check.detail}</p>
          </article>
        ))}
      </div>
      <button type="button" disabled={busy} onClick={() => void refresh()}>
        {busy ? "Checking…" : "Run read-only provider preflight"}
      </button>
      <p><small>Secret values are suppressed. Production activation remains false and no FDACS approval is claimed.</small></p>
    </section>
  );
}
