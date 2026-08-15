import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = (process.env.OBSERRA_BASE_URL || "https://www.obserrallc.com").replace(/\/$/, "");
const publicRoutes = ["/", "/about", "/speaking", "/services", "/protection-intelligence", "/eios", "/apps", "/academy", "/industries", "/resources", "/trust", "/contact", "/sitemap.xml", "/robots.txt"];

async function fetchWithTimeout(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${baseUrl}${path}`, { redirect: "manual", signal: controller.signal, headers: { "user-agent": "ObserraProductionSmoke/2.1" }, ...init });
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
  assert.doesNotMatch(html, /lorem ipsum|coming soon|placeholder text/i, "Placeholder copy detected");
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

test("Academy checkout rejects retired GET mutations without server failure", async () => {
  const response = await fetchWithTimeout("/api/academy/checkout?course=invalid-smoke-course");
  assert.equal(response.status, 405, `Unexpected HTTP ${response.status}`);
  assert.equal(response.headers.get("allow"), "POST", "Checkout must advertise POST as the only supported mutation method");
});

test("unknown paths use the branded not-found experience", async () => {
  const response = await fetchWithTimeout("/production-smoke-not-a-real-page");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Obserra/i, "404 page is not Obserra branded");
});
