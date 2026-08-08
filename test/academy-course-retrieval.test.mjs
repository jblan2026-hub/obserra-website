import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/academy/course/[courseId]/route.ts", "utf8");

test("course retrieval validates canonical course IDs before lookup", () => {
  assert.match(route, /COURSE_ID_PATTERN/);
  const validation = route.indexOf("COURSE_ID_PATTERN.test(courseId)");
  const lookup = route.indexOf("courseForId(courseId)");
  assert.ok(validation >= 0 && lookup > validation);
});

test("course retrieval returns only published Academy courses", () => {
  assert.match(route, /publicAcademyCourse\(baseCourse\)/);
  assert.match(route, /if \(!runtime\.course\).*course-not-published/);
});

test("course retrieval applies secure response headers and no-store errors", () => {
  assert.match(route, /content-security-policy/);
  assert.match(route, /default-src 'none'/);
  assert.match(route, /frame-ancestors 'none'/);
  assert.match(route, /x-content-type-options/);
  assert.match(route, /nosniff/);
  assert.match(route, /private, no-store, max-age=0/);
});

test("public course payload excludes learner and payment secrets", () => {
  const payloadStart = route.indexOf("course: {");
  const payloadEnd = route.indexOf("generatedAt:", payloadStart);
  assert.ok(payloadStart >= 0 && payloadEnd > payloadStart);
  const payload = route.slice(payloadStart, payloadEnd);
  assert.doesNotMatch(payload, /learnerName/);
  assert.doesNotMatch(payload, /email/i);
  assert.doesNotMatch(payload, /paymentReference/);
  assert.doesNotMatch(payload, /stripePriceId/);
  assert.doesNotMatch(payload, /clientSecret/);
  assert.doesNotMatch(payload, /assessmentScore/);
  assert.match(payload, /price: course\.price/);
  assert.match(payload, /currency: "USD"/);
});

test("course retrieval exposes governed publication state without entitlement data", () => {
  assert.match(route, /purchaseEnabled/);
  assert.match(route, /releaseStatus/);
  assert.match(route, /certificateIssued/);
  assert.doesNotMatch(route, /privateMetadata/);
  assert.doesNotMatch(route, /entitlements/);
});
