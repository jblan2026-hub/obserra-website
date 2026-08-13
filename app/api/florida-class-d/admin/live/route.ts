import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import { listFloridaClassDLiveInteractions } from "../../../../../lib/florida-class-d-live-feed";
import {
  endFloridaClassDLiveSession,
  FloridaClassDLivePersistenceError,
  getFloridaClassDLiveRoster,
  issueFloridaClassDPresenceChallenge,
  postFloridaClassDLiveInteraction,
  restoreFloridaClassDPresence,
  scheduleFloridaClassDLiveSession,
  setFloridaClassDLiveSegment,
  startFloridaClassDLiveSession,
} from "../../../../../lib/florida-class-d-live-persistence";
import {
  certifyFloridaClassDLiveDay,
  getFloridaClassDRosterTimeLedgers,
} from "../../../../../lib/florida-class-d-live-reporting";
import {
  floridaClassDLiveInstructionEnabled,
  getFloridaClassDInstructorLicenseNumber,
  getFloridaClassDSchoolLicenseNumber,
} from "../../../../../lib/florida-class-d-live-policy";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  liveSessionId?: unknown;
  cohortId?: unknown;
  day?: unknown;
  lessonId?: unknown;
  enrollmentId?: unknown;
  segmentType?: unknown;
  challengeType?: unknown;
  prompt?: unknown;
  answer?: unknown;
  content?: unknown;
  parentInteractionId?: unknown;
  inspectionAccessReference?: unknown;
  reviewNote?: unknown;
  attendanceStatus?: unknown;
  idempotencyKey?: unknown;
  correlationId?: unknown;
};

function disabled() {
  return NextResponse.json(
    { error: "Florida Class D live instruction is not yet enabled.", code: "FDACS_LIVE_NOT_ENABLED" },
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
  console.error("Florida Class D live instructor API failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unable to process the regulated instructor request.", code: "FDACS_LIVE_ADMIN_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function GET(request: Request) {
  try {
    if (!floridaClassDLiveInstructionEnabled()) return disabled();
    await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const liveSessionId = new URL(request.url).searchParams.get("liveSessionId");
    if (!liveSessionId) {
      return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
    }
    const [roster, interactions] = await Promise.all([
      getFloridaClassDLiveRoster(liveSessionId),
      listFloridaClassDLiveInteractions(liveSessionId),
    ]);
    const day = typeof roster.session.day === "number" ? roster.session.day : 1;
    const enrollmentIds = roster.students
      .map((student) => typeof student.id === "string" ? student.id : null)
      .filter((id): id is string => Boolean(id));
    const ledgers = await getFloridaClassDRosterTimeLedgers(enrollmentIds, day);
    const students = roster.students.map((student) => {
      const enrollmentId = typeof student.id === "string" ? student.id : "";
      const ledger = ledgers.get(enrollmentId);
      return {
        ...student,
        dayTime: ledger?.dayTime ?? null,
        courseTime: ledger?.courseTime ?? null,
      };
    });
    return NextResponse.json({ ...roster, students, interactions }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!floridaClassDLiveInstructionEnabled()) return disabled();
    const actor = await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid instructor live-class request.", code: "FDACS_LIVE_ADMIN_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();
    const instructorLicenseNumber = getFloridaClassDInstructorLicenseNumber();
    const schoolLicenseNumber = getFloridaClassDSchoolLicenseNumber();
    if (!instructorLicenseNumber || !schoolLicenseNumber) return disabled();

    if (body.action === "schedule") {
      if (typeof body.cohortId !== "string" || !Number.isInteger(body.day) || typeof body.lessonId !== "string") {
        return NextResponse.json({ error: "Cohort, day, and lesson are required.", code: "FDACS_LIVE_SCHEDULE_INVALID" }, { status: 400, headers });
      }
      const session = await scheduleFloridaClassDLiveSession(actor, {
        cohortId: body.cohortId,
        day: body.day as 1 | 2 | 3 | 4 | 5,
        lessonId: body.lessonId,
        instructorLicenseNumber,
        schoolLicenseNumber,
        correlationId,
      });
      return NextResponse.json({ session, correlationId }, { status: 201, headers });
    }

    if (body.action === "start") {
      if (typeof body.liveSessionId !== "string") return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
      await startFloridaClassDLiveSession(actor, {
        liveSessionId: body.liveSessionId,
        instructorLicenseNumber,
        schoolLicenseNumber,
        inspectionAccessReference: typeof body.inspectionAccessReference === "string" ? body.inspectionAccessReference : null,
        correlationId,
      });
      return NextResponse.json({ started: true, correlationId }, { headers });
    }

    if (body.action === "segment") {
      if (typeof body.liveSessionId !== "string" || (body.segmentType !== "instruction" && body.segmentType !== "break")) {
        return NextResponse.json({ error: "Live session and segment type are required.", code: "FDACS_LIVE_SEGMENT_INVALID" }, { status: 400, headers });
      }
      await setFloridaClassDLiveSegment(actor, { liveSessionId: body.liveSessionId, segmentType: body.segmentType, correlationId });
      return NextResponse.json({ segmentType: body.segmentType, correlationId }, { headers });
    }

    if (body.action === "end") {
      if (typeof body.liveSessionId !== "string") return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
      await endFloridaClassDLiveSession(actor, { liveSessionId: body.liveSessionId, correlationId });
      return NextResponse.json({ ended: true, correlationId }, { headers });
    }

    if (body.action === "challenge") {
      if (
        typeof body.liveSessionId !== "string" ||
        typeof body.enrollmentId !== "string" ||
        !["presence_code", "lesson_check", "instructor_prompt"].includes(String(body.challengeType)) ||
        typeof body.prompt !== "string" ||
        typeof body.answer !== "string"
      ) {
        return NextResponse.json({ error: "Challenge fields are incomplete.", code: "FDACS_LIVE_CHALLENGE_INVALID" }, { status: 400, headers });
      }
      const challengeId = await issueFloridaClassDPresenceChallenge(actor, {
        liveSessionId: body.liveSessionId,
        enrollmentId: body.enrollmentId,
        challengeType: body.challengeType as "presence_code" | "lesson_check" | "instructor_prompt",
        prompt: body.prompt,
        answer: body.answer,
        correlationId,
      });
      return NextResponse.json({ challengeId, correlationId }, { status: 201, headers });
    }

    if (body.action === "restore_presence") {
      if (typeof body.liveSessionId !== "string" || typeof body.enrollmentId !== "string" || typeof body.reviewNote !== "string") {
        return NextResponse.json({ error: "Presence review fields are incomplete.", code: "FDACS_LIVE_PRESENCE_REVIEW_INVALID" }, { status: 400, headers });
      }
      await restoreFloridaClassDPresence(actor, {
        liveSessionId: body.liveSessionId,
        enrollmentId: body.enrollmentId,
        reviewNote: body.reviewNote,
        correlationId,
      });
      return NextResponse.json({ restored: true, correlationId }, { headers });
    }

    if (body.action === "certify_day") {
      const allowedStatuses = ["present", "partial", "absent", "makeup_required"];
      if (
        typeof body.enrollmentId !== "string" ||
        !Number.isInteger(body.day) ||
        typeof body.attendanceStatus !== "string" ||
        !allowedStatuses.includes(body.attendanceStatus) ||
        typeof body.idempotencyKey !== "string"
      ) {
        return NextResponse.json({ error: "Daily attendance certification fields are incomplete.", code: "FDACS_LIVE_ATTENDANCE_CERTIFICATION_INVALID" }, { status: 400, headers });
      }
      const result = await certifyFloridaClassDLiveDay(actor, {
        enrollmentId: body.enrollmentId,
        day: body.day as 1 | 2 | 3 | 4 | 5,
        status: body.attendanceStatus as "present" | "partial" | "absent" | "makeup_required",
        idempotencyKey: body.idempotencyKey,
        correlationId,
      });
      return NextResponse.json({ result, correlationId }, { status: 201, headers });
    }

    if (["answer", "prompt", "poll"].includes(body.action)) {
      if (typeof body.liveSessionId !== "string") return NextResponse.json({ error: "Live session id is required.", code: "FDACS_LIVE_SESSION_REQUIRED" }, { status: 400, headers });
      const interactionType = body.action === "answer" ? "instructor_answer" : "instructor_prompt";
      const interaction = await postFloridaClassDLiveInteraction({
        liveSessionId: body.liveSessionId,
        actorRole: "instructor",
        actorUserId: actor.userId,
        interactionType,
        enrollmentId: typeof body.enrollmentId === "string" ? body.enrollmentId : null,
        content: typeof body.content === "string" ? body.content : null,
        parentInteractionId: typeof body.parentInteractionId === "string" ? body.parentInteractionId : null,
        correlationId,
      });
      return NextResponse.json({ interaction, correlationId }, { status: 201, headers });
    }

    return NextResponse.json({ error: "Unsupported instructor action.", code: "FDACS_LIVE_ADMIN_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
