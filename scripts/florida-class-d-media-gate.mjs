import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const media = read("lib/florida-class-d-media.ts");
const studentApi = read("app/api/florida-class-d/media/route.ts");
const instructorApi = read("app/api/florida-class-d/admin/media/route.ts");
const studentLiveApi = read("app/api/florida-class-d/live/route.ts");
const studentUi = read("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx");
const instructorUi = read("app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx");
const nextConfig = read("next.config.ts");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${message}`);
  }
}

assert(media.includes('process.env.OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED') && media.includes('process.env.OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER') && media.includes('process.env.OBSERRA_FDACS_DAILY_API_KEY'), "media provider remains separately feature gated and server configured");
assert(media.includes('floridaClassDLiveInstructionEnabled()'), "media cannot activate without the regulated live-instruction gate");
assert(media.includes('privacy: "private"') && media.includes('enforce_unique_user_ids: true'), "Daily room is private and prevents duplicate participant user IDs");
assert(media.includes('room_name: room.name') && media.includes('eject_at_token_exp: true') && media.includes('exp: now +'), "meeting tokens are room scoped, expiring, and eject at expiration");
assert(media.includes('user_id: student.enrollmentId') && media.includes('is_owner: false'), "student Daily identity is bound to the regulated enrollment and is not owner privileged");
assert(media.includes("studentMediaLabel(enrollment.id)") && !media.includes("legal_name"), "Daily tokens use an opaque learner label while the full legal name remains in the protected Obserra evidence context");
assert(media.includes('enable_screenshare: false') && media.includes('canSend: ["video", "audio"]'), "student token cannot screen share and is limited to camera and microphone media");
assert(media.includes('user_id: shortInstructorId(actor.userId)') && media.includes('is_owner: true') && media.includes('enable_screenshare: true'), "the authenticated assigned instructor token is separately identified and can present course material");
assert(media.includes('enable_recording_ui: false') && media.includes('recordingEnabled: false'), "recording controls remain disabled by default");
assert(media.includes('enable_chat: false') && media.includes('enable_hand_raising: false'), "provider chat and hand raise are disabled so regulated LMS interaction records remain authoritative");
assert(!media.includes('NEXT_PUBLIC_DAILY') && !studentApi.includes('OBSERRA_FDACS_DAILY_API_KEY') && !instructorApi.includes('OBSERRA_FDACS_DAILY_API_KEY'), "Daily API key is never exposed through browser routes or public configuration");
assert(studentApi.includes('requireFloridaClassDSignedInUser') && instructorApi.includes('requireFloridaClassDStaff'), "student and instructor media brokers require authenticated role-appropriate access");
assert(studentLiveApi.includes('floridaClassDLiveMediaEnabled') && studentLiveApi.includes('secureMediaRequired: true'), "regulated student live join fails closed unless secure media is enabled");
assert(studentUi.includes('/api/florida-class-d/media?liveSessionId=') && studentUi.includes('<iframe') && studentUi.includes('allow="camera; microphone; fullscreen; autoplay"') && !studentUi.includes('allow="camera; microphone; fullscreen; display-capture; autoplay"'), "student live classroom embeds camera, microphone, and fullscreen without screen-share permission");
assert(instructorUi.includes('/api/florida-class-d/admin/media?liveSessionId=') && instructorUi.includes('<iframe') && instructorUi.includes('allow="camera; microphone; fullscreen; display-capture; autoplay"') && instructorUi.includes('disabled={!media?.joinUrl}'), "assigned instructor console embeds camera, microphone, fullscreen, and screen sharing and blocks lesson start until media is provisioned");
assert(studentUi.includes("Reconnect secure video") && instructorUi.includes("Reconnect secure video"), "student and instructor UIs expose actionable secure-video recovery controls");
assert(studentUi.includes("Retry secure classroom entry") && studentUi.includes("joining.current = false") && studentUi.includes('document.addEventListener("visibilitychange", onVisibility)'), "learner entry failure is retryable and visible-tab recovery renews authoritative heartbeat evidence");
assert(studentUi.includes("media.tokenExpiresAt") && studentUi.includes("10 * 60_000") && instructorUi.includes("media.tokenExpiresAt") && instructorUi.includes("10 * 60_000"), "learner and instructor clients renew short-lived Daily access before token expiry");
assert(studentUi.includes('aria-live="polite"') && instructorUi.includes('aria-live="polite"'), "governed Q&A updates are announced without using provider chat");
assert(nextConfig.includes("https://*.daily.co") && nextConfig.includes("protectedVideoParticipantHeaders") && nextConfig.includes("protectedVideoInstructorHeaders"), "CSP and protected-route Permissions-Policy authorize Daily only through explicit participant and instructor policies");
assert(nextConfig.includes('display-capture=(), fullscreen=(self "https://*.daily.co")') && nextConfig.includes('display-capture=(self "https://*.daily.co"), fullscreen='), "identity and learner routes deny display capture while the assigned-instructor route delegates it to Daily");
assert(nextConfig.includes('value: "camera=(), microphone=(), display-capture=()'), "public routes keep camera, microphone, and display capture denied by default");
assert(nextConfig.includes('source: "/florida-security-training/identity"') && nextConfig.includes('source: "/florida-security-training/live/:path*"') && nextConfig.includes('source: "/florida-security-training/admin/live/:path*"'), "device permissions are delegated only on protected identity and classroom route families");
assert(studentUi.includes("Question for the live instructor") && instructorUi.includes("Instructor announcement or class prompt") && instructorUi.includes("Live poll question"), "governed in-app Q&A, announcements, and learning polls remain operable and accessibility labeled alongside video");
assert(studentUi.includes('OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC attendance and instructional-time evidence remain independent from the media provider'), "student UI preserves the full-legal-name attendance evidence boundary");
assert(instructorUi.includes('OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC remains the system of record for attendance and instructional time'), "instructor UI preserves the full legal entity as the attendance system of record");

if (process.exitCode) {
  console.error("\nFlorida Class D secure live media gate FAILED.");
  process.exit(process.exitCode);
}

console.log("\nFlorida Class D secure live media gate passed: private Daily rooms, short-lived scoped tokens, role-specific media permissions, embedded instructor/student video, and independent attendance evidence are enforced in source.");
