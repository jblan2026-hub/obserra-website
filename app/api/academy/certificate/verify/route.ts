import { NextResponse } from "next/server";
import { findVerifiedCertificate } from "../../../../../lib/academy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const certificateId = new URL(request.url).searchParams.get("certificateId")?.trim() ?? "";
  if (!certificateId || certificateId.length > 180) {
    return NextResponse.json(
      { valid: false, error: "A valid certificate ID is required" },
      { status: 400, headers: { "cache-control": "private, no-store, max-age=0" } },
    );
  }

  const certificate = await findVerifiedCertificate(certificateId);
  if (!certificate) {
    return NextResponse.json(
      { valid: false, certificateId },
      { status: 404, headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  }

  return NextResponse.json(certificate, {
    headers: {
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-obserra-certificate-signature": certificate.signatureAlgorithm,
      "x-obserra-certificate-verification": "valid",
    },
  });
}
