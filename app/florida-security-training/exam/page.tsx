import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FloridaClassDExam from "./FloridaClassDExam";
import "../live-classroom.css";
import "./exam.css";

export default async function FloridaClassDExamPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/exam")}`);
  return <FloridaClassDExam />;
}
