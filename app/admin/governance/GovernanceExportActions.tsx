"use client";

import { useState } from "react";

export default function GovernanceExportActions() {
  const [reason, setReason] = useState("Governance evidence review and audit support");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadPdf() {
    setBusy(true);
    setStatus("Generating governed PDF evidence package...");
    try {
      const response = await fetch("/api/owner/governance/export/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason, idempotencyKey: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "PDF export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `obserra-governance-evidence-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("PDF evidence package generated and audit-recorded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PDF export failed");
    } finally {
      setBusy(false);
    }
  }

  async function emailPdf() {
    setBusy(true);
    setStatus("Sending governed evidence package...");
    try {
      const response = await fetch("/api/owner/governance/export/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipient, reason, idempotencyKey: crypto.randomUUID() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Email export failed");
      setStatus(`Evidence package accepted for delivery to ${payload.recipientDomain}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Email export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="governance-export-panel">
      <div>
        <p className="governance-eyebrow">GOVERNED EXPORTS</p>
        <h2>Create an audit binder or send it by email.</h2>
        <p>Exports require recent identity reverification, owner authorization, a documented purpose, and durable audit evidence.</p>
      </div>
      <label>
        Export purpose
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} maxLength={500} />
      </label>
      <div className="governance-export-actions">
        <button type="button" onClick={downloadPdf} disabled={busy || reason.trim().length < 5}>Generate PDF</button>
        <input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="auditor@example.com" />
        <button type="button" onClick={emailPdf} disabled={busy || reason.trim().length < 5 || !recipient.includes("@")}>Email PDF</button>
      </div>
      <p className="governance-export-status" aria-live="polite">{status}</p>
    </section>
  );
}
