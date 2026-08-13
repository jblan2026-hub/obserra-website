import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../lib/florida-class-d-auth";
import {
  acquireFloridaClassDDeviceLease,
  FloridaClassDLivePersistenceError,
  getFloridaClassDLiveStudentState,
  postFloridaClassDLiveInteraction,
  recordFloridaClassDLiveHeartbeat,
  releaseFloridaClassDDeviceLease,
  respondFloridaClassDPresenceChallenge,
} from "../../../../lib/florida-class-d-live-persistence";
import { floridaClassDLiveInstructionEnabled } from "../../../../lib/florida-class-d-live-policy";
import { floridaClassDLiveMediaEnabled } from "../../../../lib/florida-class-d-media";
import { getFloridaClassDStudentTimeLedger } from "../../../../lib/florida-class-d-live-reporting";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type RequestBody = {
  action?: unknown;
  liveSessionId?: unknown;
  browserInstanceId?: unknown;
  deviceLeaseId?: unknown;
  challengeId?: unknown;
  answer?: unknown;
  content?: unknown;
  parentInteractionId?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    {
      error: "Florida Class D live instruction is not yet enabled.",
      code: "FDACS_LIVE_NOT_ENABLED",
    },
    { status: 503, headers: { ...headers, "retry-after": "86400" } },
  );
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDLivePersistenceError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_LIVE_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D live student API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process the regulated live-class request.", code: "FDACS_LIVE_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function GET(request: Request) {
  try {
    if (!floridaClassDLiveInstructionEnabled()) return disabled();
    const { userId } = await requireFloridaClassDSignedInUser();
    const liveSessionId = new URL(request.url).searchParams.get("liveSessionId");
    if (!liveSessionId) {
      return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
    }
    const [state, ledger] = await Promise.all([
      getFloridaClassDLiveStudentState(userId, liveSessionId),
      getFloridaClassDStudentTimeLedger(userId, liveSessionId),
    ]);
    return NextResponse.json({ ...state, dayTime: ledger.dayTime, courseTime: ledger.courseTime }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDLiveInstructionEnabled()) return disabled();
    const { userId, sessionId } = await requireFloridaClassDSignedInUser();
    const body = await request.json().catch(() => null) as RequestBody | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid live-class request.", code: "FDACS_LIVE_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "join") {
      if (!floridaClassDLiveMediaEnabled()) {
        return NextResponse.json(
          { error: "Secure live video is not yet enabled.", code: "FDACS_MEDIA_NOT_ENABLED" },
          { status: 503, headers: { ...headers, "retry-after": "86400" } },
        );
      }
      if (!sessionId || typeof body.liveSessionId !== "string" || typeof body.browserInstanceId !== "string") {
        return NextResponse.json({ error: "Authenticated session and device identity are required.", code: "FDACS_LIVE_JOIN_INVALID" }, { status: 400, headers });
      }
      const deviceLeaseId = await acquireFloridaClassDDeviceLease(userId, {
        liveSessionId: body.liveSessionId,
        clerkSessionId: sessionId,
        browserInstanceId: body.browserInstanceId,
        correlationId,
      });
      return NextResponse.json({ deviceLeaseId, correlationId, singleDeviceLease: true, secureMediaRequired: true }, { status: 201, headers });
    }

    if (body.action === "heartbeat") {
      if (typeof body.deviceLeaseId !== "string") {
        return NextResponse.json({ error: "Device lease is required.", code: "FDACS_LIVE_LEASE_REQUIRED" }, { status: 400, headers });
      }
      const presence = await recordFloridaClassDLiveHeartbeat(userId, { deviceLeaseId: body.deviceLeaseId, correlationId });
      return NextResponse.json({ presence, correlationId }, { headers });
    }

    if (body.action === "leave") {
      if (typeof body.deviceLeaseId !== "string") {
        return NextResponse.json({ error: "Device lease is required.", code: "FDACS_LIVE_LEASE_REQUIRED" }, { status: 400, headers });
      }
      await releaseFloridaClassDDeviceLease(userId, body.deviceLeaseId);
      return NextResponse.json({ released: true, correlationId }, { headers });
    }

    if (body.action === "challenge") {
      if (typeof body.challengeId !== "string" || typeof body.answer !== "string") {
        return NextResponse.json({ error: "Challenge id and answer are required.", code: "FDACS_LIVE_CHALLENGE_INVALID" }, { status: 400, headers });
      }
      const result = await respondFloridaClassDPresenceChallenge(userId, {
        challengeId: body.challengeId,
        answer: body.answer,
        correlationId,
      });
      return NextResponse.json({ result, correlationId }, { headers });
    }

    if (["question", "hand_raise", "response", "poll_response"].includes(body.action)) {
      if (typeof body.liveSessionId !== "string") {
        return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
      }
      const interactionType = body.action === "question"
        ? "student_question"
        : body.action === "hand_raise"
          ? "hand_raise"
          : body.action === "poll_response"
            ? "poll_response"
            : "student_response";
      const interaction = await postFloridaClassDLiveInteraction({
        liveSessionId: body.liveSessionId,
        actorRole: "student",
        actorUserId: userId,
        interactionType,
        content: typeof body.content === "string" ? body.content : null,
        parentInteractionId: typeof body.parentInteractionId === "string" ? body.parentInteractionId : null,
        correlationId,
      });
      return NextResponse.json({ interaction, correlationId }, { status: 201, headers });
    }

    return NextResponse.json({ error: "Unsupported live-class action.", code: "FDACS_LIVE_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
