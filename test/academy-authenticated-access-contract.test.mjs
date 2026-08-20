import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const learnerRoute = fs.readFileSync("app/academy/learn/[courseId]/page.tsx", "utf8");

test("Academy course interiors require authenticated durable entitlement", () => {
  assert.match(learnerRoute, /const \{ userId \} = await auth\(\)/);
  assert.match(learnerRoute, /academyStateWithOwnerAccess\(userId, courseId\)/);
  assert.match(learnerRoute, /if \(!state\.entitlements\[courseId\]\) redirect/);
});

test("legacy anonymous Academy cookie access is removed from production source", () => {
  assert.equal(fs.existsSync("lib/academyAccess.ts"), false, "legacy anonymous Academy access module must not exist");
  assert.doesNotMatch(learnerRoute, /academyAccess|obserra_academy_access/);
});
