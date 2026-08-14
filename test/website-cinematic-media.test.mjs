import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const page = fs.readFileSync("app/page.tsx", "utf8");
const mediaComponent = fs.readFileSync("app/components/marketing/CinematicMedia.tsx", "utf8");
const campaignComponent = fs.readFileSync("app/components/marketing/WebsiteCampaignAds.tsx", "utf8");
const styles = fs.readFileSync("app/cinematic-media.css", "utf8");
const envExample = fs.readFileSync(".env.example", "utf8");
const manifest = JSON.parse(fs.readFileSync("config/website-cinematic-media.json", "utf8"));

test("website cinematic media remains fail closed until approved assets are present", () => {
  assert.equal(manifest.defaultEnabled, false);
  assert.equal(manifest.featureFlag, "NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED");
  assert.match(envExample, /NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false/);
  assert.match(page, /process\.env\.NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED === "true"/);
  assert.match(mediaComponent, /data-media-mode="poster"/);
  assert.match(mediaComponent, /onError=\{\(\) => setVideoAvailable\(false\)\}/);
});

test("cinematic media supports viewport playback, user pause, and reduced motion", () => {
  assert.match(mediaComponent, /IntersectionObserver/);
  assert.match(mediaComponent, /prefers-reduced-motion: reduce/);
  assert.match(mediaComponent, /Pause cinematic background/);
  assert.match(mediaComponent, /Play cinematic background/);
  assert.match(mediaComponent, /muted/);
  assert.match(mediaComponent, /playsInline/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /cinematic-media__control/);
});

test("homepage replaces selected static visuals through governed cinematic slots", () => {
  assert.match(page, /obserra-eios-intelligence-hero-loop-12s\.mp4/);
  assert.match(page, /obserra-eios-platform-loop-12s\.mp4/);
  assert.match(page, /poster="\/brand\/visuals\/obserra-eios-intelligence-hero\.png"/);
  assert.match(page, /poster="\/eios\/eios-overview-marketing\.png"/);
  assert.match(page, /<WebsiteCampaignAds enabled=\{cinematicMediaEnabled\} \/>/);
});

test("official brand website campaign cards cover four business pathways", () => {
  for (const campaignId of [
    "executive-intelligence",
    "academy",
    "protection-intelligence",
    "cybersecurity",
  ]) {
    assert.match(campaignComponent, new RegExp(`id: "${campaignId}"`));
  }
  assert.match(campaignComponent, /\/brand\/obserra-logo\.png/);
  assert.match(campaignComponent, /Explore Obserra EIOS/);
  assert.match(campaignComponent, /Browse Academy courses/);
  assert.match(campaignComponent, /Explore protection intelligence/);
  assert.match(campaignComponent, /Explore cybersecurity advisory/);
  assert.match(styles, /mission-campaigns__grid/);
});

test("cinematic website manifest contains six governed assets and valid poster fallbacks", () => {
  assert.equal(manifest.manifestId, "obserra-website-pollo-cinematic-v1");
  assert.equal(manifest.provider, "pollo-ai");
  assert.equal(manifest.assets.length, 6);
  assert.equal(new Set(manifest.assets.map((asset) => asset.id)).size, 6);
  assert.equal(new Set(manifest.assets.map((asset) => asset.outputPath)).size, 6);
  assert.ok(manifest.assets.every((asset) => asset.status === "planned"));
  assert.ok(manifest.assets.every((asset) => asset.outputPath.endsWith(".mp4")));
  assert.ok(manifest.assets.every((asset) => asset.posterPath.endsWith(".png")));

  for (const asset of manifest.assets) {
    const posterPath = path.join(root, "public", asset.posterPath.replace(/^\//, ""));
    assert.equal(fs.existsSync(posterPath), true, `Missing poster fallback for ${asset.id}: ${posterPath}`);
  }
});

test("website media configuration contains no provider credentials or automatic spend authorization", () => {
  const source = JSON.stringify(manifest);
  assert.doesNotMatch(source, /api[_-]?key\s*:/i);
  assert.doesNotMatch(source, /access[_-]?token\s*:/i);
  assert.doesNotMatch(source, /client[_-]?secret\s*:/i);
  assert.doesNotMatch(source, /automatic[_-]?refill\s*:\s*true/i);
  assert.equal(manifest.integrationMode, "manual-web-subscription");
});
