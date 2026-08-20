import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const SCRIPT = path.resolve("scripts/vercel-ignore-build.sh");
const VERCEL_CONFIG = path.resolve("vercel.json");
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
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

function createRepo() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-vercel-isolation-"));
  git(cwd, "init");
  fs.mkdirSync(path.join(cwd, "app"), { recursive: true });
  fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return null}\n");
  const baseline = commit(cwd, "baseline");
  fs.writeFileSync(path.join(cwd, "app", "page.tsx"), "export default function Page(){return <main/>}\n");
  commit(cwd, "runtime change");
  return { cwd, baseline };
}

test("duplicate Vercel project always skips builds for this repository", () => {
  for (const env of [
    { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "feature/runtime-change" },
    { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "main" },
    { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "hotfix/fdacs-live-domain-repair" },
  ]) {
    const { cwd, baseline } = createRepo();
    try {
      const result = runIgnore(cwd, {
        VERCEL_PROJECT_ID: DUPLICATE_PROJECT_ID,
        VERCEL_GIT_PREVIOUS_SHA: baseline,
        ...env,
      });
      assert.equal(result.status, 0, `expected duplicate project build to be skipped, stderr: ${result.stderr}`);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  }
});

test("canonical production Vercel project always builds", () => {
  const { cwd, baseline } = createRepo();
  try {
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

test("unknown Vercel project IDs fail open instead of suppressing releases", () => {
  const { cwd, baseline } = createRepo();
  try {
    const result = runIgnore(cwd, {
      VERCEL_PROJECT_ID: "prj_unknown",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_PREVIOUS_SHA: baseline,
    });
    assert.equal(result.status, 1, `expected unknown project to build, stderr: ${result.stderr}`);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test("repository config does not assign canonical custom domains to every connected Vercel project", () => {
  const config = JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8"));
  assert.equal(config.ignoreCommand, "sh scripts/vercel-ignore-build.sh");
  assert.equal(Object.hasOwn(config, "alias"), false, "custom domains must be owned in canonical Vercel Project Settings, not shared vercel.json aliases");
});
