import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import {
  approveFloridaClassDCompletion,
  getFloridaClassDCompletionReadiness,
  listFloridaClassDCompletionCandidates,
  listFloridaClassDLiasQueue,
} from "../../../../../lib/florida-class-d-completion";

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
  return response({ error: "Completion administration failed." }, 500);
}

export async function GET(request: NextRequest) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollmentId = request.nextUrl.searchParams.get("enrollmentId");
    if (enrollmentId) {
      return response({ readiness: await getFloridaClassDCompletionReadiness(enrollmentId) });
    }
    const [candidates, liasQueue] = await Promise.all([
      listFloridaClassDCompletionCandidates(),
      listFloridaClassDLiasQueue(),
    ]);
    return response({ candidates, liasQueue });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireFloridaClassDStaff(["compliance_admin"]);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || body.action !== "approve_completion") {
      return response({ error: "Unsupported completion administrative action." }, 400);
    }
    const result = await approveFloridaClassDCompletion(staff.userId, {
      enrollmentId: String(body.enrollmentId ?? ""),
      reviewNote: String(body.reviewNote ?? ""),
      correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
    });
    return response({ result }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
