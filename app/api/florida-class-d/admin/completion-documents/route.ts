import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import { uploadOfficialFdacs16103 } from "../../../../../lib/florida-class-d-completion-documents";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";
import { floridaClassDRegulatedExecutionAuthorized } from "../../../../../lib/florida-class-d-production-activation";

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
  return response({ error: "Completion document administration failed." }, 500);
}

export async function POST(request: NextRequest) {
  try {
    if (!floridaClassDRegulatedExecutionAuthorized()) {
      return response(
        { error: "Florida Class D regulated completion-document execution is not authorized in this environment.", code: "FDACS_REGULATED_EXECUTION_NOT_AUTHORIZED" },
        503,
      );
    }
    const staff = await requireFloridaClassDStaff(["compliance_admin"]);
    const form = await request.formData();
    const completionRecordId = String(form.get("completionRecordId") ?? "");
    const externalReference = String(form.get("externalReference") ?? "");
    const correlationIdValue = form.get("correlationId");
    const file = form.get("file");
    if (!(file instanceof File)) return response({ error: "FDACS-16103 PDF is required." }, 400);
    if (file.type && file.type !== "application/pdf") return response({ error: "FDACS-16103 upload must be a PDF." }, 400);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await uploadOfficialFdacs16103(staff.userId, {
      completionRecordId,
      externalReference,
      pdfBytes: bytes,
      correlationId: typeof correlationIdValue === "string" && correlationIdValue ? correlationIdValue : undefined,
    });
    return response({ result }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
