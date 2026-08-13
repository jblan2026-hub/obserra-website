import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDSignedInUser } from "../../../../lib/florida-class-d-auth";
import {
  downloadStudentCompletionDocument,
  listCompletionDocumentsForStudent,
} from "../../../../lib/florida-class-d-completion-documents";
import { FloridaClassDExamError } from "../../../../lib/florida-class-d-exam";

export const dynamic = "force-dynamic";

const secureHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: secureHeaders });
}

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDExamError) return json({ error: error.message, code: error.code }, error.status);
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return json({ error: error.message }, (error as { status: number }).status);
  }
  return json({ error: "Completion documents request failed." }, 500);
}

function presentation(documentType: string) {
  if (documentType === "fdacs_16103") {
    return { filename: "FDACS-16103-Certificate-of-Security-Officer-Training.pdf", disposition: "attachment" as const };
  }
  if (documentType === "obserra_course_completion") {
    return { filename: "Obserra-Florida-Class-D-Course-Completion-Certificate.html", disposition: "inline" as const };
  }
  return { filename: "Obserra-Florida-Class-D-Application-Instructions.html", disposition: "inline" as const };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireFloridaClassDSignedInUser();
    const documentId = request.nextUrl.searchParams.get("documentId");
    if (!documentId) return json({ documents: await listCompletionDocumentsForStudent(user.userId) });

    const result = await downloadStudentCompletionDocument(user.userId, documentId);
    const output = presentation(result.document.document_type);
    const body = new Blob([Uint8Array.from(result.bytes)], { type: result.contentType });
    return new NextResponse(body, {
      status: 200,
      headers: {
        ...secureHeaders,
        "content-type": result.contentType,
        "content-disposition": `${output.disposition}; filename="${output.filename}"`,
        "content-length": String(result.bytes.byteLength),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
