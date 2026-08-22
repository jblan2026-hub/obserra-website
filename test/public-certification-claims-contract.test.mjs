import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";

const read = (path) => fs.readFileSync(path, "utf8");

const academyPublicSources = [
  "app/academy/page.tsx",
  "app/academy/AcademyClient.tsx",
  "app/academy/AcademyControlledClient.tsx",
  "app/academy/learn/CoursePlayer.tsx",
  "app/academy/[courseId]/page.tsx",
  "app/academy/certificate/[courseId]/CertificateView.tsx",
  "app/store/page.tsx",
  "app/ObserraGuide.tsx",
];

test("Academy uses a course-completion credential, not professional certification language", () => {
  const combined = academyPublicSources.map(read).join("\n");

  assert.doesNotMatch(combined, /Obserra Certificates? of Training/);
  assert.doesNotMatch(combined, />Certify</);
  assert.doesNotMatch(combined, /Professional courses and certifications/);
  assert.doesNotMatch(combined, /Professional learning and certification pathways/);
  assert.match(combined, /Certificate of Course Completion/);
  assert.match(combined, /not a state license, occupational authorization, accredited academic credit, or third-party professional certification/);
});

test("Academy structured data identifies the legal entity as the course provider", () => {
  const academyPage = read("app/academy/page.tsx");
  const coursePage = read("app/academy/[courseId]/page.tsx");
  const certificate = read("app/academy/certificate/[courseId]/CertificateView.tsx");

  assert.match(academyPage, /name: LEGAL_ENTITY_NAME/);
  assert.match(coursePage, /const LEGAL_NAME = LEGAL_ENTITY_NAME/);
  assert.match(coursePage, /provider:\s*\{[\s\S]*name: LEGAL_NAME/);
  assert.match(certificate, /const LEGAL_NAME = LEGAL_ENTITY_NAME/);
  assert.match(certificate, /ACADEMY_BRAND_NAME/);
  assert.match(certificate, /Certificate of Course Completion/);
  assert.match(certificate, /issued by \{LEGAL_NAME\}/);
});

test("the FDACS LMS deployment is readiness-gated while regulated learner commerce and credit remain disabled", () => {
  const landing = read("app/florida-security-training/page.tsx");
  const controls = read("app/florida-security-training/GovernedFloridaClassDLink.tsx");
  const completionPage = read("app/florida-security-training/completion/page.tsx");

  assert.match(landing, /LMS PLATFORM DEPLOYED · READINESS GATED/);
  assert.doesNotMatch(landing, /LMS PLATFORM LIVE · PRODUCTION SOFTWARE/);
  assert.match(landing, /ENROLLMENT & PAYMENT LOCKED · LICENSE ACTIVATION PENDING/);
  assert.match(landing, /Enrollment and payment remain unavailable until licensing and production activation are complete/);
  assert.match(landing, /does not claim FDACS approval or production authorization/);
  assert.match(landing, /Enrollment, course credit, completion, certificates, and Licensing Information and Alert System \(LIAS\) reporting remain disabled until every applicable authorization gate is satisfied/);
  assert.match(controls, /if \(!enabled\) \{/);
  assert.match(controls, /aria-disabled="true"/);
  assert.match(controls, /<button/);
  assert.match(controls, /disabled/);
  assert.match(completionPage, /Production authorization is false/);
  assert.match(completionPage, /no course credit, completion document, certificate, or LIAS record can be issued until the separate FDACS activation gates are satisfied/i);
});

test("FDACS supplemental output is named as a record and never as the official state certificate", () => {
  const completionPage = read("app/florida-security-training/completion/page.tsx");
  const service = read("lib/florida-class-d-completion-documents.ts");

  for (const source of [completionPage, service]) {
    assert.match(source, /Supplemental Course Completion Record/);
    assert.doesNotMatch(source, /OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC-branded certificate/);
    assert.doesNotMatch(source, /successfully completed the school requirements/);
  }
  assert.match(service, /does not establish FDACS approval, professional certification, or a Florida Class D Security Officer license/);
});

test("the shared enterprise header renders the exact legal site identity visibly", () => {
  const chrome = read("app/components/enterprise/EnterpriseChrome.tsx");
  const styles = read("app/components/enterprise/legal-identity-lockup.css");

  assert.match(chrome, /className="ent-header__legal-name">\{LEGAL_ENTITY_NAME\}/);
  assert.match(styles, /\.ent-header__legal-name/);
});

test("public page titles rely on the root legal-name template exactly once", () => {
  const rootLayout = read("app/layout.tsx");
  const floridaTraining = read("app/florida-security-training/page.tsx");
  const store = read("app/store/page.tsx");
  const contact = read("app/contact/page.tsx");

  assert.match(rootLayout, /template: `%s \| \$\{LEGAL_ENTITY_NAME\}`/);
  assert.match(floridaTraining, /title: "Florida Class D Security Officer Training"/);
  assert.match(store, /title: "Store"/);
  assert.match(contact, /title: "Contact"/);
  assert.doesNotMatch(floridaTraining, /title: [^\n]*OBSERRA EXECUTIVE PROTECTION/);
  assert.doesNotMatch(store, /title: [^\n]*LEGAL_ENTITY_NAME/);
  assert.doesNotMatch(contact, /title: `Contact \| \$\{LEGAL_ENTITY_NAME\}`/);
});
