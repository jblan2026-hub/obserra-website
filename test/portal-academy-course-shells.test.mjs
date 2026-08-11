import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const portal = fs.readFileSync("app/portal/page.tsx", "utf8");
const portalCss = fs.readFileSync("app/portal/academy-shells.css", "utf8");

test("authenticated learner dashboard renders the governed Academy catalog as course shells", () => {
  assert.match(portal, /courses as academyCourses/);
  assert.match(portal, /academyCourses\.filter\(\(course\) => course\.department === department\)/);
  assert.match(portal, /departmentCourses\.map\(\(course\) =>/);
  assert.match(portal, /COURSE SHELLS/);
  assert.match(portal, /Visible Academy programs/);
});

test("learner shells preserve verified entitlements and do not fabricate enrollment", () => {
  assert.match(portal, /academyStateFromUser/);
  assert.match(portal, /new Set\(Object\.keys\(academyState\.entitlements\)\)/);
  assert.match(portal, /if \(enrolledCourseIds\.has\(courseId\)\)/);
  assert.match(portal, /Your learner entitlement is active/);
  assert.match(portal, /Learner access opens after release/);
});

test("course shell states are governed by LearnWorlds publication status", () => {
  assert.match(portal, /learnWorldsProductForCourse/);
  assert.match(portal, /product\?\.status === "published"/);
  assert.match(portal, /product\?\.status === "sandbox"/);
  assert.match(portal, /label: "In production"/);
  assert.match(portal, /A shell does not grant enrollment, unlock protected lessons, or authorize purchase/);
});

test("course shell dashboard contains no direct checkout action", () => {
  const shellStart = portal.indexOf('id="academy-shells"');
  const workspaceStart = portal.indexOf('className="portal-workspace"', shellStart);
  assert.ok(shellStart >= 0 && workspaceStart > shellStart);
  const shellBlock = portal.slice(shellStart, workspaceStart);
  assert.doesNotMatch(shellBlock, /api\/academy\/checkout/);
  assert.doesNotMatch(shellBlock, /Enroll securely/);
});

test("course shell styles provide responsive desktop and mobile layouts", () => {
  assert.match(portalCss, /portal-course-shell-grid/);
  assert.match(portalCss, /repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(portalCss, /@media\(max-width:1180px\)/);
  assert.match(portalCss, /@media\(max-width:680px\)/);
  assert.match(portalCss, /portal-shell-badge\.enrolled/);
  assert.match(portalCss, /portal-shell-badge\.production/);
});
