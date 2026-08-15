import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const about = fs.readFileSync("app/about/page.tsx", "utf8");
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
  assert.match(speaking, /SELECTED COMPLETED ENGAGEMENTS/);
  assert.match(speaking, /CNBC Technology Executive Council TEC Talk/);
  assert.match(speaking, /December 12, 2024/);
  assert.match(speaking, /Cybersecurity ROI: Transforming Security Expenditure into Business Growth in a Time of Economic Uncertainty/);
  assert.match(speaking, /ISE East Summit &amp; Awards/);
  assert.match(speaking, /HMG Strategy Global Leadership Institute Awards/);
  assert.match(speaking, /CEH Hall of Fame 2025 magazine cover/);
  for (const media of requiredMedia) assert.match(speaking, new RegExp(media.replaceAll("/", "\\/")));
});

test("Speaking is discoverable from the enterprise primary navigation", () => {
  assert.match(enterpriseChrome, /\["Speaking", "\/speaking"\]/);
});
