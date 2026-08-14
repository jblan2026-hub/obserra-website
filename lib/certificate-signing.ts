import "server-only";

import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

export const CERTIFICATE_SIGNATURE_ALGORITHM = "Ed25519" as const;
export const CERTIFICATE_SIGNER_NAME = "Dr. Jody Blanchard" as const;
export const CERTIFICATE_ISSUER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" as const;

export type LegacyCertificateClaim = {
  schemaVersion: "1.0";
  certificateId: string;
  courseId: string;
  completedAt: string;
  assessmentScore: number;
  signerName: typeof CERTIFICATE_SIGNER_NAME;
  issuer: typeof CERTIFICATE_ISSUER;
};

export type CertificateClaim = {
  schemaVersion: "1.1";
  certificateId: string;
  courseId: string;
  courseTitle: string;
  courseVersion: string;
  completedAt: string;
  assessmentScore: number;
  signerName: typeof CERTIFICATE_SIGNER_NAME;
  issuer: typeof CERTIFICATE_ISSUER;
};

export type SignedCertificateClaim = (LegacyCertificateClaim | CertificateClaim) & {
  signatureAlgorithm: typeof CERTIFICATE_SIGNATURE_ALGORITHM;
  signature: string;
  publicKeyFingerprint: string;
};

function normalizePem(value: string | undefined, variableName: string) {
  const normalized = value?.trim().replaceAll("\\n", "\n");
  if (!normalized) throw new Error(`${variableName} is required for certificate signing`);
  return normalized;
}

function canonicalClaim(claim: LegacyCertificateClaim | CertificateClaim) {
  if (claim.schemaVersion === "1.0") {
    return JSON.stringify({
      schemaVersion: claim.schemaVersion,
      certificateId: claim.certificateId,
      courseId: claim.courseId,
      completedAt: claim.completedAt,
      assessmentScore: claim.assessmentScore,
      signerName: claim.signerName,
      issuer: claim.issuer,
    });
  }
  return JSON.stringify({
    schemaVersion: claim.schemaVersion,
    certificateId: claim.certificateId,
    courseId: claim.courseId,
    courseTitle: claim.courseTitle,
    courseVersion: claim.courseVersion,
    completedAt: claim.completedAt,
    assessmentScore: claim.assessmentScore,
    signerName: claim.signerName,
    issuer: claim.issuer,
  });
}

function configuredPrivateKey() {
  return createPrivateKey(normalizePem(process.env.OBSERRA_CERTIFICATE_SIGNING_PRIVATE_KEY, "OBSERRA_CERTIFICATE_SIGNING_PRIVATE_KEY"));
}

function configuredPublicKey() {
  const configured = process.env.OBSERRA_CERTIFICATE_SIGNING_PUBLIC_KEY?.trim().replaceAll("\\n", "\n");
  if (configured) return createPublicKey(configured);
  return createPublicKey(configuredPrivateKey());
}

function publicKeyFingerprint() {
  const der = configuredPublicKey().export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex");
}

export function certificateSigningReady() {
  try {
    configuredPrivateKey();
    configuredPublicKey();
    return true;
  } catch {
    return false;
  }
}

export function signCertificateClaim(input: Omit<CertificateClaim, "schemaVersion" | "signerName" | "issuer">): SignedCertificateClaim {
  const claim: CertificateClaim = {
    schemaVersion: "1.1",
    certificateId: input.certificateId,
    courseId: input.courseId,
    courseTitle: input.courseTitle,
    courseVersion: input.courseVersion,
    completedAt: input.completedAt,
    assessmentScore: input.assessmentScore,
    signerName: CERTIFICATE_SIGNER_NAME,
    issuer: CERTIFICATE_ISSUER,
  };
  const signature = sign(null, Buffer.from(canonicalClaim(claim), "utf8"), configuredPrivateKey()).toString("base64url");
  return {
    ...claim,
    signatureAlgorithm: CERTIFICATE_SIGNATURE_ALGORITHM,
    signature,
    publicKeyFingerprint: publicKeyFingerprint(),
  };
}

export function verifyCertificateClaim(claim: SignedCertificateClaim) {
  if (claim.schemaVersion !== "1.0" && claim.schemaVersion !== "1.1") return false;
  if (claim.signatureAlgorithm !== CERTIFICATE_SIGNATURE_ALGORITHM) return false;
  if (claim.signerName !== CERTIFICATE_SIGNER_NAME || claim.issuer !== CERTIFICATE_ISSUER) return false;
  if (claim.publicKeyFingerprint !== publicKeyFingerprint()) return false;
  if (claim.schemaVersion === "1.1" && (!claim.courseTitle?.trim() || !/^\d+\.\d+\.\d+$/.test(claim.courseVersion))) return false;
  return verify(
    null,
    Buffer.from(canonicalClaim(claim), "utf8"),
    configuredPublicKey(),
    Buffer.from(claim.signature, "base64url"),
  );
}
