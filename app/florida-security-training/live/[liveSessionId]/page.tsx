import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  if (!access.allowed) {
    redirect(access.reason === "identity_required" ? "/florida-security-training/identity" : `/florida-security-training/access?status=${access.reason}`);
  }
  return <LiveClassroom liveSessionId={liveSessionId} />;
}
