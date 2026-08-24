import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const WORKFLOW = ".github/workflows/marketplace-v12-protected-delivery.yml";
const source = readFileSync(WORKFLOW, "utf8");

test("Marketplace protected delivery uses immutable actions and locked dependencies", () => {
  assert.match(source, /actions\/checkout@d23441a48e516b6c34aea4fa41551a30e30af803/);
  assert.match(source, /azure\/login@f5d393ae46f8fde4be8b75f32e3fc50e654ad0ca/);
  assert.match(source, /actions\/upload-artifact@b7c566a772e6b6bfb58ed0dc250532a479d7789f/);
  assert.match(source, /npm ci --ignore-scripts --no-audit --no-fund/);
  assert.doesNotMatch(source, /uses:\s*actions\/checkout@v\d+/);
  assert.doesNotMatch(source, /uses:\s*azure\/login@v\d/);
  assert.doesNotMatch(source, /uses:\s*actions\/upload-artifact@v\d+/);
});

test("Marketplace protected delivery remains exact-revision, private-storage, and activation-last", () => {
  assert.match(source, /github\.ref == 'refs\/heads\/main'/);
  assert.match(source, /environment: production/);
  assert.match(source, /marketplace-v12-source/);
  assert.match(source, /marketplace-v12-release/);
  assert.match(source, /materialization-result\.json/);
  assert.match(source, /requiredProducts == 11390/);
  assert.match(source, /requiredArchives == 15/);
  assert.match(source, /verify-marketplace-v12-stripe-evidence\.mjs/);
  assert.match(source, /verify-marketplace-v12-ledger-evidence\.mjs/);
  assert.match(source, /marketplace-v12-artifact-ingest-azure\.mjs/);
  assert.match(source, /ai-marketplace-v12-release-evidence-signature/);
  assert.match(source, /set_secret_value ai-marketplace-v12-activation-approved-revision/);
  const ingest = source.indexOf("marketplace-v12-artifact-ingest-azure.mjs");
  const activation = source.indexOf("set_secret_value ai-marketplace-v12-activation-approved-revision");
  assert.ok(ingest >= 0 && activation > ingest, "activation approval must be published after protected artifact ingest");
});
