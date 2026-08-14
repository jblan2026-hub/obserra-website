import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import {
  authorizeFloridaClassDExamResume,
  invalidateFloridaClassDExamAttempt,
  listFloridaClassDActiveExamAttempts,
} from "../../../../../lib/florida-class-d-exam-monitoring";

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
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") return response({ error: error.message }, (error as { status: number }).status);
  return response({ error: "Exam monitoring administration failed." }, 500);
}

export async function GET() {
  try {
    await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
    return response({ attempts: await listFloridaClassDActiveExamAttempts() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const staff = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body.action !== "string" || typeof body.attemptId !== "string" || typeof body.reason !== "string") {
      return response({ error: "Exam monitoring administrative fields are incomplete." }, 400);
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : randomUUID();
    if (body.action === "authorize_resume") {
      return response({ result: await authorizeFloridaClassDExamResume(staff.userId, { attemptId: body.attemptId, reason: body.reason, correlationId }) });
    }
    if (body.action === "invalidate") {
      return response({ result: await invalidateFloridaClassDExamAttempt(staff.userId, { attemptId: body.attemptId, reason: body.reason, correlationId }) });
    }
    return response({ error: "Unsupported exam monitoring administrative action." }, 400);
  } catch (error) {
    return errorResponse(error);
  }
}
