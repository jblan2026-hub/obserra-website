import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import {
  EXPECTED_ARCHIVE_MANIFEST_SHA256,
  EXPECTED_CATALOG_REVISION,
  inside,
  materializeArtifacts,
  readCatalog,
  releaseRecords,
  safeRelativePath,
  sha256File,
  validateDeliveryCatalog,
  verifyArchiveFiles,
} from "./marketplace-v12-artifact-lib.mjs";

const root = resolve(import.meta.dirname, "..");

test("the materializer accepts only the exact v1.2 catalog source", () => {
  const value = readCatalog({
    catalogPath: join(root, "data/marketplace/obserra-marketplace-card-catalog.json.gz"),
    summaryPath: join(root, "data/marketplace/obserra-marketplace-card-catalog.summary.json"),
  });
  assert.equal(value.catalog.catalog_revision, EXPECTED_CATALOG_REVISION);
  assert.equal(value.summary.counts.product_cards, 11_390);
  assert.equal(value.summary.counts.source_archives, 15);
  assert.match(EXPECTED_ARCHIVE_MANIFEST_SHA256, /^[a-f0-9]{64}$/);
});

test("artifact paths cannot escape controlled roots", () => {
  assert.equal(safeRelativePath("skill/1.0.0/skill.zip", "object", ".zip"), "skill/1.0.0/skill.zip");
  assert.throws(() => safeRelativePath("../skill.zip", "object", ".zip"), /unsafe segment/);
  assert.throws(() => safeRelativePath("/skill.zip", "object", ".zip"), /relative path/);
  assert.throws(() => inside("/tmp/safe", "a/../../outside.zip", "object"), /unsafe segment/);
});

test("materialization verifies nested bytes and resumes from exact output", async () => {
  const temp = mkdtempSync(join(tmpdir(), "obserra-marketplace-artifact-"));
  try {
    const nestedRoot = join(temp, "nested", "repo", "upload-zips");
    mkdirSync(nestedRoot, { recursive: true });
    const artifactWork = join(temp, "artifact-work");
    mkdirSync(artifactWork, { recursive: true });
    writeFileSync(join(artifactWork, "SKILL.md"), "# Verified capability\n");
    const artifactPath = join(nestedRoot, "capability.zip");
    execFileSync("zip", ["-q", artifactPath, "SKILL.md"], { cwd: artifactWork });
    const archivePath = join(temp, "sources", "supplied.zip");
    mkdirSync(dirname(archivePath), { recursive: true });
    execFileSync("zip", ["-q", "-r", archivePath, "repo"], { cwd: join(temp, "nested") });
    const artifactSha256 = await sha256File(artifactPath);
    const archiveSha256 = await sha256File(archivePath);
    const manifest = { schema_version: "1.0", publisher: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC", archives: [{ filename: "supplied.zip", bytes: statSync(archivePath).size, sha256: archiveSha256 }] };
    const catalog = {
      source_archives: [{ filename: "supplied.zip", bytes: statSync(archivePath).size, sha256: archiveSha256 }],
      cards: [{
        product_id: "capability",
        product_type: "ai-skill",
        version: "1.0.0",
        install: { profile: "skill-upload" },
        artifact: { deployment_key: "capability/1.0.0/capability.zip", nested_member: "repo/upload-zips/capability.zip", filename: "capability.zip", sha256: artifactSha256, bytes: statSync(artifactPath).size, media_type: "application/zip", source_archive: "supplied.zip", source_archive_sha256: archiveSha256 },
      }],
    };
    const records = releaseRecords(catalog, manifest, { enforceExact: false });
    const archives = await verifyArchiveFiles(manifest, join(temp, "sources"));
    const settings = { records, archives, outputDirectory: join(temp, "output"), workDirectory: join(temp, "work"), checkpointPath: join(temp, "checkpoint.json"), revision: EXPECTED_CATALOG_REVISION, verifiedAt: "2026-08-23T12:00:00.000Z" };
    const first = await materializeArtifacts(settings);
    assert.equal(first.written, 1);
    assert.equal(first.reused, 0);
    validateDeliveryCatalog(first.deliveryCatalog, records, EXPECTED_CATALOG_REVISION);
    const second = await materializeArtifacts(settings);
    assert.equal(second.written, 0);
    assert.equal(second.reused, 1);
    assert.equal(await sha256File(join(temp, "output/capability/1.0.0/capability.zip")), artifactSha256);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("activation source suppresses credentials and requires exact payment and Azure storage evidence", () => {
  const ingest = readFileSync(join(root, "scripts/marketplace-v12-artifact-ingest-azure.mjs"), "utf8");
  assert.match(ingest, /OBSERRA_MARKETPLACE_V12_PROTECTED_DELIVERY_APPROVED_REVISION/);
  assert.match(ingest, /stripeAccountChargesEnabled/);
  assert.match(ingest, /verifiedOfferBindings/);
  assert.match(ingest, /serverEncrypted === true/);
  assert.match(ingest, /stobserramktv1238d660/);
  assert.match(ingest, /marketplace-v12-release/);
  assert.match(ingest, /artifact_sha256/);
  assert.match(ingest, /catalog_revision/);
  assert.match(ingest, /product_id/);
  assert.match(ingest, /provider output suppressed/);
  assert.doesNotMatch(ingest, /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|ServerSideEncryption === "aws:kms"/);
  assert.doesNotMatch(ingest, /console\.log\([^)]*(?:supabaseKey|stripeKey|stripeWebhook)/);
});

test("the production workflow is manual, exact-revision guarded, and Key Vault sourced", () => {
  const workflow = readFileSync(join(root, ".github/workflows/marketplace-v12-protected-delivery.yml"), "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s+(?:push|pull_request):/m);
  assert.match(workflow, /environment: production/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /git rev-parse HEAD/);
  assert.match(workflow, new RegExp(EXPECTED_CATALOG_REVISION));
  assert.match(workflow, /azure\/login@v3\.0\.1/);
  assert.match(workflow, /az keyvault secret show/);
  assert.match(workflow, /applications-supabase-service-role-key/);
  assert.match(workflow, /applications-stripe-secret-key/);
  assert.match(workflow, /applications-stripe-webhook-secret/);
  assert.match(workflow, /::add-mask::/);
  assert.match(workflow, /verify-marketplace-v12-stripe-evidence\.mjs/);
  assert.match(workflow, /marketplace-v12-artifact-ingest-azure\.mjs/);
  assert.match(workflow, /AZURE_RELEASE_CONTAINER: marketplace-v12-release/);
  assert.doesNotMatch(workflow, /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|ai-marketplace-release-aws-/);
  assert.match(workflow, /protectedArtifactSetComplete == true/);
});