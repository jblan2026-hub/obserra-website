import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const runtimeFiles = [
  "app/academy/courseData.ts",
  "app/academy/courseExperience.ts",
  "app/academy/learn/[courseId]/page.tsx",
  "app/api/academy/tutor/route.ts",
  "app/api/academy/certificate/verify/route.ts",
  "app/ai-marketplace/MarketplaceCommandDeck.tsx",
  "app/catalog/catalogData.ts",
  "app/portal/applications/page.tsx",
  "app/services/serviceCatalog.ts",
  "app/trust/policies.ts",
  "lib/academy.ts",
  "lib/academyAccess.ts",
  "lib/academy-legacy-clerk.ts",
];

const forbiddenCustomerFacingNames = [
  "Obserra Academy",
  "Obserra Marketplace",
  "Obserra Applications",
  "Obserra Customer Portal",
];

test("runtime customer surfaces do not use legacy standalone Obserra product names", () => {
  for (const path of runtimeFiles) {
    const source = fs.readFileSync(path, "utf8");
    for (const forbidden of forbiddenCustomerFacingNames) {
      assert.equal(source.includes(forbidden), false, `${path} contains forbidden customer-facing name: ${forbidden}`);
    }
  }
});

test("runtime customer surfaces use owned Obserra EPI product identity", () => {
  const courseData = fs.readFileSync("app/academy/courseData.ts", "utf8");
  const marketplace = fs.readFileSync("app/ai-marketplace/MarketplaceCommandDeck.tsx", "utf8");
  const portal = fs.readFileSync("app/portal/applications/page.tsx", "utf8");
  const services = fs.readFileSync("app/services/serviceCatalog.ts", "utf8");

  assert.match(courseData, /ACADEMY_BRAND_NAME/);
  assert.match(marketplace, /Obserra EPI AI Marketplace/);
  assert.match(portal, /APPLICATIONS_BRAND_NAME/);
  assert.match(services, /Obserra EPI Academy/);
});
