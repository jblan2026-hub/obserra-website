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

test("factory generates governed jobs for a full portfolio", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-"));
  const source = path.join(temp, "courseData.ts");
  const output = path.join(temp, "release");
  fs.writeFileSync(source, fixture(), "utf8");
  const result = spawnSync(process.execPath, [script, "--all", "--source", source, "--config", config, "--output", output], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-media-job-manifest.json"), "utf8"));
  assert.equal(manifest.courseCount, 60);
  assert.ok(manifest.jobCount > 400);
  assert.ok(manifest.jobs.some((job) => job.provider === "heygen"));
  assert.ok(manifest.jobs.some((job) => job.provider === "pollo"));
  assert.ok(manifest.jobs.every((job) => job.ownerApprovalRequired));
  assert.ok(manifest.jobs.every((job) => job.syntheticMediaDisclosureRequired));
});

test("factory refuses catalogs below the minimum expected size", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-small-"));
  const source = path.join(temp, "courseData.ts");
  fs.writeFileSync(source, fixture(2), "utf8");
  const result = spawnSync(process.execPath, [script, "--all", "--source", source, "--config", config, "--output", path.join(temp, "release")], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /expected at least 60/i);
});

test("factory validates the real 60-course Academy catalog and exact annual asset totals", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-factory-real-"));
  const output = path.join(temp, "release");
  const result = spawnSync(process.execPath, [script, "--all", "--source", realCatalog, "--config", config, "--output", output], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "academy-media-job-manifest.json"), "utf8"));
  assert.equal(manifest.courseCount, 60);
  assert.equal(manifest.jobCount, 585);
  assert.equal(manifest.jobs.filter((job) => job.provider === "heygen").length, 250);
  assert.equal(manifest.jobs.filter((job) => job.provider === "pollo").length, 335);
  assert.equal(manifest.courses.filter((course) => course.tier === "flagship").length, 10);
  assert.equal(manifest.courses.filter((course) => course.tier === "standard").length, 15);
  assert.equal(manifest.courses.filter((course) => course.tier === "catalog").length, 35);
});
