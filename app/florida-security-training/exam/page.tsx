import { notFound } from "next/navigation";
import { requireFloridaClassDPageUser } from "../../../lib/florida-class-d-page-auth";
import { evaluateFloridaClassDStudentAccess } from "../../../lib/florida-class-d-student-access";
import FloridaClassDExam from "./FloridaClassDExam";
import "../live-classroom.css";
import "./exam.css";

export default async function FloridaClassDExamPage() {
  const { userId } = await requireFloridaClassDPageUser("/florida-security-training/exam");
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();
  return <FloridaClassDExam />;
}
