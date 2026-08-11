#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_MANIFEST = path.join(
  ROOT,
  "release",
  "academy-media-factory",
  "academy-media-job-manifest.json",
);
const DEFAULT_ASSETS = path.join(ROOT, "release", "academy-media-assets");
const DEFAULT_OUTPUT = path.join(ROOT, "release", "academy-media-intake");
const SHA_PATTERN = /^[a-f0-9]{64}$/;
const COURSE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,120}$/;
const SAFE_SEGMENT_PATTERN = /^[a-zA-Z0-9._-]{1,240}$/;

function fail(message) {
  console.error(`[academy-media-intake] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { mode: "prepare", requireFfprobe: false };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--mode") args.mode = argv[++index];
    else if (token === "--manifest") args.manifest = argv[++index];
    else if (token === "--assets") args.assets = argv[++index];
    else if (token === "--output") args.output = argv[++index];
    else if (token === "--course") args.course = argv[++index];
    else if (token === "--require-ffprobe") args.requireFfprobe = true;
    else if (token === "--help") args.help = true;
    else fail(`Unknown argument: ${token}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage:\n  node scripts/academy-media-intake.mjs --mode prepare [--course <course-id>]\n  node scripts/academy-media-intake.mjs --mode validate [--course <course-id>] [--require-ffprobe]\n\nOptions:\n  --manifest <media job manifest>\n  --assets <asset root>\n  --output <intake output root>`);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Unable to read ${label} ${filePath}: ${error.message}`);
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function safeSegment(value, label) {
  const result = String(value ?? "").trim();
  if (!SAFE_SEGMENT_PATTERN.test(result)) fail(`Unsafe ${label}: ${result || "missing"}.`);
  return result;
}

function safeFileStem(job) {
  return [
    safeSegment(job.courseId, "course ID"),
    safeSegment(job.provider, "provider"),
    safeSegment(job.assetType, "asset type"),
    String(job.jobId).split(":").at(-1) || "1",
  ].join("__");
}

function normalizedRelative(value, label) {
  const raw = String(value ?? "").trim().replaceAll("\\", "/");
  if (!raw || path.posix.isAbsolute(raw) || raw.split("/").some((part) => part === "..")) {
    throw new Error(`${label}:unsafe-relative-path`);
  }
  return raw;
}

function resolveInside(root, relativePath, label) {
  const normalized = normalizedRelative(relativePath, label);
  const absoluteRoot = path.resolve(root);
  const absolute = path.resolve(absoluteRoot, ...normalized.split("/"));
  if (absolute !== absoluteRoot && !absolute.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`${label}:path-escapes-asset-root`);
  }
  return absolute;
}

function expectedPaths(job) {
  const stem = safeFileStem(job);
  const courseId = safeSegment(job.courseId, "course ID");
  const provider = safeSegment(job.provider, "provider");
  const base = `media/${courseId}/${provider}`;
  return {
    receiptFile: `receipts/${courseId}/${stem}.json`,
    mediaFile: `${base}/${stem}.mp4`,
    captionFile: provider === "heygen" ? `${base}/${stem}.vtt` : null,
    transcriptFile: provider === "heygen" ? `${base}/${stem}-transcript.md` : null,
    rightsFile: `${base}/${stem}-rights.json`,
  };
}

function buildRegister(manifest, jobs) {
  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    sourceManifestSha256: manifest.manifestSha256,
    courseCount: new Set(jobs.map((job) => job.courseId)).size,
    jobCount: jobs.length,
    entries: jobs.map((job) => ({
      jobId: job.jobId,
      idempotencyKey: job.idempotencyKey,
      courseId: job.courseId,
      provider: job.provider,
      assetType: job.assetType,
      aspectRatio: job.aspectRatio,
      expectedDurationSeconds: job.durationSeconds,
      requiredQualityGates: job.qualityGates,
      ...expectedPaths(job),
    })),
  };
}

function receiptTemplate(entry) {
  return {
    schemaVersion: "1.0.0",
    jobId: entry.jobId,
    idempotencyKey: entry.idempotencyKey,
    courseId: entry.courseId,
    provider: entry.provider,
    assetType: entry.assetType,
    status: "generated",
    serviceAssetId: "REPLACE_WITH_PROVIDER_ASSET_ID",
    mediaFile: entry.mediaFile,
    mediaSha256: "REPLACE_WITH_64_CHARACTER_SHA256",
    captionFile: entry.captionFile,
    captionSha256: entry.captionFile ? "REPLACE_WITH_64_CHARACTER_SHA256" : null,
    transcriptFile: entry.transcriptFile,
    transcriptSha256: entry.transcriptFile ? "REPLACE_WITH_64_CHARACTER_SHA256" : null,
    rightsFile: entry.rightsFile,
    rightsSha256: "REPLACE_WITH_64_CHARACTER_SHA256",
    durationSeconds: entry.expectedDurationSeconds,
    width: entry.aspectRatio === "9:16" ? 1080 : 1920,
    height: entry.aspectRatio === "9:16" ? 1920 : entry.aspectRatio === "4:5" ? 1350 : 1080,
    qualityGates: entry.requiredQualityGates.map((id) => ({
      id,
      passed: false,
      reviewedAt: null,
      notes: "",
    })),
    syntheticMediaDisclosure:
      "This video uses the authorized digital likeness or synthetic media tools approved by OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC.",
    ownerApproval: {
      approved: false,
      approvedBy: "Dr. Jody Blanchard",
      approvedAt: null,
      notes: "",
    },
    generatedAt: null,
    downloadedAt: null,
  };
}

function findFfprobe() {
  const candidates = [process.env.FFPROBE_PATH, "ffprobe"].filter(Boolean);
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-version"], { encoding: "utf8" });
    if (result.status === 0) return candidate;
  }
  return null;
}

function inspectMedia(ffprobe, filePath) {
  const result = spawnSync(
    ffprobe,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-show_entries",
      "stream=codec_type,width,height,sample_rate",
      "-of",
      "json",
      filePath,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    throw new Error(`ffprobe-failed:${String(result.stderr || result.stdout).trim().slice(0, 300)}`);
  }
  const payload = JSON.parse(result.stdout);
  const video = (payload.streams || []).find((stream) => stream.codec_type === "video");
  const audio = (payload.streams || []).find((stream) => stream.codec_type === "audio");
  return {
    durationSeconds: Number(payload.format?.duration || 0),
    width: Number(video?.width || 0),
    height: Number(video?.height || 0),
    audioSampleRate: Number(audio?.sample_rate || 0),
    videoPresent: Boolean(video),
    audioPresent: Boolean(audio),
  };
}

function validateTimestamp(value, label, findings) {
  const timestamp = Date.parse(String(value ?? ""));
  if (!Number.isFinite(timestamp)) findings.push(`${label}:invalid-timestamp`);
}

function validateFile({ assetsRoot, relativePath, expectedSha, label, findings }) {
  let absolute;
  try {
    absolute = resolveInside(assetsRoot, relativePath, label);
  } catch (error) {
    findings.push(error.message);
    return null;
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    findings.push(`${label}:missing-file`);
    return null;
  }
  if (!SHA_PATTERN.test(String(expectedSha ?? ""))) {
    findings.push(`${label}:invalid-sha256`);
    return absolute;
  }
  const actual = sha256File(absolute);
  if (actual !== expectedSha) findings.push(`${label}:sha256-mismatch`);
  return absolute;
}

function validateResolution(entry, receipt, observed, findings) {
  const width = observed?.width || Number(receipt.width || 0);
  const height = observed?.height || Number(receipt.height || 0);
  if (entry.aspectRatio === "9:16" && (width < 1080 || height < 1920)) {
    findings.push("media:resolution-below-1080x1920");
  } else if (entry.aspectRatio === "4:5" && (width < 1080 || height < 1350)) {
    findings.push("media:resolution-below-1080x1350");
  } else if (entry.aspectRatio === "16:9" && (width < 1920 || height < 1080)) {
    findings.push("media:resolution-below-1920x1080");
  }
}

function validateReceipt(entry, receipt, assetsRoot, ffprobe, requireFfprobe) {
  const findings = [];
  const same = ["jobId", "idempotencyKey", "courseId", "provider", "assetType"];
  for (const field of same) {
    if (receipt?.[field] !== entry[field]) findings.push(`${field}:does-not-match-register`);
  }
  if (receipt?.schemaVersion !== "1.0.0") findings.push("schema-version:unsupported");
  if (receipt?.status !== "accepted") findings.push("status:not-accepted");
  if (!String(receipt?.serviceAssetId || "").trim()) findings.push("service-asset-id:missing");
  if (!String(receipt?.syntheticMediaDisclosure || "").trim()) {
    findings.push("synthetic-media-disclosure:missing");
  }
  if (receipt?.ownerApproval?.approved !== true) findings.push("owner-approval:not-approved");
  if (!String(receipt?.ownerApproval?.approvedBy || "").trim()) findings.push("owner-approval:approver-missing");
  validateTimestamp(receipt?.ownerApproval?.approvedAt, "owner-approval", findings);
  validateTimestamp(receipt?.generatedAt, "generated-at", findings);
  validateTimestamp(receipt?.downloadedAt, "downloaded-at", findings);

  const gates = new Map(
    Array.isArray(receipt?.qualityGates)
      ? receipt.qualityGates.map((gate) => [String(gate?.id || ""), gate])
      : [],
  );
  for (const gateId of entry.requiredQualityGates) {
    const gate = gates.get(gateId);
    if (!gate) findings.push(`quality-gate:${gateId}:missing`);
    else {
      if (gate.passed !== true) findings.push(`quality-gate:${gateId}:failed`);
      validateTimestamp(gate.reviewedAt, `quality-gate:${gateId}`, findings);
    }
  }

  const mediaFile = validateFile({
    assetsRoot,
    relativePath: receipt?.mediaFile,
    expectedSha: receipt?.mediaSha256,
    label: "media",
    findings,
  });
  validateFile({
    assetsRoot,
    relativePath: receipt?.rightsFile,
    expectedSha: receipt?.rightsSha256,
    label: "rights",
    findings,
  });
  if (entry.provider === "heygen") {
    validateFile({
      assetsRoot,
      relativePath: receipt?.captionFile,
      expectedSha: receipt?.captionSha256,
      label: "captions",
      findings,
    });
    validateFile({
      assetsRoot,
      relativePath: receipt?.transcriptFile,
      expectedSha: receipt?.transcriptSha256,
      label: "transcript",
      findings,
    });
  }

  let observed = null;
  if (mediaFile && ffprobe) {
    try {
      observed = inspectMedia(ffprobe, mediaFile);
      if (!observed.videoPresent) findings.push("media:video-stream-missing");
      if (!observed.audioPresent && entry.provider === "heygen") findings.push("media:audio-stream-missing");
      if (entry.provider === "heygen" && observed.audioSampleRate !== 48_000) {
        findings.push(`media:audio-sample-rate-${observed.audioSampleRate}-expected-48000`);
      }
      const expectedDuration = Number(entry.expectedDurationSeconds || 0);
      const allowedDifference = Math.max(3, expectedDuration * 0.25);
      if (Math.abs(observed.durationSeconds - expectedDuration) > allowedDifference) {
        findings.push("media:duration-outside-governed-tolerance");
      }
    } catch (error) {
      findings.push(`media:${error.message}`);
    }
  } else if (requireFfprobe) {
    findings.push("media:ffprobe-required-but-unavailable");
  }
  validateResolution(entry, receipt, observed, findings);

  return {
    jobId: entry.jobId,
    passed: findings.length === 0,
    findings,
    observed,
  };
}

const args = parseArgs(process.argv);
if (args.help) {
  printHelp();
  process.exit(0);
}
if (!new Set(["prepare", "validate"]).has(args.mode)) {
  fail("--mode must be prepare or validate.");
}
if (args.course && !COURSE_ID_PATTERN.test(args.course)) fail("Invalid --course identifier.");

const manifestPath = path.resolve(args.manifest || DEFAULT_MANIFEST);
const assetsRoot = path.resolve(args.assets || DEFAULT_ASSETS);
const outputRoot = path.resolve(args.output || DEFAULT_OUTPUT);
if (!fs.existsSync(manifestPath)) fail(`Media job manifest not found: ${manifestPath}`);
const manifest = readJson(manifestPath, "media job manifest");
if (!Array.isArray(manifest.jobs) || !manifest.jobs.length) fail("Media job manifest contains no jobs.");
let jobs = manifest.jobs;
if (args.course) jobs = jobs.filter((job) => job.courseId === args.course);
if (!jobs.length) fail("No matching media jobs were found.");

const register = buildRegister(manifest, jobs);
const registerPath = path.join(outputRoot, "academy-media-intake-register.json");

if (args.mode === "prepare") {
  writeJson(registerPath, register);
  for (const entry of register.entries) {
    writeJson(path.join(assetsRoot, entry.receiptFile), receiptTemplate(entry));
  }
  writeJson(path.join(outputRoot, "academy-media-intake-preparation.json"), {
    passed: true,
    generatedAt: new Date().toISOString(),
    sourceManifest: manifestPath,
    assetsRoot,
    registerPath,
    courseCount: register.courseCount,
    jobCount: register.jobCount,
    nextRequiredAction:
      "Generate and download provider assets, complete every receipt, then run validate with --require-ffprobe.",
  });
  console.log(
    `[academy-media-intake] Prepared ${register.jobCount} receipt template(s) for ${register.courseCount} course(s).`,
  );
  process.exit(0);
}

if (!fs.existsSync(assetsRoot)) fail(`Asset root not found: ${assetsRoot}`);
const ffprobe = findFfprobe();
const results = register.entries.map((entry) => {
  const receiptPath = resolveInside(assetsRoot, entry.receiptFile, "receipt");
  if (!fs.existsSync(receiptPath)) {
    return { jobId: entry.jobId, passed: false, findings: ["receipt:missing-file"], observed: null };
  }
  const receipt = readJson(receiptPath, `receipt for ${entry.jobId}`);
  return validateReceipt(entry, receipt, assetsRoot, ffprobe, args.requireFfprobe);
});
const failed = results.filter((result) => !result.passed);
const validation = {
  passed: failed.length === 0,
  validatedAt: new Date().toISOString(),
  courseCount: register.courseCount,
  jobCount: register.jobCount,
  passedJobs: results.length - failed.length,
  failedJobs: failed.length,
  ffprobeAvailable: Boolean(ffprobe),
  ffprobeRequired: args.requireFfprobe,
  results,
};
writeJson(path.join(outputRoot, "academy-media-intake-validation.json"), validation);
if (failed.length) {
  fail(`${failed.length} of ${results.length} media receipt(s) failed validation.`);
}
console.log(
  `[academy-media-intake] Validated ${results.length} accepted media asset(s) with zero findings.`,
);
