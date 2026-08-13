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
type CertificationDraft = {
  certifiedMinutes: number;
  evidenceReference: string;
  evidenceStartedAt: string;
  evidenceEndedAt: string;
};

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

function emptyCertification(minutes: number): CertificationDraft {
  return {
    certifiedMinutes: Math.max(1, Math.min(480, minutes)),
    evidenceReference: "",
    evidenceStartedAt: "",
    evidenceEndedAt: "",
  };
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
  const [certificationDrafts, setCertificationDrafts] = useState<Record<string, CertificationDraft>>({});
  const [busyAssignmentId, setBusyAssignmentId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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
    setError(null);
    setNotice(null);
    try {
      await adminApi({ action: "assign", enrollmentId, trainingDay: day, moduleId, deliveryMethod: method, assignedMinutes: minutes, reason, assignedInstructorClerkUserId: instructorId });
      setReason("");
      setNotice("Controlled make-up assignment created.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assignment failed.");
    }
  }

  async function answer(questionId: string) {
    const answerText = answerDrafts[questionId]?.trim();
    if (!answerText) return;
    setError(null);
    setNotice(null);
    try {
      await adminApi({ action: "answer", questionId, answer: answerText });
      setAnswerDrafts((current) => ({ ...current, [questionId]: "" }));
      setNotice("Instructor response recorded.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Answer could not be recorded.");
    }
  }

  async function calculate(assignmentId: string) {
    setError(null);
    try {
      const result = await adminApi({ action: "preview_reconciliation", assignmentId });
      const next = result.preview as Reconciliation;
      setPreview((current) => ({ ...current, [assignmentId]: next }));
      setCertificationDrafts((current) => ({
        ...current,
        [assignmentId]: current[assignmentId] ?? emptyCertification(next.maximumCertifiableMinutes ?? 1),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reconciliation preview failed.");
    }
  }

  function updateCertification(assignmentId: string, assignmentMinutes: number, patch: Partial<CertificationDraft>) {
    setCertificationDrafts((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] ?? emptyCertification(assignmentMinutes)),
        ...patch,
      },
    }));
  }

  async function certify(assignment: Assignment) {
    const draft = certificationDrafts[assignment.id] ?? emptyCertification(assignment.assigned_minutes);
    const ceiling = preview[assignment.id]?.maximumCertifiableMinutes ?? 0;
    if (ceiling < 1) {
      setError("Calculate the allowable credit before certification, and confirm that a remaining instructional deficit exists.");
      return;
    }
    if (draft.certifiedMinutes > ceiling) {
      setError(`Requested certification exceeds the current reconciliation ceiling of ${ceiling} minutes.`);
      return;
    }

    setBusyAssignmentId(assignment.id);
    setError(null);
    setNotice(null);
    try {
      const result = await adminApi({
        action: "certify",
        assignmentId: assignment.id,
        certifiedMinutes: draft.certifiedMinutes,
        evidenceReference: draft.evidenceReference,
        evidenceStartedAt: draft.evidenceStartedAt,
        evidenceEndedAt: draft.evidenceEndedAt,
        idempotencyKey: `makeup-cert-${assignment.id}-${draft.certifiedMinutes}`,
      });
      const credited = result?.certification?.certifiedMinutes ?? draft.certifiedMinutes;
      setNotice(`Make-up certification recorded atomically for ${credited} instructional minutes.`);
      await refresh();
      await calculate(assignment.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Make-up certification failed.");
    } finally {
      setBusyAssignmentId(null);
    }
  }

  return (
    <main className="fdacs-live fdacs-makeup">
      <header className="fdacs-live__topbar">
        <div><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><h1>Class D Make-Up Administration</h1></div>
        <div className="fdacs-live__status"><strong>ATOMIC CREDIT CONTROL</strong><small>Certification is server-authorized, evidence-bound, reconciled, and production gated</small></div>
      </header>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {notice ? <div className="fdacs-live__panel"><b>{notice}</b></div> : null}

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
          <p className="fdacs-live__fineprint">Recorded assignments remain limited to 600 minutes per student. Production use remains fail closed until the Class DS and runtime activation gates are satisfied.</p>
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
        <h2>Assignments, reconciliation, and certification</h2>
        {assignments.map((assignment) => {
          const reconciliation = preview[assignment.id];
          const draft = certificationDrafts[assignment.id] ?? emptyCertification(assignment.assigned_minutes);
          const certifiable = assignment.status !== "certified" && (reconciliation?.maximumCertifiableMinutes ?? 0) > 0;
          return (
            <div className="fdacs-makeup__thread" key={assignment.id}>
              <p><b>Day {assignment.training_day} · Module {assignment.module_id}</b> · {assignment.delivery_method.replaceAll("_", " ")} · assigned {assignment.assigned_minutes} min · certified {assignment.certified_minutes} min · {assignment.status}</p>
              <button type="button" onClick={() => void calculate(assignment.id)}>Calculate allowable credit</button>
              {reconciliation ? (
                <>
                  <p>Maximum certifiable now: <b>{reconciliation.maximumCertifiableMinutes ?? 0} minutes</b>. Day remaining: {reconciliation.dayRemaining ?? 0}; course remaining: {reconciliation.courseRemaining ?? 0}; recorded remaining: {reconciliation.recordedRemaining ?? 0}.</p>
                  {certifiable ? (
                    <div className="fdacs-live__form">
                      <label>Certified instructional minutes<input type="number" min={1} max={reconciliation.maximumCertifiableMinutes ?? assignment.assigned_minutes} value={draft.certifiedMinutes} onChange={(e) => updateCertification(assignment.id, assignment.assigned_minutes, { certifiedMinutes: Number(e.target.value) })} /></label>
                      <input value={draft.evidenceReference} onChange={(e) => updateCertification(assignment.id, assignment.assigned_minutes, { evidenceReference: e.target.value })} placeholder="Controlled evidence reference" maxLength={500} />
                      <label>Evidence start<input type="datetime-local" value={draft.evidenceStartedAt} onChange={(e) => updateCertification(assignment.id, assignment.assigned_minutes, { evidenceStartedAt: e.target.value })} /></label>
                      <label>Evidence end<input type="datetime-local" value={draft.evidenceEndedAt} onChange={(e) => updateCertification(assignment.id, assignment.assigned_minutes, { evidenceEndedAt: e.target.value })} /></label>
                      <button type="button" disabled={busyAssignmentId === assignment.id || !draft.evidenceReference || !draft.evidenceStartedAt || !draft.evidenceEndedAt} onClick={() => void certify(assignment)}>{busyAssignmentId === assignment.id ? "Certifying…" : "Certify reconciled credit"}</button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </section>
    </main>
  );
}
