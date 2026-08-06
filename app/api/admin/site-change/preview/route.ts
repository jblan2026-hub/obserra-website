import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ownerEmailAllowed } from "../../../../../lib/academy";
import type { OwnerSiteChangePlan } from "../../../../../lib/owner-ai-site-changes";
import { createOwnerAiPreview } from "../../../../../lib/owner-site-publishing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!ownerEmailAllowed(emails)) return NextResponse.json({ error: "Owner access required" }, { status: 404 });

  const body = (await request.json()) as { plan?: OwnerSiteChangePlan };
  if (!body.plan || body.plan.requiresOwnerApproval !== true || !Array.isArray(body.plan.operations)) {
    return NextResponse.json({ error: "A reviewed AI change plan is required" }, { status: 400 });
  }

  try {
    const result = await createOwnerAiPreview(body.plan, emails[0] ?? userId);
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create website preview" },
      { status: 400 },
    );
  }
}
