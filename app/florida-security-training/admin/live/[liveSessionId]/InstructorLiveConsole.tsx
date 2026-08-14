"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import InstructionalTextScreenControl from "./InstructionalTextScreenControl";

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

type Participation = {
  questionCount?: number;
  handRaiseCount?: number;
  pollResponseCount?: number;
  pollCorrectCount?: number;
  scoredPollResponseCount?: number;
  pollsPresented?: number;
  pollResponseRate?: number;
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
  participation?: Participation | null;
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

type LivePoll = {
  id?: string;
  question?: string;
  options?: string[];
  status?: "open" | "closed";
  opened_at?: string;
  closed_at?: string | null;
  correct_option_index?: number | null;
  response_count?: number;
};

type ActiveTextScreen = {
  id?: string;
  title?: string;
  body?: string;
  word_count?: number;
  minimum_seconds?: number;
  status?: "open" | "closed";
};

type TextScreenView = {
  enrollment_id?: string;
  observed_seconds?: number;
  requirement_met_at?: string | null;
  acknowledged_at?: string | null;
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
  polls?: LivePoll[];
  activeTextScreen?: ActiveTextScreen | null;
  textScreenViews?: TextScreenView[];
};

type IdentityContext = {
  enrollmentId?: string;
  studentLegalName?: string;
  verificationSessionId?: string;
  providerStatus?: string;
  documentCheckStatus?: string;
  selfieCheckStatus?: string;
  instructorFileId?: string;
  existingIdentityAttestationId?: string | null;
  existingDailyIdentityCheckinId?: string | null;
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

function participationLabel(participation?: Participation | null) {
  if (!participation) return "No participation evidence yet";
  const polls = participation.pollsPresented ?? 0;
  const responses = participation.pollResponseCount ?? 0;
  return `Q ${participation.questionCount ?? 0} · Hands ${participation.handRaiseCount ?? 0} · Polls ${responses}/${polls}`;
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

async function identityContext(enrollmentId: string, liveSessionId: string) {
  const query = new URLSearchParams({ enrollmentId, liveSessionId });
  const response = await fetch(`/api/florida-class-d/admin/identity?${query}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Controlled identity evidence is unavailable.");
  return (payload?.context ?? {}) as IdentityContext;
}

async function identityAdminApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/identity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Controlled identity evidence could not be recorded.");
  return payload as { result?: Record<string, unknown> };
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
  const [media, setMedia] = useState<MediaAccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presenceCode, setPresenceCode] = useState<string | null>(null);
  const [classPrompt, setClassPrompt] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answerTarget, setAnswerTarget] = useState<Interaction | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
  const [pollBusy, setPollBusy] = useState(false);
  const [clockMs, setClockMs] = useState(0);
  const autoCheckIssued = useRef(false);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/admin/live?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load instructor console.");
    setState(payload as ConsoleState);
    setError(null);
  }, [liveSessionId]);

  const loadMedia = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/admin/media?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to provision instructor video.");
    const access = payload as MediaAccess;
    if (!access.joinUrl) throw new Error("Secure live video did not return a join URL.");
    setMedia(access);
  }, [liveSessionId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void Promise.all([refresh(), loadMedia()]).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load live class."));
    }, 0);
    const timer = window.setInterval(() => void refresh().catch(() => undefined), 5_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadMedia, refresh]);

  useEffect(() => {
    const initialTick = window.setTimeout(() => setClockMs(Date.now()), 0);
    const timer = window.setInterval(() => setClockMs(Date.now()), 5_000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  const startedAt = state?.session?.started_at;
  const elapsedInstructionMinutes = startedAt && state?.session?.status === "live" && clockMs > 0
    ? Math.max(0, Math.floor((clockMs - Date.parse(startedAt)) / 60_000))
    : 0;

  const students = useMemo(() => state?.students ?? [], [state?.students]);
  const interactions = state?.interactions ?? [];
  const questions = interactions.filter((item) => item.interaction_type === "student_question");
  const polls = state?.polls ?? [];
  const activePoll = polls.find((poll) => poll.status === "open") ?? null;

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
    if (action === "start" && !media?.joinUrl) {
      setError("Secure live video must be provisioned before regulated instruction can start.");
      return;
    }
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
      const certification = await adminApi({
        action: "certify_day",
        enrollmentId: student.id,
        day,
        attendanceStatus,
        idempotencyKey: `fdacs-live-day-${day}-${student.id}`,
      });
      const entryId = certification?.result?.entryId;
      const context = await identityContext(student.id, liveSessionId);
      if (
        typeof entryId !== "string" ||
        typeof context.existingDailyIdentityCheckinId !== "string" ||
        typeof context.existingIdentityAttestationId !== "string" ||
        typeof context.instructorFileId !== "string"
      ) {
        throw new Error("Daily attendance was recorded, but controlled daily identity evidence is incomplete. Completion remains blocked.");
      }
      await identityAdminApi({
        action: "daily_attendance_attestation",
        enrollmentId: student.id,
        anchorLiveSessionId: liveSessionId,
        attendanceEntryId: entryId,
        identityAttestationId: context.existingIdentityAttestationId,
        instructorFileId: context.instructorFileId,
        attestedAt: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });
      await refresh();
    } catch (certificationError) {
      setError(certificationError instanceof Error ? certificationError.message : "Daily attendance certification failed.");
    }
  }

  async function verifyDailyIdentity(student: StudentRow) {
    if (!student.id || !day) return;
    try {
      let context = await identityContext(student.id, liveSessionId);
      if (
        context.providerStatus !== "verified" ||
        context.documentCheckStatus !== "verified" ||
        context.selfieCheckStatus !== "verified" ||
        typeof context.verificationSessionId !== "string" ||
        typeof context.instructorFileId !== "string"
      ) {
        throw new Error("Automated government-ID and matching-selfie verification has not passed for this student.");
      }

      let identityAttestationId = context.existingIdentityAttestationId;
      if (!identityAttestationId) {
        const photoIdType = window.prompt(
          "Enter the observed U.S. photo-ID type: state_driver_license, state_identification_card, us_passport, or federal_photo_identification",
          "state_driver_license",
        )?.trim();
        const allowedPhotoIdTypes = new Set(["state_driver_license", "state_identification_card", "us_passport", "federal_photo_identification"]);
        if (!photoIdType || !allowedPhotoIdTypes.has(photoIdType)) throw new Error("A supported U.S. state or federal photo-ID type is required.");
        const jurisdiction = window.prompt("Enter the two-letter state/territory code, or USA for a federal document:", "FL")?.trim().toUpperCase();
        if (!jurisdiction || !/^[A-Z]{2,3}$/.test(jurisdiction)) throw new Error("A valid issuing jurisdiction is required.");
        const attested = window.confirm(
          `Attest for ${context.studentLegalName ?? studentName(student)}: I am the assigned Class DI instructor, I observed the student and the student's U.S. state or federal issued photo identification, and I verified that the live student matches that identification.`,
        );
        if (!attested) return;
        const identityResult = await identityAdminApi({
          action: "identity_attestation",
          enrollmentId: student.id,
          verificationSessionId: context.verificationSessionId,
          instructorFileId: context.instructorFileId,
          observedPhotoIdType: photoIdType,
          issuingJurisdiction: jurisdiction,
          attestedAt: new Date().toISOString(),
          correlationId: crypto.randomUUID(),
        });
        identityAttestationId = typeof identityResult.result?.identityAttestationId === "string"
          ? identityResult.result.identityAttestationId
          : null;
        if (!identityAttestationId) throw new Error("The instructor identity attestation was not recorded.");
        context = await identityContext(student.id, liveSessionId);
      }

      if (context.existingDailyIdentityCheckinId) {
        window.alert(`Day ${day} identity check-in is already recorded for ${studentName(student)}.`);
        return;
      }
      const dailyAttested = window.confirm(
        `Day ${day} check-in for ${context.studentLegalName ?? studentName(student)}: I am the assigned Class DI instructor, I observed this student live before instruction today, and I verified the student against the controlled identity record.`,
      );
      if (!dailyAttested) return;
      await identityAdminApi({
        action: "daily_identity_checkin",
        enrollmentId: student.id,
        anchorLiveSessionId: liveSessionId,
        identityAttestationId,
        instructorFileId: context.instructorFileId,
        attestedAt: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });
      await refresh();
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : "Daily identity check-in failed.");
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

  function updatePollOption(index: number, value: string) {
    setPollOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value : option));
  }

  async function createPoll(event: FormEvent) {
    event.preventDefault();
    if (activePoll) {
      setError("Close the current live poll before opening another.");
      return;
    }
    const normalizedOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
    if (!pollQuestion.trim() || normalizedOptions.length < 2) {
      setError("A live poll requires a question and at least two answer options.");
      return;
    }
    const normalizedCorrect = correctOptionIndex !== null && correctOptionIndex < normalizedOptions.length ? correctOptionIndex : null;
    setPollBusy(true);
    setError(null);
    try {
      await adminApi({
        action: "poll_create",
        liveSessionId,
        question: pollQuestion.trim(),
        options: normalizedOptions,
        correctOptionIndex: normalizedCorrect,
      });
      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
      setCorrectOptionIndex(null);
      await refresh();
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Live poll could not be opened.");
    } finally {
      setPollBusy(false);
    }
  }

  async function closePoll() {
    if (!activePoll?.id) return;
    setPollBusy(true);
    setError(null);
    try {
      await adminApi({ action: "poll_close", pollId: activePoll.id });
      await refresh();
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Live poll could not be closed.");
    } finally {
      setPollBusy(false);
    }
  }

  function openObserverAdministration() {
    window.open(`/florida-security-training/admin/observer/${encodeURIComponent(liveSessionId)}`, "_blank", "noopener,noreferrer");
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
          <div className="fdacs-live__stage-frame fdacs-live__media-frame">
            {media?.joinUrl ? (
              <iframe
                title="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC Florida Class D instructor secure live video classroom"
                src={media.joinUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="fdacs-live__media-waiting">
                <span>SECURE INSTRUCTOR MEDIA</span>
                <h2>{state?.session?.lesson_id ?? "Florida Class D Live Lesson"}</h2>
                <p>The regulated lesson cannot start until the secure room and short-lived instructor token are provisioned.</p>
              </div>
            )}
          </div>
          <p className="fdacs-live__fineprint">Instructor video, audio, screen sharing, and prejoin device checks are delivered through the secure media room. Recording is disabled by default. OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC remains the system of record for attendance and instructional time.</p>
          {presenceCode ? <div className="fdacs-live__presence-code"><small>CURRENT PRESENCE CODE</small><strong>{presenceCode}</strong><span>Read or display this code to the live class. Do not post it in the student Q&amp;A feed.</span></div> : null}

          <div className="fdacs-live__instructor-controls">
            <button type="button" onClick={() => void sessionAction("start")} disabled={!media?.joinUrl}>Start live lesson</button>
            <button type="button" onClick={() => void issuePresenceCheck()}>Issue presence check</button>
            <button type="button" onClick={() => void segment("break")}>Start 15-minute break</button>
            <button type="button" onClick={() => void segment("instruction")}>Resume instruction</button>
            <button type="button" onClick={openObserverAdministration}>Regulatory observer access</button>
            <button type="button" className="danger" onClick={() => void sessionAction("end")}>End lesson</button>
          </div>

          <InstructionalTextScreenControl
            liveSessionId={liveSessionId}
            status={status}
            isBreak={isBreak}
            activeTextScreen={state?.activeTextScreen ?? null}
            textScreenViews={state?.textScreenViews ?? []}
            students={students}
            onChanged={refresh}
          />

          <section className="fdacs-live__panel fdacs-live__roster-panel">
            <div className="fdacs-live__panel-head"><h2>Live attendance and full-course time roster</h2><span>{students.length} students</span></div>
            <p className="fdacs-live__muted">Before the first lesson, the assigned Class DI instructor must verify each live student and record today&apos;s identity check-in. The LMS will not issue the student&apos;s single-device instructional lease without it. After Lesson 4 ends, certify the server-derived attendance ledger and sign the separate end-of-day attendance attestation.</p>
            <div className="fdacs-live__roster">
              {students.map((student) => {
                const live = student.liveTime;
                const absent = live?.presence_state === "absent_challenge";
                const suggested = suggestedAttendanceStatus(student);
                return (
                  <div key={student.id ?? studentName(student)} className={absent ? "is-absent" : ""}>
                    <span><strong>{studentName(student)}</strong><small>{live?.presence_state ?? "not connected"}</small><small>{participationLabel(student.participation)}</small></span>
                    <span><small>Live connected</small><b>{formatDuration(live?.connected_seconds)}</b></span>
                    <span><small>Day instruction</small><b>{formatDuration(student.dayTime?.instructionalPresenceSeconds)}</b></span>
                    <span><small>Day breaks</small><b>{formatDuration(student.dayTime?.breakPresenceSeconds)}</b></span>
                    <span><small>Course connected</small><b>{formatDuration(student.courseTime?.connectedSeconds)}</b></span>
                    <span><small>Course instruction</small><b>{formatDuration(student.courseTime?.instructionalPresenceSeconds)}</b></span>
                    <span><small>Course breaks</small><b>{formatDuration(student.courseTime?.breakPresenceSeconds)}</b></span>
                    <span><small>Course uncredited</small><b>{formatDuration(student.courseTime?.uncreditedConnectedSeconds)}</b></span>
                    <span className="fdacs-live__roster-actions">
                      <button type="button" onClick={() => void verifyDailyIdentity(student)}>Verify Day {day ?? "–"} identity</button>
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

          <section className={`fdacs-live__panel fdacs-live__poll-admin ${activePoll ? "is-open" : ""}`}>
            <div className="fdacs-live__panel-head"><h2>Structured live poll</h2><span>{activePoll ? "open" : "ready"}</span></div>
            {activePoll ? (
              <div className="fdacs-live__active-poll">
                <strong>{activePoll.question}</strong>
                <div>{(activePoll.options ?? []).map((option, index) => <span key={`${activePoll.id}-${index}`}>{index + 1}. {option}{activePoll.correct_option_index === index ? " · key" : ""}</span>)}</div>
                <p className="fdacs-live__muted">Current poll responses: {activePoll.response_count ?? 0} of {students.length}. Per-student cumulative participation totals for this lesson are shown in the roster.</p>
                <button type="button" disabled={pollBusy} onClick={() => void closePoll()}>{pollBusy ? "Closing…" : "Close current poll"}</button>
              </div>
            ) : (
              <form className="fdacs-live__form fdacs-live__poll-builder" onSubmit={createPoll}>
                <textarea value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} placeholder="Ask a live knowledge or participation question" maxLength={1000} />
                {pollOptions.map((option, index) => (
                  <input key={index} value={option} onChange={(event) => updatePollOption(index, event.target.value)} placeholder={`Option ${index + 1}${index > 1 ? " (optional)" : ""}`} maxLength={500} />
                ))}
                <label>Optional correct answer
                  <select value={correctOptionIndex === null ? "" : String(correctOptionIndex)} onChange={(event) => setCorrectOptionIndex(event.target.value === "" ? null : Number(event.target.value))}>
                    <option value="">Participation only</option>
                    {pollOptions.map((option, index) => <option key={index} value={index} disabled={!option.trim()}>Option {index + 1}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={pollBusy || status !== "live"}>{pollBusy ? "Opening…" : "Open live poll"}</button>
                <small>Only one structured poll can be open at a time. Polls open only during live instruction and are retained as participation evidence.</small>
              </form>
            )}
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
