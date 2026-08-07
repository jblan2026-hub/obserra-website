import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

test("public website contains only a fail-closed boundary for the separate owner site", () => {
  const proxy = read("proxy.ts");
  const robots = read("app/robots.ts");
  const redirectBoundary = read("lib/owner-site-redirect.ts");
  const commandCenter = read("app/command-center/page.tsx");
  const academyReview = read("app/command-center/academy/page.tsx");

  assert.match(proxy, /PRIVATE_NOINDEX/);
  assert.match(proxy, /private, no-store/);
  assert.match(proxy, /X-Frame-Options", "DENY"/);
  assert.match(robots, /"\/command-center"/);
  assert.match(redirectBoundary, /import "server-only"/);
  assert.match(redirectBoundary, /OBSERRA_OWNER_SITE_URL/);
  assert.match(redirectBoundary, /url\.protocol !== "https:"/);
  assert.match(redirectBoundary, /OWNER_SITE_PATHS/);
  assert.match(redirectBoundary, /notFound\(\)/);
  assert.match(commandCenter, /redirectToOwnerSite\("\/command-center"\)/);
  assert.match(academyReview, /redirectToOwnerSite\("\/course"\)/);
  assert.doesNotMatch(commandCenter, /courseData|Owner Command Center|OWNER VERIFIED/);
  assert.doesNotMatch(academyReview, /courseData|Private Course Content Review|ANSWER KEY/);
});

test("public repository does not contain private owner course content, identity, or bootstrap code", () => {
  for (const file of [
    "lib/owner-access.ts",
    "app/command-center/owner-command-center.module.css",
    "app/command-center/academy/OwnerAcademyCatalog.tsx",
    "app/command-center/academy/[courseId]/OwnerCourseReview.tsx",
    "app/owner-access/[[...owner-access]]/OwnerBootstrapClient.tsx",
    "app/owner-access/[[...owner-access]]/owner-access.module.css",
    "app/owner-access/[[...owner-access]]/page.tsx",
  ]) {
    assert.equal(exists(file), false, `private owner file must not exist in public repository: ${file}`);
  }

  const ownerCoursePage = read("app/command-center/academy/[courseId]/page.tsx");
  const ownerCertificatePage = read("app/command-center/academy/[courseId]/certificate/page.tsx");
  assert.match(ownerCoursePage, /redirectToOwnerSite\("\/course"\)/);
  assert.match(ownerCertificatePage, /redirectToOwnerSite\("\/course"\)/);
  assert.doesNotMatch(ownerCoursePage, /finalAssessment|lessonBrief|courseForId/);
  assert.doesNotMatch(ownerCertificatePage, /CertificateView|courseForId|OWNER-REVIEW/);
});

test("public Academy control client contains no owner authorization or protected-content API", () => {
  const contracts = read("lib/academy-control-contracts.ts");
  const control = read("lib/academy-control.ts");

  assert.match(contracts, /ACADEMY_PUBLIC_CATALOG_URL/);
  assert.match(control, /publicAcademyCatalog/);
  assert.match(control, /publicAcademyCourse/);
  assert.doesNotMatch(contracts, /ACADEMY_OWNER_CONTROL_URL|AcademyOwner|AcademyCourseDocument/);
  assert.doesNotMatch(control, /ownerRequest|verifyAcademyOwner|academyOwnerCatalog|academyOwnerCourse/);
  assert.doesNotMatch(control, /KnowledgeCheck|LessonBrief|authorization: `Bearer/);
});

test("legacy Academy owner URLs use the same separate-site redirect boundary", () => {
  const indexRoute = read("app/academy/admin/review/page.tsx");
  const courseRoute = read("app/academy/admin/review/[courseId]/page.tsx");
  const certificateRoute = read("app/academy/admin/review/[courseId]/certificate/page.tsx");

  assert.match(indexRoute, /redirectToOwnerSite\("\/course"\)/);
  assert.match(courseRoute, /redirectToOwnerSite\("\/course"\)/);
  assert.match(certificateRoute, /redirectToOwnerSite\("\/course"\)/);
  assert.doesNotMatch(indexRoute, /\/command-center\/academy/);
  assert.doesNotMatch(courseRoute, /courseId/);
  assert.doesNotMatch(certificateRoute, /courseId/);
});

test("public environment and CI do not carry owner identity secrets", () => {
  const environment = read(".env.example");
  const workflow = read(".github/workflows/website-ci.yml");
  const runtimeSmoke = read("scripts/owner-command-center-runtime-smoke.mjs");

  assert.match(environment, /OBSERRA_OWNER_SITE_URL=/);
  assert.doesNotMatch(environment, /OBSERRA_OWNER_EMAIL|OBSERRA_OWNER_USER_ID|OWNER_BOOTSTRAP/);
  assert.doesNotMatch(workflow, /OBSERRA_OWNER_EMAIL|OBSERRA_OWNER_USER_ID|OWNER_BOOTSTRAP/);
  assert.match(runtimeSmoke, /expected fail-closed HTTP 404/);
  assert.match(runtimeSmoke, /protectedContentExposed: false/);
});
