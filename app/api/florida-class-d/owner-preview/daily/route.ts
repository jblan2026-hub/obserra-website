import { NextResponse } from "next/server";
import {
  FloridaClassDOwnerPreviewAuthorizationError,
  requireFloridaClassDOwnerPreviewPrincipal,
} from "../../../../../lib/florida-class-d-owner-preview-auth";
import {
  cleanupFloridaClassDOwnerPreviewDailyRoom,
  provisionFloridaClassDOwnerPreviewDailySession,
} from "../../../../../lib/florida-class-d-owner-preview-daily-server";

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

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDOwnerPreviewAuthorizationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers },
    );
  }
  console.error(
    "Florida Class D owner-preview Daily diagnostic failed",
    error instanceof Error ? error.name : "unknown_error",
  );
  return NextResponse.json(
    {
      error: "The private Daily diagnostic could not be completed.",
      code: "FDACS_OWNER_PREVIEW_DAILY_FAILED",
    },
    { status: 502, headers },
  );
}

export async function POST() {
  try {
    const actor = await requireFloridaClassDOwnerPreviewPrincipal();
    const access = await provisionFloridaClassDOwnerPreviewDailySession(actor.releaseCommitSha);
    return NextResponse.json(
      {
        ...access,
        accessMode: "internal_owner_real_provider_noncredit",
        attendanceCredited: false,
        instructionalTimeCredited: false,
        trainingCreditEligible: false,
        completionAuthorized: false,
        certificateAuthorized: false,
        liasAuthorized: false,
      },
      { headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requireFloridaClassDOwnerPreviewPrincipal();
    const body = await request.json().catch(() => null) as { roomName?: unknown } | null;
    if (!body || typeof body.roomName !== "string") {
      return NextResponse.json(
        { error: "An owner-preview Daily room name is required.", code: "FDACS_OWNER_PREVIEW_ROOM_REQUIRED" },
        { status: 400, headers },
      );
    }
    const result = await cleanupFloridaClassDOwnerPreviewDailyRoom(
      body.roomName,
      actor.releaseCommitSha,
    );
    return NextResponse.json(
      {
        ...result,
        attendanceCredited: false,
        instructionalTimeCredited: false,
        trainingCreditEligible: false,
      },
      { headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
