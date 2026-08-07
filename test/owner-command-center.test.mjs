import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

test("owner Command Center is separate, protected, private, and fail closed", () => {
  const proxy = read("proxy.ts");
  const ownerAccess = read("lib/owner-access.ts");
  const commandCenter = read("app/command-center/page.tsx");
  const academyReview = read("app/command-center/academy/page.tsx");

  assert.match(proxy, /"\/command-center\(\.\*\)"/);
  assert.match(proxy, /PRIVATE_NOINDEX/);
  assert.match(proxy, /private, no-store/);
  assert.match(proxy, /X-Frame-Options", "DENY"/);
  assert.match(ownerAccess, /OBSERRA_OWNER_EMAIL/);
  assert.match(ownerAccess, /OBSERRA_OWNER_USER_ID/);
  assert.match(ownerAccess, /clerkClient/);
  assert.match(ownerAccess, /notFound\(\)/);
  assert.doesNotMatch(ownerAccess, /VERCEL_ENV/);
  assert.match(commandCenter, /Owner Command Center/);
  assert.match(commandCenter, /not part of the public Academy catalog/);
  assert.match(academyReview, /Private Course Content Review/);
  assert.match(academyReview, /does not create a purchase/);
});

test("owner course viewer exposes complete content without learner mutations", () => {
  const ownerCoursePage = read("app/command-center/academy/[courseId]/page.tsx");
  const ownerViewer = read("app/command-center/academy/[courseId]/OwnerCourseReview.tsx");

  assert.match(ownerCoursePage, /requireOwnerAccess/);
  assert.match(ownerCoursePage, /finalAssessment/);
  assert.doesNotMatch(ownerCoursePage, /VERCEL_ENV/);
  assert.match(ownerViewer, /GUIDED INSTRUCTION/);
  assert.match(ownerViewer, /AUTHORITATIVE GROUNDING/);
  assert.match(ownerViewer, /KNOWLEDGE CHECK · OWNER ANSWER KEY/);
  assert.match(ownerViewer, /FINAL ASSESSMENT · PRIVATE OWNER ANSWER KEY/);
  assert.doesNotMatch(ownerViewer, /\/api\/academy\/progress/);
  assert.doesNotMatch(ownerViewer, /\/api\/academy\/assessment/);
  assert.doesNotMatch(ownerViewer, /\/api\/academy\/checkout/);
});

test("legacy Academy owner URLs redirect into the private Command Center", () => {
  const indexRoute = read("app/academy/admin/review/page.tsx");
  const courseRoute = read("app/academy/admin/review/[courseId]/page.tsx");
  const certificateRoute = read("app/academy/admin/review/[courseId]/certificate/page.tsx");

  assert.match(indexRoute, /redirect\("\/command-center\/academy"\)/);
  assert.match(courseRoute, /\/command-center\/academy\/\$\{encodeURIComponent\(courseId\)\}/);
  assert.match(certificateRoute, /\/command-center\/academy\/\$\{encodeURIComponent\(courseId\)\}\/certificate/);
  assert.doesNotMatch(courseRoute, /notFound\(\)/);
  assert.doesNotMatch(certificateRoute, /VERCEL_ENV/);
});

test("all required owner Command Center files are present", () => {
  for (const file of [
    "lib/owner-access.ts",
    "app/command-center/layout.tsx",
    "app/command-center/page.tsx",
    "app/command-center/owner-command-center.module.css",
    "app/command-center/academy/page.tsx",
    "app/command-center/academy/OwnerAcademyCatalog.tsx",
    "app/command-center/academy/[courseId]/page.tsx",
    "app/command-center/academy/[courseId]/OwnerCourseReview.tsx",
    "app/command-center/academy/[courseId]/certificate/page.tsx",
  ]) {
    assert.equal(exists(file), true, `missing required owner Command Center file: ${file}`);
  }
});
