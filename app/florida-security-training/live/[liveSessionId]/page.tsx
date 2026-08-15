import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { evaluateFloridaClassDStudentAccess } from "../../../../lib/florida-class-d-student-access";
import LiveClassroom from "./LiveClassroom";
import "../../live-classroom.css";

export default async function FloridaClassDLivePage({ params }: { params: Promise<{ liveSessionId: string }> }) {
  const { liveSessionId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/florida-security-training/live/${liveSessionId}`)}`);
  }
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();
  return <LiveClassroom liveSessionId={liveSessionId} />;
}
