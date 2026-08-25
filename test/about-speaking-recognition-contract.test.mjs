import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const about = fs.readFileSync("app/about/page.tsx", "utf8");
const aboutExtraCss = fs.readFileSync("app/about/about-extra.css", "utf8");
const aboutExecutiveCss = fs.readFileSync("app/about/about-executive.css", "utf8");
const speaking = fs.readFileSync("app/speaking/page.tsx", "utf8");
const enterpriseChrome = fs.readFileSync("app/components/enterprise/EnterpriseChrome.tsx", "utf8");

const requiredMedia = [
  "/leadership/ceh-hall-of-fame-2025.png",
  "/leadership/technology-talks-no-employer.png",
  "/leadership/fireside-chat-neutral.png",
  "/leadership/global-leadership-award-2025.png",
];

test("About restores completed speaking engagements and recognition media", () => {
  assert.match(about, /LEADERSHIP IN PRACTICE/);
  assert.match(about, /CNBC Technology Executive Council TEC Talk/);
  assert.match(about, /December 12, 2024/);
  assert.match(about, /Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty/);
  assert.match(about, /HMG Strategy Global Leadership Institute Awards/);
  assert.match(about, /CEH Hall of Fame 2025 magazine cover/);
  for (const media of requiredMedia) assert.match(about, new RegExp(media.replaceAll("/", "\\/")));
});

test("Speaking presents the engagements as completed work and shows the Hall of Fame cover", () => {
  assert.match(speaking, /<h1>Dr\. Jody Blanchard<\/h1>/);
  assert.doesNotMatch(speaking, /<h1>Dr\. Jody Blanchard, Ph\.D\.<\/h1>/);
  assert.match(speaking, /COMPLETED ENGAGEMENTS &amp; RECOGNITION/);
  assert.match(speaking, /CNBC Technology Executive Council TEC Talk/);
  assert.match(speaking, /December 12, 2024/);
  assert.match(speaking, /Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty/);
  assert.match(speaking, /ISE East Summit & Awards/);
  assert.match(speaking, /HMG Strategy Global Leadership Institute Awards/);
  assert.match(speaking, /CEH Hall of Fame 2025 magazine cover/);
  for (const media of requiredMedia) assert.match(speaking, new RegExp(media.replaceAll("/", "\\/")));
});

test("Speaking is discoverable from the enterprise primary navigation", () => {
  assert.match(enterpriseChrome, /\["Speaking", "\/speaking"\]/);
});

test("Speaking uses the supplied executive portrait without modifying its bytes", () => {
  const portraitPath = "public/leadership/dr-jody-blanchard-speaking.png";
  assert.match(speaking, /src="\/leadership\/dr-jody-blanchard-speaking\.png"/);
  assert.equal(createHash("sha256").update(fs.readFileSync(portraitPath)).digest("hex"), "774e819b386b5953b5e58fea61aa8b5c64ebfe1e1215a3b2e93db89c001651b6");
});

test("About leadership media cards wrap their own image and content height", () => {
  assert.match(aboutExtraCss, /\.leadership-media-grid \{[^}]*align-items: start;/);
  assert.match(aboutExtraCss, /\.leadership-media-grid article \{[^}]*height: fit-content;[^}]*align-self: start;/);
  assert.match(aboutExtraCss, /\.leadership-media-grid article img \{[^}]*height: auto;[^}]*aspect-ratio: auto;/);
  assert.doesNotMatch(aboutExtraCss, /\.leadership-media-grid article img \{[^}]*aspect-ratio: 4 \/ 3;/);
  assert.doesNotMatch(aboutExtraCss, /\.leadership-media-grid article img \{[^}]*aspect-ratio: 16 \/ 10;/);
});

test("Founder portrait gives Dr. Jody Blanchard stronger type hierarchy than the title", () => {
  assert.match(about, /<h1>Dr\. Jody Blanchard<\/h1>/);
  assert.match(about, /<p className="about-executive-role">Founder &amp; Chief Executive Officer · \{LEGAL_ENTITY_NAME\}<\/p>/);
  assert.match(aboutExecutiveCss, /\.about-executive-copy h1\{font-size:clamp\(3rem,5\.8vw,5\.5rem\)!important;/);
  assert.match(aboutExecutiveCss, /\.about-executive-role\{[^}]*font-size:1\.08rem!important;/);
});
