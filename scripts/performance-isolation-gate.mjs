import assert from "node:assert/strict";

const baseUrl = (process.env.OBSERRA_BASE_URL || "https://www.obserrallc.com").replace(/\/$/, "");
const timeoutMs = Number(process.env.OBSERRA_PERF_TIMEOUT_MS || 15000);
const pageBudgetMs = Number(process.env.OBSERRA_PAGE_BUDGET_MS || 4500);
const apiBudgetMs = Number(process.env.OBSERRA_API_BUDGET_MS || 5000);
const aiBudgetMs = Number(process.env.OBSERRA_AI_BUDGET_MS || 12000);
const results = [];

async function timedRequest(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "ObserraPerformanceIsolationGate/1.0", ...(init.headers || {}) },
      ...init,
    });
    return { response, durationMs: Math.round(performance.now() - startedAt) };
  } finally {
    clearTimeout(timer);
  }
}

async function check(name, operation) {
  const startedAt = performance.now();
  try {
    const detail = await operation();
    results.push({ name, status: "pass", durationMs: Math.round(performance.now() - startedAt), ...detail });
  } catch (error) {
    results.push({ name, status: "fail", durationMs: Math.round(performance.now() - startedAt), detail: error instanceof Error ? error.message : String(error) });
  }
}

const publicRoutes = ["/", "/apps", "/academy", "/academy/verify", "/protection-intelligence"];

await check("public-route-latency", async () => {
  const samples = [];
  for (const path of publicRoutes) {
    const { response, durationMs } = await timedRequest(path);
    assert.ok(response.status >= 200 && response.status < 400, `${path} returned HTTP ${response.status}`);
    assert.ok(durationMs <= pageBudgetMs, `${path} exceeded ${pageBudgetMs} ms at ${durationMs} ms`);
    samples.push({ path, durationMs, status: response.status });
  }
  return { samples };
});

await check("operational-api-latency", async () => {
  const samples = [];
  for (const path of ["/api/health", "/api/academy/certificate/verify?certificateId=invalid"]) {
    const { response, durationMs } = await timedRequest(path);
    assert.ok([200, 400].includes(response.status), `${path} returned HTTP ${response.status}`);
    assert.ok(durationMs <= apiBudgetMs, `${path} exceeded ${apiBudgetMs} ms at ${durationMs} ms`);
    samples.push({ path, durationMs, status: response.status });
  }
  return { samples };
});

await check("obserrian-response-latency", async () => {
  const { response, durationMs } = await timedRequest("/api/obserrian", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Recommend the best Obserra offering for enterprise transformation.", pathname: "/apps", conversation: [] }),
  });
  assert.equal(response.status, 200, `Obserrian returned HTTP ${response.status}`);
  assert.ok(durationMs <= aiBudgetMs, `Obserrian exceeded ${aiBudgetMs} ms at ${durationMs} ms`);
  const payload = await response.json();
  assert.ok(typeof payload.answer === "string" && payload.answer.length > 20, "Obserrian answer was not useful");
  return { sample: { durationMs, degraded: payload.degraded === true } };
});

await check("monitoring-does-not-block-customer-routes", async () => {
  const monitorRequest = timedRequest("/api/admin/operations/live");
  const customerRequests = publicRoutes.map((path) => timedRequest(path));
  const [monitor, ...customers] = await Promise.all([monitorRequest, ...customerRequests]);
  assert.ok([302, 307, 401, 403].includes(monitor.response.status), `Anonymous monitor returned HTTP ${monitor.response.status}`);
  for (let index = 0; index < customers.length; index += 1) {
    const sample = customers[index];
    const path = publicRoutes[index];
    assert.ok(sample.response.status >= 200 && sample.response.status < 400, `${path} failed during monitor activity`);
    assert.ok(sample.durationMs <= pageBudgetMs, `${path} exceeded budget during monitor activity at ${sample.durationMs} ms`);
  }
  return {
    monitor: { status: monitor.response.status, durationMs: monitor.durationMs },
    customers: customers.map((sample, index) => ({ path: publicRoutes[index], status: sample.response.status, durationMs: sample.durationMs })),
  };
});

await check("checkout-safety-latency", async () => {
  const { response, durationMs } = await timedRequest("/api/academy/checkout?course=invalid-performance-gate");
  assert.ok(response.status >= 300 && response.status < 400, `Invalid checkout returned HTTP ${response.status}`);
  assert.ok(durationMs <= apiBudgetMs, `Invalid checkout exceeded ${apiBudgetMs} ms at ${durationMs} ms`);
  assert.match(response.headers.get("location") || "", /academy\?enrollment=not-ready/);
  return { sample: { durationMs, status: response.status } };
});

const failed = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, macroGate: "performance-isolation", baseUrl, budgets: { pageBudgetMs, apiBudgetMs, aiBudgetMs }, gateCount: results.length, results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} performance isolation gate(s) failed`);
