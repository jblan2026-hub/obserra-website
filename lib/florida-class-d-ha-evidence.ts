import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

const SHA40 = /^[0-9a-f]{40}$/i;
const SHA256 = /^[0-9a-f]{64}$/i;
const MAX_EVIDENCE_AGE_DAYS = 90;
const MAX_RTO_MINUTES = 60;
const MAX_RPO_MINUTES = 15;

export const FLORIDA_CLASS_D_HA_EVIDENCE_SCHEMA = "obserra.fdacs.class-d.ha-evidence.v1";

export const FLORIDA_CLASS_D_HA_SUBSYSTEMS = [
  "edge_dns",
  "application_runtime",
  "identity",
  "database",
  "media",
  "document_storage",
  "commerce",
  "observability",
  "backup_restore",
  "failover",
] as const;

type FloridaClassDHaSubsystem = typeof FLORIDA_CLASS_D_HA_SUBSYSTEMS[number];

type FloridaClassDHaEvidenceEntry = {
  subsystem: FloridaClassDHaSubsystem;
  status: "verified";
  evidenceRef: string;
  evidenceSha256: string;
  observedAt: string;
};

type FloridaClassDHaEvidenceManifest = {
  schema: typeof FLORIDA_CLASS_D_HA_EVIDENCE_SCHEMA;
  releaseCandidateSha: string;
  evidencePackageId: string;
  reviewedAt: string;
  rtoMinutes: number;
  rpoMinutes: number;
  failoverTestAt: string;
  subsystems: FloridaClassDHaEvidenceEntry[];
};

export type FloridaClassDHaEvidenceReport = {
  ready: boolean;
  manifestDigestPresent: boolean;
  manifestDigestVerified: boolean;
  releaseCandidateBound: boolean;
  subsystemCoverageComplete: boolean;
  reviewCurrent: boolean;
  failoverCurrent: boolean;
  recoveryObjectivesWithinPolicy: boolean;
  blockers: string[];
  manifestSha256: string | null;
  evidencePackageId: string | null;
  secretsExposed: false;
};

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeDigestEqual(left: string, right: string) {
  if (!SHA256.test(left) || !SHA256.test(right)) return false;
  return timingSafeEqual(Buffer.from(left.toLowerCase(), "hex"), Buffer.from(right.toLowerCase(), "hex"));
}

function parseTimestamp(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function timestampCurrent(value: unknown, now: number) {
  const timestamp = parseTimestamp(value);
  if (timestamp === null) return false;
  const ageMs = now - timestamp;
  return ageMs >= 0 && ageMs <= MAX_EVIDENCE_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function validEvidenceReference(value: unknown) {
  return typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 500;
}

function validEvidenceEntry(value: unknown, now: number): value is FloridaClassDHaEvidenceEntry {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.subsystem === "string" &&
    (FLORIDA_CLASS_D_HA_SUBSYSTEMS as readonly string[]).includes(value.subsystem) &&
    value.status === "verified" &&
    validEvidenceReference(value.evidenceRef) &&
    typeof value.evidenceSha256 === "string" &&
    SHA256.test(value.evidenceSha256) &&
    timestampCurrent(value.observedAt, now)
  );
}

function parseManifest(raw: string): FloridaClassDHaEvidenceManifest | null {
  if (!raw || raw.length > 64_000) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return null;
    if (parsed.schema !== FLORIDA_CLASS_D_HA_EVIDENCE_SCHEMA) return null;
    if (typeof parsed.releaseCandidateSha !== "string" || !SHA40.test(parsed.releaseCandidateSha)) return null;
    if (typeof parsed.evidencePackageId !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(parsed.evidencePackageId)) return null;
    if (!Number.isInteger(parsed.rtoMinutes) || !Number.isInteger(parsed.rpoMinutes)) return null;
    if (!Array.isArray(parsed.subsystems)) return null;
    return parsed as unknown as FloridaClassDHaEvidenceManifest;
  } catch {
    return null;
  }
}

export function getFloridaClassDHaEvidenceReport(
  releaseCandidateSha = value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA"),
  now = Date.now(),
): FloridaClassDHaEvidenceReport {
  const rawManifest = value("OBSERRA_FDACS_HA_EVIDENCE_MANIFEST");
  const configuredDigest = value("OBSERRA_FDACS_HA_EVIDENCE_MANIFEST_SHA256").toLowerCase();
  const manifest = parseManifest(rawManifest);
  const blockers: string[] = [];

  if (!manifest) {
    blockers.push("ha_evidence_manifest_invalid");
    return {
      ready: false,
      manifestDigestPresent: SHA256.test(configuredDigest),
      manifestDigestVerified: false,
      releaseCandidateBound: false,
      subsystemCoverageComplete: false,
      reviewCurrent: false,
      failoverCurrent: false,
      recoveryObjectivesWithinPolicy: false,
      blockers,
      manifestSha256: null,
      evidencePackageId: null,
      secretsExposed: false,
    };
  }

  const calculatedDigest = sha256(canonicalJson(manifest));
  const manifestDigestPresent = SHA256.test(configuredDigest);
  const manifestDigestVerified = manifestDigestPresent && safeDigestEqual(calculatedDigest, configuredDigest);
  if (!manifestDigestVerified) blockers.push("ha_evidence_manifest_digest");

  const releaseCandidateBound =
    SHA40.test(releaseCandidateSha) &&
    manifest.releaseCandidateSha.toLowerCase() === releaseCandidateSha.toLowerCase();
  if (!releaseCandidateBound) blockers.push("ha_evidence_release_binding");

  const entriesValid = manifest.subsystems.every((entry) => validEvidenceEntry(entry, now));
  const subsystemNames = manifest.subsystems.map((entry) => entry.subsystem);
  const uniqueSubsystems = new Set(subsystemNames);
  const subsystemCoverageComplete =
    entriesValid &&
    manifest.subsystems.length === FLORIDA_CLASS_D_HA_SUBSYSTEMS.length &&
    uniqueSubsystems.size === FLORIDA_CLASS_D_HA_SUBSYSTEMS.length &&
    FLORIDA_CLASS_D_HA_SUBSYSTEMS.every((subsystem) => uniqueSubsystems.has(subsystem));
  if (!subsystemCoverageComplete) blockers.push("ha_evidence_subsystem_coverage");

  const reviewCurrent = timestampCurrent(manifest.reviewedAt, now);
  if (!reviewCurrent) blockers.push("ha_evidence_review_recency");

  const failoverCurrent = timestampCurrent(manifest.failoverTestAt, now);
  if (!failoverCurrent) blockers.push("ha_evidence_failover_recency");

  const recoveryObjectivesWithinPolicy =
    Number.isInteger(manifest.rtoMinutes) &&
    manifest.rtoMinutes > 0 &&
    manifest.rtoMinutes <= MAX_RTO_MINUTES &&
    Number.isInteger(manifest.rpoMinutes) &&
    manifest.rpoMinutes >= 0 &&
    manifest.rpoMinutes <= MAX_RPO_MINUTES;
  if (!recoveryObjectivesWithinPolicy) blockers.push("ha_evidence_recovery_objectives");

  return {
    ready: blockers.length === 0,
    manifestDigestPresent,
    manifestDigestVerified,
    releaseCandidateBound,
    subsystemCoverageComplete,
    reviewCurrent,
    failoverCurrent,
    recoveryObjectivesWithinPolicy,
    blockers,
    manifestSha256: calculatedDigest,
    evidencePackageId: manifest.evidencePackageId,
    secretsExposed: false,
  };
}
