import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("enterprise navigation separates buyer paths without crowding the primary header", () => {
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const home = read("app/page.tsx");
  const identity = read("lib/legal-identity.ts");
  const styles = read("app/components/enterprise/enterprise-sales-navigation.css");

  assert.match(identity, /APPLICATIONS_BRAND_NAME = `\$\{BRAND_PREFIX\} Applications`/);
  assert.match(identity, /ACADEMY_BRAND_NAME = `\$\{BRAND_PREFIX\} Academy`/);
  assert.match(chrome, /\["Solutions", "\/services"\]/);
  assert.match(chrome, /\["Applications", "\/apps"\]/);
  assert.match(chrome, /\["AI Marketplace", "\/ai-marketplace", "marketplace"\]/);
  assert.match(chrome, /\[ACADEMY_BRAND_NAME, "\/academy"\]/);
  assert.match(chrome, /\["Trust", "\/trust"\]/);
  assert.match(chrome, /\["About", "\/about"\]/);
  assert.doesNotMatch(chrome, /\["Florida Class D Training", "\/florida-security-training"\]/);
  assert.doesNotMatch(chrome, /\["Speaking", "\/speaking"\]/);
  assert.match(chrome, /className=\{prominence === "marketplace" \? "ent-header__sales-link"/);
  assert.match(styles, /> a\.ent-header__sales-link/);
  assert.match(chrome, /Book an executive briefing/);
  assert.match(chrome, /href="\/florida-security-training">Florida Class D Training/);
  assert.match(home, /<ButtonLink href="\/contact\?interest=executive-briefing">Book an executive briefing<\/ButtonLink>/);
  assert.match(home, /<ButtonLink href="\/services" variant="secondary">Explore solutions<\/ButtonLink>/);
  assert.ok(fs.existsSync("app/apps/page.tsx"), "Applications implementation must remain present");
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

test("production Academy gate accepts governed POST checkout or the explicit licensing lock", () => {
  const gate = read(".github/workflows/production-e2e-operational-gate.yml");

  assert.match(gate, /<form\[\^>\]\*\(action="\/api\/academy\/checkout"/);
  assert.match(gate, /method="post"/);
  assert.match(gate, /Academy LMS is live; new enrollment is not yet open/);
  assert.match(gate, /0\[\^0-9\]\+are currently open for purchase/);
  assert.match(gate, /New enrollment and payment stay disabled until the required licensing is complete/);
  assert.match(gate, /Academy checkout action is present without a governed POST form/);
  assert.doesNotMatch(gate, /^\s+grep -Eqi 'action="\/api\/academy\/checkout"'/m);
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


test("Marketplace is a public, accessible Applications marketplace with one canonical product authority", () => {
  const marketplaceRoute = read("app/marketplace/page.tsx");
  const applicationsPage = read("app/apps/page.tsx");

  assert.match(marketplaceRoute, /import AppsMarketplaceClient from "\.\.\/apps\/AppsMarketplaceClient"/);
  assert.match(marketplaceRoute, /return <AppsMarketplaceClient \/>;/);
  assert.match(marketplaceRoute, /alternates: \{ canonical: "\/apps" \}/);
  assert.doesNotMatch(marketplaceRoute, /permanentRedirect/);
  assert.match(applicationsPage, /alternates: \{ canonical: "\/apps" \}/);
});


test("Application product pages omit placeholder visuals and unverified runtime commerce claims", () => {
  const marketplace = read("app/apps/AppsMarketplaceClient.tsx");
  const styles = read("app/apps/apps.css");
  const detail = read("app/apps/[slug]/page.tsx");

  assert.doesNotMatch(marketplace, /app-screenshot-placeholder/);
  assert.doesNotMatch(styles, /app-screenshot-placeholder/);
  assert.doesNotMatch(detail, /liveApplicationUrls/);
  assert.doesNotMatch(detail, /Subscribe & Launch/);
  assert.doesNotMatch(detail, /manage billing in Stripe/);
  assert.doesNotMatch(detail, /\/api\/apps\/(?:access|billing-portal|download)/);
  assert.match(detail, /Request enterprise demo/);
  assert.match(detail, /Request deployment assessment/);
});


test("Marketplace status labels do not imply unverified production readiness", () => {
  const catalog = read("app/apps/appsData.ts");
  const marketplace = read("app/apps/AppsMarketplaceClient.tsx");
  const detail = read("app/apps/[slug]/page.tsx");

  assert.match(catalog, /Available: "Enterprise assessment"/);
  assert.match(catalog, /Pilot: "Pilot assessment"/);
  assert.match(catalog, /"Coming Soon": "Pre-release"/);
  assert.doesNotMatch(marketplace, /Available solutions can be evaluated now/);
  assert.match(marketplace, /No product is presented as a live self-service/);
  assert.match(marketplace, /marketplaceEngagementLabel\[entry\.status\]/);
  assert.match(detail, /marketplaceEngagementLabel\[entry\.status\]/);
});


test("Homepage contains no illustrative preview, mockup, or unverified purchase language", () => {
  const home = read("app/page.tsx");

  assert.doesNotMatch(home, /Illustrative preview/);
  assert.doesNotMatch(home, /Representative interface only/);
  assert.doesNotMatch(home, /obserra-eios-intelligence-hero\.png/);
  assert.doesNotMatch(home, /eios-overview-marketing\.png/);
  assert.doesNotMatch(home, /Shop \{APPLICATIONS_BRAND_NAME\}/);
  assert.match(home, /View \{APPLICATIONS_BRAND_NAME\}/);
  assert.match(home, /product-specific engagement, deployment, and access controls/);
});
