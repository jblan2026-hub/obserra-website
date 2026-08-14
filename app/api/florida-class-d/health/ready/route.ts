import { NextResponse } from "next/server";
import { getFloridaClassDPublicReadiness } from "../../../../../lib/florida-class-d-resilience";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export async function GET() {
  const health = getFloridaClassDPublicReadiness();
  return NextResponse.json(health, {
    status: health.status === "ready" ? 200 : 503,
    headers: health.status === "ready" ? headers : { ...headers, "retry-after": "60" },
  });
}
