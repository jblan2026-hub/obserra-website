"use client";

import { useEffect, useState } from "react";

type ObserverMedia = {
  joinUrl?: string;
  observerLabel?: string;
  purpose?: string;
  lessonId?: string | null;
  day?: number | null;
  tokenExpiresAt?: string;
  observerMode?: "view-only";
};

export default function ObserverClassroom() {
  const [media, setMedia] = useState<ObserverMedia | null>(null);
  const [status, setStatus] = useState("Validating temporary observer access…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function openObserverClassroom() {
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = fragment.get("access")?.trim() || "";
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      if (!accessToken) {
        setStatus("Observer access is locked.");
        setError("A valid temporary observer access link is required.");
        return;
      }
      try {
        const response = await fetch("/api/florida-class-d/observer/media", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ accessToken }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Observer access could not be validated.");
        if (!cancelled) {
          setMedia(payload as ObserverMedia);
          setStatus("Temporary view-only observer access is active.");
          setError(null);
        }
      } catch (accessError) {
        if (!cancelled) {
          setStatus("Observer access is locked.");
          setError(accessError instanceof Error ? accessError.message : "Observer access could not be validated.");
        }
      }
    }

    void openObserverClassroom();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="fdacs-live fdacs-observer">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Regulatory Observer</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>VIEW ONLY</strong>
          <small>{status}</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      <section className="fdacs-observer__shell">
        <div className="fdacs-live__stage">
          <div className="fdacs-live__stage-frame fdacs-live__media-frame">
            {media?.joinUrl ? (
              <iframe
                title="Obserra Florida Class D temporary regulatory observation"
                src={media.joinUrl}
                allow="fullscreen; autoplay"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="fdacs-live__media-waiting">
                <span>CONTROLLED REGULATORY OBSERVATION</span>
                <h2>Live classroom access</h2>
                <p>The classroom opens only after a valid, unexpired, non-revoked observer grant is exchanged for a short-lived view-only media token.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="fdacs-live__panel fdacs-observer__details">
          <div className="fdacs-live__panel-head"><h2>Observation scope</h2><span>temporary</span></div>
          <dl>
            <div><dt>Observer</dt><dd>{media?.observerLabel ?? "Pending validation"}</dd></div>
            <div><dt>Purpose</dt><dd>{media?.purpose ?? "Regulatory observation"}</dd></div>
            <div><dt>Lesson</dt><dd>{media?.lessonId ?? "Not available"}</dd></div>
            <div><dt>Day</dt><dd>{media?.day ?? "–"}</dd></div>
            <div><dt>Mode</dt><dd>View only</dd></div>
          </dl>
          <p className="fdacs-live__fineprint">This observer surface does not expose student identity records, attendance ledgers, examination content, answer keys, school credentials, or administrative controls. Camera, microphone, screen sharing, chat, recording, and room administration are disabled for the observer token.</p>
        </aside>
      </section>
    </main>
  );
}
