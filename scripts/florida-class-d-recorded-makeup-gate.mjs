import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const migration = read("supabase/migrations/20260813053000_fdacs_class_d_recorded_makeup_playback.sql");
const service = read("lib/florida-class-d-recorded-makeup.ts");
const api = read("app/api/florida-class-d/recorded-makeup/route.ts");
const mediaProxy = read("app/api/florida-class-d/recorded-makeup/media/route.ts");
const player = read("app/florida-security-training/makeup/RecordedMakeupPlayer.tsx");
const portal = read("app/florida-security-training/makeup/MakeupPortal.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-11-RECORDED-MAKEUP-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "fdacs_class_d_recorded_playback_sessions", "Gate 11 requires durable recorded-playback sessions.");
requireText(migration, "fdacs_class_d_recorded_playback_challenges", "Gate 11 requires durable recorded-playback presence challenges.");
requireText(migration, "fdacs_class_d_recorded_one_active_device_idx", "Gate 11 must enforce a single active recorded-playback device per learner.");
requireText(migration, "force row level security", "Recorded-playback evidence tables must force RLS.");
requireText(migration, "revoke all on table public.fdacs_class_d_recorded_playback_sessions from public, anon, authenticated", "Direct browser access to recorded-playback evidence must be revoked.");
requireText(migration, "security definer", "Recorded-playback heartbeat credit must be server-authoritative.");
requireText(migration, "v_position_delta > v_wall_seconds + 5", "Forward seek or accelerated playback must not create instructional credit.");
requireText(migration, "p_page_visible", "Hidden-tab playback must not receive credit.");
requireText(migration, "challenge_required", "Playback must stop credit when a presence challenge is due.");
requireText(migration, "grant execute on function public.fdacs_class_d_record_recorded_playback_heartbeat", "Heartbeat RPC must be restricted to service-role execution.");

requireText(service, "OBSERRA_FDACS_CLASS_D_RECORDED_MAKEUP_ENABLED", "Recorded make-up requires an independent fail-closed feature gate.");
requireText(service, "floridaClassDMakeupEnabled()", "Recorded delivery must remain subordinate to the regulated make-up gate.");
requireText(service, "challengeIntervalMinutes: CHALLENGE_INTERVAL_MINUTES", "Gate 11 must define the presence-challenge interval.");
requireText(service, "seekForwardCreditAllowed: false", "Gate 11 must disallow forward-seek credit.");
requireText(service, "hiddenTabCreditAllowed: false", "Gate 11 must disallow hidden-tab credit.");
requireText(service, "directAssetUrlExposed: false", "Recorded media origin must not be exposed directly to the learner browser.");
requireText(service, "completionCreatesReviewEvidenceOnly: true", "Playback completion must create review evidence rather than self-certifying instructional credit.");
requireText(service, "Recorded make-up is already active on another device or session", "Gate 11 must fail closed on concurrent-device playback.");
requireText(service, "resolveFloridaClassDRecordedMedia", "Gate 11 requires server-side authorization before media origin resolution.");
requireText(service, "/api/florida-class-d/recorded-makeup/media?", "Learner playback must use the protected Obserra media proxy.");
requireText(service, "recorded-playback:", "Completed playback must create an auditable evidence reference.");
requireText(service, 'status: "ready_for_review"', "Completed playback must route the assignment to instructor review.");

requireText(api, "requireFloridaClassDSignedInUser", "Recorded make-up API must require authenticated learner identity.");
requireText(api, 'body.action === "heartbeat"', "Recorded make-up API must record server-authoritative playback heartbeats.");
requireText(api, 'body.action === "answer_challenge"', "Recorded make-up API must support presence verification.");
requireText(api, 'body.action === "complete"', "Recorded make-up API must support evidence completion.");

requireText(mediaProxy, "requireFloridaClassDSignedInUser", "Recorded media proxy must require learner authentication.");
requireText(mediaProxy, "resolveFloridaClassDRecordedMedia", "Recorded media proxy must authorize the learner, assignment, and playback session before origin access.");
requireText(mediaProxy, 'request.headers.get("range")', "Recorded media proxy must preserve byte-range playback requests.");
requireText(mediaProxy, 'cache: "no-store"', "Recorded media proxy must not cache regulated media responses.");
requireText(mediaProxy, 'redirect: "error"', "Recorded media proxy must fail closed on unexpected origin redirects.");
requireText(mediaProxy, '"x-content-type-options": "nosniff"', "Recorded media proxy must set response hardening headers.");

requireText(player, 'controlsList="nodownload noplaybackrate"', "Recorded player must discourage download and playback-rate controls.");
requireText(player, "event.currentTarget.playbackRate = 1", "Recorded player must force normal playback speed.");
requireText(player, "document.visibilityState === \"visible\"", "Recorded player must report page visibility for credit decisions.");
requireText(player, "presence challenge", "Recorded player must visibly enforce presence verification.");
requireText(portal, "RecordedMakeupPlayer", "Student make-up portal must render protected recorded playback only for recorded assignments.");
requireText(handoff, "# Florida Class D Gate 11 Handoff", "Gate 11 requires its own controlled handoff record.");

console.log("Florida Class D Gate 11 passed: protected recorded make-up playback, authenticated media proxy, single-device control, server-authoritative time evidence, presence challenges, anti-seek controls, and instructor-review handoff are validated in source.");
