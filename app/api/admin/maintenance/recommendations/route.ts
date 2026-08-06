import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ownerEmailAllowed } from "../../../../../lib/academy";
import { buildMaintenanceSnapshot } from "../../../../../lib/owner-maintenance-advisor";

export async function GET() {
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!user || !ownerEmailAllowed(emails)) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  try {
    const snapshot = await buildMaintenanceSnapshot("main");
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to build maintenance recommendations" },
      { status: 500 },
    );
  }
}
