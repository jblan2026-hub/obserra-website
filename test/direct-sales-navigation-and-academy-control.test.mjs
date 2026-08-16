import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (relativePath) => fs.readFileSync(relativePath, "utf8");

test("Applications and Academy are prominent direct website destinations", () => {
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const home = read("app/page.tsx");
  const styles = read("app/components/enterprise/enterprise-sales-navigation.css");

  assert.ok(chrome.indexOf('["Applications", "/apps", "sales"]') < chrome.indexOf('["Academy", "/academy", "sales"]'));
  assert.match(chrome, /className=\{prominence === "sales" \? "ent-header__sales-link"/);
  assert.match(chrome, /Applications Marketplace<\/Link><Link href="\/academy">Obserra Academy/);
  assert.match(styles, /> a\.ent-header__sales-link/);
  assert.match(home, /<ButtonLink href="\/apps">Shop Applications<\/ButtonLink>/);
  assert.match(home, /<ButtonLink href="\/academy" variant="secondary">Browse Academy<\/ButtonLink>/);
  assert.match(home, /Applications and Academy are direct website destinations/);
  assert.match(home, /href="\/apps" className="mission-direct-sales__card"/);
  assert.match(home, /href="\/academy" className="mission-direct-sales__card"/);
  assert.doesNotMatch(home, /href="\/portal\/applications" className="mission-direct-sales__card"/);
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
