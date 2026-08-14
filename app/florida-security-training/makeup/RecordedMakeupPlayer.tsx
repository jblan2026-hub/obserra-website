"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  assignmentId: string;
  assignedMinutes: number;
};

type StartResponse = {
  playback?: { id?: string; verified_watch_seconds?: number; playback_position_seconds?: number };
  mediaUrl?: string;
  requiredWatchSeconds?: number;
  error?: string;
};

type HeartbeatResponse = {
  result?: {
    status?: string;
    verifiedWatchSeconds?: number;
    requiredWatchSeconds?: number;
    challengeDueAt?: string;
    reason?: string;
  };
  error?: string;
};

function browserInstanceId() {
  const key = "obserra_fdacs_recorded_makeup_browser_instance";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}

async function post(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/recorded-makeup", {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Recorded make-up request failed.");
  return payload;
}

export default function RecordedMakeupPlayer({ assignmentId, assignedMinutes }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackSessionId, setPlaybackSessionId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [browserId] = useState<string | null>(() => typeof window === "undefined" ? null : browserInstanceId());
  const [verifiedSeconds, setVerifiedSeconds] = useState(0);
  const [requiredSeconds, setRequiredSeconds] = useState(assignedMinutes * 60);
  const [status, setStatus] = useState("Not started");
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<{ id: string; code?: string; expiresAt?: string } | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");

  useEffect(() => {
    if (!playbackSessionId || !browserId) return;
    const timer = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        const payload = await post({
          action: "heartbeat",
          playbackSessionId,
          browserInstanceId: browserId,
          observedPositionSeconds: Math.floor(video.currentTime),
          pageVisible: document.visibilityState === "visible",
        }) as HeartbeatResponse;
        const result = payload.result ?? {};
        if (typeof result.verifiedWatchSeconds === "number") setVerifiedSeconds(result.verifiedWatchSeconds);
        if (typeof result.requiredWatchSeconds === "number") setRequiredSeconds(result.requiredWatchSeconds);
        setStatus(result.status ?? "active");
        if (result.status === "challenge_required") {
          video.pause();
          const challengePayload = await post({ action: "issue_challenge", playbackSessionId });
          const issued = challengePayload.challenge as { challengeId?: string; code?: string; expiresAt?: string } | undefined;
          if (issued?.challengeId) setChallenge({ id: issued.challengeId, code: issued.code, expiresAt: issued.expiresAt });
        }
        if (result.reason === "position_anomaly") {
          video.pause();
          setError("Playback was paused because the server detected a timing or seek anomaly. Resume from the verified position.");
        }
      } catch (e) {
        video.pause();
        setError(e instanceof Error ? e.message : "Playback evidence could not be recorded.");
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [browserId, playbackSessionId]);

  async function start() {
    if (!browserId) return;
    setError(null);
    try {
      const payload = await post({ action: "start", assignmentId, browserInstanceId: browserId }) as StartResponse;
      const id = payload.playback?.id;
      if (!id || !payload.mediaUrl) throw new Error("Recorded playback session was not provisioned.");
      setPlaybackSessionId(id);
      setMediaUrl(payload.mediaUrl);
      setRequiredSeconds(Number(payload.requiredWatchSeconds ?? assignedMinutes * 60));
      setVerifiedSeconds(Number(payload.playback?.verified_watch_seconds ?? 0));
      setStatus("active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start recorded make-up training.");
    }
  }

  async function submitChallenge() {
    if (!challenge || !playbackSessionId) return;
    setError(null);
    try {
      const payload = await post({ action: "answer_challenge", playbackSessionId, challengeId: challenge.id, answer: challengeAnswer });
      if (payload.result?.passed) {
        setChallenge(null);
        setChallengeAnswer("");
        setStatus("active");
        await videoRef.current?.play();
      } else if (payload.result?.failed) {
        setError("Presence challenge failed. This playback session has been invalidated for instructor review.");
      } else {
        setError(`Incorrect response. ${payload.result?.attemptsRemaining ?? 0} attempt remains.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Challenge response failed.");
    }
  }

  async function complete() {
    if (!playbackSessionId) return;
    setError(null);
    try {
      await post({ action: "complete", playbackSessionId });
      setStatus("ready_for_review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recorded make-up completion could not be submitted.");
    }
  }

  const progress = requiredSeconds > 0 ? Math.min(100, Math.floor((verifiedSeconds / requiredSeconds) * 100)) : 0;

  return (
    <section className="fdacs-live__panel fdacs-makeup__recorded">
      <div className="fdacs-makeup__recorded-heading">
        <div>
          <span className="fdacs-live__eyebrow">CONTROLLED RECORDED MAKE-UP</span>
          <h3>{assignedMinutes} assigned minutes</h3>
        </div>
        <strong>{progress}% verified</strong>
      </div>
      <p>Only server-verified watch time counts. Forward seeking, hidden-tab time, accelerated playback, and time during an unresolved presence challenge are not credited.</p>
      {!playbackSessionId ? <button type="button" onClick={() => void start()}>Start recorded make-up</button> : null}
      {mediaUrl ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onRateChange={(event) => { event.currentTarget.playbackRate = 1; }}
          onSeeking={(event) => {
            const maxAllowed = Math.max(0, Math.floor(verifiedSeconds));
            if (event.currentTarget.currentTime > maxAllowed + 5) event.currentTarget.currentTime = maxAllowed;
          }}
        />
      ) : null}
      <div className="fdacs-makeup__metrics">
        <span>Verified: {Math.floor(verifiedSeconds / 60)} min</span>
        <span>Required: {Math.ceil(requiredSeconds / 60)} min</span>
        <span>Status: {status}</span>
      </div>
      {challenge ? (
        <div className="fdacs-live__alert">
          <strong>Presence verification required</strong>
          <p>Enter the displayed six-digit presence code before continuing.</p>
          {challenge.code ? <p className="fdacs-makeup__presence-code">{challenge.code}</p> : null}
          <input value={challengeAnswer} onChange={(e) => setChallengeAnswer(e.target.value)} inputMode="numeric" maxLength={6} aria-label="Presence verification code" />
          <button type="button" onClick={() => void submitChallenge()}>Verify presence</button>
        </div>
      ) : null}
      {verifiedSeconds >= requiredSeconds && status !== "ready_for_review" ? <button type="button" onClick={() => void complete()}>Submit evidence for instructor review</button> : null}
      {status === "ready_for_review" ? <p className="fdacs-live__success">Playback evidence is complete and queued for instructor review and certification.</p> : null}
      {error ? <p className="fdacs-live__alert">{error}</p> : null}
    </section>
  );
}
