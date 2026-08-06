import { NextResponse } from "next/server";

import { compileContinuousCompliance } from "../../../../../lib/continuous-compliance-compiler";
import { authorizeOwner } from "../../../../../lib/owner-authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await authorizeOwner();
  if (!owner.allowed) {
    return NextResponse.json(
      { error: owner.reason },
      {
        status: owner.reason === "authentication-required" ? 401 : owner.reason === "owner-policy-unconfigured" ? 503 : 403,
        headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" },
      },
    );
  }

  try {
    return NextResponse.json(compileContinuousCompliance(), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Obserra-Compliance-Compiler": "verified-evidence-only",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "compliance-compilation-unavailable" },
      { status: 503, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } },
    );
  }
}
