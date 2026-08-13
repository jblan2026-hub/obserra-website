"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Question = {
  id: string;
  number: number;
  subjectCode: string;
  questionType: "multiple_choice" | "true_false";
  prompt: string;
  choices: Record<string, string>;
  selectedChoiceKey?: string | null;
};

type Attempt = {
  id: string;
  status: string;
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

  const refresh = useCallback(async () => {
    const payload = await examRequest();
    setState(payload);
    setSelected(payload.question?.selectedChoiceKey ?? "");
  }, []);

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
    setError(null);
    try {
      const payload = await examRequest({ action: "start", browserInstanceId: browserInstanceId() });
      setState(payload);
      setSelected(payload.question?.selectedChoiceKey ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start examination.");
    }
  }

  async function save(direction: "next" | "previous" | "stay") {
    if (!attempt?.id || !question?.id || !selected) return;
    setError(null);
    try {
      const payload = await examRequest({
        action: "answer",
        attemptId: attempt.id,
        questionId: question.id,
        selectedChoiceKey: selected,
        direction,
      });
      setState(payload);
      setSelected(payload.question?.selectedChoiceKey ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save answer.");
    }
  }

  async function submit() {
    if (!attempt?.id || remainingSeconds > 0) return;
    if (!window.confirm("Submit the final examination for scoring? Answers cannot be changed after submission.")) return;
    setError(null);
    try {
      const response = await fetch("/api/florida-class-d/exam", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", attemptId: attempt.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to submit examination.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit examination.");
    }
  }

  return (
    <main className="fdacs-live fdacs-exam">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Florida Class D Final Examination</h1></div>
        <div className="fdacs-live__status"><strong>PROTECTED EXAMINATION</strong><small>170 questions · 128 required to pass · minimum 2 hours</small></div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      {!attempt ? (
        <section className="fdacs-live__panel fdacs-exam__start">
          <h2>Final examination eligibility</h2>
          <p>The examination is separate from the 40 instructional hours. Access remains locked unless your identity, enrollment, verified instructional time, and the Division-approved examination-bank controls are satisfied.</p>
          <button type="button" onClick={() => void start()}>Start final examination</button>
        </section>
      ) : null}

      {attempt && attempt.status === "in_progress" && question ? (
        <>
          <section className="fdacs-exam__metrics">
            <div><small>QUESTION</small><strong>{attempt.questionNumber ?? question.number} / {attempt.totalQuestions ?? 170}</strong></div>
            <div><small>ELAPSED</small><strong>{elapsedLabel}</strong></div>
            <div><small>EARLIEST SUBMIT</small><strong>{remainingSeconds > 0 ? `${Math.ceil(remainingSeconds / 60)} min` : "Available"}</strong></div>
          </section>
          <section className="fdacs-live__panel fdacs-exam__question">
            <small>{question.subjectCode.replaceAll("_", " ").toUpperCase()}</small>
            <h2>{question.prompt}</h2>
            <div className="fdacs-exam__choices">
              {Object.entries(question.choices).map(([key, label]) => (
                <label key={key} className={selected === key ? "is-selected" : ""}>
                  <input type="radio" name="answer" value={key} checked={selected === key} onChange={() => setSelected(key)} />
                  <span><b>{key}</b>{label}</span>
                </label>
              ))}
            </div>
            <div className="fdacs-exam__actions">
              <button type="button" disabled={!selected || (attempt.questionNumber ?? 1) <= 1} onClick={() => void save("previous")}>Save &amp; previous</button>
              <button type="button" disabled={!selected || (attempt.questionNumber ?? 1) >= 170} onClick={() => void save("next")}>Save &amp; next</button>
              <button type="button" disabled={remainingSeconds > 0} onClick={() => void submit()}>Submit examination</button>
            </div>
          </section>
          <p className="fdacs-exam__notice">Question order is randomized. The answer key and scoring logic are never sent to the browser.</p>
        </>
      ) : null}

      {attempt && attempt.status !== "in_progress" ? (
        <section className="fdacs-live__panel fdacs-exam__result">
          <h2>Examination {attempt.status}</h2>
          <div className="fdacs-exam__score">{attempt.score ?? 0}<span>/ 170</span></div>
          <p>{attempt.passed ? "Passing score achieved. Completion remains subject to school review and the controlled FDACS/LIAS workflow." : "Passing score was not achieved. The school will apply its approved remediation and retest policy."}</p>
        </section>
      ) : null}
    </main>
  );
}
