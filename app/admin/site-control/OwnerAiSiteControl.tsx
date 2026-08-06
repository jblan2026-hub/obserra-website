"use client";

import { useState } from "react";
import type { OwnerSiteChangePlan } from "../../../lib/owner-ai-site-changes";

type PreviewResult = {
  previewBranch: string;
  pullRequestNumber: number;
  pullRequestUrl: string;
  changedPaths: string[];
  productionChanged: false;
};

type MaintenanceSnapshot = {
  generatedAt?: string;
  recommendations?: Array<{ title?: string; summary?: string; priority?: string; category?: string }>;
  [key: string]: unknown;
};

type AnalyticsPayload = {
  trends?: {
    totalInteractions: number;
    negativeInteractions: number;
    complaints: number;
    topics: Array<{ name: string; count: number }>;
    intents: Array<{ name: string; count: number }>;
    complaintCategories: Array<{ name: string; count: number; highestSeverity: string }>;
    lowConfidenceQuestions: Array<{ question: string; pathname: string; confidence: number }>;
    recommendedAdjustments: string[];
  };
  records?: Array<{ id: string; createdAt: string; pathname: string; question: string; answer: string; confidence: number }>;
};

const panelStyle = { marginTop: 24, padding: 20, border: "1px solid #425d78", borderRadius: 12 };

export default function OwnerAiSiteControl() {
  const [instruction, setInstruction] = useState("");
  const [context, setContext] = useState("");
  const [plan, setPlan] = useState<OwnerSiteChangePlan | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceSnapshot | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestJson(url: string) {
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? `Unable to load ${url}`);
    return payload;
  }

  async function requestPlan() {
    if (instruction.trim().length < 8) {
      setError("Enter a specific website change instruction.");
      return;
    }
    setBusy(true);
    setError("");
    setPlan(null);
    setPreview(null);
    try {
      const response = await fetch("/api/admin/site-change/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, context }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create plan");
      setPlan(payload.plan);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create plan");
    } finally {
      setBusy(false);
    }
  }

  async function createPreview() {
    if (!plan) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/site-change/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create preview");
      setPreview(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create preview");
    } finally {
      setBusy(false);
    }
  }

  async function loadOperations() {
    setBusy(true);
    setError("");
    try {
      const [maintenancePayload, analyticsPayload] = await Promise.all([
        requestJson("/api/admin/maintenance/recommendations"),
        requestJson("/api/admin/obserrian/analytics"),
      ]);
      setMaintenance(maintenancePayload);
      setAnalytics(analyticsPayload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load operational intelligence");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section">
      <h2>AI website control center</h2>
      <p>
        Govern website, Academy, catalog, pricing, maintenance, and customer-experience changes from one owner workspace. AI may recommend and prepare changes, but production remains blocked until preview validation and owner approval are complete.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
        <button type="button" onClick={loadOperations} disabled={busy}>
          {busy ? "Working..." : "Refresh maintenance and customer intelligence"}
        </button>
      </div>

      {error ? <p role="alert" style={{ color: "#ff9b9b", marginTop: 18 }}>{error}</p> : null}

      {maintenance ? (
        <article style={panelStyle}>
          <h3>Maintenance and upgrade intelligence</h3>
          <p>Generated: {maintenance.generatedAt ?? "Current request"}</p>
          {maintenance.recommendations?.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {maintenance.recommendations.map((item, index) => (
                <div key={`${item.title}-${index}`} style={{ padding: 14, border: "1px solid #294861", borderRadius: 10 }}>
                  <strong>{item.title ?? "Recommendation"}</strong>
                  <p>{item.summary ?? "Review the complete recommendation payload."}</p>
                  <small>{[item.priority, item.category].filter(Boolean).join(" · ")}</small>
                </div>
              ))}
            </div>
          ) : <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(maintenance, null, 2)}</pre>}
        </article>
      ) : null}

      {analytics?.trends ? (
        <article style={panelStyle}>
          <h3>Obserrian customer trends and complaints</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            <p><strong>{analytics.trends.totalInteractions}</strong><br />Interactions</p>
            <p><strong>{analytics.trends.negativeInteractions}</strong><br />Negative signals</p>
            <p><strong>{analytics.trends.complaints}</strong><br />Complaints</p>
          </div>
          <p><strong>Top topics:</strong> {analytics.trends.topics.slice(0, 5).map((item) => `${item.name} (${item.count})`).join(", ") || "No data yet"}</p>
          <p><strong>Complaint categories:</strong> {analytics.trends.complaintCategories.slice(0, 5).map((item) => `${item.name} (${item.count}, ${item.highestSeverity})`).join(", ") || "None"}</p>
          <h4>Recommended website adjustments</h4>
          {analytics.trends.recommendedAdjustments.length ? <ul>{analytics.trends.recommendedAdjustments.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No recurring adjustment signal yet.</p>}
          <h4>Recent low-confidence questions</h4>
          {analytics.trends.lowConfidenceQuestions.length ? <ul>{analytics.trends.lowConfidenceQuestions.slice(0, 10).map((item, index) => <li key={`${item.pathname}-${index}`}>{item.question} — {Math.round(item.confidence * 100)}% on {item.pathname}</li>)}</ul> : <p>None recorded.</p>}
        </article>
      ) : null}

      <article style={panelStyle}>
        <h3>Governed AI change request</h3>
        <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
          <label>
            <span style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Change instruction</span>
            <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Describe the website, product, pricing, Academy, maintenance, or catalog change required." rows={5} style={{ width: "100%", padding: 14, borderRadius: 10 }} />
          </label>
          <label>
            <span style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Optional context</span>
            <textarea value={context} onChange={(event) => setContext(event.target.value)} placeholder="Include approved wording, product slug, course manifest, market evidence, price constraints, or release requirements." rows={4} style={{ width: "100%", padding: 14, borderRadius: 10 }} />
          </label>
          <div><button type="button" onClick={requestPlan} disabled={busy}>{busy ? "Working..." : "Generate governed change plan"}</button></div>
        </div>
      </article>

      {plan ? (
        <article style={panelStyle}>
          <p><strong>Summary:</strong> {plan.summary}</p>
          <p><strong>Rationale:</strong> {plan.rationale}</p>
          <p><strong>Risk:</strong> {plan.risk}</p>
          <p><strong>Operations:</strong> {plan.operations.length}</p>
          <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", background: "#07111d", padding: 14, borderRadius: 8 }}>{JSON.stringify(plan.operations, null, 2)}</pre>
          <button type="button" onClick={createPreview} disabled={busy}>Approve plan and create preview</button>
        </article>
      ) : null}

      {preview ? (
        <article style={{ ...panelStyle, border: "1px solid #3b7c68" }}>
          <h3>Preview created</h3>
          <p>Production changed: <strong>No</strong></p>
          <p>Branch: <code>{preview.previewBranch}</code></p>
          <p>Changed records: {preview.changedPaths.join(", ")}</p>
          <a href={preview.pullRequestUrl} target="_blank" rel="noreferrer">Open draft pull request and Vercel preview</a>
        </article>
      ) : null}
    </section>
  );
}
