import assert from "node:assert/strict";
import fs from "node:fs";

function read(path) {
  assert.ok(fs.existsSync(path), `Required operational file missing: ${path}`);
  return fs.readFileSync(path, "utf8");
}

const performance = read("scripts/performance-isolation-gate.mjs");
const health = read("app/api/health/route.ts");
const monitor = read("lib/control-room-monitor.ts");
const cron = read("app/api/cron/control-room-health/route.ts");
const live = read("app/api/admin/operations/live/route.ts");
const vercel = JSON.parse(read("vercel.json"));

assert.match(performance, /PUBLIC_PAGE_BUDGET_MS|4_500|4500/, "Public-page latency budget must be explicit");
assert.match(performance, /API_BUDGET_MS|5_000|5000/, "Operational API latency budget must be explicit");
assert.match(performance, /OBSERRIAN_BUDGET_MS|12_000|12000/, "Obserrian latency budget must be explicit");
assert.match(performance, /Promise\.all|concurrent/i, "Performance validation must exercise concurrency");

assert.match(health, /cache-control/i, "Health responses must define cache policy");
assert.match(health, /no-store/i, "Health responses must not be cached");
assert.match(health, /durationMs/, "Health responses must publish duration evidence");
assert.match(health, /timestamp/, "Health responses must publish freshness evidence");
assert.match(health, /release/, "Health responses must publish release identity");

assert.match(monitor, /mode.*live|live.*mode/s, "Control-room monitor must support a live mode");
assert.match(monitor, /mode.*persistent|persistent.*mode/s, "Control-room monitor must support a persistent mode");
assert.match(monitor, /Promise\.all/, "Target health checks must run in parallel");
assert.match(monitor, /timeout/i, "Target checks must use bounded timeouts");
assert.match(monitor, /nonBlockingCustomerPath/, "Monitoring must declare customer-path isolation");

assert.match(cron, /CRON_SECRET/, "Persistent monitoring must require cron authentication");
assert.match(cron, /requestDurationMs|durationMs/, "Cron execution must emit duration evidence");
assert.match(live, /requestDurationMs|durationMs/, "Live operations API must emit duration evidence");

const schedules = (vercel.crons ?? []).map((entry) => `${entry.path}:${entry.schedule}`);
assert.ok(schedules.includes("/api/cron/control-room-health:*/5 * * * *"), "Control-room health cron must execute every five minutes");

const serviceObjectives = {
  publicPageP95Ms: 4500,
  operationalApiP95Ms: 5000,
  obserrianResponseP95Ms: 12000,
  healthFreshnessMinutes: 5,
  monitoringCustomerPathBlockingAllowed: false,
  targetAvailabilityRequired: 3,
  recoveryStrategy: "degrade-with-bounded-retry-and-known-good-rollback",
};

console.log(JSON.stringify({
  passed: true,
  macroGate: "operational-slo-readiness",
  serviceObjectives,
  evidence: {
    explicitLatencyBudgets: true,
    parallelTargetChecks: true,
    boundedTimeouts: true,
    noStoreHealth: true,
    releaseIdentity: true,
    persistentFiveMinuteMonitoring: true,
    authenticatedCron: true,
    customerPathIsolation: true,
  },
}, null, 2));
