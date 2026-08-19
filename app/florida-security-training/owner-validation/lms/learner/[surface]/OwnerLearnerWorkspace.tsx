"use client";

import {
  BookOpenCheck,
  Hand,
  MessageSquareText,
  Mic,
  MicOff,
  Pause,
  Send,
  ShieldCheck,
  UserRoundCheck,
  Video,
  VideoOff,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { SupabaseAuthRuntimeStatus } from "@/lib/auth/runtime-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserRuntime = Pick<SupabaseAuthRuntimeStatus, "ready" | "url" | "projectRef" | "publishableKey"> & { production: boolean };
type LearnerSurface = "learner_1" | "learner_2" | "learner_3";
type Surface = "instructor" | LearnerSurface;

type WorkspaceSession = {
  id: string;
  status: "live" | "break" | "ended";
  title: string;
  break_ends_at: string | null;
  break_label: string | null;
  active_course_asset_id: string | null;
  created_at: string;
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

const STORAGE_BUCKET = "owner-lms-courseware";

function signalFrom(value: unknown): Signal | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const surfaces = ["instructor", "learner_1", "learner_2", "learner_3"];
  if (!surfaces.includes(String(candidate.from)) || !surfaces.includes(String(candidate.to))) return null;
  if (!["ready", "offer", "answer", "ice"].includes(String(candidate.kind))) return null;
  return candidate as unknown as Signal;
}

function StreamVideo({ stream, muted = false, label }: { stream: MediaStream | null; muted?: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline muted={muted} aria-label={label} />;
}

export default function OwnerLearnerWorkspace({
  sessionId,
  surface,
  runtime,
}: {
  sessionId: string;
  surface: LearnerSurface;
  runtime: BrowserRuntime;
}) {
  const [supabase] = useState(() => createSupabaseBrowserClient(runtime));
  const [session, setSession] = useState<WorkspaceSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState("");
  const [handRaised, setHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [instructorStream, setInstructorStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [activeAsset, setActiveAsset] = useState<CourseAssetView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const sendSignal = useCallback(async (signal: Signal) => {
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({ type: "broadcast", event: "signal", payload: signal });
  }, []);

  const ensurePeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    for (const track of localStreamRef.current?.getTracks() ?? []) peer.addTrack(track, localStreamRef.current as MediaStream);
    peer.onicecandidate = (event) => {
      if (event.candidate) void sendSignal({ from: surface, to: "instructor", kind: "ice", candidate: event.candidate.toJSON() });
    };
    peer.ontrack = (event) => {
      const remote = event.streams[0];
      if (remote) setInstructorStream(remote);
    };
    peer.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(peer.connectionState)) setInstructorStream(null);
    };
    peerRef.current = peer;
    return peer;
  }, [sendSignal, surface]);

  const refresh = useCallback(async () => {
    const [sessionResult, messagesResult, participantResult] = await Promise.all([
      supabase.from("owner_lms_sessions").select("id,status,title,break_ends_at,break_label,active_course_asset_id,created_at").eq("id", sessionId).single(),
      supabase.from("owner_lms_messages").select("id,sender_surface,body,created_at").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(300),
      supabase.from("owner_lms_participants").select("hand_raised").eq("session_id", sessionId).eq("surface", surface).maybeSingle(),
    ]);
    if (sessionResult.error) throw sessionResult.error;
    if (messagesResult.error) throw messagesResult.error;
    const current = sessionResult.data as WorkspaceSession;
    setSession(current);
    setMessages((messagesResult.data ?? []) as Message[]);
    setHandRaised(participantResult.data?.hand_raised === true);

    if (!current.active_course_asset_id) {
      setActiveAsset(null);
      return;
    }
    const assetResult = await supabase.from("owner_lms_course_assets").select("id,object_path,file_name,title,content_type,size_bytes,media_kind,created_at").eq("id", current.active_course_asset_id).single();
    if (assetResult.error || !assetResult.data) throw assetResult.error ?? new Error("Shared courseware is unavailable.");
    const signed = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(assetResult.data.object_path, 10 * 60);
    if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Shared courseware could not be opened.");
    setActiveAsset({ ...(assetResult.data as CourseAsset), signedUrl: signed.data.signedUrl });
  }, [sessionId, supabase, surface]);

  const heartbeat = useCallback(async () => {
    const status = document.visibilityState === "visible" ? "connected" : "away";
    const result = await supabase.from("owner_lms_participants").upsert({
      session_id: sessionId,
      surface,
      display_name: `Owner learner ${surface.slice(-1)}`,
      status,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "session_id,surface" });
    if (result.error) throw result.error;
  }, [sessionId, supabase, surface]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialTimer = window.setTimeout(() => {
      void Promise.all([refresh(), heartbeat()]).catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Learner workspace could not be loaded.");
      });
    }, 0);
    const timer = window.setInterval(() => {
      void Promise.all([refresh(), heartbeat()]).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Learner workspace refresh failed."));
    }, 5_000);
    const onVisibility = () => void heartbeat().catch(() => undefined);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      void supabase.from("owner_lms_participants").update({ status: "disconnected", last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("session_id", sessionId).eq("surface", surface);
    };
  }, [heartbeat, refresh, sessionId, supabase, surface]);

  useEffect(() => {
    const channel = supabase.channel(`owner-lms-webrtc:${sessionId}`, { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      const signal = signalFrom(payload);
      if (!signal || signal.to !== surface || signal.from !== "instructor") return;
      void (async () => {
        const peer = ensurePeer();
        if (signal.kind === "offer" && signal.sdp) {
          await peer.setRemoteDescription(signal.sdp);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await sendSignal({ from: surface, to: "instructor", kind: "answer", sdp: answer });
        } else if (signal.kind === "ice" && signal.candidate) {
          await peer.addIceCandidate(signal.candidate).catch(() => undefined);
        }
      })().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Live video signaling failed."));
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") void sendSignal({ from: surface, to: "instructor", kind: "ready" });
    });
    channelRef.current = channel;
    return () => {
      if (channelRef.current === channel) channelRef.current = null;
      void supabase.removeChannel(channel);
      peerRef.current?.close();
      peerRef.current = null;
      setInstructorStream(null);
    };
  }, [ensurePeer, sendSignal, sessionId, supabase, surface]);

  async function enableMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraEnabled(stream.getVideoTracks().some((track) => track.enabled));
      setMicrophoneEnabled(stream.getAudioTracks().some((track) => track.enabled));
      const peer = ensurePeer();
      const senderKinds = new Set(peer.getSenders().map((sender) => sender.track?.kind));
      for (const track of stream.getTracks()) if (!senderKinds.has(track.kind)) peer.addTrack(track, stream);
      await sendSignal({ from: surface, to: "instructor", kind: "ready" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Camera and microphone could not be enabled.");
    }
  }

  function toggleCamera() {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }

  function toggleMicrophone() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicrophoneEnabled(track.enabled);
  }

  async function raiseHand() {
    const next = !handRaised;
    const result = await supabase.from("owner_lms_participants").update({ hand_raised: next, updated_at: new Date().toISOString() }).eq("session_id", sessionId).eq("surface", surface);
    if (result.error) setMessage(result.error.message);
    else setHandRaised(next);
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    if (!chatText.trim()) return;
    const text = chatText.trim().slice(0, 2000);
    setChatText("");
    const result = await supabase.from("owner_lms_messages").insert({ session_id: sessionId, sender_surface: surface, body: text });
    if (result.error) setMessage(result.error.message);
    else await refresh();
  }

  const breakSeconds = useMemo(() => {
    if (session?.status !== "break" || !session.break_ends_at) return 0;
    return Math.max(0, Math.ceil((Date.parse(session.break_ends_at) - now) / 1000));
  }, [now, session?.break_ends_at, session?.status]);

  if (!session) return <div className="owner-lms-learner-shell"><div className="owner-lms-alert" role="alert">The rehearsal session is unavailable.</div></div>;

  return (
    <div className="owner-lms-learner-shell">
      <header className="owner-lms-learner-header">
        <div><span className="owner-preview__kicker">OWNER CONTROLLED LEARNER SURFACE</span><h1>{session.title}</h1><p>Surface {surface.slice(-1)} · real media, chat, courseware, and presence monitoring · non credit</p></div>
        <span className={`owner-preview__pill ${session.status === "live" ? "is-live" : ""}`}><UserRoundCheck size={15} /> {session.status}</span>
      </header>
      <div className="owner-preview__watermark-inline"><ShieldCheck size={15} /> OWNER AAL2 LEARNER REHEARSAL · NO REGULATED CREDIT</div>
      {message ? <div className="owner-lms-alert" role="status"><span>{message}</span><button type="button" onClick={() => setMessage(null)}>Dismiss</button></div> : null}
      {session.status === "break" ? <div className="owner-lms-break-banner" role="status"><Pause size={18} /><strong>{session.break_label}</strong><span>{String(Math.floor(breakSeconds / 60)).padStart(2, "0")}:{String(breakSeconds % 60).padStart(2, "0")} remaining</span></div> : null}

      <div className="owner-lms-learner-grid">
        <section className="owner-preview__card">
          <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">LIVE INSTRUCTION</span><h2>Instructor video</h2></div><Video size={20} /></div>
          <div className="owner-preview__video-frame owner-lms-learner-video">
            {instructorStream ? <StreamVideo stream={instructorStream} label="Live instructor video" /> : <div className="owner-preview__video-empty"><VideoOff size={40} /><strong>Waiting for instructor video</strong><p>The instructor connection establishes automatically while this learner surface remains open.</p></div>}
          </div>
          <div className="owner-lms-toolbar">
            {!localStream ? <button type="button" onClick={() => void enableMedia()}><Video size={16} /> Enable learner camera and microphone</button> : null}
            {localStream ? <button type="button" onClick={toggleCamera}>{cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}{cameraEnabled ? "Camera on" : "Camera off"}</button> : null}
            {localStream ? <button type="button" onClick={toggleMicrophone}>{microphoneEnabled ? <Mic size={16} /> : <MicOff size={16} />}{microphoneEnabled ? "Mic on" : "Mic off"}</button> : null}
            <button type="button" className={handRaised ? "is-raised" : ""} onClick={() => void raiseHand()}><Hand size={16} /> {handRaised ? "Hand raised" : "Raise hand"}</button>
          </div>
          {localStream ? <div className="owner-lms-self-view"><StreamVideo stream={localStream} muted label="Learner self preview" /></div> : null}
        </section>

        <aside className="owner-preview__card" id="learner-chat">
          <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">CLASS CHAT</span><h2>Questions and discussion</h2></div><MessageSquareText size={20} /></div>
          <div className="owner-lms-chat-feed" aria-live="polite">
            {messages.length ? messages.map((item) => <div key={item.id} className={item.sender_surface === surface ? "is-self" : item.sender_surface === "instructor" ? "is-instructor" : ""}><strong>{item.sender_surface === "instructor" ? "Instructor" : item.sender_surface === surface ? "You" : item.sender_surface.replace("_", " ")}</strong><span>{item.body}</span><small>{new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div>) : <p>No class messages yet.</p>}
          </div>
          <form className="owner-lms-chat-form" onSubmit={sendChat}><input value={chatText} onChange={(event) => setChatText(event.target.value)} maxLength={2000} placeholder="Ask a question or message the instructor" aria-label="Learner class message" /><button type="submit" disabled={!chatText.trim()}><Send size={16} /> Send</button></form>
        </aside>
      </div>

      <section className="owner-preview__card owner-lms-shared-courseware">
        <div className="owner-preview__section-head"><div><span className="owner-preview__kicker">SHARED COURSEWARE</span><h2>Instructor presentation</h2></div><BookOpenCheck size={20} /></div>
        <div className="owner-preview__courseware-stage">
          {activeAsset ? (
            <>
              <div className="owner-preview__courseware-stage-head"><span>{activeAsset.title}</span><small>Protected owner LMS asset</small></div>
              {activeAsset.media_kind === "video" ? <video src={activeAsset.signedUrl} controls playsInline controlsList="nodownload" /> : null}
              {activeAsset.media_kind === "slides" || activeAsset.media_kind === "image" ? <iframe title={`Shared courseware: ${activeAsset.title}`} src={activeAsset.signedUrl} referrerPolicy="no-referrer" /> : null}
              {activeAsset.media_kind === "powerpoint" ? <div className="owner-preview__powerpoint-stage"><BookOpenCheck size={48} /><strong>{activeAsset.file_name}</strong><a href={activeAsset.signedUrl} target="_blank" rel="noreferrer">Open protected PowerPoint</a></div> : null}
            </>
          ) : <div className="owner-preview__courseware-empty"><BookOpenCheck size={38} /><strong>The instructor is not presenting courseware</strong><p>This area updates automatically when the instructor shares an uploaded asset.</p></div>}
        </div>
      </section>
    </div>
  );
}
