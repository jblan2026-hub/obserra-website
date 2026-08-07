"use client";

import { useState } from "react";
import styles from "./owner-access.module.css";

export default function OwnerBootstrapClient({ redirectUrl }: { redirectUrl: string }) {
  const [proof, setProof] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function bindOwnerIdentity() {
    if (busy || proof.trim().length < 32) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/owner/bootstrap", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-obserra-bootstrap-code": proof.trim(),
          "x-obserra-request-id": crypto.randomUUID(),
        },
        body: JSON.stringify({ requestId: crypto.randomUUID() }),
      });
      const payload = await response.json() as { ownerBound?: boolean; error?: string };
      if (!response.ok || payload.ownerBound !== true) {
        throw new Error(payload.error ?? "The owner proof was not accepted.");
      }

      setProof("");
      window.location.assign(redirectUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The owner identity could not be bound.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.bootstrapCard}>
      <p className={styles.eyebrow}>ONE-TIME OWNER PROOF</p>
      <h2>Complete the permanent owner identity binding.</h2>
      <p>
        Enter the current single-use proof exactly once. After successful binding, this proof expires and cannot
        authorize another identity.
      </p>
      <label className={styles.proofField}>
        <span>Owner proof</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={proof}
          onChange={(event) => setProof(event.target.value)}
          minLength={32}
          maxLength={200}
          placeholder="Enter the single-use owner proof"
        />
      </label>
      <button
        type="button"
        className={styles.primaryAction}
        disabled={busy || proof.trim().length < 32}
        onClick={() => void bindOwnerIdentity()}
      >
        {busy ? "Binding owner identity…" : "Bind this identity as company owner"}
      </button>
      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}
      <p className={styles.securityNote}>
        The proof is sent only to the protected owner bootstrap boundary and is never written to browser storage.
      </p>
    </div>
  );
}
