// Deployment sentinel for proxy.ts.
//
// The Vercel project currently evaluates an Ignored Build Step that recognizes
// changes under lib/ but does not recognize proxy.ts directly. CI verifies this
// Git blob identity against proxy.ts so a proxy change must update this file,
// ensuring the production deployment is not silently skipped.
//
// This SHA-1 value is a Git object identity used only as a deterministic change
// sentinel. It is not represented as cryptographic security evidence; CMMC/NIST
// evidence integrity remains bound by the repository's SHA-256 evidence records.
export const PROXY_RELEASE_FINGERPRINT = {
  schemaVersion: "1.0",
  sourcePath: "proxy.ts",
  gitBlobSha1: "1c567cf2335d159ffbf595106976f1238a83c814",
} as const;
