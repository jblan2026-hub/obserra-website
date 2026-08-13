import { NextResponse } from "next/server";
import { requireFloridaClassDStaff, FloridaClassDAuthorizationError } from "../../../../../lib/florida-class-d-auth";
import {
  createFloridaClassDAcceptanceRun,
  finalizeFloridaClassDAcceptanceRun,
  listFloridaClassDAcceptanceChecks,
  listFloridaClassDAcceptanceRuns,
  recordFloridaClassDAcceptanceCheck,
  type FloridaClassDAcceptanceDomain,
  type FloridaClassDAcceptanceRun,
  type FloridaClassDAcceptanceStatus,
} from "../../../../../lib/florida-class-d-acceptance";
import { FloridaClassDExamError } from "../../../../../lib/florida-class-d-exam";

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof FloridaClassDExamError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  return NextResponse.json({ error: "Acceptance evidence request failed." }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const runId = new URL(request.url).searchParams.get("runId")?.trim();
    return runId
      ? NextResponse.json({ checks: await listFloridaClassDAcceptanceChecks(runId) })
      : NextResponse.json({ runs: await listFloridaClassDAcceptanceRuns() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "create_run") {
      const run = await createFloridaClassDAcceptanceRun({
        environmentType: body.environmentType as FloridaClassDAcceptanceRun["environment_type"],
        releaseCommitSha: typeof body.releaseCommitSha === "string" ? body.releaseCommitSha : "",
        testIdentityReference: typeof body.testIdentityReference === "string" ? body.testIdentityReference : "",
        actorUserId: actor.userId,
      });
      return NextResponse.json({ run }, { status: 201 });
    }

    if (action === "record_check") {
      await recordFloridaClassDAcceptanceCheck({
        runId: typeof body.runId === "string" ? body.runId : "",
        domain: body.domain as FloridaClassDAcceptanceDomain,
        status: body.status as FloridaClassDAcceptanceStatus,
        evidenceReference: typeof body.evidenceReference === "string" ? body.evidenceReference : undefined,
        operatorNote: typeof body.operatorNote === "string" ? body.operatorNote : undefined,
        actorUserId: actor.userId,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "finalize_run") {
      const result = await finalizeFloridaClassDAcceptanceRun({
        runId: typeof body.runId === "string" ? body.runId : "",
        summary: typeof body.summary === "string" ? body.summary : undefined,
        actorUserId: actor.userId,
      });
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Unsupported acceptance action." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
