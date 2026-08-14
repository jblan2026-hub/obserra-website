import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorLiveConsole from "./InstructorLiveConsole";
import "../../../live-classroom.css";

export default async function FloridaClassDInstructorLivePage({ params }: { params: Promise<{ liveSessionId: string }> }) {
  const { liveSessionId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/florida-security-training/admin/live/${liveSessionId}`)}`);
  }
  return <InstructorLiveConsole liveSessionId={liveSessionId} />;
}
