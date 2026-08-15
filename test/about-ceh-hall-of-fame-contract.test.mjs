import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const about = fs.readFileSync("app/about/page.tsx", "utf8");

function sha256(path) {
  return createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

test("About publishes the exact holder-supplied CEH Hall of Fame award files", () => {
  assert.equal(
    sha256("public/recognition/ceh-hall-of-fame-2025-badge.jpg"),
    "8bf9fba46ba0f99b7bbb30f39b8ea6db02fe0b1fea9c5c951c3665f03ebdb35e",
  );
  assert.equal(
    sha256("public/recognition/ceh-hall-of-fame-2025-certificate.jpg"),
    "be4f72f26c7a0400c47f99e42850f4fbd2010c78d1952e9fb925ab2397be703b",
  );
  assert.match(about, /Certified Ethical Hacker Hall of Fame, 2025/);
  assert.match(about, /HOF-2025-1500089/);
  assert.match(about, /July 1, 2025/);
});

test("the award links to the official EC-Council page that lists Jody Blanchard", () => {
  assert.match(about, /https:\/\/www\.eccouncil\.org\/ceh-hall-of-fame-2025\//);
  assert.match(about, /Verify on EC-Council&apos;s official Hall of Fame page/);
  assert.doesNotMatch(about, /placeholder|synthetic|mock award/i);
});
