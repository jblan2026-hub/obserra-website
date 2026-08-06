import { NextResponse } from "next/server";
import { verifyAcademyCertificate } from "../../../../../lib/academy-certificate-verification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get("certificateId") ?? "";

  if (!certificateId.trim()) {
    return NextResponse.json({ error: "certificateId is required" }, { status: 400 });
  }

  const result = await verifyAcademyCertificate(certificateId);
  return NextResponse.json(result, {
    status: result.valid ? 200 : result.reason === "invalid-format" ? 400 : 404,
    headers: { "Cache-Control": "no-store" },
  });
}
