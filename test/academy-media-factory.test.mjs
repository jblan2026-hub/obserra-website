import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "academy-media-factory.mjs");
const config = path.join(root, "config", "academy-media-factory.json");
const realCatalog = path.join(root, "app", "academy", "courseData.ts");

function fixture(count = 60) {
  return Array.from({ length: count }, (_, index) => {
    const id = `course-${String(index + 1).padStart(2, "0")}`;
    return `["${id}", "Course ${index + 1}", "Professional", "Cyber", "Test Academy", "governed decision making ${index + 1}"],`;
  }).join("\n");
}

function runFactory(source, output, extra = []) {
  return spawnSync(process.execPath, [script, "--all", "--source", source, "--config", config, "--output", output, ...extra], {
    cwd: root,
    encoding: "utf8",
  });
}

test("factory generates the common cinematic enterprise package for a full portfolio", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-"));
  const source = path.join(temp, "courseData.ts");
  const output = path.join(temp, "release");
  fs.writeFileSync(source, fixture(), "utf8");
  const result = runFactory(source, output);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-media-job-manifest.json"), "utf8"));
  assert.equal(manifest.courseCount, 60);
  assert.equal(manifest.jobCount, 1020);
  assert.equal(manifest.productionStandard.standardId, "obserra-cinematic-enterprise-v1");
  assert.equal(manifest.productionStandard.qualityClass, "cinematic-enterprise");
  assert.equal(manifest.productionStandard.sameQualityStandardForEveryCourse, true);
  assert.ok(manifest.jobs.every((job) => job.ownerApprovalRequired));
  assert.ok(manifest.jobs.every((job) => job.syntheticMediaDisclosureRequired));
  assert.ok(manifest.jobs.every((job) => job.productionProfile.standardId === "obserra-cinematic-enterprise-v1"));
  assert.ok(manifest.jobs.every((job) => job.productionProfile.scenePlanRequired));
  assert.ok(manifest.jobs.every((job) => job.productionProfile.shotListRequired));
});

test("factory refuses catalogs below the minimum expected size", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-small-"));
  const source = path.join(temp, "courseData.ts");
  fs.writeFileSync(source, fixture(2), "utf8");
  const result = runFactory(source, path.join(temp, "release"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /expected at least 60/i);
});

test("factory validates the real 60-course Academy catalog and exact cinematic totals", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-real-"));
  const output = path.join(temp, "release");
  const result = runFactory(realCatalog, output);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-media-job-manifest.json"), "utf8"));
  assert.equal(manifest.courseCount, 60);
  assert.equal(manifest.jobCount, 1020);
  assert.equal(manifest.jobs.filter((job) => job.provider === "heygen").length, 420);
  assert.equal(manifest.jobs.filter((job) => job.provider === "pollo").length, 600);
  assert.equal(manifest.courses.filter((course) => course.tier === "flagship").length, 10);
  assert.equal(manifest.courses.filter((course) => course.tier === "standard").length, 15);
  assert.equal(manifest.courses.filter((course) => course.tier === "catalog").length, 35);
  assert.ok(manifest.courses.every((course) => course.qualityClass === "cinematic-enterprise"));
});

test("every course receives five module films and five cinematic module visual packs", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-parity-"));
  const output = path.join(temp, "release");
  const result = runFactory(realCatalog, output);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-media-job-manifest.json"), "utf8"));

  for (const course of manifest.courses) {
    const jobs = manifest.jobs.filter((job) => job.courseId === course.id);
    assert.equal(jobs.filter((job) => job.provider === "heygen").length, 7, course.id);
    assert.equal(jobs.filter((job) => job.provider === "pollo").length, 10, course.id);
    assert.equal(jobs.filter((job) => job.assetType.startsWith("module-anchor-film-")).length, 5, course.id);
    assert.equal(jobs.filter((job) => job.assetType.startsWith("module-cinematic-visual-pack-")).length, 5, course.id);
    assert.ok(jobs.filter((job) => job.provider === "heygen").every((job) => job.productionProfile.maximumUnbrokenAvatarSeconds === 20), course.id);
    assert.ok(jobs.every((job) => job.productionProfile.minimumWidthPixels >= 1920), course.id);
    assert.ok(jobs.every((job) => job.productionProfile.minimumHeightPixels >= 1080), course.id);
  }
});

test("validation mode enforces the cinematic standard without writing a portfolio claim", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-validate-"));
  const result = runFactory(realCatalog, path.join(temp, "release"), ["--mode", "validate"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /1020 cinematic assets/i);
  assert.match(result.stdout, /obserra-cinematic-enterprise-v1/i);
});
