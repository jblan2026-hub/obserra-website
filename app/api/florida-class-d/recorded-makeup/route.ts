import { NextResponse } from "next/server";
import { requireFloridaClassDSignedInUser, FloridaClassDAuthorizationError } from "../../../../lib/florida-class-d-auth";
import { FloridaClassDMakeupError } from "../../../../lib/florida-class-d-makeup";
import {
  answerFloridaClassDRecordedMakeupChallenge,
  completeFloridaClassDRecordedMakeup,
  floridaClassDRecordedMakeupEnabled,
  heartbeatFloridaClassDRecordedMakeup,
  issueFloridaClassDRecordedMakeupChallenge,
  startFloridaClassDRecordedMakeup,
} from "../../../../lib/florida-class-d-recorded-makeup";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  assignmentId?: unknown;
  playbackSessionId?: unknown;
  browserInstanceId?: unknown;
  observedPositionSeconds?: unknown;
  pageVisible?: unknown;
  challengeId?: unknown;
  answer?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    { error: "Florida Class D recorded make-up delivery is not yet enabled.", code: "FDACS_RECORDED_MAKEUP_NOT_ENABLED" },
    { status: 503, headers: { ...headers, "retry-after": "86400" } },
  );
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDMakeupError) {
    return NextResponse.json({ error: error.message, code: "code" in error ? error.code : "FDACS_RECORDED_MAKEUP_AUTHORIZATION_FAILED" }, { status: error.status, headers });
  }
  console.error("Florida Class D recorded make-up API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json({ error: "Unable to process recorded make-up training.", code: "FDACS_RECORDED_MAKEUP_REQUEST_FAILED" }, { status: 500, headers });
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDRecordedMakeupEnabled()) return disabled();
    const { userId, sessionId } = await requireFloridaClassDSignedInUser();
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid recorded make-up request.", code: "FDACS_RECORDED_MAKEUP_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "start") {
      if (typeof body.assignmentId !== "string" || typeof body.browserInstanceId !== "string") {
        return NextResponse.json({ error: "Assignment and browser instance are required.", code: "FDACS_RECORDED_MAKEUP_START_INVALID" }, { status: 400, headers });
      }
      const result = await startFloridaClassDRecordedMakeup(userId, sessionId, { assignmentId: body.assignmentId, browserInstanceId: body.browserInstanceId, correlationId });
      return NextResponse.json({ ...result, correlationId }, { status: 201, headers });
    }

    if (body.action === "heartbeat") {
      if (typeof body.playbackSessionId !== "string" || typeof body.browserInstanceId !== "string" || !Number.isInteger(body.observedPositionSeconds) || typeof body.pageVisible !== "boolean") {
        return NextResponse.json({ error: "Playback heartbeat fields are incomplete.", code: "FDACS_RECORDED_MAKEUP_HEARTBEAT_INVALID" }, { status: 400, headers });
      }
      const result = await heartbeatFloridaClassDRecordedMakeup(userId, { playbackSessionId: body.playbackSessionId, browserInstanceId: body.browserInstanceId, observedPositionSeconds: body.observedPositionSeconds as number, pageVisible: body.pageVisible, correlationId });
      return NextResponse.json({ result, correlationId }, { headers });
    }

    if (body.action === "issue_challenge") {
      if (typeof body.playbackSessionId !== "string") {
        return NextResponse.json({ error: "Playback session is required.", code: "FDACS_RECORDED_MAKEUP_CHALLENGE_INVALID" }, { status: 400, headers });
      }
      const challenge = await issueFloridaClassDRecordedMakeupChallenge(userId, { playbackSessionId: body.playbackSessionId, correlationId });
      return NextResponse.json({ challenge, correlationId }, { headers });
    }

    if (body.action === "answer_challenge") {
      if (typeof body.playbackSessionId !== "string" || typeof body.challengeId !== "string" || typeof body.answer !== "string") {
        return NextResponse.json({ error: "Challenge response fields are incomplete.", code: "FDACS_RECORDED_MAKEUP_CHALLENGE_RESPONSE_INVALID" }, { status: 400, headers });
      }
      const result = await answerFloridaClassDRecordedMakeupChallenge(userId, { playbackSessionId: body.playbackSessionId, challengeId: body.challengeId, answer: body.answer, correlationId });
      return NextResponse.json({ result, correlationId }, { headers });
    }

    if (body.action === "complete") {
      if (typeof body.playbackSessionId !== "string") {
        return NextResponse.json({ error: "Playback session is required.", code: "FDACS_RECORDED_MAKEUP_COMPLETE_INVALID" }, { status: 400, headers });
      }
      const result = await completeFloridaClassDRecordedMakeup(userId, { playbackSessionId: body.playbackSessionId, correlationId });
      return NextResponse.json({ result, correlationId }, { headers });
    }

    return NextResponse.json({ error: "Unsupported recorded make-up action.", code: "FDACS_RECORDED_MAKEUP_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
