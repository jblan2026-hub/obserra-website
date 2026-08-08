import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

test("Academy public visibility and purchases fail closed", () => {
  const contracts = read("lib/academy-control-contracts.ts");
  const layout = read("app/academy/[courseId]/layout.tsx");
  const catalog = read("app/academy/page.tsx");
  const checkout = read("app/api/academy/checkout/route.ts");

  assert.match(contracts, /lifecycle: "unpublished"/);
  assert.match(contracts, /publicVisible: false/);
  assert.match(contracts, /purchaseEnabled: false/);
  assert.match(contracts, /preserveExistingEntitlements: true/);
  assert.doesNotMatch(contracts, /lifecycle: "published"[\s\S]{0,100}publicVisible: true[\s\S]{0,100}purchaseEnabled: true/);

  assert.match(layout, /runtime\.controlPlane !== "operational"/);
  assert.match(layout, /!runtime\.control\.publicVisible/);
  assert.match(catalog, /runtime\.controlPlane === "operational" \? runtime\.courses : \[\]/);
  assert.match(checkout, /!runtimeCourse\.control\.purchaseEnabled/);
  assert.match(checkout, /x-obserra-existing-entitlements", "preserved"/);
});

test("Existing paid learners retain protected access after unpublication", () => {
  const learnPage = read("app/academy/learn/[courseId]/page.tsx");
  const academy = read("lib/academy.ts");

  assert.match(learnPage, /academyStateWithOwnerAccess/);
  assert.match(learnPage, /state\.entitlements\[courseId\]/);
  assert.doesNotMatch(learnPage, /publicAcademyCourse/);
  assert.match(academy, /entitlements/);
  assert.match(academy, /paymentReference/);
});

test("Paid checkout carries exact identity and course correlation metadata", () => {
  const checkout = read("app/api/academy/checkout/route.ts");
  const webhook = read("app/api/webhook/stripe/route.ts");

  assert.match(checkout, /courseId: course\.id/);
  assert.match(checkout, /clerkUserId: identity\.userId \?\? ""/);
  assert.match(checkout, /paid-pending-account-claim/);
  assert.match(checkout, /payment_intent_data: \{ metadata \}/);
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /payment_status/);
  assert.match(webhook, /grantCourseAccess/);
});
