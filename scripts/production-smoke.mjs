import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = (process.env.OBSERRA_BASE_URL || "https://www.obserrallc.com").replace(/\/$/, "");
const publicRoutes = ["/", "/about", "/speaking", "/services", "/protection-intelligence", "/eios", "/apps", "/academy", "/academy/verify", "/industries", "/resources", "/trust", "/contact", "/sitemap.xml", "/robots.txt"];

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${baseUrl}${path}`, { redirect: "manual", signal: controller.signal, headers: { "user-agent": "ObserraProductionSmoke/2.2" }, ...init });
  } finally {
    clearTimeout(timer);
  }
}

function extract(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]).filter(Boolean);
}

for (const route of publicRoutes) {
  test(`public route ${route} responds successfully`, async () => {
    const response = await fetchWithTimeout(route);
    assert.ok(response.status >= 200 && response.status < 400, `${route} returned HTTP ${response.status}`);
  });
}

test("homepage contains commercial and SEO essentials", async () => {
  const response = await fetchWithTimeout("/");
  const html = await response.text();
  assert.match(html, /<title>[^<]*Obserra/i, "Missing Obserra page title");
  assert.match(html, /name=["']description["']/i, "Missing meta description");
  assert.match(html, /rel=["']canonical["']/i, "Missing canonical link");
  assert.match(html, /application\/ld\+json/i, "Missing structured data");
  assert.doesNotMatch(html, /lorem ipsum|placeholder text/i, "Placeholder copy detected");
});

test("primary public pages expose one clear H1 and no obvious placeholder copy", async () => {
  for (const route of publicRoutes.filter((route) => !route.endsWith(".xml") && !route.endsWith(".txt"))) {
    const response = await fetchWithTimeout(route);
    const html = await response.text();
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    assert.equal(h1Count, 1, `${route} should expose exactly one H1 but has ${h1Count}`);
    assert.doesNotMatch(html, /lorem ipsum|todo:|replace me|sample content/i, `${route} contains placeholder copy`);
  }
});

test("homepage internal navigation targets resolve", async () => {
  const response = await fetchWithTimeout("/");
  const html = await response.text();
  const links = [...new Set(extract(html, /href=["'](\/[^\"'#?]*)/gi))].filter((href) => !href.startsWith("//") && !href.startsWith("/api/"));
  for (const href of links.slice(0, 40)) {
    const target = await fetchWithTimeout(href);
    assert.ok(target.status >= 200 && target.status < 400, `Internal link ${href} returned HTTP ${target.status}`);
  }
});

test("homepage image assets resolve", async () => {
  const response = await fetchWithTimeout("/");
  const html = await response.text();
  const images = [...new Set(extract(html, /(?:src|srcset)=["'](\/[^\"' ,]+)/gi))].filter((src) => !src.startsWith("/_next/")).slice(0, 30);
  for (const src of images) {
    const asset = await fetchWithTimeout(src);
    assert.ok(asset.status >= 200 && asset.status < 400, `Image ${src} returned HTTP ${asset.status}`);
  }
});

test("design system validation route renders shared primitives and remains non-indexed", async () => {
  const response = await fetchWithTimeout("/design-system");
  assert.equal(response.status, 200, `Design system route returned HTTP ${response.status}`);
  const html = await response.text();
  assert.match(html, /Obserra Design System V1\.0/i, "Design system heading is missing");
  assert.match(html, /Enterprise Health Index/i, "KPI primitive is missing");
  assert.match(html, /name=["']robots["'][^>]*noindex/i, "Design system route must remain non-indexed");
});

test("Academy catalog exposes discovery and secure enrollment signals", async () => {
  const response = await fetchWithTimeout("/academy");
  const html = await response.text();
  assert.match(html, /Search courses/i, "Academy search is missing");
  assert.match(html, /Enterprise teams/i, "Enterprise training pathway is missing");
  assert.match(html, /Stripe/i, "Secure checkout assurance is missing");
  assert.match(html, /Certificate of Training/i, "Certificate disclosure is missing");
});

test("Academy credential verification page is public and clearly governed", async () => {
  const response = await fetchWithTimeout("/academy/verify");
  assert.equal(response.status, 200, `Academy verification route returned HTTP ${response.status}`);
  const html = await response.text();
  assert.match(html, /Verify a certificate/i, "Certificate verification heading is missing");
  assert.match(html, /Credential Services/i, "Credential governance label is missing");
  assert.match(html, /certificateId/i, "Certificate identifier input is missing");
});

test("Academy certificate API rejects missing and malformed IDs without server failure", async () => {
  const missing = await fetchWithTimeout("/api/academy/certificate/verify");
  assert.equal(missing.status, 400, `Missing certificate ID returned HTTP ${missing.status}`);
  const malformed = await fetchWithTimeout("/api/academy/certificate/verify?certificateId=invalid");
  assert.equal(malformed.status, 400, `Malformed certificate ID returned HTTP ${malformed.status}`);
});

test("Academy checkout rejects an invalid course without server failure", async () => {
  const response = await fetchWithTimeout("/api/academy/checkout?course=invalid-smoke-course");
  assert.ok(response.status >= 300 && response.status < 400, `Unexpected HTTP ${response.status}`);
  assert.match(response.headers.get("location") || "", /\/academy\?enrollment=not-ready/, "Unexpected invalid-course redirect");
});

test("owner AI website controls fail closed for anonymous users", async () => {
  const plan = await fetchWithTimeout("/api/admin/site-change/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ instruction: "Update the course description" }),
  });
  assert.ok(plan.status === 401 || plan.status === 404, `Anonymous owner plan endpoint returned HTTP ${plan.status}`);

  const preview = await fetchWithTimeout("/api/admin/site-change/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: { requiresOwnerApproval: true, operations: [] } }),
  });
  assert.ok(preview.status === 401 || preview.status === 404, `Anonymous owner preview endpoint returned HTTP ${preview.status}`);
});

test("owner AI control page requires authentication", async () => {
  const response = await fetchWithTimeout("/admin/site-control");
  assert.ok(response.status >= 300 && response.status < 400, `Owner control page returned HTTP ${response.status}`);
  assert.match(response.headers.get("location") || "", /sign-in/i, "Owner control page did not redirect to sign in");
});

test("unknown paths use the branded not-found experience", async () => {
  const response = await fetchWithTimeout("/production-smoke-not-a-real-page");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Obserra/i, "404 page is not Obserra branded");
});
