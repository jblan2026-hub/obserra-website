import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const SCRIPT = path.resolve("scripts/vercel-ignore-build.sh");
const PRODUCTION_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const NON_CANONICAL_PROJECT_IDS = [
  "prj_FfAnssVJU8pcJydGNJHmCliP6Yme",
  "prj_v6Hb7FkpkUoLKlHkjzKJ5HVgYDaL",
];

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

test("every known noncanonical Vercel project skips runtime-source builds", () => {
  for (const projectId of NON_CANONICAL_PROJECT_IDS) {
    const { cwd, baseline } = makeRepo();
    try {
      fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
      commit(cwd, "runtime source change");

      const result = runIgnore(cwd, {
        VERCEL_PROJECT_ID: projectId,
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_REF: "main",
        VERCEL_GIT_PREVIOUS_SHA: baseline,
      });
      assert.equal(result.status, 0, `expected noncanonical project ${projectId} build to be skipped, stderr: ${result.stderr}`);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  }
});

test("every known noncanonical Vercel project also skips hotfix and release builds", () => {
  for (const projectId of NON_CANONICAL_PROJECT_IDS) {
    for (const ref of ["hotfix/fdacs-production-fix", "release/production-20260820"]) {
      const { cwd, baseline } = makeRepo();
      try {
        fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
        commit(cwd, "runtime source change");
        const result = runIgnore(cwd, {
          VERCEL_PROJECT_ID: projectId,
          VERCEL_ENV: "preview",
          VERCEL_GIT_COMMIT_REF: ref,
          VERCEL_GIT_PREVIOUS_SHA: baseline,
        });
        assert.equal(result.status, 0, `expected noncanonical project ${projectId} to skip ${ref}, stderr: ${result.stderr}`);
      } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
      }
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

test("unrecognized Vercel project IDs fail closed so they cannot become another deployment authority", () => {
  const { cwd } = makeRepo();
  try {
    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: "prj_noncanonical",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
    });
    assert.equal(result.status, 0, `expected unrecognized Vercel project to be suppressed, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("missing Vercel project identity also fails closed", () => {
  const { cwd } = makeRepo();
  try {
    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: "",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
    });
    assert.equal(result.status, 0, `expected missing Vercel project identity to be suppressed, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
