import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const assetDirectory = path.join(repositoryRoot, "public", "badges", "eccouncil");
const manifestPath = path.join(assetDirectory, "asset-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const expectedCredentialIds = [
  "adg-adopt",
  "adg-defend",
  "adg-govern",
  "ceh",
  "chfi",
  "ecih",
  "eces",
  "cciso",
  "cnda",
];

const expectedAdgRecords = {
  "adg-adopt": {
    credentialId: "ADG-ADO-4RQRY6",
    verificationUrl: "https://aigovernance.eccouncil.org/verify/ADG-ADO-4RQRY6",
    sourceReference: "https://aigovernance.eccouncil.org/api/badge/image?id=ADG-ADO-4RQRY6",
  },
  "adg-defend": {
    credentialId: "ADG-DEF-93CTC8",
    verificationUrl: "https://aigovernance.eccouncil.org/verify/ADG-DEF-93CTC8",
    sourceReference: "https://aigovernance.eccouncil.org/api/badge/image?id=ADG-DEF-93CTC8",
  },
  "adg-govern": {
    credentialId: "ADG-GOV-9Q8BPK",
    verificationUrl: "https://aigovernance.eccouncil.org/verify/ADG-GOV-9Q8BPK",
    sourceReference: "https://aigovernance.eccouncil.org/api/badge/image?id=ADG-GOV-9Q8BPK",
  },
};

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "invalid PNG signature");
  assert.equal(buffer.subarray(12, 16).toString("ascii"), "IHDR", "missing PNG IHDR");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function svgDimensions(buffer) {
  const source = buffer.toString("utf8");
  const openingTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const width = Number(openingTag.match(/\bwidth=["'](\d+)["']/i)?.[1]);
  const height = Number(openingTag.match(/\bheight=["'](\d+)["']/i)?.[1]);
  return { width, height, source };
}

test("EC-Council manifest is the complete authorized credential inventory", () => {
  assert.equal(manifest.schemaVersion, "1.1.0");
  assert.equal(manifest.recordType, "authorized-ec-council-credential-artwork");
  assert.equal(manifest.legalOwner, "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC");
  assert.equal(manifest.credentials.length, 9);
  assert.deepEqual(manifest.credentials.map(({ id }) => id).sort(), expectedCredentialIds.toSorted());
  assert.equal(new Set(manifest.credentials.map(({ id }) => id)).size, 9, "credential IDs must be unique");
  assert.equal(new Set(manifest.credentials.map(({ assetPath }) => assetPath)).size, 9, "asset paths must be unique");
});

test("ADG live issuer observations remain bound to the authorized local records", () => {
  assert.equal(manifest.issuerVerificationObservations.length, 3);
  assert.equal(new Set(manifest.issuerVerificationObservations.map(({ credentialId }) => credentialId)).size, 3);

  for (const observation of manifest.issuerVerificationObservations) {
    const credential = manifest.credentials.find((entry) => entry.credentialId === observation.credentialId);
    assert.ok(credential, `${observation.credentialId}: observation has no authorized credential record`);
    assert.equal(observation.issuer, "EC-Council");
    assert.equal(observation.status, "active");
    assert.equal(observation.issuedOn, "2026-07-01");
    assert.equal(observation.verificationPageIsSourceOfTruth, true);
    assert.deepEqual({ width: observation.imageWidth, height: observation.imageHeight }, { width: 1200, height: 630 });
    assert.equal(observation.verificationUrl, credential.verificationUrl);
    assert.equal(observation.sourceReference, credential.sourceReference);
    assert.match(observation.verifiedAt, /^2026-08-14T\d{2}:\d{2}:\d{2}Z$/);
    assert.ok(observation.claimBoundary.includes("issuer verification page remains authoritative"));

    const assetPath = path.join(repositoryRoot, "public", credential.assetPath.replace(/^\//, ""));
    const source = readFileSync(assetPath, "utf8");
    assert.ok(source.includes(observation.credentialId), `${observation.credentialId}: local issuer record omits credential ID`);
    assert.ok(source.includes(observation.subjectName), `${observation.credentialId}: local issuer record omits observed subject`);
  }
});

test("every authorized asset exists, matches its digest and dimensions, and is safe to serve", () => {
  for (const credential of manifest.credentials) {
    assert.match(credential.sha256, /^[a-f0-9]{64}$/);
    assert.match(credential.assetPath, /^\/badges\/eccouncil\/[a-z0-9-]+\.(png|svg)$/);
    const relativeAssetPath = credential.assetPath.replace(/^\//, "");
    const assetPath = path.join(repositoryRoot, "public", relativeAssetPath.replace(/^badges\/eccouncil\//, "badges/eccouncil/"));
    assert.equal(path.dirname(assetPath), assetDirectory, `${credential.id}: asset escaped the authorized directory`);
    assert.equal(existsSync(assetPath), true, `${credential.id}: asset is missing`);
    const bytes = readFileSync(assetPath);
    assert.equal(sha256(bytes), credential.sha256, `${credential.id}: SHA-256 mismatch`);

    if (credential.mimeType === "image/png") {
      assert.equal(path.extname(assetPath), ".png");
      assert.deepEqual(pngDimensions(bytes), { width: credential.width, height: credential.height });
      continue;
    }

    assert.equal(credential.mimeType, "image/svg+xml");
    assert.equal(path.extname(assetPath), ".svg");
    const { width, height, source } = svgDimensions(bytes);
    assert.deepEqual({ width, height }, { width: credential.width, height: credential.height });
    assert.doesNotMatch(source, /<script|\bonload\s*=|\bonerror\s*=|<foreignObject|javascript:/i, `${credential.id}: unsafe active SVG content`);
  }
});

test("ADG credentials retain their individual issuer verification records", () => {
  for (const [id, expected] of Object.entries(expectedAdgRecords)) {
    const credential = manifest.credentials.find((entry) => entry.id === id);
    assert.ok(credential, `${id}: missing manifest record`);
    assert.equal(credential.sourceType, "issuer-api");
    assert.equal(credential.artworkKind, "issuer-verification-record");
    assert.equal(credential.credentialId, expected.credentialId);
    assert.equal(credential.verificationUrl, expected.verificationUrl);
    assert.equal(credential.sourceReference, expected.sourceReference);
  }
});

test("only manifest-authorized credential images are stored", () => {
  const storedImages = readdirSync(assetDirectory)
    .filter((name) => /\.(?:png|svg|jpe?g|webp|gif|avif)$/i.test(name))
    .sort();
  const authorizedImages = manifest.credentials
    .map(({ assetPath }) => path.basename(assetPath))
    .sort();
  assert.deepEqual(storedImages, authorizedImages);
});

test("the gallery has no synthetic fallback, watermark, or stale credential source", () => {
  const component = readFileSync(path.join(repositoryRoot, "app", "about", "VerifiedCredentials.tsx"), "utf8");
  const stylesheet = readFileSync(path.join(repositoryRoot, "app", "credential-issuer-marks.css"), "utf8");
  const inspectedSource = `${component}\n${stylesheet}`;
  assert.match(component, /asset-manifest\.json/);
  assert.doesNotMatch(inspectedSource, /badge-artwork-unavailable|credential-artwork-watermark|iclass\.eccouncil\.org|associate-cciso|adg-(?:adopt|defend|govern)\.png/i);
  assert.equal(existsSync(path.join(repositoryRoot, "app", "CredentialIssuerMarks.tsx")), false, "stale duplicate gallery source remains");
});

test.after(() => {
  process.stdout.write(`${JSON.stringify({ status: "pass", gate: "ec-council-badge-integrity-v1", credentialCount: manifest.credentials.length })}\n`);
});
