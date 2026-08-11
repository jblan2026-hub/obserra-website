import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "learnworlds-course-shell-plan.mjs");
const catalog = path.join(root, "app", "academy", "courseData.ts");
const mappings = path.join(root, "config", "learnworlds-products.json");

function runPlan(extra = []) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-lw-shell-plan-"));
  const output = path.join(temporary, "plan.json");
  const result = spawnSync(process.execPath, [script, "--catalog", catalog, "--mappings", mappings, "--output", output, ...extra], {
    cwd: root,
    encoding: "utf8",
  });
  return { result, output };
}

test("LearnWorlds shell plan reconciles the governed 60-course catalog", () => {
  const { result, output } = runPlan();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const plan = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(plan.targetCourseCount, 60);
  assert.equal(plan.shells.length, 60);
  assert.equal(plan.preserveCount, 1);
  assert.equal(plan.createCount, 59);
  assert.equal(plan.conflictCount, 0);
  assert.equal(plan.executionAuthorized, false);
  assert.equal(plan.executionMode, "plan-only");
});

test("existing Cybersecurity Foundations shell is preserved and never duplicated", () => {
  const { result, output } = runPlan();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const plan = JSON.parse(fs.readFileSync(output, "utf8"));
  const canary = plan.shells.find((shell) => shell.courseId === "cybersecurity-foundations");
  assert.ok(canary);
  assert.equal(canary.action, "preserve");
  assert.equal(canary.learnWorldsCourseId, "cybersecurity-foundations-for-new-professionals");
  assert.equal(canary.learnerAccess, "preserve-existing-state");
});

test("all planned new shells remain private, unpublished, and unavailable for checkout", () => {
  const { result, output } = runPlan();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const plan = JSON.parse(fs.readFileSync(output, "utf8"));
  const creates = plan.shells.filter((shell) => shell.action === "create-draft");
  assert.equal(creates.length, 59);
  assert.ok(creates.every((shell) => shell.visibility === "draft-private"));
  assert.ok(creates.every((shell) => shell.publish === false));
  assert.ok(creates.every((shell) => shell.checkoutEnabled === false));
  assert.ok(creates.every((shell) => shell.learnerAccess === "none"));
});

test("shell plan validation runs without writing an execution artifact", () => {
  const { result, output } = runPlan(["--validate-only"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(output), false);
  const status = JSON.parse(result.stdout);
  assert.equal(status.passed, true);
  assert.equal(status.targetCourseCount, 60);
  assert.equal(status.preserveCount, 1);
  assert.equal(status.createCount, 59);
  assert.equal(status.executionAuthorized, false);
});