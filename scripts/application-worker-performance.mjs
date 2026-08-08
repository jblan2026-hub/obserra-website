function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function statusWeight(status) {
  if (status === "Available") return 3;
  if (status === "Pilot") return 2;
  return 1;
}

export function applicationWorkWeight(application) {
  const deploymentCount = Array.isArray(application?.deployment) ? application.deployment.length : 0;
  const integrationCount = Array.isArray(application?.integrations) ? application.integrations.length : 0;
  const featureCount = Array.isArray(application?.features) ? application.features.length : 0;
  return (deploymentCount * 100)
    + (integrationCount * 25)
    + (featureCount * 10)
    + (statusWeight(application?.status) * 20)
    + String(application?.slug ?? "").length;
}

export function assignApplicationsEvenly(applications, workerCount) {
  const count = Math.max(1, Math.trunc(finiteNumber(workerCount, 1)));
  const ordered = [...applications]
    .map((application) => ({
      ...application,
      estimatedWork: applicationWorkWeight(application),
    }))
    .sort((left, right) =>
      right.estimatedWork - left.estimatedWork
      || String(left.slug).localeCompare(String(right.slug)),
    );

  const workerLoads = Array.from({ length: count }, (_, index) => ({
    workerId: index + 1,
    totalWeight: 0,
    applications: [],
  }));

  for (const application of ordered) {
    const target = workerLoads
      .slice()
      .sort((left, right) =>
        left.totalWeight - right.totalWeight
        || left.applications.length - right.applications.length
        || left.workerId - right.workerId,
      )[0];
    target.applications.push(application);
    target.totalWeight += application.estimatedWork;
  }

  return workerLoads;
}

export function percentile(values, percentileValue) {
  const ordered = values
    .map((value) => finiteNumber(value, Number.NaN))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  if (ordered.length === 0) return 0;
  const bounded = Math.max(0, Math.min(100, finiteNumber(percentileValue, 0)));
  const rank = (bounded / 100) * (ordered.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return ordered[lower];
  return ordered[lower] + ((ordered[upper] - ordered[lower]) * (rank - lower));
}

export function summarizeApplicationWorkerEvidence(workerEvidence, expectedApplications) {
  const evidence = Array.isArray(workerEvidence) ? workerEvidence : [];
  const expected = new Set(expectedApplications.map((application) => String(application.slug)));
  const observed = [];
  const latencies = [];
  const weights = [];
  let findings = 0;

  for (const worker of evidence) {
    for (const slug of worker.assignedApplications ?? []) observed.push(String(slug));
    latencies.push(Math.max(0, finiteNumber(worker.elapsedMs, 0)));
    weights.push(Math.max(0, finiteNumber(worker.assignedWorkWeight, 0)));
    findings += Array.isArray(worker.findings) ? worker.findings.length : 0;
  }

  const observedCounts = observed.reduce((counts, slug) => {
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
    return counts;
  }, new Map());
  const missingApplications = [...expected].filter((slug) => !observedCounts.has(slug)).sort();
  const duplicateApplications = [...observedCounts]
    .filter(([, count]) => count !== 1)
    .map(([slug, count]) => ({ slug, count }))
    .sort((left, right) => left.slug.localeCompare(right.slug));
  const productiveWorkers = evidence.filter((worker) => (worker.checkedApplications ?? 0) > 0).length;
  const totalElapsedMs = latencies.reduce((total, value) => total + value, 0);
  const maxWeight = weights.length === 0 ? 0 : Math.max(...weights);
  const minProductiveWeight = weights.filter((value) => value > 0).length === 0
    ? 0
    : Math.min(...weights.filter((value) => value > 0));

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    logicalWorkers: evidence.length,
    productiveWorkers,
    idleWorkers: Math.max(0, evidence.length - productiveWorkers),
    expectedApplications: expected.size,
    observedAssignments: observed.length,
    uniqueObservedApplications: observedCounts.size,
    missingApplications,
    duplicateApplications,
    findings,
    passed: missingApplications.length === 0
      && duplicateApplications.length === 0
      && findings === 0
      && observedCounts.size === expected.size,
    averageWorkerElapsedMs: evidence.length === 0 ? 0 : Math.round(totalElapsedMs / evidence.length),
    p50WorkerElapsedMs: Math.round(percentile(latencies, 50)),
    p95WorkerElapsedMs: Math.round(percentile(latencies, 95)),
    maximumWorkerElapsedMs: latencies.length === 0 ? 0 : Math.max(...latencies),
    totalAssignedWorkWeight: weights.reduce((total, value) => total + value, 0),
    maximumWorkerWorkWeight: maxWeight,
    minimumProductiveWorkerWorkWeight: minProductiveWeight,
    productiveLoadSkew: minProductiveWeight === 0 ? 0 : Number((maxWeight / minProductiveWeight).toFixed(2)),
    claimBoundary: "This summary proves deterministic catalog validation coverage and worker evidence only. It does not prove application implementation, signed artifacts, production deployment, pricing publication, customer availability, or support readiness.",
  };
}
