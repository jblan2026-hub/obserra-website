import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ownerEmailAllowed } from "../../../../../../lib/academy";
import { buildControlRoomSnapshot } from "../../../../../../lib/control-room-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!user || !ownerEmailAllowed(emails)) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  const startedAt = Date.now();
  try {
    const snapshot = await buildControlRoomSnapshot();
    console.log(JSON.stringify({
      level: snapshot.status === "healthy" ? "info" : "warn",
      event: "control_room_live_snapshot",
      durationMs: Date.now() - startedAt,
      ...snapshot,
    }));
    return NextResponse.json(snapshot, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      event: "control_room_live_snapshot_failed",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    }));
    return NextResponse.json({ error: "Unable to load live operations" }, { status: 500 });
  }
}
