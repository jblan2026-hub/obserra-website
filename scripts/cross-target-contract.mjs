import assert from "node:assert/strict";

const expectedCapabilities = [
  "authentication",
  "authorization",
  "ai-orchestration",
  "academy-catalog",
  "application-catalog",
  "telemetry",
  "health-readiness",
  "maintenance-advisor",
  "preview-publishing",
  "pricing-intelligence",
  "certificate-verification",
].sort();

const targets = [
  { key: "website-live", url: process.env.OBSERRA_WEBSITE_LIVE_URL },
  { key: "website-lcn2", url: process.env.OBSERRA_WEBSITE_LCN2_URL },
  { key: "integrated-services", url: process.env.OBSERRA_INTEGRATED_SERVICES_URL },
].filter((target) => target.url);

assert.ok(targets.length > 0, "Provide at least one OBSERRA_*_URL environment variable");

async function fetchHealth(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${target.url.replace(/\/$/, "")}/api/health`, {
      headers: { "user-agent": "ObserraCrossTargetContract/2.0" },
      signal: controller.signal,
      cache: "no-store",
    });
    assert.equal(response.status, 200, `${target.key} health returned HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
const commits = new Set();
const refs = new Set();
for (const target of targets) {
  const health = await fetchHealth(target);
  assert.equal(health.ready, true, `${target.key} is not ready`);
  assert.equal(health.target?.key, target.key, `${target.key} reported identity ${health.target?.key}`);
  assert.equal(health.platform?.sourceModel, "single-source-shared-platform", `${target.key} source model mismatch`);
  assert.deepEqual([...(health.capabilities ?? [])].sort(), expectedCapabilities, `${target.key} capability contract mismatch`);
  assert.equal(health.platform?.targetCount, 3, `${target.key} target count mismatch`);
  assert.ok(typeof health.release?.commitSha === "string" && health.release.commitSha.length >= 7, `${target.key} did not publish a commit SHA`);
  assert.ok(typeof health.release?.commitRef === "string" && health.release.commitRef.length > 0, `${target.key} did not publish a commit ref`);
  commits.add(health.release.commitSha);
  refs.add(health.release.commitRef);
  results.push({
    target: target.key,
    status: health.status,
    service: health.service,
    durationMs: health.durationMs,
    commitSha: health.release.commitSha,
    commitRef: health.release.commitRef,
    environment: health.release.environment,
  });
}

assert.equal(commits.size, 1, `Targets are running different commits: ${[...commits].join(", ")}`);
assert.equal(refs.size, 1, `Targets are running different refs: ${[...refs].join(", ")}`);

console.log(JSON.stringify({ passed: true, releaseCommit: [...commits][0], releaseRef: [...refs][0], targets: results }, null, 2));
