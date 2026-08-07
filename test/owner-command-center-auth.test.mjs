import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const ownerAuth = read("lib/owner-auth.ts");
const academy = read("lib/academy.ts");
const proxy = read("proxy.ts");
const commandCenter = read("app/command-center/page.tsx");
const commandCenterLayout = read("app/command-center/layout.tsx");
const catalog = read("app/command-center/academy/AcademyOwnerCatalog.tsx");
const courseReviewPage = read("app/command-center/academy/[courseId]/page.tsx");
const courseReviewClient = read("app/command-center/academy/[courseId]/OwnerCourseReviewClient.tsx");
const ownerAssessment = read("app/api/command-center/academy/review-assessment/route.ts");
const commerceApi = read("app/api/admin/academy-commerce/route.ts");
const legacyAdmin = read("app/admin/page.tsx");
const legacyReview = read("app/academy/admin/review/page.tsx");
const envExample = read(".env.example");
const readme = read("README.md");

const legacyEmailAuthorizationToken = ["OBSERRA", "OWNER", "EMAIL"].join("_");
const legacyEmailFunction = ["owner", "Email", "Allowed"].join("");

test("owner authorization is bound to one opaque Clerk user ID", () => {
  assert.match(ownerAuth, /OBSERRA_OWNER_USER_ID/);
  assert.match(ownerAuth, /timingSafeEqual/);
  assert.match(ownerAuth, /requireOwnerPage/);
  assert.match(ownerAuth, /requireOwnerApi/);
  assert.match(ownerAuth, /configurationReady/);
  assert.doesNotMatch(ownerAuth, new RegExp(legacyEmailAuthorizationToken));
  assert.doesNotMatch(ownerAuth, new RegExp(legacyEmailFunction));
});

test("interactive owner surfaces contain no email authorization path", () => {
  for (const source of [academy, commerceApi, commandCenter, commandCenterLayout, catalog, courseReviewPage, courseReviewClient]) {
    assert.doesNotMatch(source, new RegExp(legacyEmailAuthorizationToken));
    assert.doesNotMatch(source, new RegExp(legacyEmailFunction));
  }
  assert.match(academy, /ownerUserIdAllowed\(userId\)/);
  assert.match(commerceApi, /requireOwnerApi/);
  assert.match(envExample, /OBSERRA_OWNER_USER_ID=/);
  assert.doesNotMatch(envExample, new RegExp(legacyEmailAuthorizationToken));
  assert.match(readme, /does not use an email allowlist/);
});

test("Command Center is a separate protected owner site", () => {
  for (const requiredPath of [
    "app/owner-access/[[...owner-access]]/page.tsx",
    "app/command-center/layout.tsx",
    "app/command-center/page.tsx",
    "app/command-center/academy/page.tsx",
    "app/command-center/academy/AcademyOwnerCatalog.tsx",
    "app/command-center/academy/[courseId]/page.tsx",
    "app/command-center/academy/[courseId]/OwnerCourseReviewClient.tsx",
    "app/command-center/academy/[courseId]/certificate/page.tsx",
    "app/api/command-center/academy/review-assessment/route.ts",
  ]) {
    assert.equal(exists(requiredPath), true, `missing ${requiredPath}`);
  }

  assert.match(commandCenterLayout, /requireOwnerPage/);
  assert.match(commandCenterLayout, /OWNER IDENTITY VERIFIED/);
  assert.match(proxy, /"\/command-center\(\.\*\)"/);
  assert.match(proxy, /"\/api\/command-center\(\.\*\)"/);
  assert.match(proxy, /Cache-Control/);
  assert.match(proxy, /X-Frame-Options/);
  assert.doesNotMatch(proxy, /Vercel protected owner preview/);
});

test("owner course review renders substantive course content", () => {
  for (const requiredContract of [
    "lesson.videoChapters",
    "lesson.transcript",
    "lesson.objectives",
    "lesson.instruction",
    "lesson.guidedPractice",
    "lesson.decisionRubric",
    "lesson.failureModes",
    "lesson.authorities",
    "lesson.practiceExample",
    "lesson.businessApplication",
    "lesson.masteryCriteria",
    "lesson.reflectionPrompts",
    "lesson.materials",
    "lesson.check",
  ]) {
    assert.match(courseReviewClient, new RegExp(requiredContract.replaceAll(".", "\\.")));
  }
  assert.match(courseReviewPage, /finalAssessmentQuestions/);
  assert.match(courseReviewClient, /\/api\/command-center\/academy\/review-assessment/);
  assert.match(catalog, /Search Academy courses/);
  assert.match(catalog, /Open complete course/);
});

test("owner assessment review is non-persistent and owner-authorized", () => {
  assert.match(ownerAssessment, /requireOwnerApi/);
  assert.match(ownerAssessment, /finalAssessment\(body\.courseId\)/);
  assert.match(ownerAssessment, /persistence: "none"/);
  assert.doesNotMatch(ownerAssessment, /recordAssessment|grantCourseAccess|markLessonComplete/);
  assert.match(ownerAssessment, /private, no-store/);
});

test("legacy owner URLs converge on the Command Center", () => {
  assert.match(legacyAdmin, /redirect\("\/command-center"\)/);
  assert.match(legacyReview, /redirect\("\/command-center\/academy"\)/);
});
