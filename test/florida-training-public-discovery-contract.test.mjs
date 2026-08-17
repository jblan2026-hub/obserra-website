import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("the public Florida training route remains discoverable with its complete future structure", () => {
  const header = read("app/HomeHeader.tsx");
  const enterpriseChrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const sitemap = read("app/sitemap.ts");
  const page = read("app/florida-security-training/page.tsx");
  const controls = read("app/florida-security-training/GovernedFloridaClassDLink.tsx");
  const activation = read("lib/florida-class-d-production-activation.ts");
  const guide = read("app/ObserraGuide.tsx");

  assert.match(header, /href: "\/florida-security-training"/);
  assert.match(enterpriseChrome, /href="\/florida-security-training"/);
  assert.match(sitemap, /\$\{siteUrl\}\/florida-security-training/);
  assert.match(page, /COMING SOON · LEARNING MANAGEMENT SYSTEM IN PROGRESS/);
  assert.match(page, /PRODUCTION SOFTWARE VALIDATION · NON-CREDIT · PRODUCTION AUTHORIZATION FALSE/);
  assert.match(page, /CONTROLLED CURRICULUM ARCHITECTURE/);
  assert.match(page, /REGULATED LMS PRODUCTION VALIDATION/);
  assert.match(page, /PROTECTED STUDENT JOURNEY/);
  assert.match(page, /Photo-ID controls before secure live video/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /floridaClassDPublicLearnerControlsEnabled\(\)/);
  assert.match(controls, /if \(!enabled\) return null;/);
  assert.match(controls, /return <Link/);
  assert.doesNotMatch(controls, /aria-disabled|data-governed-state|<button|disabled/);
  assert.doesNotMatch(page, /<Link[^>]*href="\/florida-security-training\/(?:enroll|access)"/);
  assert.match(activation, /floridaClassDProductionActivationAuthorized\(\)[\s\S]*enabled\("OBSERRA_FDACS_PUBLIC_LEARNER_CONTROLS_ENABLED"\)/);
  assert.match(guide, /"\/florida-security-training"/);
});

test("pre-license learner actions are omitted and the page truthfully remains coming soon", () => {
  const page = read("app/florida-security-training/page.tsx");
  const controls = read("app/florida-security-training/GovernedFloridaClassDLink.tsx");

  assert.match(page, /<strong>Coming Soon\.<\/strong>/);
  assert.match(page, /Enrollment, payment, and student course access are not open/);
  assert.match(page, /enabled=\{publicLearnerControlsEnabled\}/);
  assert.match(controls, /if \(!enabled\) return null;/);
  assert.doesNotMatch(controls, /Coming Soon|aria-disabled|<button|disabled/);
  assert.doesNotMatch(page, /Enrollment is open|Pay now|Enroll now|Buy now|Authorized student course sign-in/i);
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
