import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { evaluateFloridaClassDStudentAccess } from "../../../lib/florida-class-d-student-access";
import MakeupPortal from "./MakeupPortal";
import "../live-classroom.css";
import "./makeup.css";

export default async function FloridaClassDMakeupPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/makeup")}`);
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) redirect(access.reason === "identity_required" ? "/florida-security-training/identity" : `/florida-security-training/access?status=${access.reason}`);
  return <MakeupPortal />;
}
