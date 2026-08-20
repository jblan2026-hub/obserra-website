import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const SCRIPT = path.resolve("scripts/vercel-ignore-build.sh");
const PRODUCTION_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const DUPLICATE_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";

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
      ...env,
    },
    encoding: "utf8",
  });
}

function makeRepo() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-ignore-"));
  git(cwd, "init");
  fs.mkdirSync(path.join(cwd, "app"), { recursive: true });
  fs.mkdirSync(path.join(cwd, "docs", "compliance"), { recursive: true });
  fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return null}\n");
  const baseline = commit(cwd, "baseline");
  return { cwd, baseline };
}

test("duplicate Vercel project skips runtime-source builds", () => {
  const { cwd, baseline } = makeRepo();
  try {
    fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
    commit(cwd, "runtime source change");

    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: DUPLICATE_PROJECT_ID,
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_PREVIOUS_SHA: baseline,
    });
    assert.equal(result.status, 0, `expected duplicate project build to be skipped, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("duplicate Vercel project also skips hotfix and release builds", () => {
  for (const ref of ["hotfix/fdacs-production-fix", "release/production-20260820"]) {
    const { cwd, baseline } = makeRepo();
    try {
      fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
      commit(cwd, "runtime source change");
      const result = runIgnore(cwd, {
        VERCEL_PROJECT_ID: DUPLICATE_PROJECT_ID,
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: ref,
        VERCEL_GIT_PREVIOUS_SHA: baseline,
      });
      assert.equal(result.status, 0, `expected duplicate project to skip ${ref}, stderr: ${result.stderr}`);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  }
});

test("canonical production project always builds even for governed evidence-only updates", () => {
  const { cwd, baseline } = makeRepo();
  try {
    fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
    commit(cwd, "governed evidence refresh");

    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: PRODUCTION_PROJECT_ID,
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_PREVIOUS_SHA: baseline,
    });
    assert.equal(result.status, 1, `expected canonical production project to build, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("canonical production project always builds hotfix and release branches", () => {
  for (const ref of ["hotfix/fdacs-production-fix", "release/production-20260820"]) {
    const { cwd, baseline } = makeRepo();
    try {
      fs.writeFileSync(path.join(cwd, "docs", "compliance", "evidence.json"), "{}\n");
      commit(cwd, "governed evidence refresh");
      const result = runIgnore(cwd, {
        VERCEL_PROJECT_ID: PRODUCTION_PROJECT_ID,
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: ref,
        VERCEL_GIT_PREVIOUS_SHA: baseline,
      });
      assert.equal(result.status, 1, `expected canonical project to build ${ref}, stderr: ${result.stderr}`);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  }
});

test("unrecognized Vercel project IDs fail open so a release cannot be silently skipped", () => {
  const { cwd } = makeRepo();
  try {
    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: "prj_noncanonical",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
    });
    assert.equal(result.status, 1, `expected Vercel to build on an unrecognized project ID, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
