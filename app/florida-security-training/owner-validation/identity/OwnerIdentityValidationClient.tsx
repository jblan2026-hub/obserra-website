"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, IdCard, LoaderCircle, ShieldCheck } from "lucide-react";

type StatusPayload = {
  status?: string;
  verified?: boolean;
  providerLivemode?: boolean;
  providerErrorCode?: string | null;
  error?: string;
};

const API_PATH = "/api/florida-class-d/owner-validation/identity";

export default function OwnerIdentityValidationClient() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(API_PATH, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null) as StatusPayload | null;
      if (!response.ok || !payload) {
        setStatus(null);
        setMessage(payload?.error ?? "Identity validation status is unavailable.");
        return;
      }
      setStatus(payload);
    } catch {
      setStatus(null);
      setMessage("Identity validation status is unavailable.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const returnedFromProvider = new URLSearchParams(window.location.search).get("provider_return") === "1";
    if (!returnedFromProvider) return;
    const timer = window.setTimeout(() => void refreshStatus(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshStatus]);

  async function startValidation() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(API_PATH, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => null) as { url?: string; error?: string } | null;
      if (!response.ok || !payload?.url || !payload.url.startsWith("https://")) {
        setMessage(payload?.error ?? "Unable to start hosted identity validation.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setMessage("Unable to start hosted identity validation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="fl-classd__section" aria-labelledby="owner-idv-heading">
      <div className="fl-classd__section-heading">
        <span>LIVE OWNER ID TEST</span>
        <h2 id="owner-idv-heading">Government ID and matching selfie</h2>
        <p>Launch the configured Stripe Identity provider from this authenticated AAL2 owner session. Test mode and live mode are both reported accurately by the provider response.</p>
      </div>

      {status ? (
        <div className={`fl-classd__notice ${status.verified ? "is-success" : ""}`} role="status">
          {status.verified ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
          <div>
            <strong>{status.verified ? "Hosted identity validation verified." : `Provider status: ${status.status ?? "unknown"}`}</strong>
            <span>{status.providerLivemode ? "Stripe live mode. " : "Stripe test mode. "}{status.providerErrorCode ? `Provider error code: ${status.providerErrorCode}. ` : ""}No identity document or selfie image is rendered by this LMS page.</span>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="fl-classd__notice is-locked" role="alert">
          <ShieldCheck size={20} />
          <div><strong>Identity test unavailable.</strong><span>{message}</span></div>
        </div>
      ) : null}

      <div className="fl-classd__actions">
        <button type="button" onClick={startValidation} disabled={busy}>
          {busy ? <LoaderCircle size={18} aria-hidden="true" /> : <IdCard size={18} aria-hidden="true" />}
          {busy ? "Working…" : "Start hosted ID verification"}
        </button>
        <button type="button" className="secondary" onClick={refreshStatus} disabled={busy}>Refresh provider status</button>
      </div>
    </section>
  );
}
