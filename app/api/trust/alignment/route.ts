import { NextResponse } from "next/server";
import {
  alignmentAuthorities,
  alignmentDisclaimer,
} from "../../../../lib/control-alignment";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(
    {
      schemaVersion: "1.0.0",
      publisher: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
      claimBoundary: alignmentDisclaimer,
      authorities: alignmentAuthorities.map((authority) => ({
        id: authority.id,
        shortName: authority.shortName,
        name: authority.name,
        kind: authority.kind,
        authority: authority.authority,
        sourceUrl: authority.sourceUrl,
        scope: authority.scope,
        domains: authority.domains,
        websiteUse: authority.websiteUse,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
