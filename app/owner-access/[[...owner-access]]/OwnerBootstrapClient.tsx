"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { ACADEMY_OWNER_CONTROL_URL } from "../../../lib/academy-control-contracts";
import styles from "./owner-access.module.css";

export default function OwnerBootstrapClient({ redirectUrl }: { redirectUrl: string }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [bootstrapCode, setBootstrapCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function bindOwnerIdentity() {
    if (!isLoaded || !isSignedIn || bootstrapCode.trim().length < 32 || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("The signed-in owner session could not be verified.");
      const response = await fetch(`${ACADEMY_OWNER_CONTROL_URL}/bootstrap`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "x-obserra-bootstrap-code": bootstrapCode.trim(),
          "x-obserra-request-id": crypto.randomUUID(),
        },
        body: JSON.stringify({ purpose: "bind-single-company-owner" }),
      });
      const payload = await response.json() as { ownerBound?: boolean; error?: string };
      if (!response.ok || payload.ownerBound !== true) {
        throw new Error(payload.error ?? "The one-time owner proof was rejected.");
      }
      setBootstrapCode("");
      window.location.assign(redirectUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Owner identity bootstrap failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.bootstrapPanel} aria-labelledby="owner-bootstrap-heading">
      <p className={styles.eyebrow}>ONE-TIME OWNER IDENTITY BINDING</p>
      <h2 id="owner-bootstrap-heading">Bind this signed-in Clerk identity to the company owner role.</h2>
      <p>
        This operation permanently associates the private Command Center with the current immutable Clerk user ID
        and issuer. Email addresses are not evaluated. The bootstrap proof is destroyed after successful use.
      </p>
      <label>
        <span>One-time owner proof</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={bootstrapCode}
          onChange={(event) => setBootstrapCode(event.target.value)}
          placeholder="Enter the one-time owner proof"
        />
      </label>
      <button
        type="button"
        disabled={!isLoaded || !isSignedIn || bootstrapCode.trim().length < 32 || submitting}
        onClick={() => void bindOwnerIdentity()}
      >
        {submitting ? "Binding owner identity…" : "Bind this identity as company owner"}
      </button>
      {message ? <p className={styles.error} role="alert">{message}</p> : null}
      <small>
        Only complete this action while signed in to the Clerk account that will permanently own the Obserra
        Command Center.
      </small>
    </section>
  );
}
