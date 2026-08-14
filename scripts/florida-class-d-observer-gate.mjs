import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260813045000_fdacs_class_d_observer_access.sql"), "utf8");
const observer = fs.readFileSync(path.join(root, "lib", "florida-class-d-observer.ts"), "utf8");
const media = fs.readFileSync(path.join(root, "lib", "florida-class-d-media.ts"), "utf8");
const adminRoute = fs.readFileSync(path.join(root, "app", "api", "florida-class-d", "admin", "observer", "route.ts"), "utf8");
const observerRoute = fs.readFileSync(path.join(root, "app", "api", "florida-class-d", "observer", "media", "route.ts"), "utf8");
const observerUi = fs.readFileSync(path.join(root, "app", "florida-security-training", "observer", "ObserverClassroom.tsx"), "utf8");
const adminUi = fs.readFileSync(path.join(root, "app", "florida-security-training", "admin", "observer", "[liveSessionId]", "ObserverGrantManager.tsx"), "utf8");
const handoff = fs.readFileSync(path.join(root, "docs", "florida-class-d-lms", "HANDOFF.md"), "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const [value, message] of [
  ["fdacs_class_d_observer_grants", "Observer access must use durable regulated grant records."],
  ["token_digest", "Observer tokens must be stored only as digests."],
  ["access_scope = 'live_observer'", "Observer grants must be restricted to live-observer scope."],
  ["expires_at", "Observer grants must expire."],
  ["revoked_at", "Observer grants must support revocation."],
  ["s.status in ('live','break')", "Observer access exchange must require an active live or break session."],
  ["force row level security", "Observer grants must force row-level security."],
  ["revoke all on table public.fdacs_class_d_observer_grants from public, anon, authenticated", "Direct browser access to observer grants must be revoked."],
  ["grant execute on function public.fdacs_class_d_record_observer_access", "Observer token exchange must be service-role controlled."],
]) requireText(migration, value, message);

for (const [value, message] of [
  ["randomBytes(32)", "Observer access tokens must use cryptographically secure random secrets."],
  ["createHash(\"sha256\")", "Observer access tokens must be digested before persistence."],
  ["durationMinutes < 15 || input.durationMinutes > 240", "Observer access must have bounded short-lived duration."],
  ["token_digest: tokenDigest", "Only the observer token digest may be persisted."],
  ["school_admin", "Observer grant creation must require school administration."],
  ["compliance_admin", "Observer grant creation must permit compliance administration."],
  ["fdacs_class_d_record_observer_access", "Observer access exchange must use the audited database function."],
  ["expiresAt: row.expires_at", "Validated observer grants must propagate their expiration to the media broker."],
]) requireText(observer, value, message);

for (const [value, message] of [
  ["getFloridaClassDObserverMediaAccess", "The media broker must expose a dedicated observer access path."],
  ["const tokenExp = Math.min(grantExp, now + 90 * 60)", "Observer media tokens must never outlive the underlying observer grant."],
  ["canSend: false", "Observer media must not transmit camera or microphone media."],
  ["canAdmin: false", "Observer media must not receive room administration rights."],
  ["enable_screenshare: false", "Observer media must not screen share."],
  ["start_video_off: true", "Observer camera must start disabled."],
  ["start_audio_off: true", "Observer microphone must start disabled."],
  ["enable_recording_ui: false", "Observer recording UI must remain disabled."],
  ["observerMode: \"view-only\"", "Observer mode must be explicitly view-only."],
]) requireText(media, value, message);

requireText(adminRoute, 'requireFloridaClassDStaff(["school_admin", "compliance_admin"])', "Only school/compliance admins may issue observer grants.");
requireText(adminRoute, "oneTimeDisplay: true", "Observer plaintext token must be treated as one-time-display material.");
requireText(adminRoute, "#access=", "Observer links must place the secret in the browser fragment rather than the server request path.");
requireText(observerRoute, "exchangeFloridaClassDObserverToken", "Observer media API must validate the temporary grant before media issuance.");
requireText(observerRoute, "getFloridaClassDObserverMediaAccess", "Observer media API must issue view-only media after grant validation.");
requireText(observerRoute, "expiresAt: grant.expiresAt", "Observer media API must bind the provider token to the validated grant expiration.");
requireText(observerUi, "window.location.hash", "Observer UI must read the temporary token from the URL fragment.");
requireText(observerUi, "window.history.replaceState", "Observer UI must remove the access fragment after reading it.");
requireText(observerUi, 'allow="fullscreen; autoplay"', "Observer iframe must not request camera, microphone, or display-capture browser permissions.");
requireText(adminUi, "The plaintext access token is not stored by OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC", "Admin UI must explain observer token handling using the full legal owner name.");
requireText(handoff, "temporary view-only observer access", "The Class D handoff must preserve the implemented Gate 7 observer control scope.");
requireText(handoff, "observer access", "The authoritative handoff must retain observer access in the regulated release boundary.");

console.log("Florida Class D Gate 7 passed: temporary regulatory observer access is bounded, auditable, revocable, grant-expiry-bound, and view-only.");
