import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const control = read("lib/academy-control.ts");
const contracts = read("lib/academy-control-contracts.ts");
const environment = read(".env.example");

test("Academy Supabase control modules are server only", () => {
  assert.match(control, /^import "server-only";/);
  assert.match(contracts, /^import "server-only";/);
  assert.match(contracts, /ACADEMY_PRIVATE_CATALOG_URL/);
  assert.doesNotMatch(contracts, /ACADEMY_PUBLIC_CATALOG_URL/);
});

test("private Academy catalog requests use only a server-side service role credential", () => {
  assert.match(control, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(control, /apikey: serviceRoleKey/);
  assert.match(control, /authorization: `Bearer \$\{serviceRoleKey\}`/);
  assert.match(control, /cache: "no-store"/);
  assert.match(control, /redirect: "error"/);
  assert.match(control, /AbortSignal\.timeout\(8_000\)/);
  assert.doesNotMatch(control, /next:\s*\{\s*revalidate:/);
});

test("Academy control defaults and degraded paths fail closed", () => {
  assert.match(contracts, /lifecycle: "unpublished"/);
  assert.match(contracts, /publicVisible: false/);
  assert.match(contracts, /purchaseEnabled: false/);
  assert.match(contracts, /reason: "control-authority-unavailable"/);
  assert.match(control, /courses: \[\]/);
  assert.match(control, /course: null/);
  assert.doesNotMatch(control, /courses: \[\.\.\.baseCourses\]/);
  assert.doesNotMatch(control, /course: baseCourse/);
});

test("service role configuration is documented as a nonpublic deployment secret", () => {
  assert.match(environment, /^SUPABASE_SERVICE_ROLE_KEY=$/m);
  assert.doesNotMatch(environment, /^NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.match(environment, /Never prefix it with NEXT_PUBLIC/);
});

test("browser Academy surfaces do not reference the Supabase service role credential", () => {
  for (const relativePath of [
    "app/academy/page.tsx",
    "app/academy/AcademyControlledClient.tsx",
    "app/academy/[courseId]/layout.tsx",
    "app/portal/page.tsx",
  ]) {
    assert.doesNotMatch(
      read(relativePath),
      /SUPABASE_SERVICE_ROLE_KEY/,
      `${relativePath} must not reference the service role key`,
    );
  }
});

test("private catalog errors are logged without response bodies or credential values", () => {
  assert.match(control, /console\.error\(context, \{ code \}\)/);
  assert.doesNotMatch(control, /console\.error\([^\n]*serviceRoleKey/);
  assert.doesNotMatch(control, /console\.error\([^\n]*authorization/);
});
