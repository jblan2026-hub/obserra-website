import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const watchPath = path.join(root, "docs/compliance/CMMC-AUTHORITY-WATCH.json");
const LEGAL_OWNER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const live = process.argv.includes("--live");
const configOnly = process.argv.includes("--check-config");
const reportIndex = process.argv.indexOf("--report");
const reportPath = reportIndex >= 0 ? process.argv[reportIndex + 1] : null;

if (live === configOnly) fail("use exactly one of --check-config or --live");
if (live && !reportPath) fail("--live requires --report <path>");

function fail(message) {
  console.error(`CMMC authority-drift gate failed: ${message}`);
  process.exit(1);
}

function read(file, label) {
  if (!fs.existsSync(file)) fail(`${label} is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file);
}

function json(file, label) {
  try {
    return JSON.parse(read(file, label).toString("utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function unique(values) {
  return new Set(values).size === values.length;
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

function validateConfiguration(watch, authority) {
  if (watch.schemaVersion !== "1.0") fail("watch schemaVersion must be 1.0");
  if (watch.legalOwner !== LEGAL_OWNER || authority.legalOwner !== LEGAL_OWNER) fail(`legal owner must be ${LEGAL_OWNER}`);
  if (authority.profileStatus !== "final" || authority.evidenceRule?.failClosed !== true) fail("authority profile must be final and fail closed");
  if (watch.policy?.silentBaselineUpdatesAllowed !== false || watch.policy?.driftDisposition !== "fail_closed_pending_review") {
    fail("authority drift must fail closed and must never silently update baselines");
  }
  if (!Array.isArray(watch.checks) || watch.checks.length < 8) fail("authority watch must include pinned integrity and revision detection checks");
  const checkIds = watch.checks.map((check) => check.checkId);
  if (!unique(checkIds)) fail("authority watch check IDs must be unique");
  const authorityById = new Map(authority.authorities.map((item) => [item.authorityId, item]));
  for (const check of watch.checks) {
    if (!/^[A-Z0-9-]{5,80}$/.test(check.checkId ?? "")) fail(`invalid authority check ID ${check.checkId}`);
    if (!authorityById.has(check.authorityId)) fail(`${check.checkId} references unknown authority ${check.authorityId}`);
    if (typeof check.url !== "string" || !check.url.startsWith("https://")) fail(`${check.checkId} must use an HTTPS official source`);
    if (check.checkType === "pinned_sha256") {
      if (!/^[0-9a-f]{64}$/.test(check.expectedSha256 ?? "")) fail(`${check.checkId} has an invalid expected SHA-256`);
      if (check.expectedSha256 !== authorityById.get(check.authorityId).artifactSha256) fail(`${check.checkId} digest does not match the authority profile`);
    } else if (check.checkType === "ecfr_part_versions") {
      if (check.expectedPart !== "170" || !Number.isInteger(check.expectedVersionCount) || !/^\d{4}-\d{2}-\d{2}$/.test(check.expectedLatestDate ?? "")) {
        fail(`${check.checkId} eCFR expectations are invalid`);
      }
    } else if (check.checkType === "revision_tokens") {
      if (typeof check.pattern !== "string" || !Array.isArray(check.expectedRevisions) || !check.expectedRevisions.length || !unique(check.expectedRevisions)) {
        fail(`${check.checkId} revision-token expectations are invalid`);
      }
      try {
        new RegExp(check.pattern, "gi");
      } catch (error) {
        fail(`${check.checkId} has an invalid regex: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      fail(`${check.checkId} has unsupported checkType ${check.checkType}`);
    }
  }
  const pinnedIds = new Set(watch.checks.filter((check) => check.checkType === "pinned_sha256").map((check) => check.authorityId));
  for (const item of authority.authorities) if (!pinnedIds.has(item.authorityId)) fail(`authority ${item.authorityId} lacks a pinned artifact-integrity check`);
}

const REQUEST_PROFILES = [
  {
    id: "identified_monitor",
    headers: {
      "User-Agent": "OBSERRA-CMMC-Authority-Monitor/1.0 (+https://obserrallc.com)",
      Accept: "application/pdf, application/xml, application/json, text/html;q=0.9, */*;q=0.8",
    },
  },
  {
    id: "browser_compatible_same_source",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      Accept: "application/pdf, application/xml, application/json, text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  },
];

function requestHeaders(profile, url) {
  const headers = { ...profile.headers };
  if (profile.id === "browser_compatible_same_source" && new URL(url).hostname.toLowerCase().endsWith("dodcio.defense.gov")) {
    headers.Referer = "https://dodcio.defense.gov/CMMC/Resources-Documentation/";
  }
  return headers;
}

function fetchFailure(message, attempts) {
  const error = new Error(message);
  error.attempts = attempts;
  return error;
}

async function fetchOfficial(url) {
  const attempts = [];
  for (const [index, profile] of REQUEST_PROFILES.entries()) {
    let response;
    try {
      response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(90_000),
        headers: requestHeaders(profile, url),
      });
    } catch (error) {
      attempts.push({ requestProfile: profile.id, requestedUrl: url, outcome: "network_error" });
      throw fetchFailure(error instanceof Error ? error.message : String(error), attempts);
    }

    attempts.push({
      requestProfile: profile.id,
      requestedUrl: url,
      outcome: response.ok ? "response_ok" : "http_error",
      httpStatus: response.status,
      finalUrl: response.url,
    });
    if (!response.ok) {
      const retryAllowed = (response.status === 403 || response.status === 429) && index < REQUEST_PROFILES.length - 1;
      if (retryAllowed) {
        await response.body?.cancel();
        continue;
      }
      const attemptSummary = attempts.map((attempt) => `${attempt.requestProfile}:${attempt.httpStatus ?? attempt.outcome}`).join(", ");
      throw fetchFailure(`official source request failed (${attemptSummary})`, attempts);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 64 * 1024 * 1024) {
      throw fetchFailure(`response size ${bytes.length} is outside the 1-byte to 64-MiB monitor boundary`, attempts);
    }
    return {
      bytes,
      finalUrl: response.url,
      contentType: response.headers.get("content-type") ?? "unknown",
      requestProfile: profile.id,
      requestAttempts: attempts,
    };
  }
  throw fetchFailure("official source request exhausted all same-source request profiles", attempts);
}

async function runCheck(check) {
  const base = { checkId: check.checkId, checkType: check.checkType, authorityId: check.authorityId, requestedUrl: check.url };
  let requestEvidence = { requestProfile: null, requestAttempts: [] };
  try {
    const fetched = await fetchOfficial(check.url);
    const observedSha256 = sha256(fetched.bytes);
    requestEvidence = { requestProfile: fetched.requestProfile, requestAttempts: fetched.requestAttempts };
    if (check.checkType === "pinned_sha256") {
      const passed = observedSha256 === check.expectedSha256;
      return {
        ...base,
        status: passed ? "passed" : "drift_detected",
        ...requestEvidence,
        finalUrl: fetched.finalUrl,
        contentType: fetched.contentType,
        observedBytes: fetched.bytes.length,
        observedSha256,
        expectedSha256: check.expectedSha256,
        detail: passed ? "Official artifact digest matches the pinned authority profile." : "Official artifact bytes no longer match the pinned authority profile.",
      };
    }
    if (check.checkType === "ecfr_part_versions") {
      const parsed = JSON.parse(fetched.bytes.toString("utf8"));
      const versions = (parsed.content_versions ?? []).filter((item) => String(item.part) === check.expectedPart);
      const dates = sortedUnique(versions.map((item) => item.date).filter(Boolean));
      const observedLatestDate = dates.at(-1) ?? null;
      const passed = versions.length === check.expectedVersionCount && observedLatestDate === check.expectedLatestDate;
      return {
        ...base,
        status: passed ? "passed" : "drift_detected",
        ...requestEvidence,
        finalUrl: fetched.finalUrl,
        contentType: fetched.contentType,
        observedBytes: fetched.bytes.length,
        observedSha256,
        expectedPart: check.expectedPart,
        expectedVersionCount: check.expectedVersionCount,
        observedVersionCount: versions.length,
        expectedLatestDate: check.expectedLatestDate,
        observedLatestDate,
        observedDates: dates,
        detail: passed ? "32 CFR Part 170 amendment inventory matches the approved authority snapshot." : "32 CFR Part 170 amendment inventory changed and requires reviewed authority reconciliation.",
      };
    }
    const text = fetched.bytes.toString("utf8");
    const regex = new RegExp(check.pattern, "gi");
    const observedRevisions = sortedUnique([...text.matchAll(regex)].map((match) => match[1]).filter(Boolean));
    const expectedRevisions = sortedUnique(check.expectedRevisions);
    const passed = JSON.stringify(observedRevisions) === JSON.stringify(expectedRevisions);
    return {
      ...base,
      status: passed ? "passed" : "drift_detected",
      ...requestEvidence,
      finalUrl: fetched.finalUrl,
      contentType: fetched.contentType,
      observedBytes: fetched.bytes.length,
      observedSha256,
      pattern: check.pattern,
      expectedRevisions,
      observedRevisions,
      detail: passed ? "Official revision tokens match the approved watch baseline." : "Official revision tokens changed and require reviewed authority reconciliation.",
    };
  } catch (error) {
    return {
      ...base,
      status: "error",
      requestProfile: requestEvidence.requestProfile,
      requestAttempts: Array.isArray(error?.attempts) ? error.attempts : requestEvidence.requestAttempts,
      detail: `Official source check could not complete: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

const watch = json(watchPath, "authority watch");
const authorityPath = path.join(root, watch.authorityProfilePath ?? "missing");
const authorityRaw = read(authorityPath, "authority profile");
const authority = json(authorityPath, "authority profile");
validateConfiguration(watch, authority);

if (configOnly) {
  console.log(`CMMC authority-watch configuration passed for ${watch.checks.length} official-source checks; silent baseline updates are prohibited.`);
  process.exit(0);
}

const checkedAt = process.env.CMMC_CHECKED_AT?.trim() || new Date().toISOString();
if (!Number.isFinite(Date.parse(checkedAt))) fail("CMMC_CHECKED_AT must be a valid date-time when supplied");
const results = await Promise.all(watch.checks.map(runCheck));
const overallStatus = results.every((result) => result.status === "passed") ? "passed" : "drift_or_error_detected";
const report = {
  schemaVersion: "1.0",
  reportId: `obserra-cmmc-authority-drift-${checkedAt.replace(/[^0-9]/g, "").slice(0, 14)}Z`,
  reportState: "final",
  legalOwner: LEGAL_OWNER,
  checkedAt,
  authorityProfile: {
    path: path.relative(root, authorityPath).replaceAll(path.sep, "/"),
    profileId: authority.profileId,
    sha256: sha256(authorityRaw),
  },
  watchDefinition: {
    path: path.relative(root, watchPath).replaceAll(path.sep, "/"),
    watchId: watch.watchId,
    sha256: sha256(read(watchPath, "authority watch")),
  },
  overallStatus,
  failClosed: true,
  silentBaselineUpdatesAllowed: false,
  disposition: overallStatus === "passed" ? "authority_snapshot_current" : "blocked_pending_review",
  checks: results,
  claimBoundary: "This report verifies official-source integrity and revision-watch signals at the recorded time. It does not interpret a changed publication, alter a governing baseline, or establish CMMC certification.",
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;
const fullReportPath = path.resolve(root, reportPath);
fs.mkdirSync(path.dirname(fullReportPath), { recursive: true });
fs.writeFileSync(fullReportPath, serialized, "utf8");
fs.writeFileSync(`${fullReportPath}.sha256`, `${sha256(serialized)}  ${path.basename(fullReportPath)}\n`, "utf8");
console.log(`CMMC authority drift report: ${overallStatus}; ${results.filter((result) => result.status === "passed").length}/${results.length} checks passed.`);
console.log(`Report SHA-256: ${sha256(serialized)}`);
if (overallStatus !== "passed") process.exit(1);
