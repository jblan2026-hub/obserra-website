"use client";

import { useState } from "react";

export default function GovernanceExportActions() {
  const [reason, setReason] = useState("Governance evidence review and audit support");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadExport(format: "pdf" | "excel") {
    setBusy(true);
    setStatus(`Generating governed ${format === "excel" ? "Excel crosswalk" : "PDF evidence package"}...`);
    try {
      const response = await fetch(`/api/owner/governance/export/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason, idempotencyKey: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error((await response.json()).error || `${format} export failed`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "excel"
        ? `obserra-governance-crosswalk-${new Date().toISOString().slice(0, 10)}.xls`
        : `obserra-governance-evidence-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus(`${format === "excel" ? "Excel crosswalk" : "PDF evidence package"} generated and audit-recorded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `${format} export failed`);
    } finally {
      setBusy(false);
    }
  }

  async function emailExport(format: "pdf" | "excel") {
    setBusy(true);
    setStatus(`Sending governed ${format === "excel" ? "Excel crosswalk" : "PDF evidence package"}...`);
    try {
      const response = await fetch("/api/owner/governance/export/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipient, reason, format, idempotencyKey: crypto.randomUUID() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Email export failed");
      setStatus(`${format === "excel" ? "Excel crosswalk" : "PDF evidence package"} accepted for delivery to ${payload.recipientDomain}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Email export failed");
    } finally {
      setBusy(false);
    }
  }

  const invalid = busy || reason.trim().length < 5;
  const invalidEmail = invalid || !recipient.includes("@");

  return (
    <section className="governance-export-panel">
      <div>
        <p className="governance-eyebrow">GOVERNED EXPORTS</p>
        <h2>Create the Excel control crosswalk and PDF audit binder.</h2>
        <p>The control crosswalk is exported to Excel, not Word. Exports require recent identity reverification, owner authorization, a documented purpose, and durable audit evidence.</p>
      </div>
      <label>
        Export purpose
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} maxLength={500} />
      </label>
      <div className="governance-export-actions">
        <button type="button" onClick={() => downloadExport("excel")} disabled={invalid}>Download Excel Crosswalk</button>
        <button type="button" onClick={() => downloadExport("pdf")} disabled={invalid}>Generate PDF Binder</button>
        <input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="auditor@example.com" />
        <button type="button" onClick={() => emailExport("excel")} disabled={invalidEmail}>Email Excel</button>
        <button type="button" onClick={() => emailExport("pdf")} disabled={invalidEmail}>Email PDF</button>
      </div>
      <p className="governance-export-status" aria-live="polite">{status}</p>
    </section>
  );
}
