import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const globals = fs.readFileSync("app/globals.css", "utf8");
const header = fs.readFileSync("app/HomeHeader.tsx", "utf8");
const sitemap = fs.readFileSync("app/sitemap.ts", "utf8");
const robots = fs.readFileSync("app/robots.ts", "utf8");
const publicFdacs = fs.readFileSync("app/florida-security-training/page.tsx", "utf8");
const protectedAccess = fs.readFileSync("app/florida-security-training/access/page.tsx", "utf8");
const nextConfig = fs.readFileSync("next.config.ts", "utf8");
const contact = fs.readFileSync("app/contact/ContactExperience.tsx", "utf8");
const contactPage = fs.readFileSync("app/contact/page.tsx", "utf8");
const home = fs.readFileSync("app/page.tsx", "utf8");
const smoke = fs.readFileSync("scripts/production-smoke.mjs", "utf8");
const enterpriseChrome = fs.readFileSync("app/components/enterprise/EnterpriseChrome.tsx", "utf8");
const enterpriseStyles = fs.readFileSync("app/components/enterprise/enterprise-chrome.css", "utf8");
const trust = fs.readFileSync("app/trust/page.tsx", "utf8");

test("the public shell supports keyboard bypass and mobile navigation dismissal", () => {
  assert.match(layout, /className="obs-skip-link" href="#main-content"/);
  assert.match(layout, /id="main-content" tabIndex=\{-1\}/);
  assert.match(globals, /\.obs-skip-link:focus-visible/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /toggleRef\.current\?\.focus\(\)/);
});

test("search discovery includes only the public FDACS landing surface", () => {
  assert.match(sitemap, /\$\{siteUrl\}\/florida-security-training`/);
  assert.doesNotMatch(sitemap, /\$\{siteUrl\}\/portal`/);
  for (const path of [
    "/florida-security-training/access",
    "/florida-security-training/admin/",
    "/florida-security-training/enroll",
    "/florida-security-training/identity",
    "/florida-security-training/live/",
    "/portal/",
  ]) {
    assert.ok(robots.includes(`"${path}"`), `robots must exclude protected path ${path}`);
  }
});

test("the public FDACS LMS preserves learner structure while prelicense actions are visibly locked", () => {
  const governedLink = fs.readFileSync("app/florida-security-training/GovernedFloridaClassDLink.tsx", "utf8");
  assert.match(publicFdacs, /LMS PLATFORM LIVE · PRODUCTION SOFTWARE/);
  assert.match(publicFdacs, /ENROLLMENT & PAYMENT LOCKED · LICENSE ACTIVATION PENDING/);
  assert.match(publicFdacs, /Photo-ID controls before secure live video/);
  assert.match(publicFdacs, /not copied into the LMS/);
  assert.match(publicFdacs, /enabled=\{publicLearnerControlsEnabled\}/);
  assert.match(governedLink, /if \(!enabled\) \{/);
  assert.match(governedLink, /aria-disabled="true"/);
  assert.match(governedLink, /aria-describedby=\{lockedDescriptionId\}/);
  assert.match(governedLink, /className="obs-sr-only"/);
  assert.match(governedLink, /<button/);
  assert.doesNotMatch(governedLink, /\n\s*disabled\s*(?:\n|=|>)/);
  assert.match(governedLink, /title=\{lockedLabel\}/);
  assert.match(protectedAccess, /The LMS does not store copies or biometric templates/);
  assert.match(protectedAccess, /short-lived secure video/);
  assert.match(protectedAccess, /single-device controls pass/);
  assert.match(nextConfig, /frame-src[^"\n]*https:\/\/\*\.daily\.co/);
  assert.match(nextConfig, /camera=\(self "https:\/\/\*\.daily\.co"\)/);
  assert.match(nextConfig, /microphone=\(self "https:\/\/\*\.daily\.co"\)/);
});

test("public conversion paths are functional and claims stay explicit", () => {
  assert.doesNotMatch(contact, /calendly\.com/);
  assert.match(contact, /Request consultation scheduling/);
  assert.match(contact, /"florida-class-d-training": "Florida Class D program launch notice \(not enrollment or payment\)"/);
  assert.doesNotMatch(contactPage, /TRACKED DISTRIBUTION LINKS|lead-generation strategy session/);
  assert.match(contactPage, /ENGAGEMENT GOVERNANCE/);
  assert.match(home, /Illustrative preview/);
  assert.match(home, /not a live customer environment/);
  assert.match(smoke, /assert\.equal\(response\.status, 405/);
});

test("primary enterprise surfaces use one responsive executive design system", () => {
  for (const path of [
    "app/page.tsx",
    "app/services/page.tsx",
    "app/industries/page.tsx",
    "app/about/page.tsx",
    "app/trust/page.tsx",
    "app/contact/page.tsx",
  ]) {
    const page = fs.readFileSync(path, "utf8");
    assert.match(page, /<EnterpriseHeader /, `${path} must use the enterprise header`);
    assert.match(page, /<EnterpriseProofBand \/>/, `${path} must use grounded proof signals`);
    assert.match(page, /<EnterpriseFooter \/>/, `${path} must use the enterprise footer`);
    assert.match(page, /enterprise-page-main/, `${path} must use the shared focus and layout boundary`);
  }
  assert.match(enterpriseChrome, /aria-controls="enterprise-navigation"/);
  assert.match(enterpriseChrome, /event\.key !== "Escape"/);
  assert.match(enterpriseChrome, /Executive-led/);
  assert.match(enterpriseChrome, /Evidence-backed/);
  assert.match(enterpriseStyles, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(enterpriseStyles, /@media\(max-width:700px\)/);
  assert.match(enterpriseStyles, /@media\(prefers-reduced-motion:reduce\)/);
});

test("public assurance and Academy claims preserve release and regulatory truth", () => {
  assert.match(trust, /Cybersecurity Maturity Model Certification \(CMMC\) Level 2/);
  assert.match(trust, /Not assessed/);
  assert.match(trust, /Human determinations/);
  assert.match(trust, /Pending/);
  assert.match(trust, /Controlled unclassified information \(CUI\) authorization/);
  assert.match(trust, /Not granted/);
  assert.match(trust, /Florida Department of Agriculture and Consumer Services \(FDACS\) authorization/);
  assert.match(trust, /Alignment and engineering evidence are not certification/);
  assert.doesNotMatch(trust, /Published and operational/);
  assert.match(home, /Regulated programs follow separate eligibility and authorization gates/);
  assert.match(home, /Reviewed nonregulated course baseline/);
  assert.doesNotMatch(home, /Receive immediate account-based access/);
  assert.doesNotMatch(home, /Complete, assess, and certify/);
});
