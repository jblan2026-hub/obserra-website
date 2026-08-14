#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SEVERITIES = ["critical", "high", "moderate", "low", "info"];

function asNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}

function normalizeCounts(report, label) {
  const raw = report?.metadata?.vulnerabilities;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${label} audit report is missing metadata.vulnerabilities`);
  }

  return Object.fromEntries(
    SEVERITIES.map((severity) => [
      severity,
      asNonNegativeInteger(raw[severity] ?? 0, `${label}.${severity}`),
    ]),
  );
}

function normalizeFixAvailable(value) {
  if (typeof value === "boolean") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    name: typeof value.name === "string" ? value.name : null,
    version: typeof value.version === "string" ? value.version : null,
    isSemVerMajor: Boolean(value.isSemVerMajor),
  };
}

function normalizeVulnerabilities(report) {
  const source = report?.vulnerabilities;
  if (source === undefined) return [];
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("Audit report vulnerabilities must be an object when present");
  }

  return Object.entries(source)
    .map(([packageName, entry]) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`Audit entry for ${packageName} must be an object`);
      }
      const severity = typeof entry.severity === "string" ? entry.severity.toLowerCase() : "unknown";
      return {
        name: packageName,
        severity,
        direct: Boolean(entry.isDirect),
        range: typeof entry.range === "string" ? entry.range : null,
        fixAvailable: normalizeFixAvailable(entry.fixAvailable),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function evaluateAuditReport(report, label) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw new Error(`${label} audit report must be a JSON object`);
  }
  if (report.error) {
    const code = typeof report.error.code === "string" ? report.error.code : "unknown";
    const summary = typeof report.error.summary === "string" ? report.error.summary : "npm audit failed";
    throw new Error(`${label} audit command error ${code}: ${summary}`);
  }

  const counts = normalizeCounts(report, label);
  const vulnerabilities = normalizeVulnerabilities(report);
  const blocked = counts.critical > 0 || counts.high > 0;

  return {
    label,
    counts,
    vulnerabilities,
    blocked,
  };
}

function readJson(path, label) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${label} audit report at ${path}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} audit report is not valid JSON: ${error.message}`);
  }
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) throw new Error(`Unexpected argument: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    values.set(key, value);
    index += 1;
  }

  const full = values.get("--full");
  const production = values.get("--production");
  const output = values.get("--output");
  if (!full || !production || !output) {
    throw new Error("Usage: verify-npm-audit.mjs --full <file> --production <file> --output <file>");
  }
  return { full, production, output };
}

export function evaluateAuditFiles({ full, production }) {
  const reports = {
    full: evaluateAuditReport(readJson(full, "full"), "full"),
    production: evaluateAuditReport(readJson(production, "production"), "production"),
  };
  return {
    schema: "obserra.website-dependency-audit.v1",
    policy: {
      blockedSeverities: ["critical", "high"],
      scopes: ["full", "production"],
    },
    reports,
    blocked: reports.full.blocked || reports.production.blocked,
  };
}

function printReport(result) {
  for (const report of Object.values(result.reports)) {
    const { counts } = report;
    console.log(
      `${report.label}: critical=${counts.critical} high=${counts.high} moderate=${counts.moderate} low=${counts.low} info=${counts.info}`,
    );
    for (const vulnerability of report.vulnerabilities) {
      console.log(
        `${report.label}: ${vulnerability.severity} ${vulnerability.name} direct=${vulnerability.direct} range=${vulnerability.range ?? "unknown"}`,
      );
    }
  }
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const result = evaluateAuditFiles(options);
  writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  printReport(result);
  if (result.blocked) {
    console.error("Dependency audit failed: a high or critical vulnerability is present.");
    return 1;
  }
  console.log("Dependency audit passed: no high or critical vulnerabilities are present.");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`Dependency audit failed closed: ${error.message}`);
    process.exitCode = 1;
  }
}
