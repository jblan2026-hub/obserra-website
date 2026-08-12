import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const parse = (path) => JSON.parse(read(path));

const policy = parse("config/academy-owner-identity-attribution-policy.json");
const openingStandard = parse("config/academy-course-opening-standard.json");
const cinematicStandard = parse("config/academy-cinematic-production-standard.json");
const mediaFactory = parse("config/academy-media-factory.json");
const runtime = read("app/academy/courseOpening.ts");
const planner = read("scripts/academy-course-opening-plan.mjs");
const certificate = read("app/academy/certificate/[courseId]/CertificateView.tsx");
const about = read("app/about/page.tsx");
const continuousHandoff = read("docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md");
const latestHandoff = read("docs/academy-media-pipeline/LATEST-HANDOFF.md");
const restart = read("docs/OBSERRA-ACADEMY-RESTART-HERE.md");
const identityAddendum = read("docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-OWNER-IDENTITY-AND-REGISTERED-BRAND-LOCK.md");
const audit = read("docs/academy-media-pipeline/OWNER-IDENTITY-BRAND-HEYGEN-AND-COURSE-AUDIT-2026-08-12.md");
const courseReview = read("docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-COMPLETE-COURSE-REVIEW.md");
const productionPack = read("docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md");
const canary = read("docs/academy-media-pipeline/canary/HEYGEN-15-SECOND-LIKENESS-CANARY.md");

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

const activePublicRecords = [
  continuousHandoff,
  latestHandoff,
  restart,
  identityAddendum,
  audit,
];

const activeProductionRecords = [
  JSON.stringify(policy),
  JSON.stringify(openingStandard),
  JSON.stringify(cinematicStandard),
  JSON.stringify(mediaFactory),
  runtime,
  planner,
  certificate,
  courseReview,
  productionPack,
  canary,
  ...activePublicRecords,
].join("\n");

test("machine-readable policies lock Founder and CEO as the sole Academy owner title", () => {
  assert.equal(policy.owner.name, canonical.owner);
  assert.equal(policy.owner.soleApprovedPublicTitle, canonical.title);
  assert.equal(policy.owner.alternateTitlesAllowed, false);
  assert.equal(policy.owner.additionalTitlesAllowed, false);
  assert.equal(policy.owner.currentEmployerNamesAllowed, false);
  assert.equal(policy.owner.formerEmployerNamesAllowed, false);
  assert.equal(policy.organization.academyName, canonical.academy);
  assert.equal(policy.organization.shortBusinessName, canonical.shortBusiness);
  assert.equal(policy.organization.epiMeaning, canonical.epiMeaning);
  assert.equal(policy.organization.legalName, canonical.legalName);
  assert.equal(policy.owner.canonicalPortraitPath, canonical.portrait);

  assert.equal(openingStandard.brand.presenterName, canonical.owner);
  assert.equal(openingStandard.brand.presenterTitle, canonical.title);
  assert.equal(openingStandard.brand.academyName, canonical.academy);
  assert.equal(openingStandard.brand.shortBusinessName, canonical.shortBusiness);
  assert.equal(openingStandard.brand.epiMeaning, canonical.epiMeaning);
  assert.equal(openingStandard.brand.legalName, canonical.legalName);
  assert.equal(openingStandard.brand.officialWebsite, canonical.website);
  assert.equal(openingStandard.brand.officialWebsiteDisplay, canonical.websiteDisplay);
  assert.equal(openingStandard.ownerIdentity.additionalOwnerTitlesAllowed, false);
  assert.equal(openingStandard.ownerIdentity.currentOrFormerEmployerReferencesAllowed, false);

  const intro = openingStandard.sequence.find((item) => item.id === "owner-course-introduction");
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

test("cinematic and media-factory controls use exact owner identity and registered Obserra EPI branding", () => {
  assert.equal(cinematicStandard.brand.academyName, canonical.academy);
  assert.equal(cinematicStandard.brand.shortBusinessName, canonical.shortBusiness);
  assert.equal(cinematicStandard.brand.epiMeaning, canonical.epiMeaning);
  assert.equal(cinematicStandard.brand.legalName, canonical.legalName);
  assert.equal(cinematicStandard.brand.presenterName, canonical.owner);
  assert.equal(cinematicStandard.brand.presenterTitle, canonical.title);
  assert.equal(cinematicStandard.brand.currentOrFormerEmployerReferenceAllowed, false);
  assert.equal(cinematicStandard.presenterPerformance.soleApprovedOwnerTitle, canonical.title);
  assert.equal(cinematicStandard.presenterPerformance.currentOrFormerEmployerReferencesProhibited, true);
  assert.equal(cinematicStandard.courseOpening.introMaster.minimumWidthPixels, 3840);
  assert.equal(cinematicStandard.courseOpening.introMaster.minimumHeightPixels, 2160);
  assert.equal(cinematicStandard.audioMaster.speechCleanupRequired, true);
  assert.equal(cinematicStandard.audioMaster.speechCleanupMustNotAlterVoiceIdentity, true);

  assert.equal(mediaFactory.brand.academyName, canonical.academy);
  assert.equal(mediaFactory.brand.shortBusinessName, canonical.shortBusiness);
  assert.equal(mediaFactory.brand.epiMeaning, canonical.epiMeaning);
  assert.equal(mediaFactory.brand.legalName, canonical.legalName);
  assert.equal(mediaFactory.brand.presenterName, canonical.owner);
  assert.equal(mediaFactory.brand.presenterTitle, canonical.title);
  assert.deepEqual(mediaFactory.brand.presenterLowerThird, [
    canonical.owner,
    canonical.title,
    canonical.legalName,
    canonical.websiteDisplay,
  ]);
  assert.equal(mediaFactory.brand.currentOrFormerEmployerReferencesAllowed, false);
  assert.equal(mediaFactory.productionStandard.exactOwnerFaceAndVoiceRequired, true);
  assert.equal(mediaFactory.productionStandard.soleOwnerTitle, canonical.title);
  assert.equal(mediaFactory.productionStandard.employerReferencesAllowed, false);
  assert.equal(mediaFactory.productionStandard.courseIntroMasterResolution, "3840x2160");
  assert.equal(mediaFactory.productionStandard.speechCleanupMayNotAlterPresenterVoice, true);
});

test("course runtime, planner, certificate, and About record use the exact approved title and business identity", () => {
  for (const source of [runtime, planner]) {
    assert.match(source, /Founder and CEO/);
    assert.match(source, /Obserra EPI Academy/);
    assert.match(source, /Executive Protection & Intelligence|Executive Protection and Intelligence/);
    assert.match(source, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC|spokenLegalName|legalName/);
    assert.match(source, /employerReferencesAllowed: false/);
  }

  assert.match(runtime, /www\.obserrallc\.com/);
  assert.match(runtime, /additionalTitlesAllowed: false/);
  assert.match(planner, /additionalTitlesAllowed: false/);

  assert.match(certificate, /const ACADEMY_NAME = "Obserra EPI Academy"/);
  assert.match(certificate, /const LEGAL_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC"/);
  assert.match(certificate, /const OWNER_NAME = "Dr\. Jody Blanchard"/);
  assert.match(certificate, /const OWNER_TITLE = "Founder and CEO"/);
  assert.doesNotMatch(certificate, /Founder and Owner|Owner and Founder/i);

  assert.match(about, /jobTitle: "Founder and CEO"/);
  assert.match(about, /FOUNDER &amp; CEO/);
  assert.match(about, /dr-jody-blanchard-executive\.webp/);
  assert.match(about, /Obserra Executive Protection & Intelligence LLC/);
});

test("current handoff, restart, and audit records preserve exact owner and registered brand definitions", () => {
  for (const document of activePublicRecords) {
    assert.match(document, /Dr\. Jody Blanchard/);
    assert.match(document, /Founder and CEO/);
    assert.match(document, /Obserra EPI Academy/);
    assert.match(document, /Obserra EPI/);
    assert.match(document, /Executive Protection & Intelligence/);
    assert.match(document, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC/);
    assert.match(document, /www\.obserrallc\.com/);
  }
});

test("active handoffs preserve the verified three-card HeyGen state and reject false Trash claims", () => {
  for (const document of activePublicRecords) {
    assert.match(document, /Owner Review Video/);
    assert.match(document, /three visible cards|three visible project cards|three visible/i);
    assert.match(document, /still visible|visible in My Projects: yes/i);
    assert.match(document, /underlying generated video record: deleted|underlying video record was deleted|underlying rejected video record: deleted/i);
    assert.doesNotMatch(document, /moved to Trash by owner/i);
    assert.doesNotMatch(document, /owner moved the rejected project to Trash/i);
    assert.doesNotMatch(document, /rejected project visible in current My Projects screenshot: no/i);
    assert.doesNotMatch(document, /approved projects visible in current My Projects screenshot: exactly two/i);
  }
});

test("current canary records require exact owner identity, Founder and CEO, and no employer references", () => {
  for (const document of [courseReview, productionPack, canary]) {
    assert.match(document, /Dr\. Jody Blanchard/);
    assert.match(document, /Founder and CEO/);
    assert.match(document, /Obserra EPI Academy/);
    assert.match(document, /Executive Protection & Intelligence/);
    assert.match(document, /exact approved face|exact owner face/i);
    assert.match(document, /exact approved voice|exact owner voice/i);
    assert.match(document, /employer/i);
  }
});

test("active Academy production records contain no superseded owner title", () => {
  for (const forbidden of [
    /Owner, Founder, and Cybersecurity Executive/i,
    /Founder and Owner/i,
    /Owner and Founder/i,
    /Founder and Cybersecurity Executive/i,
    /Two-Time Fortune 500 Chief Information Security Officer/i,
  ]) {
    assert.doesNotMatch(activeProductionRecords, forbidden);
  }
});

test("public audit and handoff records do not expose controlled provider identifiers", () => {
  const publicRecords = activePublicRecords.join("\n");
  for (const identifier of [
    /9cde7d534d2c4332bd30c5e587a88003/i,
    /ae7539dc419c4b89971ba6d092452a55/i,
    /2a52e99cc5344b4ba5e08b01fe5100cf/i,
    /7da10cc3dd9441ccb2825805c6e5270b/i,
    /3ceff5713ebf4a74bfb8435222474f0e/i,
    /bbf8b60d8dd44dcc80a8f061fa56ca4d/i,
  ]) {
    assert.doesNotMatch(publicRecords, identifier);
  }
});
