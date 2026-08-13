"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type TimeSummary = {
  connectedSeconds?: number;
  instructionalPresenceSeconds?: number;
  breakPresenceSeconds?: number;
  uncreditedConnectedSeconds?: number;
  unresolvedChallengeAbsences?: number;
};

type StudentRow = {
  id?: string;
  status?: string;
  fdacs_class_d_student_identities?: unknown;
  liveTime?: {
    connected_seconds?: number;
    instructional_presence_seconds?: number;
    break_presence_seconds?: number;
    uncredited_connected_seconds?: number;
    presence_state?: string;
    last_heartbeat_at?: string | null;
  } | null;
  dayTime?: TimeSummary | null;
  courseTime?: TimeSummary | null;
};

type Interaction = {
  id?: string;
  enrollment_id?: string | null;
  actor_role?: string;
  interaction_type?: string;
  content?: string | null;
  parent_interaction_id?: string | null;
  created_at?: string;
};

type ConsoleState = {
  session?: {
    id?: string;
    day?: number;
    lesson_id?: string;
    status?: string;
    current_segment_type?: "instruction" | "break";
    started_at?: string | null;
    ended_at?: string | null;
  };
  students?: StudentRow[];
  interactions?: Interaction[];
};

function asSeconds(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatDuration(value: unknown) {
  const totalSeconds = asSeconds(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function studentName(row: StudentRow) {
  const identity = row.fdacs_class_d_student_identities;
  if (identity && typeof identity === "object" && !Array.isArray(identity)) {
    const value = (identity as Record<string, unknown>).legal_name;
    if (typeof value === "string" && value.trim()) return value;
  }
  if (Array.isArray(identity) && identity[0] && typeof identity[0] === "object") {
    const value = (identity[0] as Record<string, unknown>).legal_name;
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Enrolled student";
}

async function adminApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Instructor live-class request failed.");
  return payload;
}

function generatePresenceCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

function suggestedAttendanceStatus(student: StudentRow) {
  const instruction = asSeconds(student.dayTime?.instructionalPresenceSeconds);
  const unresolved = typeof student.dayTime?.unresolvedChallengeAbsences === "number" ? student.dayTime.unresolvedChallengeAbsences : 0;
  if (instruction >= 28_800 && unresolved === 0) return "present" as const;
  if (instruction === 0) return "absent" as const;
  return "makeup_required" as const;
}

export default function InstructorLiveConsole({ liveSessionId }: { liveSessionId: string }) {
  const [state, setState] = useState<ConsoleState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presenceCode, setPresenceCode] = useState<string | null>(null);
  const [classPrompt, setClassPrompt] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answerTarget, setAnswerTarget] = useState<Interaction | null>(null);
  const autoCheckIssued = useRef(false);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/admin/live?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load instructor console.");
    setState(payload as ConsoleState);
    setError(null);
  }, [liveSessionId]);

  useEffect(() => {
    void refresh().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load live class."));
    const timer = window.setInterval(() => void refresh().catch(() => undefined), 5_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const startedAt = state?.session?.started_at;
  const elapsedInstructionMinutes = startedAt && state?.session?.status === "live"
    ? Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 60_000))
    : 0;

  const students = state?.students ?? [];
  const interactions = state?.interactions ?? [];
  const questions = interactions.filter((item) => item.interaction_type === "student_question");

  const issuePresenceCheck = useCallback(async () => {
    if (!students.length) return;
    const code = generatePresenceCode();
    setPresenceCode(code);
    const eligible = students.filter((student) => typeof student.id === "string");
    await Promise.all(eligible.map((student) => adminApi({
      action: "challenge",
      liveSessionId,
      enrollmentId: student.id,
      challengeType: "presence_code",
      prompt: "Enter the six-digit presence code announced or displayed by your live instructor.",
      answer: code,
    })));
    await refresh();
  }, [liveSessionId, refresh, students]);

  useEffect(() => {
    if (state?.session?.status === "live" && elapsedInstructionMinutes >= 105 && !autoCheckIssued.current && students.length) {
      autoCheckIssued.current = true;
      void issuePresenceCheck().catch((challengeError) => setError(challengeError instanceof Error ? challengeError.message : "Automatic presence check failed."));
    }
  }, [elapsedInstructionMinutes, issuePresenceCheck, state?.session?.status, students.length]);

  async function sessionAction(action: "start" | "end") {
    try {
      await adminApi({ action, liveSessionId });
      if (action === "start") {
        autoCheckIssued.current = false;
        window.setTimeout(() => void issuePresenceCheck().catch(() => undefined), 1500);
      }
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Live session control failed.");
    }
  }

  async function segment(segmentType: "instruction" | "break") {
    try {
      await adminApi({ action: "segment", liveSessionId, segmentType });
      await refresh();
    } catch (segmentError) {
      setError(segmentError instanceof Error ? segmentError.message : "Segment control failed.");
    }
  }

  async function restorePresence(student: StudentRow) {
    if (!student.id) return;
    const note = window.prompt("Document the reason for restoring presence. Any missed instructional time still requires appropriate make-up handling.");
    if (!note?.trim()) return;
    try {
      await adminApi({ action: "restore_presence", liveSessionId, enrollmentId: student.id, reviewNote: note.trim() });
      await refresh();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Presence restoration failed.");
    }
  }

  async function certifyDay(student: StudentRow) {
    const day = state?.session?.day;
    if (!student.id || !day || day < 1 || day > 5) return;
    const attendanceStatus = suggestedAttendanceStatus(student);
    const label = attendanceStatus === "present" ? "PRESENT" : attendanceStatus === "absent" ? "ABSENT" : "MAKEUP REQUIRED";
    const approved = window.confirm(`Certify Day ${day} attendance for ${studentName(student)} as ${label}? The LMS-derived instructional and break time will be retained with the instructor attestation.`);
    if (!approved) return;
    try {
      await adminApi({
        action: "certify_day",
        enrollmentId: student.id,
        day,
        attendanceStatus,
        idempotencyKey: `fdacs-live-day-${day}-${student.id}`,
      });
      await refresh();
    } catch (certificationError) {
      setError(certificationError instanceof Error ? certificationError.message : "Daily attendance certification failed.");
    }
  }

  async function submitPrompt(event: FormEvent) {
    event.preventDefault();
    if (!classPrompt.trim()) return;
    try {
      await adminApi({ action: "prompt", liveSessionId, content: classPrompt.trim() });
      setClassPrompt("");
      await refresh();
    } catch (promptError) {
      setError(promptError instanceof Error ? promptError.message : "Instructor prompt failed.");
    }
  }

  async function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (!answerTarget?.id || !answerText.trim()) return;
    try {
      await adminApi({
        action: "answer",
        liveSessionId,
        enrollmentId: answerTarget.enrollment_id ?? undefined,
        parentInteractionId: answerTarget.id,
        content: answerText.trim(),
      });
      setAnswerText("");
      setAnswerTarget(null);
      await refresh();
    } catch (answerError) {
      setError(answerError instanceof Error ? answerError.message : "Instructor answer failed.");
    }
  }

  const status = state?.session?.status ?? "locked";
  const isBreak = state?.session?.current_segment_type === "break";
  const day = state?.session?.day;
  const canCertifyDay = Boolean(day && state?.session?.lesson_id === `D${day}-L4` && status === "ended");

  return (
    <main className="fdacs-live">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Class D Instructor Live Console</h1>
        </div>
        <div className={`fdacs-live__status ${isBreak ? "is-break" : ""}`}>
          <strong>{status.toUpperCase()} · {state?.session?.lesson_id ?? "SESSION"}</strong>
          <small>Day {day ?? "–"} · all attendance and time evidence is server recorded</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}

      <section className="fdacs-live__grid">
        <div className="fdacs-live__stage">
          <div className="fdacs-live__stage-frame">
            <span>LIVE INSTRUCTOR MEDIA AND TEACHING SURFACE</span>
            <h2>{state?.session?.lesson_id ?? "Florida Class D Live Lesson"}</h2>
            <p>This is the instructor control surface for the embedded live media provider, lesson presentation, security checks, questions, polls, attendance verification, and inspection access. Media transport remains fail-closed until the approved provider is configured.</p>
            {presenceCode ? <div className="fdacs-live__presence-code"><small>CURRENT PRESENCE CODE</small><strong>{presenceCode}</strong><span>Read or display this code to the live class. Do not post it in the student Q&amp;A feed.</span></div> : null}
          </div>

          <div className="fdacs-live__instructor-controls">
            <button type="button" onClick={() => void sessionAction("start")}>Start live lesson</button>
            <button type="button" onClick={() => void issuePresenceCheck()}>Issue presence check</button>
            <button type="button" onClick={() => void segment("break")}>Start 15-minute break</button>
            <button type="button" onClick={() => void segment("instruction")}>Resume instruction</button>
            <button type="button" className="danger" onClick={() => void sessionAction("end")}>End lesson</button>
          </div>

          <section className="fdacs-live__panel fdacs-live__roster-panel">
            <div className="fdacs-live__panel-head"><h2>Live attendance and full-course time roster</h2><span>{students.length} students</span></div>
            <p className="fdacs-live__muted">The roster separates live connection, credited instructional presence, tracked breaks, and uncredited time for each student. After Lesson 4 ends, the instructor must certify the day. Break time remains visible but cannot become instructional credit.</p>
            <div className="fdacs-live__roster">
              {students.map((student) => {
                const live = student.liveTime;
                const absent = live?.presence_state === "absent_challenge";
                const suggested = suggestedAttendanceStatus(student);
                return (
                  <div key={student.id ?? studentName(student)} className={absent ? "is-absent" : ""}>
                    <span><strong>{studentName(student)}</strong><small>{live?.presence_state ?? "not connected"}</small></span>
                    <span><small>Live connected</small><b>{formatDuration(live?.connected_seconds)}</b></span>
                    <span><small>Day instruction</small><b>{formatDuration(student.dayTime?.instructionalPresenceSeconds)}</b></span>
                    <span><small>Day breaks</small><b>{formatDuration(student.dayTime?.breakPresenceSeconds)}</b></span>
                    <span><small>Course connected</small><b>{formatDuration(student.courseTime?.connectedSeconds)}</b></span>
                    <span><small>Course instruction</small><b>{formatDuration(student.courseTime?.instructionalPresenceSeconds)}</b></span>
                    <span><small>Course breaks</small><b>{formatDuration(student.courseTime?.breakPresenceSeconds)}</b></span>
                    <span><small>Course uncredited</small><b>{formatDuration(student.courseTime?.uncreditedConnectedSeconds)}</b></span>
                    <span className="fdacs-live__roster-actions">
                      {absent ? <button type="button" onClick={() => void restorePresence(student)}>Review absence</button> : null}
                      {canCertifyDay ? <button type="button" onClick={() => void certifyDay(student)}>Certify {suggested.replace("_", " ")}</button> : <em>Awaiting day end</em>}
                    </span>
                  </div>
                );
              })}
              {!students.length ? <p className="fdacs-live__muted">No eligible student records are available for this live session.</p> : null}
            </div>
          </section>
        </div>

        <aside className="fdacs-live__side">
          <section className="fdacs-live__panel">
            <div className="fdacs-live__panel-head"><h2>Instructor prompt</h2><span>interactive</span></div>
            <form className="fdacs-live__form" onSubmit={submitPrompt}>
              <textarea value={classPrompt} onChange={(event) => setClassPrompt(event.target.value)} placeholder="Ask the class a question, launch a discussion prompt, or give an instruction" maxLength={4000} />
              <button type="submit">Send to class</button>
            </form>
          </section>

          <section className="fdacs-live__panel">
            <div className="fdacs-live__panel-head"><h2>Student questions</h2><span>{questions.length}</span></div>
            <div className="fdacs-live__feed">
              {questions.map((question) => (
                <button className="fdacs-live__question-card" type="button" key={question.id} onClick={() => setAnswerTarget(question)}>
                  <b>STUDENT QUESTION</b>
                  <span>{question.content || "Question submitted"}</span>
                </button>
              ))}
              {!questions.length ? <p className="fdacs-live__muted">Student questions will appear here in real time.</p> : null}
            </div>
            {answerTarget ? (
              <form className="fdacs-live__form" onSubmit={submitAnswer}>
                <p>Answering: <strong>{answerTarget.content}</strong></p>
                <textarea value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder="Instructor answer" maxLength={4000} />
                <button type="submit">Send answer</button>
              </form>
            ) : null}
          </section>
        </aside>
      </section>
    </main>
  );
}
