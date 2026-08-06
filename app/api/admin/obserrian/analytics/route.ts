import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ownerEmailAllowed } from "../../../../../../lib/academy";
import { getObserrianReviewData } from "../../../../../../lib/obserrian-review";

export async function GET() {
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!user || !ownerEmailAllowed(emails)) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  try {
    return NextResponse.json(await getObserrianReviewData());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Obserrian analytics" },
      { status: 500 },
    );
  }
}
