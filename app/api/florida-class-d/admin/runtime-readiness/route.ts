import { NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { getFloridaClassDRuntimeReadiness } from "../../../../../lib/florida-class-d-runtime-readiness";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

export async function GET() {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    return NextResponse.json({ readiness: getFloridaClassDRuntimeReadiness() }, { status: 200, headers });
  } catch (error) {
    const status = error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;
    return NextResponse.json(
      { error: status === 500 ? "Unable to evaluate protected runtime readiness." : error instanceof Error ? error.message : "Access denied." },
      { status, headers },
    );
  }
}
