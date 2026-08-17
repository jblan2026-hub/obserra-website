import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const CANONICAL_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function makeRepo() {
  const cwd = mkdtempSync(join(tmpdir(), "obserra-vercel-ignore-"));
  mkdirSync(join(cwd, "scripts"), { recursive: true });
  mkdirSync(join(cwd, "app"), { recursive: true });
  copyFileSync(new URL("../scripts/vercel-ignore-build.sh", import.meta.url), join(cwd, "scripts/vercel-ignore-build.sh"));
  git(cwd, "init", "-q");
  git(cwd, "config", "user.email", "qa@example.com");
  git(cwd, "config", "user.name", "QA");
  writeFileSync(join(cwd, "README.md"), "baseline\n");
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "baseline");
  const baseline = git(cwd, "rev-parse", "HEAD");
  writeFileSync(join(cwd, "app/page.tsx"), "export default function Page() { return null; }\n");
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "site change");
  writeFileSync(join(cwd, "README.md"), "baseline\nevidence-only follow-up\n");
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "evidence follow-up");
  return { cwd, baseline };
}

test("canonical preview deploys when relevant source changed since the last successful deployment", () => {
  const { cwd, baseline } = makeRepo();
  const result = spawnSync("sh", ["scripts/vercel-ignore-build.sh"], {
    cwd,
    env: {
      ...process.env,
      VERCEL_PROJECT_ID: CANONICAL_PROJECT_ID,
      VERCEL_ENV: "preview",
      VERCEL_GIT_PREVIOUS_SHA: baseline,
    },
  });

  assert.equal(result.status, 1, `expected build to continue; stderr=${result.stderr?.toString() ?? ""}`);
});
