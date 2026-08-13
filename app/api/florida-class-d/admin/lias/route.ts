import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import {
  confirmFloridaClassDLiasCertificate,
  getFloridaClassDLiasInspectionPacket,
  listFloridaClassDLiasWorkflowEvents,
  listFloridaClassDLiasWorkflowQueue,
  markFloridaClassDLiasSubmitted,
  openFloridaClassDLiasException,
} from "../../../../../lib/florida-class-d-lias";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers });
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDExamError) return response({ error: error.message, code: error.code }, error.status);
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return response({ error: error.message }, (error as { status: number }).status);
  }
  return response({ error: "LIAS workflow administration failed." }, 500);
}

export async function GET(request: NextRequest) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollmentId = request.nextUrl.searchParams.get("enrollmentId");
    const queueId = request.nextUrl.searchParams.get("queueId");
    if (enrollmentId) return response({ inspectionPacket: await getFloridaClassDLiasInspectionPacket(enrollmentId) });
    if (queueId) return response({ events: await listFloridaClassDLiasWorkflowEvents(queueId) });
    return response({ queue: await listFloridaClassDLiasWorkflowQueue() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireFloridaClassDStaff(["compliance_admin"]);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body.action !== "string") return response({ error: "Invalid LIAS workflow request." }, 400);

    if (body.action === "mark_submitted") {
      const result = await markFloridaClassDLiasSubmitted(staff.userId, {
        queueId: String(body.queueId ?? ""),
        submissionReference: String(body.submissionReference ?? ""),
        correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      });
      return response({ result });
    }

    if (body.action === "confirm_certificate") {
      const result = await confirmFloridaClassDLiasCertificate(staff.userId, {
        queueId: String(body.queueId ?? ""),
        certificateReference: String(body.certificateReference ?? ""),
        correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      });
      return response({ result });
    }

    if (body.action === "open_exception") {
      const result = await openFloridaClassDLiasException(staff.userId, {
        queueId: String(body.queueId ?? ""),
        exceptionNote: String(body.exceptionNote ?? ""),
        correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      });
      return response({ result });
    }

    return response({ error: "Unsupported LIAS workflow action." }, 400);
  } catch (error) {
    return errorResponse(error);
  }
}
