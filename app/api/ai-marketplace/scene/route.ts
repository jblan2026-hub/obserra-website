import { NextResponse } from "next/server";
import { marketplaceV12Scene } from "../../../../lib/marketplace-v12-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const projection = marketplaceV12Scene({ q: params.get("q") ?? undefined, family: params.get("family") ?? undefined, type: params.get("type") ?? undefined, cursor: params.get("cursor") ?? undefined, limit: Number(params.get("limit") ?? 48) });
    return NextResponse.json(projection, { status: projection.error ? 400 : 200, headers: { "cache-control": "public, max-age=60" } });
  } catch {
    return NextResponse.json({ operational: false, reason: "catalog-unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
