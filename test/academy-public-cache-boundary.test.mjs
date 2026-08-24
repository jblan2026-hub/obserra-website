import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/academy/page.tsx", "utf8");
const boundary = fs.readFileSync("app/academy/AcademyCommerceNoticeBoundary.tsx", "utf8");
const control = fs.readFileSync("lib/academy-control.ts", "utf8");

test("public Academy page stays ISR-compatible", () => {
  assert.match(page, /export const revalidate = 10/);
  assert.equal(/searchParams\s*:/m.test(page), false, "Academy page must not accept server searchParams");
  assert.equal(page.includes("await searchParams"), false, "Academy page must not await searchParams");
  assert.match(page, /<Suspense/);
  assert.match(page, /AcademyCommerceNoticeBoundary/);
});

test("enrollment query handling stays inside the bounded client notice boundary", () => {
  assert.match(boundary, /^"use client";/);
  assert.match(boundary, /useSearchParams/);
  assert.match(boundary, /searchParams\.get\("enrollment"\)/);
  assert.match(boundary, /MAX_STATUS_LENGTH = 80/);
  assert.match(boundary, /AcademyCommerceNotice status=\{enrollmentStatus \|\| fallbackStatus\}/);
});

test("Academy public control state retains short server revalidation and fail-closed degradation", () => {
  assert.match(control, /next: \{ revalidate: 10 \}/);
  assert.match(control, /controlPlane: "degraded" as const/);
  assert.match(control, /courses: \[\]/);
});
