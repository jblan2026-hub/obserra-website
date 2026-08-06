import assert from "node:assert/strict";

const baseUrl = (process.env.OBSERRA_BASE_URL || "https://www.obserrallc.com").replace(/\/$/, "");
const timeoutMs = Number(process.env.OBSERRA_JOURNEY_TIMEOUT_MS || 20000);
const results = [];

async function request(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "ObserraMacroJourneyGate/1.0", ...(init.headers || {}) },
      ...init,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function gate(name, operation) {
  const startedAt = Date.now();
  try {
    await operation();
    results.push({ name, status: "pass", durationMs: Date.now() - startedAt });
  } catch (error) {
    results.push({ name, status: "fail", durationMs: Date.now() - startedAt, detail: error instanceof Error ? error.message : String(error) });
  }
}

await gate("public-commercial-journey", async () => {
  for (const path of ["/", "/services", "/apps", "/academy", "/protection-intelligence", "/contact"]) {
    const response = await request(path);
    assert.ok(response.status >= 200 && response.status < 400, `${path} returned HTTP ${response.status}`);
    const html = await response.text();
    assert.match(html, /Obserra/i, `${path} is missing Obserra branding`);
    assert.doesNotMatch(html, /lorem ipsum|replace me|todo:/i, `${path} contains placeholder copy`);
  }
});

await gate("academy-discovery-and-credential-journey", async () => {
  const academy = await request("/academy");
  assert.equal(academy.status, 200, `Academy returned HTTP ${academy.status}`);
  const academyHtml = await academy.text();
  for (const signal of [/Search courses/i, /Certificate of Training/i, /Enterprise teams/i]) {
    assert.match(academyHtml, signal, `Academy is missing ${signal}`);
  }

  const verify = await request("/academy/verify");
  assert.equal(verify.status, 200, `Certificate verification returned HTTP ${verify.status}`);
  assert.match(await verify.text(), /Verify a certificate/i);

  const missing = await request("/api/academy/certificate/verify");
  assert.equal(missing.status, 400, `Missing certificate ID returned HTTP ${missing.status}`);

  const malformed = await request("/api/academy/certificate/verify?certificateId=invalid");
  assert.equal(malformed.status, 400, `Malformed certificate ID returned HTTP ${malformed.status}`);
});

await gate("obserrian-assistance-and-degraded-operation", async () => {
  const response = await request("/api/obserrian", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Which Obserra offering best supports an enterprise security transformation?", pathname: "/apps", conversation: [] }),
  });
  assert.equal(response.status, 200, `Obserrian returned HTTP ${response.status}`);
  const payload = await response.json();
  assert.ok(typeof payload.answer === "string" && payload.answer.trim().length > 20, "Obserrian returned no useful answer");
  assert.ok(Array.isArray(payload.actions), "Obserrian actions are missing");
  assert.ok(typeof payload.reviewRecorded === "boolean", "Obserrian telemetry state is missing");
});

await gate("health-readiness-and-shared-platform-contract", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200, `Health returned HTTP ${response.status}`);
  const payload = await response.json();
  assert.equal(payload.ready, true, "Deployment is not ready");
  assert.equal(payload.platform?.sourceModel, "single-source-shared-platform", "Shared platform source model is missing");
  assert.equal(payload.platform?.targetCount, 3, "Deployment target count mismatch");
  assert.ok(Array.isArray(payload.capabilities) && payload.capabilities.length >= 10, "Shared capability inventory is incomplete");
});

await gate("owner-and-maintenance-boundaries-fail-closed", async () => {
  for (const path of [
    "/api/admin/obserrian/analytics",
    "/api/admin/maintenance/recommendations",
  ]) {
    const response = await request(path);
    assert.ok([401, 403, 404].includes(response.status), `${path} exposed anonymous access with HTTP ${response.status}`);
  }

  const control = await request("/admin/site-control");
  assert.ok(control.status >= 300 && control.status < 400, `Owner control returned HTTP ${control.status}`);
  assert.match(control.headers.get("location") || "", /sign-in/i, "Owner control did not redirect to authentication");
});

await gate("preview-first-change-control-boundary", async () => {
  const response = await request("/api/admin/site-change/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ instruction: "Change a product price without owner approval" }),
  });
  assert.ok([401, 403, 404].includes(response.status), `Anonymous change plan returned HTTP ${response.status}`);
});

await gate("invalid-checkout-fails-safely", async () => {
  const response = await request("/api/academy/checkout?course=invalid-macro-gate-course");
  assert.ok(response.status >= 300 && response.status < 400, `Invalid checkout returned HTTP ${response.status}`);
  assert.match(response.headers.get("location") || "", /academy\?enrollment=not-ready/, "Invalid checkout did not fail safely");
});

await gate("unknown-route-branded-failure", async () => {
  const response = await request("/macro-gate-route-that-does-not-exist");
  assert.equal(response.status, 404, `Unknown route returned HTTP ${response.status}`);
  assert.match(await response.text(), /Obserra/i, "Unknown route is not branded");
});

const failed = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, baseUrl, gateCount: results.length, results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} macro customer journey gate(s) failed`);
