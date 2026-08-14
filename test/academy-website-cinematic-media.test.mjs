import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const page = fs.readFileSync("app/academy/page.tsx", "utf8");
const controlledClient = fs.readFileSync("app/academy/AcademyControlledClient.tsx", "utf8");
const campaigns = fs.readFileSync("app/academy/AcademyCinematicCampaigns.tsx", "utf8");
const mediaComponent = fs.readFileSync("app/components/marketing/CinematicMedia.tsx", "utf8");
const styles = fs.readFileSync("app/academy/academy-cinematic-campaigns.css", "utf8");
const envExample = fs.readFileSync(".env.example", "utf8");
const manifest = JSON.parse(fs.readFileSync("config/academy-website-cinematic-media.json", "utf8"));

test("Obserra Academy cinematic media remains disabled until approved files are deployed", () => {
  assert.equal(manifest.defaultEnabled, false);
  assert.equal(manifest.featureFlag, "NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED");
  assert.match(envExample, /NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED=false/);
  assert.match(page, /process\.env\.NEXT_PUBLIC_OBSERRA_ACADEMY_CINEMATIC_MEDIA_ENABLED === "true"/);
  assert.match(page, /cinematicMediaEnabled=\{cinematicMediaEnabled\}/);
  assert.match(controlledClient, /<AcademyCinematicCampaigns enabled=\{cinematicMediaEnabled\} \/>/);
});

test("Academy cinematic campaigns have no database, API, identity, or payment runtime path", () => {
  const imports = [...campaigns.matchAll(/^import\s+.+?\s+from\s+"([^"]+)";$/gm)].map((match) => match[1]);
  assert.deepEqual(imports, ["next/image", "next/link", "../components/marketing/CinematicMedia"]);

  for (const forbidden of [
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /EventSource/,
    /sendBeacon/,
    /\/api\//,
    /process\.env/,
    /<iframe/i,
    /<script/i,
    /dangerouslySetInnerHTML/,
    /localStorage/,
    /sessionStorage/,
    /document\.cookie/,
  ]) {
    assert.doesNotMatch(campaigns, forbidden, `Academy campaign runtime violates static media boundary: ${forbidden}`);
  }

  assert.match(campaigns, /data-security-boundary="public-static-media-only"/);
  assert.match(campaigns, /No database access/);
  assert.match(campaigns, /No external embeds/);
  assert.match(campaigns, /They do not query, write,/);
});

test("Academy media manifest explicitly denies data-plane access", () => {
  const boundary = manifest.securityBoundary;
  assert.equal(boundary.publicStaticAssetsOnly, true);
  for (const property of [
    "databaseReads",
    "databaseWrites",
    "learnerDataAccess",
    "identityDataAccess",
    "commerceDataAccess",
    "assessmentDataAccess",
    "certificateDataAccess",
    "apiRequests",
    "externalScripts",
    "externalEmbeds",
    "providerRuntimeConnection",
    "userInputAccepted",
    "cookiesRead",
    "sessionStorageRead",
    "localStorageRead",
    "databaseCredentialsRequired",
    "providerCredentialsRequiredInBrowser",
  ]) {
    assert.equal(boundary[property], false, `Security boundary must deny ${property}`);
  }
});

test("Academy campaign media uses five local governed assets and official poster fallbacks", () => {
  assert.equal(manifest.manifestId, "obserra-academy-pollo-cinematic-v1");
  assert.equal(manifest.assets.length, 5);
  assert.equal(new Set(manifest.assets.map((asset) => asset.id)).size, 5);
  assert.equal(new Set(manifest.assets.map((asset) => asset.outputPath)).size, 5);

  for (const asset of manifest.assets) {
    assert.equal(asset.status, "planned");
    assert.match(asset.outputPath, /^\/media\/pollo\/academy\/[a-z0-9-]+\.mp4$/);
    assert.match(asset.posterPath, /^\/(brand\/visuals|eios)\/[a-z0-9-]+\.png$/);
    assert.match(asset.destinationPath, /^\/academy(?:\/|$)/);
    const posterPath = path.join(root, "public", asset.posterPath.replace(/^\//, ""));
    assert.equal(fs.existsSync(posterPath), true, `Missing official Academy poster fallback: ${posterPath}`);
  }
});

test("Academy advertisements cover four governed learning pathways without live-enrollment claims", () => {
  for (const id of [
    "cybersecurity-foundations",
    "ai-governance",
    "ciso-board-leadership",
    "executive-protection-intelligence",
  ]) {
    assert.match(campaigns, new RegExp(`id: "${id}"`));
  }
  assert.match(campaigns, /View canary build/);
  assert.match(campaigns, /View AI course roadmap/);
  assert.match(campaigns, /View leadership roadmap/);
  assert.match(campaigns, /View protection roadmap/);
  assert.doesNotMatch(campaigns, /Enroll now/i);
  assert.doesNotMatch(campaigns, /Buy now/i);
  assert.doesNotMatch(campaigns, /Available now/i);
});

test("Academy cinematic playback preserves accessibility and fallback controls", () => {
  assert.match(mediaComponent, /prefers-reduced-motion: reduce/);
  assert.match(mediaComponent, /IntersectionObserver/);
  assert.match(mediaComponent, /Pause cinematic background/);
  assert.match(mediaComponent, /Play cinematic background/);
  assert.match(mediaComponent, /onError=\{\(\) => setVideoAvailable\(false\)\}/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /academy-cinematic__security-note/);
});

test("Academy cinematic configuration contains no credential values", () => {
  const source = JSON.stringify(manifest);
  for (const marker of [
    /sk_live_[a-z0-9]{16,}/i,
    /rk_live_[a-z0-9]{16,}/i,
    /whsec_[a-z0-9]{16,}/i,
    /ghp_[a-z0-9]{30,}/i,
    /github_pat_[a-z0-9_]{30,}/i,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@/i,
  ]) {
    assert.doesNotMatch(source, marker);
  }
  assert.equal(manifest.integrationMode, "manual-web-subscription");
});
