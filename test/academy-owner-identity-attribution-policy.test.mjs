import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const parse = (path) => JSON.parse(read(path));

const policy = parse("config/academy-owner-identity-attribution-policy.json");
const standard = parse("config/academy-course-opening-standard.json");
const runtime = read("app/academy/courseOpening.ts");
const planner = read("scripts/academy-course-opening-plan.mjs");
const about = read("app/about/page.tsx");
const continuousHandoff = read("docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md");
const latestHandoff = read("docs/academy-media-pipeline/LATEST-HANDOFF.md");
const restart = read("docs/OBSERRA-ACADEMY-RESTART-HERE.md");
const identityAddendum = read("docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-OWNER-IDENTITY-AND-REGISTERED-BRAND-LOCK.md");

const canonical = {
  owner: "Dr. Jody Blanchard",
  title: "Founder and CEO",
  academy: "Obserra EPI Academy",
  shortBusiness: "Obserra EPI",
  epiMeaning: "Executive Protection & Intelligence",
  legalName: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  website: "https://www.obserrallc.com",
  websiteDisplay: "www.obserrallc.com",
  portrait: "/leadership/dr-jody-blanchard-executive.webp",
};

test("machine-readable policies lock Founder and CEO as the sole Academy owner title", () => {
  assert.equal(policy.owner.name, canonical.owner);
  assert.equal(policy.owner.soleApprovedPublicTitle, canonical.title);
  assert.equal(policy.owner.alternateTitlesAllowed, false);
  assert.equal(policy.owner.additionalTitlesAllowed, false);
  assert.equal(policy.organization.academyName, canonical.academy);
  assert.equal(policy.organization.shortBusinessName, canonical.shortBusiness);
  assert.equal(policy.organization.epiMeaning, canonical.epiMeaning);
  assert.equal(policy.organization.legalName, canonical.legalName);
  assert.equal(policy.owner.canonicalPortraitPath, canonical.portrait);

  assert.equal(standard.brand.presenterName, canonical.owner);
  assert.equal(standard.brand.presenterTitle, canonical.title);
  assert.equal(standard.brand.academyName, canonical.academy);
  assert.equal(standard.brand.shortBusinessName, canonical.shortBusiness);
  assert.equal(standard.brand.epiMeaning, canonical.epiMeaning);
  assert.equal(standard.brand.legalName, canonical.legalName);
  assert.equal(standard.brand.officialWebsite, canonical.website);
  assert.equal(standard.brand.officialWebsiteDisplay, canonical.websiteDisplay);
  assert.equal(standard.ownerIdentity.additionalOwnerTitlesAllowed, false);
  assert.equal(standard.ownerIdentity.currentOrFormerEmployerReferencesAllowed, false);

  const intro = standard.sequence.find((item) => item.id === "owner-course-introduction");
  assert.ok(intro);
  assert.equal(intro.presenter, canonical.owner);
  assert.equal(intro.presenterTitle, canonical.title);
  assert.equal(intro.additionalTitlesMayBeAdded, false);
  assert.equal(intro.employerReferencesMayBeAdded, false);
  assert.equal(intro.lowerThird.line1, canonical.owner);
  assert.equal(intro.lowerThird.line2, canonical.title);
  assert.equal(intro.lowerThird.line3, canonical.legalName);
  assert.equal(intro.lowerThird.line4, canonical.websiteDisplay);
});

test("course runtime and planner use the sole approved title and registered business identity", () => {
  for (const source of [runtime, planner]) {
    assert.match(source, /Founder and CEO/);
    assert.match(source, /Obserra EPI Academy/);
    assert.match(source, /Executive Protection & Intelligence|Executive Protection and Intelligence/);
    assert.match(source, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC|spokenLegalName|legalName/);
  }

  assert.match(runtime, /www\.obserrallc\.com/);
  assert.match(runtime, /additionalTitlesAllowed: false/);
  assert.match(runtime, /employerReferencesAllowed: false/);
  assert.match(planner, /additionalTitlesAllowed: false/);
  assert.match(planner, /employerReferencesAllowed: false/);
});

test("current handoff and restart records preserve the exact owner and EPI definitions", () => {
  for (const document of [continuousHandoff, latestHandoff, restart, identityAddendum]) {
    assert.match(document, /Dr\. Jody Blanchard/);
    assert.match(document, /Founder and CEO/);
    assert.match(document, /Obserra EPI Academy/);
    assert.match(document, /Obserra EPI/);
    assert.match(document, /Executive Protection & Intelligence/);
    assert.match(document, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC/);
    assert.match(document, /www\.obserrallc\.com/);
  }
});

test("the corporate About record identifies the owner as Founder and CEO and uses the canonical portrait", () => {
  assert.match(about, /jobTitle: "Founder and CEO"/);
  assert.match(about, /FOUNDER &amp; CEO/);
  assert.match(about, /dr-jody-blanchard-executive\.webp/);
  assert.match(about, /Obserra Executive Protection & Intelligence LLC/);
});

test("active Academy attribution records contain no superseded owner title", () => {
  const academyRecords = [
    JSON.stringify(policy),
    JSON.stringify(standard),
    runtime,
    planner,
    continuousHandoff,
    latestHandoff,
    restart,
    identityAddendum,
  ].join("\n");

  for (const forbidden of [
    /Owner, Founder, and Cybersecurity Executive/i,
    /Founder and Owner/i,
    /Owner and Founder/i,
    /Founder and Cybersecurity Executive/i,
    /Two-Time Fortune 500 Chief Information Security Officer/i,
  ]) {
    assert.doesNotMatch(academyRecords, forbidden);
  }
});
