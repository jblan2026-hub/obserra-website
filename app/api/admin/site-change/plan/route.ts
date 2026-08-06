import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ownerEmailAllowed } from "../../../../../lib/academy";
import { planOwnerSiteChange } from "../../../../../lib/owner-ai-site-changes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!ownerEmailAllowed(emails)) return NextResponse.json({ error: "Owner access required" }, { status: 404 });

  const body = (await request.json()) as { instruction?: string; context?: string };
  if (typeof body.instruction !== "string") {
    return NextResponse.json({ error: "A website change instruction is required" }, { status: 400 });
  }

  try {
    const plan = await planOwnerSiteChange(body.instruction, body.context);
    return NextResponse.json({ plan, productionChanged: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create website change plan" },
      { status: 400 },
    );
  }
}
