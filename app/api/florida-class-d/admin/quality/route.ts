import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import {
  listFloridaClassDQualityCases,
  listFloridaClassDRetentionReviews,
  openFloridaClassDQualityCase,
  progressFloridaClassDQualityCase,
  recordFloridaClassDRetentionReview,
} from "../../../../../lib/florida-class-d-quality";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers });
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDExamError) return json({ error: error.message, code: error.code }, error.status);
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return json({ error: error.message }, (error as { status: number }).status);
  }
  console.error("Florida Class D quality API failed", error);
  return json({ error: "Quality-management operation failed." }, 500);
}

export async function GET() {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const [cases, retentionReviews] = await Promise.all([
      listFloridaClassDQualityCases(),
      listFloridaClassDRetentionReviews(),
    ]);
    return json({ cases, retentionReviews });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "open_case") {
      return json(await openFloridaClassDQualityCase(actor.userId, {
        caseType: String(body.caseType || "quality_finding") as Parameters<typeof openFloridaClassDQualityCase>[1]["caseType"],
        severity: String(body.severity || "medium") as Parameters<typeof openFloridaClassDQualityCase>[1]["severity"],
        enrollmentId: typeof body.enrollmentId === "string" ? body.enrollmentId : null,
        cohortId: typeof body.cohortId === "string" ? body.cohortId : null,
        title: String(body.title || ""),
        description: String(body.description || ""),
        assignedToUserId: typeof body.assignedToUserId === "string" ? body.assignedToUserId : null,
        dueAt: typeof body.dueAt === "string" ? body.dueAt : null,
      }), 201);
    }

    if (action === "progress_case") {
      return json(await progressFloridaClassDQualityCase(actor.userId, {
        caseId: String(body.caseId || ""),
        status: String(body.status || "investigating") as Parameters<typeof progressFloridaClassDQualityCase>[1]["status"],
        rootCause: typeof body.rootCause === "string" ? body.rootCause : null,
        correctiveAction: typeof body.correctiveAction === "string" ? body.correctiveAction : null,
        preventiveAction: typeof body.preventiveAction === "string" ? body.preventiveAction : null,
        eventNote: typeof body.eventNote === "string" ? body.eventNote : null,
      }));
    }

    if (action === "retention_review") {
      return json(await recordFloridaClassDRetentionReview(actor.userId, {
        enrollmentId: String(body.enrollmentId || ""),
        completionRecordId: String(body.completionRecordId || ""),
        completionDate: String(body.completionDate || ""),
        legalHoldActive: body.legalHoldActive === true,
        reviewNote: typeof body.reviewNote === "string" ? body.reviewNote : null,
      }));
    }

    return json({ error: "Unsupported quality-management action." }, 400);
  } catch (error) {
    return errorResponse(error);
  }
}
