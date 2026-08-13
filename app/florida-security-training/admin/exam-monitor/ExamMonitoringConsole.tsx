"use client";

import { useCallback, useEffect, useState } from "react";

type Attempt = {
  attemptId: string;
  enrollmentId: string;
  learnerReference: string;
  monitoringStatus: string;
  startedAt: string;
  lastHeartbeatAt?: string | null;
  interruptedAt?: string | null;
  interruptionReason?: string | null;
  questionNumber: number;
  heartbeatStale: boolean;
};

async function request(body?: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/exam-monitor", body ? {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  } : { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Exam monitoring request failed.");
  return payload as { attempts?: Attempt[] };
}

export default function ExamMonitoringConsole() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reasonByAttempt, setReasonByAttempt] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const payload = await request();
    setAttempts(payload.attempts ?? []);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh().catch((e) => setError(e instanceof Error ? e.message : "Unable to load active examinations.")), 0);
    const timer = window.setInterval(() => void refresh().catch(() => undefined), 15_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [refresh]);

  async function act(attemptId: string, action: "authorize_resume" | "invalidate") {
    const reason = reasonByAttempt[attemptId]?.trim() ?? "";
    if (reason.length < 3) {
      setError("Enter a documented reason before taking an administrative exam action.");
      return;
    }
    if (action === "invalidate" && !window.confirm("Invalidate this examination attempt? This action is auditable and cannot be used to score the attempt.")) return;
    setError(null);
    try {
      await request({ action, attemptId, reason });
      setReasonByAttempt((current) => ({ ...current, [attemptId]: "" }));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Exam monitoring action failed.");
    }
  }

  return (
    <main className="fdacs-live fdacs-exam-monitor">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Class D Examination Monitor</h1></div>
        <div className="fdacs-live__status"><strong>STAFF CONTROLLED</strong><small>Active attempts · interruption review · controlled resume · invalidation</small></div>
      </header>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      <section className="fdacs-live__panel">
        <div className="fdacs-live__section-heading"><div><span className="fdacs-live__eyebrow">ACTIVE FINAL EXAMINATIONS</span><h2>{attempts.length} monitored attempt{attempts.length === 1 ? "" : "s"}</h2></div><button type="button" onClick={() => void refresh()}>Refresh</button></div>
        {attempts.length === 0 ? <p>No active examination attempts are currently visible to this staff account.</p> : null}
        <div className="fdacs-exam-monitor__list">
          {attempts.map((attempt) => (
            <article key={attempt.attemptId} className="fdacs-live__panel">
              <div className="fdacs-live__section-heading">
                <div><small>Attempt {attempt.attemptId.slice(0, 8)}</small><h3>Question {attempt.questionNumber} / 170</h3></div>
                <strong>{attempt.heartbeatStale ? "HEARTBEAT STALE" : attempt.monitoringStatus.replaceAll("_", " ").toUpperCase()}</strong>
              </div>
              <p><b>Learner reference:</b> {attempt.learnerReference}</p>
              <p><b>Started:</b> {new Date(attempt.startedAt).toLocaleString()}</p>
              <p><b>Last heartbeat:</b> {attempt.lastHeartbeatAt ? new Date(attempt.lastHeartbeatAt).toLocaleString() : "None recorded"}</p>
              {attempt.interruptedAt ? <p><b>Interrupted:</b> {new Date(attempt.interruptedAt).toLocaleString()} · {attempt.interruptionReason ?? "Reason pending"}</p> : null}
              <textarea
                value={reasonByAttempt[attempt.attemptId] ?? ""}
                onChange={(event) => setReasonByAttempt((current) => ({ ...current, [attempt.attemptId]: event.target.value }))}
                placeholder="Document the reason for resume authorization or invalidation"
                maxLength={2000}
              />
              <div className="fdacs-exam__actions">
                <button type="button" disabled={attempt.monitoringStatus !== "interrupted"} onClick={() => void act(attempt.attemptId, "authorize_resume")}>Authorize controlled resume</button>
                <button type="button" onClick={() => void act(attempt.attemptId, "invalidate")}>Invalidate attempt</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
