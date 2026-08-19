"use client";

import {
  BookOpenCheck,
  CircleStop,
  FileText,
  FileUp,
  Hand,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorUp,
  NotebookPen,
  Pause,
  Play,
  Presentation,
  Radio,
  Send,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UsersRound,
  Video,
  VideoOff,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { SupabaseAuthRuntimeStatus } from "@/lib/auth/runtime-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserRuntime = Pick<SupabaseAuthRuntimeStatus, "ready" | "url" | "projectRef" | "publishableKey"> & { production: boolean };
type LearnerSurface = "learner_1" | "learner_2" | "learner_3";
type Surface = "instructor" | LearnerSurface;

type WorkspaceSession = {
  id: string;
  release_sha: string;
  status: "live" | "break" | "ended";
  media_mode: "browser_webrtc" | "daily";
  title: string;
  break_started_at: string | null;
  break_ends_at: string | null;
  break_label: string | null;
  active_course_asset_id: string | null;
  created_at: string;
};

type Participant = {
  id: string;
  surface: LearnerSurface;
  display_name: string;
  status: "connected" | "away" | "disconnected";
  hand_raised: boolean;
  last_seen_at: string;
  joined_at: string;
};

type Message = {
  id: string;
  sender_surface: Surface;
  body: string;
  created_at: string;
};

type CourseAsset = {
  id: string;
  object_path: string;
  file_name: string;
  title: string;
  content_type: string;
  size_bytes: number;
  media_kind: "powerpoint" | "slides" | "image" | "video";
  created_at: string;
};

type CourseAssetView = CourseAsset & { signedUrl: string };

type Signal = {
  from: Surface;
  to: Surface;
  kind: "ready" | "offer" | "answer" | "ice";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const LEARNER_SURFACES: LearnerSurface[] = ["learner_1", "learner_2", "learner_3"];
const STORAGE_BUCKET = "owner-lms-courseware";
const MAX_FILE_BYTES = 100 * 1024 * 1024;

function isSurface(value: unknown): value is Surface {
  return value === "instructor" || LEARNER_SURFACES.includes(value as LearnerSurface);
}

function signalFrom(value: unknown): Signal | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (!isSurface(candidate.from) || !isSurface(candidate.to)) return null;
  if (!["ready", "offer", "answer", "ice"].includes(String(candidate.kind))) return null;
  return candidate as unknown as Signal;
}

function mediaKind(file: File): CourseAsset["media_kind"] | null {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pptx")) return "powerpoint";
  if (lower.endsWith(".pdf")) return "slides";
  if (/\.(png|jpe?g|webp)$/.test(lower)) return "image";
  if (/\.(mp4|webm)$/.test(lower)) return "video";
  return null;
}

function contentType(file: File) {
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

function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160) || "courseware";
}

function displayBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}

function elapsedLabel(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function StreamVideo({ stream, muted = false, label }: { stream: MediaStream | null; muted?: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline muted={muted} aria-label={label} />;
}

export default function OwnerValidationLmsConsole({ releaseCommitSha, runtime }: { releaseCommitSha: string; runtime: BrowserRuntime }) {
  const [supabase] = useState(() => createSupabaseBrowserClient(runtime));
  const [session, setSession] = useState<WorkspaceSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assets, setAssets] = useState<CourseAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<CourseAssetView | null>(null);
  const [notes, setNotes] = useState("");
  const [chatText, setChatText] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [coursewareBusy, setCoursewareBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const peersRef = useRef(new Map<LearnerSurface, RTCPeerConnection>());
  const streamRef = useRef<MediaStream | null>(null);

  const sendSignal = useCallback(async (signal: Signal) => {
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({ type: "broadcast", event: "signal", payload: signal });
  }, []);

  const ensurePeer = useCallback((surface: LearnerSurface) => {
    const existing = peersRef.current.get(surface);
    if (existing) return existing;
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    for (const track of streamRef.current?.getTracks() ?? []) peer.addTrack(track, streamRef.current as MediaStream);
    peer.onicecandidate = (event) => {
      if (event.candidate) void sendSignal({ from: "instructor", to: surface, kind: "ice", candidate: event.candidate.toJSON() });
    };
    peer.ontrack = (event) => {
      const remote = event.streams[0];
      if (remote) setRemoteStreams((current) => ({ ...current, [surface]: remote }));
    };
    peer.onconnectionstatechange = () => {
      if (["failed", "closed"].includes(peer.connectionState)) {
        setRemoteStreams((current) => {
          const next = { ...current };
          delete next[surface];
          return next;
        });
      }
    };
    peersRef.current.set(surface, peer);
    return peer;
  }, [sendSignal]);

  const offerToLearner = useCallback(async (surface: LearnerSurface) => {
    const peer = ensurePeer(surface);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await sendSignal({ from: "instructor", to: surface, kind: "offer", sdp: offer });
  }, [ensurePeer, sendSignal]);

  const refreshWorkspace = useCallback(async (sessionId: string) => {
    const [participantsResult, messagesResult, assetsResult, notesResult, sessionResult] = await Promise.all([
      supabase.from("owner_lms_participants").select("id,surface,display_name,status,hand_raised,last_seen_at,joined_at").eq("session_id", sessionId).order("surface"),
      supabase.from("owner_lms_messages").select("id,sender_surface,body,created_at").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(300),
      supabase.from("owner_lms_course_assets").select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("owner_lms_notes").select("note_text").eq("session_id", sessionId).maybeSingle(),
      supabase.from("owner_lms_sessions").select("id,release_sha,status,media_mode,title,break_started_at,break_ends_at,break_label,active_course_asset_id,created_at").eq("id", sessionId).single(),
    ]);
    const firstError = participantsResult.error || messagesResult.error || assetsResult.error || sessionResult.error;
    if (firstError) throw firstError;
    setParticipants((participantsResult.data ?? []) as Participant[]);
    setMessages((messagesResult.data ?? []) as Message[]);
    setAssets((assetsResult.data ?? []) as CourseAsset[]);
    setNotes(typeof notesResult.data?.note_text === "string" ? notesResult.data.note_text : "");
    setSession(sessionResult.data as WorkspaceSession);
  }, [supabase]);

  const openActiveAsset = useCallback(async (assetId: string | null) => {
    if (!assetId) {
      setActiveAsset(null);
      return;
    }
    const assetResult = await supabase.from("owner_lms_course_assets").select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").eq("id", assetId).single();
    if (assetResult.error || !assetResult.data) throw assetResult.error ?? new Error("Course asset is unavailable.");
    const signed = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(assetResult.data.object_path, 10 * 60);
    if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Protected course asset could not be opened.");
    setActiveAsset({ ...(assetResult.data as CourseAsset), signedUrl: signed.data.signedUrl });
  }, [supabase]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void supabase.from("owner_lms_sessions")
      .select("id,release_sha,status,media_mode,title,break_started_at,break_ends_at,break_label,active_course_asset_id,created_at")
      .in("status", ["live", "break"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data) {
          const current = data as WorkspaceSession;
          setSession(current);
          await refreshWorkspace(current.id);
          await openActiveAsset(current.active_course_asset_id);
        } else {
          const assetsResult = await supabase.from("owner_lms_course_assets").select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").order("created_at", { ascending: false }).limit(100);
          if (!assetsResult.error) setAssets((assetsResult.data ?? []) as CourseAsset[]);
        }
      });
    return () => { cancelled = true; };
  }, [openActiveAsset, refreshWorkspace, supabase]);

  useEffect(() => {
    const sessionId = session?.id;
    if (!sessionId) return;
    const channel = supabase.channel(`owner-lms-webrtc:${sessionId}`, { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      const signal = signalFrom(payload);
      if (!signal || signal.to !== "instructor" || !LEARNER_SURFACES.includes(signal.from as LearnerSurface)) return;
      const learner = signal.from as LearnerSurface;
      void (async () => {
        const peer = ensurePeer(learner);
        if (signal.kind === "ready") {
          await offerToLearner(learner);
        } else if (signal.kind === "answer" && signal.sdp) {
          await peer.setRemoteDescription(signal.sdp);
        } else if (signal.kind === "ice" && signal.candidate) {
          await peer.addIceCandidate(signal.candidate).catch(() => undefined);
        }
      })().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Live video signaling failed."));
    });
    channel.subscribe();
    channelRef.current = channel;

    const refreshTimer = window.setInterval(() => {
      void refreshWorkspace(sessionId).then(() => openActiveAsset(session?.active_course_asset_id ?? null)).catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Instructor workspace refresh failed.");
      });
    }, 4_000);

    return () => {
      window.clearInterval(refreshTimer);
      if (channelRef.current === channel) channelRef.current = null;
      void supabase.removeChannel(channel);
      for (const peer of peersRef.current.values()) peer.close();
      peersRef.current.clear();
      setRemoteStreams({});
    };
  }, [ensurePeer, offerToLearner, openActiveAsset, refreshWorkspace, session?.active_course_asset_id, session?.id, supabase]);

  async function startRehearsal() {
    setBusy(true);
    setMessage(null);
    try {
      const created = await supabase.from("owner_lms_sessions").insert({
        release_sha: releaseCommitSha.toLowerCase(),
        status: "live",
        media_mode: "browser_webrtc",
        title: "Florida Class D Owner Rehearsal",
        room_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }).select("id,release_sha,status,media_mode,title,break_started_at,break_ends_at,break_label,active_course_asset_id,created_at").single();
      if (created.error || !created.data) throw created.error ?? new Error("Owner rehearsal could not be created.");
      const current = created.data as WorkspaceSession;
      setSession(current);
      await refreshWorkspace(current.id);
      await enableInstructorMedia();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Owner rehearsal could not be started.");
    } finally {
      setBusy(false);
    }
  }

  async function enableInstructorMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      setLocalStream(stream);
      setCameraEnabled(stream.getVideoTracks().some((track) => track.enabled));
      setMicrophoneEnabled(stream.getAudioTracks().some((track) => track.enabled));
      for (const surface of LEARNER_SURFACES) {
        const peer = peersRef.current.get(surface);
        if (!peer) continue;
        const senderKinds = new Set(peer.getSenders().map((sender) => sender.track?.kind));
        for (const track of stream.getTracks()) {
          if (!senderKinds.has(track.kind)) peer.addTrack(track, stream);
        }
        await offerToLearner(surface);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Camera and microphone could not be enabled.");
    }
  }

  function toggleCamera() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }

  function toggleMicrophone() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicrophoneEnabled(track.enabled);
  }

  async function shareScreen() {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = display.getVideoTracks()[0];
      if (!track) return;
      for (const peer of peersRef.current.values()) {
        const sender = peer.getSenders().find((candidate) => candidate.track?.kind === "video");
        if (sender) await sender.replaceTrack(track);
      }
      setScreenSharing(true);
      track.onended = () => {
        const cameraTrack = streamRef.current?.getVideoTracks()[0] ?? null;
        for (const peer of peersRef.current.values()) {
          const sender = peer.getSenders().find((candidate) => candidate.track?.kind === "video");
          if (sender) void sender.replaceTrack(cameraTrack);
        }
        setScreenSharing(false);
      };
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Screen sharing could not be started.");
    }
  }

  async function endRehearsal() {
    if (!session) return;
    setBusy(true);
    try {
      const result = await supabase.from("owner_lms_sessions").update({ status: "ended", break_started_at: null, break_ends_at: null, break_label: null }).eq("id", session.id);
      if (result.error) throw result.error;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setLocalStream(null);
      for (const peer of peersRef.current.values()) peer.close();
      peersRef.current.clear();
      setRemoteStreams({});
      setSession(null);
      setParticipants([]);
      setMessages([]);
      setActiveAsset(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Owner rehearsal could not be ended.");
    } finally {
      setBusy(false);
    }
  }

  async function setBreak(minutes: number) {
    if (!session) return;
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60_000);
    const result = await supabase.from("owner_lms_sessions").update({
      status: "break",
      break_started_at: start.toISOString(),
      break_ends_at: end.toISOString(),
      break_label: `${minutes} minute break`,
    }).eq("id", session.id);
    if (result.error) setMessage(result.error.message);
    else await refreshWorkspace(session.id);
  }

  async function resumeInstruction() {
    if (!session) return;
    const result = await supabase.from("owner_lms_sessions").update({ status: "live", break_started_at: null, break_ends_at: null, break_label: null }).eq("id", session.id);
    if (result.error) setMessage(result.error.message);
    else await refreshWorkspace(session.id);
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    if (!session || !chatText.trim()) return;
    const text = chatText.trim().slice(0, 2000);
    setChatText("");
    const result = await supabase.from("owner_lms_messages").insert({ session_id: session.id, sender_surface: "instructor", body: text });
    if (result.error) setMessage(result.error.message);
    else await refreshWorkspace(session.id);
  }

  async function clearHand(participant: Participant) {
    const result = await supabase.from("owner_lms_participants").update({ hand_raised: false, updated_at: new Date().toISOString() }).eq("id", participant.id);
    if (result.error) setMessage(result.error.message);
    else if (session) await refreshWorkspace(session.id);
  }

  async function saveNotes() {
    if (!session) return;
    const result = await supabase.from("owner_lms_notes").upsert({ session_id: session.id, note_text: notes, saved_at: new Date().toISOString() }, { onConflict: "owner_user_id,session_id" });
    setMessage(result.error ? result.error.message : "Instructor notes saved.");
  }

  async function refreshAssets() {
    const result = await supabase.from("owner_lms_course_assets").select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    setAssets((result.data ?? []) as CourseAsset[]);
  }

  async function uploadCourseware(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const kind = mediaKind(file);
    if (!kind) {
      setMessage("Supported courseware: PPTX, PDF, PNG, JPG, WEBP, MP4, and WEBM.");
      return;
    }
    if (file.size < 1 || file.size > MAX_FILE_BYTES) {
      setMessage("Courseware files must be between 1 byte and 100 MB.");
      return;
    }
    setCoursewareBusy(true);
    setMessage(null);
    let uploadedPath: string | null = null;
    try {
      const userResult = await supabase.auth.getUser();
      if (userResult.error || !userResult.data.user) throw userResult.error ?? new Error("Authenticated owner identity is unavailable.");
      const objectPath = `${userResult.data.user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const upload = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, file, { upsert: false, contentType: contentType(file), cacheControl: "0" });
      if (upload.error) throw upload.error;
      uploadedPath = objectPath;
      const insert = await supabase.from("owner_lms_course_assets").insert({
        object_path: objectPath,
        file_name: file.name.slice(0, 180),
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 180) || file.name.slice(0, 180),
        content_type: contentType(file),
        size_bytes: file.size,
        media_kind: kind,
      }).select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").single();
      if (insert.error || !insert.data) throw insert.error ?? new Error("Courseware metadata could not be saved.");
      await refreshAssets();
      await presentAsset(insert.data as CourseAsset);
    } catch (error) {
      if (uploadedPath) await supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : "Courseware upload failed.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  async function presentAsset(asset: CourseAsset) {
    if (!session) {
      setMessage("Start an owner rehearsal before presenting courseware.");
      return;
    }
    setCoursewareBusy(true);
    try {
      const signed = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(asset.object_path, 10 * 60);
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Protected courseware could not be opened.");
      const update = await supabase.from("owner_lms_sessions").update({ active_course_asset_id: asset.id }).eq("id", session.id);
      if (update.error) throw update.error;
      setActiveAsset({ ...asset, signedUrl: signed.data.signedUrl });
      await refreshWorkspace(session.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Courseware presentation failed.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  async function stopPresenting() {
    if (!session) return;
    const result = await supabase.from("owner_lms_sessions").update({ active_course_asset_id: null }).eq("id", session.id);
    if (result.error) setMessage(result.error.message);
    else {
      setActiveAsset(null);
      await refreshWorkspace(session.id);
    }
  }

  async function deleteAsset(asset: CourseAsset) {
    setCoursewareBusy(true);
    try {
      if (session?.active_course_asset_id === asset.id) await stopPresenting();
      const storageDelete = await supabase.storage.from(STORAGE_BUCKET).remove([asset.object_path]);
      if (storageDelete.error) throw storageDelete.error;
      const rowDelete = await supabase.from("owner_lms_course_assets").delete().eq("id", asset.id);
      if (rowDelete.error) throw rowDelete.error;
      await refreshAssets();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Courseware deletion failed.");
    } finally {
      setCoursewareBusy(false);
    }
  }

  const breakSeconds = useMemo(() => {
    if (session?.status !== "break" || !session.break_ends_at) return 0;
    return Math.max(0, Math.ceil((Date.parse(session.break_ends_at) - now) / 1000));
  }, [now, session?.break_ends_at, session?.status]);

  const connectedCount = participants.filter((participant) => Date.now() - Date.parse(participant.last_seen_at) < 20_000 && participant.status !== "disconnected").length;

  return (
    <div className="owner-preview__shell owner-lms-workspace">
      <aside className="owner-preview__sidebar owner-lms-sidebar">
        <div className="owner-preview__brand"><span>OBSERRA</span><small>EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</small><b>INSTRUCTOR LMS</b></div>
        <nav aria-label="Instructor workspace sections">
          <a href="#classroom"><Video size={17} /> Classroom</a>
          <a href="#learners"><UsersRound size={17} /> Learners</a>
          <a href="#courseware"><Presentation size={17} /> Courseware</a>
          <a href="#chat"><MessageSquareText size={17} /> Chat</a>
          <a href="#notes"><NotebookPen size={17} /> Notes</a>
        </nav>
        <div className="owner-preview__sidebar-boundary"><ShieldCheck size={18} /><span><strong>AAL2 owner rehearsal</strong>Real browser media, persistent private storage, monitoring, chat, and courseware. No regulated attendance or training credit is written.</span></div>
      </aside>

      <div className="owner-preview__workspace">
        <header className="owner-preview__topbar">
          <div><span className="owner-preview__kicker">INSTRUCTOR COMMAND WORKSPACE</span><h1>Florida Class D live training rehearsal</h1></div>
          <div className="owner-preview__release"><span>Exact release</span><strong>{releaseCommitSha.slice(0, 12)}</strong><small>{session ? `${connectedCount}/3 learner surfaces connected` : "No active rehearsal"}</small></div>
        </header>
        <div className="owner-preview__watermark-inline"><ShieldCheck size={15} /> REAL FUNCTIONAL WORKSPACE · OWNER AAL2 · NON CREDIT</div>
        {message ? <div className="owner-lms-alert" role="status"><span>{message}</span><button type="button" onClick={() => setMessage(null)}>Dismiss</button></div> : null}

        <div className="owner-preview__content owner-preview__panel-stack">
          <section id="classroom" className="owner-preview__card">
            <div className="owner-preview__section-head">
              <div><span className="owner-preview__kicker">LIVE CLASSROOM</span><h2>Instructor video and class control</h2></div>
              <span className={`owner-preview__pill ${session ? "is-live" : ""}`}><Radio size={15} /> {session ? session.status : "not started"}</span>
            </div>

            {!session ? (
              <div className="owner-lms-start-panel">
                <Video size={42} />
                <div><strong>Start a functional owner rehearsal</strong><p>This creates a persistent private session and enables three real learner test surfaces, WebRTC video, monitoring, chat, breaks, notes, and courseware sharing.</p></div>
                <button type="button" onClick={() => void startRehearsal()} disabled={busy}><Play size={17} /> {busy ? "Starting..." : "Start rehearsal"}</button>
              </div>
            ) : (
              <>
                <div className="owner-lms-classroom-grid">
                  <div className="owner-preview__video-frame owner-lms-instructor-video">
                    {localStream ? <StreamVideo stream={localStream} muted label="Instructor camera preview" /> : <div className="owner-preview__video-empty"><VideoOff size={40} /><strong>Instructor media not enabled</strong><button type="button" onClick={() => void enableInstructorMedia()}><Video size={17} /> Enable camera and microphone</button></div>}
                  </div>
                  <div className="owner-lms-remote-grid" aria-label="Learner video surfaces">
                    {LEARNER_SURFACES.map((surface, index) => (
                      <article key={surface} className="owner-lms-remote-tile">
                        {remoteStreams[surface] ? <StreamVideo stream={remoteStreams[surface]} label={`Learner ${index + 1} live video`} /> : <div><UsersRound size={28} /><strong>Learner {index + 1}</strong><span>Open the learner surface to connect.</span></div>}
                      </article>
                    ))}
                  </div>
                </div>
                <div className="owner-lms-toolbar">
                  <button type="button" onClick={toggleCamera} disabled={!localStream}>{cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}{cameraEnabled ? "Camera on" : "Camera off"}</button>
                  <button type="button" onClick={toggleMicrophone} disabled={!localStream}>{microphoneEnabled ? <Mic size={16} /> : <MicOff size={16} />}{microphoneEnabled ? "Mic on" : "Mic off"}</button>
                  <button type="button" onClick={() => void shareScreen()} disabled={!localStream || screenSharing}><MonitorUp size={16} /> {screenSharing ? "Sharing screen" : "Share screen"}</button>
                  {session.status === "break" ? <button type="button" onClick={() => void resumeInstruction()}><Play size={16} /> Resume instruction</button> : <button type="button" onClick={() => void setBreak(15)}><Pause size={16} /> Start 15 minute break</button>}
                  <button type="button" className="owner-lms-danger" onClick={() => void endRehearsal()} disabled={busy}><CircleStop size={16} /> End rehearsal</button>
                </div>
                {session.status === "break" ? <div className="owner-lms-break-banner" role="status"><Pause size={18} /><strong>{session.break_label}</strong><span>{String(Math.floor(breakSeconds / 60)).padStart(2, "0")}:{String(breakSeconds % 60).padStart(2, "0")} remaining</span></div> : null}
              </>
            )}
          </section>

          {session ? (
            <section id="learners" className="owner-preview__card">
              <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">STUDENT MONITORING</span><h2>Learner presence and test surfaces</h2></div><span className="owner-preview__pill"><UserRoundCheck size={15} /> {connectedCount} connected</span></div>
              <div className="owner-lms-roster">
                {LEARNER_SURFACES.map((surface, index) => {
                  const participant = participants.find((item) => item.surface === surface);
                  const current = participant && Date.now() - Date.parse(participant.last_seen_at) < 20_000;
                  return (
                    <article key={surface} className={current ? "is-connected" : ""}>
                      <div><strong>Owner learner {index + 1}</strong><span>{participant ? `${participant.status} · last seen ${elapsedLabel(participant.last_seen_at)}` : "not connected"}</span></div>
                      <div className="owner-lms-roster-actions">
                        {participant?.hand_raised ? <button type="button" onClick={() => void clearHand(participant)}><Hand size={15} /> Hand raised · acknowledge</button> : null}
                        <a href={`/florida-security-training/owner-validation/lms/learner/${surface}?session=${encodeURIComponent(session.id)}`} target="_blank" rel="noreferrer">Open learner {index + 1}</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section id="courseware" className="owner-preview__card owner-preview__courseware">
            <div className="owner-preview__section-head">
              <div><span className="owner-preview__kicker">COURSEWARE</span><h2>Private instructional media library</h2></div>
              <label className="owner-preview__upload-button"><FileUp size={17} /> {coursewareBusy ? "Working..." : "Upload courseware"}<input type="file" accept=".pptx,.pdf,.png,.jpg,.jpeg,.webp,.mp4,.webm" disabled={coursewareBusy} onChange={(event) => void uploadCourseware(event)} /></label>
            </div>
            <div className="owner-preview__courseware-layout">
              <div className="owner-preview__courseware-stage">
                {activeAsset ? (
                  <>
                    <div className="owner-preview__courseware-stage-head"><span>{activeAsset.title}</span><small>{displayBytes(activeAsset.size_bytes)} · shared to learner surfaces</small></div>
                    {activeAsset.media_kind === "video" ? <video src={activeAsset.signedUrl} controls playsInline controlsList="nodownload" /> : null}
                    {activeAsset.media_kind === "slides" || activeAsset.media_kind === "image" ? <iframe title={`Courseware: ${activeAsset.title}`} src={activeAsset.signedUrl} referrerPolicy="no-referrer" /> : null}
                    {activeAsset.media_kind === "powerpoint" ? <div className="owner-preview__powerpoint-stage"><Presentation size={48} /><strong>{activeAsset.file_name}</strong><a href={activeAsset.signedUrl} target="_blank" rel="noreferrer">Open protected PowerPoint</a></div> : null}
                    {session ? <div className="owner-preview__slide-controls"><button type="button" onClick={() => void stopPresenting()}>Stop sharing courseware</button></div> : null}
                  </>
                ) : <div className="owner-preview__courseware-empty"><BookOpenCheck size={40} /><strong>No courseware is being presented</strong><p>Select a stored asset to share it with every connected learner surface.</p></div>}
              </div>
              <section className="owner-preview__courseware-list" aria-label="Protected courseware library">
                {assets.length ? assets.map((asset) => (
                  <article key={asset.id} className={activeAsset?.id === asset.id ? "is-active" : ""}>
                    <button type="button" className="owner-preview__courseware-select" disabled={coursewareBusy} onClick={() => void presentAsset(asset)}><FileText size={18} /><span><strong>{asset.title}</strong><small>{asset.media_kind} · {displayBytes(asset.size_bytes)}</small></span></button>
                    <button type="button" className="owner-preview__courseware-delete" aria-label={`Delete ${asset.file_name}`} disabled={coursewareBusy} onClick={() => void deleteAsset(asset)}><Trash2 size={15} /></button>
                  </article>
                )) : <div className="owner-preview__courseware-empty"><FileUp size={30} /><strong>Courseware library is empty</strong><p>Upload a real file to the private owner LMS storage bucket.</p></div>}
              </section>
            </div>
          </section>

          {session ? (
            <div className="owner-lms-lower-grid">
              <section id="chat" className="owner-preview__card">
                <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">CLASS CHAT</span><h2>Instructor and learner discussion</h2></div><MessageSquareText size={20} /></div>
                <div className="owner-lms-chat-feed" aria-live="polite">
                  {messages.length ? messages.map((item) => <div key={item.id} className={item.sender_surface === "instructor" ? "is-instructor" : ""}><strong>{item.sender_surface === "instructor" ? "Instructor" : item.sender_surface.replace("_", " ")}</strong><span>{item.body}</span><small>{new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div>) : <p>No messages have been posted in this rehearsal.</p>}
                </div>
                <form className="owner-lms-chat-form" onSubmit={sendChat}><input value={chatText} onChange={(event) => setChatText(event.target.value)} maxLength={2000} placeholder="Message the class" aria-label="Instructor class message" /><button type="submit" disabled={!chatText.trim()}><Send size={16} /> Send</button></form>
              </section>

              <section id="notes" className="owner-preview__card">
                <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">INSTRUCTOR NOTES</span><h2>Private teaching notes</h2></div><NotebookPen size={20} /></div>
                <textarea className="owner-lms-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={20000} aria-label="Private instructor notes" />
                <div className="owner-lms-toolbar"><button type="button" onClick={() => void saveNotes()}><NotebookPen size={16} /> Save notes</button></div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
