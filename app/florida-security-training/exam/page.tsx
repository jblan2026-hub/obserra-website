import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { evaluateFloridaClassDStudentAccess } from "../../../lib/florida-class-d-student-access";
import FloridaClassDExam from "./FloridaClassDExam";
import "../live-classroom.css";
import "./exam.css";

export default async function FloridaClassDExamPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/exam")}`);
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();
  return <FloridaClassDExam />;
}
