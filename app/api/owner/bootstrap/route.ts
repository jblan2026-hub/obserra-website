import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ACADEMY_OWNER_CONTROL_URL } from "../../../../lib/academy-control-contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_192;
const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "pragma": "no-cache",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: responseHeaders });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json(403, { error: "Owner bootstrap origin denied." });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { error: "Owner bootstrap requires application/json." });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength < 2 || contentLength > MAX_BODY_BYTES) {
    return json(413, { error: "Owner bootstrap request size is invalid." });
  }

  const proof = request.headers.get("x-obserra-bootstrap-code")?.trim() ?? "";
  if (proof.length < 32 || proof.length > 200 || /[\r\n]/.test(proof)) {
    return json(400, { error: "The owner proof is invalid." });
  }

  const session = await auth();
  if (!session.userId) {
    return json(401, { error: "Owner authentication is required." });
  }
  const token = await session.getToken();
  if (!token || token.length > 16_000 || /\s/.test(token)) {
    return json(401, { error: "The owner session could not be verified." });
  }

  const requestId = request.headers.get("x-obserra-request-id")?.slice(0, 100) || crypto.randomUUID();
  try {
    const response = await fetch(`${ACADEMY_OWNER_CONTROL_URL}/bootstrap`, {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-obserra-bootstrap-code": proof,
        "x-obserra-request-id": requestId,
      },
      body: JSON.stringify({ requestId }),
      signal: AbortSignal.timeout(12_000),
    });
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!response.ok || payload?.ownerBound !== true) {
      return json(response.status || 503, {
        error: typeof payload?.error === "string" ? payload.error : "The owner proof was not accepted.",
        code: typeof payload?.code === "string" ? payload.code : "OWNER_BOOTSTRAP_FAILED",
        requestId,
      });
    }

    return json(200, {
      ownerBound: true,
      claimedAt: typeof payload.claimedAt === "string" ? payload.claimedAt : null,
      requestId,
    });
  } catch (error) {
    console.error("Owner bootstrap service unavailable", error);
    return json(503, {
      error: "The owner bootstrap service is unavailable.",
      code: "OWNER_BOOTSTRAP_UNAVAILABLE",
      requestId,
    });
  }
}
