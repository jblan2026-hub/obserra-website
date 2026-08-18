import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("the public Florida training route is a live LMS surface linked from the website and Academy", () => {
  const home = read("app/page.tsx");
  const header = read("app/HomeHeader.tsx");
  const enterpriseChrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const academy = read("app/academy/page.tsx");
  const sitemap = read("app/sitemap.ts");
  const page = read("app/florida-security-training/page.tsx");
  const controls = read("app/florida-security-training/GovernedFloridaClassDLink.tsx");
  const activation = read("lib/florida-class-d-production-activation.ts");
  const guide = read("app/ObserraGuide.tsx");

  assert.match(home, /href="\/florida-security-training"/);
  assert.match(header, /href: "\/florida-security-training"/);
  assert.match(enterpriseChrome, /href="\/florida-security-training"/);
  assert.match(academy, /href="\/florida-security-training"/);
  assert.match(sitemap, /\$\{siteUrl\}\/florida-security-training/);
  assert.match(page, /LMS PLATFORM LIVE · PRODUCTION SOFTWARE/);
  assert.match(page, /ENROLLMENT & PAYMENT LOCKED · LICENSE ACTIVATION PENDING/);
  assert.match(page, /CONTROLLED CURRICULUM ARCHITECTURE/);
  assert.match(page, /REGULATED LMS PRODUCTION VALIDATION/);
  assert.match(page, /PROTECTED STUDENT JOURNEY/);
  assert.match(page, /Photo-ID controls before secure live video/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /floridaClassDPublicLearnerControlsEnabled\(\)/);
  assert.match(controls, /aria-disabled="true"/);
  assert.match(controls, /Enrollment and payment unavailable pending license activation/);
  assert.match(activation, /floridaClassDProductionActivationAuthorized\(\)[\s\S]*enabled\("OBSERRA_FDACS_PUBLIC_LEARNER_CONTROLS_ENABLED"\)/);
  assert.match(guide, /"\/florida-security-training"/);
});

test("prelicense enrollment and payment remain visibly locked and non-navigable", () => {
  const page = read("app/florida-security-training/page.tsx");
  const controls = read("app/florida-security-training/GovernedFloridaClassDLink.tsx");
  const enrollmentApi = read("app/api/florida-class-d/enrollment/route.ts");

  assert.match(page, /The LMS platform is live/);
  assert.match(page, /Enrollment and payment remain unavailable until licensing and production activation are complete/);
  assert.match(page, /enabled=\{publicLearnerControlsEnabled\}/);
  assert.match(controls, /if \(!enabled\)/);
  assert.match(controls, /aria-disabled="true"/);
  assert.doesNotMatch(controls, /if \(!enabled\) return null;/);
  assert.doesNotMatch(page, /Enrollment is open|Pay now|Enroll now|Buy now|Authorized student course sign-in/i);
  assert.match(enrollmentApi, /floridaClassDProductionActivationAuthorized\(\)/);
  assert.match(enrollmentApi, /FDACS_PRE_ENROLLMENT_NOT_ENABLED/);
});

test("the optional Florida launch notice is explicitly not enrollment or payment", () => {
  const contact = read("app/contact/ContactExperience.tsx");

  assert.doesNotMatch(contact, /Florida Class D training interest/);
  assert.match(contact, /"florida-class-d-training": "Florida Class D program launch notice \(not enrollment or payment\)"/);
});

test("protected Florida training routes are noindex and the LMS implementation remains present", () => {
  const layout = read("app/florida-security-training/layout.tsx");
  const protectedRoutes = [
    "app/florida-security-training/access/page.tsx",
    "app/florida-security-training/enroll/page.tsx",
    "app/florida-security-training/exam/page.tsx",
    "app/florida-security-training/live/[liveSessionId]/page.tsx",
    "app/florida-security-training/admin/runtime-readiness/page.tsx",
  ];

  assert.match(layout, /robots: \{ index: false, follow: false \}/);
  for (const route of protectedRoutes) assert.ok(fs.existsSync(route), `${route} must remain present`);
});
