"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Interaction = {
  id?: string;
  actor_role?: string;
  interaction_type?: string;
  content?: string | null;
  created_at?: string;
};

type TimeSummary = {
  connectedSeconds?: number;
  instructionalPresenceSeconds?: number;
  breakPresenceSeconds?: number;
  uncreditedConnectedSeconds?: number;
  unresolvedChallengeAbsences?: number;
};

type MediaAccess = {
  provider?: "daily";
  roomName?: string;
  joinUrl?: string;
  tokenExpiresAt?: string;
  recordingEnabled?: boolean;
};

type LiveState = {
  session?: {
    id?: string;
    day?: number;
    lesson_id?: string;
    status?: string;
    current_segment_type?: "instruction" | "break";
  };
  time?: {
    connected_seconds?: number;
    instructional_presence_seconds?: number;
    break_presence_seconds?: number;
    uncredited_connected_seconds?: number;
    presence_state?: string;
  } | null;
  dayTime?: TimeSummary | null;
  courseTime?: TimeSummary | null;
  pendingChallenge?: {
    id?: string;
    prompt?: string;
    status?: string;
    attempt_count?: number;
    retry_expires_at?: string | null;
  } | null;
  interactions?: Interaction[];
};

function seconds(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function api(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Live classroom request failed.");
  return payload;
}

export default function LiveClassroom({ liveSessionId }: { liveSessionId: string }) {
  const [deviceLeaseId, setDeviceLeaseId] = useState<string | null>(null);
  const [state, setState] = useState<LiveState | null>(null);
  const [media, setMedia] = useState<MediaAccess | null>(null);
  const [question, setQuestion] = useState("");
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Connecting to regulated live classroom…");
  const joining = useRef(false);

  const browserInstanceId = useMemo(() => {
    if (typeof window === "undefined") return "server-placeholder-instance";
    const key = "obserra-fdacs-browser-instance";
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/live?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load live classroom state.");
    setState(payload as LiveState);
  }, [liveSessionId]);

  const loadMedia = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/media?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Secure live video is unavailable.");
    const access = payload as MediaAccess;
    if (!access.joinUrl) throw new Error("Secure live video did not return a join URL.");
    setMedia(access);
  }, [liveSessionId]);

  useEffect(() => {
    let cancelled = false;
    async function join() {
      if (joining.current) return;
      joining.current = true;
      try {
        const result = await api({ action: "join", liveSessionId, browserInstanceId });
        if (cancelled) return;
        setDeviceLeaseId(typeof result.deviceLeaseId === "string" ? result.deviceLeaseId : null);
        setStatusText("Connected. Attendance, instructional time, and secure live media are active.");
        await refresh();
      } catch (joinError) {
        if (!cancelled) {
          setError(joinError instanceof Error ? joinError.message : "Unable to join live class.");
          setStatusText("Live classroom access is locked.");
        }
      }
    }
    void join();
    return () => {
      cancelled = true;
    };
  }, [browserInstanceId, liveSessionId, refresh]);

  useEffect(() => {
    if (!deviceLeaseId) return;
    const timer = window.setTimeout(() => {
      void loadMedia().catch((mediaError) => setError(mediaError instanceof Error ? mediaError.message : "Secure live video failed to load."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [deviceLeaseId, loadMedia]);

  useEffect(() => {
    if (!deviceLeaseId) return;
    let cancelled = false;
    const sendHeartbeat = async () => {
      try {
        await api({ action: "heartbeat", deviceLeaseId });
        if (!cancelled) await refresh();
      } catch (heartbeatError) {
        if (!cancelled) setError(heartbeatError instanceof Error ? heartbeatError.message : "Presence heartbeat failed.");
      }
    };
    void sendHeartbeat();
    const heartbeat = window.setInterval(() => void sendHeartbeat(), 60_000);
    const stateRefresh = window.setInterval(() => void refresh().catch(() => undefined), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      window.clearInterval(stateRefresh);
    };
  }, [deviceLeaseId, refresh]);

  useEffect(() => {
    if (!deviceLeaseId) return;
    const leave = () => {
      navigator.sendBeacon?.(
        "/api/florida-class-d/live",
        new Blob([JSON.stringify({ action: "leave", deviceLeaseId })], { type: "application/json" }),
      );
    };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, [deviceLeaseId]);

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    try {
      await api({ action: "question", liveSessionId, content: question.trim() });
      setQuestion("");
      await refresh();
    } catch (questionError) {
      setError(questionError instanceof Error ? questionError.message : "Question could not be submitted.");
    }
  }

  async function raiseHand() {
    try {
      await api({ action: "hand_raise", liveSessionId, content: "Student raised hand" });
      await refresh();
    } catch (handError) {
      setError(handError instanceof Error ? handError.message : "Hand raise failed.");
    }
  }

  async function submitChallenge(event: FormEvent) {
    event.preventDefault();
    const challengeId = state?.pendingChallenge?.id;
    if (!challengeId || !challengeAnswer.trim()) return;
    try {
      await api({ action: "challenge", challengeId, answer: challengeAnswer.trim() });
      setChallengeAnswer("");
      await refresh();
    } catch (challengeError) {
      setError(challengeError instanceof Error ? challengeError.message : "Presence challenge failed.");
    }
  }

  const time = state?.time;
  const dayTime = state?.dayTime;
  const courseTime = state?.courseTime;
  const session = state?.session;
  const isBreak = session?.current_segment_type === "break";

  return (
    <main className="fdacs-live">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Live Classroom</h1>
        </div>
        <div className={`fdacs-live__status ${isBreak ? "is-break" : ""}`}>
          <strong>{isBreak ? "15 MINUTE BREAK" : "LIVE INSTRUCTION"}</strong>
          <small>{statusText}</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      <section className="fdacs-live__grid">
        <div className="fdacs-live__stage">
          <div className="fdacs-live__stage-frame fdacs-live__media-frame">
            {media?.joinUrl ? (
              <iframe
                title="Obserra Florida Class D secure live video classroom"
                src={media.joinUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="fdacs-live__media-waiting">
                <span>SECURE LIVE INSTRUCTOR MEDIA</span>
                <h2>{session?.lesson_id ?? "Scheduled lesson"}</h2>
                <p>The encrypted classroom video surface opens only after authenticated enrollment, single-device attendance control, and the live-media gate succeed.</p>
              </div>
            )}
          </div>
          <p className="fdacs-live__fineprint">Video and audio are delivered through a short-lived, room-bound secure media token. Obserra attendance and instructional-time evidence remain independent from the media provider. Recording is disabled by default.</p>

          <h3 className="fdacs-live__time-title">Current live lesson</h3>
          <div className="fdacs-live__timecards">
            <article><span>Total connected</span><strong>{formatDuration(seconds(time?.connected_seconds))}</strong></article>
            <article><span>Instruction present</span><strong>{formatDuration(seconds(time?.instructional_presence_seconds))}</strong></article>
            <article><span>Break time</span><strong>{formatDuration(seconds(time?.break_presence_seconds))}</strong></article>
            <article><span>Uncredited connected</span><strong>{formatDuration(seconds(time?.uncredited_connected_seconds))}</strong></article>
          </div>

          <h3 className="fdacs-live__time-title">Day {session?.day ?? "–"} cumulative time</h3>
          <div className="fdacs-live__timecards">
            <article><span>Day connected</span><strong>{formatDuration(seconds(dayTime?.connectedSeconds))}</strong></article>
            <article><span>Day instruction</span><strong>{formatDuration(seconds(dayTime?.instructionalPresenceSeconds))}</strong></article>
            <article><span>Day breaks</span><strong>{formatDuration(seconds(dayTime?.breakPresenceSeconds))}</strong></article>
            <article><span>Day uncredited</span><strong>{formatDuration(seconds(dayTime?.uncreditedConnectedSeconds))}</strong></article>
          </div>

          <h3 className="fdacs-live__time-title">Entire 40-hour course ledger</h3>
          <div className="fdacs-live__timecards">
            <article><span>Course connected</span><strong>{formatDuration(seconds(courseTime?.connectedSeconds))}</strong></article>
            <article><span>Course instruction</span><strong>{formatDuration(seconds(courseTime?.instructionalPresenceSeconds))}</strong></article>
            <article><span>Course breaks</span><strong>{formatDuration(seconds(courseTime?.breakPresenceSeconds))}</strong></article>
            <article><span>Course uncredited</span><strong>{formatDuration(seconds(courseTime?.uncreditedConnectedSeconds))}</strong></article>
          </div>
          <p className="fdacs-live__fineprint">Every tracked second remains associated with the authenticated student enrollment. Breaks are tracked in the LMS but are not credited toward the required 40 instructional hours. Final daily attendance credit remains subject to instructor verification.</p>
        </div>

        <aside className="fdacs-live__side">
          <section className="fdacs-live__panel">
            <div className="fdacs-live__panel-head"><h2>Presence check</h2><span>{time?.presence_state ?? "waiting"}</span></div>
            {state?.pendingChallenge ? (
              <form onSubmit={submitChallenge} className="fdacs-live__form">
                <p>{state.pendingChallenge.prompt}</p>
                <input value={challengeAnswer} onChange={(event) => setChallengeAnswer(event.target.value)} placeholder="Your answer" autoComplete="off" />
                <button type="submit">Submit check-in</button>
                <small>A failed challenge receives one retry opportunity within five minutes before the LMS marks the student absent for review.</small>
              </form>
            ) : <p className="fdacs-live__muted">No check-in is pending. Stay connected and follow the live instructor.</p>}
          </section>

          <section className="fdacs-live__panel">
            <div className="fdacs-live__panel-head"><h2>Live Q&amp;A</h2><button type="button" onClick={() => void raiseHand()}>Raise hand</button></div>
            <div className="fdacs-live__feed">
              {(state?.interactions ?? []).map((interaction, index) => (
                <div key={interaction.id ?? `${interaction.created_at}-${index}`}>
                  <b>{interaction.actor_role === "instructor" ? "Instructor" : "Student"}</b>
                  <span>{interaction.content || interaction.interaction_type}</span>
                </div>
              ))}
              {!state?.interactions?.length ? <p className="fdacs-live__muted">Questions and instructor responses will appear here.</p> : null}
            </div>
            <form onSubmit={submitQuestion} className="fdacs-live__form fdacs-live__question">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask the instructor a question" maxLength={4000} />
              <button type="submit">Ask question</button>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}
