import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const headSha = git("rev-parse", "HEAD");
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || git("rev-parse", "--abbrev-ref", "HEAD");
const baseRef = process.env.OBSERRA_RELEASE_BASE_REF || "origin/main";

let baseSha;
try {
  baseSha = git("rev-parse", baseRef);
} catch {
  throw new Error(`Release base ${baseRef} is unavailable. Checkout must use fetch-depth: 0.`);
}

const mergeBase = git("merge-base", headSha, baseSha);
const aheadCount = Number(git("rev-list", "--count", `${baseSha}..${headSha}`));
const behindCount = Number(git("rev-list", "--count", `${headSha}..${baseSha}`));
const changedFiles = git("diff", "--name-only", `${baseSha}...${headSha}`).split("\n").filter(Boolean);
const status = git("status", "--porcelain");

assert.equal(mergeBase, baseSha, `Branch does not descend cleanly from ${baseRef}`);
assert.equal(behindCount, 0, `Branch is ${behindCount} commit(s) behind ${baseRef}`);
assert.ok(aheadCount > 0, "Release branch contains no changes to validate");
assert.ok(changedFiles.length > 0, "Release branch contains no changed files");
assert.equal(status, "", "Working tree changed during release validation");
assert.match(branch, /^(agent\/catalog-subscription-foundation|main|HEAD)$/, `Unexpected release branch ${branch}`);

const evidence = {
  passed: true,
  macroGate: "rollback-release-evidence",
  release: {
    headSha,
    branch,
    baseRef,
    baseSha,
    mergeBase,
    aheadCount,
    behindCount,
    changedFileCount: changedFiles.length,
  },
  rollback: {
    candidateSha: baseSha,
    strategy: "redeploy-known-good-base",
    productionMutationAllowed: false,
    requiredPostRollbackChecks: [
      "health-readiness",
      "customer-journeys",
      "runtime-error-scan",
      "cross-target-parity",
    ],
  },
};

console.log(JSON.stringify(evidence, null, 2));
