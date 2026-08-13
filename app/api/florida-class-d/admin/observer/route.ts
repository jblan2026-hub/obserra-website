import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import {
  createFloridaClassDObserverGrant,
  FloridaClassDObserverAccessError,
  revokeFloridaClassDObserverGrant,
} from "../../../../../lib/florida-class-d-observer";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

type Body = {
  action?: unknown;
  liveSessionId?: unknown;
  observerLabel?: unknown;
  purpose?: unknown;
  durationMinutes?: unknown;
  grantId?: unknown;
  correlationId?: unknown;
};

function errorResponse(error: unknown) {
  if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDObserverAccessError) {
    return NextResponse.json(
      { error: error.message, code: "code" in error ? error.code : "FDACS_OBSERVER_AUTHORIZATION_FAILED" },
      { status: error.status, headers },
    );
  }
  console.error("Florida Class D observer administration failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json(
    { error: "Unable to process observer access administration.", code: "FDACS_OBSERVER_ADMIN_REQUEST_FAILED" },
    { status: 500, headers },
  );
}

export async function POST(request: Request) {
  try {
    const actor = await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
    const body = await request.json().catch(() => null) as Body | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid observer administration request.", code: "FDACS_OBSERVER_INVALID_REQUEST" }, { status: 400, headers });
    }
    const correlationId = typeof body.correlationId === "string" ? body.correlationId : crypto.randomUUID();

    if (body.action === "create") {
      if (
        typeof body.liveSessionId !== "string" ||
        typeof body.observerLabel !== "string" ||
        typeof body.purpose !== "string" ||
        !Number.isInteger(body.durationMinutes)
      ) {
        return NextResponse.json({ error: "Observer grant fields are incomplete.", code: "FDACS_OBSERVER_CREATE_INVALID" }, { status: 400, headers });
      }
      const grant = await createFloridaClassDObserverGrant(actor, {
        liveSessionId: body.liveSessionId,
        observerLabel: body.observerLabel,
        purpose: body.purpose,
        durationMinutes: body.durationMinutes as number,
        correlationId,
      });
      return NextResponse.json({
        grantId: grant.grantId,
        expiresAt: grant.expiresAt,
        observerLabel: grant.observerLabel,
        purpose: grant.purpose,
        observerPath: `/florida-security-training/observer#access=${grant.accessToken}`,
        accessToken: grant.accessToken,
        oneTimeDisplay: true,
      }, { status: 201, headers });
    }

    if (body.action === "revoke") {
      if (typeof body.grantId !== "string") {
        return NextResponse.json({ error: "Observer grant id is required.", code: "FDACS_OBSERVER_REVOKE_INVALID" }, { status: 400, headers });
      }
      const result = await revokeFloridaClassDObserverGrant(actor, { grantId: body.grantId, correlationId });
      return NextResponse.json({ ...result, correlationId }, { headers });
    }

    return NextResponse.json({ error: "Unsupported observer administration action.", code: "FDACS_OBSERVER_ACTION_UNSUPPORTED" }, { status: 400, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
