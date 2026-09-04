import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const assetPath = "public/books/the-obserrian-doctrine-cover.png";
const data = fs.readFileSync("lib/publications.ts", "utf8");
const feature = fs.readFileSync("app/components/publications/ObserrianDoctrineFeature.tsx", "utf8");
const about = fs.readFileSync("app/about/page.tsx", "utf8");
const speaking = fs.readFileSync("app/speaking/page.tsx", "utf8");
const credentials = fs.readFileSync("app/about/VerifiedCredentials.tsx", "utf8");

test("the supplied Obserrian Doctrine cover remains byte-exact and dimensionally correct", () => {
  const image = fs.readFileSync(assetPath);
  assert.equal(createHash("sha256").update(image).digest("hex"), "505edcc442dc1c89594cb25e4b8565dde701e7a22c951d2aab845319c77b13b2");
  assert.equal(image.readUInt32BE(16), 937);
  assert.equal(image.readUInt32BE(20), 1253);
});

test("the publication record uses exact supplied facts and a clean Amazon destination", () => {
  assert.match(data, /title: "The Obserrian Doctrine"/);
  assert.match(data, /subtitle: "Executive Stewardship for Institutions Worthy of Trust"/);
  assert.match(data, /author: "Dr\. Jody Wayne Blanchard"/);
  assert.match(data, /isbn: "9798171759360"/);
  assert.match(data, /asin: "B0HHRT2YK7"/);
  assert.match(data, /amazonUrl: "https:\/\/www\.amazon\.com\/dp\/B0HHRT2YK7"/);
  assert.doesNotMatch(data, /ref=|qid=|dib=/);
});

test("About and Speaking both render the shared publication feature", () => {
  assert.match(about, /<ObserrianDoctrineFeature context="about" \/>/);
  assert.match(speaking, /<ObserrianDoctrineFeature context="speaking" \/>/);
  assert.match(feature, /import Image from "next\/image"/);
  assert.match(feature, /target="_blank" rel="noopener noreferrer"/);
  assert.match(feature, /opens in a new tab/);
  assert.match(about, /"@type": "Book"/);
});

test("Class A Private Investigative Agency application is shown as approved, not licensed", () => {
  assert.match(credentials, /Class A Private Investigative Agency", number: "APPLICATION APPROVED"/);
  assert.match(credentials, /status: "approved"/);
  assert.doesNotMatch(credentials, /Class A Private Investigative Agency", number: "APPLICATION PENDING"/);
  assert.match(credentials, /status === "approved" \? "APPROVED" : "LICENSED"/);
});
