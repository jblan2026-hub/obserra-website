import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-obserra-health-contract": "website-liveness-v1",
};

export async function GET() {
  return NextResponse.json(
    {
      service: "obserra-website",
      status: "live",
      contract: "website-liveness-v1",
      checkedAt: new Date().toISOString(),
    },
    { status: 200, headers },
  );
}
