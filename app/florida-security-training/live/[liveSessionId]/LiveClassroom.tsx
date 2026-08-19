"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import InstructionalTextScreen from "./InstructionalTextScreen";

const STATE_REFRESH_INTERVAL_MS = 15_000;
const HEARTBEAT_INTERVAL_MS = 60_000;
const STATE_STALE_AFTER_MS = 35_000;
const HEARTBEAT_MINIMUM_PHASE_MS = 5_000;
const HEARTBEAT_PHASE_WINDOW_MS = 55_000;
const STATE_REFRESH_MINIMUM_PHASE_MS = 1_000;
const STATE_REFRESH_PHASE_WINDOW_MS = 14_000;

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

type ActivePoll = {
  id?: string;
  question?: string;
  options?: string[];
  status?: "open" | "closed";
  opened_at?: string;
};

type ActivePollResponse = {
  pollId?: string;
  selectedOptionIndex?: number;
  submittedAt?: string | null;
};

type ActiveTextScreen = {
  id?: string;
  title?: string;
  body?: string;
  word_count?: number;
  minimum_seconds?: number;
  opened_at?: string;
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
  activePoll?: ActivePoll | null;
  activePollResponse?: ActivePollResponse | null;
  activeTextScreen?: ActiveTextScreen | null;
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

function deterministicPhaseOffset(seed: string, minimumMs: number, windowMs: number) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const safeMinimum = Math.max(0, Math.floor(minimumMs));
  const safeWindow = Math.max(safeMinimum + 1, Math.floor(windowMs));
  return safeMinimum + ((hash >>> 0) % (safeWindow - safeMinimum));
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
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaStale, setMediaStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [lastSuccessfulRefreshAt, setLastSuccessfulRefreshAt] = useState<number | null>(null);
  const [freshnessNow, setFreshnessNow] = useState(() => Date.now());
  const [statusText, setStatusText] = useState("Connecting to regulated live classroom…");
  const joining = useRef(false);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const announcedChallengeIds = useRef(new Set<string>());
  const announcedPollIds = useRef(new Set<string>());

  const browserInstanceId = useMemo(() => {
    if (typeof window === "undefined") return "ssr-browser-instance-unavailable";
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
    setLastSuccessfulRefreshAt(Date.now());
  }, [liveSessionId]);

  const loadMedia = useCallback(async () => {
    setMediaBusy(true);
    try {
      const response = await fetch(`/api/florida-class-d/media?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Secure live video is unavailable.");
      const access = payload as MediaAccess;
      if (!access.joinUrl || !access.tokenExpiresAt) throw new Error("Secure live video did not return complete time-bounded access.");
      setMedia(access);
      setMediaStale(false);
    } catch (mediaError) {
      setMediaStale(true);
      setMedia(null);
      throw mediaError;
    } finally {
      setMediaBusy(false);
    }
  }, [liveSessionId]);

  const joinClassroom = useCallback(async () => {
    if (joining.current) return;
    joining.current = true;
    setJoinBusy(true);
    setStatusText("Connecting to regulated live classroom…");
    try {
      const result = await api({ action: "join", liveSessionId, browserInstanceId });
      const leaseId = typeof result.deviceLeaseId === "string" ? result.deviceLeaseId : null;
      if (!leaseId) throw new Error("The live classroom did not return a single-device attendance lease.");
      setDeviceLeaseId(leaseId);
      setStatusText("Connected. Attendance, instructional time, and secure live media are active.");
      await refresh();
    } catch (joinError) {
      setDeviceLeaseId(null);
      setError(joinError instanceof Error ? joinError.message : "Unable to join live class.");
      setStatusText("Live classroom access is locked. Review the message and retry.");
    } finally {
      joining.current = false;
      setJoinBusy(false);
    }
  }, [browserInstanceId, liveSessionId, refresh]);

  useEffect(() => {
    const timer = window.setTimeout(() => void joinClassroom(), 0);
    return () => window.clearTimeout(timer);
  }, [joinClassroom]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (announcement) announcementRef.current?.focus();
  }, [announcement]);

  useEffect(() => {
    const timer = window.setInterval(() => setFreshnessNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!deviceLeaseId) return;
    const timer = window.setTimeout(() => {
      void loadMedia().catch((mediaError) => setError(mediaError instanceof Error ? mediaError.message : "Secure live video failed to load."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [deviceLeaseId, loadMedia]);

  useEffect(() => {
    if (!media?.tokenExpiresAt) return;
    const refreshExpiringMedia = () => {
      const expiresAt = Date.parse(media.tokenExpiresAt ?? "");
      if (!Number.isFinite(expiresAt) || expiresAt - Date.now() > 10 * 60_000) return;
      void loadMedia().catch((mediaError) => setError(mediaError instanceof Error ? mediaError.message : "Secure live video access could not be renewed."));
    };
    const timer = window.setInterval(refreshExpiringMedia, 60_000);
    return () => window.clearInterval(timer);
  }, [loadMedia, media?.tokenExpiresAt]);

  useEffect(() => {
    if (!deviceLeaseId) return;
    let cancelled = false;
    let heartbeatInterval: number | null = null;
    let stateRefreshInterval: number | null = null;

    const sendHeartbeat = async () => {
      try {
        await api({ action: "heartbeat", deviceLeaseId });
        if (!cancelled) {
          setStatusText("Connected. Attendance, instructional time, and secure live media are active.");
        }
      } catch (heartbeatError) {
        if (!cancelled) setError(heartbeatError instanceof Error ? heartbeatError.message : "Presence heartbeat failed.");
      }
    };

    const heartbeatPhaseDelay = deterministicPhaseOffset(
      `${browserInstanceId}:${deviceLeaseId}:heartbeat`,
      HEARTBEAT_MINIMUM_PHASE_MS,
      HEARTBEAT_PHASE_WINDOW_MS,
    );
    const stateRefreshPhaseDelay = deterministicPhaseOffset(
      `${browserInstanceId}:${deviceLeaseId}:state`,
      STATE_REFRESH_MINIMUM_PHASE_MS,
      STATE_REFRESH_PHASE_WINDOW_MS,
    );

    const heartbeatPhase = window.setTimeout(() => {
      if (cancelled) return;
      void sendHeartbeat();
      heartbeatInterval = window.setInterval(() => void sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
    }, heartbeatPhaseDelay);

    const stateRefreshPhase = window.setTimeout(() => {
      if (cancelled) return;
      void refresh().catch((refreshError) => {
        setError((current) => current ?? (refreshError instanceof Error ? refreshError.message : "Live state is stale because classroom status could not be refreshed."));
      });
      stateRefreshInterval = window.setInterval(() => void refresh().catch((refreshError) => {
        setError((current) => current ?? (refreshError instanceof Error ? refreshError.message : "Live state is stale because classroom status could not be refreshed."));
      }), STATE_REFRESH_INTERVAL_MS);
    }, stateRefreshPhaseDelay);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void sendHeartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(heartbeatPhase);
      window.clearTimeout(stateRefreshPhase);
      if (heartbeatInterval !== null) window.clearInterval(heartbeatInterval);
      if (stateRefreshInterval !== null) window.clearInterval(stateRefreshInterval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [browserInstanceId, deviceLeaseId, refresh]);

  useEffect(() => {
    const messages: string[] = [];
    const challengeId = state?.pendingChallenge?.id;
    if (challengeId && !announcedChallengeIds.current.has(challengeId)) {
      announcedChallengeIds.current.add(challengeId);
      messages.push("A new required presence check is available. Complete it now to protect your attendance record.");
    }
    const pollId = state?.activePoll?.id;
    if (pollId && !announcedPollIds.current.has(pollId)) {
      announcedPollIds.current.add(pollId);
      messages.push("A new live knowledge poll is available.");
    }
    if (messages.length) setAnnouncement(messages.join(" "));
  }, [state?.activePoll?.id, state?.pendingChallenge?.id]);

  useEffect(() => {
    const activePollId = state?.activePoll?.id;
    const response = state?.activePollResponse;
    if (!activePollId) {
      setSelectedPollOption(null);
      return;
    }
    if (response?.pollId === activePollId && typeof response.selectedOptionIndex === "number") {
      setSelectedPollOption(response.selectedOptionIndex);
    } else {
      setSelectedPollOption(null);
    }
  }, [state?.activePoll?.id, state?.activePollResponse]);

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

  const stateStale = Boolean(deviceLeaseId && (!lastSuccessfulRefreshAt || freshnessNow - lastSuccessfulRefreshAt > STATE_STALE_AFTER_MS));

  function requireFreshState() {
    if (!stateStale) return true;
    setError("Live state is stale. Refresh the regulated classroom state before taking this action.");
    return false;
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || !requireFreshState()) return;
    try {
      await api({ action: "question", liveSessionId, content: question.trim() });
      setQuestion("");
      await refresh();
    } catch (questionError) {
      setError(questionError instanceof Error ? questionError.message : "Question could not be submitted.");
    }
  }

  async function raiseHand() {
    if (!requireFreshState()) return;
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
    if (!challengeId || !challengeAnswer.trim() || !requireFreshState()) return;
    try {
      await api({ action: "challenge", challengeId, answer: challengeAnswer.trim() });
      setChallengeAnswer("");
      await refresh();
    } catch (challengeError) {
      setError(challengeError instanceof Error ? challengeError.message : "Presence challenge failed.");
    }
  }

  async function submitPoll(event: FormEvent) {
    event.preventDefault();
    const poll = state?.activePoll;
    if (!poll?.id || selectedPollOption === null || state?.activePollResponse?.pollId === poll.id || !requireFreshState()) return;
    const openedAt = poll.opened_at ? Date.parse(poll.opened_at) : Number.NaN;
    const responseMilliseconds = Number.isFinite(openedAt)
      ? Math.max(0, Math.min(7_200_000, Date.now() - openedAt))
      : null;
    setPollSubmitting(true);
    try {
      await api({
        action: "poll_response",
        pollId: poll.id,
        selectedOptionIndex: selectedPollOption,
        responseMilliseconds,
      });
      await refresh();
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Live poll response could not be recorded.");
    } finally {
      setPollSubmitting(false);
    }
  }

  const time = state?.time;
  const dayTime = state?.dayTime;
  const courseTime = state?.courseTime;
  const session = state?.session;
  const activePoll = state?.activePoll;
  const activePollAnswered = Boolean(activePoll?.id && state?.activePollResponse?.pollId === activePoll.id);
  const isBreak = session?.current_segment_type === "break";

  return (
    <main className="fdacs-live">
      <a className="fdacs-live__skip" href="#live-classroom-workspace">Skip to classroom workspace</a>
      <header className="fdacs-live__topbar">
        <div className="fdacs-live__brandline">
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Live Classroom</h1>
          <small>Controlled learner workspace · server-recorded attendance</small>
        </div>
        <div className={`fdacs-live__status ${isBreak ? "is-break" : ""}`} role="status" aria-live="polite">
          <strong>{isBreak ? "15 MINUTE BREAK" : "LIVE INSTRUCTION"}</strong>
          <small>{stateStale ? "Live state is stale. Regulated actions are locked pending refresh." : statusText}</small>
        </div>
      </header>

      {announcement ? <div ref={announcementRef} className="fdacs-live__announcement" role="alert" tabIndex={-1}><span>{announcement}</span><button type="button" onClick={() => setAnnouncement(null)}>Dismiss announcement</button></div> : null}
      {error ? <div ref={errorRef} className="fdacs-live__alert" role="alert" tabIndex={-1}><strong>Classroom attention required</strong><span>{error}</span><button type="button" onClick={() => setError(null)}>Acknowledge</button></div> : null}
      {stateStale ? <div className="fdacs-live__recovery is-stale" role="alert"><span><strong>Live state is stale</strong>Polls, presence responses, hand raises, and questions are locked until authoritative state is restored.</span><button type="button" onClick={() => void refresh().catch((refreshError) => setError(refreshError instanceof Error ? refreshError.message : "Live state is stale and could not be refreshed."))}>Refresh classroom state</button></div> : null}
      {!deviceLeaseId ? (
        <div className="fdacs-live__recovery" role="status" aria-live="polite">
          <span><strong>Secure entry checkpoint</strong>Instruction, attendance, and course credit remain locked until the single-device lease succeeds.</span>
          <button type="button" disabled={joinBusy} onClick={() => void joinClassroom()}>{joinBusy ? "Connecting…" : "Retry secure classroom entry"}</button>
        </div>
      ) : null}

      <section className="fdacs-live__grid" id="live-classroom-workspace" aria-busy={joinBusy || mediaBusy}>
        <div className="fdacs-live__stage">
          <div className="fdacs-live__stage-frame fdacs-live__media-frame">
            {media?.joinUrl ? (
              <iframe
                title="OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC Florida Class D secure live video classroom"
                src={media.joinUrl}
                allow="camera; microphone; fullscreen; autoplay"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="fdacs-live__media-waiting">
                <span>SECURE LIVE INSTRUCTOR MEDIA</span>
                <h2>{session?.lesson_id ?? "Scheduled lesson"}</h2>
                <p>The encrypted classroom video surface opens only after authenticated enrollment, single-device attendance control, and the live-media gate succeed.</p>
                {deviceLeaseId ? <button type="button" disabled={mediaBusy} onClick={() => void loadMedia().catch((mediaError) => setError(mediaError instanceof Error ? mediaError.message : "Secure live video failed to load."))}>{mediaBusy ? "Connecting video…" : "Reconnect secure video"}</button> : null}
              </div>
            )}
          </div>
          <p className="fdacs-live__fineprint">Video and audio are delivered through a short-lived, room-bound secure media token. OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC attendance and instructional-time evidence remain independent from the media provider. Recording is disabled by default.</p>
          {deviceLeaseId ? <div className="fdacs-live__media-recovery"><span>{mediaStale ? "Secure media access is stale or unavailable." : "Secure media token is current and time bounded."}</span><button type="button" disabled={mediaBusy} onClick={() => void loadMedia().catch((mediaError) => setError(mediaError instanceof Error ? mediaError.message : "Secure live video access could not be renewed."))}>{mediaBusy ? "Renewing video…" : "Renew secure video"}</button></div> : null}

          <InstructionalTextScreen screen={state?.activeTextScreen} deviceLeaseId={deviceLeaseId} />

          <h3 className="fdacs-live__time-title"><span>Time ledger</span>Current live lesson</h3>
          <div className="fdacs-live__timecards">
            <article><span>Total connected</span><strong>{formatDuration(seconds(time?.connected_seconds))}</strong></article>
            <article><span>Instruction present</span><strong>{formatDuration(seconds(time?.instructional_presence_seconds))}</strong></article>
            <article><span>Break time</span><strong>{formatDuration(seconds(time?.break_presence_seconds))}</strong></article>
            <article><span>Uncredited connected</span><strong>{formatDuration(seconds(time?.uncredited_connected_seconds))}</strong></article>
          </div>

          <h3 className="fdacs-live__time-title"><span>Daily record</span>Day {session?.day ?? "–"} cumulative time</h3>
          <div className="fdacs-live__timecards">
            <article><span>Day connected</span><strong>{formatDuration(seconds(dayTime?.connectedSeconds))}</strong></article>
            <article><span>Day instruction</span><strong>{formatDuration(seconds(dayTime?.instructionalPresenceSeconds))}</strong></article>
            <article><span>Day breaks</span><strong>{formatDuration(seconds(dayTime?.breakPresenceSeconds))}</strong></article>
            <article><span>Day uncredited</span><strong>{formatDuration(seconds(dayTime?.uncreditedConnectedSeconds))}</strong></article>
          </div>

          <h3 className="fdacs-live__time-title"><span>Course record</span>Entire 40-hour course ledger</h3>
          <div className="fdacs-live__timecards">
            <article><span>Course connected</span><strong>{formatDuration(seconds(courseTime?.connectedSeconds))}</strong></article>
            <article><span>Course instruction</span><strong>{formatDuration(seconds(courseTime?.instructionalPresenceSeconds))}</strong></article>
            <article><span>Course breaks</span><strong>{formatDuration(seconds(courseTime?.breakPresenceSeconds))}</strong></article>
            <article><span>Course uncredited</span><strong>{formatDuration(seconds(courseTime?.uncreditedConnectedSeconds))}</strong></article>
          </div>
          <p className="fdacs-live__fineprint">Every tracked second remains associated with the authenticated student enrollment. Breaks are tracked in the LMS but are not credited toward the required 40 instructional hours. Final daily attendance credit remains subject to instructor verification.</p>
        </div>

        <aside className="fdacs-live__side">
          <section className="fdacs-live__panel fdacs-live__presence-panel">
            <div className="fdacs-live__panel-head"><h2>Presence check</h2><span>{time?.presence_state ?? "waiting"}</span></div>
            {state?.pendingChallenge ? (
              <form onSubmit={submitChallenge} className="fdacs-live__form">
                <p>{state.pendingChallenge.prompt}</p>
                <input aria-label="Presence check answer" value={challengeAnswer} onChange={(event) => setChallengeAnswer(event.target.value)} placeholder="Your answer" autoComplete="off" disabled={stateStale} />
                <button type="submit" disabled={stateStale || !challengeAnswer.trim()}>Submit check-in</button>
                <small>A failed challenge receives one retry opportunity within five minutes before the LMS marks the student absent for review.</small>
              </form>
            ) : <p className="fdacs-live__muted">No check-in is pending. Stay connected and follow the live instructor.</p>}
          </section>

          <section className={`fdacs-live__panel fdacs-live__poll ${activePoll ? "is-open" : ""}`}>
            <div className="fdacs-live__panel-head"><h2>Live knowledge poll</h2><span>{activePoll ? (activePollAnswered ? "recorded" : "respond now") : "waiting"}</span></div>
            {activePoll ? (
              <form className="fdacs-live__poll-form" onSubmit={submitPoll}>
                <p className="fdacs-live__poll-question">{activePoll.question}</p>
                <fieldset disabled={activePollAnswered || pollSubmitting || stateStale}>
                  {(activePoll.options ?? []).map((option, index) => (
                    <label key={`${activePoll.id}-${index}`} className={selectedPollOption === index ? "is-selected" : ""}>
                      <input
                        type="radio"
                        name={`poll-${activePoll.id}`}
                        checked={selectedPollOption === index}
                        onChange={() => setSelectedPollOption(index)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
                {activePollAnswered ? (
                  <div className="fdacs-live__poll-recorded">Response recorded in your regulated participation record.</div>
                ) : (
                  <button type="submit" disabled={selectedPollOption === null || pollSubmitting || stateStale}>{pollSubmitting ? "Recording…" : "Submit response"}</button>
                )}
                <small>Your selection and response time are retained as participation evidence. Correct-answer data is not exposed through the student live-class API.</small>
              </form>
            ) : <p className="fdacs-live__muted">No structured poll is open. Your instructor may launch questions during live instruction.</p>}
          </section>

          <section className="fdacs-live__panel fdacs-live__qa-panel">
            <div className="fdacs-live__panel-head"><h2>Live Q&amp;A</h2><button type="button" disabled={stateStale} onClick={() => void raiseHand()}>Raise hand</button></div>
            <div className="fdacs-live__feed" aria-live="polite" aria-relevant="additions text">
              {(state?.interactions ?? []).map((interaction, index) => (
                <div key={interaction.id ?? `${interaction.created_at}-${index}`}>
                  <b>{interaction.actor_role === "instructor" ? "Instructor" : "Student"}</b>
                  <span>{interaction.content || interaction.interaction_type}</span>
                </div>
              ))}
              {!state?.interactions?.length ? <p className="fdacs-live__muted">Questions and instructor responses will appear here.</p> : null}
            </div>
            <form onSubmit={submitQuestion} className="fdacs-live__form fdacs-live__question">
              <textarea aria-label="Question for the live instructor" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask the instructor a question" maxLength={4000} disabled={stateStale} />
              <div className="fdacs-live__form-actions"><small>{question.length} / 4000</small><button type="submit" disabled={stateStale || !question.trim()}>Ask question</button></div>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}
