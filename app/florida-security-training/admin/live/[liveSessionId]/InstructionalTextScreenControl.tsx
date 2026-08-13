"use client";

import { FormEvent, useMemo, useState } from "react";

type TextScreen = {
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

type Student = { id?: string };

async function adminApi(body: Record<string, unknown>) {
  const response = await fetch("/api/florida-class-d/admin/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Instructor text-screen request failed.");
  return payload;
}

function formatSeconds(value: number) {
  const safe = Math.max(0, Math.floor(value));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function InstructionalTextScreenControl({
  liveSessionId,
  status,
  isBreak,
  activeTextScreen,
  textScreenViews,
  students,
  onChanged,
}: {
  liveSessionId: string;
  status: string;
  isBreak: boolean;
  activeTextScreen?: TextScreen | null;
  textScreenViews?: TextScreenView[];
  students?: Student[];
  onChanged: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [discussionNote, setDiscussionNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const views = textScreenViews ?? [];
  const counts = useMemo(() => ({
    roster: (students ?? []).filter((student) => Boolean(student.id)).length,
    viewed: views.length,
    timeMet: views.filter((view) => Boolean(view.requirement_met_at)).length,
    acknowledged: views.filter((view) => Boolean(view.acknowledged_at)).length,
  }), [students, views]);

  async function openScreen(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi({
        action: "text_screen_open",
        liveSessionId,
        textScreenTitle: title.trim(),
        textScreenBody: body.trim(),
      });
      setTitle("");
      setBody("");
      await onChanged();
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Instructional text screen could not be opened.");
    } finally {
      setBusy(false);
    }
  }

  async function closeScreen(event: FormEvent) {
    event.preventDefault();
    if (!activeTextScreen?.id || discussionNote.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi({
        action: "text_screen_close",
        textScreenId: activeTextScreen.id,
        discussionNote: discussionNote.trim(),
      });
      setDiscussionNote("");
      await onChanged();
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : "Instructional text screen could not be closed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="fdacs-live__panel fdacs-live__text-screen-admin">
      <div className="fdacs-live__panel-head">
        <h2>Instructional text screen</h2>
        <span>{activeTextScreen ? "open" : "ready"}</span>
      </div>
      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {activeTextScreen ? (
        <div>
          <h3>{activeTextScreen.title}</h3>
          <p className="fdacs-live__muted">{activeTextScreen.word_count ?? 0} words · server minimum {formatSeconds(activeTextScreen.minimum_seconds ?? 0)}</p>
          <div className="fdacs-live__timecards">
            <article><span>Roster</span><strong>{counts.roster}</strong></article>
            <article><span>Views started</span><strong>{counts.viewed}</strong></article>
            <article><span>Minimum met</span><strong>{counts.timeMet}</strong></article>
            <article><span>Acknowledged</span><strong>{counts.acknowledged}</strong></article>
          </div>
          <div className="fdacs-live__text-screen-body">{activeTextScreen.body}</div>
          <form className="fdacs-live__form" onSubmit={closeScreen}>
            <label>
              Instructor discussion confirmation
              <textarea
                value={discussionNote}
                onChange={(event) => setDiscussionNote(event.target.value)}
                placeholder="Document the live instructor discussion of this text before closing the screen."
                maxLength={1000}
              />
            </label>
            <button type="submit" disabled={busy || discussionNote.trim().length < 3}>
              {busy ? "Recording..." : "Confirm discussion and close screen"}
            </button>
            <small>The database requires this discussion confirmation. Closing does not fabricate learner acknowledgments; incomplete learner evidence remains visible for review.</small>
          </form>
        </div>
      ) : (
        <form className="fdacs-live__form" onSubmit={openScreen}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Instructional text title" maxLength={240} />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Instructional text shown to the live class" maxLength={12000} />
          <button type="submit" disabled={busy || status !== "live" || isBreak || title.trim().length < 3 || body.trim().length < 10}>
            {busy ? "Opening..." : "Open timed instructional text"}
          </button>
          <small>The authoritative word count and minimum display duration are calculated by the server/database. A text screen can open only during active instruction, not during a break.</small>
        </form>
      )}
    </section>
  );
}
