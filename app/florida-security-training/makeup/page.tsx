import { notFound } from "next/navigation";
import { requireFloridaClassDPageUser } from "../../../lib/florida-class-d-page-auth";
import { evaluateFloridaClassDStudentAccess } from "../../../lib/florida-class-d-student-access";
import MakeupPortal from "./MakeupPortal";
import "../live-classroom.css";
import "./makeup.css";

export default async function FloridaClassDMakeupPage() {
  const { userId } = await requireFloridaClassDPageUser("/florida-security-training/makeup");
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();
  return <MakeupPortal />;
}
