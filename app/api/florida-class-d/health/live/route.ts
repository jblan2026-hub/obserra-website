import { NextResponse } from "next/server";
import { getFloridaClassDPublicLiveness } from "../../../../../lib/florida-class-d-resilience";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export async function GET() {
  return NextResponse.json(getFloridaClassDPublicLiveness(), { status: 200, headers });
}
