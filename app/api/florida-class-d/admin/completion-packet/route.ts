import { NextRequest, NextResponse } from "next/server";
import { requireFloridaClassDStaff } from "../../../../../lib/florida-class-d-auth";
import {
  getFloridaClassDCompletionPacket,
  renderFloridaClassDCompletionPacketHtml,
} from "../../../../../lib/florida-class-d-completion-packet";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";

export const dynamic = "force-dynamic";

const secureHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDExamError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers: secureHeaders });
  }
  if (error instanceof Error && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return NextResponse.json({ error: error.message }, { status: (error as { status: number }).status, headers: secureHeaders });
  }
  console.error("Florida Class D completion packet API failed", error);
  return NextResponse.json({ error: "Unable to produce the protected completion packet." }, { status: 500, headers: secureHeaders });
}

export async function GET(request: NextRequest) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const enrollmentId = request.nextUrl.searchParams.get("enrollmentId") || "";
    const format = request.nextUrl.searchParams.get("format") === "html" ? "html" : "json";
    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment id is required.", code: "FDACS_COMPLETION_PACKET_ENROLLMENT_REQUIRED" }, { status: 400, headers: secureHeaders });
    }

    const packet = await getFloridaClassDCompletionPacket(enrollmentId);
    if (format === "html") {
      const html = renderFloridaClassDCompletionPacketHtml(packet);
      return new NextResponse(html, {
        status: 200,
        headers: {
          ...secureHeaders,
          "content-type": "text/html; charset=utf-8",
          "content-disposition": `inline; filename="Florida-Class-D-Completion-Packet-${enrollmentId}.html"`,
        },
      });
    }

    return NextResponse.json(packet, {
      status: 200,
      headers: {
        ...secureHeaders,
        "content-disposition": `attachment; filename="Florida-Class-D-Completion-Packet-${enrollmentId}.json"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
