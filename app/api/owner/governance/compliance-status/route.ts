import { NextResponse } from "next/server";

import { compileComplianceSnapshot, complianceCompilerHealth } from "../../../../../lib/compliance-compiler";
import { authorizeOwner } from "../../../../../lib/owner-authorization";
import { requireStepUp } from "../../../../../lib/require-step-up";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: unknown, status = 200, digest?: string) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Obserra-Compliance-Compiler": "verified-evidence-only",
      ...(digest ? { ETag: `"${digest}"` } : {}),
    },
  });
}

async function authorize() {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return { response: stepUp.response } as const;
  const owner = await authorizeOwner();
  if (!owner.allowed || !owner.userId || owner.userId !== stepUp.userId) {
    return { response: response({ error: owner.reason }, owner.reason === "owner-policy-unconfigured" ? 503 : 403) } as const;
  }
  return { owner, stepUp } as const;
}

export async function GET(request: Request) {
  const authorization = await authorize();
  if ("response" in authorization) return authorization.response;
  try {
    const snapshot = await compileComplianceSnapshot({ persist: false });
    const requestDigest = request.headers.get("if-none-match")?.replaceAll('"', "");
    if (requestDigest && requestDigest === snapshot.digest) {
      return new NextResponse(null, { status: 304, headers: { "Cache-Control": "private, no-store, max-age=0", ETag: `"${snapshot.digest}"` } });
    }
    return response({ snapshot, health: complianceCompilerHealth() }, 200, snapshot.digest);
  } catch {
    return response({ error: "compliance-compilation-unavailable", health: complianceCompilerHealth() }, 503);
  }
}

export async function POST() {
  const authorization = await authorize();
  if ("response" in authorization) return authorization.response;
  try {
    const snapshot = await compileComplianceSnapshot({ persist: true });
    return response({ compiled: true, snapshot, health: complianceCompilerHealth() }, 201, snapshot.digest);
  } catch {
    return response({ error: "compliance-snapshot-persistence-unavailable", health: complianceCompilerHealth() }, 503);
  }
}
