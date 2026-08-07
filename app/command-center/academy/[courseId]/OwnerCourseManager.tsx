"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ACADEMY_OWNER_CONTROL_URL,
  type AcademyCourseControl,
  type AcademyCourseDocument,
  type AcademyCourseLifecycle,
} from "../../../../lib/academy-control-contracts";
import styles from "../../owner-command-center.module.css";

const lifecycleActions: Array<{
  lifecycle: AcademyCourseLifecycle;
  label: string;
  detail: string;
}> = [
  {
    lifecycle: "published",
    label: "Publish and enable purchasing",
    detail: "Show the course publicly and permit new Stripe checkout sessions.",
  },
  {
    lifecycle: "sales_paused",
    label: "Pause new sales",
    detail: "Keep the public detail page visible but block all new checkout sessions.",
  },
  {
    lifecycle: "unpublished",
    label: "Unpublish course",
    detail: "Remove the course from the public catalog and block new purchases while preserving existing learner access.",
  },
  {
    lifecycle: "cancelled",
    label: "Cancel future availability",
    detail: "Remove public access and purchasing. Existing entitlements, progress, assessments, and certificates remain preserved.",
  },
];

type OwnerEvent = {
  event_id: string;
  action: string;
  request_id: string;
  created_at: string;
  previous_state: unknown;
  next_state: unknown;
};

function lifecycleLabel(value: AcademyCourseLifecycle) {
  if (value === "published") return "Published";
  if (value === "sales_paused") return "Sales paused";
  if (value === "unpublished") return "Unpublished";
  return "Cancelled";
}

function cloneDocument(document: AcademyCourseDocument): AcademyCourseDocument {
  return JSON.parse(JSON.stringify(document)) as AcademyCourseDocument;
}

export default function OwnerCourseManager({
  initialDocument,
  initialControl,
  initialContentRevision,
  events,
}: {
  initialDocument: AcademyCourseDocument;
  initialControl: AcademyCourseControl;
  initialContentRevision: number;
  events: OwnerEvent[];
}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [document, setDocument] = useState(() => cloneDocument(initialDocument));
  const [control, setControl] = useState(initialControl);
  const [contentRevision, setContentRevision] = useState(initialContentRevision);
  const [activeView, setActiveView] = useState<"overview" | "assessment" | "advanced" | number>("overview");
  const [reason, setReason] = useState(initialControl.reason ?? "");
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(initialDocument, null, 2));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const activeLesson = typeof activeView === "number" ? document.lessons[activeView] : null;
  const changed = useMemo(
    () => JSON.stringify(document) !== JSON.stringify(initialDocument),
    [document, initialDocument],
  );

  async function ownerFetch(path: string, init: RequestInit) {
    const token = await getToken();
    if (!token) throw new Error("The owner session could not be verified.");
    const response = await fetch(`${ACADEMY_OWNER_CONTROL_URL}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-obserra-request-id": crypto.randomUUID(),
        ...(init.headers ?? {}),
      },
    });
    const payload = await response.json() as Record<string, unknown> & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "The owner control service rejected the request.");
    return payload;
  }

  async function saveDocument(nextDocument = document) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const payload = await ownerFetch(`/courses/${document.course.id}/content`, {
        method: "PUT",
        body: JSON.stringify({
          document: nextDocument,
          expectedRevision: contentRevision,
          requestId: crypto.randomUUID(),
        }),
      });
      const content = payload.content as { revision?: number; contentHash?: string } | undefined;
      if (!content || !Number.isSafeInteger(content.revision)) throw new Error("The saved revision was not returned.");
      setDocument(cloneDocument(nextDocument));
      setJsonDraft(JSON.stringify(nextDocument, null, 2));
      setContentRevision(content.revision as number);
      setNotice(`Course content saved as revision ${content.revision}.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Course content could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAdvancedJson() {
    try {
      const parsed = JSON.parse(jsonDraft) as AcademyCourseDocument;
      if (parsed.schemaVersion !== "1.0" || parsed.course?.id !== document.course.id) {
        throw new Error("The course package schema or course identity does not match this course.");
      }
      await saveDocument(parsed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The advanced course package is invalid JSON.");
    }
  }

  async function applyLifecycle(lifecycle: AcademyCourseLifecycle) {
    if (busy) return;
    const action = lifecycleActions.find((item) => item.lifecycle === lifecycle);
    if (!action) return;
    if (lifecycle === "cancelled" && reason.trim().length < 3) {
      setError("A cancellation reason is required.");
      return;
    }
    if (!window.confirm(`${action.label}\n\n${action.detail}\n\nContinue?`)) return;

    setBusy(true);
    setNotice("");
    setError("");
    try {
      const payload = await ownerFetch(`/courses/${document.course.id}/control`, {
        method: "POST",
        body: JSON.stringify({
          lifecycle,
          reason: reason.trim() || null,
          expectedRevision: control.revision,
          requestId: crypto.randomUUID(),
        }),
      });
      const raw = payload.control as Record<string, unknown> | undefined;
      if (!raw) throw new Error("The updated control state was not returned.");
      const nextControl: AcademyCourseControl = {
        courseId: document.course.id,
        lifecycle: raw.lifecycle as AcademyCourseLifecycle,
        publicVisible: raw.public_visible === true,
        purchaseEnabled: raw.purchase_enabled === true,
        preserveExistingEntitlements: true,
        revision: Number(raw.revision),
        updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : null,
        reason: typeof raw.reason === "string" ? raw.reason : null,
      };
      setControl(nextControl);
      setNotice(
        `${lifecycleLabel(nextControl.lifecycle)} applied. Existing learner entitlements remain preserved.`,
      );
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The course lifecycle could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  function updateCourseField<Key extends keyof AcademyCourseDocument["course"]>(
    key: Key,
    value: AcademyCourseDocument["course"][Key],
  ) {
    setDocument((current) => ({
      ...current,
      course: { ...current.course, [key]: value },
    }));
  }

  function updateLessonField<Key extends keyof AcademyCourseDocument["lessons"][number]>(
    index: number,
    key: Key,
    value: AcademyCourseDocument["lessons"][number][Key],
  ) {
    setDocument((current) => ({
      ...current,
      lessons: current.lessons.map((lesson, lessonIndex) => (
        lessonIndex === index ? { ...lesson, [key]: value } : lesson
      )),
    }));
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrapWide}>
        <header className={styles.reviewHeader}>
          <div className={styles.brandBlock}>
            <p className={styles.eyebrow}>OWNER COMMAND CENTER · COURSE CONTROL</p>
            <h1 className={styles.title}>{document.course.title}</h1>
            <p className={styles.intro}>{document.course.description}</p>
            <div className={styles.courseMeta}>
              <span>{document.course.department}</span>
              <span>{document.course.level}</span>
              <span>{document.course.duration}</span>
              <span>{document.lessons.length} lessons</span>
              <span>{document.assessment.length} assessment questions</span>
              <span>${document.course.price}</span>
              <span>Content r{contentRevision}</span>
              <span>Control r{control.revision}</span>
            </div>
            <nav className={styles.navLinks} aria-label="Owner course controls">
              <Link className={styles.navLink} href="/command-center/academy">All courses</Link>
              <Link className={styles.navLink} href={`/command-center/academy/${document.course.id}/certificate`}>Certificate sample</Link>
              {control.publicVisible ? (
                <Link className={styles.navLink} href={`/academy/${document.course.id}`} target="_blank">Public sales page</Link>
              ) : null}
            </nav>
          </div>
          <span className={styles.statusPill}>{lifecycleLabel(control.lifecycle)}</span>
        </header>

        <section className={styles.controlPanel} aria-label="Publication and purchasing controls">
          <div>
            <p className={styles.eyebrow}>LIVE PUBLICATION CONTROL</p>
            <h2>Control public access and future purchasing.</h2>
            <p>
              Current state: <strong>{lifecycleLabel(control.lifecycle)}</strong>. Public visibility is
              {control.publicVisible ? " enabled" : " disabled"}; new purchasing is
              {control.purchaseEnabled ? " enabled" : " blocked"}.
            </p>
          </div>
          <label className={styles.reasonField}>
            <span>Owner reason or change record</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={1_000}
              placeholder="Document the operational reason for pausing, unpublishing, cancelling, or restoring this course."
            />
          </label>
          <div className={styles.controlActions}>
            {lifecycleActions.map((action) => (
              <button
                key={action.lifecycle}
                type="button"
                disabled={busy || action.lifecycle === control.lifecycle}
                onClick={() => void applyLifecycle(action.lifecycle)}
              >
                <strong>{action.label}</strong>
                <span>{action.detail}</span>
              </button>
            ))}
          </div>
          <div className={styles.preservationNotice}>
            <strong>Existing purchase commitment</strong>
            <p>
              Every lifecycle action in this control plane preserves existing entitlements, learner progress,
              assessment results, and issued certificates. This course can be removed from public access and
              future purchase without disabling customers who already paid.
            </p>
          </div>
        </section>

        {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
        {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

        <div className={styles.reviewLayout}>
          <aside className={styles.lessonNav} aria-label="Course content navigation">
            <button
              type="button"
              className={`${styles.lessonButton} ${activeView === "overview" ? styles.activeLesson : ""}`}
              onClick={() => setActiveView("overview")}
            >
              <span>00</span><span><strong>Course overview</strong><small>Sales and catalog fields</small></span>
            </button>
            {document.lessons.map((lesson, index) => (
              <button
                key={`${index}-${lesson.title}`}
                type="button"
                className={`${styles.lessonButton} ${activeView === index ? styles.activeLesson : ""}`}
                onClick={() => setActiveView(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{lesson.title}</strong><small>{lesson.format} · {lesson.videoDuration}</small></span>
              </button>
            ))}
            <button
              type="button"
              className={`${styles.lessonButton} ${activeView === "assessment" ? styles.activeLesson : ""}`}
              onClick={() => setActiveView("assessment")}
            >
              <span>FA</span><span><strong>Final assessment</strong><small>Questions and answer key</small></span>
            </button>
            <button
              type="button"
              className={`${styles.lessonButton} ${activeView === "advanced" ? styles.activeLesson : ""}`}
              onClick={() => {
                setJsonDraft(JSON.stringify(document, null, 2));
                setActiveView("advanced");
              }}
            >
              <span>{"{}"}</span><span><strong>Advanced package editor</strong><small>Edit every governed field</small></span>
            </button>
          </aside>

          <article className={styles.reviewContent}>
            {activeView === "overview" ? (
              <>
                <header className={styles.contentHeader}>
                  <p className={styles.eyebrow}>COURSE OVERVIEW EDITOR</p>
                  <h1>Public catalog and commercial course fields</h1>
                  <p>These fields update the controlled website catalog, course page, and new Stripe checkout description after save.</p>
                </header>
                <div className={styles.formGrid}>
                  <label><span>Course title</span><input value={document.course.title} onChange={(event) => updateCourseField("title", event.target.value)} /></label>
                  <label><span>Price in USD</span><input type="number" min="1" step="1" value={document.course.price} onChange={(event) => updateCourseField("price", Number(event.target.value))} /></label>
                  <label><span>Published duration</span><input value={document.course.duration} onChange={(event) => updateCourseField("duration", event.target.value)} /></label>
                  <label><span>Track</span><input value={document.course.track} onChange={(event) => updateCourseField("track", event.target.value)} /></label>
                  <label className={styles.formWide}><span>Audience</span><textarea value={document.course.audience} onChange={(event) => updateCourseField("audience", event.target.value)} /></label>
                  <label className={styles.formWide}><span>Description</span><textarea value={document.course.description} onChange={(event) => updateCourseField("description", event.target.value)} /></label>
                </div>
                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>OUTCOMES</p>
                  <ol className={styles.numberedList}>{document.course.outcomes.map((outcome, index) => <li key={`${index}-${outcome}`}>{outcome}</li>)}</ol>
                </section>
                <section className={styles.contentSection}>
                  <p className={styles.eyebrow}>MODULES</p>
                  <ol className={styles.numberedList}>{document.course.modules.map((module, index) => <li key={`${index}-${module.title}`}><strong>{module.title}</strong><p>{module.description}</p><small>{module.format} · {module.duration}</small></li>)}</ol>
                </section>
                <button className={styles.saveButton} type="button" disabled={busy || !changed} onClick={() => void saveDocument()}>
                  {busy ? "Saving…" : "Save course overview and content package"}
                </button>
              </>
            ) : activeLesson && typeof activeView === "number" ? (
              <>
                <header className={styles.contentHeader}>
                  <p className={styles.eyebrow}>LESSON {String(activeView + 1).padStart(2, "0")}</p>
                  <h1>{activeLesson.title}</h1>
                  <p>{activeLesson.focus}</p>
                </header>
                <div className={styles.formGrid}>
                  <label className={styles.formWide}><span>Lesson title</span><input value={activeLesson.title} onChange={(event) => updateLessonField(activeView, "title", event.target.value)} /></label>
                  <label className={styles.formWide}><span>Lesson focus</span><textarea value={activeLesson.focus} onChange={(event) => updateLessonField(activeView, "focus", event.target.value)} /></label>
                  <label className={styles.formWide}><span>Why this matters</span><textarea value={activeLesson.whyItMatters} onChange={(event) => updateLessonField(activeView, "whyItMatters", event.target.value)} /></label>
                  <label><span>Observe</span><textarea value={activeLesson.observe} onChange={(event) => updateLessonField(activeView, "observe", event.target.value)} /></label>
                  <label><span>Decide</span><textarea value={activeLesson.decide} onChange={(event) => updateLessonField(activeView, "decide", event.target.value)} /></label>
                  <label><span>Act</span><textarea value={activeLesson.act} onChange={(event) => updateLessonField(activeView, "act", event.target.value)} /></label>
                  <label className={styles.formWide}><span>Applied scenario</span><textarea value={activeLesson.scenario} onChange={(event) => updateLessonField(activeView, "scenario", event.target.value)} /></label>
                </div>

                <section className={styles.contentSection}><p className={styles.eyebrow}>GUIDED VIDEO AND TRANSCRIPT</p><h2>{activeLesson.videoTitle}</h2><ul className={styles.timeline}>{activeLesson.videoChapters.map((chapter) => <li key={`${chapter.timestamp}-${chapter.title}`}><span>{chapter.timestamp}</span><div><strong>{chapter.title}</strong><p>{chapter.narration}</p></div></li>)}</ul><details className={styles.transcript}><summary>Complete transcript</summary>{activeLesson.transcript.map((line, index) => <p key={`${index}-${line.slice(0, 20)}`}>{line}</p>)}</details></section>
                <section className={styles.contentSection}><p className={styles.eyebrow}>PROFESSIONAL INSTRUCTION</p><div className={styles.contentGridTwo}>{activeLesson.instruction.map((section) => <div className={styles.contentCard} key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p><strong>Application</strong><p>{section.application}</p></div>)}</div></section>
                <section className={styles.contentSection}><p className={styles.eyebrow}>GUIDED PRACTICE AND EVIDENCE</p><ol className={styles.numberedList}>{activeLesson.guidedPractice.map((step) => <li key={step.title}><strong>{step.title}</strong><p>{step.instruction}</p><small>Evidence: {step.evidence}</small></li>)}</ol></section>
                <section className={styles.contentSection}><p className={styles.eyebrow}>AUTHORITATIVE GROUNDING</p><div className={styles.sourceGrid}>{activeLesson.authorities.map((authority) => <div className={styles.sourceCard} key={authority.reference}><strong>{authority.publisher}</strong><h3>{authority.reference}</h3><p>{authority.whyItMatters}</p><a href={authority.url} target="_blank" rel="noreferrer">Open source</a></div>)}</div></section>
                <section className={styles.contentSection}><p className={styles.eyebrow}>KNOWLEDGE CHECK AND ANSWER KEY</p><h2>{activeLesson.check.question}</h2><ol className={styles.optionList}>{activeLesson.check.options.map((option, index) => <li className={index === activeLesson.check.answer ? styles.correctOption : ""} key={`${index}-${option}`}><strong>{String.fromCharCode(65 + index)}.</strong> {option}{index === activeLesson.check.answer ? " · CORRECT" : ""}</li>)}</ol><div className={styles.answerExplanation}><strong>Explanation</strong><p>{activeLesson.check.explanation}</p></div></section>
                <button className={styles.saveButton} type="button" disabled={busy || !changed} onClick={() => void saveDocument()}>{busy ? "Saving…" : "Save lesson changes"}</button>
              </>
            ) : activeView === "assessment" ? (
              <>
                <header className={styles.contentHeader}><p className={styles.eyebrow}>FINAL ASSESSMENT · OWNER ANSWER KEY</p><h1>{document.course.title}</h1><p>Review all questions, correct answers, and rationales. Use the advanced package editor to change the complete assessment data.</p></header>
                <ol className={styles.assessmentList}>{document.assessment.map((question, questionIndex) => <li className={styles.assessmentQuestion} key={`${questionIndex}-${question.question}`}><h3>{question.question}</h3><ol className={styles.optionList}>{question.options.map((option, optionIndex) => <li className={optionIndex === question.answer ? styles.correctOption : ""} key={`${optionIndex}-${option}`}><strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}{optionIndex === question.answer ? " · CORRECT" : ""}</li>)}</ol><div className={styles.answerExplanation}><strong>Rationale</strong><p>{question.explanation}</p></div></li>)}</ol>
              </>
            ) : (
              <>
                <header className={styles.contentHeader}><p className={styles.eyebrow}>ADVANCED FULL-PACKAGE EDITOR</p><h1>Edit every course, lesson, source, practice, assessment, and answer-key field.</h1><p>The service validates schema version, course identity, module-to-lesson parity, assessment presence, size, depth, and revision before committing.</p></header>
                <textarea className={styles.jsonEditor} value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} spellCheck={false} aria-label="Complete Academy course JSON package" />
                <button className={styles.saveButton} type="button" disabled={busy} onClick={() => void saveAdvancedJson()}>{busy ? "Validating and saving…" : "Validate and save full course package"}</button>
              </>
            )}
          </article>
        </div>

        <section className={styles.auditPanel}>
          <p className={styles.eyebrow}>RECENT AUDIT HISTORY</p>
          <h2>Owner course-control events</h2>
          {events.length ? (
            <ol>{events.map((event) => <li key={event.event_id}><strong>{event.action}</strong><span>{new Date(event.created_at).toLocaleString()}</span><small>Request {event.request_id}</small></li>)}</ol>
          ) : <p>No owner course-control mutations have been recorded for this course.</p>}
        </section>
      </div>
    </main>
  );
}
