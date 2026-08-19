import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const BRAND_PREFIX = "Obserra EPI";
const PRODUCT_BRANDS = [
  `${BRAND_PREFIX} Academy`,
  `${BRAND_PREFIX} EIOS`,
  `${BRAND_PREFIX} Applications`,
  `${BRAND_PREFIX} Products`,
];

const publicRouteSources = new Map([
  ["/", "app/page.tsx"],
  ["/about", "app/about/page.tsx"],
  ["/academy", "app/academy/page.tsx"],
  ["/academy/[courseId]", "app/academy/[courseId]/page.tsx"],
  ["/academy/enterprise", "app/academy/enterprise/page.tsx"],
  ["/catalog", "app/catalog/page.tsx"],
  ["/certifications", "app/certifications/page.tsx"],
  ["/contact", "app/contact/page.tsx"],
  ["/eios", "app/eios/page.tsx"],
  ["/eios/[capability]", "app/eios/[capability]/page.tsx"],
  ["/florida-security-training", "app/florida-security-training/page.tsx"],
  ["/industries", "app/industries/page.tsx"],
  ["/industries/[industry]", "app/industries/[industry]/page.tsx"],
  ["/products/[slug]", "app/products/[slug]/page.tsx"],
  ["/protection-intelligence", "app/protection-intelligence/page.tsx"],
  ["/resources", "app/resources/page.tsx"],
  ["/services", "app/services/page.tsx"],
  ["/services/[serviceId]", "app/services/[serviceId]/page.tsx"],
  ["/sign-in", "app/sign-in/[[...sign-in]]/page.tsx"],
  ["/sign-up", "app/sign-up/[[...sign-up]]/page.tsx"],
  ["/speaking", "app/speaking/page.tsx"],
  ["/store", "app/store/page.tsx"],
  ["/trust", "app/trust/page.tsx"],
  ["/trust/[slug]", "app/trust/[slug]/page.tsx"],
  ["/trust/alignment", "app/trust/alignment/page.tsx"],
]);

const excludedApplicationPrefixes = [
  "app/apps/",
  "app/api/apps/",
  "app/portal/applications/",
];

function collectTsx(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = fullPath.replaceAll(path.sep, "/");
    if (excludedApplicationPrefixes.some((prefix) => relativePath.startsWith(prefix))) continue;
    if (entry.isDirectory()) collectTsx(fullPath, output);
    else if (entry.isFile() && entry.name.endsWith(".tsx")) output.push(relativePath);
  }
  return output.sort();
}

test("governed legal and product brand constants are centralized", () => {
  const identity = fs.readFileSync("lib/legal-identity.ts", "utf8");
  assert.match(identity, /LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC"/);
  assert.match(identity, /BRAND_PREFIX = "Obserra EPI"/);
  for (const productBrand of ["Academy", "EIOS", "Applications", "Products"]) {
    assert.match(identity, new RegExp(`${productBrand.toUpperCase()}_BRAND_NAME|${productBrand === "EIOS" ? "EIOS" : productBrand.toUpperCase()}_BRAND_NAME`));
  }
});

test("the customer-facing route inventory is explicit and excludes Applications", () => {
  assert.ok(publicRouteSources.size >= 25, "public route inventory unexpectedly contracted");
  for (const [route, sourcePath] of publicRouteSources) {
    assert.ok(fs.existsSync(sourcePath), `${route} source is missing: ${sourcePath}`);
    assert.ok(!excludedApplicationPrefixes.some((prefix) => sourcePath.startsWith(prefix)), `${route} crosses the Applications exclusion boundary`);
  }
});

test("non-Applications customer source rejects retired, shortened, or ungoverned company identity", () => {
  const prohibited = [
    [/(?:https?:\/\/)(?:www\.)?obserra\.com\b/i, "retired obserra.com origin"],
    [/\bObserra Executive Protection (?:and|&) Intelligence LLC\b/, "mixed-case or noncanonical legal name"],
    [/aria-label=["']Obserra(?: home| operating principles)["']/i, "short company aria label"],
    [/alt=["']Obserra["']/i, "short company image alternative"],
    [/\bObserra, EIOS\b/i, "short company ownership statement"],
    [/\bObserra (?:Academy|EIOS|Applications|Products)\b/, "ungoverned bare product brand"],
    [/\bObserra\s+(?:is|provides|supports|helps|connects|delivers|serves|company|website|merchant|provider|owner|team)\b/i, "short company subject"],
  ];

  for (const sourcePath of collectTsx("app")) {
    const source = fs.readFileSync(sourcePath, "utf8");
    for (const [pattern, label] of prohibited) {
      assert.doesNotMatch(source, pattern, `${sourcePath} contains ${label}`);
    }
    if (source.includes('/brand/obserra-logo.png')) {
      assert.ok(source.includes("LEGAL_ENTITY_NAME") || source.includes(LEGAL_ENTITY_NAME), `${sourcePath} logo lacks the legal company identity`);
    }
  }
});

test("homepage uses governed Obserra EPI product brands and full legal company identity", () => {
  const home = fs.readFileSync("app/page.tsx", "utf8");
  for (const token of ["ACADEMY_BRAND_NAME", "EIOS_BRAND_NAME", "APPLICATIONS_BRAND_NAME", "LEGAL_ENTITY_NAME"]) {
    assert.ok(home.includes(token), `homepage must consume ${token}`);
  }
  for (const productBrand of PRODUCT_BRANDS.slice(0, 3)) {
    assert.ok(productBrand.startsWith(BRAND_PREFIX));
  }
});

test("retired legacy brand route directories are absent", () => {
  const retiredRouteSegment = String.fromCharCode(97, 120, 105, 111, 110, 105, 115);
  assert.equal(fs.existsSync(path.join("app", retiredRouteSegment)), false);
  assert.equal(fs.existsSync(path.join("app", "apps", retiredRouteSegment)), false);
});

test("public regulatory status remains fail closed and human determinations remain pending", () => {
  const trust = fs.readFileSync("app/trust/page.tsx", "utf8");
  const fdacs = fs.readFileSync("app/florida-security-training/page.tsx", "utf8");
  const completion = fs.readFileSync("app/florida-security-training/completion/page.tsx", "utf8");

  assert.match(trust, /Cybersecurity Maturity Model Certification \(CMMC\) Level 2/);
  assert.match(trust, /Not assessed/);
  assert.match(trust, /Human determinations/);
  assert.match(trust, /Pending/);
  assert.match(trust, /Controlled unclassified information \(CUI\) authorization/);
  assert.match(trust, /Not granted/);
  assert.match(fdacs, /does not claim FDACS approval or production authorization/);
  assert.match(fdacs, /Enrollment, course credit, completion, certificates, and Licensing Information and Alert System \(LIAS\) reporting remain disabled/);
  assert.match(completion, /Production authorization is false/);
  assert.match(completion, /no course credit, completion document, certificate, or LIAS record can be issued until the separate FDACS activation gates are satisfied/i);
});
