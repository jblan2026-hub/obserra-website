import { NextResponse } from "next/server";
import {
  FloridaClassDOwnerPreviewAuthorizationError,
  requireFloridaClassDOwnerPreviewPrincipal,
} from "../../../../../lib/florida-class-d-owner-preview-auth";
import { requestOwnerActivationAudit } from "../../../../../lib/auth/authority-repository";
import { FloridaClassDLicenseFormatError } from "../../../../../lib/florida-class-d-license-activation-request";
import {
  FloridaClassDLicenseVerificationProviderUnavailableError,
  requestFloridaClassDControlledActivation,
} from "../../../../../lib/florida-class-d-license-activation-request-server";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
  "referrer-policy": "no-referrer",
};

function safeBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.schoolLicenseNumber !== "string"
    || typeof body.instructorLicenseNumber !== "string"
    || body.schoolLicenseNumber.length > 40
    || body.instructorLicenseNumber.length > 40
  ) return null;
  return {
    schoolLicenseNumber: body.schoolLicenseNumber,
    instructorLicenseNumber: body.instructorLicenseNumber,
  };
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDOwnerPreviewPrincipal();
    const body = safeBody(await request.json().catch(() => null));
    if (!body) {
      return NextResponse.json(
        { error: "Valid Class DS and Class DI license values are required.", code: "FDACS_LICENSE_REQUEST_INVALID" },
        { status: 400, headers },
      );
    }
    const audit = await requestOwnerActivationAudit();
    if (!audit.accepted) {
      return NextResponse.json(
        {
          error: "Protected activation-request audit authority is unavailable.",
          code: "FDACS_ACTIVATION_AUDIT_NOT_ACCEPTED",
          correlationId: audit.correlationId,
          activationPerformed: false,
          productionRuntimeAuthorized: false,
          studentFrontendEnabled: false,
          studentBackendEnabled: false,
          liasReportingPreflightEnabled: false,
          fdacsReportingPreflightEnabled: false,
        },
        { status: 503, headers },
      );
    }
    const result = await requestFloridaClassDControlledActivation({
      ...body,
      releaseCommitSha: actor.releaseCommitSha,
    });
    const providerUnavailable = result.blockingKeys.some((key) => key.startsWith("license_verification_provider:"));
    return NextResponse.json(
      {
        ...result,
        correlationId: audit.correlationId,
        activationPerformed: false,
        productionRuntimeAuthorized: false,
        studentFrontendEnabled: false,
        studentBackendEnabled: false,
        liasReportingPreflightEnabled: false,
        fdacsReportingPreflightEnabled: false,
      },
      { status: providerUnavailable ? 503 : result.status === "denied" ? 409 : 200, headers: providerUnavailable ? { ...headers, "retry-after": "86400" } : headers },
    );
  } catch (error) {
    if (error instanceof FloridaClassDOwnerPreviewAuthorizationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers });
    }
    if (error instanceof FloridaClassDLicenseFormatError) {
      return NextResponse.json(
        { error: error.message, code: "FDACS_LICENSE_FORMAT_INVALID", activationPerformed: false },
        { status: 400, headers },
      );
    }
    if (error instanceof FloridaClassDLicenseVerificationProviderUnavailableError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          status: "denied",
          activationPerformed: false,
          productionRuntimeAuthorized: false,
          studentFrontendEnabled: false,
          studentBackendEnabled: false,
          liasReportingPreflightEnabled: false,
          fdacsReportingPreflightEnabled: false,
        },
        { status: 503, headers: { ...headers, "retry-after": "86400" } },
      );
    }
    console.error("Florida Class D activation request evaluation failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json(
      { error: "Activation request evaluation failed closed.", code: "FDACS_ACTIVATION_REQUEST_FAILED", activationPerformed: false },
      { status: 500, headers },
    );
  }
}
