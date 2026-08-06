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

export default function OwnerAiSiteControl() {
  const [instruction, setInstruction] = useState("");
  const [context, setContext] = useState("");
  const [plan, setPlan] = useState<OwnerSiteChangePlan | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <section className="admin-section">
      <h2>AI website control center</h2>
      <p>
        Describe the website change in plain language. The AI produces a constrained plan only. Nothing reaches production until you approve the plan, review the Vercel preview, confirm validation is green, and merge the draft pull request.
      </p>

      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <label>
          <span style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Change instruction</span>
          <textarea
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Add a new approved course to the Academy catalog, set the price to 299 dollars, update the description, and prepare a preview."
            rows={5}
            style={{ width: "100%", padding: 14, borderRadius: 10 }}
          />
        </label>
        <label>
          <span style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Optional context</span>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Course manifest path, product slug, approved wording, price guidance, or other constraints."
            rows={4}
            style={{ width: "100%", padding: 14, borderRadius: 10 }}
          />
        </label>
        <div>
          <button type="button" onClick={requestPlan} disabled={busy}>
            {busy ? "Working..." : "Generate governed change plan"}
          </button>
        </div>
      </div>

      {error ? <p role="alert" style={{ color: "#ff9b9b", marginTop: 18 }}>{error}</p> : null}

      {plan ? (
        <article style={{ marginTop: 24, padding: 20, border: "1px solid #425d78", borderRadius: 12 }}>
          <p><strong>Summary:</strong> {plan.summary}</p>
          <p><strong>Rationale:</strong> {plan.rationale}</p>
          <p><strong>Risk:</strong> {plan.risk}</p>
          <p><strong>Operations:</strong> {plan.operations.length}</p>
          <pre style={{ overflowX: "auto", whiteSpace: "pre-wrap", background: "#07111d", padding: 14, borderRadius: 8 }}>
            {JSON.stringify(plan.operations, null, 2)}
          </pre>
          <button type="button" onClick={createPreview} disabled={busy}>
            Approve plan and create preview
          </button>
        </article>
      ) : null}

      {preview ? (
        <article style={{ marginTop: 24, padding: 20, border: "1px solid #3b7c68", borderRadius: 12 }}>
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
