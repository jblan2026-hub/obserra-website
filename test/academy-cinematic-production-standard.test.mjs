import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const standard = JSON.parse(
  fs.readFileSync("config/academy-cinematic-production-standard.json", "utf8"),
);
const configuration = JSON.parse(
  fs.readFileSync("config/academy-media-factory.json", "utf8"),
);
const factory = fs.readFileSync("scripts/academy-media-factory.mjs", "utf8");
const productionDocument = fs.readFileSync(
  "docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md",
  "utf8",
);

const commonGates = new Set(configuration.qualityGates.common);
const heygenGates = new Set(configuration.qualityGates.heygen);
const polloGates = new Set(configuration.qualityGates.pollo);
const standardText = JSON.stringify(standard);

test("cinematic enterprise standard applies equally to every Academy course", () => {
  assert.equal(configuration.schemaVersion, "1.2.0");
  assert.equal(standard.standardId, "obserra-cinematic-enterprise-v1");
  assert.equal(standard.qualityClass, "cinematic-enterprise");
  assert.equal(standard.appliesTo.allAcademyCourses, true);
  assert.equal(standard.appliesTo.qualityTierDowngradeAllowed, false);
  assert.equal(configuration.productionStandard.sameQualityStandardForEveryCourse, true);
  assert.equal(configuration.productionStandard.tierMayChangeReleasePriorityOnly, true);
  assert.equal(configuration.productionStandard.tierMayNotReduceVideoQuality, true);
  assert.equal(configuration.productionStandard.standardId, standard.standardId);
});

test("course architecture requires five cinematic module films and prevents robotic avatar-only production", () => {
  assert.equal(standard.courseVideoArchitecture.requiredInstructionalModules, 5);
  assert.equal(standard.courseVideoArchitecture.maximumUnbrokenAvatarSeconds, 20);
  assert.equal(standard.courseVideoArchitecture.minimumDistinctVisualContextsPerModule, 4);
  assert.equal(standard.courseVideoArchitecture.scenePlanRequired, true);
  assert.equal(standard.courseVideoArchitecture.shotListRequired, true);
  assert.equal(standard.courseVideoArchitecture.editDecisionListRequired, true);
  assert.equal(standard.presenterPerformance.roboticCadenceProhibited, true);
  assert.equal(standard.presenterPerformance.continuousMonologueWithoutVisualReliefProhibited, true);
  assert.equal(configuration.annualPlan.heyGenAssetsPerCourse, 7);
  assert.equal(configuration.annualPlan.polloAssetsPerCourse, 10);
  assert.equal(configuration.annualPlan.targetTotalAssets, 1020);
  assert.match(factory, /module-anchor-film-/);
  assert.match(factory, /module-cinematic-visual-pack-/);
});

test("all media jobs inherit cinematic, anti robotic, and LearnWorlds playback gates", () => {
  for (const gate of [
    "cinematic-enterprise-standard-applied",
    "cinematic-story-arc-approved",
    "scene-plan-shot-list-and-storyboard-approved",
    "no-robotic-slide-deck-pacing",
    "no-uninterrupted-avatar-monologue-over-20-seconds",
    "scene-variety-and-editorial-rhythm-passed",
    "executive-documentary-visual-standard-passed",
    "professional-sound-mix-passed",
    "learnworlds-desktop-and-mobile-player-experience-passed",
  ]) {
    assert.ok(commonGates.has(gate), `Missing common cinematic gate: ${gate}`);
  }
  assert.match(factory, /const common = \[\.\.\.config\.qualityGates\.common\]/);
});

test("HeyGen gates require realistic human delivery and short presenter segments", () => {
  for (const gate of [
    "likeness-and-voice-similarity-review-passed",
    "natural-pacing-pauses-and-executive-tone",
    "robotic-cadence-prohibited",
    "maximum-20-seconds-unbroken-avatar",
    "presenter-screen-time-between-35-and-55-percent",
    "natural-breathing-pauses-and-emphasis",
    "realistic-eye-contact-blinks-and-gestures",
    "presenter-cutaways-mask-avatar-repetition",
    "multiple-framing-options-approved",
    "no-uncanny-valley-artifacts",
  ]) {
    assert.ok(heygenGates.has(gate), `Missing HeyGen realism gate: ${gate}`);
  }
});

test("Pollo gates require module-specific cinematic continuity and physical plausibility", () => {
  for (const gate of [
    "module-specific-cinematic-visual-pack",
    "minimum-four-distinct-visual-contexts-per-module",
    "motivated-camera-and-lighting-review-passed",
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

test("cinematic masters meet enterprise video, audio, accessibility, and LearnWorlds baselines", () => {
  assert.equal(standard.visualMaster.container, "MP4");
  assert.equal(standard.visualMaster.videoCodec, "H.264");
  assert.equal(standard.visualMaster.minimumWidthPixels, 1920);
  assert.equal(standard.visualMaster.minimumHeightPixels, 1080);
  assert.equal(standard.visualMaster.colorSpace, "Rec.709");
  assert.equal(standard.audioMaster.sampleRateHz, 48000);
  assert.equal(standard.audioMaster.maximumTruePeakDbtp, -1);
  assert.equal(standard.audioMaster.musicFreeMasterRequired, true);
  assert.equal(standard.learnWorldsDelivery.selectableCaptionsRequired, true);
  assert.equal(standard.learnWorldsDelivery.verifiedTranscriptRequired, true);
  assert.equal(standard.learnWorldsDelivery.knowledgeCheckAfterModuleVideoRequired, true);
  assert.equal(standard.learnWorldsDelivery.mobilePlaybackRequired, true);
  assert.equal(standard.learnWorldsDelivery.desktopPlaybackRequired, true);
  assert.equal(standard.learnWorldsDelivery.placeholderTemplateContentProhibited, true);
});

test("production standard document prohibits robotic and low quality course patterns", () => {
  assert.match(productionDocument, /robotic avatar presentation/i);
  assert.match(productionDocument, /no uninterrupted avatar segment may exceed 20 seconds/i);
  assert.match(productionDocument, /full course videos consisting only of a talking avatar/i);
  assert.match(productionDocument, /robotic narration over static slides/i);
  assert.match(productionDocument, /learnworlds learner experience/i);
  assert.match(productionDocument, /same cinematic quality standard/i);
});

test("cinematic configuration and standard contain no credential values", () => {
  for (const marker of [
    /api[_-]?key["']?\s*:\s*["'][^"']+/i,
    /access[_-]?token["']?\s*:\s*["'][^"']+/i,
    /client[_-]?secret["']?\s*:\s*["'][^"']+/i,
    /webhook[_-]?secret["']?\s*:\s*["'][^"']+/i,
    /sk[-_][a-z0-9]/i,
  ]) {
    assert.doesNotMatch(standardText, marker);
  }
});