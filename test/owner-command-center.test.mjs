import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

test("owner Command Center is private, ID-bound, and independent of email authorization", () => {
  const proxy = read("proxy.ts");
  const robots = read("app/robots.ts");
  const ownerAccess = read("lib/owner-access.ts");
  const ownerGateway = read("app/owner-access/[[...owner-access]]/page.tsx");
  const bootstrapClient = read("app/owner-access/[[...owner-access]]/OwnerBootstrapClient.tsx");

  assert.match(proxy, /"\/command-center"/);
  assert.match(proxy, /"\/owner-access"/);
  assert.match(proxy, /private, no-store/);
  assert.match(proxy, /X-Frame-Options", "DENY"/);
  assert.match(proxy, /redirectToIdentityGateway/);
  assert.match(robots, /"\/command-center"/);
  assert.match(robots, /"\/owner-access"/);
  assert.match(ownerAccess, /verifyAcademyOwner/);
  assert.match(ownerAccess, /authenticated-owner-id/);
  assert.doesNotMatch(ownerAccess, /OBSERRA_OWNER_EMAIL|ownerEmailAllowed|clerkClient/);
  assert.match(ownerGateway, /No email address is used as an authorization decision/);
  assert.match(ownerGateway, /OwnerBootstrapClient/);
  assert.match(bootstrapClient, /x-obserra-bootstrap-code/);
  assert.match(bootstrapClient, /Bind this identity as company owner/);
  assert.doesNotMatch(bootstrapClient, /email/i);
});

test("Academy public catalog and checkout are governed by live course controls", () => {
  const contracts = read("lib/academy-control-contracts.ts");
  const control = read("lib/academy-control.ts");
  const academyPage = read("app/academy/page.tsx");
  const coursePage = read("app/academy/[courseId]/page.tsx");
  const checkout = read("app/api/academy/checkout/route.ts");

  assert.match(contracts, /ACADEMY_PUBLIC_CATALOG_URL/);
  assert.match(contracts, /sales_paused/);
  assert.match(contracts, /preserveExistingEntitlements: true/);
  assert.match(control, /publicAcademyCatalog/);
  assert.match(control, /publicAcademyCourse/);
  assert.match(academyPage, /AcademyControlledClient/);
  assert.match(academyPage, /runtime\.courses/);
  assert.match(coursePage, /runtime\.control\.purchaseEnabled/);
  assert.match(coursePage, /Existing learner access is preserved/);
  assert.match(checkout, /publicAcademyCourse/);
  assert.match(checkout, /purchase-authorization-unavailable/);
  assert.match(checkout, /x-obserra-existing-entitlements/);
  assert.match(checkout, /course-unavailable/);
});

test("owner course manager can view, edit, unpublish, cancel, restore, and audit", () => {
  const ownerCatalog = read("app/command-center/academy/page.tsx");
  const ownerCoursePage = read("app/command-center/academy/[courseId]/page.tsx");
  const manager = read("app/command-center/academy/[courseId]/OwnerCourseManager.tsx");

  assert.match(ownerCatalog, /academyOwnerCatalog/);
  assert.match(ownerCatalog, /Course Content, Publication, and Purchasing/);
  assert.match(ownerCoursePage, /academyOwnerCourse/);
  assert.match(ownerCoursePage, /finalAssessment/);
  assert.match(ownerCoursePage, /lessonBrief/);
  assert.match(manager, /Publish and enable purchasing/);
  assert.match(manager, /Pause new sales/);
  assert.match(manager, /Unpublish course/);
  assert.match(manager, /Cancel future availability/);
  assert.match(manager, /Existing purchase commitment/);
  assert.match(manager, /Advanced full-package editor/i);
  assert.match(manager, /GUIDED VIDEO AND TRANSCRIPT/);
  assert.match(manager, /AUTHORITATIVE GROUNDING/);
  assert.match(manager, /KNOWLEDGE CHECK AND ANSWER KEY/);
  assert.match(manager, /FINAL ASSESSMENT · OWNER ANSWER KEY/);
  assert.match(manager, /RECENT AUDIT HISTORY/);
  assert.match(manager, /expectedRevision/);
  assert.match(manager, /crypto\.randomUUID/);
  assert.doesNotMatch(manager, /STRIPE_SECRET_KEY|CLERK_SECRET_KEY|service_role/);
});

test("legacy Academy owner URLs redirect into the private Command Center", () => {
  const indexRoute = read("app/academy/admin/review/page.tsx");
  const courseRoute = read("app/academy/admin/review/[courseId]/page.tsx");
  const certificateRoute = read("app/academy/admin/review/[courseId]/certificate/page.tsx");

  assert.match(indexRoute, /redirect\("\/command-center\/academy"\)/);
  assert.match(courseRoute, /\/command-center\/academy\/\$\{encodeURIComponent\(courseId\)\}/);
  assert.match(certificateRoute, /\/command-center\/academy\/\$\{encodeURIComponent\(courseId\)\}\/certificate/);
});

test("owner environment contains no email or user-id authorization secret", () => {
  const environment = read(".env.example");
  assert.doesNotMatch(environment, /OBSERRA_OWNER_EMAIL|OBSERRA_OWNER_USER_ID|OWNER_BOOTSTRAP/);
  assert.match(environment, /one-time owner proof/i);
  assert.match(environment, /No additional owner identity value is stored in Vercel/);
});

test("all owner control files are present", () => {
  for (const file of [
    "lib/academy-control-contracts.ts",
    "lib/academy-control.ts",
    "lib/owner-access.ts",
    "app/owner-access/[[...owner-access]]/page.tsx",
    "app/owner-access/[[...owner-access]]/OwnerBootstrapClient.tsx",
    "app/owner-access/[[...owner-access]]/owner-access.module.css",
    "app/command-center/layout.tsx",
    "app/command-center/page.tsx",
    "app/command-center/owner-command-center.module.css",
    "app/command-center/academy/page.tsx",
    "app/command-center/academy/OwnerAcademyControlCatalog.tsx",
    "app/command-center/academy/[courseId]/page.tsx",
    "app/command-center/academy/[courseId]/OwnerCourseManager.tsx",
    "app/command-center/academy/[courseId]/certificate/page.tsx",
    "app/academy/AcademyControlledClient.tsx",
  ]) {
    assert.equal(exists(file), true, `missing required owner control file: ${file}`);
  }
});
