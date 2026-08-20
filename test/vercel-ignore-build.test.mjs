import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const SCRIPT = path.resolve("scripts/vercel-ignore-build.sh");
const PRODUCTION_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const INTEGRATION_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd, message) {
  git(cwd, "add", ".");
  git(cwd, "-c", "user.name=Obserra CI", "-c", "user.email=ci@obserrallc.com", "commit", "-m", message);
  return git(cwd, "rev-parse", "HEAD");
}

function runIgnore(cwd, env = {}) {
  return spawnSync("sh", [SCRIPT], {
    cwd,
    env: {
      ...process.env,
      VERCEL_PROJECT_ID: INTEGRATION_PROJECT_ID,
      VERCEL_ENV: "preview",
      ...env,
    },
    encoding: "utf8",
  });
}

test("integration preview build continues when relevant source changed before an evidence-only follow-up", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
  try {
    git(cwd, "init");
    fs.mkdirSync(path.join(cwd, "app"), { recursive: true });
    fs.mkdirSync(path.join(cwd, "docs", "compliance"), { recursive: true });
    fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return null}\n");
    const baseline = commit(cwd, "baseline");

    fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
    commit(cwd, "relevant source change");

    fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
    commit(cwd, "evidence refresh");

    const result = runIgnore(cwd, { VERCEL_GIT_PREVIOUS_SHA: baseline });
    assert.equal(result.status, 1, `expected Vercel to continue integration preview build, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("integration preview skips governed evidence-only updates when runtime source did not change", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
  try {
    git(cwd, "init");
    fs.mkdirSync(path.join(cwd, "app"), { recursive: true });
    fs.mkdirSync(path.join(cwd, ".github", "workflows"), { recursive: true });
    fs.mkdirSync(path.join(cwd, "docs", "compliance"), { recursive: true });
    fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return null}\n");
    const baseline = commit(cwd, "baseline");

    fs.writeFileSync(path.join(cwd, ".github", "workflows", "evidence.yml"), "name: Evidence\n");
    fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
    commit(cwd, "governed evidence refresh");

    const result = runIgnore(cwd, { VERCEL_GIT_PREVIOUS_SHA: baseline });
    assert.equal(result.status, 0, `expected Vercel to skip evidence-only integration preview build, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("production project always builds even for governed evidence-only updates", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
  try {
    git(cwd, "init");
    fs.mkdirSync(path.join(cwd, "docs", "compliance"), { recursive: true });
    fs.writeFileSync(path.join(cwd, "README.md"), "baseline\n");
    const baseline = commit(cwd, "baseline");

    fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
    commit(cwd, "governed evidence refresh");

    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: PRODUCTION_PROJECT_ID,
      VERCEL_GIT_PREVIOUS_SHA: baseline,
    });
    assert.equal(result.status, 1, `expected canonical production project to build, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("hotfix and release branches always build so exact release SHAs can be promoted", () => {
  for (const ref of ["hotfix/owner-lms-test-access-20260817", "release/fdacs-lms-production-20260817"]) {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
    try {
      git(cwd, "init");
      fs.mkdirSync(path.join(cwd, "docs", "compliance"), { recursive: true });
      fs.writeFileSync(path.join(cwd, "README.md"), "baseline\n");
      const baseline = commit(cwd, "baseline");

      fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
      commit(cwd, "evidence-only release update");

      const result = runIgnore(cwd, {
        VERCEL_GIT_PREVIOUS_SHA: baseline,
        VERCEL_GIT_COMMIT_REF: ref,
      });
      assert.equal(result.status, 1, `expected Vercel to build ${ref}, stderr: ${result.stderr}`);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  }
});

test("unrecognized Vercel project IDs fail open so a release cannot be silently skipped", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
  try {
    git(cwd, "init");
    fs.writeFileSync(path.join(cwd, "README.md"), "baseline\n");
    commit(cwd, "baseline");
    const result = runIgnore(cwd, { VERCEL_PROJECT_ID: "prj_noncanonical" });
    assert.equal(result.status, 1, `expected Vercel to build on an unrecognized project ID, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
