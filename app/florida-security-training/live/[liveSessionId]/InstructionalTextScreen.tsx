"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TextScreen = {
  id?: string;
  title?: string;
  body?: string;
  word_count?: number;
  minimum_seconds?: number;
  opened_at?: string;
};

type Progress = {
  observedSeconds?: number;
  minimumSeconds?: number;
  requirementMet?: boolean;
  acknowledged?: boolean;
};

async function liveApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Instructional text-screen request failed.");
  return payload as { progress?: Progress; acknowledged?: boolean };
}

function formatSeconds(value: number) {
  const safe = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function InstructionalTextScreen({
  screen,
  deviceLeaseId,
}: {
  screen: TextScreen | null | undefined;
  deviceLeaseId: string | null;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const screenIdRef = useRef<string | null>(null);

  const requiredSeconds = useMemo(
    () => Math.max(0, progress?.minimumSeconds ?? screen?.minimum_seconds ?? 0),
    [progress?.minimumSeconds, screen?.minimum_seconds],
  );
  const observedSeconds = Math.max(0, progress?.observedSeconds ?? 0);
  const remainingSeconds = Math.max(0, requiredSeconds - observedSeconds);
  const requirementMet = Boolean(progress?.requirementMet || observedSeconds >= requiredSeconds && requiredSeconds > 0);
  const acknowledged = Boolean(progress?.acknowledged);

  useEffect(() => {
    const textScreenId = screen?.id;
    if (!textScreenId || !deviceLeaseId) {
      screenIdRef.current = null;
      return;
    }
    const activeTextScreenId: string = textScreenId;

    let cancelled = false;

    async function begin() {
      try {
        const result = await liveApi({
          action: "text_screen_begin",
          textScreenId: activeTextScreenId,
          deviceLeaseId,
        });
        if (!cancelled) {
          screenIdRef.current = activeTextScreenId;
          setProgress(result.progress ?? null);
          setError(null);
        }
      } catch (beginError) {
        if (!cancelled) setError(beginError instanceof Error ? beginError.message : "Unable to begin instructional text timing.");
      }
    }

    void begin();

    const heartbeat = window.setInterval(() => {
      if (cancelled || document.visibilityState !== "visible" || screenIdRef.current !== activeTextScreenId) return;
      void liveApi({
        action: "text_screen_heartbeat",
        textScreenId: activeTextScreenId,
        deviceLeaseId,
      }).then((result) => {
        if (!cancelled) {
          setProgress(result.progress ?? null);
          setError(null);
        }
      }).catch((heartbeatError) => {
        if (!cancelled) setError(heartbeatError instanceof Error ? heartbeatError.message : "Instructional text timing heartbeat failed.");
      });
    }, 15_000);

    const visibility = () => {
      if (document.visibilityState !== "visible" || cancelled) return;
      void begin();
    };
    document.addEventListener("visibilitychange", visibility);

    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [deviceLeaseId, screen?.id]);

  async function acknowledge() {
    if (!screen?.id || !requirementMet || acknowledged) return;
    setBusy(true);
    try {
      await liveApi({ action: "text_screen_acknowledge", textScreenId: screen.id });
      setProgress((current) => ({ ...(current ?? {}), requirementMet: true, acknowledged: true }));
      setError(null);
    } catch (acknowledgeError) {
      setError(acknowledgeError instanceof Error ? acknowledgeError.message : "Instructional text acknowledgment failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!screen?.id) return null;

  return (
    <section className="fdacs-live__panel fdacs-live__text-screen" aria-live="polite">
      <div className="fdacs-live__panel-head">
        <h2>{screen.title || "Instructor text screen"}</h2>
        <span>{acknowledged ? "acknowledged" : requirementMet ? "time met" : "timing"}</span>
      </div>
      <div className="fdacs-live__text-screen-body">{screen.body}</div>
      <div className="fdacs-live__timecards">
        <article><span>Words</span><strong>{screen.word_count ?? "-"}</strong></article>
        <article><span>Minimum display</span><strong>{formatSeconds(requiredSeconds)}</strong></article>
        <article><span>Server observed</span><strong>{formatSeconds(observedSeconds)}</strong></article>
        <article><span>Remaining</span><strong>{formatSeconds(remainingSeconds)}</strong></article>
      </div>
      <p className="fdacs-live__fineprint">
        Timing is recorded by the regulated server while this browser tab is visible and your authenticated device lease remains active. Returning to this tab re-establishes the timing heartbeat without crediting hidden-tab time.
      </p>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      <button type="button" onClick={() => void acknowledge()} disabled={!requirementMet || acknowledged || busy}>
        {acknowledged ? "Instructional text acknowledged" : busy ? "Recording acknowledgment..." : requirementMet ? "Acknowledge instructional text" : `Available after ${formatSeconds(remainingSeconds)}`}
      </button>
    </section>
  );
}
