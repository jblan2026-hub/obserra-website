import assert from "node:assert/strict";
import test from "node:test";

import { evaluateAuditReport } from "../scripts/verify-npm-audit.mjs";

function report(counts = {}, vulnerabilities = {}) {
  return {
    auditReportVersion: 2,
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 0,
        ...counts,
      },
    },
  };
}

test("dependency audit accepts a graph without high or critical findings", () => {
  const result = evaluateAuditReport(report(), "production");
  assert.equal(result.blocked, false);
  assert.deepEqual(result.counts, {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    info: 0,
  });
  assert.deepEqual(result.vulnerabilities, []);
});

test("dependency audit blocks high findings in the complete graph", () => {
  const result = evaluateAuditReport(
    report(
      { high: 1, total: 1 },
      {
        vulnerable_package: {
          name: "vulnerable_package",
          severity: "high",
          isDirect: false,
          range: "<2.0.0",
          fixAvailable: { name: "vulnerable_package", version: "2.0.0", isSemVerMajor: true },
        },
      },
    ),
    "full",
  );
  assert.equal(result.blocked, true);
  assert.equal(result.vulnerabilities[0].name, "vulnerable_package");
  assert.equal(result.vulnerabilities[0].severity, "high");
});

test("dependency audit blocks critical production findings", () => {
  const result = evaluateAuditReport(report({ critical: 1, total: 1 }), "production");
  assert.equal(result.blocked, true);
});

test("dependency audit does not silently accept a command error", () => {
  assert.throws(
    () => evaluateAuditReport({ error: { code: "EAUDITENDPOINT", summary: "registry unavailable" } }, "full"),
    /EAUDITENDPOINT/,
  );
});

test("dependency audit fails closed when metadata is absent", () => {
  assert.throws(() => evaluateAuditReport({ vulnerabilities: {} }, "full"), /metadata\.vulnerabilities/);
});

test("dependency audit rejects malformed vulnerability counts", () => {
  assert.throws(() => evaluateAuditReport(report({ high: -1 }), "full"), /non-negative integer/);
});
