"use client";

import { FormEvent, useMemo, useState } from "react";

const DAYS = [1, 2, 3, 4, 5] as const;
const LESSONS = [1, 2, 3, 4] as const;

type ScheduledLesson = {
  live_session_id?: string;
  training_day?: number;
  lesson_id?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
};

type ScheduleResponse = {
  cohortId?: string;
  lessonCount?: number;
  lessons?: ScheduledLesson[];
  correlationId?: string;
};

function localTimeFromOffset(startTime: string, offsetMinutes: number) {
  const [hourText, minuteText] = startTime.split(":");
  const baseMinutes = Number(hourText) * 60 + Number(minuteText) + offsetMinutes;
  if (!Number.isFinite(baseMinutes)) return "--:--";
  const minutesInDay = 24 * 60;
  const normalized = ((baseMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

async function publishSchedule(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/schedule", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Class D schedule could not be published.");
  return payload as ScheduleResponse;
}

export default function ScheduleManager({
  ownerUatRequested,
  ownerUatAuthorized,
}: {
  ownerUatRequested: boolean;
  ownerUatAuthorized: boolean;
}) {
  const [cohortId, setCohortId] = useState("");
  const [instructorClerkUserId, setInstructorClerkUserId] = useState("");
  const [trainingDates, setTrainingDates] = useState(["", "", "", "", ""]);
  const [dayStartLocal, setDayStartLocal] = useState("08:00");
  const [timeZone, setTimeZone] = useState("America/New_York");
  const [result, setResult] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => LESSONS.map((lesson) => {
    const startOffset = (lesson - 1) * 135;
    const endOffset = startOffset + 120;
    return {
      lesson,
      start: localTimeFromOffset(dayStartLocal, startOffset),
      end: localTimeFromOffset(dayStartLocal, endOffset),
      breakAfter: lesson < 4 ? 15 : 0,
    };
  }), [dayStartLocal]);

  function setDate(index: number, value: string) {
    setTrainingDates((current) => current.map((date, currentIndex) => currentIndex === index ? value : date));
  }

  async function prepareOwnerUatCohort() {
    if (!ownerUatAuthorized) return;
    if (!window.confirm("Prepare the capacity-one, non-credit cohort bound to this exact Preview release and its expiring authorization evidence?")) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = await publishSchedule({
        action: "prepare_owner_uat",
        correlationId: crypto.randomUUID(),
      });
      if (!payload.cohortId) throw new Error("The exact-release cohort identifier was not returned.");
      setCohortId(payload.cohortId);
    } catch (preparationError) {
      setError(preparationError instanceof Error ? preparationError.message : "The exact-release owner UAT cohort could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const approved = window.confirm("Publish this five-day Class D cohort schedule and generate all 20 regulated live lesson sessions? Rescheduling is blocked after live activity begins.");
    if (!approved) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = await publishSchedule({ cohortId, instructorClerkUserId, trainingDates, dayStartLocal, timeZone });
      setResult(payload);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Class D schedule could not be published.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fdacs-live fdacs-schedule">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Class D Cohort Schedule Control</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>5 DAYS · 20 LIVE LESSONS</strong>
          <small>{ownerUatRequested ? "Exact-release owner UAT · non-credit" : "Schedule publishing remains behind the regulated production gate."}</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {result?.lessonCount === 20 ? <div className="fdacs-schedule__success">Schedule published with exactly 20 regulated live lesson sessions. Correlation ID: {result.correlationId ?? "recorded"}</div> : null}

      <section className="fdacs-schedule__grid">
        <section className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Publish cohort schedule</h2><span>controlled</span></div>
          <p className="fdacs-live__muted">Select the five actual instructional dates, local start time, Florida facility time zone, cohort, and licensed instructor account. The server creates four 120-minute live sessions for each day with 15-minute intervals between Lessons 1, 2, and 3.</p>
          <p className="fdacs-live__muted">The assigned instructor must first have a verified-active record in the <a href="/florida-security-training/admin/instructor-file">Class DI provisioning control</a>.</p>
          {ownerUatRequested ? (
            <div className="fdacs-live__panel">
              <strong>{ownerUatAuthorized ? "Exact-release owner UAT authorization is ready." : "Owner UAT remains fail closed."}</strong>
              <p>Prepare the capacity-one cohort from the controlled release and expiry values; do not enter or invent a cohort identifier.</p>
              <button type="button" disabled={busy || !ownerUatAuthorized} onClick={() => void prepareOwnerUatCohort()}>
                {busy ? "Preparing…" : cohortId ? "Reconfirm exact-release cohort" : "Prepare exact-release owner UAT cohort"}
              </button>
            </div>
          ) : null}
          <form className="fdacs-live__form fdacs-schedule__form" onSubmit={submit}>
            <label>Cohort UUID<input value={cohortId} onChange={(event) => setCohortId(event.target.value)} placeholder="00000000-0000-0000-0000-000000000000" readOnly={ownerUatRequested} required /></label>
            <label>Licensed instructor Clerk user ID<input value={instructorClerkUserId} onChange={(event) => setInstructorClerkUserId(event.target.value)} placeholder="user_..." required /></label>
            <div className="fdacs-schedule__dates">
              {DAYS.map((day, index) => <label key={day}>Day {day}<input type="date" value={trainingDates[index]} onChange={(event) => setDate(index, event.target.value)} required /></label>)}
            </div>
            <div className="fdacs-schedule__row">
              <label>Daily instruction start<input type="time" value={dayStartLocal} onChange={(event) => setDayStartLocal(event.target.value)} required /></label>
              <label>Facility time zone<select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option value="America/New_York">Florida Eastern · America/New_York</option><option value="America/Chicago">Florida Central · America/Chicago</option></select></label>
            </div>
            <button type="submit" disabled={busy || !cohortId}>{busy ? "Publishing…" : "Publish 5-day / 20-lesson schedule"}</button>
          </form>
        </section>

        <aside className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Daily timing preview</h2><span>8h instruction + 45m breaks</span></div>
          <div className="fdacs-schedule__preview">
            {preview.map((item) => <article key={item.lesson}><div><strong>Lesson {item.lesson}</strong><span>{item.start} – {item.end}</span></div><em>{item.breakAfter ? `${item.breakAfter}-minute tracked break after lesson` : "End of instructional day"}</em></article>)}
          </div>
          <p className="fdacs-live__fineprint">This preview is local facility time. The database stores the schedule as timezone-aware timestamps and records schedule revisions. Break intervals remain outside instructional credit.</p>
        </aside>
      </section>

      {result?.lessons?.length ? (
        <section className="fdacs-live__panel fdacs-schedule__results">
          <div className="fdacs-live__panel-head"><h2>Generated regulated sessions</h2><span>{result.lessons.length}</span></div>
          <div className="fdacs-schedule__session-list">
            {result.lessons.map((lesson) => <div key={lesson.live_session_id ?? lesson.lesson_id}><strong>{lesson.lesson_id}</strong><span>Day {lesson.training_day}</span><span>{lesson.scheduled_start_at ? new Date(lesson.scheduled_start_at).toLocaleString() : "Scheduled"}</span><code>{lesson.live_session_id}</code>{lesson.live_session_id ? <><a href={`/florida-security-training/admin/live/${encodeURIComponent(lesson.live_session_id)}`}>Instructor console</a><a href={`/florida-security-training/live/${encodeURIComponent(lesson.live_session_id)}`}>Student classroom</a></> : null}</div>)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
