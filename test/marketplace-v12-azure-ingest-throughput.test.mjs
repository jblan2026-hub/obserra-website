import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const INGEST = "scripts/marketplace-v12-artifact-ingest-azure.mjs";

test("Azure Marketplace ingest uses one SDK authority and bounded concurrency instead of per-product CLI subprocesses", () => {
  const source = fs.readFileSync(INGEST, "utf8");

  assert.match(source, /@azure\/storage-blob/);
  assert.match(source, /BlobServiceClient/);
  assert.match(source, /listBlobsFlat\(/);
  assert.match(source, /getBlockBlobClient\(/);
  assert.match(source, /MAX_CONCURRENCY\s*=\s*(?:[1-9]|[1-5][0-9]|6[0-4])\b/);
  assert.match(source, /runBounded|boundedMap|mapConcurrent|worker/i);
  assert.doesNotMatch(source, /execFileSync\(/);
  assert.doesNotMatch(source, /storage",\s*"blob",\s*"show"/);
  assert.doesNotMatch(source, /storage",\s*"blob",\s*"upload"/);
  assert.doesNotMatch(source, /for \(const record of records\) \{\s*const existing = head\(record\.objectKey\)/s);
});

test("Azure Marketplace ingest keeps exact local and remote artifact verification while optimizing transport", () => {
  const source = fs.readFileSync(INGEST, "utf8");

  assert.match(source, /sha256File\(path\)/);
  assert.match(source, /record\.byteLength/);
  assert.match(source, /record\.artifactSha256/);
  assert.match(source, /artifact_sha256/);
  assert.match(source, /catalog_revision/);
  assert.match(source, /product_id/);
  assert.match(source, /application\/zip/);
  assert.match(source, /serverEncrypted|isServerEncrypted/);
  assert.match(source, /protectedArtifactSetComplete/);
});
