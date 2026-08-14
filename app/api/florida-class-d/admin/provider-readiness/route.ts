import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import { getFloridaClassDProviderReadiness } from "../../../../../lib/florida-class-d-provider-readiness";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export async function GET() {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const report = await getFloridaClassDProviderReadiness();
    return NextResponse.json(report, { status: report.ready ? 200 : 503, headers });
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) {
      return NextResponse.json(
        { error: error.message, code: "FDACS_PROVIDER_READINESS_AUTHORIZATION_FAILED" },
        { status: error.status, headers },
      );
    }
    return NextResponse.json(
      { error: "Protected FDACS provider readiness could not be evaluated.", code: "FDACS_PROVIDER_READINESS_FAILED" },
      { status: 500, headers },
    );
  }
}
