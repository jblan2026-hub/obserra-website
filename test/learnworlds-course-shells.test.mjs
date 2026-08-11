import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "learnworlds-course-shells.mjs");
const source = path.join(root, "app", "academy", "courseData.ts");

test("LearnWorlds shell plan validates the real 60 course catalog", () => {
  const result = spawnSync(process.execPath, [script, "--mode", "validate", "--source", source], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.passed, true);
  assert.equal(output.shellCount, 60);
  assert.equal(output.uniqueCourseIds, 60);
  assert.equal(output.uniqueSlugs, 60);
  assert.equal(output.canaryCourseId, "cybersecurity-foundations");
});

test("LearnWorlds shell generator produces governed Draft manifests", () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-learnworlds-shells-"));
  const result = spawnSync(process.execPath, [script, "--source", source, "--output", output], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const manifest = JSON.parse(fs.readFileSync(path.join(output, "learnworlds-course-shell-manifest.json"), "utf8"));
  assert.equal(manifest.shellCount, 60);
  assert.equal(manifest.shells.length, 60);
  assert.ok(manifest.shells.every((shell) => shell.accessType === "Draft"));
  assert.ok(manifest.shells.every((shell) => shell.ownerApprovalRequired === true));
  assert.ok(manifest.shells.every((shell) => shell.requiredSections.length === 7));
  assert.ok(manifest.shells.every((shell) => shell.videoStandard === "Obserra Cinematic Executive Learning Standard"));
  assert.match(manifest.automationBoundary, /No automated LearnWorlds course creation is claimed/i);
  assert.ok(fs.existsSync(path.join(output, "learnworlds-course-shell-manifest.csv")));
  assert.ok(fs.existsSync(path.join(output, "learnworlds-course-shell-validation.json")));
});

test("LearnWorlds shell generator fails closed on incomplete catalogs", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-learnworlds-shells-small-"));
  const fixture = path.join(temp, "courseData.ts");
  fs.writeFileSync(fixture, '["one-course", "One Course", "Foundation", "Cyber", "Test", "test focus"],\n', "utf8");
  const result = spawnSync(process.execPath, [script, "--mode", "validate", "--source", fixture], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /course-count:1/i);
});
