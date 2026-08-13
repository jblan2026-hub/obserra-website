"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Assignment = { id: string; training_day: number; module_id: number; delivery_method: string; assigned_minutes: number; certified_minutes: number; reason: string; status: string };
type Question = { id: string; assignment_id: string; question_text: string; answer_text?: string | null };
type State = { enrollment?: { id?: string; status?: string } | null; assignments?: Assignment[]; questions?: Question[] };

export default function MakeupPortal() {
  const [state, setState] = useState<State | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/florida-class-d/makeup", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load make-up training.");
    setState(payload as State);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh().catch((e) => setError(e instanceof Error ? e.message : "Unable to load make-up training.")), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function submitQuestion(event: FormEvent, assignmentId: string) {
    event.preventDefault();
    const question = drafts[assignmentId]?.trim();
    if (!question) return;
    try {
      const response = await fetch("/api/florida-class-d/makeup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "question", assignmentId, question }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Question could not be recorded.");
      setDrafts((current) => ({ ...current, [assignmentId]: "" }));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Question could not be recorded.");
    }
  }

  const assignments = state?.assignments ?? [];
  const questions = state?.questions ?? [];

  return (
    <main className="fdacs-live fdacs-makeup">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Class D Make-Up Training</h1></div>
        <div className="fdacs-live__status"><strong>REGULATED TIME RECONCILIATION</strong><small>Original live attendance remains preserved</small></div>
      </header>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      <section className="fdacs-live__panel fdacs-makeup__summary">
        <h2>Regulated time reconciliation</h2>
        <p>Only school-assigned recovery work appears here. Recorded make-up is limited to 600 minutes, and instructional credit remains separate from the original live-attendance record.</p>
      </section>
      {state?.enrollment && assignments.length === 0 ? <section className="fdacs-live__panel"><h2>No make-up training assigned</h2></section> : null}
      <section className="fdacs-makeup__assignments">
        {assignments.map((assignment) => (
          <article className="fdacs-live__panel fdacs-makeup__assignment" key={assignment.id}>
            <div className="fdacs-makeup__head"><div><small>DAY {assignment.training_day} · MODULE {assignment.module_id}</small><h2>{assignment.delivery_method.replaceAll("_", " ")}</h2></div><b>{assignment.status.replaceAll("_", " ")}</b></div>
            <div className="fdacs-makeup__metrics"><span>Assigned<strong>{assignment.assigned_minutes} min</strong></span><span>Certified<strong>{assignment.certified_minutes} min</strong></span><span>Remaining<strong>{Math.max(0, assignment.assigned_minutes - assignment.certified_minutes)} min</strong></span></div>
            <p>{assignment.reason}</p>
            <div className="fdacs-makeup__notice">{assignment.delivery_method === "recorded_makeup" ? "Protected recorded playback remains locked until its timing, participation, and evidence controls are promoted." : "The school will coordinate live make-up through the regulated instructor workflow."}</div>
            <h3>Instructor Q&amp;A</h3>
            {questions.filter((item) => item.assignment_id === assignment.id).map((item) => <div className="fdacs-makeup__thread" key={item.id}><p><b>Student:</b> {item.question_text}</p><p><b>Instructor:</b> {item.answer_text ?? "Awaiting response"}</p></div>)}
            <form className="fdacs-live__form" onSubmit={(event) => void submitQuestion(event, assignment.id)}><textarea value={drafts[assignment.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [assignment.id]: event.target.value }))} maxLength={4000} placeholder="Ask your instructor a question" /><button type="submit">Submit question</button></form>
          </article>
        ))}
      </section>
    </main>
  );
}
