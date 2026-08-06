import { NextResponse } from "next/server";
import { buildControlRoomSnapshot } from "../../../../../lib/control-room-monitor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const snapshot = await buildControlRoomSnapshot();
  const level = snapshot.status === "healthy" ? "info" : snapshot.status === "degraded" ? "warn" : "error";
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify({
    level,
    event: "persistent_control_room_check",
    durationMs: Date.now() - startedAt,
    ...snapshot,
  }));

  return NextResponse.json(snapshot, {
    status: snapshot.status === "unhealthy" ? 503 : 200,
    headers: { "cache-control": "no-store" },
  });
}
