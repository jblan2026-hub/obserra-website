import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Obserra EPI Academy stays public while Applications remain off public enterprise navigation", () => {
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const home = read("app/page.tsx");
  const identity = read("lib/legal-identity.ts");
  const styles = read("app/components/enterprise/enterprise-sales-navigation.css");

  assert.match(identity, /APPLICATIONS_BRAND_NAME = `\$\{BRAND_PREFIX\} Applications`/);
  assert.match(identity, /ACADEMY_BRAND_NAME = `\$\{BRAND_PREFIX\} Academy`/);
  assert.doesNotMatch(chrome, /\[APPLICATIONS_BRAND_NAME, "\/apps", "sales"\]/);
  assert.doesNotMatch(chrome, /<Link href="\/apps">/);
  assert.match(chrome, /\[ACADEMY_BRAND_NAME, "\/academy", "sales"\]/);
  assert.match(chrome, /className=\{prominence === "sales" \? "ent-header__sales-link"/);
  assert.match(chrome, /<Link href="\/academy">\{ACADEMY_BRAND_NAME\}<\/Link>/);
  assert.match(styles, /> a\.ent-header__sales-link/);
  assert.match(home, /<ButtonLink href="\/academy" variant="secondary">Browse \{ACADEMY_BRAND_NAME\}<\/ButtonLink>/);
  assert.ok(fs.existsSync("app/apps/page.tsx"), "private Applications implementation must remain present");
  assert.ok(fs.existsSync("lib/applications-team-access.ts"), "Applications team authorization must remain present");
});

test("Academy catalog exposes checkout only for explicitly activated courses", () => {
  const page = read("app/academy/page.tsx");
  const client = read("app/academy/AcademyControlledClient.tsx");

  assert.match(page, /purchaseAvailability=\{purchaseAvailability\}/);
  assert.match(page, /control\?\.lifecycle === "published" && control\.purchaseEnabled === true/);
  assert.match(page, /"https:\/\/schema\.org\/OutOfStock"/);
  assert.match(client, /purchaseAvailability\[courseId\] === true/);
  assert.match(client, /purchaseAvailable\(featuredCourse\.id\) \? \(/);
  assert.match(client, /const canPurchase = purchaseAvailable\(course\.id\)/);
  assert.match(client, /Not yet available for purchase/);
  assert.match(client, /Not yet for sale/);
  assert.match(client, /0 are currently open for purchase|purchasableCourseCount/);
});

test("Academy LMS stays live while new enrollment and payment remain licensing-gated", () => {
  const licensing = read("lib/academy-licensing.ts");
  const catalogPage = read("app/academy/page.tsx");
  const coursePage = read("app/academy/[courseId]/page.tsx");
  const checkout = read("app/api/academy/checkout/route.ts");
  const notice = read("app/academy/AcademyCommerceNotice.tsx");
  const homeHeader = read("app/HomeHeader.tsx");
  const learnPage = read("app/academy/learn/[courseId]/page.tsx");

  assert.match(licensing, /OBSERRA_ACADEMY_LICENSED_SALES_ENABLED/);
  assert.match(licensing, /===\s*["']enabled["']/);
  assert.match(catalogPage, /academyLicensedSalesEnabled/);
  assert.match(catalogPage, /commerceState\.enrollment \?\? \(!licensedSalesEnabled \? "licensing-pending" : undefined\)/);
  assert.match(coursePage, /academyLicensedSalesEnabled/);
  assert.match(coursePage, /commerceState\.enrollment \?\? commerceState\.checkout \?\? \(!licensedSalesEnabled \? "licensing-pending" : undefined\)/);
  assert.match(checkout, /academyLicensedSalesEnabled/);
  assert.match(checkout, /licensing-pending/);
  assert.match(notice, /licensing-pending/);
  assert.match(homeHeader, /Academy LMS/);
  assert.match(learnPage, /academyStateWithOwnerAccess/);
  assert.doesNotMatch(learnPage, /academyLicensedSalesEnabled/);
});
