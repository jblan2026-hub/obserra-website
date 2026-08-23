import { NextResponse } from "next/server";
import { marketplaceV12Facets } from "../../../../lib/marketplace-v12-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(marketplaceV12Facets(), { headers: { "cache-control": "public, max-age=60" } });
  } catch {
    return NextResponse.json({ operational: false, reason: "catalog-unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
