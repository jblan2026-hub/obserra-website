"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Question = {
  id: string;
  number: number;
  subjectCode: string;
  questionType: "multiple_choice" | "true_false";
  prompt: string;
  choices: Record<string, string>;
  selectedChoiceKey?: string | null;
};

type Monitoring = {
  status?: string;
  lastHeartbeatAt?: string | null;
  interruptedAt?: string | null;
  interruptionReason?: string | null;
  actionBlocked?: boolean;
};

type Attempt = {
  id: string;
  status: string;
  monitoring?: Monitoring;
  startedAt: string;
  earliestSubmitAt: string;
  submittedAt?: string | null;
  score?: number | null;
  passed?: boolean | null;
  questionNumber?: number;
  totalQuestions?: number;
};

type State = {
  attempt?: Attempt | null;
  question?: Question | null;
  policy?: { totalQuestions?: number; passingScore?: number; minimumDurationSeconds?: number };
  error?: string;
};

function browserInstanceId() {
  const key = "obserra_fdacs_class_d_exam_browser_instance";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}

async function examRequest(body?: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/exam", body ? {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  } : { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Examination request failed.");
  return payload as State;
}

export default function FloridaClassDExam() {
  const [state, setState] = useState<State | null>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [monitoringLabel, setMonitoringLabel] = useState("Not started");
  const [busyAction, setBusyAction] = useState<"start" | "save" | "submit" | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const refresh = useCallback(async () => {
    const payload = await examRequest();
    setState(payload);
    setSelected(payload.question?.selectedChoiceKey ?? "");
    if (payload.attempt?.monitoring?.status) setMonitoringLabel(payload.attempt.monitoring.status);
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (state?.question?.id) questionHeadingRef.current?.focus();
  }, [state?.question?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh().catch((e) => setError(e instanceof Error ? e.message : "Unable to load examination.")), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const attempt = state?.attempt ?? null;
  const question = state?.question ?? null;
  const monitoringBlocked = attempt?.monitoring?.actionBlocked === true || (attempt?.monitoring?.status && attempt.monitoring.status !== "active");

  useEffect(() => {
    if (!attempt?.id || attempt.status !== "in_progress") return;
    let cancelled = false;
    const send = async () => {
      try {
        const response = await fetch("/api/florida-class-d/exam", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            action: "heartbeat",
            attemptId: attempt.id,
            browserInstanceId: browserInstanceId(),
            pageVisible: document.visibilityState === "visible",
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Exam monitoring heartbeat failed.");
        if (!cancelled) {
          setMonitoringLabel(typeof payload.monitoringStatus === "string" ? payload.monitoringStatus : "active");
          if (payload.monitoringStatus !== "active") await refresh();
        }
      } catch (e) {
        if (!cancelled) {
          setMonitoringLabel("review_required");
          setError(e instanceof Error ? e.message : "Exam monitoring requires review.");
          await refresh().catch(() => undefined);
        }
      }
    };
    void send();
    const timer = window.setInterval(() => void send(), 30_000);
    const onVisibility = () => void send();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [attempt?.id, attempt?.status, refresh]);

  const earliestSubmitMs = attempt?.earliestSubmitAt ? Date.parse(attempt.earliestSubmitAt) : 0;
  const remainingSeconds = Math.max(0, Math.ceil((earliestSubmitMs - now) / 1000));
  const elapsedLabel = useMemo(() => {
    if (!attempt?.startedAt) return "00:00:00";
    const seconds = Math.max(0, Math.floor((now - Date.parse(attempt.startedAt)) / 1000));
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  }, [attempt?.startedAt, now]);

  async function start() {
    if (busyAction) return;
    setBusyAction("start");
    setError(null);
    try {
      const payload = await examRequest({ action: "start", browserInstanceId: browserInstanceId() });
      setState(payload);
      setSelected(payload.question?.selectedChoiceKey ?? "");
      setMonitoringLabel(payload.attempt?.monitoring?.status ?? "active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start examination.");
    } finally {
      setBusyAction(null);
    }
  }

  async function save(direction: "next" | "previous" | "stay") {
    if (!attempt?.id || !question?.id || !selected || monitoringBlocked || busyAction) return;
    setBusyAction("save");
    setError(null);
    try {
      const payload = await examRequest({ action: "answer", attemptId: attempt.id, questionId: question.id, selectedChoiceKey: selected, direction });
      setState(payload);
      setSelected(payload.question?.selectedChoiceKey ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save answer.");
      await refresh().catch(() => undefined);
    } finally {
      setBusyAction(null);
    }
  }

  async function submit() {
    if (!attempt?.id || !question?.id || !selected || remainingSeconds > 0 || monitoringBlocked || busyAction) return;
    if (!window.confirm("Submit the final examination for scoring? Answers cannot be changed after submission.")) return;
    setBusyAction("submit");
    setError(null);
    try {
      const persisted = await examRequest({
        action: "answer",
        attemptId: attempt.id,
        questionId: question.id,
        selectedChoiceKey: selected,
        direction: "stay",
      });
      if (persisted.question?.id !== question.id || persisted.question.selectedChoiceKey !== selected) {
        throw new Error("The current answer was not confirmed by the examination record. Submission remains locked.");
      }
      await examRequest({ action: "submit", attemptId: attempt.id });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit examination.");
      await refresh().catch(() => undefined);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="fdacs-live fdacs-exam">
      <a className="fdacs-live__skip" href="#protected-exam-workspace">Skip to examination workspace</a>
      <header className="fdacs-live__topbar">
        <div className="fdacs-live__brandline"><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Florida Class D Final Examination</h1><small>Controlled assessment workspace · authenticated attempt</small></div>
        <div className="fdacs-live__status" role="status" aria-live="polite"><strong>PROTECTED EXAMINATION</strong><small>170 questions · 128 required to pass · minimum 2 hours</small></div>
      </header>

      {error ? <div ref={errorRef} className="fdacs-live__alert" role="alert" tabIndex={-1}>{error}</div> : null}

      {!attempt ? (
        <section className="fdacs-live__panel fdacs-exam__start" id="protected-exam-workspace">
          <span className="fdacs-exam__kicker">ELIGIBILITY GATE</span>
          <h2>Final examination eligibility</h2>
          <p>The examination is separate from the 40 instructional hours. Access remains locked unless your identity, enrollment, verified instructional time, and the Division-approved examination-bank controls are satisfied.</p>
          <div className="fdacs-exam__requirements" aria-label="Examination controls">
            <span><b>170</b> randomized questions</span><span><b>128</b> required to pass</span><span><b>2 hr</b> minimum duration</span>
          </div>
          <button type="button" disabled={busyAction !== null} onClick={() => void start()}>{busyAction === "start" ? "Starting protected exam…" : "Start final examination"}</button>
        </section>
      ) : null}

      {attempt && attempt.status === "in_progress" && question ? (
        <>
          <section className="fdacs-exam__metrics" id="protected-exam-workspace" aria-label="Examination status">
            <div><small>QUESTION</small><strong>{attempt.questionNumber ?? question.number} / {attempt.totalQuestions ?? 170}</strong></div>
            <div><small>ELAPSED</small><strong>{elapsedLabel}</strong></div>
            <div><small>EARLIEST SUBMIT</small><strong>{remainingSeconds > 0 ? `${Math.ceil(remainingSeconds / 60)} min` : "Available"}</strong></div>
            <div><small>MONITORING</small><strong>{monitoringLabel.replaceAll("_", " ").toUpperCase()}</strong></div>
          </section>
          <div className="fdacs-exam__progress" role="progressbar" aria-label="Examination progress" aria-valuemin={1} aria-valuemax={attempt.totalQuestions ?? 170} aria-valuenow={attempt.questionNumber ?? question.number}><span style={{ width: `${Math.max(0.6, ((attempt.questionNumber ?? question.number) / (attempt.totalQuestions ?? 170)) * 100)}%` }} /></div>
          {monitoringBlocked ? (
            <section className="fdacs-live__panel fdacs-live__alert" role="alert" aria-live="assertive">
              <h2>Examination paused for monitoring review</h2>
              <p>Answering and submission are locked. Keep this page open. A school administrator must review the interruption and authorize a controlled resume, or invalidate the attempt with an auditable reason.</p>
              <button type="button" onClick={() => void refresh()}>Check resume status</button>
            </section>
          ) : (
            <section className="fdacs-live__panel fdacs-exam__question">
              <small>{question.subjectCode.replaceAll("_", " ").toUpperCase()}</small>
              <h2 ref={questionHeadingRef} tabIndex={-1}>{question.prompt}</h2>
              <fieldset className="fdacs-exam__choices" disabled={busyAction !== null}>
                <legend>Choose one answer for question {attempt.questionNumber ?? question.number}</legend>
                {Object.entries(question.choices).map(([key, label]) => (
                  <label key={key} className={selected === key ? "is-selected" : ""}>
                    <input type="radio" name="answer" value={key} checked={selected === key} onChange={() => setSelected(key)} />
                    <span><b>{key}</b>{label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="fdacs-exam__actions">
                <button type="button" disabled={busyAction !== null || !selected || (attempt.questionNumber ?? 1) <= 1} onClick={() => void save("previous")}>{busyAction === "save" ? "Saving…" : "Save & previous"}</button>
                <button type="button" disabled={busyAction !== null || !selected || (attempt.questionNumber ?? 1) >= 170} onClick={() => void save("next")}>{busyAction === "save" ? "Saving…" : "Save & next"}</button>
                <button type="button" disabled={busyAction !== null || !selected || remainingSeconds > 0} onClick={() => void submit()}>{busyAction === "submit" ? "Saving answer & submitting…" : "Submit examination"}</button>
              </div>
            </section>
          )}
          <p className="fdacs-exam__notice">Question order is randomized. The answer key and scoring logic are never sent to the browser. The attempt is bound to this authenticated session and browser instance.</p>
        </>
      ) : null}

      {attempt && attempt.status !== "in_progress" ? (
        <section className="fdacs-live__panel fdacs-exam__result" id="protected-exam-workspace">
          <h2>Examination {attempt.status}</h2>
          <div className="fdacs-exam__score">{attempt.score ?? 0}<span>/ 170</span></div>
          <p>{attempt.passed ? "Passing score achieved. Completion remains subject to school review and the controlled FDACS/LIAS workflow." : "Passing score was not achieved or the attempt was invalidated. The school will apply its controlled remediation, review, and retest process."}</p>
        </section>
      ) : null}
    </main>
  );
}
