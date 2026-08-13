import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireFloridaClassDStaff } from "@/lib/florida-class-d-auth";
import { FloridaClassDExamError } from "@/lib/florida-class-d-exam";
import {
  importFloridaClassDExamBank,
  listFloridaClassDExamBanks,
  markFloridaClassDExamBankApproved,
  markFloridaClassDExamBankSubmitted,
} from "@/lib/florida-class-d-exam-admin";

export const dynamic = "force-dynamic";

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      pragma: "no-cache",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDExamError) return response({ error: error.message, code: error.code }, error.status);
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return response({ error: error.message }, (error as { status: number }).status);
  }
  return response({ error: "Exam bank administration failed." }, 500);
}

export async function GET() {
  try {
    await requireFloridaClassDStaff(["compliance_admin", "school_admin"]);
    const banks = await listFloridaClassDExamBanks();
    return response({ banks });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireFloridaClassDStaff(["compliance_admin"]);
    const body = await request.json() as Record<string, unknown>;
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : randomUUID();

    if (body.action === "import") {
      const result = await importFloridaClassDExamBank(staff.userId, {
        version: String(body.version ?? ""),
        sourceReference: String(body.sourceReference ?? ""),
        questions: Array.isArray(body.questions) ? body.questions as never[] : [],
      }, correlationId);
      return response({ result }, 201);
    }

    if (body.action === "mark_submitted") {
      const result = await markFloridaClassDExamBankSubmitted(staff.userId, String(body.bankId ?? ""), String(body.submissionReference ?? ""), correlationId);
      return response({ result });
    }

    if (body.action === "mark_approved") {
      const result = await markFloridaClassDExamBankApproved(staff.userId, String(body.bankId ?? ""), String(body.approvalReference ?? ""), correlationId);
      return response({ result });
    }

    return response({ error: "Unsupported exam bank administrative action." }, 400);
  } catch (error) {
    return errorResponse(error);
  }
}
