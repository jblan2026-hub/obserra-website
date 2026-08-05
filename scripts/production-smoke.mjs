import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = (process.env.OBSERRA_BASE_URL || "https://www.obserrallc.com").replace(/\/$/, "");

const publicRoutes = [
  "/",
  "/about",
  "/speaking",
  "/services",
  "/protection-intelligence",
  "/eios",
  "/apps",
  "/academy",
  "/industries",
  "/resources",
  "/trust",
  "/contact",
  "/sitemap.xml",
  "/robots.txt",
];

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "ObserraProductionSmoke/1.0" },
      ...init,
    });
  } finally {
    clearTimeout(timer);
  }
}

for (const route of publicRoutes) {
  test(`public route ${route} responds successfully`, async () => {
    const response = await fetchWithTimeout(route);
    assert.ok(
      response.status >= 200 && response.status < 400,
      `${route} returned HTTP ${response.status}`,
    );
  });
}

test("homepage contains essential commercial and SEO signals", async () => {
  const response = await fetchWithTimeout("/");
  const html = await response.text();
  assert.match(html, /<title>[^<]*Obserra/i, "Missing Obserra page title");
  assert.match(html, /name=["']description["']/i, "Missing meta description");
  assert.match(html, /rel=["']canonical["']/i, "Missing canonical link");
  assert.match(html, /application\/ld\+json/i, "Missing structured data");
});

test("Academy checkout requires a valid course and never returns a server failure", async () => {
  const response = await fetchWithTimeout("/api/academy/checkout?course=invalid-smoke-course");
  assert.ok(response.status >= 300 && response.status < 400, `Unexpected HTTP ${response.status}`);
  const location = response.headers.get("location") || "";
  assert.match(location, /\/academy\?enrollment=not-ready/, `Unexpected redirect: ${location}`);
});

test("unknown paths use the branded not-found experience", async () => {
  const response = await fetchWithTimeout("/production-smoke-not-a-real-page");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /Obserra/i, "404 page is not Obserra branded");
});
