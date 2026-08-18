import { NextResponse } from "next/server";
import {
  FloridaClassDOwnerTestAuthorizationError,
  requireFloridaClassDOwnerTestPrincipal,
} from "../../../../../lib/florida-class-d-owner-test-session";
import {
  createFloridaClassDOwnerCoursewareUpload,
  createFloridaClassDOwnerCoursewareView,
  deleteFloridaClassDOwnerCourseware,
  finalizeFloridaClassDOwnerCourseware,
  FloridaClassDOwnerCoursewareError,
  listFloridaClassDOwnerCourseware,
} from "../../../../../lib/florida-class-d-owner-preview-courseware";

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
  if (error instanceof FloridaClassDOwnerTestAuthorizationError || error instanceof FloridaClassDOwnerCoursewareError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers },
    );
  }
  console.error(
    "Florida Class D owner-validation courseware action failed",
    error instanceof Error ? error.name : "unknown_error",
  );
  return NextResponse.json(
    { error: "The protected owner courseware action could not be completed.", code: "FDACS_OWNER_TEST_COURSEWARE_FAILED" },
    { status: 503, headers },
  );
}

export async function GET() {
  try {
    const actor = await requireFloridaClassDOwnerTestPrincipal();
    const courseware = await listFloridaClassDOwnerCourseware(actor.releaseCommitSha);
    return NextResponse.json({
      courseware,
      exactReleaseBound: true,
      ownerOnly: true,
      trainingCreditEligible: false,
      regulatedDatabaseWritesAuthorized: false,
    }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDOwnerTestPrincipal();
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const action = body?.action;

    if (action === "create-upload") {
      if (typeof body?.fileName !== "string" || typeof body.contentType !== "string" || typeof body.sizeBytes !== "number") {
        return NextResponse.json(
          { error: "Complete courseware file metadata is required.", code: "FDACS_OWNER_TEST_COURSEWARE_METADATA_REQUIRED" },
          { status: 400, headers },
        );
      }
      const ticket = await createFloridaClassDOwnerCoursewareUpload({
        releaseSha: actor.releaseCommitSha,
        fileName: body.fileName,
        contentType: body.contentType,
        sizeBytes: body.sizeBytes,
      });
      return NextResponse.json({
        ...ticket,
        ownerOnly: true,
        trainingCreditEligible: false,
        regulatedDatabaseWritesAuthorized: false,
      }, { headers });
    }

    if (action === "finalize" && typeof body?.objectPath === "string") {
      const courseware = await finalizeFloridaClassDOwnerCourseware({
        releaseSha: actor.releaseCommitSha,
        objectPath: body.objectPath,
      });
      return NextResponse.json({
        courseware,
        ownerOnly: true,
        trainingCreditEligible: false,
        regulatedDatabaseWritesAuthorized: false,
      }, { headers });
    }

    if (action === "create-view" && typeof body?.objectPath === "string") {
      const view = await createFloridaClassDOwnerCoursewareView({
        releaseSha: actor.releaseCommitSha,
        objectPath: body.objectPath,
      });
      return NextResponse.json({
        ...view,
        ownerOnly: true,
        trainingCreditEligible: false,
        regulatedDatabaseWritesAuthorized: false,
      }, { headers });
    }

    return NextResponse.json(
      { error: "Unsupported owner courseware action.", code: "FDACS_OWNER_TEST_COURSEWARE_ACTION_INVALID" },
      { status: 400, headers },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requireFloridaClassDOwnerTestPrincipal();
    const body = await request.json().catch(() => null) as { objectPath?: unknown } | null;
    if (!body || typeof body.objectPath !== "string") {
      return NextResponse.json(
        { error: "A protected courseware object path is required.", code: "FDACS_OWNER_TEST_COURSEWARE_PATH_REQUIRED" },
        { status: 400, headers },
      );
    }
    const result = await deleteFloridaClassDOwnerCourseware({
      releaseSha: actor.releaseCommitSha,
      objectPath: body.objectPath,
    });
    return NextResponse.json({
      ...result,
      ownerOnly: true,
      trainingCreditEligible: false,
      regulatedDatabaseWritesAuthorized: false,
    }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
