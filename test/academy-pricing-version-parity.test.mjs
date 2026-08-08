import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const courseData = fs.readFileSync("app/academy/courseData.ts", "utf8");
const checkout = fs.readFileSync("app/api/academy/checkout/route.ts", "utf8");
const courseApi = fs.readFileSync("app/api/academy/course/[courseId]/route.ts", "utf8");

const expectedPrices = {
  Foundation: 99,
  Professional: 149,
  Advanced: 199,
  "Executive Intensive": 249,
  "CISO Masterclass": 299,
};

for (const [level, price] of Object.entries(expectedPrices)) {
  test(`fallback ${level} price remains governed at $${price}`, () => {
    const escaped = level.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(courseData, new RegExp(`(?:\\"${escaped}\\"|${escaped}):\\s*${price}\\b`));
  });
}

test("checkout falls back to semantic course version 1.0.0 instead of an unversioned label", () => {
  assert.match(checkout, /INITIAL_COURSE_VERSION = "1\.0\.0"/);
  assert.doesNotMatch(checkout, /courseVersion:\s*studioCourse\?\.version\s*\?\?\s*"website-catalog"/);
});

test("checkout binds canonical course identity to Stripe session and payment intent metadata", () => {
  assert.match(checkout, /courseId: course\.id/);
  assert.match(checkout, /courseTitle: course\.title/);
  assert.match(checkout, /courseVersion,/);
  assert.match(checkout, /payment_intent_data:\s*\{[\s\S]*metadata/);
  assert.match(checkout, /description: `\$\{course\.title\} \| Course Version v\$\{courseVersion\}`/);
});

test("dynamic Stripe product data uses canonical title and governed runtime price", () => {
  assert.match(checkout, /unit_amount: Math\.round\(course\.price \* 100\)/);
  assert.match(checkout, /name: course\.title/);
  assert.match(checkout, /courseVersion,/);
});

test("published course API exposes the resolved website price and publication version", () => {
  assert.match(courseApi, /price: course\.price/);
  assert.match(courseApi, /version: publication\.version \|\| null/);
});
