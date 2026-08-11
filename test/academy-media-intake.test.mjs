import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "academy-media-intake.mjs");

function hash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function fixtureManifest() {
  return {
    schemaVersion: "1.0.0",
    manifestSha256: "a".repeat(64),
    jobs: [
      {
        jobId: "cybersecurity-foundations:heygen:instructor-welcome:1",
        idempotencyKey: "b".repeat(64),
        courseId: "cybersecurity-foundations",
        provider: "heygen",
        assetType: "instructor-welcome",
        aspectRatio: "16:9",
        durationSeconds: 15,
        qualityGates: [
          "approved-source-script",
          "authorized-avatar-and-voice-only",
          "owner-approval-recorded"
        ]
      }
    ]
  };
}

function run(args, env = process.env) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    env,
  });
}

test("media intake prepares deterministic receipt templates from governed jobs", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-intake-prepare-"));
  const manifestPath = path.join(temp, "manifest.json");
  const assets = path.join(temp, "assets");
  const output = path.join(temp, "output");
  fs.writeFileSync(manifestPath, JSON.stringify(fixtureManifest()), "utf8");

  const result = run([
    "--mode", "prepare",
    "--manifest", manifestPath,
    "--assets", assets,
    "--output", output,
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const register = JSON.parse(
    fs.readFileSync(path.join(output, "academy-media-intake-register.json"), "utf8"),
  );
  assert.equal(register.courseCount, 1);
  assert.equal(register.jobCount, 1);
  const entry = register.entries[0];
  assert.equal(entry.courseId, "cybersecurity-foundations");
  assert.match(entry.receiptFile, /^receipts\/cybersecurity-foundations\//);
  assert.match(entry.mediaFile, /\.mp4$/);
  assert.match(entry.captionFile, /\.vtt$/);
  assert.match(entry.transcriptFile, /-transcript\.md$/);

  const receiptPath = path.join(assets, ...entry.receiptFile.split("/"));
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  assert.equal(receipt.status, "generated");
  assert.equal(receipt.ownerApproval.approved, false);
  assert.equal(receipt.qualityGates.length, 3);
});

test("media intake validates accepted assets, hashes, captions, transcript, rights, and approval", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-intake-validate-"));
  const manifestPath = path.join(temp, "manifest.json");
  const assets = path.join(temp, "assets");
  const output = path.join(temp, "output");
  const noToolsPath = path.join(temp, "empty-path");
  fs.mkdirSync(noToolsPath, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(fixtureManifest()), "utf8");

  let result = run([
    "--mode", "prepare",
    "--manifest", manifestPath,
    "--assets", assets,
    "--output", output,
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const register = JSON.parse(
    fs.readFileSync(path.join(output, "academy-media-intake-register.json"), "utf8"),
  );
  const entry = register.entries[0];
  const resolveAsset = (relative) => path.join(assets, ...relative.split("/"));
  for (const relative of [entry.mediaFile, entry.captionFile, entry.transcriptFile, entry.rightsFile]) {
    fs.mkdirSync(path.dirname(resolveAsset(relative)), { recursive: true });
  }
  fs.writeFileSync(resolveAsset(entry.mediaFile), "synthetic-test-media", "utf8");
  fs.writeFileSync(resolveAsset(entry.captionFile), "WEBVTT\n\n00:00.000 --> 00:01.000\nWelcome", "utf8");
  fs.writeFileSync(resolveAsset(entry.transcriptFile), "# Transcript\n\nWelcome.", "utf8");
  fs.writeFileSync(resolveAsset(entry.rightsFile), JSON.stringify({ authorized: true }), "utf8");

  const receiptPath = resolveAsset(entry.receiptFile);
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  const now = new Date().toISOString();
  Object.assign(receipt, {
    status: "accepted",
    serviceAssetId: "heygen-canary-asset-1",
    mediaSha256: hash(resolveAsset(entry.mediaFile)),
    captionSha256: hash(resolveAsset(entry.captionFile)),
    transcriptSha256: hash(resolveAsset(entry.transcriptFile)),
    rightsSha256: hash(resolveAsset(entry.rightsFile)),
    width: 1920,
    height: 1080,
    generatedAt: now,
    downloadedAt: now,
  });
  receipt.qualityGates = receipt.qualityGates.map((gate) => ({
    ...gate,
    passed: true,
    reviewedAt: now,
  }));
  receipt.ownerApproval = {
    approved: true,
    approvedBy: "Dr. Jody Blanchard",
    approvedAt: now,
    notes: "Canary accepted.",
  };
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), "utf8");

  result = run(
    [
      "--mode", "validate",
      "--manifest", manifestPath,
      "--assets", assets,
      "--output", output,
    ],
    { ...process.env, PATH: noToolsPath, FFPROBE_PATH: "" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const validation = JSON.parse(
    fs.readFileSync(path.join(output, "academy-media-intake-validation.json"), "utf8"),
  );
  assert.equal(validation.passed, true);
  assert.equal(validation.passedJobs, 1);
  assert.equal(validation.failedJobs, 0);
  assert.equal(validation.ffprobeAvailable, false);
});

test("media intake rejects an unapproved generated receipt", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "obserra-media-intake-reject-"));
  const manifestPath = path.join(temp, "manifest.json");
  const assets = path.join(temp, "assets");
  const output = path.join(temp, "output");
  fs.writeFileSync(manifestPath, JSON.stringify(fixtureManifest()), "utf8");
  let result = run([
    "--mode", "prepare",
    "--manifest", manifestPath,
    "--assets", assets,
    "--output", output,
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  result = run([
    "--mode", "validate",
    "--manifest", manifestPath,
    "--assets", assets,
    "--output", output,
  ]);
  assert.notEqual(result.status, 0);
  const validation = JSON.parse(
    fs.readFileSync(path.join(output, "academy-media-intake-validation.json"), "utf8"),
  );
  assert.equal(validation.passed, false);
  assert.ok(validation.results[0].findings.includes("status:not-accepted"));
  assert.ok(validation.results[0].findings.includes("owner-approval:not-approved"));
});

test("media intake source enforces path containment, sha256, and optional ffprobe evidence", () => {
  const source = fs.readFileSync(script, "utf8");
  assert.match(source, /path-escapes-asset-root/);
  assert.match(source, /sha256-mismatch/);
  assert.match(source, /ffprobe-required-but-unavailable/);
  assert.match(source, /video-stream-missing/);
  assert.match(source, /audio-sample-rate/);
  assert.match(source, /duration-outside-governed-tolerance/);
});
