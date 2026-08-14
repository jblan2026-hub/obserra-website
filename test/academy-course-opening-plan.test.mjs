import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "academy-course-opening-plan.mjs");
const source = path.join(root, "app", "academy", "courseData.ts");
const standardPath = path.join(root, "config", "academy-course-opening-standard.json");
const standard = JSON.parse(fs.readFileSync(standardPath, "utf8"));

function run(output, extra = []) {
  return spawnSync(process.execPath, [
    script,
    "--all",
    "--source",
    source,
    "--standard",
    standardPath,
    "--output",
    output,
    ...extra,
  ], {
    cwd: root,
    encoding: "utf8",
  });
}

test("opening standard locks the exact owner, registered brand, and EPI meaning", () => {
  assert.equal(standard.schemaVersion, "1.5.0");
  assert.equal(standard.standardId, "obserra-course-opening-v1");
  assert.equal(standard.appliesTo.allAcademyCourses, true);
  assert.equal(standard.appliesTo.requiredBeforeFirstLesson, true);
  assert.equal(standard.appliesTo.qualityTierDowngradeAllowed, false);

  assert.equal(standard.brand.presenterName, "Dr. Jody Blanchard");
  assert.equal(standard.brand.presenterTitle, "Founder and CEO");
  assert.equal(standard.brand.academyName, "Obserra EPI Academy");
  assert.equal(standard.brand.shortBusinessName, "Obserra EPI");
  assert.equal(standard.brand.epiMeaning, "Executive Protection & Intelligence");
  assert.equal(standard.brand.legalName, "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC");
  assert.equal(standard.brand.officialWebsite, "https://www.obserrallc.com");
  assert.equal(standard.brand.officialWebsiteDisplay, "www.obserrallc.com");
  assert.equal(standard.ownerIdentity.additionalOwnerTitlesAllowed, false);
  assert.equal(standard.ownerIdentity.currentOrFormerEmployerReferencesAllowed, false);

  assert.equal(standard.technicalMaster.widthPixels, 3840);
  assert.equal(standard.technicalMaster.heightPixels, 2160);
  assert.equal(standard.technicalMaster.upscaleRequiredWhenSourceBelow4K, true);
  assert.equal(standard.technicalMaster.upscaleMustNotAlterIdentity, true);
  assert.equal(standard.technicalMaster.speechCleanupRequired, true);
  assert.equal(standard.technicalMaster.speechEnhancementMode, "precision");
  assert.equal(standard.technicalMaster.cleanupMustNotAlterVoiceIdentity, true);
});

test("all 60 courses receive the exact governed title page, owner intro, disclosures, and transition", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-course-openings-"));
  const output = path.join(temp, "release");
  const result = run(output);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-course-opening-manifest.json"), "utf8"));
  assert.equal(manifest.schemaVersion, "1.1.0");
  assert.equal(manifest.courseCount, 60);
  assert.equal(manifest.openingCount, 60);
  assert.equal(manifest.fourKIntroCount, 60);
  assert.equal(manifest.speechCleanupIntroCount, 60);
  assert.equal(manifest.passed, true);
  assert.deepEqual(manifest.findings, []);

  for (const opening of manifest.openings) {
    assert.equal(opening.requiredBeforeFirstLesson, true, opening.courseId);
    assert.deepEqual(
      opening.sequence.map((item) => item.id),
      ["official-title-page", "learner-disclosures", "owner-course-introduction", "lesson-transition"],
      opening.courseId,
    );

    const title = opening.sequence[0];
    const disclaimer = opening.sequence[1];
    const intro = opening.sequence[2];

    assert.equal(title.officialLogoPath, "/brand/obserra-logo.png", opening.courseId);
    assert.equal(title.logoModificationAllowed, false, opening.courseId);
    assert.equal(title.text.academy, "Obserra EPI Academy", opening.courseId);
    assert.equal(title.text.presenter, "Presented by Dr. Jody Blanchard", opening.courseId);
    assert.equal(title.text.presenterTitle, "Founder and CEO", opening.courseId);
    assert.equal(title.text.legalName, "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC", opening.courseId);
    assert.equal(title.text.officialWebsite, "www.obserrallc.com", opening.courseId);

    assert.equal(disclaimer.learnerAcknowledgementRequired, true, opening.courseId);
    assert.ok(disclaimer.statements.length >= 5, opening.courseId);

    assert.equal(intro.presenter, "Dr. Jody Blanchard", opening.courseId);
    assert.equal(intro.presenterTitle, "Founder and CEO", opening.courseId);
    assert.deepEqual(intro.lowerThird, {
      line1: "Dr. Jody Blanchard",
      line2: "Founder and CEO",
      line3: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
      line4: "www.obserrallc.com",
    }, opening.courseId);
    assert.equal(intro.identityControls.facialIdentityLocked, true, opening.courseId);
    assert.equal(intro.identityControls.voiceIdentityLocked, true, opening.courseId);
    assert.equal(intro.identityControls.nameAndApprovedTitleLocked, true, opening.courseId);
    assert.equal(intro.identityControls.additionalTitlesAllowed, false, opening.courseId);
    assert.equal(intro.identityControls.employerReferencesAllowed, false, opening.courseId);
    assert.equal(intro.identityControls.naturalFacialMovementCharacterLocked, true, opening.courseId);
    assert.equal(intro.identityControls.scriptMayChangeByCourse, true, opening.courseId);
    assert.equal(intro.voiceSettings.defaultSpeed, 0.92, opening.courseId);
    assert.equal(intro.speechCleanup.required, true, opening.courseId);
    assert.equal(intro.speechCleanup.mode, "precision", opening.courseId);
    assert.equal(intro.speechCleanup.backgroundNoiseReductionRequired, true, opening.courseId);
    assert.equal(intro.speechCleanup.cleanupMustNotAlterVoiceIdentity, true, opening.courseId);
    assert.equal(intro.finalMaster.widthPixels, 3840, opening.courseId);
    assert.equal(intro.finalMaster.heightPixels, 2160, opening.courseId);
    assert.equal(intro.finalMaster.upscaleRequiredWhenSourceBelow4K, true, opening.courseId);
    assert.equal(intro.finalMaster.upscaleMustNotAlterIdentity, true, opening.courseId);
    assert.equal(intro.finalMaster.speechCleanupRequired, true, opening.courseId);
    assert.equal(intro.finalMaster.speechEnhancementMode, "precision", opening.courseId);
  }
});

test("Cybersecurity Foundations uses only the approved owner title and pronunciation safe wording", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-foundations-opening-"));
  const output = path.join(temp, "release");
  const result = run(output);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-course-opening-manifest.json"), "utf8"));
  const course = manifest.openings.find((item) => item.courseId === "cybersecurity-foundations");
  assert.ok(course);
  const intro = course.sequence.find((item) => item.id === "owner-course-introduction");

  assert.match(intro.script, /Cybersecurity Foundations for New Professionals/);
  assert.match(intro.script, /cyber security/);
  assert.match(intro.script, /Dr\. Jody Blanchard/);
  assert.match(intro.script, /Founder and CEO/);
  assert.match(intro.script, /Obserra Executive Protection and Intelligence/);
  assert.doesNotMatch(intro.script, /Owner, Founder, and Cybersecurity Executive/i);
  assert.doesNotMatch(intro.script, /Founder and Cybersecurity Executive/i);
  assert.doesNotMatch(intro.script, /Chief Information Security Officer|\bCISO\b/i);
});

test("validation mode confirms speech cleaned 4K opening parity without writing outputs", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-course-opening-validation-"));
  const output = path.join(temp, "release");
  const result = run(output, ["--mode", "validate"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Validation passed for 60 course opening/i);
  assert.match(result.stdout, /speech-cleaned 4K master before the first lesson/i);
  assert.equal(fs.existsSync(output), false);
});

test("opening standard contains no credentials or provider project identifiers", () => {
  const sourceText = JSON.stringify(standard);
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
    /7da10cc3dd9441ccb2825805c6e5270b/i,
  ]) {
    assert.doesNotMatch(sourceText, marker);
  }
});
