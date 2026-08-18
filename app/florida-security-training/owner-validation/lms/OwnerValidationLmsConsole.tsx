"use client";

import {
  FileLock2,
  FileUp,
  Film,
  Image as ImageIcon,
  Presentation,
  Radio,
  ShieldCheck,
  Square,
  UsersRound,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

const DAILY_API = "/api/florida-class-d/owner-validation/daily";
const COURSEWARE_API = "/api/florida-class-d/owner-validation/courseware";

type View = "live";

type DailyAccess = {
  provider: "daily";
  roomName: string;
  instructorJoinUrl: string;
  participantJoinUrls: string[];
  roomExpiresAt: string;
  ownerOnly: true;
  trainingCreditEligible: false;
};

type Courseware = {
  objectPath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  mediaKind: "powerpoint" | "slides" | "image" | "video";
  createdAt: string | null;
};

type CoursewareView = Courseware & { signedViewUrl: string };

async function payload(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(parsed);
}

function displayBytes(value: number) {
  if (!Number.isFinite(value) || value < 1) return "size unavailable";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function contentTypeFor(file: File) {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

async function deleteDailyRoom(roomName: string, keepalive = false) {
  const response = await fetch(DAILY_API, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ roomName }),
    cache: "no-store",
    keepalive,
  });
  if (!response.ok) {
    const result = await payload(response);
    throw new Error(typeof result.error === "string" ? result.error : "Daily room cleanup failed.");
  }
}

export default function OwnerValidationLmsConsole({
  initialView,
  releaseCommitSha,
}: {
  initialView: View;
  releaseCommitSha: string;
}) {
  const [daily, setDaily] = useState<DailyAccess | null>(null);
  const [dailyBusy, setDailyBusy] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [courseware, setCourseware] = useState<Courseware[]>([]);
  const [coursewareView, setCoursewareView] = useState<CoursewareView | null>(null);
  const [coursewareBusy, setCoursewareBusy] = useState(false);
  const [coursewareError, setCoursewareError] = useState<string | null>(null);
  const roomNameRef = useRef<string | null>(null);

  void initialView;

  async function refreshCourseware() {
    const response = await fetch(COURSEWARE_API, { cache: "no-store" });
    const result = await payload(response);
    if (!response.ok || !Array.isArray(result.courseware)) {
      throw new Error(typeof result.error === "string" ? result.error : "Protected courseware inventory is unavailable.");
    }
    setCourseware(result.courseware as Courseware[]);
  }

  async function createDailyRoom() {
    setDailyBusy(true);
    setDailyError(null);
    try {
      if (roomNameRef.current) await deleteDailyRoom(roomNameRef.current);
      roomNameRef.current = null;
      setDaily(null);
      const response = await fetch(DAILY_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      });
      const result = await payload(response);
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Daily classroom could not be created.");
      const access = result as unknown as DailyAccess;
      if (access.provider !== "daily" || !access.roomName || !access.instructorJoinUrl || access.ownerOnly !== true) {
        throw new Error("Daily returned incomplete owner access.");
      }
      roomNameRef.current = access.roomName;
      setDaily(access);
    } catch (error) {
      setDailyError(error instanceof Error ? error.message : "Daily classroom could not be created.");
    } finally {
      setDailyBusy(false);
    }
  }

  async function closeDailyRoom() {
    const roomName = roomNameRef.current;
    if (!roomName) return;
    setDailyBusy(true);
    setDailyError(null);
    try {
      await deleteDailyRoom(roomName);
      roomNameRef.current = null;
      setDaily(null);
    } catch (error) {
      setDailyError(error instanceof Error ? error.message : "Daily room cleanup failed.");
    } finally {
      setDailyBusy(false);
    }
  }

  async function presentCourseware(item: Courseware) {
    setCoursewareBusy(true);
    setCoursewareError(null);
    try {
      const response = await fetch(COURSEWARE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "create-view", objectPath: item.objectPath }),
        cache: "no-store",
      });
      const result = await payload(response);
      if (!response.ok || typeof result.signedViewUrl !== "string") {
        throw new Error(typeof result.error === "string" ? result.error : "Protected courseware view is unavailable.");
      }
      setCoursewareView({ ...item, signedViewUrl: result.signedViewUrl });
    } catch (error) {
      setCoursewareError(error instanceof Error ? error.message : "Protected courseware view is unavailable.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  async function uploadCourseware(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCoursewareBusy(true);
    setCoursewareError(null);
    try {
      const ticketResponse = await fetch(COURSEWARE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create-upload",
          fileName: file.name,
          contentType: contentTypeFor(file),
          sizeBytes: file.size,
        }),
        cache: "no-store",
      });
      const ticket = await payload(ticketResponse);
      if (!ticketResponse.ok || typeof ticket.objectPath !== "string" || typeof ticket.signedUploadUrl !== "string") {
        throw new Error(typeof ticket.error === "string" ? ticket.error : "Courseware upload authorization failed.");
      }

      const uploadBody = new FormData();
      uploadBody.append("cacheControl", "0");
      uploadBody.append("", file);
      const uploadResponse = await fetch(ticket.signedUploadUrl, {
        method: "PUT",
        headers: { "x-upsert": "false" },
        body: uploadBody,
      });
      if (!uploadResponse.ok) throw new Error("The protected courseware upload did not complete.");

      const finalizeResponse = await fetch(COURSEWARE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "finalize", objectPath: ticket.objectPath }),
        cache: "no-store",
      });
      const finalized = await payload(finalizeResponse);
      if (!finalizeResponse.ok || !finalized.courseware) {
        throw new Error(typeof finalized.error === "string" ? finalized.error : "Uploaded courseware verification failed.");
      }
      const item = finalized.courseware as Courseware;
      await refreshCourseware();
      await presentCourseware(item);
    } catch (error) {
      setCoursewareError(error instanceof Error ? error.message : "Protected courseware upload failed.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  async function removeCourseware(item: Courseware) {
    setCoursewareBusy(true);
    setCoursewareError(null);
    try {
      const response = await fetch(COURSEWARE_API, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ objectPath: item.objectPath }),
        cache: "no-store",
      });
      const result = await payload(response);
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Courseware deletion failed.");
      if (coursewareView?.objectPath === item.objectPath) setCoursewareView(null);
      await refreshCourseware();
    } catch (error) {
      setCoursewareError(error instanceof Error ? error.message : "Courseware deletion failed.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  useEffect(() => {
    let active = true;

    void fetch(COURSEWARE_API, { cache: "no-store" })
      .then(async (response) => {
        const result = await payload(response);
        if (!response.ok || !Array.isArray(result.courseware)) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : "Protected courseware inventory is unavailable.",
          );
        }
        if (active) setCourseware(result.courseware as Courseware[]);
      })
      .catch((error: unknown) => {
        if (active) {
          setCoursewareError(
            error instanceof Error
              ? error.message
              : "Protected courseware inventory is unavailable.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = () => {
      const roomName = roomNameRef.current;
      if (!roomName) return;
      roomNameRef.current = null;
      void deleteDailyRoom(roomName, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", cleanup);
    return () => {
      window.removeEventListener("pagehide", cleanup);
      cleanup();
    };
  }, []);

  return (
    <div className="owner-preview__shell">
      <aside className="owner-preview__sidebar">
        <div className="owner-preview__brand">
          <span>OBSERRA</span>
          <small>EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</small>
          <b>OWNER LMS TEST</b>
        </div>
        <div className="owner-preview__sidebar-boundary">
          <FileLock2 size={18} />
          <span><strong>AAL2 owner test boundary</strong>Real providers are enabled. Enrollment, attendance credit, completion, certificates, and LIAS remain disabled.</span>
        </div>
      </aside>

      <div className="owner-preview__workspace">
        <header className="owner-preview__topbar">
          <div><span className="owner-preview__kicker">LIVE FUNCTIONAL TEST</span><h1>Florida Class D LMS classroom</h1></div>
          <div className="owner-preview__release"><span>Exact release</span><strong>{releaseCommitSha.slice(0, 12)}</strong><small>Vercel bound</small></div>
        </header>

        <div className="owner-preview__watermark-inline"><ShieldCheck size={15} /> REAL SERVICES · OWNER AAL2 · NON CREDIT</div>

        <div className="owner-preview__content">
          <div className="owner-preview__panel-stack">
            <div className="owner-preview__live-grid">
              <section className="owner-preview__card owner-preview__video-card">
                <div className="owner-preview__section-head">
                  <div><span className="owner-preview__kicker">LIVE CLASSROOM</span><h2>Private Daily instructor room</h2></div>
                  <span className={`owner-preview__pill ${daily ? "is-live" : ""}`}><Radio size={15} /> {daily ? "room open" : "room closed"}</span>
                </div>
                <div className="owner-preview__video-frame">
                  {daily?.instructorJoinUrl ? (
                    <iframe title="Owner Daily instructor classroom" src={daily.instructorJoinUrl} allow="camera; microphone; fullscreen; display-capture; autoplay" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="owner-preview__video-empty">
                      <Video size={44} aria-hidden="true" />
                      <strong>No classroom is open</strong>
                      <p>Create a real private Daily room for one instructor and up to three owner controlled learner views.</p>
                      <button type="button" onClick={() => void createDailyRoom()} disabled={dailyBusy}><Video size={17} /> {dailyBusy ? "Provisioning..." : "Create live classroom"}</button>
                    </div>
                  )}
                </div>
                {dailyError ? <div className="owner-preview__error" role="alert"><XCircle size={18} /> {dailyError}</div> : null}
                {daily ? (
                  <>
                    <div className="owner-preview__daily-actions">
                      <span><ShieldCheck size={16} /> Expires {formatDateTime(daily.roomExpiresAt)} · recording off · owner only</span>
                      <button type="button" onClick={() => void closeDailyRoom()} disabled={dailyBusy}><Square size={15} /> End and delete room</button>
                    </div>
                    <div className="owner-preview__participant-links" aria-label="Owner controlled learner test views">
                      {daily.participantJoinUrls.map((url, index) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer"><UsersRound size={16} /> Open learner view {index + 1}</a>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>

              <aside className="owner-preview__card owner-preview__live-controls">
                <span className="owner-preview__kicker">SECURITY BOUNDARY</span>
                <h2>Real providers, no regulated learner writes</h2>
                <div className="owner-preview__control-ledger">
                  {[["Identity", "Supabase AAL2 owner"], ["Video", "Daily private room"], ["Storage", "Private Supabase bucket"], ["Release", "Exact Vercel SHA"], ["Recording", "Disabled"], ["Training credit", "Disabled"]].map(([name, value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}
                </div>
              </aside>
            </div>

            <section className="owner-preview__card owner-preview__courseware">
              <div className="owner-preview__section-head">
                <div><span className="owner-preview__kicker">COURSEWARE STAGE</span><h2>Upload and present instructional media</h2></div>
                <label className="owner-preview__upload-button">
                  <FileUp size={17} /> {coursewareBusy ? "Working..." : "Upload courseware"}
                  <input type="file" accept=".pptx,.pdf,.png,.jpg,.jpeg,.webp,.mp4,.webm" disabled={coursewareBusy} onChange={(event) => void uploadCourseware(event)} />
                </label>
              </div>
              {coursewareError ? <div className="owner-preview__error" role="alert"><XCircle size={18} /> {coursewareError}</div> : null}

              <div className="owner-preview__courseware-layout">
                <div className="owner-preview__courseware-stage">
                  {coursewareView ? (
                    <>
                      <div className="owner-preview__courseware-stage-head"><span>{coursewareView.fileName}</span><small>{displayBytes(coursewareView.sizeBytes)} · private signed view</small></div>
                      {coursewareView.mediaKind === "video" ? <video src={coursewareView.signedViewUrl} controls playsInline controlsList="nodownload" /> : null}
                      {coursewareView.mediaKind === "slides" || coursewareView.mediaKind === "image" ? <iframe title={`Courseware presentation: ${coursewareView.fileName}`} src={coursewareView.signedViewUrl} referrerPolicy="no-referrer" /> : null}
                      {coursewareView.mediaKind === "powerpoint" ? (
                        <div className="owner-preview__powerpoint-stage"><Presentation size={52} /><strong>PowerPoint ready</strong><p>Open the protected file in PowerPoint and share the slide show through Daily.</p><a href={coursewareView.signedViewUrl} target="_blank" rel="noreferrer"><Presentation size={17} /> Open protected PowerPoint</a></div>
                      ) : null}
                    </>
                  ) : (
                    <div className="owner-preview__courseware-empty"><ImageIcon size={44} /><strong>No courseware selected</strong><p>Upload or select protected instructional media.</p></div>
                  )}
                </div>

                <div className="owner-preview__courseware-list" aria-label="Protected owner courseware">
                  {courseware.length ? courseware.map((item) => (
                    <article key={item.objectPath} className={coursewareView?.objectPath === item.objectPath ? "is-active" : ""}>
                      <button type="button" className="owner-preview__courseware-select" disabled={coursewareBusy} onClick={() => void presentCourseware(item)}>
                        {item.mediaKind === "video" ? <Film size={19} /> : item.mediaKind === "powerpoint" ? <Presentation size={19} /> : <ImageIcon size={19} />}
                        <span><strong>{item.fileName}</strong><small>{item.mediaKind} · {displayBytes(item.sizeBytes)}</small></span>
                      </button>
                      <button type="button" className="owner-preview__courseware-delete" aria-label={`Delete ${item.fileName}`} disabled={coursewareBusy} onClick={() => void removeCourseware(item)}>Delete</button>
                    </article>
                  )) : (
                    <div className="owner-preview__courseware-empty"><FileUp size={32} /><strong>No protected media uploaded</strong><p>PPTX, PDF, images, MP4, and WEBM are supported up to 100 MB.</p></div>
                  )}
                </div>
              </div>

              <div className="owner-preview__notice"><FileLock2 size={20} /><span><strong>Owner rehearsal only.</strong>Provider actions do not create enrollment, attendance, instructional time, training credit, completion, certificate, or LIAS records.</span></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
