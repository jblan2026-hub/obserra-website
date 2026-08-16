"use client";

import {
  Activity,
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  Database,
  FileLock2,
  FileUp,
  Film,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  MonitorUp,
  Presentation,
  Radio,
  ScreenShare,
  ShieldCheck,
  Square,
  Trash2,
  UsersRound,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { FloridaClassDOwnerPreviewState } from "../../../lib/florida-class-d-owner-preview-state-contract";

const DAILY_API = "/api/florida-class-d/owner-preview/daily";
const COURSEWARE_API = "/api/florida-class-d/owner-preview/courseware";
const ACTIVATION_REQUEST_API = "/api/florida-class-d/owner-preview/activation-request";

type View = "overview" | "roster" | "live" | "attendance" | "exam" | "completion" | "activation";

type DailyAccess = {
  provider: "daily";
  roomName: string;
  instructorJoinUrl: string;
  participantJoinUrl: string;
  participantJoinUrls: string[];
  roomExpiresAt: string;
  tokenExpiresAt: string;
  maximumParticipants: 4;
  recordingEnabled: false;
  ownerOnly: true;
  trainingCreditEligible: false;
  attendanceCredited: false;
  instructionalTimeCredited: false;
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

type ActivationRequestStatus = {
  status: "denied" | "eligible_for_controlled_activation_review";
  error?: string;
  code?: string;
  blockingKeys?: string[];
  activationPerformed: false;
  productionRuntimeAuthorized: false;
  studentFrontendEnabled: false;
  studentBackendEnabled: false;
};

const views: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Cohort status", icon: LayoutDashboard },
  { id: "roster", label: "Roster", icon: UsersRound },
  { id: "live", label: "Live classroom", icon: Video },
  { id: "attendance", label: "Attendance and presence", icon: ClipboardCheck },
  { id: "exam", label: "Exam monitoring", icon: GraduationCap },
  { id: "completion", label: "Completion review", icon: BookOpenCheck },
  { id: "activation", label: "Activation request", icon: KeyRound },
];

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

function displayCount(value: number | null) {
  return value === null ? "Unavailable" : String(value);
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

function coursewareContentType(file: File) {
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

async function payload(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

async function deleteDailyRoomRequest(roomName: string, keepalive = false) {
  const response = await fetch(DAILY_API, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    keepalive,
    body: JSON.stringify({ roomName }),
  });
  if (!response.ok) {
    const result = await payload(response);
    throw new Error(typeof result.error === "string" ? result.error : "Daily room cleanup failed.");
  }
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="owner-preview__empty-state">
      <Database size={28} aria-hidden="true" />
      <span><strong>{title}</strong><small>{detail}</small></span>
    </div>
  );
}

export default function OwnerPreviewConsole({
  state,
  releaseCommitSha,
  authorizationExpiresAt,
  watermark,
}: {
  state: FloridaClassDOwnerPreviewState;
  releaseCommitSha: string;
  authorizationExpiresAt: string;
  watermark: string;
}) {
  const [activeView, setActiveView] = useState<View>("overview");
  const [daily, setDaily] = useState<DailyAccess | null>(null);
  const [dailyBusy, setDailyBusy] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [courseware, setCourseware] = useState<Courseware[]>([]);
  const [coursewareView, setCoursewareView] = useState<CoursewareView | null>(null);
  const [coursewareBusy, setCoursewareBusy] = useState(false);
  const [coursewareError, setCoursewareError] = useState<string | null>(null);
  const [schoolLicenseNumber, setSchoolLicenseNumber] = useState("");
  const [instructorLicenseNumber, setInstructorLicenseNumber] = useState("");
  const [activationBusy, setActivationBusy] = useState(false);
  const [activationStatus, setActivationStatus] = useState<ActivationRequestStatus | null>(null);
  const roomNameRef = useRef<string | null>(null);

  async function closeDailyRoom() {
    const roomName = roomNameRef.current;
    if (!roomName) return;
    setDailyBusy(true);
    setDailyError(null);
    try {
      await deleteDailyRoomRequest(roomName);
      roomNameRef.current = null;
      setDaily(null);
    } catch (error) {
      setDailyError(error instanceof Error ? error.message : "Daily room cleanup failed.");
    } finally {
      setDailyBusy(false);
    }
  }

  async function createDailyRoom() {
    setDailyBusy(true);
    setDailyError(null);
    try {
      if (roomNameRef.current) await deleteDailyRoomRequest(roomNameRef.current);
      roomNameRef.current = null;
      setDaily(null);
      const response = await fetch(DAILY_API, { method: "POST", headers: { "content-type": "application/json" }, cache: "no-store" });
      const result = await payload(response);
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Daily diagnostic room could not be created.");
      const access = result as unknown as DailyAccess;
      if (!access.roomName || !access.instructorJoinUrl || access.provider !== "daily" || access.ownerOnly !== true) {
        throw new Error("Daily returned incomplete owner access.");
      }
      roomNameRef.current = access.roomName;
      setDaily(access);
    } catch (error) {
      setDailyError(error instanceof Error ? error.message : "Daily diagnostic room could not be created.");
    } finally {
      setDailyBusy(false);
    }
  }

  async function refreshCourseware() {
    const response = await fetch(COURSEWARE_API, { cache: "no-store" });
    const result = await payload(response);
    if (!response.ok || !Array.isArray(result.courseware)) {
      throw new Error(typeof result.error === "string" ? result.error : "Protected courseware inventory is unavailable.");
    }
    setCourseware(result.courseware as Courseware[]);
  }

  async function presentCourseware(item: Courseware) {
    setCoursewareBusy(true);
    setCoursewareError(null);
    try {
      const response = await fetch(COURSEWARE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "create-view", objectPath: item.objectPath }),
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
      const contentType = coursewareContentType(file);
      const ticketResponse = await fetch(COURSEWARE_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "create-upload",
          fileName: file.name,
          contentType,
          sizeBytes: file.size,
        }),
      });
      const ticket = await payload(ticketResponse);
      if (
        !ticketResponse.ok
        || typeof ticket.objectPath !== "string"
        || typeof ticket.signedUploadUrl !== "string"
      ) {
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
        cache: "no-store",
        body: JSON.stringify({ action: "finalize", objectPath: ticket.objectPath }),
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

  async function deleteCourseware(item: Courseware) {
    setCoursewareBusy(true);
    setCoursewareError(null);
    try {
      const response = await fetch(COURSEWARE_API, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ objectPath: item.objectPath }),
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
    const cleanup = () => {
      const roomName = roomNameRef.current;
      if (!roomName) return;
      roomNameRef.current = null;
      void deleteDailyRoomRequest(roomName, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", cleanup);
    return () => { window.removeEventListener("pagehide", cleanup); cleanup(); };
  }, []);

  useEffect(() => {
    if (activeView !== "live") return;
    let cancelled = false;
    void fetch(COURSEWARE_API, { cache: "no-store" })
      .then(async (response) => ({ response, result: await payload(response) }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok || !Array.isArray(result.courseware)) {
          throw new Error(typeof result.error === "string" ? result.error : "Protected courseware inventory is unavailable.");
        }
        setCourseware(result.courseware as Courseware[]);
      })
      .catch((error: unknown) => {
        if (!cancelled) setCoursewareError(error instanceof Error ? error.message : "Protected courseware inventory is unavailable.");
      });
    return () => { cancelled = true; };
  }, [activeView]);

  useEffect(() => {
    if (!daily?.roomExpiresAt) return;
    const expiresAt = Date.parse(daily.roomExpiresAt);
    if (!Number.isFinite(expiresAt)) return;
    const roomName = daily.roomName;
    const timer = window.setTimeout(() => {
      setDailyBusy(true);
      setDailyError(null);
      void deleteDailyRoomRequest(roomName)
        .then(() => {
          if (roomNameRef.current === roomName) {
            roomNameRef.current = null;
            setDaily(null);
          }
        })
        .catch((error: unknown) => setDailyError(error instanceof Error ? error.message : "Daily room cleanup failed."))
        .finally(() => setDailyBusy(false));
    }, Math.max(1_000, expiresAt - Date.now() - 30_000));
    return () => window.clearTimeout(timer);
  }, [daily?.roomExpiresAt, daily?.roomName]);

  async function submitActivationRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivationBusy(true);
    setActivationStatus(null);
    try {
      const response = await fetch(ACTIVATION_REQUEST_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ schoolLicenseNumber, instructorLicenseNumber }),
      });
      const result = await payload(response) as unknown as ActivationRequestStatus;
      setActivationStatus({ ...result, status: result.status ?? "denied", activationPerformed: false, productionRuntimeAuthorized: false, studentFrontendEnabled: false, studentBackendEnabled: false });
    } catch {
      setActivationStatus({ status: "denied", error: "Activation request evaluation failed closed.", code: "FDACS_ACTIVATION_REQUEST_FAILED", activationPerformed: false, productionRuntimeAuthorized: false, studentFrontendEnabled: false, studentBackendEnabled: false });
    } finally {
      setSchoolLicenseNumber("");
      setInstructorLicenseNumber("");
      setActivationBusy(false);
    }
  }

  const dbReady = state.status === "ready";
  const noLearners = state.counts.studentIdentities === 0 && state.counts.enrollments === 0;

  function renderOverview() {
    return (
      <div className="owner-preview__panel-stack">
        <section className="owner-preview__metrics" aria-label="Authoritative FDACS database status">
          <article><UsersRound /><span>Enrollments</span><strong>{displayCount(state.counts.enrollments)}</strong><small>authoritative row count</small></article>
          <article><CalendarClock /><span>Cohorts</span><strong>{displayCount(state.counts.cohorts)}</strong><small>authoritative row count</small></article>
          <article><Video /><span>Live sessions</span><strong>{displayCount(state.counts.liveSessions)}</strong><small>authoritative row count</small></article>
          <article><FileLock2 /><span>Production</span><strong>Denied</strong><small>authorization remains false</small></article>
        </section>
        <section className="owner-preview__card owner-preview__cohort-card">
          <div>
            <span className="owner-preview__kicker">OPERATIONS STATUS</span>
            <h2>{dbReady ? "Authoritative FDACS database connected" : "FDACS database state unavailable"}</h2>
            <p>{dbReady ? `Counts were read directly from the isolated FDACS database at ${formatDateTime(state.observedAt)}. This surface performs no regulated database writes.` : state.blockingReason}</p>
          </div>
          <div className="owner-preview__control-ledger">
            {[["Owner identity", "Real Supabase authority"], ["Session assurance", "Protected readiness + AAL2"], ["Data source", "FDACS Supabase · read-only counts"], ["Daily video", "Real private owner room"], ["Regulated writes", "Denied"], ["Training credit", "Ineligible"]].map(([name, value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}
          </div>
        </section>
      </div>
    );
  }

  function renderRoster() {
    return (
      <section className="owner-preview__card">
        <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">REAL DATABASE ROSTER</span><h2>Instructor roster workspace</h2></div><span className="owner-preview__pill"><UsersRound size={15} /> {displayCount(state.counts.enrollments)} enrollments</span></div>
        {dbReady && noLearners ? <EmptyState title="No learners or enrollments" detail="Enrollment creation is disabled before licensing and production authorization. No student can enter the LMS." /> : dbReady ? <EmptyState title="Protected roster details are not exposed here" detail="This pre-license owner surface reports authoritative row counts only and never renders learner PII." /> : <EmptyState title="Roster state unavailable" detail={state.blockingReason ?? "Authoritative row counts could not be read."} />}
        <div className="owner-preview__notice"><FileLock2 size={20} /><span><strong>Enrollment remains locked.</strong>No owner-preview action creates an account, identity, enrollment, entitlement, payment, or training record.</span></div>
      </section>
    );
  }

  function renderLive() {
    const activeCoursewareIndex = coursewareView
      ? courseware.findIndex((item) => item.objectPath === coursewareView.objectPath)
      : -1;
    return (
      <div className="owner-preview__panel-stack">
        <div className="owner-preview__live-grid">
          <section className="owner-preview__card owner-preview__video-card">
            <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">LIVE CLASSROOM</span><h2>Private Daily instructor rehearsal</h2></div><span className={`owner-preview__pill ${daily ? "is-live" : ""}`}><Radio size={15} /> {daily ? "provider room open" : "room closed"}</span></div>
            <div className="owner-preview__video-frame">
              {daily?.instructorJoinUrl ? <iframe title="Internal owner Daily instructor diagnostic" src={daily.instructorJoinUrl} allow="camera; microphone; fullscreen; display-capture; autoplay" referrerPolicy="no-referrer" /> : (
                <div className="owner-preview__video-empty"><MonitorUp size={44} aria-hidden="true" /><strong>No Daily room is open</strong><p>Create one real, private, short-lived room with one instructor and up to three owner-controlled learner views. Recording, attendance, training time, and credit remain disabled.</p><button type="button" onClick={() => void createDailyRoom()} disabled={dailyBusy}><Video size={17} /> {dailyBusy ? "Provisioning…" : "Create live classroom"}</button></div>
              )}
            </div>
            {dailyError ? <div className="owner-preview__error" role="alert"><XCircle size={18} /> {dailyError}</div> : null}
            {daily ? <>
              <div className="owner-preview__daily-actions"><span><ShieldCheck size={16} /> Expires {formatDateTime(daily.roomExpiresAt)} · recording off · owner test only</span><button type="button" onClick={() => void closeDailyRoom()} disabled={dailyBusy}><Square size={15} /> End and delete room</button></div>
              <div className="owner-preview__participant-links" aria-label="Owner-controlled learner test views">
                {daily.participantJoinUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"><UsersRound size={16} /> Open learner view {index + 1}</a>)}
              </div>
            </> : null}
          </section>
          <aside className="owner-preview__card owner-preview__live-controls">
            <span className="owner-preview__kicker">FULL CLASSROOM CONTROLS</span><h2>Instructor and learner media</h2>
            <div className="owner-preview__control-ledger">{[["Provider", "Daily private room"], ["Instructor", "Camera · microphone · screen share · admin"], ["Learner media", "Camera and microphone available"], ["Learner entry", "Microphone and camera start off"], ["Instructor moderation", "Mute or remove participants"], ["Interaction", "People panel · chat · reactions · hand raising"], ["Recording", "Disabled"], ["Attendance and time", "Not recorded in owner rehearsal"]].map(([name, value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
            <div className="owner-preview__notice"><ScreenShare size={20} /><span><strong>Teach from any instructor application.</strong>Use Daily screen sharing for PowerPoint, Keynote, browser instruction, videos, or other approved instructional media.</span></div>
          </aside>
        </div>

        <section className="owner-preview__card owner-preview__courseware">
          <div className="owner-preview__section-head">
            <div><span className="owner-preview__kicker">COURSEWARE STAGE</span><h2>Upload and present live instructional media</h2></div>
            <label className="owner-preview__upload-button">
              <FileUp size={17} /> {coursewareBusy ? "Working…" : "Upload courseware"}
              <input type="file" accept=".pptx,.pdf,.png,.jpg,.jpeg,.webp,.mp4,.webm" disabled={coursewareBusy} onChange={(event) => void uploadCourseware(event)} />
            </label>
          </div>
          <p>PDFs and slide images can be presented inside this LMS workspace. Videos play in the courseware stage. PowerPoint files remain private and can be opened in PowerPoint, then taught through the instructor screen-share control.</p>
          {coursewareError ? <div className="owner-preview__error" role="alert"><XCircle size={18} /> {coursewareError}</div> : null}
          <div className="owner-preview__courseware-layout">
            <div className="owner-preview__courseware-stage">
              {coursewareView ? <>
                <div className="owner-preview__courseware-stage-head"><span>{coursewareView.fileName}</span><small>{displayBytes(coursewareView.sizeBytes)} · private signed view</small></div>
                {coursewareView.mediaKind === "video" ? <video src={coursewareView.signedViewUrl} controls playsInline controlsList="nodownload" /> : null}
                {coursewareView.mediaKind === "slides" || coursewareView.mediaKind === "image" ? <iframe title={`Courseware presentation: ${coursewareView.fileName}`} src={coursewareView.signedViewUrl} referrerPolicy="no-referrer" /> : null}
                {coursewareView.mediaKind === "powerpoint" ? <div className="owner-preview__powerpoint-stage"><Presentation size={52} /><strong>PowerPoint ready for live instruction</strong><p>Open the protected PPTX in PowerPoint, enter slide-show mode, and share that window from the instructor classroom above.</p><a href={coursewareView.signedViewUrl} target="_blank" rel="noreferrer"><Presentation size={17} /> Open protected PowerPoint</a></div> : null}
                <div className="owner-preview__slide-controls">
                  <button type="button" disabled={coursewareBusy || activeCoursewareIndex <= 0} onClick={() => { const item = courseware[activeCoursewareIndex - 1]; if (item) void presentCourseware(item); }}>Previous media</button>
                  <span>{activeCoursewareIndex >= 0 ? `${activeCoursewareIndex + 1} of ${courseware.length}` : "Selected media"}</span>
                  <button type="button" disabled={coursewareBusy || activeCoursewareIndex < 0 || activeCoursewareIndex >= courseware.length - 1} onClick={() => { const item = courseware[activeCoursewareIndex + 1]; if (item) void presentCourseware(item); }}>Next media</button>
                </div>
              </> : <div className="owner-preview__courseware-empty"><ImageIcon size={44} /><strong>No courseware selected</strong><p>Upload or select protected courseware, then present it here or screen-share it through the live classroom.</p></div>}
            </div>
            <div className="owner-preview__courseware-list" aria-label="Protected owner courseware">
              {courseware.length ? courseware.map((item) => <article key={item.objectPath} className={coursewareView?.objectPath === item.objectPath ? "is-active" : ""}>
                <button type="button" className="owner-preview__courseware-select" disabled={coursewareBusy} onClick={() => void presentCourseware(item)}>
                  {item.mediaKind === "video" ? <Film size={19} /> : item.mediaKind === "powerpoint" ? <Presentation size={19} /> : <ImageIcon size={19} />}
                  <span><strong>{item.fileName}</strong><small>{item.mediaKind} · {displayBytes(item.sizeBytes)}</small></span>
                </button>
                <button type="button" className="owner-preview__courseware-delete" aria-label={`Delete ${item.fileName}`} disabled={coursewareBusy} onClick={() => void deleteCourseware(item)}><Trash2 size={16} /></button>
              </article>) : <div className="owner-preview__courseware-empty"><FileUp size={32} /><strong>No protected media uploaded</strong><p>PPTX, PDF, images, MP4, and WEBM are accepted up to 100 MB.</p></div>}
            </div>
          </div>
          <div className="owner-preview__notice"><FileLock2 size={20} /><span><strong>Owner rehearsal boundary.</strong>Courseware is private, exact-release bound, AAL2 owner controlled, and does not create enrollment, attendance, instructional time, training credit, completion, certificate, or LIAS records.</span></div>
        </section>
      </div>
    );
  }

  function renderAttendance() {
    return <section className="owner-preview__card"><div className="owner-preview__section-head"><div><span className="owner-preview__kicker">ATTENDANCE AND PRESENCE</span><h2>Authoritative evidence state</h2></div><span className="owner-preview__pill">read-only</span></div><div className="owner-preview__metrics owner-preview__metrics--compact"><article><ClipboardCheck /><span>Attendance rows</span><strong>{displayCount(state.counts.attendanceEntries)}</strong><small>FDACS database</small></article><article><Activity /><span>Presence challenges</span><strong>{displayCount(state.counts.presenceChallenges)}</strong><small>FDACS database</small></article><article><UsersRound /><span>Student identities</span><strong>{displayCount(state.counts.studentIdentities)}</strong><small>FDACS database</small></article><article><FileLock2 /><span>Credited time</span><strong>Denied</strong><small>pre-license lock</small></article></div><div className="owner-preview__notice"><FileLock2 size={20} /><span><strong>No check-in or reporting action is available.</strong>Attendance, presence, instructional-time, identity, FDACS, and LIAS writes remain disabled.</span></div></section>;
  }

  function renderExam() {
    return <section className="owner-preview__card"><div className="owner-preview__section-head"><div><span className="owner-preview__kicker">EXAM MONITORING</span><h2>Authoritative attempt state</h2></div><span className="owner-preview__pill">read-only</span></div><div className="owner-preview__metrics owner-preview__metrics--compact"><article><GraduationCap /><span>Exam attempts</span><strong>{displayCount(state.counts.examAttempts)}</strong><small>FDACS database</small></article><article><BadgeCheck /><span>Official scoring</span><strong>Denied</strong><small>pre-license lock</small></article><article><Activity /><span>Student access</span><strong>Denied</strong><small>eligible enrollment required</small></article><article><ClipboardCheck /><span>Proctor actions</span><strong>Denied</strong><small>no regulated writes</small></article></div><div className="owner-preview__notice"><FileLock2 size={20} /><span><strong>No exam control is rendered.</strong>No attempt, answer, score, remediation decision, completion, or course credit can be created from this owner preview.</span></div></section>;
  }

  function renderCompletion() {
    return <section className="owner-preview__card"><div className="owner-preview__section-head"><div><span className="owner-preview__kicker">COMPLETION REVIEW</span><h2>Authoritative output state</h2></div><span className="owner-preview__pill">all outputs denied</span></div><div className="owner-preview__metrics owner-preview__metrics--compact"><article><BookOpenCheck /><span>Completion records</span><strong>{displayCount(state.counts.completionRecords)}</strong><small>FDACS database</small></article><article><BadgeCheck /><span>Documents</span><strong>{displayCount(state.counts.completionDocuments)}</strong><small>FDACS database</small></article><article><Activity /><span>LIAS queue</span><strong>{displayCount(state.counts.liasReportingQueue)}</strong><small>FDACS database</small></article><article><FileLock2 /><span>Issuance</span><strong>Denied</strong><small>authorization remains false</small></article></div><div className="owner-preview__notice"><ShieldCheck size={20} /><span><strong>No completion determination is available.</strong>Course credit, completion records, documents, certificates, and LIAS submission remain technically disabled.</span></div></section>;
  }

  function renderActivation() {
    return (
      <div className="owner-preview__activation-grid">
        <section className="owner-preview__card">
          <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">GOVERNED ACTIVATION REQUEST</span><h2>Submit license evidence for authoritative verification</h2></div><span className="owner-preview__pill">request only · fail closed</span></div>
          <p>This request validates both the school and instructor licenses. No activation is performed; it cannot enable students or write regulated training records.</p>
          <form className="owner-preview__activation-form" onSubmit={submitActivationRequest}>
            <label><span>Class DS school license number</span><input value={schoolLicenseNumber} onChange={(event) => setSchoolLicenseNumber(event.target.value)} aria-describedby="ds-license-help" autoComplete="off" spellCheck={false} maxLength={40} required /><small id="ds-license-help">Enter the exact FDACS-issued Class DS credential for the licensed school or training facility.</small></label>
            <label><span>Class DI instructor license number</span><input value={instructorLicenseNumber} onChange={(event) => setInstructorLicenseNumber(event.target.value)} aria-describedby="di-license-help" autoComplete="off" spellCheck={false} maxLength={40} required /><small id="di-license-help">Enter the exact FDACS-issued Class DI credential for the authorized instructor.</small></label>
            <button type="submit" disabled={activationBusy || !schoolLicenseNumber.trim() || !instructorLicenseNumber.trim()}><KeyRound size={17} /> {activationBusy ? "Evaluating request…" : "Request governed verification"}</button>
          </form>
          {activationStatus ? <div className={`owner-preview__activation-result ${activationStatus.status === "denied" ? "is-denied" : "is-review"}`} role="status">{activationStatus.status === "denied" ? <XCircle size={21} /> : <BadgeCheck size={21} />}<span><strong>{activationStatus.status === "denied" ? "Activation request denied" : "Eligible for controlled activation review"}</strong><small>{activationStatus.error ?? (activationStatus.blockingKeys?.length ? `${activationStatus.blockingKeys.length} prerequisite gates remain blocked.` : "A separate controlled authorization decision is still required.")}</small>{activationStatus.code ? <code>{activationStatus.code}</code> : null}</span></div> : null}
        </section>
        <aside className="owner-preview__card"><span className="owner-preview__kicker">ACTIVATION INVARIANTS</span><h2>Every gate must pass together</h2><div className="owner-preview__decision-list">{[["Class DS school authority", "FDACS LICENSE ISSUED · current · bound"], ["Class DI instructor authority", "FDACS LICENSE ISSUED · current · bound"], ["Owner security", "allowlist · protected readiness · AAL2"], ["Production release", "exact SHA · backup · rollback"], ["Providers and database", "authenticated readiness preflight"], ["Final authorization", "separate explicit decision"]].map(([name, detail]) => <div key={name}><FileLock2 /><span><strong>{name}</strong><small>{detail}</small></span><b>REQUIRED</b></div>)}</div><div className="owner-preview__notice"><ShieldCheck size={20} /><span><strong>Current state remains disabled.</strong>Student access, enrollment, payment, training delivery, credit, completion, certificates, and LIAS remain denied. FDACS/LIAS reporting preflight remains disabled.</span></div></aside>
      </div>
    );
  }

  return (
    <div className="owner-preview__shell">
      <aside className="owner-preview__sidebar">
        <div className="owner-preview__brand"><span>OBSERRA</span><small>EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</small><b>FDACS LMS OPERATIONS</b></div>
        <nav aria-label="Owner preview workflow">{views.map((view) => { const Icon = view.icon; return <button type="button" key={view.id} className={activeView === view.id ? "is-active" : ""} onClick={() => setActiveView(view.id)}><Icon size={18} /> {view.label}</button>; })}</nav>
        <div className="owner-preview__sidebar-boundary"><FileLock2 size={18} /><span><strong>Fail-closed boundary</strong>Payments, enrollment, training delivery, credit, completion, certificates, and LIAS are disabled.</span></div>
      </aside>
      <div className="owner-preview__workspace">
        <header className="owner-preview__topbar"><div><span className="owner-preview__kicker">INTERNAL OPERATIONS REVIEW</span><h1>Florida Class D LMS command workspace</h1></div><div className="owner-preview__release"><span>Exact release</span><strong>{releaseCommitSha.slice(0, 12)}</strong><small>expires {formatDateTime(authorizationExpiresAt)}</small></div></header>
        <div className="owner-preview__watermark-inline"><ShieldCheck size={15} /> {watermark}</div>
        <div className="owner-preview__content">{activeView === "overview" ? renderOverview() : null}{activeView === "roster" ? renderRoster() : null}{activeView === "live" ? renderLive() : null}{activeView === "attendance" ? renderAttendance() : null}{activeView === "exam" ? renderExam() : null}{activeView === "completion" ? renderCompletion() : null}{activeView === "activation" ? renderActivation() : null}</div>
      </div>
    </div>
  );
}
