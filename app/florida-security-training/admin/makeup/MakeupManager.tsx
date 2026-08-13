"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Assignment = {
  id: string;
  enrollment_id: string;
  training_day: number;
  module_id: number;
  delivery_method: "live_makeup" | "recorded_makeup";
  assigned_minutes: number;
  certified_minutes: number;
  status: string;
};

type Question = { id: string; assignment_id: string; question_text: string; answer_text?: string | null };
type Reconciliation = { maximumCertifiableMinutes?: number; dayRemaining?: number; courseRemaining?: number; recordedRemaining?: number; note?: string };

async function adminApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/makeup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Make-up administration request failed.");
  return payload;
}

export default function MakeupManager() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [reason, setReason] = useState("");
  const [day, setDay] = useState(1);
  const [moduleId, setModuleId] = useState(1);
  const [minutes, setMinutes] = useState(60);
  const [method, setMethod] = useState<"live_makeup" | "recorded_makeup">("live_makeup");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Record<string, Reconciliation>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/florida-class-d/admin/makeup", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load make-up administration.");
    setAssignments(Array.isArray(payload.assignments) ? payload.assignments : []);
    setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh().catch((e) => setError(e instanceof Error ? e.message : "Unable to load records.")), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function assign(event: FormEvent) {
    event.preventDefault();
    try {
      await adminApi({ action: "assign", enrollmentId, trainingDay: day, moduleId, deliveryMethod: method, assignedMinutes: minutes, reason, assignedInstructorClerkUserId: instructorId });
      setReason("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assignment failed.");
    }
  }

  async function answer(questionId: string) {
    const answerText = answerDrafts[questionId]?.trim();
    if (!answerText) return;
    try {
      await adminApi({ action: "answer", questionId, answer: answerText });
      setAnswerDrafts((current) => ({ ...current, [questionId]: "" }));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Answer could not be recorded.");
    }
  }

  async function calculate(assignmentId: string) {
    try {
      const result = await adminApi({ action: "preview_reconciliation", assignmentId });
      setPreview((current) => ({ ...current, [assignmentId]: result.preview as Reconciliation }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reconciliation preview failed.");
    }
  }

  return (
    <main className="fdacs-live fdacs-makeup">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Class D Make-Up Administration</h1></div>
        <div className="fdacs-live__status"><strong>FAIL-CLOSED CREDIT CONTROL</strong><small>Assignment and evidence review are active only after production gates open</small></div>
      </header>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      <section className="fdacs-live__grid">
        <section className="fdacs-live__panel">
          <h2>Assign make-up training</h2>
          <form className="fdacs-live__form" onSubmit={assign}>
            <input value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} placeholder="Enrollment UUID" required />
            <input value={instructorId} onChange={(e) => setInstructorId(e.target.value)} placeholder="Assigned instructor Clerk user ID" required />
            <div className="fdacs-makeup__metrics">
              <label>Day<input type="number" min={1} max={5} value={day} onChange={(e) => setDay(Number(e.target.value))} /></label>
              <label>Module<input type="number" min={1} max={18} value={moduleId} onChange={(e) => setModuleId(Number(e.target.value))} /></label>
              <label>Minutes<input type="number" min={1} max={480} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></label>
            </div>
            <select value={method} onChange={(e) => setMethod(e.target.value as "live_makeup" | "recorded_makeup")}>
              <option value="live_makeup">Live instructor make-up</option>
              <option value="recorded_makeup">Controlled recorded make-up</option>
            </select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={4000} placeholder="Document the missed instruction and reason for the assignment" required />
            <button type="submit">Create controlled assignment</button>
          </form>
          <p className="fdacs-live__fineprint">Recorded assignments are limited to 600 minutes per student. Instructional credit itself remains locked until transactional certification is promoted.</p>
        </section>

        <section className="fdacs-live__panel">
          <h2>Instructor questions</h2>
          {(questions.filter((item) => !item.answer_text)).map((item) => (
            <div className="fdacs-makeup__thread" key={item.id}>
              <p>{item.question_text}</p>
              <textarea value={answerDrafts[item.id] ?? ""} onChange={(e) => setAnswerDrafts((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="Instructor response" />
              <button type="button" onClick={() => void answer(item.id)}>Record answer</button>
            </div>
          ))}
          {!questions.some((item) => !item.answer_text) ? <p className="fdacs-live__muted">No unanswered make-up questions.</p> : null}
        </section>
      </section>

      <section className="fdacs-live__panel fdacs-makeup__summary">
        <h2>Assignments and reconciliation ceiling</h2>
        {assignments.map((assignment) => (
          <div className="fdacs-makeup__thread" key={assignment.id}>
            <p><b>Day {assignment.training_day} · Module {assignment.module_id}</b> · {assignment.delivery_method.replaceAll("_", " ")} · {assignment.assigned_minutes} min · {assignment.status}</p>
            <button type="button" onClick={() => void calculate(assignment.id)}>Calculate allowable credit</button>
            {preview[assignment.id] ? <p>Maximum certifiable now: <b>{preview[assignment.id].maximumCertifiableMinutes ?? 0} minutes</b>. Day remaining: {preview[assignment.id].dayRemaining ?? 0}; course remaining: {preview[assignment.id].courseRemaining ?? 0}; recorded remaining: {preview[assignment.id].recordedRemaining ?? 0}.</p> : null}
          </div>
        ))}
      </section>
    </main>
  );
}
