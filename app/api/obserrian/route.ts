import { NextResponse } from "next/server";
import { answerObserrian } from "../../../lib/obserrian-agent";
import { recordObserrianInteraction } from "../../../lib/obserrian-review";

export async function POST(request: Request) {
  let body: { message?: string; pathname?: string; conversation?: Array<{ role: "user" | "assistant"; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const message = body.message?.trim();
  const pathname = body.pathname?.trim() || "/";
  if (!message || message.length > 2000 || !pathname.startsWith("/")) {
    return NextResponse.json({ error: "A valid question and page path are required" }, { status: 400 });
  }

  const reply = await answerObserrian({ message, pathname, conversation: body.conversation });
  let reviewRecorded = false;
  try {
    await recordObserrianInteraction({ pathname, question: message, reply });
    reviewRecorded = true;
  } catch {
    // The visitor response must remain available if the private review ledger is temporarily unavailable.
  }
  return NextResponse.json({ ...reply, reviewRecorded });
}
