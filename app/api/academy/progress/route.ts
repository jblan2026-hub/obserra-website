import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { markLessonComplete } from "../../../../lib/academy";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json() as { courseId?: string; lessonIndex?: number };
  if (typeof body.courseId !== "string" || typeof body.lessonIndex !== "number" || !Number.isInteger(body.lessonIndex)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    return NextResponse.json({ progress: await markLessonComplete(userId, body.courseId, body.lessonIndex) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save progress" }, { status: 400 });
  }
}
