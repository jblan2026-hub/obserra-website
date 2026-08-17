import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const client = fs.readFileSync("app/ObserraGuide.tsx", "utf8");
const route = fs.readFileSync("app/api/obserrian/route.ts", "utf8");
const advisor = fs.readFileSync("lib/obserrian-advisor.ts", "utf8");

test("Obserrian uses a server-side advisor instead of the legacy client regex response tree", () => {
  assert.match(client, /fetch\("\/api\/obserrian"/);
  assert.doesNotMatch(client, /function response\(question:/);
  assert.match(client, /aria-busy=\{pending\}/);
  assert.match(client, /maxLength=\{1_000\}/);
});

test("Obserrian AI route has bounded same-origin server-side access", () => {
  assert.match(route, /sameOriginRequest\(request\)/);
  assert.match(route, /MAX_QUESTION_CHARS = 1_000/);
  assert.match(route, /MAX_HISTORY_MESSAGES = 6/);
  assert.match(route, /RATE_LIMIT = 12/);
  assert.match(route, /AI_GATEWAY_API_KEY/);
  assert.match(route, /VERCEL_OIDC_TOKEN/);
  assert.match(route, /cache: "no-store"/);
  assert.match(route, /AbortSignal\.timeout\(18_000\)/);
});

test("Obserrian uses frontier AI Gateway routing with model-level failover", () => {
  assert.match(advisor, /openai\/gpt-5\.4/);
  assert.match(advisor, /anthropic\/claude-sonnet-4\.6/);
  assert.match(advisor, /google\/gemini-3\.1-pro-preview/);
  assert.match(route, /models: \[\.\.\.OBSERRIAN_FALLBACK_MODELS\]/);
  assert.match(route, /caching: "auto"/);
});

test("Obserrian grounds recommendations in real public catalogs", () => {
  assert.match(advisor, /courseCatalog/);
  assert.match(advisor, /appsData/);
  assert.match(advisor, /relevantCourses/);
  assert.match(advisor, /relevantApps/);
  assert.match(advisor, /Status: \$\{app\.status\}/);
});

test("Obserrian preserves regulated and commercial truth boundaries", () => {
  assert.match(advisor, /FDACS provider and course authorization have not been granted/);
  assert.match(advisor, /Production software validation is non credit/);
  assert.match(advisor, /Available, Pilot, Coming Soon/);
  assert.match(advisor, /Never invent customers, testimonials, metrics, prices, product availability, certifications, regulatory approvals/);
  assert.doesNotMatch(advisor, /FDACS approved/);
});

test("Obserrian remains available with a grounded fail-safe response", () => {
  assert.match(route, /mode: "grounded-fallback"/);
  assert.match(advisor, /fallbackAdvisorAnswer/);
  assert.match(client, /Your question has not changed any account, purchase, enrollment, or regulated training state/);
});
