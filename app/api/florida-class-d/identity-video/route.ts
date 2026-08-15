import { NextResponse } from "next/server";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDSignedInUser,
} from "../../../../lib/florida-class-d-auth";
import {
  FloridaClassDMediaError,
  getFloridaClassDIdentityLobbyMediaAccess,
} from "../../../../lib/florida-class-d-media";

const headers = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  pragma: "no-cache",
  expires: "0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

export async function GET() {
  try {
    const { userId } = await requireFloridaClassDSignedInUser();
    const access = await getFloridaClassDIdentityLobbyMediaAccess(userId);
    return NextResponse.json(access, { headers });
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError || error instanceof FloridaClassDMediaError) {
      return NextResponse.json(
        { error: error.message, code: "code" in error ? error.code : "FDACS_IDENTITY_LOBBY_AUTHORIZATION_FAILED" },
        { status: error.status, headers },
      );
    }
    console.error("Florida Class D identity video lobby failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json(
      { error: "The protected identity video lobby is unavailable.", code: "FDACS_IDENTITY_LOBBY_FAILED" },
      { status: 500, headers },
    );
  }
}
