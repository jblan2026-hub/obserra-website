import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const aboutRail = fs.readFileSync("app/about/about-visual-repair.css", "utf8");
const speakingRail = fs.readFileSync("app/speaking/speaker-executive.css", "utf8");
const credentials = fs.readFileSync("app/about/VerifiedCredentials.tsx", "utf8");
const redesign = fs.readFileSync("app/components/premium/institutional-redesign.css", "utf8");
const publication = fs.readFileSync("app/components/publications/obserrian-doctrine.css", "utf8");

test("About credential and evidence rails retain their scrolling model", () => {
  assert.match(aboutRail, /\.verified-credentials-grid\{[\s\S]*?display:flex!important;/);
  assert.match(aboutRail, /\.verified-credentials-grid\{[\s\S]*?overflow-x:auto!important;/);
  assert.match(aboutRail, /\.verified-credentials-grid\{[\s\S]*?scroll-snap-type:x mandatory!important;/);
  assert.match(aboutRail, /\.verified-credential-card\{[\s\S]*?flex:0 0 248px!important;/);
  assert.match(aboutRail, /\.about-proof-rail\{[\s\S]*?overflow-x:auto!important;/);
  assert.match(aboutRail, /\.about-proof-card\{[\s\S]*?flex:0 0 292px!important;/);
  assert.match(credentials, /role="region" aria-label=\{label\} tabIndex=\{0\}/);
  assert.match(credentials, /aria-label=\{`Scroll \$\{label\} left`\}/);
  assert.match(credentials, /aria-label=\{`Scroll \$\{label\} right`\}/);
});

test("Speaking rails retain horizontal overflow and snapping", () => {
  assert.match(speakingRail, /\.speaker-proof-rail\{[^}]*overflow-x:auto;/);
  assert.match(speakingRail, /\.speaker-proof-rail\{[^}]*scroll-snap-type:x mandatory;/);
  assert.match(speakingRail, /\.speaker-proof-rail>article,[^{]*\{scroll-snap-align:start;/);
});

test("new design layers do not address protected scrolling-card selectors", () => {
  for (const css of [redesign, publication]) {
    for (const selector of [
      ".about-proof-rail",
      ".about-proof-card",
      ".verified-credentials-grid",
      ".verified-credential-card",
      ".speaker-proof-rail",
      ".speaker-topic-rail",
      ".speaker-media-rail",
      ".speaker-media-card",
    ]) assert.ok(!css.includes(selector), `redesign must not override ${selector}`);
  }
});
