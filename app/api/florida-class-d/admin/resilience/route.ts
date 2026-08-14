import { NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { getFloridaClassDResilienceSnapshot } from "../../../../../lib/florida-class-d-resilience";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "pragma": "no-cache",
  "expires": "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "content-security-policy": "frame-ancestors 'none'",
};

export async function GET() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  return NextResponse.json(getFloridaClassDResilienceSnapshot(), { status: 200, headers });
}
