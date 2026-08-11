import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const configuration = JSON.parse(
  fs.readFileSync("config/academy-media-factory.json", "utf8"),
);
const factory = fs.readFileSync("scripts/academy-media-factory.mjs", "utf8");
const standard = fs.readFileSync(
  "docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md",
  "utf8",
);

const production = configuration.productionStandard;
const commonGates = new Set(configuration.qualityGates.common);
const heygenGates = new Set(configuration.qualityGates.heygen);
const polloGates = new Set(configuration.qualityGates.pollo);

test("cinematic standard defines executive documentary production controls", () => {
  assert.equal(configuration.schemaVersion, "1.1.0");
  assert.equal(production.targetAesthetic, "cinematic-fortune-500-executive-documentary");
  assert.equal(production.minimumMasterResolution, "1920x1080");
  assert.equal(production.preferredFlagshipMasterResolution, "3840x2160");
  assert.equal(production.audioSampleRateHz, 48000);
  assert.equal(production.maximumContinuousPresenterSeconds, 75);
  assert.equal(production.minimumDistinctVisualSetupsPerFiveMinutes, 8);
  assert.deepEqual(production.presenterScreenTimeTargetPercent, [30, 45]);
  assert.deepEqual(production.cinematicVisualTargetPercent, [30, 45]);
  assert.equal(production.releaseScore.minimumCategoryScore, 4);
  assert.equal(production.releaseScore.flagshipMinimumAverage, 4.5);
});

test("all media jobs inherit anti robotic and cinematic quality gates", () => {
  for (const gate of [
    "cinematic-story-arc-approved",
    "shot-list-and-storyboard-approved",
    "no-robotic-slide-deck-pacing",
    "no-uninterrupted-avatar-monologue-over-75-seconds",
    "scene-variety-and-editorial-rhythm-passed",
    "executive-documentary-visual-standard-passed",
    "professional-sound-mix-passed",
    "learnworlds-player-experience-passed",
  ]) {
    assert.ok(commonGates.has(gate), `Missing common cinematic gate: ${gate}`);
  }
  assert.match(factory, /const common = \[\.\.\.config\.qualityGates\.common\]/);
});

test("HeyGen quality gates require realistic human delivery", () => {
  for (const gate of [
    "natural-breathing-pauses-and-emphasis",
    "realistic-eye-contact-blinks-and-gestures",
    "presenter-cutaways-mask-avatar-repetition",
    "multiple-framing-options-approved",
    "no-uncanny-valley-artifacts",
    "4k-preferred-for-flagship-1080p-minimum",
  ]) {
    assert.ok(heygenGates.has(gate), `Missing HeyGen realism gate: ${gate}`);
  }
});

test("Pollo quality gates require cinematic continuity and physical plausibility", () => {
  for (const gate of [
    "physically-plausible-motion-and-lighting",
    "cinematic-camera-language-and-continuity",
    "consistent-characters-locations-and-props",
    "no-generic-looping-stock-look",
    "no-morphing-anatomy-or-object-errors",
    "no-excessive-neon-or-science-fiction-gimmicks",
    "editorial-safe-head-and-tail-handles",
  ]) {
    assert.ok(polloGates.has(gate), `Missing Pollo cinematic gate: ${gate}`);
  }
});

test("production standard prohibits robotic and low quality course patterns", () => {
  assert.match(standard, /not a robotic avatar presentation/i);
  assert.match(standard, /No single presenter shot should normally remain uninterrupted for more than 75 seconds/i);
  assert.match(standard, /at least eight distinct visual setups/i);
  assert.match(standard, /Full course videos consisting only of a talking avatar/i);
  assert.match(standard, /Robotic narration over static slides/i);
  assert.match(standard, /No category below 4/i);
  assert.match(standard, /Average score of at least 4\.5 for flagship content/i);
  assert.match(standard, /LearnWorlds learner experience/i);
});
