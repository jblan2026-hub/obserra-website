import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const opening = fs.readFileSync("app/academy/courseOpening.ts", "utf8");
const gate = fs.readFileSync("app/academy/learn/CourseOpeningGate.tsx", "utf8");
const route = fs.readFileSync("app/academy/learn/[courseId]/page.tsx", "utf8");
const styles = fs.readFileSync("app/academy/learn/course-opening.css", "utf8");


test("every Academy learner route receives the governed course opening before CoursePlayer", () => {
  assert.match(route, /import CourseOpeningGate from "\.\.\/CourseOpeningGate"/);
  assert.match(route, /opening=\{courseOpeningForCourse\(course\)\}/);
  assert.match(route, /<CourseOpeningGate/);
  assert.doesNotMatch(route, /<CoursePlayer/);
  assert.match(gate, /const \[courseStarted, setCourseStarted\] = useState\(false\)/);
  assert.match(gate, /if \(courseStarted\)/);
  assert.match(gate, /<CoursePlayer/);
});


test("opening gate presents official title page, owner introduction, and required disclosures", () => {
  assert.match(opening, /Obserra EPI Academy/);
  assert.match(opening, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC/);
  assert.match(opening, /Dr\. Jody Blanchard/);
  assert.match(opening, /Founder and Cybersecurity Executive/);
  assert.match(opening, /Cybersecurity Foundations for New Professionals/);
  assert.match(opening, /cyber security/);
  assert.match(gate, /course-opening-title-card/);
  assert.match(gate, /Required learner disclosures/);
  assert.match(gate, /const \[acknowledged, setAcknowledged\] = useState\(false\)/);
  assert.match(gate, /type="checkbox"/);
  assert.match(gate, /checked=\{acknowledged\}/);
  assert.match(gate, /setAcknowledged\(event\.target\.checked\)/);
  assert.match(gate, /disabled=\{!canContinue\}/);
  assert.match(gate, /Acknowledge the disclosures to continue/);
  assert.match(gate, /introCompleted/);
});


test("opening runtime requires 4K mastering and precision speech cleanup without changing identity", () => {
  assert.match(opening, /masterResolution: "3840x2160"/);
  assert.match(opening, /highestSupportedProviderResolutionRequired: true/);
  assert.match(opening, /upscaleRequiredWhenSourceBelow4K: true/);
  assert.match(opening, /upscaleMustNotAlterIdentity: true/);
  assert.match(opening, /speechCleanupRequired: true/);
  assert.match(opening, /speechEnhancementMode: "precision"/);
  assert.match(opening, /cleanupMustNotAlterVoiceIdentity: true/);
  assert.match(opening, /captionsRequired: true/);
  assert.match(opening, /transcriptRequired: true/);
  assert.match(gate, /Precision cleanup without changing voice identity/);
  assert.match(gate, /Owner-approved presenter master pending/);
});


test("opening media is same-origin and fail-closed while the approved master is pending", () => {
  assert.match(opening, /status: "awaiting-owner-approved-master"/);
  assert.match(opening, /mediaReady: false/);
  assert.match(opening, /localAssetPath: null/);
  assert.match(gate, /video\.mediaReady && video\.localAssetPath/);
  assert.match(gate, /Production release remains blocked/);
  assert.doesNotMatch(gate, /<iframe/i);
  assert.doesNotMatch(gate, /app\.heygen\.com/i);
  assert.doesNotMatch(gate, /youtube\.com/i);
  assert.doesNotMatch(gate, /vimeo\.com/i);
});


test("course opening presentation is responsive and uses official Obserra visual language", () => {
  assert.match(styles, /#d6b253/i);
  assert.match(styles, /#030914/i);
  assert.match(styles, /course-opening-title-card/);
  assert.match(styles, /course-opening-disclosure-grid/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});


test("opening runtime contains no credentials or opaque provider project identifiers", () => {
  const source = `${opening}\n${gate}\n${route}`;
  for (const marker of [
    /sk_live_[a-z0-9]{16,}/i,
    /rk_live_[a-z0-9]{16,}/i,
    /whsec_[a-z0-9]{16,}/i,
    /ghp_[a-z0-9]{30,}/i,
    /github_pat_[a-z0-9_]{30,}/i,
    /sb_secret_[a-z0-9_]{20,}/i,
    /eyJhbGciOi/i,
    /BEGIN PRIVATE KEY/i,
    /9cde7d534d2c4332bd30c5e587a88003/i,
  ]) {
    assert.doesNotMatch(source, marker);
  }
});
