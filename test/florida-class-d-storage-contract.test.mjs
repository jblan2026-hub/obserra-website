import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const storageConfig = fs.readFileSync("supabase/config.toml", "utf8");
const completionDocuments = fs.readFileSync("lib/florida-class-d-completion-documents.ts", "utf8");

const bucketSection = storageConfig.match(
  /\[storage\.buckets\.fdacs-class-d-completion-documents\]([\s\S]*?)(?=\n\[|$)/,
)?.[1] ?? "";

test("regulated completion-document bucket is source controlled", () => {
  assert.ok(bucketSection.length > 0, "missing regulated storage bucket configuration");
});

test("regulated completion-document bucket is private", () => {
  assert.match(bucketSection, /(?:^|\n)\s*public\s*=\s*false\s*(?:\n|$)/);
});

test("regulated completion-document bucket is limited to 10 MiB PDFs", () => {
  assert.match(bucketSection, /(?:^|\n)\s*file_size_limit\s*=\s*"10MiB"\s*(?:\n|$)/);
  assert.match(bucketSection, /(?:^|\n)\s*allowed_mime_types\s*=\s*\[\s*"application\/pdf"\s*\]\s*(?:\n|$)/);
});

test("completion-document runtime requires exact regulated bucket binding", () => {
  assert.match(completionDocuments, /const REQUIRED_BUCKET = "fdacs-class-d-completion-documents";/);
  assert.match(completionDocuments, /process\.env\.OBSERRA_FDACS_DOCUMENTS_BUCKET\?\.trim\(\) \|\| ""/);
  assert.match(completionDocuments, /bucket !== REQUIRED_BUCKET/);
  assert.doesNotMatch(completionDocuments, /DEFAULT_BUCKET/);
});
