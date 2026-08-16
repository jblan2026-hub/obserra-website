import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("public Academy hides the catalog when control authority is unavailable", () => {
  const page = read("app/academy/page.tsx");
  assert.match(page, /runtime\.controlPlane === "operational" \? runtime\.courses : \[\]/);
  assert.match(page, /courses=\{publicCourses\}/);
  assert.match(page, /purchaseAvailability=\{purchaseAvailability\}/);
  assert.match(page, /numberOfItems: publicCourses\.length/);
});

test("public course routes fail closed without current publication authority", () => {
  const layout = read("app/academy/[courseId]/layout.tsx");
  assert.match(layout, /publicAcademyCourse/);
  assert.match(layout, /runtime\.controlPlane !== "operational"/);
  assert.match(layout, /!runtime\.control\.publicVisible/);
  assert.match(layout, /notFound\(\)/);
});

test("checkout independently blocks new purchasing while preserving prior entitlements", () => {
  const checkout = read("app/api/academy/checkout/route.ts");
  assert.match(checkout, /runtimeCourse\.controlPlane !== "operational"/);
  assert.match(checkout, /!runtimeCourse\.control\.purchaseEnabled/);
  assert.match(checkout, /purchase-authorization-unavailable/);
  assert.match(checkout, /x-obserra-existing-entitlements", "preserved"/);
});
