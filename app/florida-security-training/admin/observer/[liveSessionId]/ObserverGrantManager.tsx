"use client";

import { FormEvent, useMemo, useState } from "react";

type GrantResult = {
  grantId?: string;
  expiresAt?: string;
  observerPath?: string;
  accessToken?: string;
  oneTimeDisplay?: boolean;
};

async function observerAdminApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/observer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Observer access request failed.");
  return payload as GrantResult;
}

export default function ObserverGrantManager({ liveSessionId }: { liveSessionId: string }) {
  const [observerLabel, setObserverLabel] = useState("FDACS Division of Licensing Observer");
  const [purpose, setPurpose] = useState("Regulatory observation of live Florida Class D instruction");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [grant, setGrant] = useState<GrantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fullLink = useMemo(() => {
    if (!grant?.observerPath || typeof window === "undefined") return "";
    return `${window.location.origin}${grant.observerPath}`;
  }, [grant?.observerPath]);

  async function createGrant(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await observerAdminApi({
        action: "create",
        liveSessionId,
        observerLabel,
        purpose,
        durationMinutes,
      });
      setGrant(result);
      setNotice("Temporary view-only observer access created. Copy the link now. The plaintext access token is not stored by OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC.");
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : "Observer access could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!fullLink) return;
    try {
      await navigator.clipboard.writeText(fullLink);
      setNotice("Observer link copied. Share it only with the intended authorized observer through an appropriate channel.");
    } catch {
      setNotice("Clipboard access was unavailable. Select and copy the observer link manually.");
    }
  }

  async function revokeGrant() {
    if (!grant?.grantId) return;
    setBusy(true);
    setError(null);
    try {
      await observerAdminApi({ action: "revoke", grantId: grant.grantId });
      setNotice("Observer grant revoked. A new grant is required for any later observation.");
      setGrant(null);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Observer access could not be revoked.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fdacs-live fdacs-observer-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Regulatory Observer Access</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>CONTROLLED · TEMPORARY</strong>
          <small>Live session {liveSessionId}</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {notice ? <div className="fdacs-observer-admin__notice">{notice}</div> : null}

      <section className="fdacs-observer-admin__grid">
        <section className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Create view-only access</h2><span>school / compliance admin</span></div>
          <p className="fdacs-live__muted">Create a short-lived observer grant for an authorized regulatory observation. The resulting link opens only the live media surface and does not grant access to student records, examinations, answer keys, credentials, attendance administration, or instructor controls.</p>
          <form className="fdacs-live__form" onSubmit={createGrant}>
            <label>Observer label<input value={observerLabel} onChange={(event) => setObserverLabel(event.target.value)} maxLength={160} required /></label>
            <label>Purpose<textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} maxLength={500} required /></label>
            <label>Access duration
              <select value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))}>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
                <option value={180}>180 minutes</option>
                <option value={240}>240 minutes</option>
              </select>
            </label>
            <button type="submit" disabled={busy}>{busy ? "Creating…" : "Create temporary observer link"}</button>
          </form>
        </section>

        <section className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Current generated grant</h2><span>{grant?.grantId ? "active" : "none"}</span></div>
          {grant?.grantId ? (
            <div className="fdacs-observer-admin__grant">
              <div><small>GRANT ID</small><code>{grant.grantId}</code></div>
              <div><small>EXPIRES</small><strong>{grant.expiresAt ? new Date(grant.expiresAt).toLocaleString() : "Unknown"}</strong></div>
              <label>Observer link<textarea readOnly value={fullLink} onFocus={(event) => event.currentTarget.select()} /></label>
              <div className="fdacs-observer-admin__actions">
                <button type="button" onClick={() => void copyLink()}>Copy observer link</button>
                <button type="button" className="danger" disabled={busy} onClick={() => void revokeGrant()}>Revoke access</button>
              </div>
              <p className="fdacs-live__fineprint">The secret portion of the link is displayed only in this browser response. The database stores only a SHA-256 digest. If the link is lost, revoke this grant and issue a new one.</p>
            </div>
          ) : <p className="fdacs-live__muted">No observer link has been generated in this browser session.</p>}
        </section>
      </section>
    </main>
  );
}
