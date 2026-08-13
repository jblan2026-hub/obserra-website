import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import {
  authorizeFloridaClassDExamRetest,
  listFloridaClassDExamRetestAuthorizations,
  listFloridaClassDExamRetestCases,
  revokeFloridaClassDExamRetest,
} from "../../../../../lib/florida-class-d-exam-retest";

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
  return response({ error: "Exam retest administration failed." }, 500);
}

export async function GET(request: NextRequest) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollmentId = request.nextUrl.searchParams.get("enrollmentId") ?? undefined;
    const [failedAttempts, authorizations] = await Promise.all([
      listFloridaClassDExamRetestCases(),
      listFloridaClassDExamRetestAuthorizations(enrollmentId),
    ]);
    return response({ failedAttempts, authorizations });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body.action !== "string") return response({ error: "Invalid retest administrative request." }, 400);

    if (body.action === "authorize") {
      const result = await authorizeFloridaClassDExamRetest(staff.userId, {
        enrollmentId: String(body.enrollmentId ?? ""),
        failedAttemptId: String(body.failedAttemptId ?? ""),
        remediationSummary: String(body.remediationSummary ?? ""),
        authorizationNote: String(body.authorizationNote ?? ""),
        correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      });
      return response({ result }, 201);
    }

    if (body.action === "revoke") {
      const result = await revokeFloridaClassDExamRetest(staff.userId, {
        authorizationId: String(body.authorizationId ?? ""),
        reason: String(body.reason ?? ""),
        correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      });
      return response({ result });
    }

    return response({ error: "Unsupported retest administrative action." }, 400);
  } catch (error) {
    return errorResponse(error);
  }
}
