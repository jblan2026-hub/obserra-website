import { NextResponse } from "next/server";
import {
  FloridaClassDMediaError,
  floridaClassDLiveMediaEnabled,
  getFloridaClassDObserverMediaAccess,
} from "../../../../../lib/florida-class-d-media";
import {
  exchangeFloridaClassDObserverToken,
  FloridaClassDObserverAccessError,
} from "../../../../../lib/florida-class-d-observer";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  accessToken?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDObserverAccessError || error instanceof FloridaClassDMediaError) {
    const status = error.status === 404 ? 401 : error.status;
    const safeMessage = status === 401 || status === 403
      ? "Observer access is invalid, expired, or no longer authorized."
      : error.message;
    return NextResponse.json({ error: safeMessage, code: error.code }, { status, headers });
  }
  console.error("Florida Class D observer media exchange failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to open the regulated observer classroom.", code: "FDACS_OBSERVER_MEDIA_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDLiveMediaEnabled()) {
      return NextResponse.json(
        { error: "Class D live observation is not yet enabled.", code: "FDACS_OBSERVER_MEDIA_NOT_ENABLED" },
        { status: 503, headers: { ...headers, "retry-after": "86400" } },
      );
    }
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.accessToken !== "string" || body.accessToken.length > 180) {
      return NextResponse.json({ error: "Observer access token is required.", code: "FDACS_OBSERVER_TOKEN_REQUIRED" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const grant = await exchangeFloridaClassDObserverToken(body.accessToken, correlationId);
    const media = await getFloridaClassDObserverMediaAccess({
      liveSessionId: grant.liveSessionId,
      grantId: grant.grantId,
      observerLabel: grant.observerLabel,
    });
    return NextResponse.json({
      ...media,
      observerLabel: grant.observerLabel,
      purpose: grant.purpose,
      correlationId,
    }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
