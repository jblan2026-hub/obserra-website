import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDMakeupError } from "../../../../../lib/florida-class-d-makeup";
import {
  floridaClassDRecordedMakeupEnabled,
  resolveFloridaClassDRecordedMedia,
} from "../../../../../lib/florida-class-d-recorded-makeup";

const secureHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-disposition": "inline",
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDMakeupError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_RECORDED_MEDIA_AUTHORIZATION_FAILED" },
      { status: error.status, headers: secureHeaders },
    );
  }
  console.error("Florida Class D recorded media proxy failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to deliver protected recorded make-up media.", code: "FDACS_RECORDED_MEDIA_DELIVERY_FAILED" },
    { status: 502, headers: secureHeaders },
  );
}

export async function GET(request: Request) {
  try {
    if (!floridaClassDRecordedMakeupEnabled()) {
      return NextResponse.json(
        { error: "Florida Class D recorded make-up delivery is not yet enabled.", code: "FDACS_RECORDED_MAKEUP_NOT_ENABLED" },
        { status: 503, headers: { ...secureHeaders, "retry-after": "86400" } },
      );
    }

    const { userId } = await requireFloridaClassDSignedInUser();
    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");
    const playbackSessionId = url.searchParams.get("playbackSessionId");
    if (!assignmentId || !playbackSessionId) {
      return NextResponse.json(
        { error: "Recorded make-up media identifiers are required.", code: "FDACS_RECORDED_MEDIA_INVALID_REQUEST" },
        { status: 400, headers: secureHeaders },
      );
    }

    const upstreamUrl = await resolveFloridaClassDRecordedMedia(userId, assignmentId, playbackSessionId);
    const range = request.headers.get("range");
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      headers: range ? { range } : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("Florida Class D recorded media origin failed", upstream.status);
      return NextResponse.json(
        { error: "Protected recorded make-up media is temporarily unavailable.", code: "FDACS_RECORDED_MEDIA_ORIGIN_FAILED" },
        { status: 502, headers: secureHeaders },
      );
    }

    const headers = new Headers(secureHeaders);
    const passThroughHeaders = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];
    for (const name of passThroughHeaders) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");

    return new Response(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
